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
                <Sidebar />
                <div className="main px-lg-4 px-md-4">
                    <Header />
                    <div className="body d-flex py-lg-3 py-md-2 flex-column">
                        <div className="d-flex align-items-center gap-3">
                            <Link to="/miscellaneous">
                                <i className="bi bi-arrow-left fs-4" />
                            </Link>
                            <h4 className="mb-0 fw-bold">Online Screenshot</h4>
                        </div>
                        <div id="wrapper">
                            {showBrowserWarning && (
                                <div id="browserwarndiv" className="alert alert-warning alert-dismissible fade show" role="alert">
                                    Your browser does not support screen recording. Open this page with the latest version of Chrome, Firefox, or Safari desktop browser!
                                    <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                            )}
                            <form id="myform">
                                <div className="mb-3 d-grid gap-2 mt-5">
                                    <button type="button" id="recordbtn" className="btn btn-block btn-primary btn-lg" onClick={startCapture}>
                                        <i className="bi bi-images me-1"></i> Screenshot
                                    </button>
                                </div>
                                <video id="video" controls ref={videoElem} onCanPlay={onCanPlay}></video>
                                <div id="viewdiv">
                                    <canvas id="canvas" ref={canvasElem} style={{ display: 'none' }}></canvas>
                                    {isCaptured && (
                                        <div className="mt-3">
                                            {shareError && (
                                                <div className="alert alert-danger mb-2">
                                                    {shareError}
                                                    <button 
                                                        type="button" 
                                                        className="close" 
                                                        onClick={() => setShareError('')}
                                                    >
                                                        <span>&times;</span>
                                                    </button>
                                                </div>
                                            )}
                                            <input
                                                type="text"
                                                className="form-control mb-2"
                                                placeholder="Enter file name"
                                                value={fileName}
                                                onChange={(e) => setFileName(e.target.value)}
                                            />
                                            <select 
                                                className="form-select mb-2" 
                                                value={selectedFormat} 
                                                onChange={(e) => setSelectedFormat(e.target.value)}
                                            >
                                                <option value="png">PNG</option>
                                                <option value="jpeg">JPEG</option>
                                                <option value="webp">WebP</option>
                                            </select>
                                            <div className="d-flex gap-2">
                                                <button 
                                                    type="button" 
                                                    className="btn btn-primary" 
                                                    onClick={saveScreenshot}
                                                >
                                                    <i className="bi bi-download me-1"></i> Save
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-success" 
                                                    onClick={shareScreenshot}
                                                >
                                                    <i className="bi bi-share me-1"></i> Share
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
                <FloatingMenu userType="admin" isMobile={isMobile} />
            </div>
        </>
    );
};

export default OnlineScreenshot;