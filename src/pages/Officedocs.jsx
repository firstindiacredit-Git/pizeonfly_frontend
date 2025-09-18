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
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState('single'); // 'single' or 'bulk'

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
            
            // Get the filename from response headers or use document data
            let filename = 'document';
            const contentDisposition = response.headers['content-disposition'];
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            } else {
                // Fallback: get filename from document data
                const doc = documents.find(d => d._id === documentId);
                if (doc && doc.fileName) {
                    // Extract original filename from the stored filename
                    const parts = doc.fileName.split('-');
                    if (parts.length >= 3) {
                        // Remove 'doc-' prefix and timestamp, keep original name
                        filename = parts.slice(2).join('-');
                    } else {
                        filename = doc.fileName;
                    }
                }
            }
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading document:', error);
            alert('Error downloading document. Please try again.');
        }
    };

    const handleDelete = (documentId) => {
        setDocumentToDelete(documentId);
        setDeleteType('single');
        setShowDeleteModal(true);
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

    const handleSelectDocument = (documentId) => {
        setSelectedDocuments(prev => {
            const newSelected = prev.includes(documentId) 
                ? prev.filter(id => id !== documentId)
                : [...prev, documentId];
            setShowBulkActions(newSelected.length > 0);
            return newSelected;
        });
    };

    const handleSelectAll = () => {
        if (selectedDocuments.length === documents.length) {
            // Deselect all
            setSelectedDocuments([]);
            setShowBulkActions(false);
        } else {
            // Select all
            const allIds = documents.map(doc => doc._id);
            setSelectedDocuments(allIds);
            setShowBulkActions(true);
        }
    };

    const handleBulkDelete = () => {
        if (selectedDocuments.length === 0) return;
        setDeleteType('bulk');
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            setLoading(true);
            
            if (deleteType === 'bulk') {
                // Delete all selected documents
                const deletePromises = selectedDocuments.map(documentId => 
                    axios.delete(`${import.meta.env.VITE_BASE_URL}api/office-docs/${documentId}`)
                );
                
                await Promise.all(deletePromises);
                
                // Reset selections
                setSelectedDocuments([]);
                setShowBulkActions(false);
                
                alert(`Successfully deleted ${selectedDocuments.length} document(s)`);
            } else {
                // Delete single document
                await axios.delete(`${import.meta.env.VITE_BASE_URL}api/office-docs/${documentToDelete}`);
                alert('Document deleted successfully');
            }
            
            // Refresh data
            fetchDocuments();
            fetchStats();
            
            // Close modal
            setShowDeleteModal(false);
            setDocumentToDelete(null);
            
        } catch (error) {
            console.error('Error deleting document(s):', error);
            alert('Error deleting document(s). Please try again.');
        } finally {
            setLoading(false);
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
                        <div className="border-bottom mb-4">
                            <div className="card-header py-4 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between" style={{
                                borderBottom: '2px solid rgba(65, 105, 225, 0.2)',
                                backgroundColor: 'transparent',
                                padding: '0 0 20px 0'
                            }}>
                                <h3 className="flex-fill mb-3 mb-sm-0" style={{
                                    fontWeight: '700',
                                    color: '#333',
                                    fontSize: '24px',
                                    position: 'relative',
                                    paddingLeft: '15px'
                                }}>
                                    <span style={{
                                        position: 'absolute',
                                        left: '0',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '5px',
                                        height: '24px',
                                        background: 'linear-gradient(to bottom, #4169e1, #1e40af)',
                                        borderRadius: '3px'
                                    }}></span>
                                    Office Documents
                                </h3>
                                <div className="d-flex flex-column flex-sm-row align-items-center">
                                    <button 
                                        type="button"
                                        className="btn mb-3 mb-sm-0 me-sm-3"
                                        onClick={() => setShowUploadModal(true)}
                                        style={{
                                            background: 'linear-gradient(135deg, #ff70b4, #ff69b4)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '10px 18px',
                                            fontWeight: '600',
                                            boxShadow: '0 4px 10px rgba(65, 105, 225, 0.2)',
                                            transition: 'all 0.2s ease',
                                            fontSize: '14px'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 6px 12px rgba(65, 105, 225, 0.3)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 10px rgba(65, 105, 225, 0.2)';
                                        }}
                                    >
                                        <i className="fa fa-plus me-2" style={{ fontSize: '16px' }} />
                                        Upload Document
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        {/* <div className="row mb-4 g-3">
                            <div className="col-md-3">
                                <div className="card h-100" style={{
                                    background: 'linear-gradient(135deg, #4169e1, #1e40af)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    boxShadow: '0 6px 15px rgba(65, 105, 225, 0.2)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(65, 105, 225, 0.3)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 6px 15px rgba(65, 105, 225, 0.2)';
                                }}>
                                    <div className="card-body text-white" style={{ padding: '20px' }}>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div>
                                                <h3 className="mb-1" style={{ fontWeight: '700', fontSize: '28px' }}>
                                                    {stats.totalDocuments || 0}
                                                </h3>
                                                <p className="mb-0" style={{ fontSize: '14px', opacity: '0.9' }}>
                                                    Total Documents
                                                </p>
                                            </div>
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '50%',
                                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <i className="fa fa-file-o" style={{ fontSize: '24px' }}></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card h-100" style={{
                                    background: 'linear-gradient(135deg, #28a745, #20c997)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    boxShadow: '0 6px 15px rgba(40, 167, 69, 0.2)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(40, 167, 69, 0.3)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 6px 15px rgba(40, 167, 69, 0.2)';
                                }}>
                                    <div className="card-body text-white" style={{ padding: '20px' }}>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div>
                                                <h3 className="mb-1" style={{ fontWeight: '700', fontSize: '28px' }}>
                                                    {stats.fileDocuments || 0}
                                                </h3>
                                                <p className="mb-0" style={{ fontSize: '14px', opacity: '0.9' }}>
                                                    File Documents
                                                </p>
                                            </div>
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '50%',
                                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <i className="fa fa-file-text-o" style={{ fontSize: '24px' }}></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card h-100" style={{
                                    background: 'linear-gradient(135deg, #ff70b4, #ff69b4)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    boxShadow: '0 6px 15px rgba(255, 105, 180, 0.2)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 105, 180, 0.3)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 6px 15px rgba(255, 105, 180, 0.2)';
                                }}>
                                    <div className="card-body text-white" style={{ padding: '20px' }}>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div>
                                                <h3 className="mb-1" style={{ fontWeight: '700', fontSize: '28px' }}>
                                                    {stats.linkDocuments || 0}
                                                </h3>
                                                <p className="mb-0" style={{ fontSize: '14px', opacity: '0.9' }}>
                                                    Link Documents
                                                </p>
                                            </div>
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '50%',
                                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <i className="fa fa-link" style={{ fontSize: '24px' }}></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card h-100" style={{
                                    background: 'linear-gradient(135deg, #ffc107, #fd7e14)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    boxShadow: '0 6px 15px rgba(255, 193, 7, 0.2)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 193, 7, 0.3)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 6px 15px rgba(255, 193, 7, 0.2)';
                                }}>
                                    <div className="card-body text-white" style={{ padding: '20px' }}>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div>
                                                <h3 className="mb-1" style={{ fontWeight: '700', fontSize: '28px' }}>
                                                    {stats.storageUsedMB || 0}
                                                </h3>
                                                <p className="mb-0" style={{ fontSize: '14px', opacity: '0.9' }}>
                                                    Storage (MB)
                                                </p>
                                            </div>
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '50%',
                                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <i className="fa fa-database" style={{ fontSize: '24px' }}></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div> */}

                        {/* Bulk Actions Bar */}
                        {showBulkActions && (
                            <div className="row mb-3">
                                <div className="col-12">
                                    <div className="alert alert-info d-flex justify-content-between align-items-center mb-0">
                                        <div>
                                            <i className="fa fa-check-square-o me-2"></i>
                                            <strong>{selectedDocuments.length}</strong> document(s) selected
                                        </div>
                                        <div>
                                            <button
                                                className="btn btn-danger btn-sm me-2"
                                                onClick={handleBulkDelete}
                                                disabled={loading}
                                            >
                                                <i className="fa fa-trash me-1"></i>
                                                Delete Selected
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => {
                                                    setSelectedDocuments([]);
                                                    setShowBulkActions(false);
                                                }}
                                            >
                                                <i className="fa fa-times me-1"></i>
                                                Clear Selection
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Search, Filter and View Toggle */}
                        <div className="d-flex justify-content-between mt-3 mb-3">
                            <div>
                                <div className="d-flex gap-3">
                                    {viewMode === 'grid' ? (
                                        <button
                                            className="btn btn-outline-primary"
                                            onClick={() => setViewMode('list')}
                                            title="Switch to List View"
                                            style={{
                                                borderRadius: '8px',
                                                border: '1px solid rgba(65, 105, 225, 0.3)',
                                                color: '#4169e1',
                                                backgroundColor: 'rgba(65, 105, 225, 0.05)',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.1)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.05)';
                                            }}
                                        >
                                            <i className="fa fa-list"></i>
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-outline-primary"
                                            onClick={() => setViewMode('grid')}
                                            title="Switch to Grid View"
                                            style={{
                                                borderRadius: '8px',
                                                border: '1px solid rgba(65, 105, 225, 0.3)',
                                                color: '#4169e1',
                                                backgroundColor: 'rgba(65, 105, 225, 0.05)',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.1)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.05)';
                                            }}
                                        >
                                            <i className="fa fa-th"></i>
                                        </button>
                                    )}
                                    <div className="form-check d-flex align-items-center" style={{
                                        backgroundColor: 'rgba(255, 105, 180, 0.05)',
                                        padding: '8px 40px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255, 105, 180, 0.2)'
                                    }}>
                                        <input
                                            className="form-check-input me-2"
                                            type="checkbox"
                                            id="selectAll"
                                            checked={documents.length > 0 && selectedDocuments.length === documents.length}
                                            onChange={handleSelectAll}
                                            style={{ borderColor: '#ff69b4' }}
                                        />
                                        <label className="form-check-label" htmlFor="selectAll" style={{
                                            color: '#ff69b4',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            margin: 0
                                        }}>
                                            Select All
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex gap-3 align-items-center">
                                <div style={{
                                    backgroundColor: 'rgba(65, 105, 225, 0.05)',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(65, 105, 225, 0.2)'
                                }}>
                                    <select
                                        className="form-select"
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        style={{
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            color: '#4169e1',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            padding: '0',
                                            minWidth: '120px'
                                        }}
                                    >
                                        <option value="all">All Types</option>
                                        {documentTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group" style={{
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    maxWidth: '300px'
                                }}>
                                    <input
                                        type="search"
                                        className="form-control"
                                        placeholder="Search documents..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            border: '1px solid rgba(65, 105, 225, 0.2)',
                                            borderRight: 'none',
                                            padding: '10px 15px',
                                            fontSize: '14px',
                                            color: '#333'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="input-group-text"
                                        style={{
                                            backgroundColor: '#4169e1',
                                            border: 'none',
                                            color: 'white',
                                            padding: '0 15px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <i className="fa fa-search" />
                                    </button>
                                </div>
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
                            ) : viewMode === 'grid' ? (
                                /* Grid View */
                                <div className="row">
                                    {documents.map((doc, index) => (
                                        <div key={doc._id} className="col-md-6 col-lg-4 mb-3" style={{ padding: '12px' }}>
                                            <div className={`card task-card ${selectedDocuments.includes(doc._id) ? 'border-primary' : ''}`} style={{
                                                backgroundColor: '#ffffff',
                                                color: 'inherit',
                                                height: '320px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                borderRadius: '20px',
                                                boxShadow: selectedDocuments.includes(doc._id) 
                                                    ? '0 15px 35px rgba(65, 105, 225, 0.2)' 
                                                    : '0 10px 25px rgba(0,0,0,0.05)',
                                                border: selectedDocuments.includes(doc._id) 
                                                    ? '2px solid #4169e1' 
                                                    : 'none',
                                                overflow: 'hidden',
                                                position: 'relative',
                                                transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-10px)';
                                                e.currentTarget.style.boxShadow = '0 20px 35px rgba(0,0,0,0.1)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = selectedDocuments.includes(doc._id) 
                                                    ? '0 15px 35px rgba(65, 105, 225, 0.2)' 
                                                    : '0 10px 25px rgba(0,0,0,0.05)';
                                            }}>
                                                {/* Gradient Border Effect */}
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: '6px',
                                                    background: doc.uploadType === 'file' 
                                                        ? 'linear-gradient(90deg, #4169e1, #1e40af, #28a745)' 
                                                        : 'linear-gradient(90deg, #ff70b4, #ff69b4, #ffc107)',
                                                    opacity: 0.9
                                                }}></div>
                                                
                                                <div className="card-body d-flex flex-column" style={{ padding: '20px' }}>
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <div className="d-flex align-items-center">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input me-2"
                                                                checked={selectedDocuments.includes(doc._id)}
                                                                onChange={() => handleSelectDocument(doc._id)}
                                                                style={{
                                                                    borderColor: '#4169e1',
                                                                    borderRadius: '4px'
                                                                }}
                                                            />
                                                            <div style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius: '50%',
                                                                backgroundColor: doc.uploadType === 'file' 
                                                                    ? 'rgba(65, 105, 225, 0.1)' 
                                                                    : 'rgba(255, 105, 180, 0.1)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}>
                                                                <i className={`fa ${
                                                                    doc.uploadType === 'file' 
                                                                        ? doc.mimeType?.startsWith('image/') ? 'fa-file-image-o'
                                                                        : doc.mimeType === 'application/pdf' ? 'fa-file-pdf-o'
                                                                        : doc.mimeType?.includes('word') ? 'fa-file-word-o'
                                                                        : doc.mimeType?.includes('excel') ? 'fa-file-excel-o'
                                                                        : doc.mimeType?.includes('powerpoint') ? 'fa-file-powerpoint-o'
                                                                        : 'fa-file-o'
                                                                        : 'fa-link'
                                                                }`} style={{ 
                                                                    fontSize: '20px', 
                                                                    color: doc.uploadType === 'file' ? '#4169e1' : '#ff69b4' 
                                                                }}></i>
                                                            </div>
                                                        </div>
                                                        <span className={`badge ${doc.uploadType === 'file' ? 'bg-success' : 'bg-info'}`} style={{
                                                            padding: '6px 12px',
                                                            borderRadius: '20px',
                                                            fontSize: '12px',
                                                            fontWeight: '600'
                                                        }}>
                                                            {doc.uploadType === 'file' ? 'File' : 'Link'}
                                                        </span>
                                                    </div>
                                                    
                                                    <h6 className="card-title text-center mb-2" style={{
                                                        color: '#1a1a1a',
                                                        fontWeight: '700',
                                                        fontSize: '16px',
                                                        letterSpacing: '-0.3px'
                                                    }}>
                                                        {doc.title}
                                                    </h6>
                                                    
                                                    <div className="text-center mb-2">
                                                        <span className="badge" style={{
                                                            backgroundColor: 'rgba(255, 105, 180, 0.1)',
                                                            color: '#ff69b4',
                                                            padding: '4px 10px',
                                                            borderRadius: '12px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            border: '1px solid rgba(255, 105, 180, 0.2)'
                                                        }}>
                                                            {doc.documentType}
                                                        </span>
                                                    </div>
                                                    
                                                    {doc.description && (
                                                        <p className="text-muted text-center small mb-2" style={{
                                                            fontSize: '13px',
                                                            lineHeight: '1.4',
                                                            height: '35px',
                                                            overflow: 'hidden',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical'
                                                        }}>
                                                            {doc.description}
                                                        </p>
                                                    )}
                                                    
                                                    <div className="mt-auto">
                                                        <div className="d-flex justify-content-between align-items-center mb-3" style={{
                                                            borderTop: '1px solid rgba(65, 105, 225, 0.1)',
                                                            paddingTop: '12px'
                                                        }}>
                                                            <div className="text-center flex-grow-1">
                                                                {doc.uploadType === 'file' && doc.fileSize && (
                                                                    <div style={{
                                                                        backgroundColor: 'rgba(65, 105, 225, 0.05)',
                                                                        padding: '6px 10px',
                                                                        borderRadius: '8px',
                                                                        fontSize: '12px',
                                                                        color: '#4169e1',
                                                                        fontWeight: '600'
                                                                    }}>
                                                                        <i className="fa fa-hdd-o me-1"></i>
                                                                        {formatFileSize(doc.fileSize)}
                                                                    </div>
                                                                )}
                                                                {doc.tags && doc.tags.length > 0 && (
                                                                    <div className="mt-2">
                                                                        {doc.tags.slice(0, 2).map(tag => (
                                                                            <span key={tag} className="badge me-1" style={{
                                                                                backgroundColor: 'rgba(255, 105, 180, 0.1)',
                                                                                color: '#ff69b4',
                                                                                fontSize: '10px',
                                                                                padding: '3px 8px',
                                                                                borderRadius: '10px'
                                                                            }}>
                                                                                {tag}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="text-center mb-3">
                                                            <small className="text-muted" style={{ fontSize: '11px' }}>
                                                                <i className="fa fa-clock-o me-1" style={{ color: '#4169e1' }}></i>
                                                                {new Date(doc.createdAt).toLocaleDateString()}
                                                            </small>
                                                        </div>
                                                        
                                                        <div className="d-flex justify-content-center gap-2">
                                                            <button
                                                                className="btn"
                                                                onClick={() => handleViewDocument(doc._id)}
                                                                title="View Details"
                                                                style={{
                                                                    backgroundColor: 'rgba(65, 105, 225, 0.1)',
                                                                    color: '#4169e1',
                                                                    width: '35px',
                                                                    height: '35px',
                                                                    borderRadius: '50%',
                                                                    padding: '0',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    border: 'none',
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                                onMouseOver={(e) => {
                                                                    e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.2)';
                                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                                }}
                                                                onMouseOut={(e) => {
                                                                    e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.1)';
                                                                    e.currentTarget.style.transform = 'scale(1)';
                                                                }}
                                                            >
                                                                <i className="fa fa-eye"></i>
                                                            </button>
                                                            {doc.uploadType === 'file' ? (
                                                                <button
                                                                    className="btn"
                                                                    onClick={() => handleDownload(doc._id)}
                                                                    title="Download"
                                                                    style={{
                                                                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                                                                        color: '#28a745',
                                                                        width: '35px',
                                                                        height: '35px',
                                                                        borderRadius: '50%',
                                                                        padding: '0',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        border: 'none',
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                    onMouseOver={(e) => {
                                                                        e.currentTarget.style.backgroundColor = 'rgba(40, 167, 69, 0.2)';
                                                                        e.currentTarget.style.transform = 'scale(1.1)';
                                                                    }}
                                                                    onMouseOut={(e) => {
                                                                        e.currentTarget.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
                                                                        e.currentTarget.style.transform = 'scale(1)';
                                                                    }}
                                                                >
                                                                    <i className="fa fa-download"></i>
                                                                </button>
                                                            ) : (
                                                                <a
                                                                    href={doc.documentLink}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="btn"
                                                                    title="Open Link"
                                                                    style={{
                                                                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                                                                        color: '#28a745',
                                                                        width: '35px',
                                                                        height: '35px',
                                                                        borderRadius: '50%',
                                                                        padding: '0',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        border: 'none',
                                                                        transition: 'all 0.2s ease',
                                                                        textDecoration: 'none'
                                                                    }}
                                                                    onMouseOver={(e) => {
                                                                        e.currentTarget.style.backgroundColor = 'rgba(40, 167, 69, 0.2)';
                                                                        e.currentTarget.style.transform = 'scale(1.1)';
                                                                    }}
                                                                    onMouseOut={(e) => {
                                                                        e.currentTarget.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
                                                                        e.currentTarget.style.transform = 'scale(1)';
                                                                    }}
                                                                >
                                                                    <i className="fa fa-external-link"></i>
                                                                </a>
                                                            )}
                                                            <button
                                                                className="btn"
                                                                onClick={() => handleDelete(doc._id)}
                                                                title="Delete"
                                                                style={{
                                                                    backgroundColor: 'rgba(255, 105, 180, 0.1)',
                                                                    color: '#ff69b4',
                                                                    width: '35px',
                                                                    height: '35px',
                                                                    borderRadius: '50%',
                                                                    padding: '0',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    border: 'none',
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                                onMouseOver={(e) => {
                                                                    e.currentTarget.style.backgroundColor = 'rgba(255, 105, 180, 0.2)';
                                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                                }}
                                                                onMouseOut={(e) => {
                                                                    e.currentTarget.style.backgroundColor = 'rgba(255, 105, 180, 0.1)';
                                                                    e.currentTarget.style.transform = 'scale(1)';
                                                                }}
                                                            >
                                                                <i className="fa fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* List View */
                                <div className="list-group">
                                    {documents.map(doc => (
                                        <div key={doc._id} className={`list-group-item list-group-item-action mb-2 border rounded ${selectedDocuments.includes(doc._id) ? 'border-primary bg-light' : ''}`}>
                                            <div className="d-flex w-100 justify-content-between align-items-start">
                                                <div className="flex-grow-1">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <div className="me-3">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input me-2"
                                                                checked={selectedDocuments.includes(doc._id)}
                                                                onChange={() => handleSelectDocument(doc._id)}
                                                            />
                                                            <i className={`fa ${
                                                                doc.uploadType === 'file' 
                                                                    ? doc.mimeType?.startsWith('image/') ? 'fa-file-image-o'
                                                                    : doc.mimeType === 'application/pdf' ? 'fa-file-pdf-o'
                                                                    : doc.mimeType?.includes('word') ? 'fa-file-word-o'
                                                                    : doc.mimeType?.includes('excel') ? 'fa-file-excel-o'
                                                                    : doc.mimeType?.includes('powerpoint') ? 'fa-file-powerpoint-o'
                                                                    : 'fa-file-o'
                                                                    : 'fa-link'
                                                            } fa-2x text-primary`}></i>
                                                        </div>
                                                        <div className="flex-grow-1">
                                                            <h6 className="mb-1">{doc.title}</h6>
                                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                                <span className="badge bg-secondary">{doc.documentType}</span>
                                                                <span className={`badge ${doc.uploadType === 'file' ? 'bg-success' : 'bg-info'}`}>
                                                                    {doc.uploadType === 'file' ? 'File' : 'Link'}
                                                                </span>
                                                                {doc.uploadType === 'file' && doc.fileSize && (
                                                                    <small className="text-muted">
                                                                        {formatFileSize(doc.fileSize)}
                                                                    </small>
                                                                )}
                                                            </div>
                                                            {doc.description && (
                                                                <p className="mb-1 text-muted small">{doc.description}</p>
                                                            )}
                                                            <div className="d-flex align-items-center gap-2">
                                                                {doc.tags && doc.tags.length > 0 && (
                                                                    <div>
                                                                        {doc.tags.slice(0, 3).map(tag => (
                                                                            <span key={tag} className="badge bg-light text-dark me-1 small">
                                                                                {tag}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                <small className="text-muted">
                                                                    Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="btn-group-vertical">
                                                    <button
                                                        className="btn btn-sm btn-outline-info mb-1"
                                                        onClick={() => handleViewDocument(doc._id)}
                                                        title="View Details"
                                                    >
                                                        <i className="fa fa-eye"></i>
                                                    </button>
                                                    {doc.uploadType === 'file' ? (
                                                        <button
                                                            className="btn btn-sm btn-outline-primary mb-1"
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
                                                            className="btn btn-sm btn-outline-primary mb-1"
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
                                                    <div>
                                                        <span className="badge bg-primary me-2">Original:</span>
                                                        {selectedDocument.originalFileName || 'Unknown'}
                                                    </div>
                                                    {selectedDocument.fileName && (
                                                        <div className="mt-1">
                                                            <span className="badge bg-secondary me-2">Stored:</span>
                                                            <small className="text-muted">{selectedDocument.fileName}</small>
                                                        </div>
                                                    )}
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

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                        <div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
                            <div className="modal-content" style={{
                                borderRadius: '15px',
                                border: 'none',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                overflow: 'hidden'
                            }}>
                                <div className="modal-header" style={{
                                    background: 'linear-gradient(135deg, #ff70b4, #ff69b4)',
                                    borderBottom: 'none',
                                    padding: '20px 25px',
                                    position: 'relative'
                                }}>
                                    <h5 className="modal-title fw-bold" style={{
                                        color: 'white',
                                        fontSize: '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <i className="fa fa-exclamation-triangle" style={{ fontSize: '22px' }}></i>
                                        {deleteType === 'bulk' 
                                            ? `Delete ${selectedDocuments.length} Documents?`
                                            : 'Delete Document?'
                                        }
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowDeleteModal(false)}
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            borderRadius: '50%',
                                            padding: '8px',
                                            opacity: '1',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                                            e.currentTarget.style.transform = 'rotate(90deg)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                                            e.currentTarget.style.transform = 'rotate(0deg)';
                                        }}
                                    />
                                </div>
                                <div className="modal-body justify-content-center flex-column d-flex" style={{ padding: '30px 25px' }}>
                                    <div className="text-center mb-4">
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            backgroundColor: 'rgba(255, 105, 180, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 20px auto'
                                        }}>
                                            <i className="fa fa-trash fa-2x" style={{ color: '#ff69b4' }}></i>
                                        </div>
                                        <h5 style={{ color: '#333', fontWeight: '600', marginBottom: '15px' }}>
                                            {deleteType === 'bulk' 
                                                ? 'Delete Multiple Documents'
                                                : 'Delete Document Permanently'
                                            }
                                        </h5>
                                        <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                                            {deleteType === 'bulk' 
                                                ? `You are about to delete ${selectedDocuments.length} selected document(s). This action cannot be undone.`
                                                : 'You can only delete this document permanently. This action cannot be undone.'
                                            }
                                        </p>
                                    </div>
                                </div>
                                <div className="modal-footer" style={{
                                    borderTop: '1px solid rgba(255, 105, 180, 0.1)',
                                    padding: '16px 25px'
                                }}>
                                    <button
                                        type="button"
                                        className="btn"
                                        onClick={() => setShowDeleteModal(false)}
                                        style={{
                                            backgroundColor: 'rgba(108, 117, 125, 0.1)',
                                            color: '#6c757d',
                                            border: '1px solid rgba(108, 117, 125, 0.3)',
                                            borderRadius: '8px',
                                            padding: '8px 20px',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(108, 117, 125, 0.2)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(108, 117, 125, 0.1)';
                                        }}
                                    >
                                        <i className="fa fa-times me-2"></i>
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn"
                                        onClick={confirmDelete}
                                        disabled={loading}
                                        style={{
                                            background: 'linear-gradient(135deg, #ff70b4, #ff69b4)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '8px 20px',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            boxShadow: '0 4px 10px rgba(255, 105, 180, 0.2)',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 6px 12px rgba(255, 105, 180, 0.3)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 10px rgba(255, 105, 180, 0.2)';
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa fa-trash me-2"></i>
                                                {deleteType === 'bulk' ? 'Delete All' : 'Delete'}
                                            </>
                                        )}
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
