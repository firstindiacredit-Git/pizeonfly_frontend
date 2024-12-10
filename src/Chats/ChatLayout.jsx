import React, { useState, useEffect, useRef } from 'react';
import { Modal, Dropdown, Button } from 'react-bootstrap';
import EmojiPicker from 'emoji-picker-react';
import RecordingWave from './RecordingWave';
import axios from 'axios';
import { toast } from 'react-toastify';
import CustomColorPicker from '../pages/colorpicker/CustomColorPicker';

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
    renderUserItem,
    onMessageEdit,
    onMessageDelete,
    fetchMessages
}) => {
    const [showUserModal, setShowUserModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editMessage, setEditMessage] = useState('');
    const [showClearChatModal, setShowClearChatModal] = useState(false);
    const [showBackgroundSettings, setShowBackgroundSettings] = useState(false);
    const [backgroundColor, setBackgroundColor] = useState('#efeae2');
    const [backgroundImage, setBackgroundImage] = useState('');
    const [showColorPicker, setShowColorPicker] = useState(false);

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

    const MessageActions = ({ message }) => {
        const [show, setShow] = useState(false);
        const dropdownRef = useRef(null);

        useEffect(() => {
            const handleClickOutside = (event) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    setShow(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        return (
            <div className="message-actions" ref={dropdownRef}>
                <span
                    onClick={() => setShow(!show)}
                    style={{ cursor: 'pointer' }}
                    className="text-muted"
                >
                    ⋮
                </span>
                <Dropdown.Menu
                    show={show}
                    style={{
                        position: 'absolute',
                        right: '100%',
                        top: 0,
                        marginRight: '5px'
                    }}
                >
                    <Dropdown.Item onClick={() => {
                        setEditingMessageId(message._id);
                        setEditMessage(message.message);
                        setShow(false);
                    }}>
                        <i className="bi bi-pencil me-2"></i>Edit
                    </Dropdown.Item>
                    <Dropdown.Item
                        className="text-danger"
                        onClick={() => {
                            onMessageDelete(message._id);
                            setShow(false);
                        }}
                    >
                        <i className="bi bi-trash me-2"></i>Delete
                    </Dropdown.Item>
                </Dropdown.Menu>
            </div>
        );
    };

    const handleClearChat = async () => {
        try {
            const currentUser = JSON.parse(localStorage.getItem('user')) ||
                JSON.parse(localStorage.getItem('emp_user')) ||
                JSON.parse(localStorage.getItem('client_user'));

            await axios.post(`${import.meta.env.VITE_BASE_URL}api/clearChat`, {
                userId: currentUser._id,
                userType: currentUser.role === 'admin' ? 'AdminUser' :
                    currentUser.role === 'employee' ? 'Employee' : 'Client',
                otherUserId: selectedUser._id
            });

            fetchMessages(selectedUser._id);
            setShowClearChatModal(false);
        } catch (error) {
            console.error('Error clearing chat:', error);
            toast.error('Error clearing chat');
        }
    };

    const handleEditSubmit = async (messageId, editedMessage) => {
        await onMessageEdit(messageId, editedMessage);
        setEditingMessageId(null);
        setEditMessage('');
    };

    useEffect(() => {
        const fetchChatSettings = async () => {
            if (!selectedUser) return;

            try {
                const currentUser = JSON.parse(localStorage.getItem('user')) ||
                    JSON.parse(localStorage.getItem('emp_user')) ||
                    JSON.parse(localStorage.getItem('client_user'));

                const response = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}api/getChatSettings/${currentUser._id}/${selectedUser._id}`
                );
                if (response.data) {
                    setBackgroundColor(response.data.backgroundColor);
                    setBackgroundImage(response.data.backgroundImage || '');
                }
            } catch (error) {
                console.error('Error fetching chat settings:', error);
            }
        };
        fetchChatSettings();
    }, [selectedUser]);

    const handleBackgroundUpdate = async (color, file) => {
        try {
            const currentUser = JSON.parse(localStorage.getItem('user')) ||
                JSON.parse(localStorage.getItem('emp_user')) ||
                JSON.parse(localStorage.getItem('client_user'));

            const formData = new FormData();
            formData.append('userId', currentUser._id);
            formData.append('otherUserId', selectedUser._id);
            formData.append('userType', currentUser.role === 'admin' ? 'AdminUser' :
                currentUser.role === 'employee' ? 'Employee' : 'Client');
            formData.append('backgroundColor', color);

            if (file) {
                formData.append('backgroundImage', file);
            }

            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}api/updateChatBackground`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            setBackgroundColor(color);
            if (response.data.backgroundImage) {
                setBackgroundImage(response.data.backgroundImage);
            }
            setShowBackgroundSettings(false);
            setShowColorPicker(false);
        } catch (error) {
            console.error('Error updating background:', error);
            toast.error('Error updating background');
        }
    };

    return (
        <div className="container-fluid mt-2" style={{}}>
            <div className="d-flex g-0 rounded-2" style={{ height: '94vh', border: '1px solid #00000061' }}>


                {/* Chat Area */}
                <div className=" rounded-2" style={{ height: '93vh', backgroundColor: '#efeae2', width: '43.2rem' }}>
                    {selectedUser ? (
                        <div className="card border-0" style={{ height: '93.7vh' }}>
                            {/* Chat Header - WhatsApp style */}
                            <div className="card-header py-2 px-4" style={{ backgroundColor: '#075E54', color: 'white', height: '50px' }}>
                                <div className="d-flex align-items-center justify-content-between">
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

                                    <Dropdown>
                                        <Dropdown.Toggle variant="transparent" style={{ border: 'none', color: 'white' }}>
                                            <i className="bi bi-three-dots-vertical"></i>
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => setShowClearChatModal(true)}>
                                                <i className="bi bi-trash me-2"></i>Clear Chat
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => setShowBackgroundSettings(true)}>
                                                <i className="bi bi-palette me-2"></i>Chat Background
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </div>

                            {/* Messages Area - WhatsApp style */}
                            <div className="card-body chat-box p-4"
                                style={{
                                    height: 'calc(93vh - 140px)',
                                    overflowY: 'auto',
                                    backgroundColor: backgroundColor,
                                    ...(backgroundImage && {
                                        backgroundImage: `url("${import.meta.env.VITE_BASE_URL}${backgroundImage.replace('uploads/', '')}")`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                    }),
                                    msOverflowStyle: 'none',
                                    scrollbarWidth: 'none',
                                    '&::-webkit-scrollbar': { display: 'none' }
                                }}>
                                {messages.map((msg, index) => (
                                    <div key={index}
                                        className={`chat-message d-flex ${msg.isCurrentUser ? 'justify-content-end' : 'justify-content-start'} mb-3`}>
                                        <div className={`message-bubble px-2 rounded-1 ${msg.isCurrentUser ? 'text-white' : 'bg-white'}`}
                                            style={{
                                                maxWidth: '75%',
                                                maxHeight: '75%',
                                                position: 'relative',
                                                backgroundColor: msg.isCurrentUser ? '#075E54' : '#ffffff',
                                                borderRadius: '7.5px'
                                            }}>
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div className="message-content pe-2">
                                                    {msg.isDeleted ? (
                                                        <em className="text-muted" style={{ fontSize: '0.9em' }}>
                                                            {msg.isCurrentUser ? 'You deleted this message' : 'This message was deleted'}
                                                        </em>
                                                    ) : editingMessageId === msg._id ? (
                                                        <form onSubmit={(e) => {
                                                            e.preventDefault();
                                                            handleEditSubmit(msg._id, editMessage);
                                                        }}>
                                                            <div className="input-group">
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm"
                                                                    value={editMessage}
                                                                    onChange={(e) => setEditMessage(e.target.value)}
                                                                    autoFocus
                                                                />
                                                                <button type="submit" className="btn btn-sm btn-success">
                                                                    <i className="bi bi-check"></i>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-secondary"
                                                                    onClick={() => {
                                                                        setEditingMessageId(null);
                                                                        setEditMessage('');
                                                                    }}
                                                                >
                                                                    <i className="bi bi-x"></i>
                                                                </button>
                                                            </div>
                                                        </form>
                                                    ) : (
                                                        <>
                                                            {msg.message}
                                                            {msg.isEdited && <small className="text-muted ms-2">(edited)</small>}
                                                        </>
                                                    )}
                                                </div>
                                                {!msg.isDeleted && msg.isCurrentUser && <MessageActions message={msg} />}
                                            </div>

                                            {!msg.isDeleted && (
                                                <>
                                                    {/* Images */}
                                                    {msg.imageUrls && msg.imageUrls.map((url, i) => (
                                                        <img
                                                            key={i}
                                                            src={`${import.meta.env.VITE_BASE_URL}${url.replace('uploads/', '')}`}
                                                            alt="Shared image"
                                                            className="img-fluid rounded mb-1 py-2"
                                                            style={{ maxHeight: '200px', cursor: 'pointer' }}
                                                            onClick={() => {
                                                                setSelectedImage(`${import.meta.env.VITE_BASE_URL}${url.replace('uploads/', '')}`);
                                                                setShowImageModal(true);
                                                            }}
                                                        />
                                                    ))}

                                                    {/* Video */}
                                                    {msg.videoUrl && (
                                                        <video
                                                            controls
                                                            className="img-fluid rounded mb-1 py-2"
                                                            style={{ maxHeight: '200px' }}
                                                        >
                                                            <source src={`${import.meta.env.VITE_BASE_URL}${msg.videoUrl.replace('uploads/', '')}`} type="video/mp4" />
                                                            Your browser does not support the video tag.
                                                        </video>
                                                    )}

                                                    {/* Audio */}
                                                    {msg.audioUrl && (
                                                        <audio controls className="w-100 mb-1">
                                                            <source src={`${import.meta.env.VITE_BASE_URL}${msg.audioUrl.replace('uploads/', '')}`} type="audio/mpeg" />
                                                            Your browser does not support the audio element.
                                                        </audio>
                                                    )}

                                                    {/* Voice Recording */}
                                                    {msg.recordingUrl && (
                                                        <audio controls className="mb-1 py-2">
                                                            <source src={`${import.meta.env.VITE_BASE_URL}${msg.recordingUrl.replace('uploads/', '')}`} type="audio/webm" style={{ backgroundColor: 'black' }} />
                                                            Your browser does not support the audio element.
                                                        </audio>
                                                    )}
                                                </>
                                            )}

                                            {/* Timestamp */}
                                            <div className="message-footer">
                                                <small
                                                    className={`d-block text-end ${msg.isCurrentUser ? 'text-white-50' : 'text-muted'}`}
                                                    style={{
                                                        fontSize: '0.6rem',
                                                        marginTop: '1px'
                                                    }}
                                                >
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input - WhatsApp style */}
                            <div className="card-footer py-2 px-3" style={{ backgroundColor: '#80808069' }}>
                                <form onSubmit={onMessageSubmit} style={{ position: 'relative' }}>
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
                                            placeholder={isRecording ? "Recording..." : "Type a message"}
                                            value={newMessage}
                                            onChange={onMessageChange}
                                            disabled={isRecording}
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
                                                backgroundColor: isRecording ? '#ff0000' : '#00a884',
                                                color: 'white',
                                                marginLeft: '8px',
                                                transition: 'background-color 0.3s'
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

                                    {/* Recording Wave Overlay */}
                                    {isRecording && <RecordingWave />}
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
                <div className=" border-start" style={{ height: '93vh', backgroundColor: '#ffffff', borderLeftColor: '#00000061', }}>
                    <div className="card border-0 h-100">
                        <div className="card-body p-0">
                            {/* Tabs - WhatsApp style */}
                            <div className="px-4 py-2" style={{ backgroundColor: '#075E54', height: '50px'}}>
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
                                        {activeTab === 'groups' ? (
                                            <div className="p-3">
                                                <button 
                                                    className="btn btn-primary w-100"
                                                    style={{ 
                                                        backgroundColor: '#128C7E',
                                                        border: 'none',
                                                        padding: '10px',
                                                        borderRadius: '5px',
                                                        fontSize: '16px'
                                                    }}
                                                >
                                                    + Create Group
                                                </button>
                                            </div>
                                        ) : (
                                            users.map(user => renderUserItem(user, selectedUser, onUserSelect))
                                        )}
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
            <Modal show={showImageModal} onHide={() => {
                setShowImageModal(false);
                setSelectedImage(null);
            }} centered>
                <Modal.Header closeButton style={{ backgroundColor: '#075E54', color: 'white' }}>
                    <Modal.Title>
                        {selectedImage ? selectedImage.split('/').pop() : 'Image Preview'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <img
                        src={selectedImage}
                        alt="Preview"
                        style={{ width: '100%', height: '80vh', objectFit: 'contain' }}
                    />
                </Modal.Body>
            </Modal>

            <Modal show={showClearChatModal} onHide={() => setShowClearChatModal(false)} centered>
                <Modal.Header closeButton style={{ backgroundColor: '#075E54', color: 'white' }}>
                    <Modal.Title>Clear Chat</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to clear this chat? This action cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowClearChatModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleClearChat}>
                        Clear Chat
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showBackgroundSettings} onHide={() => setShowBackgroundSettings(false)}>
                <Modal.Header closeButton style={{ backgroundColor: '#075E54', color: 'white' }}>
                    <Modal.Title>Chat Background</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <label className="form-label">Background Color</label>
                        <div className="d-flex align-items-center">
                            <div
                                className="color-preview me-2"
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    backgroundColor: backgroundColor,
                                    border: '1px solid #ccc',
                                    cursor: 'pointer',
                                    borderRadius: '4px'
                                }}
                                onClick={() => setShowColorPicker(!showColorPicker)}
                            />
                            {showColorPicker && (
                                <div style={{ position: 'absolute', zIndex: 2 }}>
                                    <CustomColorPicker
                                        color={backgroundColor}
                                        onChange={(color) => handleBackgroundUpdate(color)}
                                        onClose={() => setShowColorPicker(false)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Background Image</label>
                        <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files[0]) {
                                    handleBackgroundUpdate(backgroundColor, e.target.files[0]);
                                }
                            }}
                        />
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ChatLayout;
