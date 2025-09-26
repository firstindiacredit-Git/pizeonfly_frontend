import React, { useState, useRef } from 'react';
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import { Link } from 'react-router-dom';
import FloatingMenu from '../../../Chats/FloatingMenu'

const SpeechToText = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isListening, setIsListening] = useState(false);
    const [text, setText] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
    const recognitionRef = useRef(null);
    const [copySuccess, setCopySuccess] = useState(false);

    // Define supported languages
    const languages = [
        { code: 'en-IN', name: 'English' },
        { code: 'as-IN', name: 'Assamese' },
        { code: 'bn-IN', name: 'Bengali' },
        { code: 'gu-IN', name: 'Gujarati' },
        { code: 'hi-IN', name: 'Hindi' },
        { code: 'kn-IN', name: 'Kannada' },
        { code: 'ks-IN', name: 'Kashmiri' },
        { code: 'gom-IN', name: 'Konkani' },
        { code: 'ml-IN', name: 'Malayalam' },
        { code: 'mni-IN', name: 'Manipuri' },
        { code: 'mr-IN', name: 'Marathi' },
        { code: 'ne-IN', name: 'Nepali' },
        { code: 'or-IN', name: 'Oriya' },
        { code: 'pa-IN', name: 'Punjabi' },
        { code: 'sa-IN', name: 'Sanskrit' },
        { code: 'sd-IN', name: 'Sindhi' },
        { code: 'ta-IN', name: 'Tamil' },
        { code: 'te-IN', name: 'Telugu' },
        { code: 'ur-IN', name: 'Urdu' },
        { code: 'brx-IN', name: 'Bodo' },
        { code: 'sat-IN', name: 'Santhali' },
        { code: 'mai-IN', name: 'Maithili' },
        { code: 'doi-IN', name: 'Dogri' }
    ];

    const startListening = () => {
        if ('webkitSpeechRecognition' in window) {
            recognitionRef.current = new window.webkitSpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = selectedLanguage; // Set selected language

            recognitionRef.current.onstart = () => {
                setIsListening(true);
            };

            recognitionRef.current.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');
                setText(transcript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error(event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.start();
        } else {
            alert('Speech Recognition is not supported in your browser');
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(text)
            .then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            })
            .catch(err => console.error('Failed to copy text:', err));
    };

    const downloadText = () => {
        const element = document.createElement('a');
        const file = new Blob([text], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = 'speech-to-text.txt';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const shareText = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Speech to Text Content',
                    text: text
                });
            } catch (err) {
                console.error('Share failed:', err);
            }
        } else {
            alert('Web Share API is not supported in your browser');
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
                    .listening-indicator {
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
                                            <h4 className="mb-0 fw-bold" style={{color: '#333'}}>Speech To Text</h4>
                                        </div>
                                        {isListening && (
                                            <div className="d-flex align-items-center gap-2" style={{
                                                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                                                padding: '8px 15px',
                                                borderRadius: '25px',
                                                color: '#dc3545',
                                                fontSize: '14px',
                                                fontWeight: '600'
                                            }}>
                                                <div className="listening-indicator" style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    backgroundColor: '#dc3545',
                                                    borderRadius: '50%',
                                                    marginRight: '8px'
                                                }}></div>
                                                Listening...
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
                                            <div className="row g-4">
                                                {/* Language Selection */}
                                                <div className="col-12">
                                                    <div className="p-4" style={{
                                                        backgroundColor: 'rgba(65, 105, 225, 0.05)',
                                                        borderRadius: '15px',
                                                        border: '1px solid rgba(65, 105, 225, 0.1)'
                                                    }}>
                                                        <label className="form-label fw-bold mb-3" style={{color: '#333', fontSize: '16px'}}>
                                                            <i className="bi bi-translate me-2"></i>
                                                            Select Language
                                                        </label>
                                                        <select 
                                                            className="form-select"
                                                            value={selectedLanguage}
                                                            onChange={(e) => setSelectedLanguage(e.target.value)}
                                                            disabled={isListening}
                                                            style={{
                                                                borderRadius: '10px',
                                                                border: '1px solid rgba(65, 105, 225, 0.3)',
                                                                padding: '12px 15px',
                                                                fontSize: '14px'
                                                            }}
                                                        >
                                                            {languages.map((lang) => (
                                                                <option key={lang.code} value={lang.code}>
                                                                    {lang.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Recording Controls */}
                                                <div className="col-12 text-center">
                                                    <button 
                                                        className={`btn btn-lg ${isListening ? 'btn-danger' : 'btn-primary'}`}
                                                        onClick={isListening ? stopListening : startListening}
                                                        style={{
                                                            borderRadius: '50px',
                                                            padding: '15px 40px',
                                                            fontWeight: '600',
                                                            fontSize: '18px',
                                                            background: isListening ? 
                                                                'linear-gradient(135deg, #dc3545, #c82333)' : 
                                                                'linear-gradient(135deg, #0d6efd, #4169e1)',
                                                            border: 'none',
                                                            boxShadow: isListening ? 
                                                                '0 4px 15px rgba(220, 53, 69, 0.3)' : 
                                                                '0 4px 15px rgba(13, 110, 253, 0.3)',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-3px)';
                                                            if (isListening) {
                                                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.4)';
                                                            } else {
                                                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(13, 110, 253, 0.4)';
                                                            }
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            if (isListening) {
                                                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.3)';
                                                            } else {
                                                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(13, 110, 253, 0.3)';
                                                            }
                                                        }}
                                                    >
                                                        <i className={`bi bi-mic ${isListening ? 'bi-mic-mute' : ''} me-2`}></i>
                                                        {isListening ? 'Stop Recording' : 'Start Recording'}
                                                    </button>
                                                </div>

                                                {/* Text Output Area */}
                                                <div className="col-12">
                                                    <div className="form-group">
                                                        <label className="form-label fw-bold mb-3" style={{color: '#333', fontSize: '16px'}}>
                                                            <i className="bi bi-file-earmark-text me-2"></i>
                                                            Converted Text
                                                        </label>
                                                        <div className="position-relative">
                                                            <textarea 
                                                                className="form-control" 
                                                                rows="8" 
                                                                value={text}
                                                                readOnly
                                                                placeholder="Your speech will appear here..."
                                                                style={{
                                                                    borderRadius: '15px',
                                                                    border: '2px solid rgba(65, 105, 225, 0.2)',
                                                                    padding: '20px',
                                                                    fontSize: '14px',
                                                                    lineHeight: '1.6',
                                                                    resize: 'vertical'
                                                                }}
                                                            />
                                                            {isListening && (
                                                                <div className="text-center mt-3">
                                                                    <small className="text-success fw-bold">
                                                                        <i className="bi bi-mic me-1 listening-indicator"></i>
                                                                        Listening... Speak now!
                                                                    </small>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="d-flex gap-3 justify-content-center flex-wrap mt-4">
                                                            <button 
                                                                className="btn btn-outline-primary"
                                                                onClick={copyToClipboard}
                                                                disabled={!text}
                                                                style={{
                                                                    borderRadius: '50px',
                                                                    padding: '10px 25px',
                                                                    fontWeight: '600',
                                                                    borderColor: '#4169e1',
                                                                    color: '#4169e1',
                                                                    transition: 'all 0.3s ease'
                                                                }}
                                                                onMouseOver={(e) => {
                                                                    if (!text) return;
                                                                    e.currentTarget.style.backgroundColor = '#4169e1';
                                                                    e.currentTarget.style.color = 'white';
                                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                                }}
                                                                onMouseOut={(e) => {
                                                                    if (!text) return;
                                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                                    e.currentTarget.style.color = '#4169e1';
                                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                                }}
                                                            >
                                                                <i className="bi bi-clipboard me-2"></i> Copy
                                                            </button>
                                                            
                                                            <button 
                                                                className="btn btn-success"
                                                                onClick={downloadText}
                                                                disabled={!text}
                                                                style={{
                                                                    borderRadius: '50px',
                                                                    padding: '10px 25px',
                                                                    fontWeight: '600',
                                                                    background: 'linear-gradient(135deg, #28a745, #20c997)',
                                                                    border: 'none',
                                                                    transition: 'all 0.3s ease'
                                                                }}
                                                                onMouseOver={(e) => {
                                                                    if (!text) return;
                                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(40, 167, 69, 0.4)';
                                                                }}
                                                                onMouseOut={(e) => {
                                                                    if (!text) return;
                                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                                    e.currentTarget.style.boxShadow = 'none';
                                                                }}
                                                            >
                                                                <i className="bi bi-download me-2"></i> Download
                                                            </button>
                                                            
                                                            <button 
                                                                className="btn btn-info"
                                                                onClick={shareText}
                                                                disabled={!text}
                                                                style={{
                                                                    borderRadius: '50px',
                                                                    padding: '10px 25px',
                                                                    fontWeight: '600',
                                                                    background: 'linear-gradient(135deg, #17a2b8, #6f42c1)',
                                                                    border: 'none',
                                                                    transition: 'all 0.3s ease'
                                                                }}
                                                                onMouseOver={(e) => {
                                                                    if (!text) return;
                                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(23, 162, 184, 0.4)';
                                                                }}
                                                                onMouseOut={(e) => {
                                                                    if (!text) return;
                                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                                    e.currentTarget.style.boxShadow = 'none';
                                                                }}
                                                            >
                                                                <i className="bi bi-share me-2"></i> Share
                                                            </button>
                                                        </div>

                                                        {/* Copy Success Message */}
                                                        {copySuccess && (
                                                            <div className="text-center mt-3">
                                                                <small className="text-success fw-bold px-3 py-2" style={{
                                                                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                                                                    borderRadius: '20px',
                                                                    display: 'inline-block'
                                                                }}>
                                                                    <i className="bi bi-check-circle me-1"></i>
                                                                    Text copied to clipboard!
                                                                </small>
                                                            </div>
                                                        )}
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
export default SpeechToText;
