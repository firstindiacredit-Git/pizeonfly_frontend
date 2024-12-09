import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import ChatLayout from './ChatLayout';
import Sidebar from '../employeeCompt/EmployeeSidebar';
// import Header from "../employeeCompt/EmployeeHeader";

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

  useEffect(() => {
    socket.current = io(import.meta.env.VITE_BASE_URL);
    socket.current.emit('join_chat', currentEmployee._id);

    socket.current.on('new_chat_message', (message) => {
      if (message.receiverId === currentEmployee._id) {
        setMessages(prev => [...prev, message]);
        toast.info('New message received!');
      }
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
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        senderId: currentEmployee._id,
        senderType: 'Employee',
        receiverId: selectedUser._id,
        receiverType: selectedUser.userType,
        message: newMessage
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/createChat`,
        messageData
      );

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');

      socket.current.emit('private_message', {
        receiverId: selectedUser._id,
        message: response.data
      });
    } catch (error) {
      toast.error('Error sending message');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadResponse = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/upload`,
        formData
      );

      const fileUrl = uploadResponse.data.path;
      const fileType = e.target.accept.split('/')[0];

      const messageData = {
        senderId: currentEmployee._id,
        senderType: 'Employee',
        receiverId: selectedUser._id,
        receiverType: selectedUser.userType,
        message: '',
        [fileType === 'image' ? 'imageUrls' : `${fileType}Url`]: fileType === 'image' ? [fileUrl] : fileUrl
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/createChat`,
        messageData
      );

      setMessages(prev => [...prev, response.data]);
      socket.current.emit('private_message', {
        receiverId: selectedUser._id,
        message: response.data
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error uploading file');
    }
  };

  const handleVoiceRecordingComplete = async (blob) => {
    const formData = new FormData();
    formData.append('file', blob, 'recording.webm');

    try {
      const uploadResponse = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/upload`,
        formData
      );

      const recordingUrl = uploadResponse.data.path;

      const messageData = {
        senderId: currentEmployee._id,
        senderType: 'Employee',
        receiverId: selectedUser._id,
        receiverType: selectedUser.userType,
        message: '',
        recordingUrl
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/createChat`,
        messageData
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
            onFileUpload={handleFileUpload}
            onVoiceRecordingComplete={handleVoiceRecordingComplete}
            messagesEndRef={messagesEndRef}
            renderUserItem={renderUserItem}
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeeChat; 