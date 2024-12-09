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
                <Sidebar />
                <div className="main px-lg-4 px-md-4">
                    <Header />
                    <div className="body d-flex py-lg-3 py-md-2 flex-column">
                        <div className="d-flex align-items-center gap-3">
                            <Link to="/miscellaneous" >
                                <i className="bi bi-arrow-left fs-4" />
                            </Link>
                            <h4 className="mb-0 fw-bold">Speech To Text</h4>
                        </div>
                        
                        <div className="mt-4">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="card">
                                        <div className="card-body">
                                            <div className="form-group mb-4">
                                                <label className="mb-2">Select Language:</label>
                                                <select 
                                                    className="form-select"
                                                    value={selectedLanguage}
                                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                                    disabled={isListening}
                                                >
                                                    {languages.map((lang) => (
                                                        <option key={lang.code} value={lang.code}>
                                                            {lang.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            
                                            <div className="d-flex justify-content-center mb-4">
                                                <button 
                                                    className={`btn bi bi-mic ${isListening ? 'btn-danger text-white' : 'btn-primary'} btn-lg`}
                                                    onClick={isListening ? stopListening : startListening}
                                                >
                                                    {isListening ? 'Stop Recording' : 'Start Recording'}
                                                </button>
                                            </div>
                                            
                                            <div className="form-group">
                                                <label className="mb-2">Converted Text:</label>
                                                <textarea 
                                                    className="form-control" 
                                                    rows="5" 
                                                    value={text}
                                                    readOnly
                                                    placeholder="Your speech will appear here..."
                                                />
                                                <div className="d-flex gap-2 mt-3">
                                                    <div className="position-relative">
                                                        <button 
                                                            className="btn btn-outline-primary me-2"
                                                            onClick={copyToClipboard}
                                                            disabled={!text}
                                                        >
                                                            <i className="bi bi-clipboard"></i> Copy
                                                        </button>
                                                        {copySuccess && (
                                                            <small className="text-success">
                                                                Text copied!
                                                            </small>
                                                        )}
                                                    </div>
                                                    <button 
                                                        className="btn btn-outline-success"
                                                        onClick={downloadText}
                                                        disabled={!text}
                                                    >
                                                        <i className="bi bi-download"></i> Download
                                                    </button>
                                                    <button 
                                                        className="btn btn-outline-info"
                                                        onClick={shareText}
                                                        disabled={!text}
                                                    >
                                                        <i className="bi bi-share"></i> Share
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <FloatingMenu userType="admin" isMobile={isMobile} />
            </div>
        </>
    );
};
export default SpeechToText;
