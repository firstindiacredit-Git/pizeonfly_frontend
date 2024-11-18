import React, { useState, useRef } from 'react';
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import { Link } from 'react-router-dom';

const OnlineWebcamTest = () => {

    return (
        <>
            <div id="mytask-layout">
                <Sidebar />
                <div className="main px-lg-4 px-md-4">
                    <Header />
                    <div className="body d-flex py-lg-3 py-md-2 flex-column">
                        <div className="d-flex align-items-center gap-3">
                            <Link to="/miscellaneous1" >
                                <i className="bi bi-arrow-left fs-4" />
                            </Link>
                            <h4 className="mb-0 fw-bold">Online Webcam Test</h4>
                        </div>
                       
                    </div>
                </div>
            </div>
        </>
    );
};
export default OnlineWebcamTest;
