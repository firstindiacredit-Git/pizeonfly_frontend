import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import FloatingMenu from '../../Chats/FloatingMenu'
// import axios from 'axios';

const SaasManager = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    return (
        <>
            <div id="mytask-layout">
                <Sidebar />
                <div className="main">
                    <Header />

                    <div className="body d-flex py-lg-3 py-md-2 flex-column">
                        <div className="border-bottom" style={{ marginLeft: "20px" }}>
                            <h3 className="flex-fill mb-3" style={{
                                fontWeight: '700',
                                color: '#333',
                                fontSize: '24px',
                                position: 'relative',
                                paddingLeft: '15px'
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    left: '0',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '5px',
                                    height: '24px',
                                    background: 'linear-gradient(to bottom, #4169e1, #1e40af)',
                                    borderRadius: '3px'
                                }}></span>
                                Saas Manager
                            </h3>
                        </div>

                        <div className="flex-grow-1 mt-3" style={{ minHeight: "80vh", overflow: "hidden" }}>
                            <iframe
                                src="https://pizeonflytools.vercel.app/"
                                style={{
                                    width: "100%",
                                    height: "82vh",
                                    border: "none",
                                    position: "relative",
                                    top: "-4.5rem",
                                }}
                                title="Saas Management Tool"
                            />
                        </div>
                    </div>
                </div>
                {/* <FloatingMenu userType="admin" isMobile={isMobile} /> */}
            </div>
        </>
    );
};

export default SaasManager;
