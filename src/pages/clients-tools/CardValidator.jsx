import React, { useState, useEffect } from 'react';
import Sidebar from "../../clientCompt/ClientSidebar";
import Header from "../../clientCompt/ClientHeader";
// import axios from 'axios';

const CardValidator = () => {
    return (
        <>
            <div id="mytask-layout">
                <Sidebar />
                <div className="main">
                    <Header />

                    <div className="body d-flex py-lg-3 py-md-2 flex-column">
                        {/* <h4 className="mb-0 fw-bold">Card Validator</h4> */}
                        
                        <div className="flex-grow-1 mt-3" style={{ minHeight: "80vh", overflow: "hidden" }}>
                            <iframe 
                                src="https://cardvalidator.vercel.app/"
                                style={{
                                    width: "100%",
                                    height: "78vh",
                                    border: "none",
                                    position: "relative",
                                    top: "",
                                }}
                                title="Card Validator"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CardValidator;
