import React, { useState, useEffect } from 'react';
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import { Link } from 'react-router-dom';
import FloatingMenu from '../../../Chats/FloatingMenu'
// import axios from 'axios';

const Miscellaneous1 = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    return (
        <>
            <div id="mytask-layout" className="hover-effect">
                <style>
                    {`
                    .ms-link:hover .bi-arrow-right {
                        transform: translateX(5px);
                        transition: transform 0.2s ease-in-out;
                    }
                    `}
                </style>
                <Sidebar />
                <div className="main px-lg-4 px-md-4">
                    <Header />

                    <div className="body d-flex py-lg-3 py-md-2 flex-column">
                        <h4 className="mb-0 fw-bold">Miscellaneous Tools</h4>

                        <div className="mt-5 card p-5 ">
                            <ul className="">
                                <li className="mb-3 ms-link">
                                    <Link to="/online-screenrecorder" className='d-flex align-items-center gap-2'>
                                        <h5>▪ Online Screen Recorder</h5>
                                        <i className="bi bi-arrow-right fs-5"/>
                                    </Link>
                                </li>
                                <li className="mb-3 ms-link">
                                    <Link to="/online-screenshot" className='d-flex align-items-center gap-2'>
                                        <h5>▪ Online Screenshot</h5>
                                        <i className="bi bi-arrow-right fs-5"/>
                                    </Link>
                                </li>
                                <li className="mb-3 ms-link">
                                    <Link to="/speech-to-text" className='d-flex align-items-center gap-2'>
                                        <h5>▪ Speech To Text</h5>
                                        <i className="bi bi-arrow-right fs-5"/>
                                    </Link>
                                </li>
                                <li className="mb-3 ms-link">
                                        <Link to="/text-to-speech" className='d-flex align-items-center gap-2'>
                                        <h5>▪ Text To Speech</h5>
                                        <i className="bi bi-arrow-right fs-5"/>
                                    </Link>
                                </li>
                                <li className="mb-3 ms-link">
                                    <Link to="/online-voice-recorder" className='d-flex align-items-center gap-2'>
                                        <h5>▪ Online Voice Recorder</h5>
                                        <i className="bi bi-arrow-right fs-5"/>
                                    </Link>
                                </li>
                                <li className="mb-3 ms-link">
                                    <Link to="/online-webcam-test" className='d-flex align-items-center gap-2'>
                                        <h5>▪ Online Webcam Test</h5>
                                        <i className="bi bi-arrow-right fs-5"/>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <FloatingMenu userType="admin" isMobile={isMobile} />
            </div>
        </>
    );
};

export default Miscellaneous1;
