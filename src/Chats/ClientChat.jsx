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

            // Add this new listener for group updates
            socket.current.on('group_updated', (updatedGroup) => {
                setGroups(prevGroups => 
                    prevGroups.map(group => 
                        group._id === updatedGroup._id ? updatedGroup : group
                    )
                );
            });

            // Listen for received messages
            socket.current.on('receive_message', (message) => {
                setMessages(prev => {
                    if (!prev.some(m => m._id === message._id)) {
                        if (selectedUser?.userType === 'Group' && message.receiverId === selectedUser._id) {
                            return [...prev, message];
                        }
                        else if (selectedUser && 
                            (message.senderId === selectedUser._id || message.receiverId === selectedUser._id)) {
                            return [...prev, message];
                        }
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

            socket.current.on('receive_group_message', (message) => {
                console.log('Client/Employee received group message:', message); // Debug log
                setMessages(prev => {
                    if (!prev.some(m => m._id === message._id)) {
                        if (selectedUser?.userType === 'Group' && message.receiverId === selectedUser._id) {
                            return [...prev, message];
                        }
                    }
                    return prev;
                });
            });

            socket.current.on('group_message_sent', (message) => {
                console.log('Client/Employee group message sent confirmation:', message); // Debug log
                setMessages(prev => {
                    if (!prev.some(m => m._id === message._id)) {
                        return [...prev, message];
                    }
                    return prev;
                });
            });

            fetchUsers();
            fetchGroups();

            // Add listener for member removal
            socket.current.on('member_removed_from_group', (data) => {
                if (currentClient._id === data.memberId) {
                    // Remove the group from the local state if current client is removed
                    setGroups(prevGroups => prevGroups.filter(group => group._id !== data.groupId));
                    
                    // If the removed group is currently selected, clear the selection
                    if (selectedUser && selectedUser._id === data.groupId) {
                        setSelectedUser(null);
                        setMessages([]);
                    }
                } else {
                    // Update the group's member list in local state
                    setGroups(prevGroups => 
                        prevGroups.map(group => {
                            if (group._id === data.groupId) {
                                return {
                                    ...group,
                                    members: group.members.map(member => {
                                        if (member.userId === data.memberId) {
                                            return { ...member, isRemoved: true };
                                        }
                                        return member;
                                    })
                                };
                            }
                            return group;
                        })
                    );
                }
            });

            return () => {
                if (socket.current) {
                    socket.current.disconnect();
                    socket.current.off('receive_group_message');
                    socket.current.off('group_message_sent');
                    socket.current.off('member_removed_from_group');
                }
            };
        }
    }, [selectedUser]);

    useEffect(() => {
        if (selectedUser?.userType === 'Group') {
            const interval = setInterval(() => {
                fetchGroupMessages(selectedUser._id);
            }, 3000);

            return () => clearInterval(interval);
        }
    }, [selectedUser]);

    useEffect(() => {
        if (selectedUser && selectedUser.userType === 'AdminUser') {
            const interval = setInterval(() => {
                fetchMessages(selectedUser._id);
            }, 3000); // Poll every 3 seconds

            return () => clearInterval(interval);
        }
    }, [selectedUser]);

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

            setNewMessage('');

            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}api/createChat`,
                messageData
            );

            if (selectedUser.userType === 'Group') {
                socket.current.emit('group_message', {
                    ...response.data,
                    groupId: selectedUser._id,
                    members: selectedUser.members
                });
            }
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
                onClick={() => onUserSelect(user, isAdmin ? 'AdminUser' : 'Employee')}
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
            const userGroups = response.data.filter(group => 
                group.members.some(member => 
                    member.userId === currentClient._id && 
                    member.userType === 'Client' && 
                    !member.isRemoved
                )
            );
            setGroups(userGroups);
        } catch (error) {
            console.error('Error fetching groups:', error);
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
            fetchChatSettings(user._id);
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

    const fetchChatSettings = async (otherUserId) => {
        try {
            // Only fetch if we have valid IDs
            if (!currentClient?._id || !otherUserId) {
                console.log('Missing user IDs for chat settings');
                return;
            }

            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}api/getChatSettings/${currentClient._id}/${otherUserId}`
            );
            // Handle the settings...
        } catch (error) {
            console.error('Error fetching chat settings:', error);
        }
    };

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
                        fetchChatSettings={fetchChatSettings}
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
