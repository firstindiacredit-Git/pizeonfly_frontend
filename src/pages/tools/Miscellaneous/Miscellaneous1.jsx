import React, { useState, useEffect } from 'react';
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import { Link } from 'react-router-dom';
// import axios from 'axios';

const Miscellaneous1 = () => {
    return (
        <>
            <div id="mytask-layout">
                <Sidebar />
                <div className="main px-lg-4 px-md-4">
                    <Header />

                    <div className="body d-flex py-lg-3 py-md-2 flex-column">
                        <h4 className="mb-0 fw-bold">Miscellaneous Tools</h4>

                        <div className="mt-5 card p-5 ">
                            <ul className="">
                                <li className="mb-3 ms-link">
                                    <Link to="/online-screenrecorder">
                                        <h5>▪ Online Screen Recorder</h5>
                                    </Link>
                                </li>
                                <li className="mb-3">
                                    <Link to="/online-screenshot">
                                        <h5>▪ Online Screenshot</h5>
                                    </Link>
                                </li>
                                <li className="mb-3">
                                    <Link to="/speech-to-text">
                                        <h5>▪ Speech To Text</h5>
                                    </Link>
                                </li>
                                <li className="mb-3">
                                    <Link to="/text-to-speech">
                                        <h5>▪ Text To Speech</h5>
                                    </Link>
                                </li>
                                <li className="mb-3">
                                    <Link to="/online-voice-recorder">
                                        <h5>▪ Online Voice Recorder</h5>
                                    </Link>
                                </li>
                                <li className="mb-3">
                                    <Link to="/online-webcam-test">
                                        <h5>▪ Online Webcam Test</h5>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Miscellaneous1;
