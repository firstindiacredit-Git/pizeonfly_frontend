import React, { useState, useEffect, useRef } from 'react';
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header"
import { Link } from 'react-router-dom';
import FloatingMenu from '../../../Chats/FloatingMenu'
const OnlineScreenshot = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isCaptured, setIsCaptured] = useState(false);
    const [dataAvailableCount, setDataAvailableCount] = useState(0);
    const videoElem = useRef(null);
    const canvasElem = useRef(null);
    const mediaRecorder = useRef(null);
    const recordedChunks = useRef([]);
    const fCanvas = useRef(null);
    const [showBrowserWarning, setShowBrowserWarning] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState('png');
    const [shareError, setShareError] = useState('');
    const [fileName, setFileName] = useState('screenshot');

    useEffect(() => {
        checkBrowser();
    }, []);

    const checkBrowser = () => {
        if (
            typeof navigator.mediaDevices !== 'object' ||
            typeof navigator.mediaDevices.getDisplayMedia !== 'function'
        ) {
            setShowBrowserWarning(true);
        }
    };

    const startCapture = async () => {
        try {
            const displayMediaOptions = {
                video: {
                    width: { ideal: 1020 },
                    height: { ideal: 600 },
                },
                audio: false,
            };
            const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
            videoElem.current.srcObject = stream;
            videoElem.current.play();
            videoElem.current.muted = true;

            mediaRecorder.current = new MediaRecorder(stream, {
                mimeType: 'video/webm; codecs=vp8',
            });

            mediaRecorder.current.ondataavailable = handleDataAvailable;
            mediaRecorder.current.start(100);

            stream.getVideoTracks()[0].onended = stopCapture;
        } catch (err) {
            console.error('Error starting capture:', err);
        }
    };

    const handleDataAvailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.current.push(event.data);
            setDataAvailableCount((prev) => prev + 1);

            if (dataAvailableCount === 1) {
                stopCapture();
            } else if (dataAvailableCount === 2) {
                const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
                videoElem.current.src = URL.createObjectURL(blob);
                videoElem.current.autoplay = false;
                videoElem.current.muted = true;
            }
        } else {
            console.log('Empty data received:', event.data);
        }
    };

    const stopCapture = () => {
        if (videoElem.current.srcObject) {
            videoElem.current.srcObject.getTracks().forEach((track) => track.stop());
            videoElem.current.srcObject = null;
        }
    };

    const onCanPlay = () => {
        if (document.hidden) {
            document.addEventListener(
                'visibilitychange',
                () => {
                    if (!document.hidden) {
                        setTimeout(setCanvas, 500);
                    }
                },
                { once: true }
            );
        } else {
            setTimeout(setCanvas, 500);
        }
    };

    const setCanvas = () => {
        const ctx = canvasElem.current.getContext('2d');
        canvasElem.current.width = videoElem.current.videoWidth;
        canvasElem.current.height = videoElem.current.videoHeight;
        ctx.drawImage(videoElem.current, 0, 0);
        setIsCaptured(true);
        videoElem.current.style.display = 'none';
        canvasElem.current.style.display = 'block';
        // Initialize any additional canvas or fabric.js logic here.
    };

    const saveScreenshot = () => {
        if (!canvasElem.current) return;
        
        const link = document.createElement('a');
        const imageData = canvasElem.current.toDataURL(`image/${selectedFormat}`);
        
        link.download = `${fileName}.${selectedFormat}`;
        link.href = imageData;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const shareScreenshot = async () => {
        if (!canvasElem.current) return;
        
        try {
            const blob = await new Promise(resolve => {
                canvasElem.current.toBlob(resolve, `image/${selectedFormat}`);
            });
            
            const file = new File([blob], `${fileName}.${selectedFormat}`, { 
                type: `image/${selectedFormat}` 
            });

            if (navigator.share) {
                await navigator.share({
                    files: [file],
                    title: fileName,
                    text: `Check out this screenshot: ${fileName}`
                });
            } else {
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({
                            [file.type]: blob
                        })
                    ]);
                    alert('Screenshot copied to clipboard!');
                } catch (err) {
                    setShareError('Sharing not supported on this device/browser');
                }
            }
        } catch (err) {
            console.error('Error sharing:', err);
            setShareError('Failed to share screenshot');
        }
    };

    return (
        <>
            <div id="mytask-layout">
                <style>
                    {`
                    .professional-card {
                        background: linear-gradient(135deg, #ffffff, #f8f9fa);
                        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                        transition: all 0.3s ease;
                    }
                    .professional-card:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 12px 35px rgba(0,0,0,0.15);
                    }
                    .capture-container {
                        border: 2px dashed rgba(65, 105, 225, 0.3);
                        border-radius: 15px;
                        transition: all 0.3s ease;
                    }
                    .capture-container:hover {
                        border-color: rgba(65, 105, 225, 0.6);
                        background-color: rgba(65, 105, 225, 0.02);
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
                                            <h4 className="mb-0 fw-bold" style={{color: '#333'}}>Online Screenshot</h4>
                                        </div>
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
                                            {/* Browser Warning */}
                                            {showBrowserWarning && (
                                                <div className="alert alert-warning alert-dismissible fade show mb-4" role="alert" style={{
                                                    borderRadius: '15px',
                                                    border: 'none',
                                                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                                                    borderLeft: '4px solid #ffc107'
                                                }}>
                                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                                    Your browser does not support screen recording. Please use the latest version of Chrome, Firefox, or Safari desktop browser!
                                                    <button type="button" className="btn-close" onClick={() => setShowBrowserWarning(false)}></button>
                                                </div>
                                            )}

                                            {/* Screenshot Controls */}
                                            <div className="text-center mb-4">
                                                <button 
                                                    type="button" 
                                                    className="btn btn-lg btn-primary"
                                                    onClick={startCapture}
                                                    style={{
                                                        borderRadius: '50px',
                                                        padding: '15px 40px',
                                                        fontWeight: '600',
                                                        fontSize: '18px',
                                                        background: 'linear-gradient(135deg, #0d6efd, #4169e1)',
                                                        border: 'none',
                                                        boxShadow: '0 4px 15px rgba(13, 110, 253, 0.3)',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(13, 110, 253, 0.4)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(13, 110, 253, 0.3)';
                                                    }}
                                                >
                                                    <i className="bi bi-camera me-2"></i> 
                                                    Capture Screenshot
                                                </button>
                                            </div>

                                            {/* Video Container */}
                                            <div className="capture-container p-3 mb-4">
                                                <video 
                                                    id="video" 
                                                    controls 
                                                    ref={videoElem} 
                                                    onCanPlay={onCanPlay}
                                                    style={{
                                                        width: '100%',
                                                        borderRadius: '10px',
                                                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                                    }}
                                                ></video>
                                                
                                                {/* Canvas for Screenshot */}
                                                <div id="viewdiv">
                                                    <canvas 
                                                        id="canvas" 
                                                        ref={canvasElem} 
                                                        style={{ 
                                                            display: isCaptured ? 'block' : 'none',
                                                            width: '100%',
                                                            borderRadius: '10px',
                                                            boxShadow: isCaptured ? '0 4px 15px rgba(0,0,0,0.1)' : 'none'
                                                        }}
                                                    ></canvas>
                                                </div>
                                            </div>

                                            {/* Screenshot Options */}
                                            {isCaptured && (
                                                <div className="mt-4 p-4" style={{
                                                    backgroundColor: 'rgba(65, 105, 225, 0.05)',
                                                    borderRadius: '15px',
                                                    border: '1px solid rgba(65, 105, 225, 0.1)'
                                                }}>
                                                    {shareError && (
                                                        <div className="alert alert-danger d-flex align-items-center mb-3" style={{
                                                            borderRadius: '10px',
                                                            backgroundColor: 'rgba(220, 53, 69, 0.1)',
                                                            borderLeft: '4px solid #dc3545'
                                                        }}>
                                                            <i className="bi bi-exclamation-circle-fill me-2"></i>
                                                            {shareError}
                                                            <button 
                                                                type="button" 
                                                                className="btn-close ms-auto" 
                                                                onClick={() => setShareError('')}
                                                            ></button>
                                                        </div>
                                                    )}
                                                    
                                                    <h5 className="mb-3 fw-bold" style={{color: '#333'}}>
                                                        <i className="bi bi-gear me-2"></i> 
                                                        Screenshot Settings
                                                    </h5>
                                                    
                                                    <div className="row g-3 mb-4">
                                                        <div className="col-12 col-md-6">
                                                            <label className="form-label fw-bold" style={{color: '#555'}}>
                                                                <i className="bi bi-file-earmark-text me-2"></i>
                                                                File Name
                                                            </label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Enter file name"
                                                                value={fileName}
                                                                onChange={(e) => setFileName(e.target.value)}
                                                                style={{
                                                                    borderRadius: '10px',
                                                                    border: '1px solid rgba(65, 105, 225, 0.3)',
                                                                    padding: '12px 15px'
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="col-12 col-md-6">
                                                            <label className="form-label fw-bold" style={{color: '#555'}}>
                                                                <i className="bi bi-image me-2"></i>
                                                                Image Format
                                                            </label>
                                                            <select 
                                                                className="form-select" 
                                                                value={selectedFormat} 
                                                                onChange={(e) => setSelectedFormat(e.target.value)}
                                                                style={{
                                                                    borderRadius: '10px',
                                                                    border: '1px solid rgba(65, 105, 225, 0.3)',
                                                                    padding: '12px 15px'
                                                                }}
                                                            >
                                                                <option value="png">PNG (High Quality)</option>
                                                                <option value="jpeg">JPEG (Compressed)</option>
                                                                <option value="webp">WebP (Modern)</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="d-flex gap-3 justify-content-center flex-wrap">
                                                        <button 
                                                            type="button" 
                                                            className="btn btn-success btn-lg" 
                                                            onClick={saveScreenshot}
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
                                                            Save Screenshot
                                                        </button>
                                                        
                                                        <button 
                                                            type="button" 
                                                            className="btn btn-info btn-lg" 
                                                            onClick={shareScreenshot}
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
                                                            Share Screenshot
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
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

export default OnlineScreenshot;