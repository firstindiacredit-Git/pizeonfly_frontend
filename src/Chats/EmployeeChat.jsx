import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import ChatLayout from './ChatLayout';
import Sidebar from '../employeeCompt/EmployeeSidebar';
// import Header from "../employeeCompt/EmployeeHeader";
import FilePreview from './FilePreview';

const EmployeeChat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [admins, setAdmins] = useState([]);
  const [clients, setClients] = useState([]);
  const [activeTab, setActiveTab] = useState('admins');
  const messagesEndRef = useRef(null);
  const socket = useRef();
  const currentEmployee = JSON.parse(localStorage.getItem('emp_user'));
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);

  useEffect(() => {
    socket.current = io(import.meta.env.VITE_BASE_URL);
    socket.current.emit('join_chat', currentEmployee._id);

    // Listen for received messages
    socket.current.on('receive_message', (message) => {
      setMessages(prev => {
        if (!prev.some(m => m._id === message._id)) {
          if (message.receiverId === currentEmployee._id) {
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

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const fetchUsers = async () => {
    try {
      const [adminResponse, clientResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}api/adminuser`),
        axios.get(`${import.meta.env.VITE_BASE_URL}api/clients`)
      ]);
      setAdmins(adminResponse.data);
      setClients(clientResponse.data);
    } catch (error) {
      toast.error('Error loading users');
    }
  };

  const fetchMessages = async (receiverId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}api/getChats/${currentEmployee._id}/${receiverId}`
      );
      setMessages(response.data);
    } catch (error) {
      toast.error('Error loading messages');
    }
  };

  const handleUserSelect = (user, userType) => {
    const correctedUserType = userType === 'Admin' ? 'AdminUser' : userType;
    setSelectedUser({ ...user, userType: correctedUserType });
    fetchMessages(user._id);
  };

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const messageData = {
        senderId: currentEmployee._id,
        senderType: 'Employee',
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

    formData.append('senderId', currentEmployee._id);
    formData.append('senderType', 'Employee');
    formData.append('receiverId', selectedUser._id);
    formData.append('receiverType', selectedUser.userType);
    formData.append('message', '');

    // Determine file type and append with correct field name
    const fileType = file.type.split('/')[0];
    if (fileType === 'image') {
      formData.append('images', file);  // Changed from 'image' to 'images'
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
    formData.append('senderId', currentEmployee._id);
    formData.append('senderType', 'Employee');
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
      // Update will be handled by socket listener
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
      // Deletion will be handled by socket listener
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Error deleting message');
    }
  };

  const renderUserItem = (user, selectedUser, onUserSelect) => {
    const isAdmin = activeTab === 'admins';
    return (
      <li
        key={user._id}
        className={`list-group-item ${selectedUser?._id === user._id ? 'active' : ''}`}
        style={{ backgroundColor: selectedUser?._id === user._id ? '#80808069' : '' }}
        onClick={() => onUserSelect(user, isAdmin ? 'Admin' : 'Client')}
      >
        <div className="d-flex align-items-center">
          <img
            src={`${import.meta.env.VITE_BASE_URL}${(isAdmin ? user.profileImage : user.clientImage).replace('uploads/', '')}`}
            className="avatar rounded-circle"
            style={{ objectFit: 'contain' }}
            alt={isAdmin ? user.username : user.clientName}
          />
          <div className="flex-fill ms-3">
            <h6 className="mb-0 fw-semibold" style={{ fontSize: '14px' }}>
              {isAdmin ? user.username : user.clientName}
            </h6>
            <small className="">
              {isAdmin ? 'Admin' : user.clientEmail}
            </small>
          </div>
        </div>
      </li>
    );
  };

  return (
    <div id="mytask-layout">
      <Sidebar />
      <div className="main px-lg-4 px-md-4">
        {/* <Header /> */}
        <div className="body d-flex py-lg-3 py-md-2">
          <ChatLayout
            users={activeTab === 'admins' ? admins : clients}
            selectedUser={selectedUser}
            messages={messages.map(msg => ({
              ...msg,
              isCurrentUser: msg.senderId === currentEmployee._id
            }))}
            newMessage={newMessage}
            activeTab={activeTab}
            tabs={[
              { id: 'admins', label: 'Admins' },
              { id: 'clients', label: 'Clients' }
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

export default EmployeeChat; 