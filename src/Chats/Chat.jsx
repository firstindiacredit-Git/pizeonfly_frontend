import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import ChatLayout from './ChatLayout';
import Sidebar from "../components/Sidebar";
// import Header from "../components/Header";
import FilePreview from './FilePreview';

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [activeTab, setActiveTab] = useState('employees');
  const messagesEndRef = useRef(null);
  const socket = useRef();
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    // Socket connection
    socket.current = io(import.meta.env.VITE_BASE_URL);

    // Join personal chat room
    socket.current.emit('join_chat', currentUser._id);

    // Listen for received messages
    socket.current.on('receive_message', (message) => {
      setMessages(prev => {
        // Avoid duplicate messages
        if (!prev.some(m => m._id === message._id)) {
          return [...prev, message];
        }
        return prev;
      });
    });

    // Listen for sent message confirmations
    socket.current.on('message_sent', (message) => {
      setMessages(prev => {
        // Avoid duplicate messages
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

    // Listen for group messages
    socket.current.on('receive_group_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Fetch users
    fetchUsers();
    fetchGroups();

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch employees
      const empResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}api/employees`);
      setEmployees(empResponse.data);

      // Fetch clients
      const clientResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}api/clients`);
      setClients(clientResponse.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error loading users');
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/groups`);
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Error loading groups');
    }
  };

  const fetchMessages = async (receiverId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}api/getChats/${currentUser._id}/${receiverId}`
      );
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Error loading messages');
    }
  };

  const handleUserSelect = (user, userType) => {
    setSelectedUser({ ...user, userType });
    fetchMessages(user._id);
  };

  // Helper function to map user role to correct sender type
  const mapRoleToType = (role) => {
    switch (role.toLowerCase()) {
      case 'employee':
        return 'Employee';
      case 'client':
        return 'Client';
      default:
        return 'Employee';
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const messageData = {
        senderId: currentUser._id,
        senderType: mapRoleToType(currentUser.role),
        receiverId: selectedUser._id,
        receiverType: selectedUser.userType,
        message: newMessage
      };

      setNewMessage(''); // Clear message input immediately for better UX

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/createChat`,
        messageData
      );

      // Socket emit is now handled by backend
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderUserItem = (user, selectedUser, onUserSelect) => {
    const isEmployee = activeTab === 'employees';
    return (
      <li
        key={user._id}
        className={`list-group-item  ${selectedUser?._id === user._id ? 'active' : ''}`}
        style={{ backgroundColor: selectedUser?._id === user._id ? '#80808069' : '' }}
        onClick={() => onUserSelect(user, isEmployee ? 'Employee' : 'Client')}
      >
        <div className="d-flex align-items-center">
          <img
            src={`${import.meta.env.VITE_BASE_URL}${(isEmployee ? user.employeeImage : user.clientImage).replace('uploads/', '')}`}
            className="avatar rounded-circle"
            style={{ objectFit: 'contain' }}
            alt={isEmployee ? user.employeeName : user.clientName}
          />
          <div className="flex-fill ms-3">
            <h6 className="mb-0 fw-semibold" style={{ fontSize: '14px' }}>{isEmployee ? user.employeeName : user.clientName}</h6>
            <small className="">{isEmployee ? user.phone ? user.phone : user.emailid : user.clientPhone ? user.clientPhone : user.clientEmail}</small>
          </div>
        </div>
      </li>
    );
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
    const maxSize = 15 * 1024 * 1024; // 15MB in bytes
    if (file.size > maxSize) {
      toast.error('File size should be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setShowFilePreview(true);
  };

  const handleFileSend = async (file) => {
    const formData = new FormData();

    // Add message data to formData
    formData.append('senderId', currentUser._id);
    formData.append('senderType', mapRoleToType(currentUser.role));
    formData.append('receiverId', selectedUser._id);
    formData.append('receiverType', selectedUser.userType);
    formData.append('message', ''); // Empty message for file uploads

    // Determine file type and append accordingly
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
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error uploading file');
    }
  };

  const handleVoiceRecordingComplete = async (blob) => {
    const formData = new FormData();

    // Add message data
    formData.append('senderId', currentUser._id);
    formData.append('senderType', mapRoleToType(currentUser.role));
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
      const response = await axios.put(
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

  const allUsers = [...employees, ...clients].filter(Boolean);

  return (
    <>
      <div id="mytask-layout">
        <Sidebar />
        <div className="main px-lg-4 px-md-4">
          {/* <Header /> */}
          <div className="body d-flex py-lg-3 py-md-2">
            <ChatLayout
              users={activeTab === 'groups' ? allUsers : 
                     activeTab === 'admins' ? admins :
                     activeTab === 'employees' ? employees :
                     clients}
              selectedUser={selectedUser}
              messages={messages.map(msg => ({
                ...msg,
                isCurrentUser: msg.senderId === currentUser._id
              }))}
              newMessage={newMessage}
              activeTab={activeTab}
              tabs={[
                { id: 'employees', label: 'Employees' },
                { id: 'clients', label: 'Clients' },
                { id: 'groups', label: 'Groups' }
              ]}
              onTabChange={setActiveTab}
              onUserSelect={handleUserSelect}
              onMessageChange={(e) => setNewMessage(e.target.value)}
              onMessageSubmit={sendMessage}
              messagesEndRef={messagesEndRef}
              renderUserItem={renderUserItem}
              onFileUpload={handleFileUpload}
              onVoiceRecordingComplete={handleVoiceRecordingComplete}
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
    </>
  );
};

export default Chat;
