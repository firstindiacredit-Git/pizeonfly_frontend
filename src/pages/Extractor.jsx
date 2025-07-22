import React, { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import FloatingMenu from '../Chats/FloatingMenu'

// import axios from 'axios';

const Extractor = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    return (
        <>
            <div id="mytask-layout">
                <Sidebar />
                <div className="main px-lg-4 px-md-4">
                    <Header />

                    <div className="body d-flex py-lg-3 py-md-2 flex-column">
                        <h4 className="mb-0 fw-bold">Google Map Extractor</h4>
                        
                        <div className="flex-grow-1 mt-3" style={{ minHeight: "80vh", overflow: "hidden" }}>
                            <iframe 
                                src="http://45.61.57.93:5000/login"
                                style={{
                                    width: "100%",
                                    height: "82vh",
                                    border: "none",
                                    position: "relative",
                                    // top: "-4.5rem",
                                }}
                                title="Google Map Extractor"
                            />
                        </div>
                    </div>
                </div>
                <FloatingMenu userType="admin" isMobile={isMobile} />
            </div>
        </>
    );
};

export default Extractor;
