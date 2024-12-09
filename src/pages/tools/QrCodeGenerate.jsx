// UrlShortner.jsx

import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import QRCode from "react-qr-code";
import axios from 'axios';
import FloatingMenu from '../../Chats/FloatingMenu'

const QrCodeGenerate = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [error, setError] = useState('');
    const [userQRCodes, setUserQRCodes] = useState([]);
    const BASE_URL = import.meta.env.VITE_BASE_URL;
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user._id;

    useEffect(() => {
        // Fetch user's QR codes when component mounts
        fetchUserQRCodes();
    }, []);

    const fetchUserQRCodes = async () => {
        try {
            console.log('Fetching QR codes for user ID:', userId);
            const response = await axios.get(`${BASE_URL}api/qr/user/${userId}`);
            console.log('Fetch response:', response.data);
            
            if (Array.isArray(response.data)) {
                setUserQRCodes(response.data);
                if (response.data.length === 0) {
                    console.log('No QR codes found for user');
                }
            } else {
                console.error('Expected array but got:', typeof response.data);
                setUserQRCodes([]);
            }
        } catch (err) {
            console.error('Error fetching QR codes:', err);
            setError('Failed to fetch QR codes');
            setUserQRCodes([]);
        }
    };

    const generateQRCode = async (e) => {
        e.preventDefault();
        try {
            console.log('Generating QR code with data:', { title, content, userId });
            const response = await axios.post(`${BASE_URL}api/qr/generate`, {
                title,
                content,
                userId
            });
            console.log('Generation response:', response.data);
            
            if (response.data.success) {
                setQrCode(response.data.qrCode);
                setError('');
                // Clear form
                setTitle('');
                setContent('');
                // Fetch updated list
                await fetchUserQRCodes();
            } else {
                setError('Failed to generate QR code');
            }
        } catch (err) {
            console.error('Error generating QR code:', err);
            setError('Failed to generate QR code');
        }
    };

    const deleteQRCode = async (id) => {
        try {
            await axios.delete(`${BASE_URL}api/qr/${id}`);
            setError('');
            fetchUserQRCodes();
        } catch (err) {
            setError('Failed to delete QR code');
        }
    };

    return (
        <>
            <div id="mytask-layout">
                <Sidebar />
                <div className="main px-lg-4 px-md-4">
                    <Header />

                    <div className="body d-flex py-lg-3 py-md-2">
                        <div className="container-fluid">
                            <div className="row clearfix">
                                <div className="col-md-12">
                                    <div className="card mb-4">
                                        <div className="card-header">
                                            <h4 className="card-title mb-0 fw-bold">QR Code Generator</h4>
                                        </div>
                                        <div className="card-body">
                                            <form onSubmit={generateQRCode}>
                                                <div className="row g-3 mb-3">
                                                    <div className="col-sm-6">
                                                        <label className="form-label">Title</label>
                                                        <input
                                                            type="text"
                                                            className="form-control border-secondary"
                                                            value={title}
                                                            onChange={(e) => setTitle(e.target.value)}
                                                            placeholder="Enter title for QR code"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <label className="form-label">Enter content for QR Code</label>
                                                        <input
                                                            type="text"
                                                            className="form-control border-secondary"
                                                            value={content}
                                                            onChange={(e) => setContent(e.target.value)}
                                                            placeholder="Enter URL or text"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <button type="submit" className="btn btn-primary">Generate QR Code</button>
                                            </form>

                                            {error && <div className="alert alert-danger mt-3">{error}</div>}

                                            {qrCode && (
                                                <div className="text-center mt-4">
                                                    <QRCode value={content} size={256} />
                                                    <div className="mt-3">
                                                        <a
                                                            href={qrCode}
                                                            download="qrcode.png"
                                                            className="btn btn-secondary"
                                                        >
                                                            Download QR Code
                                                        </a>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Display user's QR codes */}
                                            <div className="mt-5">
                                                <h6 className='fw-bold mb-4 fs-5'>Your QR Codes</h6>
                                                <div className="row g-4">
                                                    {userQRCodes && userQRCodes.length > 0 ? (
                                                        userQRCodes.map((qrCode, index) => (
                                                            <div key={qrCode._id} className="col-lg-4 col-md-6">
                                                                <div className="card h-100 border-primary shadow-sm">
                                                                    <div className="card-body p-4">
                                                                        <div className="d-flex justify-content-center align-items-center mb-4 gap-2">
                                                                            <span className="badge bg-primary rounded px-3">{index + 1}</span>
                                                                            <h5 className="card-title mb-0 fw-bold text-primary">{qrCode.content}</h5>
                                                                        </div>
                                                                        <div>{qrCode.title}</div>
                                                                        <div className="text-center mb-4 bg-light p-4 rounded">
                                                                            <QRCode value={qrCode.content} size={180} />
                                                                        </div>
                                                                        <p className="card-text d-flex align-items-center">
                                                                            <i className="icofont-calendar text-muted me-2"></i>
                                                                            <small className="text-muted">
                                                                                Created: {new Date(qrCode.createdAt).toLocaleDateString()}
                                                                            </small>
                                                                        </p>
                                                                        <div className="d-flex justify-content-between align-items-center mt-4">
                                                                            <a 
                                                                                href={qrCode.content} 
                                                                                target="_blank" 
                                                                                rel="noopener noreferrer"
                                                                                className="btn btn-primary btn-sm px-3"
                                                                            >
                                                                                <i className="icofont-link me-2"></i>
                                                                                Open Link
                                                                            </a>
                                                                            <div className="btn-group">
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-light btn-sm me-2"
                                                                                    onClick={() => {
                                                                                        const printWindow = window.open('', '', 'width=800,height=600');
                                                                                        printWindow.document.write(`
                                                                                            <html>
                                                                                                <head>
                                                                                                    <title>${qrCode.title}</title>
                                                                                                    <style>
                                                                                                        body { font-family: Arial, sans-serif; }
                                                                                                        .container { max-width: 600px; margin: 40px auto; }
                                                                                                        img { max-width: 300px; margin: 20px 0; }
                                                                                                    </style>
                                                                                                </head>
                                                                                                <body>
                                                                                                    <div class="container">
                                                                                                        <h2>${qrCode.title}</h2>
                                                                                                        <div>${qrCode.content}</div>
                                                                                                        <img src="${qrCode.qrCode}" alt="QR Code" />
                                                                                                    </div>
                                                                                                </body>
                                                                                            </html>
                                                                                        `);
                                                                                        printWindow.document.close();
                                                                                        printWindow.print();
                                                                                    }}
                                                                                >
                                                                                    <i className="icofont-print"></i>
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-light btn-sm"
                                                                                    onClick={() => deleteQRCode(qrCode._id)}
                                                                                >
                                                                                    <i className="icofont-trash text-danger"></i>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="col-12">
                                                            <div className="alert alert-info text-center p-4 shadow-sm border-0">
                                                                <i className="icofont-info-circle fs-4 me-2"></i>
                                                                No QR codes found. Generate your first QR code above!
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
                    </div>
                </div>
                <FloatingMenu userType="admin" isMobile={isMobile} />
            </div>
        </>
    );
};

export default QrCodeGenerate;
