import React from 'react';
import '../css/ProjectsCard.css';
import { useState, useEffect } from 'react';
import $ from 'jquery';
import ProjectsCard from './ProjectsCard.js';
import ExpandedContent from './ExpandedContent.js';

const PendingProjects = ({ data }) => {

    // const [isActiveUpcoming, setIsActiveUpcoming] = useState(false);
    // const [isIncomingExpanded, setisIncomingExpanded] = useState(false);

    // const [manyDataIncoming, setManyDataIncoming] = useState(data.length > 3);

    return (
        <div>
            <div
                className="expanding-card"
                style={{
                    zIndex: 1,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '20px',
                    justifyContent: 'center',
                }}
            >
                {data &&
                    data.map(obj => (
                        <div className="cards">
                            <div className=" card [ is-collapsed ]">
                                <div
                                    className="card__inner [ js-expander ]"
                                // onClick={() => setisIncomingExpanded(!isIncomingExpanded)}
                                >
                                    <div className="">
                                        <ProjectsCard
                                            //_id = projectId
                                            //form.start=saleStart
                                            //form.ended=salesEnd
                                            //form.raise=totalRaise
                                            //form.sale=totalSale
                                            //form.symbol = projectToken
                                            //form.idoPrice = tokenPrice???
                                            //form.projectname=projectName
                                            //form.logoURL = projectTokenUrl
                                            projectID={obj._id}
                                            start={obj.form.start}
                                            ddl={obj.form.ended}
                                            raise={obj.form.raise + ' USDT'}
                                            sales={obj.form.sale + ' ' + obj.form.symbol}
                                            rate={'1 ' + obj.form.symbol + ' = ' + obj.form.idoPrice + ' USDT'}
                                            title={obj.form.projectname}
                                            isPending={true}
                                            tokenLogoUrl={obj.form.logoURL}
                                        //openProject={openProject}
                                        />
                                    </div>
                                    {/* <i className="fa fa-folder-o" /> */}
                                </div>
                                <div className="card__expander">
                                    <i className="fa fa-close [ js-collapser ]" />
                                    <ExpandedContent />
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default PendingProjects;
