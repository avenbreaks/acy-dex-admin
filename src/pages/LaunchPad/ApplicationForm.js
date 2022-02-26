
import { useEffect, useState } from "react"
import { useParams } from 'react-router-dom';
import './css/Form.css';
import axios from 'axios';
import { API_URL } from '@/constants';
import { useConstantLoader } from '@/constants';

// CONSTANTS
const INITIAL_FORM = {
    //1
    username: '',
    projectname: '',
    email: '',
    websiteURL: '',
    logoURL: '',
    description: '',
    category: '',
    projectIn: '',

    whitepaperLINK: '',
    githubLINK: '',
    telegramLINK: '',
    twitterLINK: '',
    linkedinLINK: '',
    discordLINK: '',

    //2
    symbol: '',
    address: '',
    supply: '',
    ecolink: '',

    //3
    idoDate: '',
    start: '',
    ended: '',

    vestingStart: '',
    vestingMonth: '',
    vestingDate: '',

    idoPrice: '',
    raise: '',
    marketcap: '',
    sale: '',

}

const PLACE_HOLDERS = {
    //1
    username: '1.1 Your Telegram Username',
    projectname: '1.2 ProjectName',
    email: '1.3 Official Email Address',
    websiteURL: '1.4 Project Website',
    logoURL: '1.5 Project Logo URL (SVG Prefferred)',
    description: '1.6 ProjectDescription',
    category: '1.7 Project Category',
    projectIn: '1.8 Your Project Build In',

    whitepaperLINK: '1.9 WhitePaper Link',
    githubLINK: '1.10 Github Link',
    telegramLINK: '1.11 Telegram Community Link',
    twitterLINK: '1.12 Twitter Link',
    linkedinLINK: '1.13 Linkedin Link',
    discordLINK: '1.14 Discord Link',
    //2
    symbol: '2.1 Token Symbol',
    address: '2.2 Token Contract Address in Scan',
    supply: '2.3 Total Supply',
    ecolink: '2.4 Token Econimics Link',

    //3
    idoDate: '3.1 IDO Date',
    start: '3.2 Start Time',
    ended: '3.3 Ended Time',

    vestingStart: '()',
    vestingMonth: '(Month)',
    vestingDate: '(Date)',

    idoPrice: '3.5 IDO Price',
    raise: '3.6 How much to raise?(USD)',
    marketcap: '3.7 Fully Diluted Market Cap(Auto Fill)',
    sale: '3.8 How many tokens for sale?(Auto Fill)',


}

const VALIDATION_FUNCTIONS = {
    //1
    username: (value) => {
        if (value.trim() === "") return false;

        return true;
    },
    projectname: (value) => {
        if (value.trim() === "") return false;

        return true;
    },
    email: (value) => {
        if (value.trim() === "") return false;

        return true;
    },
    websiteURL: (value) => {
        if (value.trim() === "") return false;

        return true;
    },
    logoURL: (value) => {
        if (value.trim() === "") return false;

        return true;
    },
    description: (value) => {
        if (value.trim() === "") return false;

        return true;
    },
    category: (value) => {
        if (value.trim() === "") return false;

        return true;
    },
    projectIn: (value) => {
        if (value.trim() === "") return false;

        return true;
    },

    whitepaperLINK: (value) => {
        if (value.trim() === "") return false;

        return true;
    },
    githubLINK: (value) => {
        if (value.trim() === "") return false;

        return true;
    },
    telegramLINK: (value) => {
        if (value.trim() === "") return false;

        return true;
    },
    twitterLINK: (value) => {
        if (value.trim() === "") return false;

        return true;
    },
    linkedinLINK: (value) => {
        if (value.trim() === "") return false;

        return true;
    },
    discordLINK: (value) => {
        if (value.trim() === "") return false;

        return true;
    },

    //2
    symbol: (value) => {
        if (value.trim() === "") return false;

        return true;
    },
    address: (value) => {
        if (value.trim() === "") return false;

        return true;
    },
    supply: (value) => {
        if (value.trim() === "") return false;

        return true;
    },
    ecolink: (value) => {
        if (value.trim() === "") return false;

        return true;
    },

    //3
    idoDate: (value) => {
        if (value.trim() === "") return false;

        return true;
    },
    start: (value) => {
        if (value.trim() === "") return false;

        return true;
    },
    ended: (value) => {
        if (value.trim() === "") return false;

        return true;
    },

    vestingStart: (value) => {
        if (value.trim() === "") return false;

        return true;
    },
    vestingMonth: (value) => {
        if (value.trim() === "") return false;

        return true;
    },
    vestingDate: (value) => {
        if (value.trim() === "") return false;

        return true;
    },

    idoPrice: (value) => {
        if (value.trim() === "") return false;

        return true;
    },
    raise: (value) => {
        if (value.trim() === "") return false;

        return true;
    },
    marketcap: '',
    sale: '',
}

const ERROR_INFOS = {
    //1
    username: "Username length should be larger than 5",//"Please enter your username"
    projectname: "Please enter your project name",
    email:  //{
        "Please enter your email"//,
    //"Please enter a correct email address format"
    //}
    ,
    websiteURL: "Please enter your project website url",
    logoURL: "Please enter your logo url",
    description: "Please enter your project description",
    category: "Please enter your project category",
    projectIn: "Please enter where your project is built in",

    whitepaperLINK: "Please enter url",//1.9-1.14
    githubLINK: "Please enter url",
    telegramLINK: "Please enter url",
    twitterLINK: "Please enter url",
    linkedinLINK: "Please enter url",
    discordLINK: "Please enter url",

    //2
    symbol: "Please enter your Token Symbol", //2.1
    address: "Please enter your Token Contract Address", //2.2
    supply: "Please enter your Token Supply", //2.3
    ecolink: "Please enter your Token Econimics Link",//2.4

    //3
    idoDate: "Please enter IDO Date", //3.1
    start: "Please enter Start Time", //3.2
    ended: "Please enter Ended Time", //3.3

    vestingStart: "Please fill in the blanks", //3.4 ALL
    vestingMonth: "Please fill in the blanks", //3.4 ALL
    vestingDate: "Please fill in the blanks", //3.4 ALL

    idoPrice: "Please enter IDO Price", //3.5
    raise: "Please enter USD", //3.6

    marketcap: '',
    sale: '',


}

// COMPONENTS
const InputField = ({
    type,
    name,
    setFormField,
    originalData
}) => {

    const [isError, setIsError] = useState(false);

    const onChangeField = (e) => {
        const value = e.target.value;
        if (name in VALIDATION_FUNCTIONS) {
            if (!VALIDATION_FUNCTIONS[name](value)) {
                setIsError(true);
            } else {

                setIsError(false);
            }
        }
    }

    const onBlurField = (e) => {
        const value = e.target.value;
        setFormField(name, value);
    }

    if (type === "area") {
        return (
            <div>
                {isError &&
                    <div className="error-info">{ERROR_INFOS[name]}</div>
                }
                <textarea
                    //type={"text"}
                    placeholder={PLACE_HOLDERS[name]}
                    onChange={onChangeField}
                    onBlur={onBlurField}
                    defaultValue={originalData}
                />
            </div>
        )
    }
    else if (type === "s") {
        return (
            <div>
                {isError &&
                    <div className="error-info">{ERROR_INFOS[name]}</div>
                }
                <li
                    //type={"text"}
                    placeholder={PLACE_HOLDERS[name]}
                    onChange={onChangeField}
                    onBlur={onBlurField}
                    defaultValue={originalData}
                />
            </div>
        )
    }
    return (
        <div>
            {isError &&
                <div className="error-info">{ERROR_INFOS[name]}</div>
            }
            <input
                type={"text"}
                placeholder={PLACE_HOLDERS[name]}
                onChange={onChangeField}
                onBlur={onBlurField}
                defaultValue={originalData}
            />
        </div>
    )
}

const ApplicationForm = () => {
    //const name,

    // STATES
    const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [currentprogressbar, setprogressbar] = useState();
    const { projectId = -1 } = useParams();
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

    // Get form by Id (if projectId = -1, means first time creating form)
    if (projectId != -1) {
        useEffect(async () => {
            let result = await axios.get(`http://localhost:3001/bsc-test/api/applyForm/getFormById?projectId=${projectId}`);
            // console.log("project data data= ", result.data);
            const resultData = result.data[0].form;
            setReceivedData(resultData)
        }, [projectId])
    }

    // FUNCTIONS
    const setFormField = (fieldname, value) => {
        const newFormData = Object.assign({}, formData);
        newFormData[fieldname] = value;
        setFormData(newFormData);
    }

    // const nextProgress = (num) => {

    //   const value = e.target.value;
    //   setFormField(name, value);

    //     const value = e.target.value;
    //     if (name in VALIDATION_FUNCTIONS) {
    //       if (!VALIDATION_FUNCTIONS[name](value)) {
    //         setIsError(true);
    //       } else {

    //         setIsError(false);
    //       }
    //     }
    //   }

    //   const onBlurField = (e) => {
    //     const value = e.target.value;
    //     setFormField(name, value);

    //   return (
    //     <div>
    //       {isError &&
    //         <div className="error-info">{ERROR_INFOS[name]}</div>
    //       }

    //         onChange={onChangeField}
    //         onBlur={onBlurField}

    //     </div>
    //   )
    //}

    const submitData = (e) => {

        e.preventDefault();

        console.log(formData);
        // TODO: request to backend, register function in src/services/launch.js
        // look for example at the end of src/services/api.js

        // `${apiUrlPrefix}/applyForm/createForm/walletId=${account}`,obj

        // const apiUrlPrefix = API_URL();
        if (projectId == -1) {
            axios.post(
                `http://localhost:3001/bsc-test/api/applyForm/createForm?walletId=${account}`, formData
            )
                .then(data => {
                    console.log(data);
                })
                .catch(e => {
                    console.log(e);
                });
            e.preventDefault();
            alert("Submit successfully!")
        }
        else {

            axios.post(
                `http://localhost:3001/bsc-test/api/applyForm/updateForm?projectId=${projectId}`, formData
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

    }

    // COMPONENTS
    const ProgressBar = () => {

        if (currentFieldIndex === 2) {
            return (
                <ul id="progressbar">
                    <li className="active" type="button" onClick={() => setCurrentFieldIndex(0)}>Project</li>
                    <li className="active" type="button" onClick={() => setCurrentFieldIndex(1)} >Token</li>
                    <li className="active" type="button" onClick={() => setCurrentFieldIndex(2)}>IDO</li>
                </ul>
            )

        }
        else if (currentFieldIndex === 1) {
            return (
                <ul id="progressbar">
                    <li className="active" type="button" onClick={() => setCurrentFieldIndex(0)}>Project</li>
                    <li className="active" type="button" onClick={() => setCurrentFieldIndex(1)} >Token</li>
                    <li type="button" onClick={() => setCurrentFieldIndex(2)}>IDO</li>
                </ul>
            )
        }
        else {
            return (
                <ul id="progressbar">
                    <li className="active" type="button" onClick={() => setCurrentFieldIndex(0)}>Project</li>
                    <li type="button" onClick={() => setCurrentFieldIndex(1)} >Token</li>
                    <li type="button" onClick={() => setCurrentFieldIndex(2)}>IDO</li>
                </ul>
            ) //style={{className: currentFieldIndex === 2 ? 'active' : 'active' }} 
        }

    }
    return (
        <div id="form-container">

            <form id="msform">
                <ProgressBar />

                <div style={{ display: currentFieldIndex === 0 ? 'block' : 'none' }}>
                    <fieldset>
                        <h2 className="fs-title">Create your account</h2>
                        <h3 className="fs-subtitle">This is step 1</h3>
                        <InputField name="username" setFormField={setFormField} originalData={receivedData.username} />
                        <InputField name="projectname" setFormField={setFormField} originalData={receivedData.projectname} />
                        <InputField name="email" setFormField={setFormField} originalData={receivedData.email} />
                        <InputField name="websiteURL" setFormField={setFormField} originalData={receivedData.websiteURL} />
                        <InputField name="logoURL" setFormField={setFormField} originalData={receivedData.logoURL} />
                        <InputField name="description" setFormField={setFormField} type="area" originalData={receivedData.description} />
                        <InputField name="category" setFormField={setFormField} originalData={receivedData.category} />
                        <InputField name="projectIn" setFormField={setFormField} originalData={receivedData.projectIn} />

                        <InputField name="whitepaperLINK" setFormField={setFormField} originalData={receivedData.whitepaperlINK} />
                        <InputField name="githubLINK" setFormField={setFormField} originalData={receivedData.githubLINK} />
                        <InputField name="telegramLINK" setFormField={setFormField} originalData={receivedData.telegramLINK} />
                        <InputField name="twitterLINK" setFormField={setFormField} originalData={receivedData.twitterLINK} />
                        <InputField name="linkedinLINK" setFormField={setFormField} originalData={receivedData.linkedinLINK} />
                        <InputField name="discordLINK" setFormField={setFormField} originalData={receivedData.discordLINK} />

                        <input type="button" name="next" className="next action-button" value="Next" onClick={() => setCurrentFieldIndex(1)} />
                    </fieldset>
                </div>

                <div style={{ display: currentFieldIndex === 1 ? 'block' : 'none' }}>
                    <fieldset>
                        <h2 className="fs-title">Social Profiles</h2>
                        <h3 className="fs-subtitle">Your presence on the social network</h3>
                        <InputField name="symbol" setFormField={setFormField} originalData={receivedData.symbol} />
                        <InputField name="address" setFormField={setFormField} originalData={receivedData.address} />
                        <InputField name="supply" setFormField={setFormField} originalData={receivedData.supply} />
                        <InputField name="ecolink" setFormField={setFormField} originalData={receivedData.ecolink} />

                        <input type="button" name="previous" className="previous action-button" value="Previous" onClick={() => setCurrentFieldIndex(0)} />
                        <input type="button" name="next" className="next action-button" value="Next" onClick={() => setCurrentFieldIndex(2)} />
                    </fieldset>
                </div>

                <div style={{ display: currentFieldIndex === 2 ? 'block' : 'none' }}>
                    <fieldset>
                        <h2 className="fs-title">Personal Details</h2>
                        <h3 className="fs-subtitle">We will never sell it</h3>
                        <InputField name="idoDate" setFormField={setFormField} originalData={receivedData.idoDate} />
                        <InputField name="start" setFormField={setFormField} originalData={receivedData.start} />
                        <InputField name="ended" setFormField={setFormField} originalData={receivedData.ended} />

                        <legeng>3.4 Vesting Rule: </legeng>
                        <InputField type="s" className="fillBlank" name="vestingStart" setFormField={setFormField} originalData={receivedData.vestingStart} />% at TGE, then linear unclock during next
                        <InputField className="fillBlank" name="vestingMonth" setFormField={setFormField} originalData={receivedData.vestingMonth} /> month on
                        <InputField className="fillBlank" name="vestingDate" setFormField={setFormField} originalData={receivedData.vestingDate} /> (day)

                        <InputField name="idoPrice" setFormField={setFormField} originalData={receivedData.idoPrice} />
                        <InputField name="raise" setFormField={setFormField} originalData={receivedData.raise} />
                        <InputField name="marketcap" setFormField={setFormField} originalData={receivedData.marketcap} />
                        <InputField name="sale" setFormField={setFormField} originalData={receivedData.sale} />

                        <input type="button" name="previous" className="previous action-button" value="Previous" onClick={() => setCurrentFieldIndex(1)} />
                        <input type="submit" name="submit" className="submit action-button" value="Submit" onClick={submitData} />
                    </fieldset>
                </div>

            </form>
        </div>

    )
}

export default ApplicationForm;