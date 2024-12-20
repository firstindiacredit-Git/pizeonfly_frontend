import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import ChatLayout from './ChatLayout';
import Sidebar from '../clientCompt/ClientSidebar';
// import Header from '../clientCompt/ClientHeader';
import FilePreview from './FilePreview';

const ClientChat = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [admins, setAdmins] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [activeTab, setActiveTab] = useState('admins');
    const messagesEndRef = useRef(null);
    const socket = useRef(null);
    const currentClient = JSON.parse(localStorage.getItem('client_user'));
    const [selectedFile, setSelectedFile] = useState(null);
    const [showFilePreview, setShowFilePreview] = useState(false);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        socket.current = io(import.meta.env.VITE_BASE_URL);

        if (socket.current) {
            socket.current.emit('join_chat', currentClient._id);

            const currentUser = JSON.parse(localStorage.getItem('user')) ||
                JSON.parse(localStorage.getItem('emp_user')) ||
                JSON.parse(localStorage.getItem('client_user'));

            socket.current.emit('user_connected', {
                userId: currentUser._id,
                userType: currentUser.role === 'admin' ? 'AdminUser' :
                    currentUser.role === 'employee' ? 'Employee' : 'Client'
            });

            // Listen for received messages
            socket.current.on('receive_message', (message) => {
                setMessages(prev => {
                    if (!prev.some(m => m._id === message._id)) {
                        if (message.receiverId === currentClient._id) {
                            toast.info('New message received!');
                        }
                        return [...prev, message];
                    }
                    return prev;
                });
            });

            // Listen for sent message confirmations
            socket.current.on('message_sent', (message) => {
                setMessages(prev => {
                    if (!prev.some(m => m._id === message._id)) {
                        return [...prev, message];
                    }
                    return prev;
                });
            });

            // Listen for message updates
            socket.current.on('message_updated', (updatedMessage) => {
                setMessages(prev => prev.map(msg =>
                    msg._id === updatedMessage._id ? updatedMessage : msg
                ));
            });

            // Listen for message deletions
            socket.current.on('message_deleted', (deletedMessage) => {
                setMessages(prev => prev.map(msg =>
                    msg._id === deletedMessage._id ? deletedMessage : msg
                ));
            });

            fetchUsers();
            fetchGroups();

            return () => {
                if (socket.current) {
                    socket.current.disconnect();
                }
            };
        }
    }, []);

    const fetchUsers = async () => {
        try {
            const [adminResponse, employeeResponse] = await Promise.all([
                axios.get(`${import.meta.env.VITE_BASE_URL}api/adminuser`),
                axios.get(`${import.meta.env.VITE_BASE_URL}api/employees`)
            ]);
            setAdmins(adminResponse.data);
            setEmployees(employeeResponse.data);
        } catch (error) {
            toast.error('Error loading users');
        }
    };

    const fetchMessages = async (receiverId) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}api/getChats/${currentClient._id}/${receiverId}`
            );
            setMessages(response.data);
        } catch (error) {
            toast.error('Error loading messages');
        }
    };

    const handleMessageChange = (e) => {
        setNewMessage(e.target.value);
    };

    const handleMessageSubmit = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            const messageData = {
                senderId: currentClient._id,
                senderType: 'Client',
                receiverId: selectedUser._id,
                receiverType: selectedUser.userType,
                message: newMessage
            };

            setNewMessage(''); // Clear message input immediately

            await axios.post(
                `${import.meta.env.VITE_BASE_URL}api/createChat`,
                messageData
            );

            // Socket emit is handled by backend
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Error sending message');
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const fileType = file.type.split('/')[0];
        if (!['image', 'video', 'audio'].includes(fileType)) {
            toast.error('Unsupported file type');
            return;
        }

        // Validate file size (15MB)
        const maxSize = 15 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error('File size should be less than 15MB');
            return;
        }

        setSelectedFile(file);
        setShowFilePreview(true);
    };

    const handleFileSend = async (file) => {
        const formData = new FormData();

        formData.append('senderId', currentClient._id);
        formData.append('senderType', 'Client');
        formData.append('receiverId', selectedUser._id);
        formData.append('receiverType', selectedUser.userType);
        formData.append('message', '');

        // Determine file type and append with correct field name
        const fileType = file.type.split('/')[0];
        if (fileType === 'image') {
            formData.append('images', file);
        } else if (fileType === 'video') {
            formData.append('video', file);
        } else if (fileType === 'audio') {
            formData.append('audio', file);
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}api/createChat`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            setMessages(prev => [...prev, response.data]);
            socket.current.emit('private_message', {
                receiverId: selectedUser._id,
                message: response.data
            });

            // Close the preview after successful upload
            setShowFilePreview(false);
            setSelectedFile(null);
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('Error uploading file');
        }
    };

    const handleVoiceRecordingComplete = async (blob) => {
        const formData = new FormData();

        // Add message data
        formData.append('senderId', currentClient._id);
        formData.append('senderType', 'Client');
        formData.append('receiverId', selectedUser._id);
        formData.append('receiverType', selectedUser.userType);
        formData.append('message', '');

        // Add the recording file
        formData.append('recording', blob, 'recording.webm');

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}api/createChat`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            setMessages(prev => [...prev, response.data]);
            socket.current.emit('private_message', {
                receiverId: selectedUser._id,
                message: response.data
            });
        } catch (error) {
            console.error('Error uploading recording:', error);
            toast.error('Error uploading recording');
        }
    };

    const handleMessageEdit = async (messageId, newMessage) => {
        try {
            await axios.put(
                `${import.meta.env.VITE_BASE_URL}api/updateChat/${messageId}`,
                { message: newMessage }
            );
        } catch (error) {
            console.error('Error updating message:', error);
            toast.error('Error updating message');
        }
    };

    const handleMessageDelete = async (messageId) => {
        try {
            await axios.delete(
                `${import.meta.env.VITE_BASE_URL}api/deleteChat/${messageId}`
            );
        } catch (error) {
            console.error('Error deleting message:', error);
            toast.error('Error deleting message');
        }
    };

    const handleClearChat = async () => {
        if (!selectedUser) return;

        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}api/clearChat`, {
                userId: currentClient._id,
                userType: 'Client',
                otherUserId: selectedUser._id
            });

            fetchMessages(selectedUser._id);
            toast.success('Chat cleared successfully');
        } catch (error) {
            console.error('Error clearing chat:', error);
            toast.error('Error clearing chat');
        }
    };

    const renderUserItem = (user, selectedUser, onUserSelect) => {
        const isAdmin = activeTab === 'admins';
        return (
            <li
                key={user._id}
                className={`list-group-item ${selectedUser?._id === user._id ? 'active' : ''}`}
                style={{ backgroundColor: selectedUser?._id === user._id ? '#80808069' : '' }}
                onClick={() => onUserSelect(user, isAdmin ? 'Admin' : 'Employee')}
            >
                <div className="d-flex align-items-center">
                    <img
                        src={`${import.meta.env.VITE_BASE_URL}${(isAdmin ? user.profileImage : user.employeeImage).replace('uploads/', '')}`}
                        className="avatar rounded-circle"
                        style={{ objectFit: 'contain' }}
                        alt={isAdmin ? user.username : user.employeeName}
                    />
                    <div className="flex-fill ms-3">
                        <h6 className="mb-0 fw-semibold" style={{ fontSize: '14px' }}>
                            {isAdmin ? user.username : user.employeeName}
                        </h6>
                        <small className="">
                            {isAdmin ? 'Admin' : user.emailid}
                        </small>
                    </div>
                </div>
            </li>
        );
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/groups`);
            setGroups(response.data);
        } catch (error) {
            toast.error('Error loading groups');
        }
    };

    // Modify handleUserSelect
    const handleUserSelect = (user, userType) => {
        setSelectedUser({ ...user, userType });
        if (userType === 'Group') {
            fetchGroupMessages(user._id);
        } else {
            fetchMessages(user._id);
        }
    };

    // Add group message fetching
    const fetchGroupMessages = async (groupId) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}api/getGroupMessages/${groupId}`
            );
            setMessages(response.data);
        } catch (error) {
            toast.error('Error loading group messages');
        }
    };

    const allUsers = [...admins, ...employees].filter(Boolean);

    return (
        <div id="mytask-layout">
            <Sidebar />
            <div className="main px-lg-4 px-md-4">
                <div className="body d-flex py-lg-3 py-md-2">
                    <ChatLayout
                        users={activeTab === 'admins' ? admins :
                            activeTab === 'employees' ? employees :
                                activeTab === 'groups' ? allUsers :
                                    groups}
                        groups={groups}
                        socket={socket}
                        selectedUser={selectedUser}
                        setSelectedUser={setSelectedUser}
                        messages={messages.map(msg => ({
                            ...msg,
                            isCurrentUser: msg.senderId === currentClient._id
                        }))}
                        newMessage={newMessage}
                        activeTab={activeTab}
                        tabs={[
                            { id: 'admins', label: 'Admins' },
                            { id: 'employees', label: 'Employees' },
                            { id: 'groups', label: 'Groups' }
                        ]}
                        onTabChange={setActiveTab}
                        onUserSelect={handleUserSelect}
                        onMessageChange={handleMessageChange}
                        onMessageSubmit={handleMessageSubmit}
                        onFileSend={handleFileSend}
                        onVoiceRecordingComplete={handleVoiceRecordingComplete}
                        messagesEndRef={messagesEndRef}
                        renderUserItem={renderUserItem}
                        onFileUpload={handleFileUpload}
                        onMessageEdit={handleMessageEdit}
                        onMessageDelete={handleMessageDelete}
                        fetchMessages={fetchMessages}
                        onClearChat={handleClearChat}
                    />
                    <FilePreview
                        show={showFilePreview}
                        onHide={() => {
                            setShowFilePreview(false);
                            setSelectedFile(null);
                        }}
                        file={selectedFile}
                        onSend={handleFileSend}
                    />
                </div>
            </div>
        </div>
    );
};

export default ClientChat;
