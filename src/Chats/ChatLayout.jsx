import React, { useState, useEffect } from 'react';
import { Modal, Dropdown } from 'react-bootstrap';
import EmojiPicker from 'emoji-picker-react';

const ChatLayout = ({
    users,
    selectedUser,
    messages,
    newMessage,
    activeTab,
    tabs,
    onTabChange,
    onUserSelect,
    onMessageChange,
    onMessageSubmit,
    onFileUpload,
    onVoiceRecordingComplete,
    messagesEndRef,
    renderUserItem
}) => {
    const [showUserModal, setShowUserModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);

    const handleClickOutside = (event) => {
        const emojiPicker = document.querySelector('.EmojiPickerReact');
        if (emojiPicker && !emojiPicker.contains(event.target) && 
            !event.target.closest('button[data-emoji-button="true"]')) {
            setShowEmojiPicker(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                onVoiceRecordingComplete(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="container-fluid mt-2" style={{}}>
            <div className="row g-0 rounded-2" style={{ height: '94vh', border: '1px solid #00000061' }}>


                {/* Chat Area */}
                <div className="col-lg-9 col-md-12 rounded-2" style={{ height: '93vh', backgroundColor: '#efeae2' }}>
                    {selectedUser ? (
                        <div className="card border-0" style={{ height: '93.7vh' }}>
                            {/* Chat Header - WhatsApp style */}
                            <div className="card-header py-2 px-4 " style={{ backgroundColor: '#075E54', color: 'white', height: '50px' }}>
                                <div className="d-flex align-items-center">
                                    <div onClick={() => setShowUserModal(true)} style={{ cursor: 'pointer' }}>
                                        {selectedUser.userType === 'AdminUser' ? (
                                            <img
                                                src={`${import.meta.env.VITE_BASE_URL}${selectedUser.profileImage.replace('uploads/', '')}`}
                                                className="avatar rounded-circle"
                                                alt={selectedUser.username}
                                                style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                                            />
                                        ) : (
                                            <img
                                                src={`${import.meta.env.VITE_BASE_URL}${selectedUser.userType === 'Employee'
                                                    ? selectedUser.employeeImage.replace('uploads/', '')
                                                    : selectedUser.clientImage.replace('uploads/', '')
                                                    }`}
                                                className="avatar rounded-circle"
                                                alt={selectedUser.employeeName || selectedUser.clientName}
                                                style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                                            />
                                        )}
                                    </div>
                                    <div className="flex-fill ms-3">
                                        <h6 className="mb-0 fw-bold">
                                            {selectedUser.employeeName || selectedUser.clientName || selectedUser.username}
                                        </h6>
                                        <small className="text-muted">{selectedUser.userType}</small>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Area - WhatsApp style */}
                            <div className="card-body chat-box p-4"
                                style={{
                                    height: 'calc(93vh - 140px)',
                                    overflowY: 'auto',
                                    backgroundColor: '#efeae2',
                                    backgroundImage: `url("data:image/png;base64,...")`,
                                    msOverflowStyle: 'none',
                                    scrollbarWidth: 'none',
                                    '&::-webkit-scrollbar': { display: 'none' }
                                }}>
                                {messages.map((msg, index) => (
                                    <div key={index}
                                        className={`chat-message d-flex ${msg.isCurrentUser ? 'justify-content-end' : 'justify-content-start'} mb-3`}>
                                        <div className={`message-bubble px-2  rounded-1 ${msg.isCurrentUser ? 'text-white' : 'bg-white'
                                            }`}
                                            style={{
                                                maxWidth: '75%',
                                                position: 'relative',
                                                backgroundColor: msg.isCurrentUser ? '#075E54' : '#ffffff',
                                                borderRadius: '7.5px'
                                            }}>
                                            {/* Text message */}
                                            {msg.message && <div className="mb-1">{msg.message}</div>}
                                            
                                            {/* Images */}
                                            {msg.imageUrls && msg.imageUrls.map((url, i) => (
                                                <img 
                                                    key={i}
                                                    src={`${import.meta.env.VITE_BASE_URL}${url}`}
                                                    alt="Shared image"
                                                    className="img-fluid rounded mb-1"
                                                    style={{ maxHeight: '200px', cursor: 'pointer' }}
                                                    onClick={() => setShowImageModal(true)}
                                                />
                                            ))}
                                            
                                            {/* Video */}
                                            {msg.videoUrl && (
                                                <video 
                                                    controls 
                                                    className="img-fluid rounded mb-1"
                                                    style={{ maxHeight: '200px' }}
                                                >
                                                    <source src={`${import.meta.env.VITE_BASE_URL}${msg.videoUrl}`} type="video/mp4" />
                                                    Your browser does not support the video tag.
                                                </video>
                                            )}
                                            
                                            {/* Audio */}
                                            {msg.audioUrl && (
                                                <audio controls className="w-100 mb-1">
                                                    <source src={`${import.meta.env.VITE_BASE_URL}${msg.audioUrl}`} type="audio/mpeg" />
                                                    Your browser does not support the audio element.
                                                </audio>
                                            )}
                                            
                                            {/* Voice Recording */}
                                            {msg.recordingUrl && (
                                                <audio controls className="w-100 mb-1">
                                                    <source src={`${import.meta.env.VITE_BASE_URL}${msg.recordingUrl}`} type="audio/webm" />
                                                    Your browser does not support the audio element.
                                                </audio>
                                            )}

                                            <small className={`d-block text-end ${msg.isCurrentUser ? 'text-white-50' : 'text-muted'}`}
                                                style={{ fontSize: '0.6rem' }}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </small>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input - WhatsApp style */}
                            <div className="card-footer py-2 px-3" style={{ backgroundColor: '#80808069' }}>
                                <form onSubmit={onMessageSubmit}>
                                    <div className="input-group">
                                        {/* Emoji Picker */}
                                        <div className="position-relative">
                                            <button 
                                                type="button"
                                                className="btn"
                                                data-emoji-button="true"
                                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                style={{ backgroundColor: 'transparent', border: 'none' }}
                                            >
                                                <i className="bi bi-emoji-smile" style={{ color: '#54656f' }}></i>
                                            </button>
                                            {showEmojiPicker && (
                                                <div className="position-absolute bottom-100 start-0" style={{ zIndex: 1000 }}>
                                                    <EmojiPicker onEmojiClick={(emojiObj) => {
                                                        onMessageChange({ target: { value: newMessage + emojiObj.emoji } });
                                                    }} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Attachment Button */}
                                        <Dropdown>
                                            <Dropdown.Toggle variant="transparent" style={{ border: 'none' }}>
                                                <i className="bi bi-paperclip" style={{ color: '#54656f' }}></i>
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu>
                                                <Dropdown.Item onClick={() => document.getElementById('imageUpload').click()}>
                                                    <i className="bi bi-image me-2"></i>Image
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={() => document.getElementById('videoUpload').click()}>
                                                    <i className="bi bi-camera-video me-2"></i>Video
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={() => document.getElementById('audioUpload').click()}>
                                                    <i className="bi bi-file-music me-2"></i>Audio
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>

                                        {/* Hidden file inputs */}
                                        <input
                                            type="file"
                                            id="imageUpload"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={onFileUpload}
                                            multiple
                                        />
                                        <input
                                            type="file"
                                            id="videoUpload"
                                            accept="video/*"
                                            style={{ display: 'none' }}
                                            onChange={onFileUpload}
                                        />
                                        <input
                                            type="file"
                                            id="audioUpload"
                                            accept="audio/*"
                                            style={{ display: 'none' }}
                                            onChange={onFileUpload}
                                        />

                                        {/* Message Input */}
                                        <input
                                            type="text"
                                            className="form-control rounded-pill me-2"
                                            placeholder="Type a message"
                                            value={newMessage}
                                            onChange={onMessageChange}
                                            style={{
                                                backgroundColor: '#ffffff',
                                                border: 'none',
                                                padding: '5px 20px'
                                            }}
                                        />

                                        {/* Send/Record Button */}
                                        <button 
                                            type="submit"
                                            className="btn rounded-circle d-flex align-items-center justify-content-center"
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                backgroundColor: '#00a884',
                                                color: 'white',
                                                marginLeft: '8px'
                                            }}
                                            onMouseDown={!newMessage ? startRecording : undefined}
                                            onMouseUp={!newMessage ? stopRecording : undefined}
                                            onClick={newMessage ? onMessageSubmit : undefined}
                                        >
                                            {newMessage ? (
                                                <i className="bi bi-send"></i>
                                            ) : (
                                                <i className={`bi ${isRecording ? 'bi-mic-fill' : 'bi-mic'}`}></i>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="card border-0 h-100 d-flex align-items-center justify-content-center"
                            style={{ backgroundColor: '#f0f2f5' }}>
                            <div className="text-center text-muted">
                                <i className="bi bi-chat-dots" style={{ fontSize: '4rem', color: '#128C7E' }}></i>
                                <h5 className="mt-3">Select a chat to start messaging</h5>
                            </div>
                        </div>
                    )}
                </div>
                {/* Users List */}
                <div className="col-lg-3 col-md-12 border-start" style={{ height: '93vh', backgroundColor: '#ffffff', borderLeftColor: '#00000061' }}>
                    <div className="card border-0 h-100">
                        <div className="card-body p-0">
                            {/* Tabs - WhatsApp style */}
                            <div className="px-4 py-2" style={{ backgroundColor: '#075E54', height: '50px' }}>
                                <ul className="nav nav-pills" role="tablist">
                                    {tabs.map(tab => (
                                        <li key={tab.id} className="nav-item">
                                            <button
                                                className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                                                onClick={() => onTabChange(tab.id)}
                                                style={{
                                                    backgroundColor: activeTab === tab.id ? '#128C7E' : 'transparent',
                                                    color: 'white'
                                                }}
                                            >
                                                {tab.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Users List - WhatsApp style */}
                            <div className="tab-content" style={{
                                height: 'calc(96vh - 70px)',
                                overflowY: 'auto',
                                msOverflowStyle: 'none',
                                scrollbarWidth: 'none',
                                '&::-webkit-scrollbar': { display: 'none' }
                            }}>
                                <div className="tab-pane fade show active">
                                    <ul className="list-unstyled list-group list-group-custom list-group-flush mb-0" style={{ cursor: 'pointer' }}>
                                        {users.map(user => renderUserItem(user, selectedUser, onUserSelect))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal show={showUserModal} onHide={() => setShowUserModal(false)} centered>
                <Modal.Header closeButton style={{ backgroundColor: '#075E54', color: 'white' }}>
                    <Modal.Title>{selectedUser?.employeeName || selectedUser?.clientName || selectedUser?.username}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center mb-4">
                        <img
                            src={`${import.meta.env.VITE_BASE_URL}${selectedUser?.userType === 'Employee'
                                ? selectedUser?.employeeImage.replace('uploads/', '')
                                : selectedUser?.userType === 'AdminUser'
                                    ? selectedUser?.profileImage.replace('uploads/', '')
                                    : selectedUser?.clientImage.replace('uploads/', '')
                                }`}
                            className="rounded-circle"
                            alt="Profile"
                            style={{ width: '100px', height: '100px', objectFit: 'contain', cursor: 'pointer' }}
                            onClick={() => setShowImageModal(true)}
                        />
                    </div>
                    <div className="user-details">
                        <h5 className="text-center mb-3">
                            {selectedUser?.employeeName || selectedUser?.clientName || selectedUser?.username}
                        </h5>
                        <div className="info-item mb-2">
                            <strong>Type:</strong> {selectedUser?.userType}
                        </div>
                        {selectedUser?.userType === 'AdminUser' && (
                            <>
                                <div className="info-item mb-2">
                                    <strong>Email:</strong> {selectedUser?.email}
                                </div>
                                <div className="info-item mb-2">
                                    <strong>Username:</strong> {selectedUser?.username}
                                </div>
                                <div className="info-item mb-2">
                                    <strong>Role:</strong> {selectedUser?.role}
                                </div>
                                <div className="info-item mb-2">
                                    <strong>Status:</strong> {selectedUser?.status}
                                </div>
                            </>
                        )}
                        {selectedUser?.userType === 'Employee' && (
                            <>
                                <div className="info-item mb-2">
                                    <strong>Employee ID:</strong> {selectedUser?.employeeId}
                                </div>
                                <div className="info-item mb-2">
                                    <strong>Email:</strong> {selectedUser?.emailid}
                                </div>
                                <div className="info-item mb-2">
                                    <strong>Phone:</strong> {selectedUser?.phone}
                                </div>
                                <div className="info-item mb-2">
                                    <strong>Department:</strong> {selectedUser?.department}
                                </div>
                                <div className="info-item mb-2">
                                    <strong>Designation:</strong> {selectedUser?.designation}
                                </div>
                                <div className="info-item mb-2">
                                    <strong>Join Date:</strong> {new Date(selectedUser?.joiningDate).toLocaleDateString()}
                                </div>
                                <div className="info-item mb-2">
                                    <strong>Address:</strong> {selectedUser?.address}
                                </div>
                                <div className="info-item mb-2">
                                    <strong>City:</strong> {selectedUser?.city}
                                </div>
                                <div className="info-item mb-2">
                                    <strong>Country:</strong> {selectedUser?.country}
                                </div>
                                <div className="info-item mb-2">
                                    <strong>Status:</strong> {selectedUser?.status}
                                </div>
                            </>
                        )}
                        {selectedUser?.userType === 'Client' && (
                            <>
                                <div className="info-item mb-2">
                                    <strong>Client ID:</strong> {selectedUser?.clientId}
                                </div>
                                <div className="info-item mb-2">
                                    <strong>Email:</strong> {selectedUser?.clientEmail}
                                </div>
                                <div className="info-item mb-2">
                                    <strong>Phone:</strong> {selectedUser?.clientPhone}
                                </div>
                                <div className="info-item mb-2">
                                    <strong>Company:</strong> {selectedUser?.clientCompany}
                                </div>
                                <div className="info-item mb-2">
                                    <strong>Designation:</strong> {selectedUser?.clientDesignation}
                                </div>
                                <div className="info-item mb-2">
                                    <strong>Department:</strong> {selectedUser?.clientDepartment}
                                </div>
                                <div className="info-item mb-2">
                                    <strong>Address:</strong> {selectedUser?.clientAddress}
                                </div>
                                <div className="info-item mb-2">
                                    <strong>City:</strong> {selectedUser?.clientCity}
                                </div>
                                <div className="info-item mb-2">
                                    <strong>Country:</strong> {selectedUser?.clientCountry}
                                </div>
                                <div className="info-item mb-2">
                                    <strong>Website:</strong> {selectedUser?.clientWebsite}
                                </div>
                                <div className="info-item mb-2">
                                    <strong>Status:</strong> {selectedUser?.clientStatus}
                                </div>
                            </>
                        )}
                    </div>
                </Modal.Body>
            </Modal>

            {/* Add new Image Modal */}
            <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered>
                <Modal.Header closeButton style={{ backgroundColor: '#075E54', color: 'white' }}>
                    <Modal.Title>{selectedUser?.employeeName || selectedUser?.clientName || selectedUser?.username}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <img
                        src={`${import.meta.env.VITE_BASE_URL}${selectedUser?.userType === 'Employee'
                            ? selectedUser?.employeeImage.replace('uploads/', '')
                            : selectedUser?.userType === 'AdminUser'
                                ? selectedUser?.profileImage.replace('uploads/', '')
                                : selectedUser?.clientImage.replace('uploads/', '')
                            }`}
                        alt="Profile"
                        style={{ width: '100%', height: '80vh', objectFit: 'contain' }}
                    />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ChatLayout;
