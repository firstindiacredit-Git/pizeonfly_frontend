import React, { useState, useEffect } from 'react';
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import { Link } from 'react-router-dom';
import FloatingMenu from '../../../Chats/FloatingMenu'

const Miscellaneous1 = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    
    const toolsData = [
        {
            title: "Online Screen Recorder",
            description: "Record your screen activities, tutorials, and presentations with ease",
            icon: "bi-record-circle",
            color: "rgba(220, 53, 69, 0.1)",
            iconColor: "#dc3545",
            metaIcon: "bi-display",
            link: "/online-screenrecorder"
        },
        {
            title: "Online Screenshot",
            description: "Capture screenshots instantly from any webpage",
            icon: "bi-camera",
            color: "rgba(13, 202, 240, 0.1)",
            iconColor: "#0dcaf0",
            metaIcon: "bi-camera2",
            link: "/online-screenshot"
        },
        {
            title: "Speech To Text",
            description: "Convert your voice recordings into text with high accuracy",
            icon: "bi-mic",
            color: "rgba(255, 193, 7, 0.1)",
            iconColor: "#ffc107",
            metaIcon: "bi-file-text",
            link: "/speech-to-text"
        },
        {
            title: "Text To Speech",
            description: "Transform written text into natural-sounding speech",
            icon: "bi-volume-up",
            color: "rgba(13, 110, 253, 0.1)",
            iconColor: "#0d6efd",
            metaIcon: "bi-headphones",
            link: "/text-to-speech"
        },
        {
            title: "Online Voice Recorder",
            description: "Record high-quality audio directly from your browser",
            icon: "bi-mic-fill",
            color: "rgba(25, 135, 84, 0.1)",
            iconColor: "#198754",
            metaIcon: "bi-soundwave",
            link: "/online-voice-recorder"
        },
        {
            title: "Online Webcam Test",
            description: "Test your webcam functionality and adjust settings",
            icon: "bi-camera-video",
            color: "rgba(111, 66, 193, 0.1)",
            iconColor: "#6f42c1",
            metaIcon: "bi-webcam",
            link: "/online-webcam-test"
        }
    ];

    return (
        <>
            <div id="mytask-layout" className="hover-effect">
                <style>
                    {`
                    .tool-card {
                        transition: all 0.3s ease;
                        border-left: 4px solid transparent;
                    }
                    .tool-card:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
                        border-left-color: #4169e1;
                    }
                    .tool-card:hover .card-icon {
                        transform: scale(1.1);
                        transition: transform 0.3s ease;
                    }
                    .tool-card:hover .arrow-icon {
                        transform: translateX(5px);
                        transition: transform 0.3s ease;
                    }
                    .tool-card:hover .arrow-icon i {
                        transform: scale(1.2);
                        transition: transform 0.3s ease;
                    }
                    .tool-card:hover .arrow-icon div {
                        background-color: rgba(65, 105, 225, 0.15);
                        border-color: #1e40af;
                    }
                    `}
                </style>
                <Sidebar />
                <div className="main">
                    <Header />

                    <div className="body d-flex py-lg-3 py-md-2 flex-column">
                        <div className="container-xxl">
                            {/* Header Section */}
                            <div className="row align-items-center mb-4">
                                <div className="col-12">
                                    <div className="card-header py-4 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between" style={{
                                        borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                        backgroundColor: 'transparent',
                                        padding: '0 0 20px 0'
                                    }}>
                                        <h3 className="flex-fill mb-3 mb-sm-0" style={{
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
                                            Miscellaneous Tools
                                        </h3>
                                        <div className="d-flex align-items-center">
                                            <span style={{
                                                backgroundColor: 'rgba(65, 105, 225, 0.1)',
                                                color: '#4169e1',
                                                padding: '8px 15px',
                                                borderRadius: '25px',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <i className="bi bi-tools" style={{ fontSize: '16px' }}></i>
                                                {toolsData.length} Professional Tools
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tools Grid */}
                            <div className="row g-4">
                                {toolsData.map((tool, index) => (
                                    <div key={index} className="col-12 col-md-6 col-lg-4">
                                        <div 
                                            className="card tool-card h-100" 
                                            style={{
                                                borderRadius: '15px',
                                                border: '1px solid rgba(0,0,0,0.08)',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                                overflow: 'hidden',
                                                background: 'linear-gradient(135deg, #ffffff, #f8f9fa)'
                                            }}
                                        >
                                            <div className="card-body p-4 d-flex flex-column">
                                                {/* Header with Icon */}
                                                <div className="d-flex align-items-start justify-content-between mb-3">
                                                    <div 
                                                        className="card-icon p-3 rounded-circle d-flex align-items-center justify-content-center"
                                                        style={{
                                                            backgroundColor: tool.color,
                                                            width: '60px',
                                                            height: '60px',
                                                            transition: 'transform 0.3s ease'
                                                        }}
                                                    >
                                                        <i className={`${tool.icon} fs-3`} style={{ 
                                                            color: tool.iconColor,
                                                            fontSize: '24px'
                                                        }}></i>
                                                    </div>
                                                    <div className="arrow-icon">
                                                        <div style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            backgroundColor: 'rgba(65, 105, 225, 0.1)',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            border: '2px solid #4169e1',
                                                            transition: 'all 0.3s ease'
                                                        }}>
                                                            <i className={`bi ${tool.metaIcon}`} style={{ 
                                                                color: '#4169e1',
                                                                fontSize: '18px',
                                                                transition: 'transform 0.3s ease'
                                                            }}></i>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-grow-1">
                                                    <h5 className="card-title mb-3" style={{
                                                        color: '#333',
                                                        fontWeight: '600',
                                                        fontSize: '18px',
                                                        lineHeight: '1.3'
                                                    }}>
                                                        {tool.title}
                                                    </h5>
                                                    <p className="card-text mb-4" style={{
                                                        color: '#666',
                                                        fontSize: '14px',
                                                        lineHeight: '1.5',
                                                        margin: 0
                                                    }}>
                                                        {tool.description}
                                                    </p>
                                                </div>

                                                {/* Footer with Link */}
                                                <div>
                                                    <Link 
                                                        to={tool.link}
                                                        className="btn w-100 d-flex align-items-center justify-content-center gap-2"
                                                        style={{
                                                            background: 'linear-gradient(135deg, #4169e1, #1e40af)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '10px',
                                                            padding: '12px 20px',
                                                            fontWeight: '600',
                                                            fontSize: '14px',
                                                            textDecoration: 'none',
                                                            transition: 'all 0.3s ease',
                                                            boxShadow: '0 2px 8px rgba(65, 105, 225, 0.3)'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.target.style.transform = 'translateY(-2px)';
                                                            e.target.style.boxShadow = '0 5px 15px rgba(65, 105, 225, 0.4)';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.target.style.transform = 'translateY(0)';
                                                            e.target.style.boxShadow = '0 2px 8px rgba(65, 105, 225, 0.3)';
                                                        }}
                                                    >
                                                        <span>Launch Tool</span>
                                                        <i className="bi bi-arrow-right ms-1"></i>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Empty State or Additional Info */}
                            <div className="row mt-5">
                                <div className="col-12">
                                    <div className="text-center p-4" style={{
                                        backgroundColor: 'rgba(65, 105, 225, 0.05)',
                                        borderRadius: '15px',
                                        border: '1px solid rgba(65, 105, 225, 0.1)'
                                    }}>
                                        <div className="mb-3">
                                            <i className="bi bi-lightbulb text-primary" style={{ fontSize: '48px' }}></i>
                                        </div>
                                        <h5 className="text-primary mb-2">Need Something More?</h5>
                                        <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                                            Our miscellaneous tools collection is continuously growing. 
                                            Get in touch if you need any specific functionality.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <FloatingMenu userType="admin" isMobile={isMobile} /> */}
            </div>
        </>
    );
};

export default Miscellaneous1;
