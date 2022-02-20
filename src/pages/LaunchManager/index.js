import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Select } from 'antd';
import * as moment from 'moment';
import Web3 from 'web3';
import { ContractFactory } from 'ethers';
import { history } from 'umi';
import { ethers } from 'ethers';
import styles from './styles.less';
import './styles.css';
import { getContract } from '../../acy-dex-swap/utils/index.js';
import ERC20ABI from '../../abis/ERC20.json';
import myAbi from '../../abis/pool.json';
import myByteCode from './bytecode.json';
import { hstByteCode } from '../../abis/constants.json';
import { useWeb3React } from '@web3-react/core';
import POOLABI from '@/acy-dex-swap/abis/AcyV1Poolz.json';
import { getProjectInfo } from '@/services/api';
import { LAUNCHPAD_ADDRESS, LAUNCH_RPC_URL, CHAINID, API_URL, TOKEN_LIST } from '@/constants';
import { CustomError } from '@/acy-dex-swap/utils';
import { useConnectWallet } from '@/components/ConnectWallet';
import project from '@/models/project';

// variables
// const BSC_testnet_PoolContract_address = '0x6e0EC29eA8afaD2348C6795Afb9f82e25F196436';
// const BSC_mainnet_PoolContract_address = '0x5868c3e82B668ee74D31331EBe9e851684c8bD99';

// testnet
const poolchart_address = '0x6e0EC29eA8afaD2348C6795Afb9f82e25F196436';
// mainnet
// const poolchart_address = '0x5868c3e82B668ee74D31331EBe9e851684c8bD99';


let ethersProvider;
let ethersSigner;

const LaunchManager = props => {
  const [projectInfo, setProjectInfo] = useState({
    TotalProject: 0,
    ProjectID: null,
    TokenDecimal: 0,
    MainCoinDecimal: null,
    TokenAddress: null,
    MainCoinAddress: null,
    resSwapRate: null,
    SwapType: null,
  });
  const [totalPool, setTotalPool] = useState(0);
  const [poolID, setPoolID] = useState(null);
  const [claimPoolID, setClaimPoolID] = useState(null);
  const [receivedData, setReceivedData] = useState({});
  const [approveTokenAddress, setApproveTokenAddress] = useState(null);
  const [approveAmount, setApproveAmount] = useState('0');
  const [distributionArr, setDistributionArr] = useState([]);
  const [distributionPercentArr, setDistributionPercentArr] = useState([]);

  // link to launch contract address
  const { account, chainId, library, activate, active } = useWeb3React();

  const formatTime = timeZone => {
    return moment(timeZone)
      .local()
      .format('MM/DD/YYYY HH:mm:ss');
  };

  const connectWalletByLocalStorage = useConnectWallet();
  useEffect(
    () => {
      if (!account) {
        connectWalletByLocalStorage();
      }
    },
    [account]
  );

  useEffect(
    async () => {
      try {
        if (projectInfo.TokenAddress !== null) {
          let web3;
          if (window.ethereum !== undefined) {
            web3 = new Web3(window.ethereum);
          }
          const tokenContract = new web3.eth.Contract(ERC20ABI, projectInfo.TokenAddress);
          const decimals = await tokenContract.methods.decimals().call();
          setProjectInfo({ ...projectInfo, TokenDecimal: Number(decimals) });
        }
      } catch {
        console.log('not valid token address');
      }
    },
    [projectInfo.TokenAddress]
  );

  const getProjectData = (projectID) => {
    if (!projectID) {
      setReceivedData({});
      return;
    }

    getProjectInfo(API_URL(), projectID)
      .then(res => {
        if (res) {
          // extract data from string
          res['projectName'] = res.basicInfo.projectName;
          res['projectToken'] = res.basicInfo.projectToken;
          res['poolID'] = res.basicInfo.poolID;

          if (res.basicInfo.poolID <= totalPool) {
            setPoolID(res.basicInfo.poolID);
          }

          res['saleStart'] = formatTime(res.scheduleInfo.saleStart);
          res['saleEnd'] = formatTime(res.scheduleInfo.saleEnd);
          res['tsSaleStart'] = BigInt(Date.parse(res['saleStart']) / 1000);
          res['tsSaleEnd'] = BigInt(Date.parse(res['saleEnd']) / 1000);

          res['tokenPrice'] = res.saleInfo.tokenPrice;
          res['totalSale'] = res.saleInfo.totalSale;
          res['totalRaise'] = res.saleInfo.totalRaise;
          res['mainCoin'] = res.basicInfo.mainCoin;

          setApproveAmount(res.saleInfo.totalSale);
          // get state to hide graph and table
          const mainCoinInfo = TOKEN_LIST().find(item => item.symbol === res.basicInfo.mainCoin);
          console.log('mainCoinInfo', mainCoinInfo);

          const checksummedAddress = Web3.utils.toChecksumAddress(mainCoinInfo.address)
          setProjectInfo({
            ...projectInfo,
            MainCoinDecimal: mainCoinInfo.decimals,
            MainCoinAddress: checksummedAddress,
          });

          const fVestingDate = res.scheduleInfo.distributionData[1].map(item => BigInt(item));
          const fVestingPercent = res.scheduleInfo.distributionData[2].map(item => BigInt(item));
          console.log(fVestingDate, fVestingPercent);
          setDistributionArr(fVestingDate);
          setDistributionPercentArr(fVestingPercent);
          setReceivedData(res);
        } else {
          console.log('Invalid value');
        }
      })
      .catch(e => {
        console.log('Project Detail check errrrrrrrrrrr', e);
      });
  }

  useEffect(
    () => {
      console.log('calc swap rate');
      console.log(projectInfo);

      if (receivedData) {
        let swapRate = (receivedData.totalRaise * 10 ** projectInfo.MainCoinDecimal) / (receivedData.totalSale * 10 ** projectInfo.TokenDecimal);
        console.log('swapRate', swapRate);

        if (swapRate >= 1) {
          setProjectInfo({ ...projectInfo, SwapType: 1, resSwapRate: Math.round(swapRate) });
        } else {
          swapRate = (receivedData.totalSale * 10 ** projectInfo.TokenDecimal) / (receivedData.totalRaise * 10 ** projectInfo.MainCoinDecimal);
          setProjectInfo({ ...projectInfo, SwapType: 0, resSwapRate: Math.round(swapRate) });
        }
      }
    }, [projectInfo.TokenDecimal])

  useEffect(async () => {
    try {
      const poolContract = getContract(LAUNCHPAD_ADDRESS(), POOLABI, library, account);
      const res = await poolContract.poolsCount();
      const poolCounts = Number(res.toString());
      setTotalPool(poolCounts);
    }
    catch {
      console.log("Unable to retrive pool")
    }
  }, []);

  /* const onClickConnect = async () => {
    try {
      console.log('CLIck', web3);
      let ethereum = window.ethereum;

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const chainIds = await ethereum.request({
        method: 'eth_chainId',
      });

      const networkId = await ethereum.request({
        method: 'net_version',
      });

      network.innerHTML = networkId;
      account.innerHTML = accounts;
      chainId.innerHTML = chainIds;
    } catch (error) {
      console.error(error);
    }
  }; */

  const onClickApprove = async () => {
    ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
    ethersSigner = ethersProvider.getSigner();
    console.log(ethersSigner);
    const tokenContract = new ethers.Contract(approveTokenAddress, ERC20ABI, ethersSigner);
    console.log('the contract information is ', tokenContract);

    // const timer = 10**decimal*approveAmo.value;
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const decimal = await tokenContract.decimals().then(res => {
      console.log('d is ', res, accounts);
      return res;
    });
    const amountBig = BigInt(approveAmount) * BigInt(10 ** decimal);
    console.log('AmountBig', amountBig);

    const result = await tokenContract.approve(
      poolchart_address,
      amountBig.toString(),
      {
        gasLimit: 60000,
      }
    );
    console.log('result is', result);

    const allowance = await tokenContract
      .allowance(accounts[0], poolchart_address)
      .catch(e => {
        console.log('err', e, accounts);
      });
    console.log('allowance is ', allowance, await tokenContract.symbol());
  };

  const onClickDeployToken = async () => {
    console.log('Deploying Token', ethers);

    const _initialAmount = document.getElementById('3').value;
    const _tokenName = document.getElementById('0').value;
    const _decimalUnits = document.getElementById('2').value;
    const _tokenSymbol = document.getElementById('1').value;

    try {
      ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      ethersSigner = ethersProvider.getSigner();
      console.log('Signer', hstByteCode);
      const tokenFactory = new ContractFactory(myAbi, myByteCode, ethersSigner);
      setProjectInfo({ ...projectInfo, TokenDecimal: _decimalUnits });
      const contract = await tokenFactory.deploy(
        _tokenName,
        _tokenSymbol,
        _decimalUnits,
        _initialAmount
      );
      await contract.deployTransaction.wait();
      if (contract.address === undefined) {
        return undefined;
      }
      setProjectInfo({ ...projectInfo, TokenAddress: contract.address });
      setApproveTokenAddress(contract.address);
      console.log(
        `Contract mined! address: ${contract.address} transactionHash: ${contract.transactionHash}`
      );
    } catch (error) {
      console.log('Deploy Failed', error);
    }
  };

  const poolDistributionChange = e => {
    const { value } = e.target;
    const arr = value.split(',').map(items => BigInt(items));
    const timeOut = setTimeout(() => {
      setDistributionPercentArr([...arr]);
    }, 500);
    return () => clearTimeout(timeOut);
  };

  const toTimestampArr = e => {
    const arr = e.target.value.split(',');
    const dt = arr.map(items => {
      const temp = Date.parse(items) / 1000;
      const res = BigInt(temp);
      return res;
    });
    const timeOut = setTimeout(() => {
      setDistributionArr(dt);
    }, 500);
    return () => clearTimeout(timeOut);
  };

  const createPoolClick = async () => {
    console.log('Creating pool');
    const poolContract = getContract(LAUNCHPAD_ADDRESS(), POOLABI, library, account);
    console.log('projectInfo', projectInfo);
    const createPoolInfo = {
      TokenAddress: ethers.utils.getAddress(projectInfo.TokenAddress),
      MainCoinAddress: ethers.utils.getAddress(projectInfo.MainCoinAddress),
      StartAmount: BigInt(receivedData.totalSale) * BigInt(10 ** projectInfo.TokenDecimal),
      StartTime: receivedData.tsSaleStart,
      EndTime: receivedData.tsSaleEnd,
      SwapRate: BigInt(projectInfo.resSwapRate),
      SwapType: BigInt(projectInfo.SwapType),
    };
    console.log('createPoolInfo', createPoolInfo);

    const result = await poolContract.CreatePool(
      createPoolInfo.TokenAddress,
      createPoolInfo.MainCoinAddress,
      createPoolInfo.StartAmount,
      createPoolInfo.StartTime,
      createPoolInfo.EndTime,
      createPoolInfo.SwapRate,
      createPoolInfo.SwapType
    );
    console.log('create pool result', result);

    const res = await poolContract.poolsCount();
    const poolCounts = Number(res.toString());
    setPoolID(poolID + 1);
    setTotalPool(poolCounts + 1);
  };

  // const contractInfoChange = (e) => {
  //   const id = Number(e.target.id)
  //   const value = e.target.value
  //   const decimalID = [2]
  //   const tokenVolumeID = [3]
  //   const res = tokenVolumeID.includes(id) ? BigInt(value) : decimalID.includes(id) ? Number(value) : value;
  //   setCreateContractInfo({ ...createContractInfo, [contractKeys[id]]: res })
  // }

  const poolDistributionClick = async () => {
    const poolContract = getContract(LAUNCHPAD_ADDRESS(), POOLABI, library, account);
    const result = await poolContract.UpdatePoolDistribution(
      BigInt(poolID),
      distributionArr,
      distributionPercentArr
    );
    console.log('pool distribution result', result);
  };

  const vestingClaimClicked = async () => {
    const poolContract = getContract(LAUNCHPAD_ADDRESS(), POOLABI, library, account);
    const result = await poolContract.WithdrawERC20ToCreator(account, claimPoolID);
    console.log('Token & Money Raised claimed: ', result);
  };

  const handleValueChose = e => {
    setProjectInfo({ ...projectInfo, ProjectID: Number(e.target.value) });
    console.log(projectInfo.ProjectID);
  };

  const onBlurProjectID = (e) => {
    let projectID = e.target.value;
    getProjectData(projectID);
  }

  return (
    <div className={styles.launchManagerRoot}>
      <h1 style={{ color: 'white' }}> Enter Project ID </h1>
      <Input
        placeholder="Project ID"
        style={{ marginBottom: '1rem', width: '50%' }}
        onChange={handleValueChose}
        onBlur={onBlurProjectID}
      />
      {receivedData && (
        <>
          <h1 style={{ color: 'white' }}> ProjectInfo </h1>
          <div>Project Name: {receivedData.projectName}</div>
        </>
      )}

      <div style={projectInfo.ProjectID ? {} : { display: 'none' }}>
        <h1 style={{ color: 'white', marginTop: '1rem' }}> Step 1: Deploy ticket contract address / Approve Token </h1>
        <div className={styles.tokenApproval}>
          <div>
            <p style={{ margin: '1rem 0', fontWeight: '500', fontSize: '15px' }}>
              Deploy token address
            </p>
            <Input placeholder="Project Name" id="0" value={receivedData.projectName + " Ticket"} />
            <Input style={{ marginTop: '1rem' }} id="1" placeholder="Project Token" value={receivedData.projectToken + "TIK"} />
            <Input style={{ marginTop: '1rem' }} id="2" placeholder="Token Decimal" value={18} />
            <Input style={{ marginTop: '1rem' }} id="3" placeholder="Total Sale" value={receivedData.totalSale} />
            <Button
              id="deployButton"
              type="primary"
              style={{ marginTop: '1rem', marginLeft: '5px' }}
              onClick={onClickDeployToken}
            >
              Deploy
            </Button>
            <p style={{ margin: '1rem 0', fontWeight: '500', fontSize: '15px' }}>
              Approve token address
            </p>
            <Input
              id="approveAdd"
              placeholder="Token Address"
              value={approveTokenAddress}
              onChange={e => {
                setApproveTokenAddress(e.target.value);
                setProjectInfo({ ...projectInfo, TokenAddress: e.target.value });
              }}
            />
            <Input
              id="approveAmo"
              style={{ marginTop: '1rem' }}
              placeholder="Approve Amount"
              value={approveAmount}
              onChange={e => setApproveAmount(BigInt(e.target.value))}
            />
            <Button
              id="approveButton"
              type="primary"
              style={{ marginTop: '1rem', marginLeft: '5px' }}
              onClick={onClickApprove}
            >
              Submit
            </Button>
          </div>
          <h1 style={{ color: 'white', marginTop: '1rem' }}> Step 2: Create Pool </h1>
          {receivedData && (
            <div>
              <Input
                placeholder="_Token Address"
                id="0"
                value={projectInfo.TokenAddress === null ? 'NULL' : projectInfo.TokenAddress}
                onChange={e => setProjectInfo({ ...projectInfo, TokenAddress: e.target.value })}
              />
              <Input
                style={{ marginTop: '1rem' }}
                placeholder="_MainCoin Address"
                id="1"
                value={projectInfo.MainCoinAddress === null ? 'NULL' : projectInfo.MainCoinAddress}
              />
              <Input
                style={{ marginTop: '1rem' }}
                placeholder="_StartAmount"
                id="2"
                value={receivedData.totalSale ? receivedData.totalSale : 0}
                onChange={e =>
                  setReceivedData({ ...receivedData, totalSale: BigInt(e.target.value) })
                }
              />
              <Input
                style={{ marginTop: '1rem' }}
                placeholder="Start Date (Input Date - MM/DD/YYYY HH:MM:SS)"
                id="3"
                value={receivedData.tsSaleStart ? receivedData.tsSaleStart.toString() : 0}
                onChange={e =>
                  setReceivedData({ ...receivedData, tsSaleStart: BigInt(e.target.value) })
                }
              />
              <Input
                style={{ marginTop: '1rem' }}
                placeholder="End Date (Input Date - MM/DD/YYYY HH:MM:SS)"
                id="4"
                value={receivedData.tsSaleEnd ? receivedData.tsSaleEnd.toString() : 0}
                onChange={e =>
                  setReceivedData({ ...receivedData, tsSaleEnd: BigInt(e.target.value) })
                }
              />
              <Input
                style={{ marginTop: '1rem' }}
                placeholder="_SwapRate"
                id="5"
                value={projectInfo.resSwapRate}
                onChange={e =>
                  setProjectInfo({ ...projectInfo, resSwapRate: BigInt(e.target.value) })
                }
              />
              <Input
                style={{ marginTop: '1rem' }}
                placeholder="_SwapType"
                id="6"
                value={projectInfo.SwapType === 0 ? 0 : projectInfo.SwapType}
              />
            </div>
          )}
          <Button
            type="primary"
            style={{ marginTop: '1rem', marginLeft: '5px' }}
            onClick={createPoolClick}
          >
            Create
          </Button>
          {totalPool &&
            <h3 style={{ fontWeight: '450', color: 'red', marginTop: '1rem', width: '100%' }}>
              Total Pool: {totalPool}
            </h3>
          }
          <h1 style={{ color: 'white', marginTop: '1rem' }}>
            Step 3: Create Pool Distribution (Vesting)
          </h1>
          <Input
            placeholder="Pool ID"
            id="0"
            value={poolID}
            onChange={e => setPoolID(e.target.value)}
          />
          {receivedData && (
            <div>
              <Input
                style={{ marginTop: '1rem' }}
                placeholder="Distribution time"
                id="1"
                value={distributionArr.length === 0 ? 0 : distributionArr}
                onChange={toTimestampArr}
              />
              <Input
                style={{ marginTop: '1rem' }}
                placeholder="Distribution percentage"
                id="2"
                value={distributionPercentArr.length === 0 ? 0 : distributionPercentArr}
                onChange={poolDistributionChange}
              />
            </div>
          )}
          <Button
            type="primary"
            style={{ marginTop: '1rem', marginLeft: '5px' }}
            onClick={poolDistributionClick}
          >
            Submit
          </Button>
          <h1 style={{ color: 'white', marginTop: '1rem' }}>
            Step 4: Withdraw token & money raised (Vesting)
          </h1>
          <Input placeholder="Pool ID" value={poolID} />
          <Button
            type="primary"
            style={{ marginTop: '1rem', marginLeft: '5px' }}
            onClick={vestingClaimClicked}
          >
            Claim
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LaunchManager;
