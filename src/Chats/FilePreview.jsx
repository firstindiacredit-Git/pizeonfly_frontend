import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

const FilePreview = ({ show, onHide, file, onSend }) => {
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            
            // Cleanup
            return () => URL.revokeObjectURL(url);
        }
    }, [file]);

    if (!file || !previewUrl) return null;

    const fileType = file.type.split('/')[0];

    const renderPreview = () => {
        switch (fileType) {
            case 'image':
                return (
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="img-fluid"
                        style={{ 
                            maxHeight: '400px',
                            maxWidth: '100%',
                            objectFit: 'contain'
                        }}
                    />
                );
            case 'video':
                return (
                    <video
                        controls
                        className="img-fluid"
                        style={{ 
                            maxHeight: '400px',
                            maxWidth: '100%'
                        }}
                    >
                        <source src={previewUrl} type={file.type} />
                        Your browser does not support the video tag.
                    </video>
                );
            case 'audio':
                return (
                    <audio 
                        controls 
                        className="w-100"
                        style={{ marginTop: '20px' }}
                    >
                        <source src={previewUrl} type={file.type} />
                        Your browser does not support the audio element.
                    </audio>
                );
            default:
                return <div>Unsupported file type</div>;
        }
    };

    return (
        <Modal 
            show={show} 
            onHide={() => {
                onHide();
                setPreviewUrl(null);
            }} 
            centered
            size="lg"
        >
            <Modal.Header closeButton style={{ backgroundColor: '#075E54', color: 'white' }}>
                <Modal.Title>
                    <div className="d-flex align-items-center">
                        <i className={`bi bi-${fileType === 'image' ? 'image' : fileType === 'video' ? 'camera-video' : 'file-music'} me-2`}></i>
                        {file.name}
                    </div>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center p-4">
                {renderPreview()}
                <div className="mt-3 text-muted">
                    <small>
                        Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </small>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button 
                    variant="secondary" 
                    onClick={() => {
                        onHide();
                        setPreviewUrl(null);
                    }}
                >
                    Cancel
                </Button>
                <Button 
                    variant="primary" 
                    onClick={() => {
                        onSend(file);
                        onHide();
                        setPreviewUrl(null);
                    }}
                    style={{ 
                        backgroundColor: '#075E54', 
                        borderColor: '#075E54' 
                    }}
                >
                    Send
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default FilePreview; 