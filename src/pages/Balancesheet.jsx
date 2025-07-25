import React, { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import FloatingMenu from '../Chats/FloatingMenu'

// import axios from 'axios';

const Balancesheet = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    return (
        <>
            <div id="mytask-layout">
                <Sidebar />
                <div className="main px-lg-4 px-md-4">
                    <Header />

                    <div className="body d-flex py-lg-3 py-md-2 flex-column">
                        <h4 className="mb-0 fw-bold">Balance Sheet</h4>
                        
                        <div className="flex-grow-1 mt-3" style={{ minHeight: "80vh", overflow: "hidden" }}>
                            <iframe 
                                src="https://pizoenfly-balance.vercel.app/login"
                                style={{
                                    width: "100%",
                                    height: "82vh",
                                    border: "none",
                                    position: "relative",
                                    // top: "",
                                }}
                                title="Google Map Balancesheet"
                            />
                        </div>
                    </div>
                </div>
                <FloatingMenu userType="admin" isMobile={isMobile} />
            </div>
        </>
    );
};

export default Balancesheet;
