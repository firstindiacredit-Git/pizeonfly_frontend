import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
// import axios from 'axios';

const SaasManager = () => {
    return (
        <>
            <div id="mytask-layout">
                <Sidebar />
                <div className="main px-lg-4 px-md-4">
                    <Header />

                    <div className="body d-flex py-lg-3 py-md-2 flex-column">
                        <h4 className="mb-0 fw-bold">Saas Manager</h4>
                        
                        <div className="flex-grow-1 mt-3" style={{ minHeight: "80vh", overflow: "hidden" }}>
                            <iframe 
                                src="https://pizeonflytools.vercel.app/"
                                style={{
                                    width: "100%",
                                    height: "90vh",
                                    border: "none",
                                    position: "relative",
                                    top: "-55px",
                                }}
                                title="Saas Management Tool"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SaasManager;
