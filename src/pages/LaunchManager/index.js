import React, { useState, useEffect, useRef } from 'react';
import { Input, Button } from 'antd';
import * as moment from 'moment';
import { history } from 'umi';
import { ethers } from "ethers";
import styles from './styles.less';
import "./styles.css";
import { getContract } from "../../acy-dex-swap/utils/index.js";
import ERC20ABI from "../../abis/ERC20.json";
import myAbi from "../../abis/pool.json";
import myByteCode from "./bytecode.json";
import { hstAbi, hstByteCode } from "../../abis/constants.json";
import { useWeb3React } from '@web3-react/core';
import POOLABI from "@/acy-dex-swap/abis/AcyV1Poolz.json";
import { getProjectInfo } from '@/services/api';
import { LAUNCHPAD_ADDRESS, LAUNCH_RPC_URL, CHAINID, API_URL } from "@/constants";
import { CustomError } from "@/acy-dex-swap/utils"
import { BigNumber } from '@ethersproject/bignumber';
import { ContractFactory } from 'ethers';
import { useConnectWallet } from "@/components/ConnectWallet";


// TODO:
// 1. 不要手动Connect Wallet，直接useEffect去抓
// 2. Deploy Token之后，Address直接放过来，Approve Amount直接填非常大
// 3. 所有依赖其他字段的值。都不可修改，视情况是否显示

const BSC_testnet_PoolContract_address = "0x6e0EC29eA8afaD2348C6795Afb9f82e25F196436";
// const BSC_mainnet_PoolContract_address = "";

const LaunchManager = (props) => {
  const [isYesClicked, setIsYesClicked] = useState(false);
  const [isNoClicked, setIsNoClicked] = useState(false);
  const [poolID, setPoolID] = useState(null);
  const [receivedData, setReceivedData] = useState({});
  const [approveTokenAddress, setApproveTokenAddress] = useState(null);
  const [approveAmount, setApproveAmount] = useState(0);
  const [createPoolInfo, setCreatePoolInfo] = useState({});
  const [distributionArr, setDistributionArr] = useState([]);
  const [distributionPercentArr, setDistributionPercentArr] = useState([]);

  // link to launch contract address
  const { account, chainId, library, activate, active } = useWeb3React();
  const poolContract = getContract(LAUNCHPAD_ADDRESS(), POOLABI, library, account);

  const { ethereum } = window;
  let ethersProvider;
  let ethersSigner;
  let userAddress;

  const poolKeys =
    [
      "Token",
      "MainCoin",
      "StartAmount",
      "StartTime",
      "EndTime",
      "SwapRate",
      "SwapType"
    ]

  const formatTime = timeZone => {
    return moment(timeZone)
      .local()
      .format('MM/DD/YYYY HH:mm:ss');
  };

  const connectWalletByLocalStorage = useConnectWallet();
  useEffect(() => {
    if (!account) {
      connectWalletByLocalStorage();
    }
  }, [account]);

  // const onboardButton = document.getElementById('connectButton');
  // const network = document.getElementById('network');
  // // const chainId = document.getElementById('chainId');
  // const account = document.getElementById('accounts');
  // const amount = document.getElementById('amount');

  const createPoolChange = (e) => {
    try {
      const bigIntIDs = [2, 5, 6]
      const addressIDs = [0, 1]
      const id = Number(e.target.id)
      const value = e.target.value
      const res = bigIntIDs.includes(id) ? BigInt(value) : addressIDs.includes(id) ? ethers.utils.getAddress(value) : value;
      const timeOut = setTimeout(() => {
        setCreatePoolInfo({ ...createPoolInfo, [poolKeys[id]]: res })
      }, 500)
      return () => clearTimeout(timeOut)
    } catch {
      console.log("wrong format")
    }
  };

  const onClickConnect = async () => {
    return;
    try {
      console.log("CLIck", web3)

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const chainIds = await ethereum.request({
        method: 'eth_chainId',
      })

      const networkId = await ethereum.request({
        method: 'net_version',
      })

      network.innerHTML = networkId;
      account.innerHTML = accounts;
      chainId.innerHTML = chainIds;
      userAddress = accounts;
    } catch (error) {
      console.error(error);
    }
  };

  const onClickApprove = async () => {
    let approveAdd = document.getElementById('approveAdd')
    let approveAmo = document.getElementById('approveAmo')
    console.log("approveClick", approveAdd.value, approveAmo.value)

    ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
    ethersSigner = ethersProvider.getSigner();
    console.log(ethersSigner)
    const tokenContract = new ethers.Contract(approveAdd.value, ERC20ABI, ethersSigner);
    console.log("the contract information is ", tokenContract)


    // const timer = 10**decimal*approveAmo.value;
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const decimal = await tokenContract.decimals().then((res) => {
      console.log("d is ", res, accounts)
      return res;
    })
    const amountBig = BigInt(approveAmo.value * (10 ** decimal));

    const result = await tokenContract.approve(
      BSC_testnet_PoolContract_address,
      amountBig.toString(),
      {
        gasLimit: 60000,
      },
    );
    console.log("result is ", result);

    const allowance = await tokenContract.allowance(accounts[0], BSC_testnet_PoolContract_address).catch((e) => {
      console.log("err", e, accounts);
    });;
    amount.innerHTML = allowance;
    console.log("allowance is ", allowance, await tokenContract.symbol())
  };

  const onClickDeployToken = async () => {
    // const ticketContract = await hre.ethers.getContractFactory("Greeter");
    // const ticket = await ticketContract.deploy(createContractInfo.ProjectName,
    //   createContractInfo.ProjectToken,
    //   createContractInfo.TokenDecimal,
    //   createContractInfo.TotalToken,
    // );
    // await ticket.deployed();
    // console.log("Ticket Contract deployed to:", ticket.address);
    console.log("Deploying Token", ethers)

    const _initialAmount = document.getElementById("3").value;
    const _tokenName = document.getElementById("0").value;
    const _decimalUnits = document.getElementById("2").value;
    const _tokenSymbol = document.getElementById('1').value;

    try {
      ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      ethersSigner = ethersProvider.getSigner();
      console.log("Signer", hstByteCode)
      const tokenFactory = new ContractFactory(myAbi, myByteCode, ethersSigner);
      const contract = await tokenFactory.deploy(
        _tokenName, _tokenSymbol, _decimalUnits, _initialAmount
      );
      await contract.deployTransaction.wait();
      if (contract.address === undefined) {
        return undefined;
      }

      console.log(
        `Contract mined! address: ${contract.address} transactionHash: ${contract.transactionHash}`,
      );
    }
    catch (error) {
      console.log("Deploy Failed", error);
    }
  }

  const poolDistributionChange = (e) => {
    const { value } = e.target
    const arr = value.split(',').map((items) => BigInt(items))
    const timeOut = setTimeout(() => {
      setDistributionPercentArr([...arr])
    }, 500)
    return () => clearTimeout(timeOut)
  }

  const toTimestamp = (e) => {
    const id = Number(e.target.id)
    const value = e.target.value
    try {
      const dt = BigInt(Date.parse(value) / 1000)
      setCreatePoolInfo({ ...createPoolInfo, [poolKeys[id]]: dt })
    } catch {
      console.log("wrong format")
    }
  }

  const toTimestampArr = (e) => {
    const arr = e.target.value.split(',')
    const dt = arr.map((items) => {
      const temp = Date.parse(items) / 1000
      const res = BigInt(temp)
      return res
    });
    const timeOut = setTimeout(() => {
      setDistributionArr(dt)
    }, 500)
    return () => clearTimeout(timeOut)
  }

  const createPoolClick = async () => {
    const status = await (async () => {
      const result = await poolContract.CreatePool(createPoolInfo.Token,
        createPoolInfo.MainCoin,
        createPoolInfo.StartAmount,
        createPoolInfo.StartTime,
        createPoolInfo.EndTime,
        createPoolInfo.SwapRate,
        createPoolInfo.SwapType,
      )
        .catch(e => {
          console.log(e)
          return new CustomError('CustomError while buying token');
        });
      return result;
    })();
    console.log("create pool", status)
  }

  // const contractInfoChange = (e) => {
  //   const id = Number(e.target.id)
  //   const value = e.target.value
  //   const decimalID = [2]
  //   const tokenVolumeID = [3]
  //   const res = tokenVolumeID.includes(id) ? BigInt(value) : decimalID.includes(id) ? Number(value) : value;
  //   setCreateContractInfo({ ...createContractInfo, [contractKeys[id]]: res })
  // }

  const poolDistributionClick = async () => {
    const status = await (async () => {
      const result = await poolContract.UpdatePoolDistribution(poolID, distributionArr, distributionPercentArr)
        .catch(e => {
          console.log(e)
          return new CustomError('CustomError while buying token');
        });
      return result;
    })();
    console.log("create pool", status)
  }

  return (
    <div className={styles.launchManagerRoot}>
      <h1 style={{ color: 'white' }}> Step 1: Approve token / Create ticket contract address </h1>
      <Button id='connectButton' className={styles.connectButton} onClick={onClickConnect}>ConnectMetaMask</Button>
      <section>
        <h3 style={{ color: 'white' }}>Status</h3>
        <div className="row">
          <div className="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 tx-black">
            <p className="info-text alert alert-primary">Network: <span id="network" /></p>
          </div>
          <div className="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12">
            <p className="info-text alert alert-secondary">ChainId: <span id="chainId" /></p>
          </div>
          <div className="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12">
            <p className="info-text alert alert-success">Accounts: <span id="accounts" /></p>
          </div>
          <div className="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12">
            <p className="info-text alert alert-success">ApproveAmount: <span id="amount" /></p>
          </div>
        </div>
      </section>
      <div className={styles.tokenApproval}>
        <div>
          <h3 style={{ color: 'white' }}>Step 1: Approve token</h3>
          <p style={{ margin: '1rem 0', fontWeight: '500', fontSize: '15px' }}>Deploy token address</p>
          <Input placeholder="Project Name" id="0" />
          <Input style={{ marginTop: '1rem' }} id="1" placeholder="Project Token" />
          <Input style={{ marginTop: '1rem' }} id="2" placeholder="Token Decimal" />
          <Input style={{ marginTop: '1rem' }} id="3" placeholder="Total token volume" />
          <Button id='deployButton' type="primary" style={{ marginTop: '1rem', marginLeft: '5px' }} onClick={onClickDeployToken}> Deploy </Button>
          <p style={{ margin: '1rem 0', fontWeight: '500', fontSize: '15px' }}>Approve token address</p>
          <Input id='approveAdd' placeholder="Token Address" onChange={(e) => setApproveTokenAddress(e)} />
          <Input id='approveAmo' style={{ marginTop: '1rem' }} placeholder="Approve Amount" onChange={(e) => setApproveAmount(e)} />
          <Button id='approveButton' type="primary" style={{ marginTop: '1rem', marginLeft: '5px' }} onClick={onClickApprove}> Submit </Button>
        </div>
        <h1 style={{ color: 'white', marginTop: '1rem' }}> Step 2: Create Pool </h1>
        <Input placeholder="_Token Address" id="0" onChange={createPoolChange} />
        <Input style={{ marginTop: '1rem' }} placeholder="_MainCoin Address" id="1" onChange={createPoolChange} />
        <Input style={{ marginTop: '1rem' }} placeholder="_StartAmount" id="2" onChange={createPoolChange} />
        <Input style={{ marginTop: '1rem' }} placeholder="Start Date (输入日期 - 月/日/年 小时, 分钟, 秒)" id="3" onChange={toTimestamp} />
        <Input style={{ marginTop: '1rem' }} placeholder="End Date (输入日期 - 月/日/年 小时, 分钟, 秒)" id="4" onChange={toTimestamp} />
        <Input style={{ marginTop: '1rem' }} placeholder="_SwapRate" id="5" onChange={createPoolChange} />
        <Input style={{ marginTop: '1rem' }} placeholder="_SwapType" id="6" onChange={createPoolChange} />
        <Button type="primary" style={{ marginTop: '1rem', marginLeft: '5px' }} onClick={createPoolClick}> Create </Button>
        <h1 style={{ color: 'white', marginTop: '1rem' }}> Step 3: Create Pool Distribution (Vesting) </h1>
        <Input placeholder="Pool ID" id="0" onChange={(e) => setPoolID(e.target.value)} />
        <Input style={{ marginTop: '1rem' }} placeholder="Distribution time" id="1" onChange={toTimestampArr} />
        <Input style={{ marginTop: '1rem' }} placeholder="Distribution percentage" id="2" onChange={poolDistributionChange} />
        <Button type="primary" style={{ marginTop: '1rem', marginLeft: '5px' }} onClick={poolDistributionClick}> Submit </Button>
      </div>
    </div>
  )
};

export default LaunchManager;