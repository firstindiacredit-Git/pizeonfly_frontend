import React, { useState, useRef, useEffect } from 'react';
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import { Link } from 'react-router-dom';
import FloatingMenu from '../../../Chats/FloatingMenu'

const TextToSpeech = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [text, setText] = useState('');
    const [isPaused, setIsPaused] = useState(false);
    const speechSynthesis = window.speechSynthesis;
    const utteranceRef = useRef(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [availableVoices, setAvailableVoices] = useState([]);
    const [rate, setRate] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const timeIntervalRef = useRef(null);

    useEffect(() => {
        const loadVoices = () => {
            const voices = speechSynthesis.getVoices();
            setAvailableVoices(voices);
            setSelectedVoice(voices[0]);
        };

        loadVoices();
        speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleSpeak = () => {
        if (text && selectedVoice) {
            utteranceRef.current = new SpeechSynthesisUtterance(text);
            utteranceRef.current.voice = selectedVoice;
            utteranceRef.current.rate = rate;

            const estimatedDuration = (text.length * 100) / (rate * 1000);
            setDuration(estimatedDuration);
            setCurrentTime(0);

            utteranceRef.current.onstart = () => {
                timeIntervalRef.current = setInterval(() => {
                    if (speechSynthesis.speaking && !speechSynthesis.paused) {
                        setCurrentTime(prev => Math.min(prev + 0.1, estimatedDuration));
                    }
                }, 100);
            };

            utteranceRef.current.onend = () => {
                clearInterval(timeIntervalRef.current);
                setCurrentTime(0);
            };

            utteranceRef.current.onpause = () => {
                clearInterval(timeIntervalRef.current);
            };

            utteranceRef.current.onresume = () => {
                timeIntervalRef.current = setInterval(() => {
                    if (speechSynthesis.speaking && !speechSynthesis.paused) {
                        setCurrentTime(prev => Math.min(prev + 0.1, estimatedDuration));
                    }
                }, 100);
            };

            speechSynthesis.speak(utteranceRef.current);
        }
    };

    const handlePause = () => {
        if (speechSynthesis.speaking) {
            speechSynthesis.pause();
            setIsPaused(true);
        }
    };

    const handleResume = () => {
        if (isPaused) {
            speechSynthesis.resume();
            setIsPaused(false);
        }
    };

    const handleStop = () => {
        speechSynthesis.cancel();
        setIsPaused(false);
        setCurrentTime(0);
        clearInterval(timeIntervalRef.current);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setText(e.target.result);
            };
            reader.readAsText(file);
        }
    };

    const handleCopyText = () => {
        navigator.clipboard.writeText(text)
            .then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            })
            .catch((err) => {
                console.error('Failed to copy text: ', err);
            });
    };

    useEffect(() => {
        return () => {
            if (timeIntervalRef.current) {
                clearInterval(timeIntervalRef.current);
            }
        };
    }, []);

    const audioControlStyles = {
        audioPlayerControls: {
            background: '#f8f9fa',
            padding: '10px',
            borderRadius: '8px'
        },
        timeDisplay: {
            fontFamily: 'monospace',
            fontSize: '14px',
            minWidth: '45px'
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
                    .speaking-indicator {
                        animation: pulse 1s ease-in-out infinite;
                    }
                    @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.5; }
                        100% { opacity: 1; }
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
                                            <h4 className="mb-0 fw-bold" style={{color: '#333'}}>Text To Speech</h4>
                                        </div>
                                        {speechSynthesis.speaking && (
                                            <div className="d-flex align-items-center gap-2" style={{
                                                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                                                padding: '8px 15px',
                                                borderRadius: '25px',
                                                color: '#dc3545',
                                                fontSize: '14px',
                                                fontWeight: '600'
                                            }}>
                                                <div className="speaking-indicator" style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    backgroundColor: '#dc3545',
                                                    borderRadius: '50%',
                                                    marginRight: '8px'
                                                }}></div>
                                                Speaking...
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
                                            {/* Text Input Section */}
                                            <div className="mb-4">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <label className="form-label fw-bold mb-0" style={{color: '#333', fontSize: '16px'}}>
                                                        <i className="bi bi-file-earmark-text me-2"></i>
                                                        Text Input
                                                    </label>
                                                    <input
                                                        type="file"
                                                        className="form-control form-control-sm"
                                                        accept=".txt"
                                                        onChange={handleFileUpload}
                                                        style={{
                                                            width: 'auto',
                                                            borderRadius: '10px',
                                                            border: '2px dashed rgba(65, 105, 225, 0.3)'
                                                        }}
                                                    />
                                                </div>
                                                <textarea
                                                    className="form-control"
                                                    rows="6"
                                                    value={text}
                                                    onChange={(e) => setText(e.target.value)}
                                                    placeholder="Type or upload text here..."
                                                    style={{
                                                        borderRadius: '15px',
                                                        border: '2px solid rgba(65, 105, 225, 0.2)',
                                                        padding: '15px',
                                                        fontSize: '14px',
                                                        lineHeight: '1.6',
                                                        resize: 'vertical'
                                                    }}
                                                />
                                                
                                                <div className="d-flex justify-content-center gap-2 mt-3">
                                                    <button 
                                                        className="btn btn-outline-secondary btn-sm" 
                                                        onClick={handleCopyText}
                                                        style={{
                                                            borderRadius: '25px',
                                                            padding: '8px 20px',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        <i className="bi bi-clipboard me-1"></i> Copy Text
                                                    </button>
                                                    {copySuccess && (
                                                        <span className="text-success fw-bold d-flex align-items-center" style={{
                                                            backgroundColor: 'rgba(40, 167, 69, 0.1)',
                                                            padding: '8px 15px',
                                                            borderRadius: '20px',
                                                            fontSize: '12px'
                                                        }}>
                                                            <i className="bi bi-check-circle me-1"></i> Text copied!
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Voice Settings */}
                                            <div className="row g-4 mb-4">
                                                <div className="col-12 col-md-6">
                                                    <div className="p-4" style={{
                                                        backgroundColor: 'rgba(65, 105, 225, 0.05)',
                                                        borderRadius: '15px',
                                                        border: '1px solid rgba(65, 105, 225, 0.1)'
                                                    }}>
                                                        <label className="form-label fw-bold mb-3" style={{color: '#333', fontSize: '14px'}}>
                                                            <i className="bi bi-person-voice me-2"></i>
                                                            Select Voice
                                                        </label>
                                                        <select
                                                            className="form-select"
                                                            onChange={(e) => setSelectedVoice(availableVoices[e.target.value])}
                                                            style={{
                                                                borderRadius: '10px',
                                                                border: '1px solid rgba(65, 105, 225, 0.3)',
                                                                padding: '12px 15px'
                                                            }}
                                                        >
                                                            {availableVoices.map((voice, index) => (
                                                                <option key={index} value={index}>
                                                                    {voice.name} ({voice.lang})
                                                                </option>
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
                                                        <label className="form-label fw-bold mb-3" style={{color: '#333', fontSize: '14px'}}>
                                                            <i className="bi bi-speedometer me-2"></i>
                                                            Speech Rate: {rate}x
                                                        </label>
                                                        <div className="d-flex align-items-center gap-3">
                                                            <small className="text-muted">Slow</small>
                                                            <input
                                                                type="range"
                                                                className="form-range"
                                                                min="0.5"
                                                                max="2"
                                                                step="0.1"
                                                                value={rate}
                                                                onChange={(e) => setRate(parseFloat(e.target.value))}
                                                                style={{ flex: '1' }}
                                                            />
                                                            <small className="text-muted">Fast</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Audio Player Controls */}
                                            <div className="mb-4" style={audioControlStyles.audioPlayerControls}>
                                                <div className="d-flex align-items-center gap-2">
                                                    <span style={audioControlStyles.timeDisplay}>{formatTime(currentTime)}</span>
                                                    <input
                                                        type="range"
                                                        className="form-range flex-grow-1"
                                                        min="0"
                                                        max={duration}
                                                        step="0.1"
                                                        value={currentTime}
                                                        style={{ cursor: 'pointer' }}
                                                        onChange={(e) => {
                                                            setCurrentTime(parseFloat(e.target.value));
                                                        }}
                                                    />
                                                    <span style={audioControlStyles.timeDisplay}>{formatTime(duration)}</span>
                                                </div>
                                            </div>

                                            {/* Playback Controls */}
                                            <div className="d-flex gap-3 justify-content-center flex-wrap">
                                                <button 
                                                    className="btn btn-primary btn-lg" 
                                                    onClick={handleSpeak}
                                                    disabled={!text}
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
                                                        if (!text) return;
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(13, 110, 253, 0.4)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        if (!text) return;
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(13, 110, 253, 0.3)';
                                                    }}
                                                >
                                                    <i className="bi bi-play-fill me-2"></i> 
                                                    {speechSynthesis.speaking ? 'Speaking' : 'Speak'}
                                                </button>
                                                
                                                {speechSynthesis.speaking && (
                                                    <button 
                                                        className="btn btn-warning btn-lg" 
                                                        onClick={isPaused ? handleResume : handlePause}
                                                        style={{
                                                            borderRadius: '50px',
                                                            padding: '12px 30px',
                                                            fontWeight: '600',
                                                            fontSize: '16px',
                                                            background: 'linear-gradient(135deg, #ffc107, #fd7e14)',
                                                            border: 'none',
                                                            boxShadow: '0 4px 15px rgba(255, 193, 7, 0.3)',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 193, 7, 0.4)';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 193, 7, 0.3)';
                                                        }}
                                                    >
                                                        <i className={`bi ${isPaused ? 'bi-play-fill' : 'bi-pause-fill'} me-2`}></i>
                                                        {isPaused ? 'Resume' : 'Pause'}
                                                    </button>
                                                )}
                                                
                                                {speechSynthesis.speaking && (
                                                    <button 
                                                        className="btn btn-danger btn-lg" 
                                                        onClick={handleStop}
                                                        style={{
                                                            borderRadius: '50px',
                                                            padding: '12px 30px',
                                                            fontWeight: '600',
                                                            fontSize: '16px',
                                                            background: 'linear-gradient(135deg, #dc3545, #c82333)',
                                                            border: 'none',
                                                            boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.4)';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.3)';
                                                        }}
                                                    >
                                                        <i className="bi bi-stop-fill me-2"></i> 
                                                        Stop
                                                    </button>
                                                )}
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
export default TextToSpeech;
