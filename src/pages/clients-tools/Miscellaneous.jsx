import React, { useState, useEffect } from 'react';
import Sidebar from "../../clientCompt/ClientSidebar";
import Header from "../../clientCompt/ClientHeader";
// import axios from 'axios';

const Miscellaneous = () => {
    return (
        <>
            <div id="mytask-layout">
                <Sidebar />
                <div className="main px-lg-4 px-md-4">
                    <Header />

                    <div className="body d-flex py-lg-3 py-md-2 flex-column">
                        <h4 className="mb-0 fw-bold">Miscellaneous Tools</h4>

                        <div className="flex-grow-1 mt-3" style={{ minHeight: "80vh", overflow: "hidden" }}>
                            <iframe
                                src="https://tools-collection-sigma.vercel.app/"
                                style={{
                                    width: "100%",
                                    height: "75vh",
                                    border: "none",
                                    position: "relative",
                                }}
                                title="Miscellaneous Tools"
                                allow="camera 'none'; microphone 'none'; display-capture 'none'"
                            />

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Miscellaneous;
