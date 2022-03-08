
import { useEffect, useState } from "react"
import { useParams } from 'react-router-dom';
import './css/Form.css';
import axios from 'axios';
import { API_URL } from '@/constants';
import { useConstantLoader } from '@/constants';

// CONSTANTS
const INITIAL_FORM = {
    //1
    projectName: '',
    projectToken: '',
    projectTokenUrl: '',
    poolID: '',
    mainCoin: '',
    tokenLabels: '',
    projectDescription: '',
    posterUrl: '',

    //2
    T: '',
    alertProportion: '',
    maxAlloc: '',
    maxTotalAlloc: '',
    minAlloc: '',
    minInvest: '',
    rateAcy: '',
    rateBalance: '',
    rateLiquidity: '',
    rateSwap: '',
    allocatedAmount: '',
    soldamount: '',
    tokenPrice: '',
    totalRaise: '',
    totalSale: '',
    regStart: '',
    regEnd: '',
    saleStart: '',
    saleEnd: '',

    //3
    Confluxaddress: '',
    Etheraddress: '',
    Forum: '',
    Github: '',
    Linkedin: '',
    Medium: '',
    Polyaddress: '',
    Telegram: '',
    Twitter: '',
    Website: '',
    Whitepaper: '',
    Youtube: '',

}

const PLACE_HOLDERS = {
    //1
    projectName: '1.1 Project Name',
    projectToken: '1.2 Project Token',
    projectTokenUrl: '1.3 Project Token URL',
    poolID: '1.4 Pool ID',
    mainCoin: '1.5 Main Coin',
    tokenLabels: '1.6 Token Labels',
    projectDescription: '1.7 Project Description',
    posterUrl: '1.8 Poster URL',

    //2
    T: '2.1 T',
    alertProportion: '2.2 Alert Proportion',
    maxAlloc: '2.3 Maximum Allocation',
    maxTotalAlloc: '2.4 Maximum Total Allocation',
    minAlloc: '2.5 Minimum Allocation',
    minInvest: '2.6 Minimum Investion',
    rateAcy: '2.7 ACY Rate',
    rateBalance: '2.8 Balance Rate',
    rateLiquidity: '2.9 Liquidity Rate',
    rateSwap: '2.10 Swap Rate',
    allocatedAmount: '2.11 Allocated Amount',
    soldamount: '2.12 Sold Amount',
    tokenPrice: '2.13 Token Price',
    totalRaise: '2.14 Total Raise',
    totalSale: '2.15 Total Sale',
    regStart: '2.16 Reg Start',
    regEnd: '2.17 Reg End',
    saleStart: '2.18 Sale Start',
    saleEnd: '2.19 Sale End',

    //3
    Confluxaddress: '3.1 Conflux Address',
    Etheraddress: '3.2 Ether Address',
    Forum: '3.3 Forum',
    Github: '3.4 Github',
    Linkedin: '3.5 Linkedin',
    Medium: '3.6 Medium',
    Polyaddress: '3.7 Polygon Address',
    Telegram: '3.8 Telegram',
    Twitter: '3.9 Twitter',
    Website: '3.10 Website',
    Whitepaper: '3.11 Whitepaper',
    Youtube: '3.12 Youtube',

}

// COMPONENTS
const InputField = ({
    type,
    name,
    setFormField,
    originalData
}) => {


    const onBlurField = (e) => {
        const value = e.target.value;
        setFormField(name, value);
    }

    if (type === "area") {
        return (
            <div>
                <div className="title-info">{name}</div>
                <textarea
                    placeholder={PLACE_HOLDERS[name]}
                    onBlur={onBlurField}
                    defaultValue={originalData}
                />
            </div>
        )
    }
    else if (type === "s") {
        return (
            <div>
                <div className="title-info">{name}</div>
                <li
                    placeholder={PLACE_HOLDERS[name]}
                    onBlur={onBlurField}
                    defaultValue={originalData}
                />
            </div>
        )
    }
    return (
        <div>
            <div className="title-info">{name}</div>
            <input
                type={"text"}
                placeholder={PLACE_HOLDERS[name]}
                onBlur={onBlurField}
                defaultValue={originalData}
            />
        </div>
    )
}

const ApplicationForm = () => {

    // STATES
    const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [currentprogressbar, setprogressbar] = useState();
    const { projectId } = useParams();
    const [receivedData, setReceivedData] = useState({});
    const { account, chainId, library } = useConstantLoader();

    // HOOKS
    useEffect(() => {
        console.log("User Check====101====:", account);
        if (account == undefined) {
            alert("Please Return to the launch Page connect your wallet befor you apply for IDO!!!");
        }
    }, [account]);

    useEffect(() => {
        console.log('formdata', formData);
    }, [formData]);

    //Get project data
    useEffect(async () => {
        let result = await axios.get(`http://localhost:3001/bsc-main/api/launch/projects/${projectId}`);
        console.log("project Id=", projectId);
        console.log("project data= ", result);
        console.log("result data=", result.data);
        const resultData = result.data;
        //Error: 'receivedData' is empty even though 'resultData' is not 
        setReceivedData(resultData);
        console.log("received data=", receivedData);
    }, [projectId])

    // FUNCTIONS
    const setFormField = (fieldname, value) => {
        const newFormData = Object.assign({}, formData);
        newFormData[fieldname] = value;
        setFormData(newFormData);
    }

    const submitData = (e) => {

        e.preventDefault();

        console.log(formData);
        axios.post(
            `http://localhost:3001/bsc-main/api/launch/projects/update/${projectId}`, formData
        )
            .then(data => {
                console.log(data);
            })
            .catch(e => {
                console.log(e);
            });
        e.preventDefault();
        alert("Update successfully!")

    }

    // COMPONENTS
    const ProgressBar = () => {

        if (currentFieldIndex === 2) {
            return (
                <ul id="progressbar">
                    <li className="active" type="button" onClick={() => setCurrentFieldIndex(0)}>Project</li>
                    <li className="active" type="button" onClick={() => setCurrentFieldIndex(1)} >IDO</li>
                    <li className="active" type="button" onClick={() => setCurrentFieldIndex(2)}>Social</li>
                </ul>
            )

        }
        else if (currentFieldIndex === 1) {
            return (
                <ul id="progressbar">
                    <li className="active" type="button" onClick={() => setCurrentFieldIndex(0)}>Project</li>
                    <li className="active" type="button" onClick={() => setCurrentFieldIndex(1)} >IDO</li>
                    <li type="button" onClick={() => setCurrentFieldIndex(2)}>Social</li>
                </ul>
            )
        }
        else {
            return (
                <ul id="progressbar">
                    <li className="active" type="button" onClick={() => setCurrentFieldIndex(0)}>Project</li>
                    <li type="button" onClick={() => setCurrentFieldIndex(1)} >IDO</li>
                    <li type="button" onClick={() => setCurrentFieldIndex(2)}>Social</li>
                </ul>
            )
        }

    }
    return (
        <div id="form-container">

            <form id="msform">
                <ProgressBar />

                <div style={{ display: currentFieldIndex === 0 ? 'block' : 'none' }}>
                    <fieldset>
                        <h2 className="fs-title">Edit LaunchPad Project Information</h2>
                        <h3 className="fs-subtitle">Project Information</h3>
                        <InputField name="projectName" setFormField={setFormField} originalData={receivedData.basicInfo.projectName} />
                        <InputField name="projectToken" setFormField={setFormField} originalData={receivedData.basicInfo.projectToken} />
                        <InputField name="projectTokenUrl" setFormField={setFormField} originalData={receivedData.basicInfo.projectTokenUrl} />
                        <InputField name="poolID" setFormField={setFormField} originalData={receivedData.basicInfo.poolID} />
                        <InputField name="mainCoin" setFormField={setFormField} originalData={receivedData.basicInfo.mainCoin} />
                        {/*Error: Unable to separate original data for the following 3 field */}
                        <InputField name="tokenLabels" setFormField={setFormField} />
                        <InputField name="projectDescription" setFormField={setFormField} />
                        <InputField name="posterUrl" setFormField={setFormField} />

                        <input type="button" name="next" className="next action-button" value="Next" onClick={() => setCurrentFieldIndex(1)} />
                    </fieldset>
                </div>

                <div style={{ display: currentFieldIndex === 1 ? 'block' : 'none' }}>
                    <fieldset>
                        <h2 className="fs-title">Edit LaunchPad Project Information</h2>
                        <h3 className="fs-subtitle">IDO Information</h3>
                        <InputField name="T" setFormField={setFormField} originalData={receivedData.allocationInfo.parameters.T} />
                        <InputField name="alertProportion" setFormField={setFormField} originalData={receivedData.allocationInfo.parameters.alertProportion} />
                        <InputField name="maxAlloc" setFormField={setFormField} originalData={receivedData.allocationInfo.parameters.maxAlloc} />
                        <InputField name="maxTotalAlloc" setFormField={setFormField} originalData={receivedData.allocationInfo.parameters.maxTotalAlloc} />
                        <InputField name="minAlloc" setFormField={setFormField} originalData={receivedData.allocationInfo.parameters.minAlloc} />
                        <InputField name="minInvest" setFormField={setFormField} originalData={receivedData.allocationInfo.parameters.minInvest} />
                        <InputField name="rateAcy" setFormField={setFormField} originalData={receivedData.allocationInfo.parameters.rateAcy} />
                        <InputField name="rateBalance" setFormField={setFormField} originalData={receivedData.allocationInfo.parameters.rateBalance} />
                        <InputField name="rateLiquidity" setFormField={setFormField} originalData={receivedData.allocationInfo.parameters.rateLiquidity} />
                        <InputField name="rateSwap" setFormField={setFormField} originalData={receivedData.allocationInfo.parameters.rateSwap} />
                        <InputField name="allocatedAmount" setFormField={setFormField} originalData={receivedData.allocationInfo.states.allocatedAmount} />
                        <InputField name="soldamount" setFormField={setFormField} originalData={receivedData.allocationInfo.states.soldamount} />
                        <InputField name="tokenPrice" setFormField={setFormField} originalData={receivedData.salesInfo.tokenPrice} />
                        <InputField name="totalRaise" setFormField={setFormField} originalData={receivedData.salesInfo.totalRaise} />
                        <InputField name="totalSale" setFormField={setFormField} originalData={receivedData.salesInfo.totalSale} />
                        <InputField name="regStart" setFormField={setFormField} originalData={receivedData.scheduleInfo.distributionData[0]} />
                        <InputField name="regEnd" setFormField={setFormField} originalData={receivedData.scheduleInfo.distributionData[1]} />
                        <InputField name="saleStart" setFormField={setFormField} originalData={receivedData.scheduleInfo.distributionData[2]} />
                        <InputField name="saleEnd" setFormField={setFormField} originalData={receivedData.scheduleInfo.distributionData[3]} />

                        <input type="button" name="previous" className="previous action-button" value="Previous" onClick={() => setCurrentFieldIndex(0)} />
                        <input type="button" name="next" className="next action-button" value="Next" onClick={() => setCurrentFieldIndex(2)} />
                    </fieldset>
                </div>

                <div style={{ display: currentFieldIndex === 2 ? 'block' : 'none' }}>
                    <fieldset>
                        <h2 className="fs-title">Edit Launch Project Information</h2>
                        <h3 className="fs-subtitle">Social Media Information</h3>
                        <InputField name="Confluxaddress" setFormField={setFormField} originalData={receivedData.social[0]} />
                        <InputField name="Etheraddress" setFormField={setFormField} originalData={receivedData.social[1]} />
                        <InputField name="Forum" setFormField={setFormField} originalData={receivedData.social[2]} />
                        <InputField name="Github" setFormField={setFormField} originalData={receivedData.social[3]} />
                        <InputField name="Linkedin" setFormField={setFormField} originalData={receivedData.social[4]} />
                        <InputField name="Medium" setFormField={setFormField} originalData={receivedData.social[5]} />
                        <InputField name="Polyaddress" setFormField={setFormField} originalData={receivedData.social[6]} />
                        <InputField name="Telegram" setFormField={setFormField} originalData={receivedData.social[7]} />
                        <InputField name="Twitter" setFormField={setFormField} originalData={receivedData.social[8]} />
                        <InputField name="Website" setFormField={setFormField} originalData={receivedData.social[9]} />
                        <InputField name="Whitepaper" setFormField={setFormField} originalData={receivedData.social[10]} />
                        <InputField name="Youtube" setFormField={setFormField} originalData={receivedData.social[11]} />

                        <input type="button" name="previous" className="previous action-button" value="Previous" onClick={() => setCurrentFieldIndex(1)} />
                        <input type="submit" name="submit" className="submit action-button" value="Submit" onClick={submitData} />
                    </fieldset>
                </div>

            </form>
        </div>

    )
}

export default ApplicationForm;