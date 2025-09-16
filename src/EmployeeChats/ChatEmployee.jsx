import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../employeeCompt/EmployeeSidebar";
import Header from "../employeeCompt/EmployeeHeader";
import axios from "axios";
import io from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dropdown } from 'react-bootstrap';
import FilePreview from '../Chats/FilePreview';
import "../pages/Loading.css";

const ChatEmployee = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const messagesEndRef = useRef(null);
  const socket = useRef(null);
  
  // Get current employee from localStorage
  const currentEmployee = JSON.parse(localStorage.getItem('emp_user'));
  const currentEmployeeId = localStorage.getItem('emp_user_id');

  // Fetch all employees except current user
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}api/employee-chat/getEmployees/${currentEmployeeId}`
      );
      
      setEmployees(response.data);
      
      // Fetch unread counts for each employee
      await fetchUnreadCounts(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Error loading employees');
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread message counts for each employee
  const fetchUnreadCounts = async (employeeList) => {
    try {
      const counts = {};
      
      for (const employee of employeeList) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}api/employee-chat/getUnreadCount/${currentEmployeeId}/${employee._id}`
          );
          counts[employee._id] = response.data.count || 0;
        } catch (error) {
          console.error(`Error fetching unread count for ${employee.employeeName}:`, error);
          counts[employee._id] = 0;
        }
      }
      
      setUnreadCounts(counts);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  // Fetch messages between current employee and selected employee
  const fetchMessages = async (receiverId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}api/employee-chat/getChats/${currentEmployeeId}/${receiverId}`
      );
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Error loading messages');
    }
  };

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    // Allow sending even if message is empty (for file-only messages)
    if (!newMessage.trim()) {
      return;
    }

    try {
      const messageData = {
        senderId: currentEmployeeId,
        receiverId: selectedEmployee._id,
        message: newMessage
      };

      setNewMessage('');
      
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/employee-chat/createChat`,
        messageData
      );

      console.log('Message sent successfully:', response.data);
      // Don't add to local state here - let Socket.IO handle it

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type - accept all common file types
    const fileType = file.type.split('/')[0];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedTypes = ['image', 'video', 'audio', 'application', 'text'];
    const allowedExtensions = [
      // Images
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico',
      // Videos
      'mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'm4v',
      // Audio
      'mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac', 'wma',
      // Documents
      'pdf', 'doc', 'docx', 'txt', 'rtf', 'odt',
      // Spreadsheets
      'xls', 'xlsx', 'csv', 'ods',
      // Presentations
      'ppt', 'pptx', 'odp',
      // Archives
      'zip', 'rar', '7z', 'tar', 'gz',
      // Other
      'json', 'xml', 'html', 'css', 'js', 'py', 'java', 'cpp', 'c', 'php'
    ];
    
    if (!allowedTypes.includes(fileType) && !allowedExtensions.includes(fileExtension)) {
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

  // Handle file send
  const handleFileSend = async (file) => {
    if (!selectedEmployee) return;

    const formData = new FormData();
    formData.append('senderId', currentEmployeeId);
    formData.append('receiverId', selectedEmployee._id);
    formData.append('message', '');

    // Determine file type and append with correct field name
    const fileType = file.type.split('/')[0];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    // Define document extensions
    const documentExtensions = [
      'pdf', 'doc', 'docx', 'txt', 'rtf', 'odt',
      'xls', 'xlsx', 'csv', 'ods',
      'ppt', 'pptx', 'odp',
      'zip', 'rar', '7z', 'tar', 'gz',
      'json', 'xml', 'html', 'css', 'js', 'py', 'java', 'cpp', 'c', 'php'
    ];
    
    if (fileType === 'image' || documentExtensions.includes(fileExtension)) {
      // Images and all documents go to images field
      formData.append('images', file);
    } else if (fileType === 'video') {
      formData.append('video', file);
    } else if (fileType === 'audio') {
      formData.append('audio', file);
    } else {
      // Fallback for any other files
      formData.append('images', file);
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/employee-chat/createChat`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('File sent successfully:', response.data);
      
      // Don't add to local state here - let Socket.IO handle it to avoid duplicates
      
      // Close the preview after successful upload
      setShowFilePreview(false);
      setSelectedFile(null);
      
      // Clear file input
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => input.value = '');
      
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error uploading file');
    }
  };

  // Handle employee selection
  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    fetchMessages(employee._id);
    
    // Clear unread count for selected employee (will be updated by backend when messages are fetched)
    setUnreadCounts(prev => ({
      ...prev,
      [employee._id]: 0
    }));
    
    // Refresh unread counts for all employees after a short delay
    setTimeout(() => {
      fetchUnreadCounts(employees);
    }, 1000);
  };

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket.IO setup
  useEffect(() => {
    if (!currentEmployeeId) return;

    socket.current = io(import.meta.env.VITE_BASE_URL);

    if (socket.current) {
      // Join employee chat room
      socket.current.emit('join_employee_chat', currentEmployeeId);
      console.log('Joined employee chat room:', currentEmployeeId);

      // Test connection
      socket.current.on('connect', () => {
        console.log('Socket.IO connected successfully');
      });

      socket.current.on('disconnect', () => {
        console.log('Socket.IO disconnected');
      });

      // Listen for new messages
      socket.current.on('receive_employee_message', (message) => {
        console.log('Received employee message:', message);
        setMessages(prev => {
          if (!prev.some(m => m._id === message._id)) {
            // Extract IDs properly (handle both string and object formats)
            const senderId = typeof message.senderId === 'object' ? message.senderId._id : message.senderId;
            const receiverId = typeof message.receiverId === 'object' ? message.receiverId._id : message.receiverId;
            
          // Only add if it's for the currently selected employee
          if (selectedEmployee && (
            (senderId === selectedEmployee._id && receiverId === currentEmployeeId) ||
            (senderId === currentEmployeeId && receiverId === selectedEmployee._id)
          )) {
            console.log('Adding message to current chat');
            return [...prev, message];
          } else if (senderId !== currentEmployeeId) {
            // If message is from someone else and not for current chat, increment unread count
            // Only increment if the message is not already read
            if (!message.isRead) {
              console.log('Incrementing unread count for:', senderId);
              setUnreadCounts(prev => ({
                ...prev,
                [senderId]: (prev[senderId] || 0) + 1
              }));
            }
          }
          }
          return prev;
        });
      });

      // Listen for message sent confirmation (only for messages sent by current user)
      socket.current.on('employee_message_sent', (message) => {
        console.log('Message sent confirmation:', message);
        setMessages(prev => {
          if (!prev.some(m => m._id === message._id)) {
            // Extract IDs properly (handle both string and object formats)
            const senderId = typeof message.senderId === 'object' ? message.senderId._id : message.senderId;
            const receiverId = typeof message.receiverId === 'object' ? message.receiverId._id : message.receiverId;
            
            // Only add if it's sent by current user and for the currently selected employee
            if (selectedEmployee && senderId === currentEmployeeId && receiverId === selectedEmployee._id) {
              console.log('Adding sent message to current chat');
              return [...prev, message];
            }
          }
          return prev;
        });
      });
    }

    // Fetch employees on component mount
    fetchEmployees();

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [currentEmployeeId]);

  // Update socket event listeners when selectedEmployee changes
  useEffect(() => {
    if (!socket.current || !selectedEmployee) return;

    // Remove old listeners
    socket.current.off('receive_employee_message');
    socket.current.off('employee_message_sent');

    // Add new listeners
    socket.current.on('receive_employee_message', (message) => {
      console.log('Received employee message (updated listener):', message);
      console.log('Message senderId:', message.senderId);
      console.log('Message receiverId:', message.receiverId);
      console.log('Current employee ID:', currentEmployeeId);
      console.log('Selected employee ID:', selectedEmployee?._id);
      
      setMessages(prev => {
        if (!prev.some(m => m._id === message._id)) {
          // Extract IDs properly (handle both string and object formats)
          const senderId = typeof message.senderId === 'object' ? message.senderId._id : message.senderId;
          const receiverId = typeof message.receiverId === 'object' ? message.receiverId._id : message.receiverId;
          
          console.log('Extracted senderId:', senderId);
          console.log('Extracted receiverId:', receiverId);
          
          // Only add if it's for the currently selected employee
          if (selectedEmployee && (
            (senderId === selectedEmployee._id && receiverId === currentEmployeeId) ||
            (senderId === currentEmployeeId && receiverId === selectedEmployee._id)
          )) {
            console.log('Adding message to current chat (updated listener)');
            return [...prev, message];
          } else if (senderId !== currentEmployeeId) {
            // If message is from someone else and not for current chat, increment unread count
            // Only increment if the message is not already read
            if (!message.isRead) {
              console.log('Incrementing unread count for (updated listener):', senderId);
              setUnreadCounts(prev => ({
                ...prev,
                [senderId]: (prev[senderId] || 0) + 1
              }));
            }
          } else {
            console.log('Message not for current chat - ignoring');
          }
        }
        return prev;
      });
    });

    socket.current.on('employee_message_sent', (message) => {
      console.log('Message sent confirmation (updated listener):', message);
      setMessages(prev => {
        if (!prev.some(m => m._id === message._id)) {
          // Extract IDs properly (handle both string and object formats)
          const senderId = typeof message.senderId === 'object' ? message.senderId._id : message.senderId;
          const receiverId = typeof message.receiverId === 'object' ? message.receiverId._id : message.receiverId;
          
          // Only add if it's sent by current user and for the currently selected employee
          if (selectedEmployee && senderId === currentEmployeeId && receiverId === selectedEmployee._id) {
            console.log('Adding sent message to current chat (updated listener)');
            return [...prev, message];
          }
        }
        return prev;
      });
    });
  }, [selectedEmployee, currentEmployeeId]);

  // Format time for display
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get file icon based on extension
  const getFileIcon = (extension) => {
    const iconMap = {
      // Documents
      'pdf': 'bi-file-earmark-pdf',
      'doc': 'bi-file-earmark-word',
      'docx': 'bi-file-earmark-word',
      'txt': 'bi-file-earmark-text',
      'rtf': 'bi-file-earmark-text',
      'odt': 'bi-file-earmark-text',
      // Spreadsheets
      'xls': 'bi-file-earmark-excel',
      'xlsx': 'bi-file-earmark-excel',
      'csv': 'bi-file-earmark-spreadsheet',
      'ods': 'bi-file-earmark-spreadsheet',
      // Presentations
      'ppt': 'bi-file-earmark-ppt',
      'pptx': 'bi-file-earmark-ppt',
      'odp': 'bi-file-earmark-ppt',
      // Archives
      'zip': 'bi-file-earmark-zip',
      'rar': 'bi-file-earmark-zip',
      '7z': 'bi-file-earmark-zip',
      'tar': 'bi-file-earmark-zip',
      'gz': 'bi-file-earmark-zip',
      // Code files
      'js': 'bi-file-earmark-code',
      'html': 'bi-file-earmark-code',
      'css': 'bi-file-earmark-code',
      'json': 'bi-file-earmark-code',
      'xml': 'bi-file-earmark-code',
      'py': 'bi-file-earmark-code',
      'java': 'bi-file-earmark-code',
      'cpp': 'bi-file-earmark-code',
      'c': 'bi-file-earmark-code',
      'php': 'bi-file-earmark-code'
    };
    return iconMap[extension] || 'bi-file-earmark-text';
  };

  // Get file color based on extension
  const getFileColor = (extension) => {
    const colorMap = {
      'pdf': '#dc3545',
      'doc': '#0d6efd',
      'docx': '#0d6efd',
      'xls': '#198754',
      'xlsx': '#198754',
      'ppt': '#fd7e14',
      'pptx': '#fd7e14',
      'zip': '#6f42c1',
      'js': '#f7df1e',
      'html': '#e34c26',
      'css': '#1572b6',
      'json': '#000000',
      'xml': '#ff6600',
      'py': '#3776ab',
      'java': '#ed8b00',
      'cpp': '#00599c',
      'c': '#00599c',
      'php': '#777bb4'
    };
    return colorMap[extension] || '#6c757d';
  };

  // Render file content
  const renderFileContent = (message) => {
    const fileElements = [];

    // Render images and documents
    if (message.imageUrls && message.imageUrls.length > 0) {
      message.imageUrls.forEach((imageUrl, index) => {
        // Remove 'uploads/' prefix from the URL for display
        const displayUrl = imageUrl.replace('uploads/', '');
        const fullImageUrl = `${import.meta.env.VITE_BASE_URL}${displayUrl}`;
        const fileExtension = imageUrl.split('.').pop().toLowerCase();
        const documentExtensions = [
          'pdf', 'doc', 'docx', 'txt', 'rtf', 'odt',
          'xls', 'xlsx', 'csv', 'ods',
          'ppt', 'pptx', 'odp',
          'zip', 'rar', '7z', 'tar', 'gz',
          'json', 'xml', 'html', 'css', 'js', 'py', 'java', 'cpp', 'c', 'php'
        ];
        const isDocument = documentExtensions.includes(fileExtension);
        
        if (isDocument) {
          // Render document
          const fileName = imageUrl.split('/').pop();
          const fileIcon = getFileIcon(fileExtension);
          const fileColor = getFileColor(fileExtension);
          
          fileElements.push(
            <div key={`document-${index}`} className="mb-2">
              <div 
                className="d-flex align-items-center p-2 border rounded"
                style={{ 
                  backgroundColor: '#f8f9fa',
                  cursor: 'pointer',
                  maxWidth: '300px'
                }}
                onClick={() => window.open(fullImageUrl, '_blank')}
              >
                <i className={`bi ${fileIcon} me-2`} style={{ fontSize: '1.5rem', color: fileColor }}></i>
                <div className="flex-grow-1">
                  <div className="fw-bold" style={{ fontSize: '0.9rem' }}>
                    {fileName}
                  </div>
                  <small className="text-muted">
                    {fileExtension.toUpperCase()} File
                  </small>
                </div>
                <i className="bi bi-download ms-2" style={{ color: '#6c757d' }}></i>
              </div>
            </div>
          );
        } else {
          // Render image
          fileElements.push(
            <div key={`image-${index}`} className="mb-2">
              <img
                src={fullImageUrl}
                alt={`Image ${index + 1}`}
                className="img-fluid rounded"
                style={{ 
                  maxWidth: '200px', 
                  maxHeight: '200px', 
                  objectFit: 'cover',
                  cursor: 'pointer'
                }}
                onClick={() => window.open(fullImageUrl, '_blank')}
              />
            </div>
          );
        }
      });
    }

    // Render video
    if (message.videoUrl) {
      // Remove 'uploads/' prefix from the URL for display
      const displayVideoUrl = message.videoUrl.replace('uploads/', '');
      const fullVideoUrl = `${import.meta.env.VITE_BASE_URL}${displayVideoUrl}`;
      fileElements.push(
        <div key="video" className="mb-2">
          <video
            controls
            className="img-fluid rounded"
            style={{ maxWidth: '300px', maxHeight: '200px' }}
          >
            <source src={fullVideoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    // Render audio
    if (message.audioUrl) {
      // Remove 'uploads/' prefix from the URL for display
      const displayAudioUrl = message.audioUrl.replace('uploads/', '');
      const fullAudioUrl = `${import.meta.env.VITE_BASE_URL}${displayAudioUrl}`;
      fileElements.push(
        <div key="audio" className="mb-2">
          <audio controls className="w-100">
            <source src={fullAudioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    }

    // Render recording
    if (message.recordingUrl) {
      // Remove 'uploads/' prefix from the URL for display
      const displayRecordingUrl = message.recordingUrl.replace('uploads/', '');
      const fullRecordingUrl = `${import.meta.env.VITE_BASE_URL}${displayRecordingUrl}`;
      fileElements.push(
        <div key="recording" className="mb-2">
          <div className="d-flex align-items-center">
            <i className="bi bi-mic-fill me-2"></i>
            <audio controls className="flex-grow-1">
              <source src={fullRecordingUrl} type="audio/webm" />
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      );
    }

    return fileElements;
  };

  // Render message
  const renderMessage = (message) => {
    // Extract sender ID properly (handle both string and object formats)
    const senderId = typeof message.senderId === 'object' ? message.senderId._id : message.senderId;
    const isCurrentUser = senderId === currentEmployeeId;
    
    return (
      <div 
        key={message._id} 
        className={`d-flex ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'} mb-3`}
      >
        <div 
          className={`px-3 py-2 rounded-3 ${isCurrentUser ? 'bg-primary text-white' : 'bg-light text-dark'}`}
          style={{ 
            maxWidth: '70%',
            backgroundColor: isCurrentUser ? '#007bff' : '#f8f9fa',
            border: isCurrentUser ? 'none' : '1px solid #dee2e6'
          }}
        >
          {/* Show sender name for received messages */}
          {!isCurrentUser && (
            <div className="sender-name mb-1" style={{ 
              fontSize: '0.75rem', 
              fontWeight: 'bold', 
              color: '#6c757d' 
            }}>
              {typeof message.senderId === 'object' ? message.senderId.employeeName : 'Unknown'}
            </div>
          )}
          
          {/* Render file content */}
          {renderFileContent(message)}
          
          {/* Render text message */}
          {message.message && (
            <div className="message-text">{message.message}</div>
          )}
          
          <div className={`text-end ${isCurrentUser ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.7rem' }}>
            {formatTime(message.createdAt)}
            {isCurrentUser && <span className="ms-1">✓</span>}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div id="mytask-layout">
        <Sidebar />
        <div className="main px-lg-4 px-md-4">
          <Header />
          <div className="body d-flex py-lg-3 py-md-2">
            <div className="container-xxl">
              <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <>
      <div id="mytask-layout">
        <Sidebar />
        <div className="main px-lg-4 px-md-4">
          <Header />
            <div className="body d-flex py-lg-3 py-md-2">
              <div className="container-xxl">
                <div className="row align-items-center">
                  <div className="border-0 mb-4">
                  <div className="card-header py-3 px-0 d-sm-flex align-items-center justify-content-between border-bottom">
                      <h3 className="fw-bold py-3 mb-0">Employee Chats</h3>
                  </div>
                </div>
              </div>

              {/* Chat Interface */}
              <div className="row g-0 rounded-2" style={{ height: '700px', border: '1px solid #dee2e6' }}>
                {/* Employees List - Now on the left */}
                <div className="col-md-4 border-end">
                  <div className="card border-0 h-100">
                    <div className="card-header py-3 px-4 bg-light">
                      <h6 className="mb-0">Employees ({employees.length})</h6>
                    </div>
                    <div 
                      className="card-body p-0"
                      style={{ 
                        height: 'calc(100% - 60px)', 
                        overflowY: 'auto',
                        maxHeight: '600px'
                      }}
                    >
                      {employees.length > 0 ? (
                        <div className="list-group list-group-flush">
                          {employees.map(employee => (
                            <div
                              key={employee._id}
                              className={`list-group-item list-group-item-action ${
                                selectedEmployee?._id === employee._id ? 'active' : ''
                              }`}
                              onClick={() => handleEmployeeSelect(employee)}
                              style={{ 
                                cursor: 'pointer',
                                height: '60px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <div className="d-flex align-items-center w-100">
                                <img
                                  src={`${import.meta.env.VITE_BASE_URL}${employee.employeeImage?.replace('uploads/', '') || 'default.jpeg'}`}
                                  className="rounded-circle me-3"
                                  alt={employee.employeeName}
                                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                />
                                <div className="flex-grow-1">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0">{employee.employeeName}</h6>
                                    {unreadCounts[employee._id] > 0 && (
                                      <span 
                                        className="badge bg-danger rounded-pill"
                                        style={{ 
                                          fontSize: '0.7rem',
                                          minWidth: '20px',
                                          height: '20px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                      >
                                        {unreadCounts[employee._id] > 99 ? '99+' : unreadCounts[employee._id]}
                                      </span>
                                    )}
                                  </div>
                                  <small className="text-muted">{employee.department}</small>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-muted">
                          <p>No other employees found</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chat Area - Now on the right */}
                <div className="col-md-8" style={{ backgroundColor: '#f8f9fa' }}>
                  {selectedEmployee ? (
                    <div className="card border-0 h-100">
                      {/* Chat Header */}
                      <div className="card-header py-3 px-4 bg-primary text-white">
                        <div className="d-flex align-items-center">
                          <img
                            src={`${import.meta.env.VITE_BASE_URL}${selectedEmployee.employeeImage?.replace('uploads/', '') || 'default.jpeg'}`}
                            className="rounded-circle me-3"
                            alt={selectedEmployee.employeeName}
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          />
                          <div>
                            <h6 className="mb-0">{selectedEmployee.employeeName}</h6>
                            <small className="text-white-50">{selectedEmployee.department} - {selectedEmployee.designation}</small>
                          </div>
                        </div>
                      </div>

                      {/* Messages Area */}
                      <div 
                        className="card-body p-3"
                        style={{ 
                          height: '600px', 
                          overflowY: 'auto',
                          backgroundColor: '#ffffff',
                          maxHeight: '600px'
                        }}
                      >
                        {messages.map(renderMessage)}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Input */}
                      <div className="card-footer p-3">
                        <form onSubmit={sendMessage}>
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Type a message or send files using 📎..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                            />
                            
                            {/* Attachment Button */}
                            <Dropdown>
                              <Dropdown.Toggle 
                                variant="outline-secondary" 
                                style={{ border: '1px solid #dee2e6' }}
                                disabled={!selectedEmployee}
                              >
                                <i className="bi bi-paperclip"></i>
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
                                <Dropdown.Item onClick={() => document.getElementById('documentUpload').click()}>
                                  <i className="bi bi-file-earmark-text me-2"></i>Document
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>

                            <button 
                              className="btn btn-primary" 
                              type="submit"
                              disabled={!newMessage.trim() || !selectedEmployee}
                            >
                              <i className="bi bi-send"></i>
                            </button>
                          </div>
                        </form>

                        {/* Hidden file inputs */}
                        <input
                          type="file"
                          id="imageUpload"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleFileUpload}
                          multiple
                        />
                        <input
                          type="file"
                          id="videoUpload"
                          accept="video/*"
                          style={{ display: 'none' }}
                          onChange={handleFileUpload}
                        />
                        <input
                          type="file"
                          id="audioUpload"
                          accept="audio/*"
                          style={{ display: 'none' }}
                          onChange={handleFileUpload}
                        />
                        <input
                          type="file"
                          id="documentUpload"
                          accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.xls,.xlsx,.csv,.ods,.ppt,.pptx,.odp,.zip,.rar,.7z,.tar,.gz,.json,.xml,.html,.css,.js,.py,.java,.cpp,.c,.php"
                          style={{ display: 'none' }}
                          onChange={handleFileUpload}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="card border-0 h-100 d-flex align-items-center justify-content-center">
                      <div className="text-center text-muted">
                        <i className="bi bi-chat-dots" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                        <h5 className="mt-3">Select an employee to start chatting</h5>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer />
        
        {/* File Preview Modal */}
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
    </>
  );
};

export default ChatEmployee;
