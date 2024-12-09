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
                <Sidebar />
                <div className="main px-lg-4 px-md-4">
                    <Header />
                    <div className="body d-flex py-lg-3 py-md-2 flex-column">
                        <div className="d-flex align-items-center gap-3">
                            <Link to="/miscellaneous" >
                                <i className="bi bi-arrow-left fs-4" />
                            </Link>
                            <h4 className="mb-0 fw-bold">Online Voice Recorder</h4>
                        </div>
                        
                        <div className="recorder-container mt-4">
                            <div className="mb-3 d-flex align-items-center gap-3">
                                <button 
                                    className="btn btn-info" 
                                    onClick={testMicrophone}
                                    disabled={isTesting || isRecording}
                                >
                                    {isTesting ? 'Testing...' : 'Test Microphone'}
                                </button>
                                {testMessage && (
                                    <span className={`text-${testMessage.includes('working') ? 'success' : 'danger'}`}>
                                        {testMessage}
                                    </span>
                                )}
                            </div>
                            {micPermission === false && (
                                <div className="text-danger mt-2">
                                    Microphone access denied. Please check your browser permissions.
                                </div>
                            )}
                            
                            <canvas ref={canvasRef} width="600" height="100" style={{ border: '1px solid #000' }} />
                            
                            <div className="controls mt-3 d-flex gap-3">
                                {!isRecording ? (
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={startRecording}
                                        disabled={micPermission === false}
                                    >
                                        Record
                                    </button>
                                ) : (
                                    <>
                                        <button className="btn btn-warning" onClick={pauseRecording}>
                                            {isPaused ? 'Resume' : 'Pause'}
                                        </button>
                                        <button className="btn btn-danger" onClick={stopRecording}>
                                            Stop
                                        </button>
                                    </>
                                )}
                            </div>
                            
                            {audioURL && (
                                <div className="mt-3">
                                    <audio src={audioURL} controls className="mb-3 w-100" />
                                    <div className="d-flex gap-2">
                                        <button 
                                            className="btn btn-success" 
                                            onClick={() => downloadAudio('webm')}
                                        >
                                            <i className="bi bi-download me-2"></i>
                                            Save as WebM
                                        </button>
                                        <button 
                                            className="btn btn-success" 
                                            onClick={() => downloadAudio('wav')}
                                        >
                                            <i className="bi bi-download me-2"></i>
                                            Save as WAV
                                        </button>
                                        <button 
                                            className="btn btn-primary" 
                                            onClick={shareAudio}
                                        >
                                            <i className="bi bi-share me-2"></i>
                                            Share
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <FloatingMenu userType="admin" isMobile={isMobile} />
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
