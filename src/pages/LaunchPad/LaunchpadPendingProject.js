/* eslint-disable react/jsx-indent */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';
import { Progress, Button, Table, Input, Tooltip, Icon, Alert } from 'antd';
import { history } from 'umi';
import styles from "./styles.less"
import LaunchChart from './launchChart';
import { getTransferData } from '@/acy-dex-swap/core/launchPad';
import { requireAllocation, getAllocationInfo, getProjectInfo, useAllocation } from '@/services/api';
import { BigNumber } from '@ethersproject/bignumber';
import ERC20ABI from '@/abis/ERC20.json';
import { binance, injected } from '@/connectors';
import { Web3Provider, JsonRpcProvider } from "@ethersproject/providers";
import './css/LaunchpadProject.css';
import project from '@/models/project';
import AllocationIcon from './components/AllocationIcon';
import * as moment from 'moment';
import context from 'react-bootstrap/esm/AccordionContext';
import { CaretDownOutlined } from '@ant-design/icons';
import VestingSchedule from './VestingSchedule';
import SocialMedia from './SocialMedia'
import telegramWIcon from '@/assets/icon_telegram_white.svg';
import etherIcon from '@/assets/icon_etherscan.svg';
import polyIcon from '@/assets/icon_polyscan.svg';
import bscIcon from '@/assets/icon_bscscan.svg';
import bscChainIcon from '@/assets/icon_bsc.svg';
import polygonIcon from '@/assets/icon_polygon.svg';
import linkedinIcon from '@/assets/icon_linkedin.svg';
import mediumIcon from '@/assets/icon_medium.svg';
import youtubeIcon from '@/assets/icon_youtube.svg';
import githubIcon from '@/assets/icon_github.svg';
import twitterWIcon from '@/assets/icon_twitter_white.svg';
import linkWIcon from '@/assets/icon_link_white.svg';
import whitepaperIcon from '@/assets/icon_file_white.svg';
import deckIcon from '@/assets/icon_ppt.svg';
import tokenEconomicsIcon from '@/assets/icon_googlesheets.svg';
import paycerBanner from '@/assets/paycer_banner.svg';
import PaycerIcon from '@/assets/icon_paycer_logo.svg';
import { findTokenWithSymbol } from '@/utils/txData';
import $ from 'jquery';
import { getContract } from "../../acy-dex-swap/utils/index.js"
import { useWeb3React } from '@web3-react/core';
import { useConnectWallet } from "@/components/ConnectWallet";
import POOLABI from "@/acy-dex-swap/abis/AcyV1Poolz.json";
import axios from 'axios';

import { useConstantLoader, LAUNCHPAD_ADDRESS, LAUNCH_RPC_URL, CHAINID, API_URL, TOKEN_LIST, MARKET_TOKEN_LIST } from "@/constants";

import { CustomError } from "@/acy-dex-swap/utils"
import { approveNew, getAllowance } from "@/acy-dex-swap/utils"

const LaunchpadProject = () => {
    // STATES
    const { account, chainId, library, activate, active } = useWeb3React();
    const { projectId } = useParams();
    const [receivedData, setReceivedData] = useState({});
    const [mainCoinLogoURI, setMainCoinLogoURI] = useState(null);
    const [walletID, setwalletID] = useState(null);

    // CONSTANTS
    const InputGroup = Input.Group;
    const logoObj = {
        "Telegram": telegramWIcon,
        "Twitter": twitterWIcon,
        "Website": linkWIcon,
        "Whitepaper": whitepaperIcon,
        "Deck": deckIcon,
        "Linkedin": linkedinIcon,
        "Medium": mediumIcon,
        "TokenEconomics": tokenEconomicsIcon,
        "Youtube": youtubeIcon,
        "Github": githubIcon,
        "Etheraddress": etherIcon,
        "Polyaddress": polyIcon,
        "Bscaddress": bscIcon
    }

    const clickToWebsite = () => {
        const newWindow = window.open(receivedData.social[0].Website, '_blank', 'noopener,noreferrer');
        if (newWindow) newWindow.opener = null;
    }

    const formatTime = timeZone => {
        return moment(timeZone)
            .local()
            .format('MM/DD/YYYY HH:mm:ss');
    };

    const convertUnixTime = unixTime => {
        const data = new Date((Number(unixTime)) * 1000)
        const res = data.toLocaleString()
        return res
    }

    // retrieve data from db
    useEffect(async () => {

        let result = await axios.get(`http://localhost:3001/bsc-test/api/applyForm/getFormById?projectId=${projectId}`);
        setwalletID(result.data[0].walletId)
        const resultData = result.data[0].form;
        setReceivedData(resultData)
    }, [, account])

    // COMPONENTS

    const TokenLogoLabel = ({ projectID, projectname, logoURL }) => {
        const walletID_t = walletID;
        const account_t = account;
        const history = useHistory();
        //TODO: add Approve Function
        const EditApplyForm = (projectid) => {
            console.log('CLICK Edit!!!!')
            history.push(`/launchpad/applyProject/${projectid}`)
        };
        return (
            <div className="flexContainer" >
                <img
                    className="tokenLogo"
                    alt=""
                    src={logoURL}
                    loading="eager"
                    onClick={() => clickToWebsite()}
                />
                <div className="tokenInfo">
                    <span className="tokenTitle" onClick={() => clickToWebsite()}>{projectname}</span>
                    <div className="tokenLabelBar">
                        {/*receivedData.tokenLabels &&
                            receivedData.tokenLabels.map((label) => {
                                if (label === "BSC") return (
                                    <span className="tokenLabel">
                                        <img src={bscChainIcon} alt="" style={{ width: '13px', height: '13px', marginRight: '0.2rem' }} />
                                        BSC
                                    </span>
                                )
                                if (label === "Polygon") return (
                                    <span className="tokenLabel">
                                        <img src={polygonIcon} alt="" style={{ width: '15px', height: '15px', marginRight: '0.2rem' }} />
                                        Polygon
                                    </span>
                                )
                                return <span className="tokenLabel">{label}</span>
                            })
                        */}
                    </div>

                </div>
                <div className="flexContainer ApproveButton">
                    <div style={{ fontSize: 20, color: "white", fontWeight: "bold", alignSelf: "center" }}>Approve</div>
                </div>
                <div className="flexContainer EditButton">
                    <div style={{ fontSize: 20, color: "white", fontWeight: "bold", alignSelf: "center" }} onClick={() => EditApplyForm(projectID)}>Edit</div>
                </div>
            </div>

        );
    };

    const TokenProcedure = () => {
        const Procedure = () => {
            return (
                <div className="cardContent">
                    <div className="procedure">
                        <hr aria-orientation="vertical" className="verticalDivideLine" />
                        <div className="procedureNumber">1</div>
                        <div>
                            <p>Allocation</p>
                        </div>
                    </div>

                    <div className="procedure" style={{ marginTop: '24px' }}>
                        <hr
                            aria-orientation="vertical"
                            className={'verticalDivideLine_NotActive'}
                        />
                        <div className={'procedureNumber_NotActive'}>
                            2
                        </div>

                        <div>
                            <p>Sale (FCFS)</p>
                            <div>
                                <p className="shortText">From : {receivedData.start}</p>
                                <p className="shortText">To : {receivedData.ended}</p>
                            </div>
                        </div>

                    </div>

                    <div className="procedure" style={{ marginTop: '24px' }}>
                        <div className={'procedureNumber_NotActive'}>
                            3
                        </div>
                        <div>
                            <p>Vesting</p>
                        </div>
                    </div>
                </div>
            );
        };



        return (
            <div
                className="circleBorderCard"
                style={{
                    padding: 0,
                }}
            >
                <Procedure />
            </div>
        );
    };

    const ProjectDescription = () => {
        return (
            <div className="circleBorderCard cardContent">
                <div style={{ display: 'block' }}>
                    <div className='projecttitle-socials-container'>
                        <h3 className='projecttitle'>Project Description</h3>
                    </div>

                    <span className="lineSeperator" />
                    <div className="projectDescription">
                        <div className='socialmedia-container'>
                            {
                                (receivedData.websiteURL || receivedData.whitepaperLINK || receivedData.githubLINK || receivedData.telegramLINK || receivedData.twitterLINK || receivedData.linkedinLINK || receivedData.discordLINK) &&
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                    {receivedData.websiteURL &&
                                        <a href={receivedData.websiteURL} target="_blank" rel="noreferrer" style={{ width: '30%', marginRight: '1rem', alignSelf: 'center' }}>{receivedData.websiteURL}</a>
                                    }
                                    <div id='social container' className='social-container'>
                                        {receivedData.whitepaperLINK &&
                                            <SocialMedia url={logoObj["Whitepaper"]} link={receivedData.whitepaperLINK} socialText={"Whitepaper"} />
                                        }
                                        {receivedData.githubLINK &&
                                            <SocialMedia url={logoObj["Github"]} link={receivedData.githubLINK} socialText={"Github"} />
                                        }
                                        {receivedData.telegramLINK &&
                                            <SocialMedia url={logoObj["Telegram"]} link={receivedData.telegramLINK} socialText={"Telegram"} />
                                        }
                                        {receivedData.twitterLINK &&
                                            <SocialMedia url={logoObj["Twitter"]} link={receivedData.twitterLINK} socialText={"Twitter"} />
                                        }
                                        {receivedData.linkedinLINK &&
                                            <SocialMedia url={logoObj["Linkedin"]} link={receivedData.whitepaperLINK} socialText={"Linkedin"} />
                                        }
                                    </div>
                                </div>
                            }
                        </div>
                        <div style={{ padding: '2.5em 0 0 0' }}>
                            {receivedData.description && <p>{receivedData.description}</p>}
                        </div>
                    </div>
                </div>
            </div>
        );
    };


    const CardArea = () => {
        return (
            <div className="gridContainer">
                <div className="leftGrid">
                    <TokenProcedure />
                </div>
                <div className="rightGrid">
                    <ProjectDescription />
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="mainContainer">
                <TokenLogoLabel
                    projectName={receivedData.projectname}
                    tokenLogo={receivedData.logoURL}
                    projectID={projectId}
                />
                <CardArea />
            </div>
        </div>
    );
};

export default LaunchpadProject;
