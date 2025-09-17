import React, { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import FloatingMenu from '../Chats/FloatingMenu'
import axios from 'axios';

const Officedocs = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadType, setUploadType] = useState('file');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        documentType: 'Other',
        documentLink: '',
        tags: '',
        isPublic: false
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [stats, setStats] = useState({});
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);

    const documentTypes = [
        'Contract', 'Invoice', 'Report', 'Presentation', 'Policy', 
        'Manual', 'Certificate', 'Legal Document', 'Financial Document',
        'HR Document', 'Marketing Material', 'Technical Document', 'Other'
    ];

    useEffect(() => {
        fetchDocuments();
        fetchStats();
    }, [searchTerm, filterType]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/office-docs`, {
                params: {
                    search: searchTerm,
                    documentType: filterType,
                    limit: 20
                }
            });
            console.log('Documents response:', response.data); // Debug log
            setDocuments(response.data?.data?.documents || []);
        } catch (error) {
            console.error('Error fetching documents:', error);
            setDocuments([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/office-docs/stats`);
            console.log('Stats response:', response.data); // Debug log
            setStats(response.data?.data || {});
        } catch (error) {
            console.error('Error fetching stats:', error);
            setStats({}); // Set empty object on error
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            submitData.append(key, formData[key]);
        });
        submitData.append('uploadType', uploadType);
        
        if (uploadType === 'file' && selectedFile) {
            submitData.append('document', selectedFile);
        }

        try {
            setLoading(true);
            await axios.post(`${import.meta.env.VITE_BASE_URL}api/office-docs/upload`, submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            setShowUploadModal(false);
            resetForm();
            fetchDocuments();
            fetchStats();
        } catch (error) {
            console.error('Error uploading document:', error);
            alert('Error uploading document: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            documentType: 'Other',
            documentLink: '',
            tags: '',
            isPublic: false
        });
        setSelectedFile(null);
        setUploadType('file');
    };

    const handleDownload = async (documentId) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/office-docs/${documentId}/download`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'document');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading document:', error);
        }
    };

    const handleDelete = async (documentId) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_BASE_URL}api/office-docs/${documentId}`);
                fetchDocuments();
                fetchStats();
            } catch (error) {
                console.error('Error deleting document:', error);
            }
        }
    };

    const handleViewDocument = async (documentId) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/office-docs/${documentId}`);
            setSelectedDocument(response.data.data);
            setShowViewModal(true);
        } catch (error) {
            console.error('Error fetching document details:', error);
            alert('Error loading document details');
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <>
            <div id="mytask-layout">
                <Sidebar />
                <div className="main px-lg-4 px-md-4">
                    <Header />

                    <div className="body d-flex py-lg-3 py-md-2 flex-column">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="mb-0 fw-bold">Office Documents</h4>
                            <button 
                                className="btn btn-primary"
                                onClick={() => setShowUploadModal(true)}
                            >
                                <i className="fa fa-plus me-2"></i>
                                Upload Document
                            </button>
                        </div>

                        {/* Stats Cards */}
                        <div className="row mb-4">
                            <div className="col-md-3">
                                <div className="card bg-primary text-white">
                                    <div className="card-body">
                                        <h5>{stats.totalDocuments || 0}</h5>
                                        <small>Total Documents</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card bg-success text-white">
                                    <div className="card-body">
                                        <h5>{stats.fileDocuments || 0}</h5>
                                        <small>File Documents</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card bg-info text-white">
                                    <div className="card-body">
                                        <h5>{stats.linkDocuments || 0}</h5>
                                        <small>Link Documents</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card bg-warning text-white">
                                    <div className="card-body">
                                        <h5>{stats.storageUsedMB || 0} MB</h5>
                                        <small>Storage Used</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search and Filter */}
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search documents..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <select
                                    className="form-select"
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                >
                                    <option value="all">All Types</option>
                                    {documentTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Documents List */}
                        <div className="flex-grow-1" style={{ minHeight: "60vh", overflow: "auto" }}>
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : documents.length === 0 ? (
                                <div className="text-center py-5">
                                    <i className="fa fa-file-o fa-3x text-muted mb-3"></i>
                                    <p className="text-muted">No documents found</p>
                                </div>
                            ) : (
                                <div className="row">
                                    {documents.map(doc => (
                                        <div key={doc._id} className="col-md-6 col-lg-4 mb-3">
                                            <div className="card h-100">
                                                <div className="card-body">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <h6 className="card-title text-truncate">{doc.title}</h6>
                                                        <span className={`badge ${doc.uploadType === 'file' ? 'bg-success' : 'bg-info'}`}>
                                                            {doc.uploadType === 'file' ? 'File' : 'Link'}
                                                        </span>
                                                    </div>
                                                    
                                                    <p className="text-muted small mb-2">{doc.documentType}</p>
                                                    
                                                    {doc.description && (
                                                        <p className="card-text small text-truncate">{doc.description}</p>
                                                    )}
                                                    
                                                    {doc.uploadType === 'file' && doc.fileSize && (
                                                        <p className="text-muted small mb-2">
                                                            Size: {formatFileSize(doc.fileSize)}
                                                        </p>
                                                    )}
                                                    
                                                    {doc.tags && doc.tags.length > 0 && (
                                                        <div className="mb-2">
                                                            {doc.tags.slice(0, 2).map(tag => (
                                                                <span key={tag} className="badge bg-light text-dark me-1 small">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    
                                                    <p className="text-muted small mb-2">
                                                        Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                
                                                <div className="card-footer bg-transparent">
                                                    <div className="btn-group w-100">
                                                        <button
                                                            className="btn btn-sm btn-outline-info"
                                                            onClick={() => handleViewDocument(doc._id)}
                                                            title="View Details"
                                                        >
                                                            <i className="fa fa-eye"></i>
                                                        </button>
                                                        {doc.uploadType === 'file' ? (
                                                            <button
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() => handleDownload(doc._id)}
                                                                title="Download"
                                                            >
                                                                <i className="fa fa-download"></i>
                                                            </button>
                                                        ) : (
                                                            <a
                                                                href={doc.documentLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="btn btn-sm btn-outline-primary"
                                                                title="Open Link"
                                                            >
                                                                <i className="fa fa-external-link"></i>
                                                            </a>
                                                        )}
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDelete(doc._id)}
                                                            title="Delete"
                                                        >
                                                            <i className="fa fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Upload Modal */}
                {showUploadModal && (
                    <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                        <div className="modal-dialog modal-lg" style={{marginLeft:"25rem"}}>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Upload Document</h5>
                                    <button 
                                        type="button" 
                                        className="btn-close" 
                                        onClick={() => setShowUploadModal(false)}
                                    ></button>
                                </div>
                                
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        {/* Upload Type Selection */}
                                        <div className="mb-3">
                                            <label className="form-label">Upload Type</label>
                                            <div className="btn-group w-100" role="group">
                                                <input
                                                    type="radio"
                                                    className="btn-check"
                                                    id="file-upload"
                                                    value="file"
                                                    checked={uploadType === 'file'}
                                                    onChange={(e) => setUploadType(e.target.value)}
                                                />
                                                <label className="btn btn-outline-primary" htmlFor="file-upload">
                                                    <i className="fa fa-file me-2"></i>File Upload
                                                </label>

                                                <input
                                                    type="radio"
                                                    className="btn-check"
                                                    id="link-upload"
                                                    value="link"
                                                    checked={uploadType === 'link'}
                                                    onChange={(e) => setUploadType(e.target.value)}
                                                />
                                                <label className="btn btn-outline-primary" htmlFor="link-upload">
                                                    <i className="fa fa-link me-2"></i>Link
                                                </label>
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <div className="mb-3">
                                            <label className="form-label">Title *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        {/* Document Type */}
                                        <div className="mb-3">
                                            <label className="form-label">Document Type *</label>
                                            <select
                                                className="form-select"
                                                name="documentType"
                                                value={formData.documentType}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                {documentTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* File Upload or Link */}
                                        {uploadType === 'file' ? (
                                            <div className="mb-3">
                                                <label className="form-label">Select File *</label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    onChange={handleFileChange}
                                                    required
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
                                                />
                                                <div className="form-text">
                                                    Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, Images, ZIP, RAR
                                                    <br />Maximum size: 50MB
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mb-3">
                                                <label className="form-label">Document Link *</label>
                                                <input
                                                    type="url"
                                                    className="form-control"
                                                    name="documentLink"
                                                    value={formData.documentLink}
                                                    onChange={handleInputChange}
                                                    placeholder="https://example.com/document"
                                                    required
                                                />
                                            </div>
                                        )}

                                        {/* Description */}
                                        <div className="mb-3">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                className="form-control"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                rows="3"
                                            ></textarea>
                                        </div>

                                        {/* Tags */}
                                        <div className="mb-3">
                                            <label className="form-label">Tags</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="tags"
                                                value={formData.tags}
                                                onChange={handleInputChange}
                                                placeholder="Enter tags separated by commas"
                                            />
                                        </div>

                                        {/* Public Access */}
                                        <div className="mb-3 form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                name="isPublic"
                                                checked={formData.isPublic}
                                                onChange={handleInputChange}
                                                id="isPublic"
                                            />
                                            <label className="form-check-label" htmlFor="isPublic">
                                                Make this document publicly accessible
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <div className="modal-footer">
                                        <button 
                                            type="button" 
                                            className="btn btn-secondary"
                                            onClick={() => setShowUploadModal(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fa fa-upload me-2"></i>
                                                    Upload Document
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* View Document Modal */}
                {showViewModal && selectedDocument && (
                    <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                        <div className="modal-dialog modal-lg" style={{marginLeft:"25rem"}}>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        <i className="fa fa-eye me-2"></i>
                                        Document Details
                                    </h5>
                                    <button 
                                        type="button" 
                                        className="btn-close" 
                                        onClick={() => setShowViewModal(false)}
                                    ></button>
                                </div>
                                
                                <div className="modal-body" style={{maxHeight: "70vh", overflowY: "auto"}}>
                                    {/* Document Preview Section */}
                                    {selectedDocument.uploadType === 'file' && selectedDocument.fileName && (
                                        <div className="row mb-4">
                                            <div className="col-12">
                                                <h6 className="border-bottom pb-2 mb-3">
                                                    <i className="fa fa-eye me-2"></i>Document Preview
                                                </h6>
                                                <div className="document-preview" style={{
                                                    border: "1px solid #dee2e6", 
                                                    borderRadius: "8px", 
                                                    padding: "15px",
                                                    backgroundColor: "#f8f9fa",
                                                    minHeight: "300px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center"
                                                }}>
                                                    {/* Image Preview */}
                                                    {selectedDocument.mimeType?.startsWith('image/') && (
                                                        <img 
                                                            src={`${import.meta.env.VITE_BASE_URL}office-docs/${selectedDocument.fileName}`}
                                                            alt={selectedDocument.title}
                                                            style={{
                                                                maxWidth: "100%",
                                                                maxHeight: "400px",
                                                                objectFit: "contain",
                                                                borderRadius: "4px"
                                                            }}
                                                        />
                                                    )}
                                                    
                                                    {/* PDF Preview */}
                                                    {selectedDocument.mimeType === 'application/pdf' && (
                                                        <div className="w-100">
                                                            <iframe
                                                                src={`${import.meta.env.VITE_BASE_URL}office-docs/${selectedDocument.fileName}`}
                                                                style={{
                                                                    width: "100%",
                                                                    height: "400px",
                                                                    border: "none",
                                                                    borderRadius: "4px"
                                                                }}
                                                                title={selectedDocument.title}
                                                            />
                                                        </div>
                                                    )}
                                                    
                                                    {/* Fallback for other files */}
                                                    {!selectedDocument.mimeType?.startsWith('image/') &&
                                                     selectedDocument.mimeType !== 'application/pdf' && (
                                                        <div className="text-center">
                                                            <div className="mb-3">
                                                                <i className="fa fa-file-o fa-4x text-secondary"></i>
                                                            </div>
                                                            <h6>Preview Not Available</h6>
                                                            <p className="text-muted small">
                                                                File type: {selectedDocument.mimeType || 'Unknown'}
                                                            </p>
                                                            <button
                                                                className="btn btn-primary btn-sm"
                                                                onClick={() => handleDownload(selectedDocument._id)}
                                                            >
                                                                <i className="fa fa-download me-2"></i>
                                                                Download to View
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Link Preview */}
                                    {selectedDocument.uploadType === 'link' && selectedDocument.documentLink && (
                                        <div className="row mb-4">
                                            <div className="col-12">
                                                <h6 className="border-bottom pb-2 mb-3">
                                                    <i className="fa fa-link me-2"></i>Link Preview
                                                </h6>
                                                <div className="link-preview" style={{
                                                    border: "1px solid #dee2e6", 
                                                    borderRadius: "8px", 
                                                    padding: "15px",
                                                    backgroundColor: "#f8f9fa"
                                                }}>
                                                    <div className="text-center mb-3">
                                                        <i className="fa fa-external-link fa-3x text-primary"></i>
                                                    </div>
                                                    <div className="text-center">
                                                        <h6>External Document Link</h6>
                                                        <p className="text-muted small mb-3">
                                                            {selectedDocument.documentLink}
                                                        </p>
                                                        <a 
                                                            href={selectedDocument.documentLink} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="btn btn-primary btn-sm"
                                                        >
                                                            <i className="fa fa-external-link me-2"></i>
                                                            Open Link
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <h6 className="border-bottom pb-2 mb-3">
                                        <i className="fa fa-info-circle me-2"></i>Document Information
                                    </h6>

                                    {/* Document Title */}
                                    <div className="row mb-3">
                                        <div className="col-md-3">
                                            <strong>Title:</strong>
                                        </div>
                                        <div className="col-md-9">
                                            {selectedDocument.title}
                                        </div>
                                    </div>

                                    {/* Document Type */}
                                    <div className="row mb-3">
                                        <div className="col-md-3">
                                            <strong>Type:</strong>
                                        </div>
                                        <div className="col-md-9">
                                            <span className="badge bg-primary">{selectedDocument.documentType}</span>
                                        </div>
                                    </div>

                                    {/* Upload Type */}
                                    <div className="row mb-3">
                                        <div className="col-md-3">
                                            <strong>Upload Type:</strong>
                                        </div>
                                        <div className="col-md-9">
                                            <span className={`badge ${selectedDocument.uploadType === 'file' ? 'bg-success' : 'bg-info'}`}>
                                                <i className={`fa ${selectedDocument.uploadType === 'file' ? 'fa-file' : 'fa-link'} me-1`}></i>
                                                {selectedDocument.uploadType === 'file' ? 'File Upload' : 'External Link'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {selectedDocument.description && (
                                        <div className="row mb-3">
                                            <div className="col-md-3">
                                                <strong>Description:</strong>
                                            </div>
                                            <div className="col-md-9">
                                                {selectedDocument.description}
                                            </div>
                                        </div>
                                    )}

                                    {/* File Details (if file upload) */}
                                    {selectedDocument.uploadType === 'file' && (
                                        <>
                                            <div className="row mb-3">
                                                <div className="col-md-3">
                                                    <strong>File Name:</strong>
                                                </div>
                                                <div className="col-md-9">
                                                    {selectedDocument.fileName}
                                                </div>
                                            </div>

                                            {selectedDocument.fileSize && (
                                                <div className="row mb-3">
                                                    <div className="col-md-3">
                                                        <strong>File Size:</strong>
                                                    </div>
                                                    <div className="col-md-9">
                                                        {formatFileSize(selectedDocument.fileSize)}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedDocument.mimeType && (
                                                <div className="row mb-3">
                                                    <div className="col-md-3">
                                                        <strong>File Type:</strong>
                                                    </div>
                                                    <div className="col-md-9">
                                                        {selectedDocument.mimeType}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Link Details (if link upload) */}
                                    {selectedDocument.uploadType === 'link' && selectedDocument.documentLink && (
                                        <div className="row mb-3">
                                            <div className="col-md-3">
                                                <strong>Document Link:</strong>
                                            </div>
                                            <div className="col-md-9">
                                                <a 
                                                    href={selectedDocument.documentLink} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-primary text-decoration-none"
                                                >
                                                    <i className="fa fa-external-link me-1"></i>
                                                    {selectedDocument.documentLink}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {/* Tags */}
                                    {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                                        <div className="row mb-3">
                                            <div className="col-md-3">
                                                <strong>Tags:</strong>
                                            </div>
                                            <div className="col-md-9">
                                                {selectedDocument.tags.map(tag => (
                                                    <span key={tag} className="badge bg-light text-dark me-1">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Public Access */}
                                    <div className="row mb-3">
                                        <div className="col-md-3">
                                            <strong>Access:</strong>
                                        </div>
                                        <div className="col-md-9">
                                            <span className={`badge ${selectedDocument.isPublic ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                <i className={`fa ${selectedDocument.isPublic ? 'fa-globe' : 'fa-lock'} me-1`}></i>
                                                {selectedDocument.isPublic ? 'Public' : 'Private'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Upload Details */}
                                    <div className="row mb-3">
                                        <div className="col-md-3">
                                            <strong>Uploaded By:</strong>
                                        </div>
                                        <div className="col-md-9">
                                            {selectedDocument.uploadedBy}
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-3">
                                            <strong>Upload Date:</strong>
                                        </div>
                                        <div className="col-md-9">
                                            {new Date(selectedDocument.createdAt).toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Download Statistics */}
                                    {selectedDocument.downloadCount > 0 && (
                                        <>
                                            <div className="row mb-3">
                                                <div className="col-md-3">
                                                    <strong>Downloads:</strong>
                                                </div>
                                                <div className="col-md-9">
                                                    <span className="badge bg-info">
                                                        <i className="fa fa-download me-1"></i>
                                                        {selectedDocument.downloadCount} times
                                                    </span>
                                                </div>
                                            </div>

                                            {selectedDocument.lastAccessed && (
                                                <div className="row mb-3">
                                                    <div className="col-md-3">
                                                        <strong>Last Accessed:</strong>
                                                    </div>
                                                    <div className="col-md-9">
                                                        {new Date(selectedDocument.lastAccessed).toLocaleString()}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Status */}
                                    <div className="row mb-3">
                                        <div className="col-md-3">
                                            <strong>Status:</strong>
                                        </div>
                                        <div className="col-md-9">
                                            <span className={`badge ${
                                                selectedDocument.status === 'active' ? 'bg-success' :
                                                selectedDocument.status === 'archived' ? 'bg-warning text-dark' : 'bg-danger'
                                            }`}>
                                                {selectedDocument.status.charAt(0).toUpperCase() + selectedDocument.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="modal-footer">
                                    {selectedDocument.uploadType === 'file' ? (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => {
                                                handleDownload(selectedDocument._id);
                                                setShowViewModal(false);
                                            }}
                                        >
                                            <i className="fa fa-download me-2"></i>
                                            Download File
                                        </button>
                                    ) : (
                                        <a
                                            href={selectedDocument.documentLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary"
                                            onClick={() => setShowViewModal(false)}
                                        >
                                            <i className="fa fa-external-link me-2"></i>
                                            Open Link
                                        </a>
                                    )}
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary"
                                        onClick={() => setShowViewModal(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* <FloatingMenu userType="admin" isMobile={isMobile} /> */}
            </div>
        </>
    );
};

export default Officedocs;
