// UrlShortner.jsx

import React, { useState, useEffect } from 'react';
import Sidebar from "../../employeeCompt/EmployeeSidebar";
import Header from "../../employeeCompt/EmployeeHeader";
import QRCode from "react-qr-code";
import axios from 'axios';

const QrCodeGenerate = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [error, setError] = useState('');
    const [userQRCodes, setUserQRCodes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const BASE_URL = import.meta.env.VITE_BASE_URL;

    // Get userId from localStorage
    const userId = localStorage.getItem('emp_user');

    useEffect(() => {
        // Fetch user's QR codes when component mounts
        fetchUserQRCodes();
    }, []);

    const fetchUserQRCodes = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${BASE_URL}api/qr/user/${userId}`);
            setUserQRCodes(response.data?.qrCodes || []);
        } catch (err) {
            setError('Failed to fetch QR codes');
            setUserQRCodes([]);
        } finally {
            setIsLoading(false);
        }
    };

    const generateQRCode = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${BASE_URL}api/qr/generate`, {
                title,
                content,
                userId
            });
            setQrCode(response.data.qrCode);
            setError('');
            fetchUserQRCodes();
        } catch (err) {
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
                                                <h6 className='fw-bold'>Your QR Codes</h6>
                                                <div className="row">
                                                    {isLoading ? (
                                                        <div className="col-12 text-center">
                                                            <p>Loading QR codes...</p>
                                                        </div>
                                                    ) : !userQRCodes || userQRCodes.length === 0 ? (
                                                        <div className="col-12">
                                                            <p>No QR codes found.</p>
                                                        </div>
                                                    ) : (
                                                        userQRCodes.map((qrCode, index) => (
                                                            <div key={qrCode._id} className="col-md-6 mb-3">
                                                                <div className='text-center fw-bold'>{index + 1}</div>
                                                                <div id={`qr-card-${qrCode._id}`} className="card border-secondary">
                                                                    <div className="card-body">
                                                                        <div className="text-center">
                                                                            <h5 className='fw-bold text-decoration-underline'>{qrCode.title}</h5>
                                                                            <div className='fw-bold mt-3 text-start'>URL :-
                                                                                <a className='fw-normal' href={qrCode.content} target='_blank'>{qrCode.content}</a>
                                                                            </div>
                                                                            <QRCode className='mt-3' value={qrCode.content} size={300} />
                                                                            <p className="mt-3 mb-0 d-flex justify-content-between align-items-center">
                                                                                <small className='fw-bold'>Created: {new Date(qrCode.createdAt).toLocaleDateString()}</small>
                                                                                <div>
                                                                                    <button
                                                                                        type='button'
                                                                                        className='btn btn-sm me-2'
                                                                                        onClick={() => {
                                                                                            const cardElement = document.getElementById(`qr-card-${qrCode._id}`);
                                                                                            if (cardElement) {
                                                                                                const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${qrCode.title} - QR Code</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/icofont/dist/icofont.min.css">
                    <style>
                        body { 
                            padding: 20px;
                            background-color: #fff;
                        }
                        .card {
                            max-width: 600px;
                            margin: 0 auto;
                            border: 1px solid #dee2e6;
                        }
                        @media print {
                            body {
                                padding: 0;
                            }
                            .card {
                                border: none;
                                box-shadow: none;
                            }
                            .no-print {
                                display: none !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${cardElement.outerHTML}
                    <script>
                        window.onload = function() {
                            window.print();
                            window.onafterprint = function() {
                                window.close();
                            }
                        }
                    </script>
                </body>
                </html>
            `;
                                                                                                const printWindow = window.open('', '', 'width=800,height=600');
                                                                                                printWindow.document.write(printContent);
                                                                                                printWindow.document.close();
                                                                                            }
                                                                                        }}
                                                                                    >
                                                                                        <i className="icofont-print text-primary" />
                                                                                    </button>
                                                                                    <button
                                                                                        type='button'
                                                                                        className='btn btn-sm me-2'
                                                                                        onClick={() => {
                                                                                            const cardElement = document.getElementById(`qr-card-${qrCode._id}`);
                                                                                            if (cardElement) {
                                                                                                const card = document.createElement('div');
                                                                                                // Add necessary styles and bootstrap
                                                                                                const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${qrCode.title} - QR Code</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/icofont/dist/icofont.min.css">
                    <style>
                        body { 
                            padding: 20px;
                            background-color: #f8f9fa;
                        }
                        .card {
                            max-width: 600px;
                            margin: 0 auto;
                            box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        }
                        .text-decoration-underline {
                            text-decoration: underline !important;
                        }
                        .fw-bold {
                            font-weight: bold !important;
                        }
                        .mt-3 {
                            margin-top: 1rem !important;
                        }
                        .text-start {
                            text-align: left !important;
                        }
                        .text-center {
                            text-align: center !important;
                        }
                    </style>
                </head>
                <body>
                    ${cardElement.outerHTML}
                </body>
                </html>
            `;
                                                                                                const blob = new Blob([htmlContent], { type: 'text/html' });
                                                                                                const url = URL.createObjectURL(blob);
                                                                                                const a = document.createElement('a');
                                                                                                a.href = url;
                                                                                                a.download = `${qrCode.title}-qrcode.html`;
                                                                                                a.click();
                                                                                                URL.revokeObjectURL(url);
                                                                                            }
                                                                                        }}
                                                                                    >
                                                                                        <i className="icofont-download text-success" />
                                                                                    </button>
                                                                                    <button
                                                                                        type='button'
                                                                                        className='btn btn-sm'
                                                                                        onClick={() => deleteQRCode(qrCode._id)}
                                                                                    >
                                                                                        <i className="icofont-ui-delete text-danger" />
                                                                                    </button>
                                                                                </div>
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
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
        </>
    );
};

export default QrCodeGenerate;
