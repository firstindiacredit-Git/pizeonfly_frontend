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

    const startCapture = async () => {
        setRecording(true);
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
        }
    };

    const stopCapture = () => {
        setRecording(false);
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
                <Sidebar />
                <div className="main px-lg-4 px-md-4">
                    <Header />
                    <div className="body d-flex py-lg-3 py-md-2 flex-column">
                        <div className="d-flex align-items-center gap-3">
                            <Link to="/miscellaneous" >
                                <i className="bi bi-arrow-left fs-4" />
                            </Link>
                            <h4 className="mb-0 fw-bold">Online Screen Recorder</h4>
                        </div>
                        <div className="container mt-4">
                            <div className="mb-3">
                                <button
                                    type="button"
                                    className={`btn btn-lg ${recording ? 'btn-danger' : 'btn-primary'}`}
                                    onClick={recording ? stopCapture : startCapture}
                                >
                                    {recording ? 'Stop' : 'Record'}
                                </button>
                            </div>
                            <video ref={videoRef} className="mb-3 w-100" controls autoPlay></video>
                            <div className="mb-3">
                                <label htmlFor="filename" className="form-label">
                                    Enter file name
                                </label>
                                <input
                                    type="text"
                                    id="filename"
                                    className="form-control"
                                    placeholder="screen-record"
                                    value={fileName}
                                    onChange={(e) => setFileName(e.target.value)}
                                />
                            </div>
                            <div className="row">
                                <button type="button" className="btn btn-primary col me-2" onClick={saveRecording}>
                                    Save
                                </button>
                                <button type="button" className="btn btn-primary col" onClick={shareRecording}>
                                    Share
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <FloatingMenu userType="admin" isMobile={isMobile} />
            </div>
        </>
    );
};

export default OnlineScreenrecoder;
