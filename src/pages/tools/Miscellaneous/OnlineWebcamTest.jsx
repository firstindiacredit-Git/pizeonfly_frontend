import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar';
import Header from '../../../components/Header';
import FloatingMenu from '../../../Chats/FloatingMenu'

const OnlineWebcamTest = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [videoTracks, setVideoTracks] = useState(null);
    const [audioTracks, setAudioTracks] = useState(null);
    const [alertVisible, setAlertVisible] = useState(false);
    const [selectedCameraIndex, setSelectedCameraIndex] = useState(0);
    const [selectedMicIndex, setSelectedMicIndex] = useState(0);
    const [cameraOptions, setCameraOptions] = useState([]);
    const [micOptions, setMicOptions] = useState([]);
    const videoRef = useRef(null);
    const imageRef = useRef(null);
    const micCanvasRef = useRef(null);
    const [cameraSettings, setCameraSettings] = useState({
        name: '',
        resolution: '',
        width: '',
        height: '',
        aspectRatio: '',
        brightness: '',
        contrast: '',
        facingMode: '',
        frameRate: '',
        saturation: '',
        sharpness: ''
    });
    const [micSettings, setMicSettings] = useState({
        name: '',
        autoGainControl: '',
        channels: '',
        echoCancellation: '',
        latency: '',
        noiseSuppression: '',
        sampleRate: '',
        sampleSize: ''
    });

    useEffect(() => {
        initPolyfill();
        initDeviceSelection();
    }, []);

    const initPolyfill = () => {
        if (navigator.mediaDevices === undefined) {
            navigator.mediaDevices = {};
        }
        if (navigator.mediaDevices.getUserMedia === undefined) {
            navigator.mediaDevices.getUserMedia = function (constraints) {
                const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
                if (!getUserMedia) {
                    return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
                }
                return new Promise((resolve, reject) => {
                    getUserMedia.call(navigator, constraints, resolve, reject);
                });
            };
        }
    };

    const initDeviceSelection = () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            console.log('enumerateDevices() not supported.');
            return;
        }

        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const cams = [];
                const mics = [];
                let camIndex = 0;
                let micIndex = 0;

                devices.forEach(device => {
                    if (device.kind === 'videoinput') {
                        cams.push(`Camera #${++camIndex}`);
                    } else if (device.kind === 'audioinput') {
                        mics.push(`Microphone #${++micIndex}`);
                    }
                });

                setCameraOptions(cams);
                setMicOptions(mics);
            })
            .catch(err => {
                console.log(err.name + ': ' + err.message);
            });
    };

    const initVideo = () => {
        stopVideo();

        const constraints = {
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            },
            video: {
                width: { ideal: 1000 },
                height: { ideal: 500 },
                facingMode: "user"
            }
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                const videoTrackList = stream.getVideoTracks();
                const audioTrackList = stream.getAudioTracks();

                setVideoTracks(videoTrackList);
                setAudioTracks(audioTrackList);
                
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play()
                        .then(() => {
                            // Wait a brief moment for the stream to initialize
                            setTimeout(() => {
                                if (videoTrackList && videoTrackList.length > 0) {
                                    const videoTrack = videoTrackList[0];
                                    const settings = videoTrack.getSettings();
                                    console.log('Video Settings:', settings); // For debugging
                                    
                                    setCameraSettings({
                                        name: videoTrack.label || 'Unknown',
                                        resolution: `${settings.width || 0}x${settings.height || 0}`,
                                        width: settings.width || 'N/A',
                                        height: settings.height || 'N/A',
                                        aspectRatio: settings.aspectRatio || 'N/A',
                                        brightness: settings.brightness || 'N/A',
                                        contrast: settings.contrast || 'N/A',
                                        facingMode: settings.facingMode || 'N/A',
                                        frameRate: Math.round(settings.frameRate) || 'N/A',
                                        saturation: settings.saturation || 'N/A',
                                        sharpness: settings.sharpness || 'N/A'
                                    });
                                }

                                if (audioTrackList && audioTrackList.length > 0) {
                                    const audioTrack = audioTrackList[0];
                                    const settings = audioTrack.getSettings();
                                    console.log('Audio Settings:', settings); // For debugging
                                    
                                    setMicSettings({
                                        name: audioTrack.label || 'Unknown',
                                        autoGainControl: settings.autoGainControl ? 'Yes' : 'No',
                                        channels: settings.channelCount || 'N/A',
                                        echoCancellation: settings.echoCancellation ? 'Yes' : 'No',
                                        latency: settings.latency || 'N/A',
                                        noiseSuppression: settings.noiseSuppression ? 'Yes' : 'No',
                                        sampleRate: settings.sampleRate || 'N/A',
                                        sampleSize: settings.sampleSize || 'N/A'
                                    });
                                }
                            }, 500);
                        });
                }
            })
            .catch(err => {
                console.error('Error accessing media devices:', err);
                setAlertVisible(true);
            });
    };

    const stopVideo = () => {
        if (videoTracks) {
            videoTracks.forEach(track => track.stop());
        }
    };

    const getImage = () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        imageRef.current.src = canvas.toDataURL('image/png');
    };

    const downloadImage = () => {
        const link = document.createElement('a');
        link.download = 'captured-image.png';
        link.href = imageRef.current.src;
        link.click();
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
                                            <h4 className="mb-0 fw-bold" style={{color: '#333'}}>Online Webcam Test</h4>
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
                                            {/* Device Selection */}
                                            <div className="row g-4 mb-4">
                                                <div className="col-12 col-md-6">
                                                    <div className="p-4" style={{
                                                        backgroundColor: 'rgba(65, 105, 225, 0.05)',
                                                        borderRadius: '15px',
                                                        border: '1px solid rgba(65, 105, 225, 0.1)'
                                                    }}>
                                                        <label htmlFor="camsel" className="form-label fw-bold mb-3" style={{color: '#333'}}>
                                                            <i className="bi bi-camera-video me-2"></i>
                                                            Select Camera
                                                        </label>
                                                        <select
                                                            id="camsel"
                                                            title="Camera select"
                                                            className="form-select"
                                                            onChange={e => setSelectedCameraIndex(e.target.selectedIndex)}
                                                            style={{
                                                                borderRadius: '10px',
                                                                border: '1px solid rgba(65, 105, 225, 0.3)',
                                                                padding: '12px 15px'
                                                            }}
                                                        >
                                                            {cameraOptions.map((cam, index) => (
                                                                <option key={index} value={index}>{cam}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-md-6">
                                                    <div className="p-4" style={{
                                                        backgroundColor: 'rgba(65, 105, 225, 0.05)',
                                                        borderRadius: '15px',
                                                        border: '1px solid rgba(65, 105, 225, 0.1)'
                                                    }}>
                                                        <label htmlFor="micsel" className="form-label fw-bold mb-3" style={{color: '#333'}}>
                                                            <i className="bi bi-mic me-2"></i>
                                                            Select Microphone
                                                        </label>
                                                        <select
                                                            id="micsel"
                                                            title="Microphone select"
                                                            className="form-select"
                                                            onChange={e => setSelectedMicIndex(e.target.selectedIndex)}
                                                            style={{
                                                                borderRadius: '10px',
                                                                border: '1px solid rgba(65, 105, 225, 0.3)',
                                                                padding: '12px 15px'
                                                            }}
                                                        >
                                                            {micOptions.map((mic, index) => (
                                                                <option key={index} value={index}>{mic}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Test Button */}
                                            <div className="text-center mb-4">
                                                <button 
                                                    type="button" 
                                                    className="btn btn-primary btn-lg"
                                                    onClick={initVideo}
                                                    style={{
                                                        borderRadius: '50px',
                                                        padding: '12px 30px',
                                                        fontWeight: '600',
                                                        fontSize: '16px',
                                                        background: 'linear-gradient(135deg, #0d6efd, #4169e1)',
                                                        border: 'none',
                                                        boxShadow: '0 4px 15px rgba(13, 110, 253, 0.3)',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(13, 110, 253, 0.4)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(13, 110, 253, 0.3)';
                                                    }}
                                                >
                                                    <i className="bi bi-webcam me-2"></i>
                                                    Test Webcam
                                                </button>
                                            </div>

                                            {/* Permission Alert */}
                                            {alertVisible && (
                                                <div className="alert alert-warning mb-4" role="alert" style={{
                                                    borderRadius: '15px',
                                                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                                                    borderLeft: '4px solid #ffc107'
                                                }}>
                                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                                    Camera/mic permission denied! Enable camera/mic by clicking the video icon on the browser's address bar and press the <strong>Test Webcam</strong> button or reload page.
                                                </div>
                                            )}

                                            {/* Video Section */}
                                            <div className="text-center mb-4">
                                                <div style={{
                                                    backgroundColor: 'rgba(65, 105, 225, 0.05)',
                                                    borderRadius: '15px',
                                                    padding: '20px',
                                                    border: '2px dashed rgba(65, 105, 225, 0.2)'
                                                }}>
                                                    <h6 className="mb-3 text-muted">
                                                        <i className="bi bi-camera me-2"></i>
                                                        Webcam Preview
                                                    </h6>
                                                    <video 
                                                        id="vid" 
                                                        ref={videoRef} 
                                                        autoPlay 
                                                        playsInline
                                                        style={{
                                                            maxWidth: '100%',
                                                            borderRadius: '10px',
                                                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                                        }}
                                                    />
                                                    <img 
                                                        id="imgid" 
                                                        ref={imageRef} 
                                                        src="" 
                                                        alt="" 
                                                        className="d-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* Control Buttons */}
                                            <div className="text-center mb-4">
                                                <div className="btn-group" role="group">
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-info"
                                                        onClick={getImage}
                                                        style={{
                                                            borderRadius: '50px',
                                                            padding: '10px 20px',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        <i className="bi bi-image me-2"></i>
                                                        Capture
                                                    </button>
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-success"
                                                        onClick={downloadImage}
                                                        disabled={!imageRef.current?.src}
                                                        style={{
                                                            borderRadius: '50px',
                                                            padding: '10px 20px',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        <i className="bi bi-download me-2"></i>
                                                        Download
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Audio Visualizer */}
                                            <div className="text-center mb-4">
                                                <canvas 
                                                    id="miccan" 
                                                    className="visualizer" 
                                                    height="60" 
                                                    ref={micCanvasRef}
                                                    style={{
                                                        border: '2px solid rgba(65, 105, 225, 0.3)',
                                                        borderRadius: '10px',
                                                        backgroundColor: 'rgba(65, 105, 225, 0.05)',
                                                        maxWidth: '100%',
                                                        width: '600px'
                                                    }}
                                                />
                                            </div>

                                            {/* Settings Display */}
                                            <div className="row mt-4">
                                                <div className="col-md-6">
                                                    <div className="p-4" style={{
                                                        backgroundColor: 'rgba(65, 105, 225, 0.05)',
                                                        borderRadius: '15px',
                                                        border: '1px solid rgba(65, 105, 225, 0.1)'
                                                    }}>
                                                        <h5 className="fw-bold mb-3" style={{color: '#333'}}>
                                                            <i className="bi bi-camera me-2"></i>
                                                            Camera Settings
                                                        </h5>
                                                        <table className="table table-sm" style={{
                                                            backgroundColor: 'white',
                                                            borderRadius: '8px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <tbody>
                                                                {Object.entries(cameraSettings).map(([key, value]) => (
                                                                    <tr key={key}>
                                                                        <td className="fw-bold" style={{
                                                                            backgroundColor: 'rgba(65, 105, 225, 0.1)',
                                                                            color: '#333'
                                                                        }}>
                                                                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                                                        </td>
                                                                        <td style={{color: '#666'}}>{value}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="p-4" style={{
                                                        backgroundColor: 'rgba(65, 105, 225, 0.05)',
                                                        borderRadius: '15px',
                                                        border: '1px solid rgba(65, 105, 225, 0.1)'
                                                    }}>
                                                        <h5 className="fw-bold mb-3" style={{color: '#333'}}>
                                                            <i className="bi bi-mic me-2"></i>
                                                            Microphone Settings
                                                        </h5>
                                                        <table className="table table-sm" style={{
                                                            backgroundColor: 'white',
                                                            borderRadius: '8px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <tbody>
                                                                {Object.entries(micSettings).map(([key, value]) => (
                                                                    <tr key={key}>
                                                                        <td className="fw-bold" style={{
                                                                            backgroundColor: 'rgba(65, 105, 225, 0.1)',
                                                                            color: '#333'
                                                                        }}>
                                                                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                                                        </td>
                                                                        <td style={{color: '#666'}}>{value}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
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

export default OnlineWebcamTest;
