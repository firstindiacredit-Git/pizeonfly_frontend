import React, { useState, useRef, useEffect } from 'react';
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import { Link } from 'react-router-dom';
import FloatingMenu from '../../../Chats/FloatingMenu'

const OnlineVoiceRecorder = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [audioURL, setAudioURL] = useState('');
    const [micPermission, setMicPermission] = useState(null);
    const [isTesting, setIsTesting] = useState(false);
    const [testMessage, setTestMessage] = useState('');
    const [audioBlob, setAudioBlob] = useState(null);
    
    const mediaRecorderRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            
            // Set up audio context and analyser
            audioContextRef.current = new AudioContext();
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            
            mediaRecorderRef.current = new MediaRecorder(stream);
            const chunks = [];
            
            mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioURL(URL.createObjectURL(blob));
            };
            
            mediaRecorderRef.current.start();
            setIsRecording(true);
            drawVisualizer();
        } catch (err) {
            console.error('Error accessing microphone:', err);
        }
    };
    
    const pauseRecording = () => {
        if (isPaused) {
            mediaRecorderRef.current.resume();
        } else {
            mediaRecorderRef.current.pause();
        }
        setIsPaused(!isPaused);
    };
    
    const stopRecording = () => {
        mediaRecorderRef.current.stop();
        streamRef.current.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        setIsPaused(false);
    };
    
    const drawVisualizer = () => {
        if (!analyserRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Set analyzer properties
        analyserRef.current.fftSize = 2048;
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const draw = () => {
            if (!isRecording) return;
            
            requestAnimationFrame(draw);
            analyserRef.current.getByteFrequencyData(dataArray);
            
            // Clear canvas
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw wave
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#2196f3';
            ctx.beginPath();
            
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * canvas.height;
                
                ctx.moveTo(x, canvas.height);
                ctx.lineTo(x, canvas.height - barHeight);
                
                x += barWidth + 1;
            }
            
            ctx.stroke();
        };
        
        draw();
    };
    
    const drawTestVisualizer = (analyser, stream) => {
        if (!canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const draw = () => {
            if (!isTesting) {
                stream.getTracks().forEach(track => track.stop());
                // Clear canvas
                ctx.fillStyle = '#f5f5f5';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                return;
            }
            
            requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            
            // Clear canvas
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw wave
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#2196f3';
            ctx.beginPath();
            
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * canvas.height;
                
                ctx.moveTo(x, canvas.height);
                ctx.lineTo(x, canvas.height - barHeight);
                
                x += barWidth + 1;
            }
            
            ctx.stroke();
        };
        
        draw();
    };
    
    const testMicrophone = async () => {
        setIsTesting(true);
        setTestMessage('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setMicPermission(true);
            
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            let startTime = Date.now();
            let hasSound = false;
            
            const checkSound = () => {
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / bufferLength;
                
                if (average > 10) {
                    hasSound = true;
                }
                
                if (Date.now() - startTime < 2000 && !hasSound) {
                    requestAnimationFrame(checkSound);
                } else {
                    stream.getTracks().forEach(track => track.stop());
                    audioContext.close();
                    setIsTesting(false);
                    setTestMessage(hasSound ? "Microphone is working properly!" : "No sound detected. Please check your microphone.");
                    // Clear message after 2 seconds
                    setTimeout(() => {
                        setTestMessage('');
                    }, 2000);
                }
            };
            
            checkSound();
            
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setMicPermission(false);
            setIsTesting(false);
            setTestMessage("Could not access microphone. Please check permissions.");
        }
    };

    const convertToWav = async (blob) => {
        const audioContext = new AudioContext();
        const audioData = await blob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(audioData);
        
        const wavBuffer = audioBufferToWav(audioBuffer);
        return new Blob([wavBuffer], { type: 'audio/wav' });
    };

    const downloadAudio = async (format) => {
        if (!audioBlob) return;

        let downloadBlob = audioBlob;
        let fileExtension = 'webm';

        if (format === 'wav') {
            downloadBlob = await convertToWav(audioBlob);
            fileExtension = 'wav';
        }

        const url = URL.createObjectURL(downloadBlob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `recording.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const shareAudio = async () => {
        if (!audioBlob) return;

        try {
            if (navigator.share) {
                const file = new File([audioBlob], 'recording.webm', {
                    type: 'audio/webm',
                });
                await navigator.share({
                    files: [file],
                    title: 'Recorded Audio',
                });
            } else {
                alert('Web Share API is not supported in your browser');
            }
        } catch (err) {
            console.error('Error sharing:', err);
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
                    .recording-indicator {
                        animation: pulse 1s ease-in-out infinite;
                    }
                    @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.5; }
                        100% { opacity: 1; }
                    }
                    .soundwave-canvas {
                        border: 2px solid rgba(65, 105, 225, 0.3) !important;
                        border-radius: 15px !important;
                        background: linear-gradient(135deg, #f8f9fa, #e9ecef) !important;
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
                                            <h4 className="mb-0 fw-bold" style={{color: '#333'}}>Online Voice Recorder</h4>
                                        </div>
                                        {isRecording && (
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
                                                Recording Audio...
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
                                            {/* Microphone Test Section */}
                                            <div className="mb-4">
                                                <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                                                    <button 
                                                        className="btn btn-info" 
                                                        onClick={testMicrophone}
                                                        disabled={isTesting || isRecording}
                                                        style={{
                                                            borderRadius: '25px',
                                                            padding: '10px 25px',
                                                            fontWeight: '600',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            if (!isTesting && !isRecording) {
                                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                                e.currentTarget.style.boxShadow = '0 5px 15px rgba(23, 162, 184, 0.3)';
                                                            }
                                                        }}
                                                        onMouseOut={(e) => {
                                                            if (!isTesting && !isRecording) {
                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                                e.currentTarget.style.boxShadow = 'none';
                                                            }
                                                        }}
                                                    >
                                                        <i className="bi bi-mic me-2"></i>
                                                        {isTesting ? 'Testing...' : 'Test Microphone'}
                                                    </button>
                                                    {testMessage && (
                                                        <span className={`badge ${testMessage.includes('working') ? 'bg-success' : 'bg-danger'} px-3 py-2`} style={{
                                                            fontSize: '14px',
                                                            borderRadius: '20px'
                                                        }}>
                                                            <i className={`bi ${testMessage.includes('working') ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-1`}></i>
                                                            {testMessage}
                                                        </span>
                                                    )}
                                                </div>
                                                {micPermission === false && (
                                                    <div className="alert alert-danger d-flex align-items-center" style={{
                                                        borderRadius: '15px',
                                                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                                                        borderLeft: '4px solid #dc3545'
                                                    }}>
                                                        <i className="bi bi-exclamation-circle-fill me-2"></i>
                                                        Microphone access denied. Please check your browser permissions.
                                                    </div>
                                                )}
                                            </div>

                                            {/* Visualizer Section */}
                                            <div className="text-center mb-4">
                                                <div style={{
                                                    backgroundColor: 'rgba(65, 105, 225, 0.05)',
                                                    borderRadius: '15px',
                                                    padding: '20px',
                                                    border: '2px dashed rgba(65, 105, 225, 0.2)'
                                                }}>
                                                    <h6 className="mb-3 text-muted">
                                                        <i className="bi bi-soundwave me-2"></i>
                                                        Audio Visualizer
                                                    </h6>
                                                    <canvas 
                                                        ref={canvasRef} 
                                                        width="600" 
                                                        height="100" 
                                                        className="soundwave-canvas"
                                                        style={{ 
                                                            maxWidth: '100%',
                                                            height: 'auto'
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Recording Controls */}
                                            <div className="text-center mb-4">
                                                <div className="d-flex gap-3 justify-content-center flex-wrap">
                                                    {!isRecording ? (
                                                        <button 
                                                            className="btn btn-primary btn-lg" 
                                                            onClick={startRecording}
                                                            disabled={micPermission === false}
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
                                                                if (micPermission !== false) {
                                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(13, 110, 253, 0.4)';
                                                                }
                                                            }}
                                                            onMouseOut={(e) => {
                                                                if (micPermission !== false) {
                                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(13, 110, 253, 0.3)';
                                                                }
                                                            }}
                                                        >
                                                            <i className="bi bi-record-circle me-2"></i>
                                                            Start Recording
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button 
                                                                className="btn btn-warning btn-lg" 
                                                                onClick={pauseRecording}
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
                                                            <button 
                                                                className="btn btn-danger btn-lg" 
                                                                onClick={stopRecording}
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
                                                                Stop Recording
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Audio Playback Section */}
                                            {audioURL && (
                                                <div className="mt-4 p-4" style={{
                                                    backgroundColor: 'rgba(65, 105, 225, 0.05)',
                                                    borderRadius: '15px',
                                                    border: '1px solid rgba(65, 105, 225, 0.1)'
                                                }}>
                                                    <h5 className="mb-3 fw-bold" style={{color: '#333'}}>
                                                        <i className="bi bi-play-circle me-2"></i>
                                                        Audio Playback
                                                    </h5>
                                                    <audio 
                                                        src={audioURL} 
                                                        controls 
                                                        className="mb-4 w-100" 
                                                        style={{
                                                            borderRadius: '10px',
                                                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                                        }}
                                                    />
                                                    <div className="d-flex gap-3 justify-content-center flex-wrap">
                                                        <button 
                                                            className="btn btn-success btn-lg"
                                                            onClick={() => downloadAudio('webm')}
                                                            style={{
                                                                borderRadius: '50px',
                                                                padding: '10px 25px',
                                                                fontWeight: '600',
                                                                fontSize: '14px',
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
                                                            Save as WebM
                                                        </button>
                                                        <button 
                                                            className="btn btn-success btn-lg"
                                                            onClick={() => downloadAudio('wav')}
                                                            style={{
                                                                borderRadius: '50px',
                                                                padding: '10px 25px',
                                                                fontWeight: '600',
                                                                fontSize: '14px',
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
                                                            Save as WAV
                                                        </button>
                                                        <button 
                                                            className="btn btn-info btn-lg"
                                                            onClick={shareAudio}
                                                            style={{
                                                                borderRadius: '50px',
                                                                padding: '10px 25px',
                                                                fontWeight: '600',
                                                                fontSize: '14px',
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
                                                            Share Audio
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

function audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    
    const dataLength = buffer.length * blockAlign;
    const bufferLength = 44 + dataLength;
    
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);
    
    // Write audio data
    const offset = 44;
    const channels = [];
    for (let i = 0; i < numChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }
    
    for (let i = 0; i < buffer.length; i++) {
        for (let channel = 0; channel < numChannels; channel++) {
            const sample = Math.max(-1, Math.min(1, channels[channel][i]));
            const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(offset + (i * blockAlign) + (channel * bytesPerSample), int16, true);
        }
    }
    
    return arrayBuffer;
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

export default OnlineVoiceRecorder;
