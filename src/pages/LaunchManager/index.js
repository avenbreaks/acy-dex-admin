import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Select } from 'antd';
import * as moment from 'moment';
import { history } from 'umi';
import { ethers } from 'ethers';
import styles from './styles.less';
import './styles.css';
import { getContract } from '../../acy-dex-swap/utils/index.js';
import ERC20ABI from '../../abis/ERC20.json';
import myAbi from '../../abis/pool.json';
import myByteCode from './bytecode.json';
import { hstAbi, hstByteCode } from '../../abis/constants.json';
import { useWeb3React } from '@web3-react/core';
import POOLABI from '@/acy-dex-swap/abis/AcyV1Poolz.json';
import { getProjects, getProjectInfo } from '@/services/api';
import { LAUNCHPAD_ADDRESS, LAUNCH_RPC_URL, CHAINID, API_URL, TOKEN_LIST } from '@/constants';
import { CustomError } from '@/acy-dex-swap/utils';
import { BigNumber } from '@ethersproject/bignumber';
import { ContractFactory } from 'ethers';
import { useConnectWallet } from '@/components/ConnectWallet';

const { Option } = Select;

// TODO:
// 1. 不要手动Connect Wallet，直接useEffect去抓
// 2. Deploy Token之后，Address直接放过来，Approve Amount直接填非常大
// 3. 所有依赖其他字段的值。都不可修改，视情况是否显示

const BSC_testnet_PoolContract_address = '0x6e0EC29eA8afaD2348C6795Afb9f82e25F196436';
// const BSC_mainnet_PoolContract_address = "";

const LaunchManager = props => {
  const [projectInfo, setProjectInfo] = useState({
    TotalProject: 0,
    ProjectID: null,
    TokenDecimal: null,
    MainCoinDecimal: null,
    TokenAddress: null,
    MainCoinAddress: null,
    resSwapRate: 0,
    SwapType: 0,
  });
  const [totalPool, setTotalPool] = useState(0);
  const [poolID, setPoolID] = useState(null);
  const [receivedData, setReceivedData] = useState();
  const [approveTokenAddress, setApproveTokenAddress] = useState(null);
  const [approveAmount, setApproveAmount] = useState(0);
  const [createPoolInfo, setCreatePoolInfo] = useState({});
  const [distributionArr, setDistributionArr] = useState();
  const [distributionPercentArr, setDistributionPercentArr] = useState();

  // link to launch contract address
  const { account, chainId, library, activate, active } = useWeb3React();
  const poolContract = getContract(LAUNCHPAD_ADDRESS(), POOLABI, library, account);

  const { ethereum } = window;
  let ethersProvider;
  let ethersSigner;
  let userAddress;

  const poolKeys = [
    'Token',
    'MainCoin',
    'StartAmount',
    'StartTime',
    'EndTime',
    'SwapRate',
    'SwapType',
  ];

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
    () => {
      getProjects(API_URL())
        .then(res => {
          if (res) {
            console.log(res);
            setProjectInfo({ ...projectInfo, TotalProject: res.length });
            console.log(projectInfo.TotalProject);
          } else {
            console.log('Failed to retrieve data from database');
          }
        })
        .catch(e => console.error(e));
    },
    [library, chainId, account]
  );

  useEffect(
    () => {
      getProjectInfo(API_URL(), projectInfo.ProjectID)
        .then(res => {
          if (res) {
            // extract data from string
            res['saleStart'] = formatTime(res.scheduleInfo.saleStart);
            res['saleEnd'] = formatTime(res.scheduleInfo.saleEnd);

            res['tsSaleStart'] = BigInt(Date.parse(res['saleStart']) / 1000);
            res['tsSaleEnd'] = BigInt(Date.parse(res['saleEnd']) / 1000);

            if (res.saleInfo.tokenPrice < 1) setProjectInfo({ ...projectInfo, SwapType: 0 });
            else setProjectInfo({ ...projectInfo, SwapType: 1 });

            res['tokenPrice'] = res.saleInfo.tokenPrice;
            res['totalSale'] = res.saleInfo.totalSale;
            res['mainCoin'] = res.basicInfo.mainCoin;

            // get state to hide graph and table
            const mainCoinInfo = TOKEN_LIST().find(item => item.symbol === res.basicInfo.mainCoin);
            setProjectInfo({ ...projectInfo, MainCoinDecimal: mainCoinInfo.decimals });
            setProjectInfo({ ...projectInfo, MainCoinAddress: mainCoinInfo.address });

            const fVestingDate = res.scheduleInfo.distributionData[1].map(item => BigInt(item));
            const fVestingPercent = res.scheduleInfo.distributionData[2].map(item => BigInt(item));
            console.log(fVestingDate, fVestingPercent);
            setDistributionArr(fVestingDate);
            setDistributionPercentArr(fVestingPercent);
            console.log(distributionArr, distributionPercentArr);
            setReceivedData(res);
            console.log('RESULTTTTTTTTTT');
            console.log(receivedData);
          } else {
            console.log('Invalid value');
          }
        })
        .catch(e => {
          console.log('Project Detail check errrrrrrrrrrr', e);
        });
    },
    [projectInfo.ProjectID]
  );

  useEffect(
    () => {
      if (receivedData && receivedData.tokenPrice < 1) {
        const temp =
          ((1 * 10 ** projectInfo.MainCoinDecimal) / receivedData.tokenPrice) *
          10 ** projectInfo.TokenDecimal;
        setProjectInfo({ ...projectInfo, resSwapRate: temp });
      }
      if (receivedData && receivedData.tokenPrice > 1) {
        const temp =
          ((receivedData.tokenPrice * 10 ** projectInfo.TokenDecimal) / 1) *
          10 ** projectInfo.MainCoinDecimal;
        setProjectInfo({ ...projectInfo, resSwapRate: temp });
      }
    },
    [projectInfo.TokenDecimal]
  );

  useEffect(
    async () => {
      const status = await (async () => {
        const res = await poolContract.poolsCount().catch(e => {
          console.log(e);
          return new CustomError('CustomError while getting pool count');
        });
        console.log('POOOOOOOOOOOOOLS');
        setTotalPool(res);
        return res;
      })();
      console.log('Getting pool count: ', status);

      // Update DB
      /* const tempPoolCount = totalPool - 1;
      const apiUrlPrefix = API_URL();
      axios
        .post(`${apiUrlPrefix}/launch/updatePoolID?poolId=${tempPoolCount}`)
        .then(res => {
          if (res) setSuccess(true);
        })
        .catch(e => {
          setHasError(true);
          console.log(e);
        }); */
    },
    [poolID]
  );

  // const onboardButton = document.getElementById('connectButton');
  // const network = document.getElementById('network');
  // // const chainId = document.getElementById('chainId');
  // const account = document.getElementById('accounts');
  // const amount = document.getElementById('amount');

  const createPoolChange = e => {
    try {
      const bigIntIDs = [2, 5, 6];
      const addressIDs = [0, 1];
      const id = Number(e.target.id);
      const value = e.target.value;
      const res = bigIntIDs.includes(id)
        ? BigInt(value)
        : addressIDs.includes(id)
        ? ethers.utils.getAddress(value)
        : value;
      const timeOut = setTimeout(() => {
        setCreatePoolInfo({ ...createPoolInfo, [poolKeys[id]]: res });
      }, 500);
      return () => clearTimeout(timeOut);
    } catch {
      console.log('wrong format');
    }
  };

  const onClickApprove = async () => {
    let approveAdd = document.getElementById('approveAdd');
    let approveAmo = document.getElementById('approveAmo');
    console.log('approveClick', approveAdd.value, approveAmo.value);

    ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
    ethersSigner = ethersProvider.getSigner();
    console.log(ethersSigner);
    const tokenContract = new ethers.Contract(approveAdd.value, ERC20ABI, ethersSigner);
    console.log('the contract information is ', tokenContract);

    // const timer = 10**decimal*approveAmo.value;
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const decimal = await tokenContract.decimals().then(res => {
      console.log('d is ', res, accounts);
      return res;
    });
    const amountBig = 999999999999999999999;

    const result = await tokenContract.approve(
      BSC_testnet_PoolContract_address,
      amountBig.toString(),
      {
        gasLimit: 60000,
      }
    );
    console.log('result is ', result);

    const allowance = await tokenContract
      .allowance(accounts[0], BSC_testnet_PoolContract_address)
      .catch(e => {
        console.log('err', e, accounts);
      });
    amount.innerHTML = allowance;
    console.log('allowance is ', allowance, await tokenContract.symbol());
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
      setProjectInfo({...projectInfo, TokenAddress: contract.address})
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

  const toTimestamp = e => {
    const id = Number(e.target.id);
    const value = e.target.value;
    try {
      const dt = BigInt(Date.parse(value) / 1000);
      setCreatePoolInfo({ ...createPoolInfo, [poolKeys[id]]: dt });
    } catch {
      console.log('wrong format');
    }
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
    const status = await (async () => {
      const result = await poolContract.CreatePool(
        ethers.utils.getAddress(projectInfo.TokenAddress),
        ethers.utils.getAddress(projectInfo.MainCoinAddress),
        BigInt(receivedData.totalSale * (10 ** projectInfo.TokenAddress)),
        receivedData.tsSaleStart,
        receivedData.tsSaleEnd,
        BigInt(projectInfo.resSwapRate),
        BigInt(projectInfo.SwapType)
      );
      setPoolID(0).catch(e => {
        console.log(e);
        return new CustomError('CustomError while buying token');
      });
      return result;
    })();
    console.log('create pool', status);
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
    const status = await (async () => {
      const result = await poolContract
        .UpdatePoolDistribution(poolID, distributionArr, distributionPercentArr)
        .catch(e => {
          console.log(e);
          return new CustomError('CustomError while buying token');
        });
      return result;
    })();
    console.log('create pool', status);
  };

  const vestingClaimClicked = async () => {
    const status = await (async () => {
      const result = await poolContract.WithdrawERC20ToCreator(poolID).catch(e => {
        console.log(e);
        return new CustomError('CustomError while withdrawing token & money raised');
      });
      return result;
    })();
    console.log('Token & Money Raised claimed: ', status);
  };

  const handleValueChose = e => {
    setProjectInfo({ ...projectInfo, ProjectID: Number(e.target.value - 1) });
    console.log(projectInfo.ProjectID);
  };

  return (
    <div className={styles.launchManagerRoot}>
      <h1 style={{ color: 'white' }}> Enter Project ID </h1>
      <Input
        placeholder="Project ID"
        style={{ marginBottom: '1rem', width: '50%' }}
        onChange={handleValueChose}
      />
      <h1 style={{ color: 'white' }}> Step 1: Approve token / Create ticket contract address </h1>
      <Button type="primary" id="connectButton" className={styles.connectButton}>
        ConnectMetaMask
      </Button>
      <section>
        <h3 style={{ color: 'white' }}>Status</h3>
        <div className="row">
          <div className="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 tx-black">
            <p className="info-text alert alert-primary">
              Network: <span id="network" />
            </p>
          </div>
          <div className="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12">
            <p className="info-text alert alert-secondary">
              ChainId: <span id="chainId" />
            </p>
          </div>
          <div className="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12">
            <p className="info-text alert alert-success">
              Accounts: <span id="accounts" />
            </p>
          </div>
          <div className="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12">
            <p className="info-text alert alert-success">
              ApproveAmount: <span id="amount" />
            </p>
          </div>
        </div>
      </section>
      <div className={styles.tokenApproval}>
        <div>
          <h3 style={{ color: 'white' }}>Step 1: Approve token</h3>
          <p style={{ margin: '1rem 0', fontWeight: '500', fontSize: '15px' }}>
            Deploy token address
          </p>
          <Input placeholder="Project Name" id="0" />
          <Input style={{ marginTop: '1rem' }} id="1" placeholder="Project Token" />
          <Input style={{ marginTop: '1rem' }} id="2" placeholder="Token Decimal" />
          <Input style={{ marginTop: '1rem' }} id="3" placeholder="Total token volume" />
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
            value={projectInfo.TokenAddress === null ? 'NULL' : projectInfo.TokenAddress}
            onChange={e => setApproveTokenAddress(e)}
          />
          <Input
            id="approveAmo"
            style={{ marginTop: '1rem' }}
            placeholder="Approve Amount"
            value='999999999999999999999'
            onChange={e => setApproveAmount(e)}
          />
          <Button
            id="approveButton"
            type="primary"
            style={{ marginTop: '1rem', marginLeft: '5px' }}
            onClick={onClickApprove}
          >
            {' '}
            Submit{' '}
          </Button>
        </div>
        <h1 style={{ color: 'white', marginTop: '1rem' }}> Step 2: Create Pool </h1>
        {receivedData && (
          <div>
            <Input
              placeholder="_Token Address"
              id="0"
              value={projectInfo.TokenAddress === null ? 'NULL' : projectInfo.TokenAddress}
              onChange={createPoolChange}
            />
            <Input
              style={{ marginTop: '1rem' }}
              placeholder="_MainCoin Address"
              id="1"
              value={projectInfo.MainCoinAddress === null ? 'NULL' : projectInfo.MainCoinAddress}
              onChange={createPoolChange}
            />
            <Input
              style={{ marginTop: '1rem' }}
              placeholder="_StartAmount"
              id="2"
              value={receivedData.totalSale ? receivedData.totalSale : 0}
              onChange={createPoolChange}
            />
            <Input
              style={{ marginTop: '1rem' }}
              placeholder="Start Date (输入日期 - 月/日/年 小时, 分钟, 秒)"
              id="3"
              value={receivedData.tsSaleStart ? receivedData.tsSaleStart.toString() : 0}
              onChange={createPoolChange}
            />
            <Input
              style={{ marginTop: '1rem' }}
              placeholder="End Date (输入日期 - 月/日/年 小时, 分钟, 秒)"
              id="4"
              value={receivedData.tsSaleEnd ? receivedData.tsSaleEnd.toString() : 0}
              onChange={createPoolChange}
            />
            <Input
              style={{ marginTop: '1rem' }}
              placeholder="_SwapRate"
              id="5"
              value={projectInfo.resSwapRate === 0 ? 0 : projectInfo.resSwapRate}
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
        <h3 style={{ fontWeight: '450', color: 'red', marginTop: '1rem', width: '100%' }}>
          Pool ID: {totalPool - 1}
        </h3>
        <h1 style={{ color: 'white', marginTop: '1rem' }}>
          Step 3: Create Pool Distribution (Vesting)
        </h1>
        <Input placeholder="Pool ID" id="0" value={totalPool - 1} />
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
        <Input placeholder="Pool ID" id="0" onChange={e => setPoolID(e.target.value)} />
        <Button
          type="primary"
          style={{ marginTop: '1rem', marginLeft: '5px' }}
          onClick={vestingClaimClicked}
        >
          Claim
        </Button>
      </div>
    </div>
  );
};

export default LaunchManager;
