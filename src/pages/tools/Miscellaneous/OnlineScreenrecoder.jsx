import React, { useState, useRef } from 'react';
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import { Link } from 'react-router-dom';
import FloatingMenu from '../../../Chats/FloatingMenu'

const OnlineScreenrecoder = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); 
    const [recording, setRecording] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const videoRef = useRef(null);
    const [fileName, setFileName] = useState('screen-record');
    const [isRecordingIndicator, setIsRecordingIndicator] = useState(false);

    const startCapture = async () => {
        setRecording(true);
        setIsRecordingIndicator(true);
        try {
            const displayMediaOptions = {
                video: true,
                audio: true,
            };
            const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
            videoRef.current.srcObject = stream;
            videoRef.current.autoplay = true;
            videoRef.current.muted = true;

            const options = { mimeType: 'video/webm; codecs=vp8' };
            const mediaRecorder = new MediaRecorder(stream, options);

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    setRecordedChunks([event.data]);
                    const blob = new Blob([event.data], { type: 'video/webm' });
                    videoRef.current.src = URL.createObjectURL(blob);
                    videoRef.current.muted = false;
                }
            };

            stream.getVideoTracks()[0].onended = () => stopCapture();
            mediaRecorder.start();
        } catch (err) {
            console.error('Error: ', err);
            setRecording(false);
            setIsRecordingIndicator(false);
        }
    };

    const stopCapture = () => {
        setRecording(false);
        setIsRecordingIndicator(false);
        if (videoRef.current.srcObject) {
            let tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const saveRecording = () => {
        if (recordedChunks.length === 0) return;
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${fileName}.webm`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const shareRecording = () => {
        if (recordedChunks.length === 0) return;
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const file = new File([blob], `${fileName}.webm`, { type: 'video/webm' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({
                files: [file],
                title: fileName,
                text: `${fileName}.webm`,
                url: window.location.href,
            })
                .then(() => console.log('Share was successful.'))
                .catch((error) => console.error('Sharing failed', error));
        } else {
            console.error('Your system does not support sharing files.');
        }
    };

    return (
        <>
            <div id="mytask-layout">
                <style>
                    {`
                    .recording-indicator {
                        animation: pulse 1.5s ease-in-out infinite;
                    }
                    @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.5; }
                        100% { opacity: 1; }
                    }
                    .professional-card {
                        background: linear-gradient(135deg, #ffffff, #f8f9fa);
                        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                        transition: all 0.3s ease;
                    }
                    .professional-card:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 12px 35px rgba(0,0,0,0.15);
                    }
                    `}
                </style>
                <Sidebar />
                <div className="main">
                    <Header />
                    <div className="body d-flex py-lg-3 py-md-2 flex-column">
                        <div className="container-xxl">
                            {/* Header */}
                            <div className="row align-items-center mb-4">
                                <div className="col-12">
                                    <div className="card-header py-4 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between" style={{
                                        borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                        backgroundColor: 'transparent',
                                        padding: '0 0 20px 0'
                                    }}>
                                        <div className="d-flex align-items-center gap-3 mb-3 mb-sm-0">
                                            <Link to="/miscellaneous" className="text-decoration-none">
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    backgroundColor: 'rgba(65, 105, 225, 0.1)',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#4169e1',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.2)';
                                                    e.currentTarget.style.transform = 'translateX(-3px)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.1)';
                                                    e.currentTarget.style.transform = 'translateX(0)';
                                                }}
                                                >
                                                    <i className="bi bi-arrow-left fs-5"></i>
                                                </div>
                                            </Link>
                                            <h4 className="mb-0 fw-bold" style={{color: '#333'}}>Online Screen Recorder</h4>
                                        </div>
                                        {isRecordingIndicator && (
                                            <div className="d-flex align-items-center gap-2" style={{
                                                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                                                padding: '8px 15px',
                                                borderRadius: '25px',
                                                color: '#dc3545',
                                                fontSize: '14px',
                                                fontWeight: '600'
                                            }}>
                                                <div className="recording-indicator" style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    backgroundColor: '#dc3545',
                                                    borderRadius: '50%',
                                                    marginRight: '8px'
                                                }}></div>
                                                Recording...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="row justify-content-center">
                                <div className="col-12 col-lg-10">
                                    <div className="card professional-card" style={{
                                        borderRadius: '20px',
                                        border: 'none',
                                        overflow: 'hidden'
                                    }}>
                                        <div className="card-body p-4">
                                            {/* Record Controls */}
                                            <div className="text-center mb-4">
                                                <button
                                                    type="button"
                                                    className={`btn btn-lg ${recording ? 'btn-danger' : 'btn-primary'}`}
                                                    onClick={recording ? stopCapture : startCapture}
                                                    style={{
                                                        borderRadius: '50px',
                                                        padding: '15px 40px',
                                                        fontWeight: '600',
                                                        fontSize: '18px',
                                                        boxShadow: recording ? '0 4px 15px rgba(220, 53, 69, 0.3)' : '0 4px 15px rgba(65, 105, 225, 0.3)',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        const color = recording ? 'rgba(220, 53, 69, 0.2)' : 'rgba(65, 105, 225, 0.2)';
                                                        e.currentTarget.style.backgroundColor = recording ? '#b02a37' : '#3346d6';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.backgroundColor = recording ? '#dc3545' : '#0d6efd';
                                                    }}
                                                >
                                                    {recording ? (
                                                        <>
                                                            <i className="bi bi-stop-fill me-2"></i>
                                                            Stop Recording
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-record-circle me-2"></i>
                                                            Start Recording
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            {/* Video Section */}
                                            <div className="text-center mb-4">
                                                <video
                                                    ref={videoRef}
                                                    className="rounded"
                                                    style={{ 
                                                        width: "100%", 
                                                        maxWidth: "800px", 
                                                        height: "auto",
                                                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                                        borderRadius: '15px'
                                                    }}
                                                    controls
                                                    autoPlay
                                                ></video>
                                            </div>

                                            {/* File Settings */}
                                            <div className="row g-3 mb-4">
                                                <div className="col-12 col-md-6">
                                                    <label htmlFor="filename" className="form-label fw-bold" style={{color: '#555'}}>
                                                        <i className="bi bi-file-earmark-text me-2"></i>
                                                        File Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="filename"
                                                        className="form-control"
                                                        placeholder="Enter file name"
                                                        value={fileName}
                                                        onChange={(e) => setFileName(e.target.value)}
                                                        style={{
                                                            borderRadius: '10px',
                                                            border: '1px solid rgba(65, 105, 225, 0.3)',
                                                            padding: '12px 15px',
                                                            fontSize: '14px'
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-12 col-md-6">
                                                    <label className="form-label fw-bold" style={{color: '#555'}}>
                                                        <i className="bi bi-file-earmark-check me-2"></i>
                                                        Output Format
                                                    </label>
                                                    <div className="input-group">
                                                        <span className="input-group-text" style={{
                                                            border: '1px solid rgba(65, 105, 225, 0.3)',
                                                            borderRight: 'none',
                                                            borderRadius: '10px 0 0 10px',
                                                            backgroundColor: 'rgba(65, 105, 225, 0.05)'
                                                        }}>WebM</span>
                                                        <input type="text" className="form-control" value=".webm" disabled style={{
                                                            border: '1px solid rgba(65, 105, 225, 0.3)',
                                                            borderRadius: '0 10px 10px 0',
                                                            backgroundColor: '#f8f9fa'
                                                        }} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="d-flex gap-3 justify-content-center flex-wrap">
                                                <button 
                                                    type="button" 
                                                    className="btn btn-success btn-lg" 
                                                    onClick={saveRecording}
                                                    disabled={recordedChunks.length === 0}
                                                    style={{
                                                        borderRadius: '50px',
                                                        padding: '12px 30px',
                                                        fontWeight: '600',
                                                        fontSize: '16px',
                                                        background: 'linear-gradient(135deg, #28a745, #20c997)',
                                                        border: 'none',
                                                        boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
                                                    }}
                                                >
                                                    <i className="bi bi-download me-2"></i>
                                                    Save Recording
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-info btn-lg" 
                                                    onClick={shareRecording}
                                                    disabled={recordedChunks.length === 0}
                                                    style={{
                                                        borderRadius: '50px',
                                                        padding: '12px 30px',
                                                        fontWeight: '600',
                                                        fontSize: '16px',
                                                        background: 'linear-gradient(135deg, #17a2b8, #6f42c1)',
                                                        border: 'none',
                                                        boxShadow: '0 4px 15px rgba(23, 162, 184, 0.3)',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(23, 162, 184, 0.4)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(23, 162, 184, 0.3)';
                                                    }}
                                                >
                                                    <i className="bi bi-share me-2"></i>
                                                    Share Recording
                                                </button>
                                            </div>
                                        </div>
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

export default OnlineScreenrecoder;
