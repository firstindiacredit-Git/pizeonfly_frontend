import React, { useState, useEffect } from 'react';
import Sidebar from "../../clientCompt/ClientSidebar";
import Header from "../../clientCompt/ClientHeader";
// import axios from 'axios';

const HtmlTemplateGenerator = () => {
    return (
        <>
            <div id="mytask-layout">
                <Sidebar />
                <div className="main px-lg-4 px-md-4">
                    <Header />

                    <div className="body d-flex py-lg-3 py-md-2 flex-column">
                        <h4 className="mb-0 fw-bold">HTML Template Generator</h4>
                        
                        <div className="flex-grow-1 mt-3" style={{ minHeight: "80vh", overflow: "hidden" }}>
                            <iframe 
                                src="https://html-template-generator.vercel.app/"
                                style={{
                                    width: "200%",
                                    height: "120vh",
                                    border: "none",
                                    position: "relative",
                                    transform: "scale(0.6)",
                                    transformOrigin: "0 0",
                                }}
                                title="HTML Template Generator"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HtmlTemplateGenerator;
