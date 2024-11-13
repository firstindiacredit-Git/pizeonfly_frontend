import React, { useState, useEffect } from 'react';
import Sidebar from "../../clientCompt/ClientSidebar";
import Header from "../../clientCompt/ClientHeader";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UrlShortner = () => {
    const [urls, setUrls] = useState([]);
    const [title, setTitle] = useState('');
    const [originalUrl, setOriginalUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const userId = localStorage.getItem('client_user'); // Assuming userId is stored in localStorage
    const [selectedQR, setSelectedQR] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    // Fetch all URLs for the logged-in user
    const fetchUrls = async () => {
        try {
            const response = await axios.get(`${BASE_URL}api/url`, {
                headers: { 'user-id': userId }
            });
            setUrls(response.data);
        } catch (error) {
            toast.error('Error fetching URLs');
        }
    };

    useEffect(() => {
        fetchUrls();
    }, []);

    // Create new shortened URL
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${BASE_URL}api/shorten`, {
                title,
                original_url: originalUrl
            }, { headers: { 'user-id': userId } });

            setUrls([response.data, ...urls]);
            setTitle('');
            setOriginalUrl('');
            toast.success('URL shortened successfully!');
            // Reload the page after 5 seconds
            setTimeout(() => {
                window.location.reload();
            }, 5000);
        } catch (error) {
            toast.error('Error shortening URL');
        }
        setLoading(false);
    };

    // Delete URL
    const handleDelete = async (shortUrl) => {
        try {
            await axios.delete(`${BASE_URL}api/${shortUrl}`, {
                headers: { 'user-id': userId }
            });
            setUrls(urls.filter(url => url.short_url !== shortUrl));
            toast.error('URL deleted successfully!');
            setTimeout(() => {
                window.location.reload();
            }, 5000);
        } catch (error) {
            toast.error('Error deleting URL');
        }
    };

    const handleCopy = async (text, id) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const QRModal = ({ qr, onClose }) => {
        if (!qr) return null;

        return (
            <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">QR Code</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body text-center">
                            <img src={qr} alt="QR Code" style={{ width: '300px', height: '300px' }} />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div id="mytask-layout">
                <Sidebar />
                <div className="main px-lg-4 px-md-4">
                    <Header />

                    <div className="body d-flex py-lg-3 py-md-2">
                        <div className="container-xxl">
                            <div className="row clearfix g-3">
                                <div className="col-xl-12 col-lg-12 col-md-12">
                                    <div className="card">
                                        <div className="card-header py-3 d-flex justify-content-between align-items-center">
                                            <h4 className="mb-0 fw-bold">URL Shortener</h4>
                                        </div>
                                        <div className="card-body">
                                            <form onSubmit={handleSubmit}>
                                                <div className="row g-3 mb-3">
                                                    <div className="col-sm-6">
                                                        <label className="form-label">Title</label>
                                                        <input
                                                            type="text"
                                                            className="form-control border-secondary"
                                                            value={title}
                                                            onChange={(e) => setTitle(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <label className="form-label">Original URL</label>
                                                        <input
                                                            type="url"
                                                            className="form-control border-secondary"
                                                            value={originalUrl}
                                                            onChange={(e) => setOriginalUrl(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                                    {loading ? 'Shortening...' : 'Shorten URL'}
                                                </button>
                                            </form>

                                            <div className="table-responsive mt-4">
                                                <table className="table table-hover align-middle mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th>SrNo.</th>
                                                            <th>Title</th>
                                                            <th>Original URL</th>
                                                            <th>Short URL</th>
                                                            <th>QR Code</th>
                                                            <th>Created At</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {urls.map((url, index) => (
                                                            <tr key={url._id}>
                                                                <td className='text-center fw-bold'>{index + 1}.</td>
                                                                <td className='fw-bold'>{url.title}</td>
                                                                <td className='text-truncate' style={{ maxWidth: '200px' }}>
                                                                    <div>
                                                                        <a href={url.original_url} target="_blank" rel="noopener noreferrer">{url.original_url}</a>
                                                                    </div>
                                                                    <div className="position-relative">
                                                                        {copiedId === `original-${url._id}` &&
                                                                            <small className="position-absolute" style={{ top: '0px', left: '40px', color: 'green', backgroundColor: '#cacaca', padding: '5px', borderRadius: '5px' }}>Link Copied!</small>
                                                                        }
                                                                        <button className='btn btn-sm btn-primary' onClick={() => handleCopy(url.original_url, `original-${url._id}`)}>
                                                                            <i className="bi bi-copy"></i>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div>
                                                                        <a href={`${BASE_URL}${url.short_url}`} target="_blank" rel="noopener noreferrer">
                                                                            {`${BASE_URL}${url.short_url}`}
                                                                        </a>
                                                                    </div>
                                                                    <div className="position-relative">
                                                                        {copiedId === `short-${url._id}` &&
                                                                            <small className="position-absolute" style={{ top: '0px', left: '40px', color: 'green', backgroundColor: '#cacaca', padding: '5px', borderRadius: '5px' }}>Link Copied!</small>
                                                                        }
                                                                        <button className='btn btn-sm btn-primary' onClick={() => handleCopy(`${BASE_URL}${url.short_url}`, `short-${url._id}`)}>
                                                                            <i className="bi bi-copy"></i>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <img
                                                                        src={url.qr}
                                                                        alt="QR Code"
                                                                        width="50"
                                                                        height="50"
                                                                        style={{ cursor: 'pointer' }}
                                                                        onClick={() => setSelectedQR(url.qr)}
                                                                    />
                                                                </td>
                                                                <td><div>{new Date(url.created_at).toLocaleDateString()}</div> {new Date(url.created_at).toLocaleTimeString()}</td>
                                                                <td>
                                                                    <button
                                                                        className="btn btn-sm"
                                                                        onClick={() => handleDelete(url.short_url)}
                                                                    >
                                                                        <i className="icofont-ui-delete text-danger" />
                                                                    </button>
                                                                </td>
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
                    <ToastContainer />
                    <QRModal qr={selectedQR} onClose={() => setSelectedQR(null)} />
                </div>
            </div>
        </>
    );
};

export default UrlShortner;
