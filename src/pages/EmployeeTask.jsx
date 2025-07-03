import React, { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "../employeeCompt/EmployeeSidebar";
import Header from "../employeeCompt/EmployeeHeader";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Loading.css";
import io from 'socket.io-client';
import FloatingMenu from '../Chats/FloatingMenu'

const Tasks = () => {
  
  const [viewMode, setViewMode] = useState("row");
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskStatuses, setTaskStatuses] = useState({});
  const [showFullDescription, setShowFullDescription] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedTask, setSelectedTask] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [notifications, setNotifications] = useState({});
  const messageContainerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage, setTasksPerPage] = useState(10);
  const messageInputRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/employees`);
        setEmployees(response.data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('emp_token');
        const token1 = localStorage.getItem('emp_user_id');
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}api/author`, {
          // headers: { Authorization: token }
          _id: token1
        });

        // console.log('API response:', response.data);

        const tasksData = Array.isArray(response.data.tasks) ? response.data.tasks : [];

        // Sort tasks by taskDate (assuming taskDate exists, otherwise use taskEndDate)
        const sortedTasks = tasksData.sort((a, b) => {
          const dateA = new Date(a.taskDate);
          const dateB = new Date(b.taskDate);
          return dateB - dateA; // Sort in descending order (most recent first)
        });

        setTasks(sortedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    const statuses = {};
    tasks.forEach(task => {
      statuses[task._id] = task.taskStatus;
    });
    setTaskStatuses(statuses);
  }, [tasks]);

  const handleTaskUpdate = async (event, id) => {
    const { value } = event.target;
    let isCompleted = value === "Completed";

    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}api/update/${id}`,
        { taskStatus: value, isCompleted }
      );

      setTasks(
        tasks.map((task) =>
          task._id === id ? { ...task, taskStatus: value, isCompleted } : task
        )
      );

      setTaskStatuses({
        ...taskStatuses,
        [id]: value
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchMessages = async (taskId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/taskMessages/${taskId}`);
      setMessages(response.data);
      // Reset notification count for this task
      setNotifications(prev => ({ ...prev, [taskId]: 0 }));
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };
  const userData = JSON.parse(localStorage.getItem('emp_user')); // Assuming 'user' is the key where user info is stored
  const userName = userData.employeeName
    ;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!content.trim() || !selectedTask) return;

    const userData = JSON.parse(localStorage.getItem('emp_user'));
    const senderId = userData.employeeName;

    const formData = new FormData();
    formData.append('content', content);
    formData.append('senderId', senderId);
    formData.append('taskId', selectedTask._id);

    for (let file of files) {
      formData.append('files', file);
    }

    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}api/taskMessage`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setContent('');
      setFiles([]);
      // Reset the file input element
      const fileInput = document.getElementById('fileUpload');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const newSocket = io(`${import.meta.env.VITE_BASE_URL}`);
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewTaskMessage = (message) => {
      if (message.taskId) {
        setMessages(prevMessages => [...prevMessages, message]);

        // Only update notification if the chat modal is not open for this specific task
        if (!isChatModalOpen || (selectedTask && message.taskId !== selectedTask._id)) {
          setNotifications(prev => ({
            ...prev,
            [message.taskId]: (prev[message.taskId] || 0) + 1
          }));
        }
      }
    };

    const handleNewTaskNotification = ({ taskId }) => {
      // Only show notification if chat modal is closed or if it's for a different task
      if (!isChatModalOpen || (selectedTask && taskId !== selectedTask._id)) {
        setNotifications(prev => ({
          ...prev,
          [taskId]: (prev[taskId] || 0) + 1
        }));
      }
    };

    socket.on('new task message', handleNewTaskMessage);
    socket.on('new task notification', handleNewTaskNotification);

    return () => {
      socket.off('new task message', handleNewTaskMessage);
      socket.off('new task notification', handleNewTaskNotification);
    };
  }, [socket, isChatModalOpen, selectedTask]);

  useEffect(() => {
    if (!socket) return;

    tasks.forEach(task => {
      socket.emit('join task', task._id);
    });

    return () => {
      tasks.forEach(task => {
        socket.emit('leave task', task._id);
      });
    };
  }, [socket, tasks]);

  // Modify filtering logic based on filterStatus and searchQuery
  const filteredTasks = Array.isArray(tasks) ? tasks.filter((task) => {
    const searchTerms = searchQuery.toLowerCase().split(' ');
    const taskData = [
      task.projectName.toLowerCase(),
      task.taskStatus.toLowerCase(),
      task.description.toLowerCase(),
      new Date(task.taskEndDate).toLocaleDateString().toLowerCase(),
      task.taskAssignPerson.employeeName.toLowerCase(),
      task.assignedBy.toLowerCase(),
      task.taskPriority.toLowerCase()
    ].join(' ');

    const matchesSearch = searchTerms.every(term => taskData.includes(term));
    const matchesFilter = filterStatus === "All" || task.taskStatus === filterStatus;

    return matchesSearch && matchesFilter;
  }) : [];

  const handleImageClick = useCallback((imageUrl) => {
    window.open(imageUrl, '_blank');
  }, []);

  // Pagination logic
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Next page
  const nextPage = () => setCurrentPage((prevPage) => Math.min(prevPage + 1, Math.ceil(filteredTasks.length / tasksPerPage)));

  // Previous page
  const prevPage = () => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));

  // Handle tasks per page change
  const handleTasksPerPageChange = (e) => {
    const value = e.target.value;
    setTasksPerPage(value === 'all' ? filteredTasks.length : parseInt(value, 10));
    setCurrentPage(1); // Reset to first page when changing the number of tasks per page
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Modify the handleOpenMessages function
  const handleOpenMessages = (task) => {
    setSelectedTask(task);
    fetchMessages(task._id);
    // Only clear notifications when modal is actually opened
    if (document.getElementById('taskMessages').classList.contains('show')) {
      setNotifications(prev => ({ ...prev, [task._id]: 0 }));
    }
    setIsChatModalOpen(true);
  };

  // Add event listener for modal close
  useEffect(() => {
    const taskMessagesModal = document.getElementById('taskMessages');
    if (taskMessagesModal) {
      const handleModalHidden = () => {
        setIsChatModalOpen(false);
      };

      taskMessagesModal.addEventListener('hidden.bs.modal', handleModalHidden);

      return () => {
        taskMessagesModal.removeEventListener('hidden.bs.modal', handleModalHidden);
      };
    }
  }, []);

  // Add this to persist notifications in localStorage
  useEffect(() => {
    // Load notifications from localStorage on component mount
    const savedNotifications = localStorage.getItem('taskNotifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('taskNotifications', JSON.stringify(notifications));
  }, [notifications]);

  return (
    <>
      <div id="mytask-layout">
        <Sidebar />
        {/* main body area */}
        <div className="main px-lg-4 px-md-4">
          {/* Body: Header */}
          <Header />
          <>
            {/* Body: Body */}
            <div className="body d-flex py-lg-3 py-md-2">
              <div className="container-xxl">
                <div className="row align-items-center">
                  <div className="border-0 mb-4">
                    <div className="card-header py-3 no-bg bg-transparent d-flex align-items-center px-0 justify-content-between border-bottom flex-wrap mb-3">
                      <h3 className="fw-bold mb-0">Task Management</h3>
                      <div>
                        <div className="d-flex">
                          {viewMode === 'row' ? (
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => setViewMode('list')}
                              title="Switch to List View"
                            >
                              <i className="bi bi-list-task"></i>
                            </button>
                          ) : (
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => setViewMode('row')}
                              title="Switch to Grid View"
                            >
                              <i className="bi bi-grid-3x3-gap-fill"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-auto d-flex justify-content-between gap-5">
                      <div className="order-0">
                        <div className="input-group">
                          <input
                            type="search"
                            className="form-control"
                            aria-label="search"
                            aria-describedby="addon-wrapping"
                            placeholder="Search tasks (project, status, description, due date, etc.)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          <button
                            type="button"
                            className="input-group-text add-member-top"
                            id="addon-wrappingone"
                            data-bs-toggle="modal"
                            data-bs-target="#addUser"
                          >
                            <i className="fa fa-plus" />
                          </button>
                          <button
                            type="button"
                            className="input-group-text"
                            id="addon-wrapping"
                          >
                            <i className="fa fa-search" />
                          </button>
                        </div>
                      </div>

                      <div className="filter-container d-flex align-items-center" style={{
                        padding: '5px',
                        background: '#f8f9fa',
                        borderRadius: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        <div className="nav tab-body-header rounded prtab-set d-inline-flex" role="tablist" style={{ gap: '8px' }}>
                          <div className="nav-item" style={{ position: 'relative' }}>
                            <a
                              className={`nav-link ${filterStatus === "All" ? "active" : ""}`}
                              onClick={() => setFilterStatus("All")}
                              role="tab"
                              style={{
                                padding: '8px 20px',
                                fontWeight: '600',
                                fontSize: '14px',
                                color: filterStatus === "All" ? 'white' : '#666',
                                background: filterStatus === "All" ? 'linear-gradient(135deg, #4169e1, #1e40af)' : 'transparent',
                                borderRadius: '8px',
                                border: 'none',
                                transition: 'all 0.2s ease',
                                zIndex: '1',
                                position: 'relative'
                              }}
                            >
                              All
                            </a>
                          </div>
                          <div className="nav-item" style={{ position: 'relative' }}>
                            <a
                              className={`nav-link ${filterStatus === "Not Started" ? "active" : ""}`}
                              onClick={() => setFilterStatus("Not Started")}
                              role="tab"
                              style={{
                                padding: '8px 20px',
                                fontWeight: '600',
                                fontSize: '14px',
                                color: filterStatus === "Not Started" ? 'white' : '#666',
                                background: filterStatus === "Not Started" ? 'linear-gradient(135deg, #4169e1, #1e40af)' : 'transparent',
                                borderRadius: '8px',
                                border: 'none',
                                transition: 'all 0.2s ease',
                                zIndex: '1',
                                position: 'relative'
                              }}
                            >
                              <i className={`icofont-ui-timer me-1 ${filterStatus === "Not Started" ? '' : 'text-warning'}`}
                                style={{ fontSize: '14px' }}></i>
                              Not Started
                            </a>
                          </div>
                          <div className="nav-item" style={{ position: 'relative' }}>
                            <a
                              className={`nav-link ${filterStatus === "In Progress" ? "active" : ""}`}
                              onClick={() => setFilterStatus("In Progress")}
                              role="tab"
                              style={{
                                padding: '8px 20px',
                                fontWeight: '600',
                                fontSize: '14px',
                                color: filterStatus === "In Progress" ? 'white' : '#666',
                                background: filterStatus === "In Progress" ? 'linear-gradient(135deg, #4169e1, #1e40af)' : 'transparent',
                                borderRadius: '8px',
                                border: 'none',
                                transition: 'all 0.2s ease',
                                zIndex: '1',
                                position: 'relative'
                              }}
                            >
                              <i className={`icofont-spinner-alt-3 me-1 ${filterStatus === "In Progress" ? '' : 'text-warning'}`}
                                style={{ fontSize: '14px' }}></i>
                              In Progress
                            </a>
                          </div>
                          <div className="nav-item" style={{ position: 'relative' }}>
                            <a
                              className={`nav-link ${filterStatus === "Completed" ? "active" : ""}`}
                              onClick={() => setFilterStatus("Completed")}
                              role="tab"
                              style={{
                                padding: '8px 20px',
                                fontWeight: '600',
                                fontSize: '14px',
                                color: filterStatus === "Completed" ? 'white' : '#666',
                                background: filterStatus === "Completed" ? 'linear-gradient(135deg, #ff70b4, #ff69b4)' : 'transparent',
                                borderRadius: '8px',
                                border: 'none',
                                transition: 'all 0.2s ease',
                                zIndex: '1',
                                position: 'relative'
                              }}
                            >
                              <i className={`icofont-verification-check me-1 ${filterStatus === "Completed" ? '' : 'text-success'}`}
                                style={{ fontSize: '14px' }}></i>
                              Completed
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>{" "}
                {/* Row end  */}
                <div className="row">
                  {viewMode === "list" ? (
                    // List View Rendering (Modern Styled)
                    <div className="card mb-3" style={{
                      borderRadius: '12px',
                      boxShadow: '0 6px 15px rgba(0,0,0,0.05)',
                      border: 'none',
                      overflow: 'hidden'
                    }}>
                      <div className="card-body" style={{ padding: '0' }}>
                    <div className="table-responsive">
                          <table className="table align-middle mb-0" style={{
                            width: "100%",
                            borderCollapse: 'separate',
                            borderSpacing: '0'
                          }}>
                        <thead>
                              <tr style={{ background: '#f8f9fa' }}>
                                <th style={{
                                  padding: '16px 15px',
                                  fontWeight: '600',
                                  color: '#444',
                                  borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                  textAlign: 'center',
                                  fontSize: '14px'
                                }}>Sr.No</th>
                                <th style={{
                                  padding: '16px 15px',
                                  fontWeight: '600',
                                  color: '#444',
                                  borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                  fontSize: '14px'
                                }}>Project Name</th>
                                <th style={{
                                  padding: '16px 15px',
                                  fontWeight: '600',
                                  color: '#444',
                                  borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                  fontSize: '14px'
                                }}>Task Title</th>
                                <th style={{
                                  padding: '16px 15px',
                                  fontWeight: '600',
                                  color: '#444',
                                  borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                  fontSize: '14px'
                                }}>Assignee</th>
                                <th style={{
                                  padding: '16px 15px',
                                  fontWeight: '600',
                                  color: '#444',
                                  borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                  fontSize: '14px'
                                }}>Due Date</th>
                                <th style={{
                                  padding: '16px 15px',
                                  fontWeight: '600',
                                  color: '#444',
                                  borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                  fontSize: '14px'
                                }}>Priority</th>
                                <th style={{
                                  padding: '16px 15px',
                                  fontWeight: '600',
                                  color: '#444',
                                  borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                  textAlign: 'center',
                                  fontSize: '14px'
                                }}>Actions</th>
                                <th style={{
                                  padding: '16px 15px',
                                  fontWeight: '600',
                                  color: '#444',
                                  borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                  fontSize: '14px'
                                }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentTasks.map((task, index) => {
                            const getFormattedDate = (date) => {
                              const newDate = new Date(date);
                              return `${newDate.getDate()}/${newDate.getMonth() + 1}/${newDate.getFullYear()}`;
                            };
                                const currentDate = new Date();
                                const taskEndDate = new Date(task.taskEndDate);
                                const isOverdue = taskEndDate < currentDate && task.taskStatus !== 'Completed';
                            return (
                                  <tr key={task._id}
                                    style={{
                                      transition: 'background 0.2s ease',
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(82, 180, 71, 0.04)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <td style={{
                                      padding: '16px 15px',
                                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                                      textAlign: 'center'
                                    }}>
                                      <span style={{
                                        background: 'linear-gradient(135deg, #4169e1, #1e40af)',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: '30px',
                                        height: '30px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        boxShadow: '0 2px 5px rgba(255, 138, 0, 0.3)'
                                      }}>
                                        {index + 1}
                                      </span>
                                </td>
                                    <td style={{
                                      padding: '16px 15px',
                                      borderBottom: '1px solid rgba(0,0,0,0.05)'
                                    }}>
                                      <div className="d-flex gap-2 align-items-center">
                                        <div>
                                          <div style={{
                                            fontWeight: '600',
                                            color: '#333',
                                            fontSize: '14px'
                                          }}>
                                            {task.projectName}
                                          </div>
                                          <div className="mt-1" style={{
                                            fontSize: '12px',
                                            color: '#777'
                                          }}>
                                            <i className="bi-calendar3 me-1" style={{ color: '#ff70b4' }}></i>
                                            {getFormattedDate(task.taskDate)}
                                          </div>
                                        </div>
                                      </div>
                                </td>
                                    <td style={{
                                      padding: '16px 15px',
                                      borderBottom: '1px solid rgba(0,0,0,0.05)'
                                    }}>
                                      <div style={{
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        color: '#333',
                                        marginBottom: '3px'
                                      }}>
                                        {task.taskTitle || 'Untitled Task'}
                                      </div>
                                      <div style={{
                                        fontSize: '13px',
                                        color: '#666',
                                        display: '-webkit-box',
                                        WebkitLineClamp: '2',
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      }}>
                                        {task.description || 'No description'}
                                      </div>
                                      {isOverdue && (
                                        <div style={{
                                          backgroundColor: 'rgba(220, 53, 69, 0.1)',
                                          padding: '4px 8px',
                                          borderRadius: '4px',
                                          color: '#dc3545',
                                          fontSize: '11px',
                                          fontWeight: '600',
                                          display: 'inline-block',
                                          marginTop: '5px'
                                        }}>
                                          <i className="bi-exclamation-triangle-fill me-1"></i>
                                          Overdue
                                        </div>
                                      )}
                                    </td>
                                    <td style={{
                                      padding: '16px 15px',
                                      borderBottom: '1px solid rgba(0,0,0,0.05)'
                                    }}>
                                      <div className="d-flex align-items-center">
                                  <img
                                    src={`${import.meta.env.VITE_BASE_URL}${task.taskAssignPerson.employeeImage.replace('uploads/', '')}`}
                                    alt=""
                                    className="avatar rounded-circle"
                                    style={{
                                      width: '40px',
                                      height: '40px',
                                      transition: 'transform 0.3s ease-in-out',
                                      cursor: 'pointer',
                                            marginRight: '8px'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.transform = 'scale(4)';
                                      e.target.style.zIndex = '100';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.transform = 'scale(1)';
                                      e.target.style.zIndex = '1';
                                    }}
                                    onClick={() => handleImageClick(`${import.meta.env.VITE_BASE_URL}${task.taskAssignPerson.employeeImage.replace('uploads/', '')}`)}
                                  />
                                        <div>
                                          <div style={{
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#333'
                                          }}>{task.taskAssignPerson.employeeName}</div>
                                          <span style={{
                                            backgroundColor: 'rgba(13, 202, 240, 0.1)',
                                            color: '#0dcaf0',
                                            fontSize: '11px',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontWeight: '600'
                                          }}>Employee</span>
                                        </div>
                                      </div>
                                      <div className="mt-2" style={{
                                        fontSize: '12px',
                                        color: '#777'
                                      }}>
                                        <i className="bi-person-check me-1" style={{ color: '#ff70b4' }}></i>
                                        By: {task.assignedBy}
                                      </div>
                                </td>
                                    <td style={{
                                      padding: '16px 15px',
                                      borderBottom: '1px solid rgba(0,0,0,0.05)'
                                    }}>
                                      <div style={{
                                        backgroundColor: isOverdue ? 'rgba(220, 53, 69, 0.1)' : 'rgba(82, 180, 71, 0.1)',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        marginBottom: '5px'
                                      }}>
                                        {getFormattedDate(task.taskEndDate)}
                                      </div>
                                    </td>
                                    <td style={{
                                      padding: '16px 15px',
                                      borderBottom: '1px solid rgba(0,0,0,0.05)'
                                    }}>
                                      <span className="badge bg-danger text-end mt-2">
                                        {task.taskPriority}
                                      </span>
                                    </td>
                                    <td style={{
                                      padding: '16px 15px',
                                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                                      textAlign: 'center'
                                    }}>
                                      <div className="d-flex gap-2 justify-content-center">
                                    <button
                                      className="btn btn-outline-secondary btn-sm me-2 position-relative"
                                      data-bs-toggle="modal"
                                      data-bs-target="#taskMessages"
                                      onClick={() => handleOpenMessages(task)}
                                          style={{
                                            backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                            color: '#ff70b4',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            padding: '0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: 'none',
                                            transition: 'all 0.2s ease'
                                          }}
                                          onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.2)';
                                          }}
                                          onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.1)';
                                          }}
                                    >
                                      <i className="bi bi-chat-left-dots"></i>
                                      {notifications[task._id] > 0 && (
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                          {notifications[task._id]}
                                        </span>
                                      )}
                                    </button>
                                    <Link
                                      to="/images"
                                      className="btn btn-outline-secondary btn-sm"
                                      state={{
                                        images: task.taskImages,
                                        projectName: task.projectName,
                                      }}
                                          style={{
                                            backgroundColor: 'rgba(255, 94, 0, 0.1)',
                                            color: '#1e40af',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            padding: '0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: 'none',
                                            transition: 'all 0.2s ease'
                                          }}
                                          onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(255, 94, 0, 0.2)';
                                          }}
                                          onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(255, 94, 0, 0.1)';
                                          }}
                                    >
                                      <i className="bi-paperclip"></i>
                                    </Link>
                                  </div>
                                </td>
                                    <td style={{
                                      padding: '16px 15px',
                                      borderBottom: '1px solid rgba(0,0,0,0.05)'
                                    }}>
                                      <select
                                        className="form-select"
                                        aria-label="Default select Status"
                                        name="taskStatus"
                                        onChange={(e) => handleTaskUpdate(e, task._id)}
                                        value={taskStatuses[task._id]}
                                        style={{
                                          width: '100%',
                                          fontSize: '13px',
                                          backgroundColor:
                                            taskStatuses[task._id] === 'Not Started' ? 'rgba(255, 193, 7, 0.1)' :
                                              taskStatuses[task._id] === 'In Progress' ? 'rgba(13, 202, 240, 0.1)' :
                                                'rgba(82, 180, 71, 0.1)',
                                          color:
                                            taskStatuses[task._id] === 'Not Started' ? '#ffc107' :
                                              taskStatuses[task._id] === 'In Progress' ? '#0dcaf0' :
                                                '#ff70b4',
                                          border: 'none',
                                          borderRadius: '6px',
                                          padding: '8px 12px',
                                          fontWeight: '600'
                                        }}
                                      >
                                        <option value="Not Started">Not Started</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                      </select>
                                    </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Grid View Rendering (Modern Styled)
                    <div className="row">
                      {currentTasks.map((task, index) => {
                        const currentDate = new Date();
                        const taskEndDate = new Date(task.taskEndDate);
                        const isOverdue = taskEndDate < currentDate && task.taskStatus !== 'Completed';
                        // Calculate days remaining or overdue
                        const timeDiff = taskEndDate.getTime() - currentDate.getTime();
                        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                        const daysText = daysDiff === 0 ? "Due today" :
                          daysDiff > 0 ? `${daysDiff} days left` :
                            `${Math.abs(daysDiff)} days overdue`;
                        // Set priority colors
                        let priorityColor = '#999';
                        let priorityBg = '#f0f0f0';
                        if (task.taskPriority === 'Highest') {
                          priorityColor = '#1e40af';
                          priorityBg = 'rgba(255, 94, 0, 0.1)';
                        } else if (task.taskPriority === 'Medium') {
                          priorityColor = '#4169e1';
                          priorityBg = 'rgba(255, 138, 0, 0.1)';
                        } else if (task.taskPriority === 'Lowest') {
                          priorityColor = '#ff70b4';
                          priorityBg = 'rgba(82, 180, 71, 0.1)';
                        }
                        return (
                          <div key={task._id} className="col-12 col-sm-6 col-md-4 col-lg-4 mb-4">
                            <div className="card task-card" style={{
                              height: '100%',
                              minHeight: '400px',
                              display: 'flex',
                              flexDirection: 'column',
                              borderRadius: '15px',
                              border: 'none',
                              boxShadow: '0 5px 15px rgba(0,0,0,0.07)',
                              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                              overflow: 'hidden',
                              background: isOverdue
                                ? 'linear-gradient(to bottom right, #fff, #fff, #ffeae0, #ffded0)'
                                : 'white',
                            }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.11)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.07)';
                              }}>
                              {/* Task Status Top Banner */}
                              <div style={{
                                height: '6px',
                                width: '100%',
                                background: task.taskStatus === 'Completed'
                                  ? 'linear-gradient(to right, #ff70b4, #ff69b4)'
                                  : task.taskStatus === 'In Progress'
                                    ? 'linear-gradient(to right, #4169e1, #1e40af)'
                                    : isOverdue
                                      ? 'linear-gradient(to right, #1e40af, #d14b00)'
                                      : 'linear-gradient(to right, #ffb347, #ffcc33)'
                              }}></div>

                              <div className="card-body d-flex flex-column p-0">
                                {/* Header with Project Name */}
                                <div style={{
                                  padding: '15px 20px',
                                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  backgroundColor: 'rgba(0,0,0,0.02)',
                                }}>
                                  <div className="d-flex align-items-center" style={{ flex: 1 }}>
                                    <span style={{
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '50%',
                                      backgroundColor: '#ff70b4',
                                      color: 'white',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontWeight: 'bold',
                                      marginRight: '10px',
                                      fontSize: '14px'
                                    }}>
                                      {index + 1}
                                    </span>
                                    <h5 className="card-title text-capitalize fw-bold mb-0 text-truncate"
                                      style={{ maxWidth: '190px', fontSize: '16px' }}
                                      title={task.projectName}>
                                      {task.projectName}
                                    </h5>
                                  </div>
                                  {task.taskImages && task.taskImages.length > 0 && (
                                    <button
                                      className="btn btn-link p-0 ms-2"
                                      onClick={() => handleImageClick(`${import.meta.env.VITE_BASE_URL}${task.taskImages[0]}`)}
                                      style={{
                                        color: '#4169e1',
                                        transition: 'transform 0.2s ease',
                                      }}
                                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                      <i className="bi-paperclip fs-5" />
                                    </button>
                                  )}
                                </div>

                                {/* Task Content */}
                                <div className="flex-grow-1 p-3">
                                  <div className="mb-3">
                                    <div style={{
                                      fontWeight: '600',
                                      fontSize: '14px',
                                      color: '#333',
                                      marginBottom: '3px'
                                    }}>
                                      {task.taskTitle || 'Untitled Task'}
                                    </div>
                                    <div style={{
                                      fontSize: '13px',
                                      color: '#666',
                                      display: '-webkit-box',
                                      WebkitLineClamp: '2',
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}>
                                      {task.description || 'No description'}
                                    </div>
                                  </div>
                                  {/* Priority & Date Display */}
                                  <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div style={{
                                      backgroundColor: priorityBg,
                                      color: priorityColor,
                                      padding: '5px 10px',
                                      borderRadius: '20px',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px'
                                    }}>
                                      <i className="bi bi-flag-fill"></i>
                                      {task.taskPriority || 'No Priority'}
                                    </div>
                                    <div style={{
                                      color: isOverdue && task.taskStatus !== 'Completed' ? '#1e40af' : '#ff70b4',
                                      fontSize: '13px',
                                      fontWeight: '600',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '5px'
                                    }}>
                                      <i className={`bi ${isOverdue && task.taskStatus !== 'Completed' ? 'bi-alarm' : 'bi-calendar-check'}`}></i>
                                      {daysText}
                                    </div>
                                  </div>
                                  {/* Assigned Person */}
                                  <div className="mb-3" style={{
                                    backgroundColor: 'rgba(0,0,0,0.02)',
                                    borderRadius: '8px',
                                    padding: '10px 15px',
                                  }}>
                                    <p className="mb-1 fw-semibold" style={{ fontSize: '14px', color: '#666' }}>
                                      <i className="bi bi-person-fill me-2" style={{ color: '#ff70b4' }}></i>
                                      Assigned to:
                                    </p>
                                    <p className="mb-1" style={{
                                      fontWeight: '600',
                                      color: '#333',
                                      fontSize: '15px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between'
                                    }}>
                                      {task.taskAssignPerson && task.taskAssignPerson.employeeName
                                        ? task.taskAssignPerson.employeeName
                                        : 'Unassigned'}
                                      <span className="badge" style={{
                                        backgroundColor: 'rgba(82, 180, 71, 0.2)',
                                        color: '#ff70b4',
                                        fontSize: '11px',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                      }}>
                                        Employee
                                      </span>
                                    </p>
                                    <p className="mb-0" style={{ fontSize: '13px', color: '#666' }}>
                                      <i className="bi bi-person-plus me-1"></i>
                                      By: <span style={{ color: '#ff70b4', fontWeight: '600' }}>{task.assignedBy}</span>
                                    </p>
                                  </div>
                                </div>
                                {/* Task Controls */}
                                <div className="mb-3">
                                  <div className="row g-2">
                                    <div className="col-7">
                                      <label className="form-label mb-1" style={{ fontSize: '13px', color: '#666' }}>Due Date</label>
                                      <div style={{
                                        backgroundColor: isOverdue ? 'rgba(220, 53, 69, 0.1)' : 'rgba(82, 180, 71, 0.1)',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        marginBottom: '5px',
                                        fontWeight: '600',
                                        color: isOverdue ? '#dc3545' : '#ff70b4',
                                        fontSize: '14px',
                                      }}>
                                        {`${taskEndDate.getDate()}/${taskEndDate.getMonth() + 1}/${taskEndDate.getFullYear()}`}
                                      </div>
                                    </div>
                                    <div className="col-5">
                                      <label className="form-label mb-1" style={{ fontSize: '13px', color: '#666' }}>Priority</label>
                                      <div style={{
                                        backgroundColor: priorityBg,
                                        color: priorityColor,
                                        padding: '5px 10px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                      }}>
                                        <i className="bi bi-flag-fill"></i>
                                        {task.taskPriority || 'No Priority'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {/* Footer Actions */}
                                <div className="mt-auto p-3 pt-0">
                                  <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                      {task.taskStatus === 'Not Started' && (
                                        <span className="badge" style={{
                                          backgroundColor: 'rgba(255, 193, 7, 0.2)',
                                          color: '#ffc107',
                                          fontSize: '12px',
                                          padding: '5px 10px',
                                          borderRadius: '4px',
                                          fontWeight: '600'
                                        }}>Not Started</span>
                                      )}
                                      {task.taskStatus === 'In Progress' && (
                                        <span className="badge" style={{
                                          backgroundColor: 'rgba(255, 138, 0, 0.2)',
                                          color: '#4169e1',
                                          fontSize: '12px',
                                          padding: '5px 10px',
                                          borderRadius: '4px',
                                          fontWeight: '600'
                                        }}>In Progress</span>
                                      )}
                                      {task.taskStatus === 'Completed' && (
                                        <span className="badge" style={{
                                          backgroundColor: 'rgba(82, 180, 71, 0.2)',
                                          color: '#ff70b4',
                                          fontSize: '12px',
                                          padding: '5px 10px',
                                          borderRadius: '4px',
                                          fontWeight: '600'
                                        }}>Completed</span>
                                      )}
                                    </div>
                                    <button
                                      className="btn position-relative"
                                      data-bs-toggle="modal"
                                      data-bs-target="#taskMessages"
                                      onClick={() => handleOpenMessages(task)}
                                      style={{
                                        color: '#4169e1',
                                        padding: '5px 10px',
                                        transition: 'all 0.2s ease',
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(255, 138, 0, 0.1)',
                                        width: '38px',
                                        height: '38px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                      onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 138, 0, 0.2)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                      }}
                                      onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 138, 0, 0.1)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                      }}
                                    >
                                      <i className="bi bi-chat-left-dots"></i>
                                      {notifications[task._id] > 0 && (
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" style={{
                                          backgroundColor: '#1e40af',
                                          color: 'white',
                                          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                        }}>
                                          {notifications[task._id]}
                                        </span>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="mb-3">
                    <label htmlFor="tasksPerPage" className="form-label">Tasks per page:</label>
                    <select
                      id="tasksPerPage"
                      className="form-select"
                      value={tasksPerPage}
                      onChange={handleTasksPerPageChange}
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="all">Show All</option>
                    </select>
                  </div>

                  <nav>
                    <ul className="pagination">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={prevPage}>&laquo;</button>
                      </li>
                      {Array.from({ length: Math.ceil(filteredTasks.length / tasksPerPage) }, (_, i) => (
                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                          <button className="page-link bg-white" onClick={() => paginate(i + 1)}>{i + 1}</button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === Math.ceil(filteredTasks.length / tasksPerPage) ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={nextPage}>&raquo;</button>
                      </li>
                    </ul>
                  </nav>
                </div>

              </div>
            </div>



          </>
        </div>
        <FloatingMenu userType="employee" isMobile={isMobile} />
      </div>

      {/* Message Modal */}
      <div className="modal fade" id="taskMessages" tabIndex="-1" aria-labelledby="taskMessagesLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content" style={{
            borderRadius: '15px',
            border: 'none',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            height: '80vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div className="modal-header" style={{
              background: 'linear-gradient(135deg, #4169e1, #1e40af)',
              borderBottom: 'none',
              padding: '15px 20px',
              position: 'relative',
              zIndex: 1
            }}>
              <div className="d-flex align-items-center" style={{ width: '100%' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  <i className="bi bi-card-checklist" style={{ fontSize: '20px', color: 'white' }}></i>
                </div>
                <div style={{ flex: 1 }}>
                  <h5 className="modal-title" id="taskMessagesLabel" style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                    {selectedTask?.projectName}
                  </h5>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                    <i className="bi bi-chat-dots me-1"></i> Task Conversation
                  </span>
                </div>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '50%',
                  padding: '8px',
                  opacity: '1',
                  transition: 'all 0.2s ease'
                }}
                  onMouseOver={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                    e.currentTarget.style.transform = 'rotate(90deg)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                    e.currentTarget.style.transform = 'rotate(0deg)';
                  }}
                ></button>
              </div>
            </div>
            {/* Chat Body */}
            <div className="modal-body p-0" style={{
              flex: 1,
              overflowY: 'auto',
              backgroundColor: '#f5f5f5',
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23000000\" fill-opacity=\"0.03\" fill-rule=\"evenodd\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"3\"/%3E%3Ccircle cx=\"13\" cy=\"13\" r=\"3\"/%3E%3C/g%3E%3C/svg%3E")',
              padding: '20px'
            }} ref={messageContainerRef}>
              {messages.length === 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#888',
                  padding: '30px'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 138, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '15px'
                  }}>
                    <i className="bi bi-chat-square-text" style={{ fontSize: '40px', color: '#4169e1' }}></i>
                  </div>
                  <h6 style={{ color: '#666', marginBottom: '10px' }}>No messages yet</h6>
                  <p style={{ textAlign: 'center', fontSize: '14px' }}>
                    Start the conversation by sending your first message below.
                  </p>
                </div>
              ) : (
                <div className="chat-messages">
                  {messages.map((message, index) => {
                    const isCurrentUser = message.senderId === userName;
                    const prevSender = index > 0 ? messages[index - 1].senderId : null;
                    const showSender = prevSender !== message.senderId;
                    return (
                      <div key={index} className={`message-group ${isCurrentUser ? 'own-messages' : ''}`} style={{
                        marginBottom: showSender ? '20px' : '2px',
                        marginTop: showSender ? '20px' : '2px',
                      }}>
                        {showSender && !isCurrentUser && (
                          <div style={{
                            fontSize: '13px',
                            color: '#666',
                            marginLeft: '48px',
                            marginBottom: '5px'
                          }}>
                            {message.senderId}
                          </div>
                        )}
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                          marginBottom: '1px'
                        }}>
                          {!isCurrentUser && showSender && (
                            <div style={{
                              width: '35px',
                              height: '35px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(255, 138, 0, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: '10px',
                              flexShrink: 0
                            }}>
                              <i className="bi bi-person" style={{ color: '#4169e1', fontSize: '18px' }}></i>
                            </div>
                          )}
                          {!isCurrentUser && !showSender && (
                            <div style={{ width: '45px', flexShrink: 0 }}></div>
                          )}
                          <div style={{
                            maxWidth: '75%',
                            wordBreak: 'break-word',
                            backgroundColor: isCurrentUser ? 'rgba(82, 180, 71, 0.2)' : 'white',
                            color: '#333',
                            padding: '10px 14px',
                            borderRadius: isCurrentUser
                              ? '15px 15px 2px 15px'
                              : '15px 15px 15px 2px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            position: 'relative'
                          }}>
                            {message.content}
                            <div style={{
                              fontSize: '11px',
                              color: '#999',
                              textAlign: 'right',
                              marginTop: '4px'
                            }}>
                              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {isCurrentUser && (
                                <i className="bi bi-check-all ms-1" style={{ color: '#ff70b4' }}></i>
                              )}
                            </div>
                          </div>
                          {isCurrentUser && showSender && (
                            <div style={{
                              width: '35px',
                              height: '35px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(82, 180, 71, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginLeft: '10px',
                              flexShrink: 0
                            }}>
                              <i className="bi bi-person" style={{ color: '#ff70b4', fontSize: '18px' }}></i>
                            </div>
                          )}
                          {isCurrentUser && !showSender && (
                            <div style={{ width: '45px', flexShrink: 0 }}></div>
                          )}
                        </div>
                        {/* Attachments */}
                        {message.fileUrls && message.fileUrls.length > 0 && message.fileUrls.some(url => url) && (
                          <div style={{
                            display: 'flex',
                            justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                            marginTop: '5px'
                          }}>
                            {!isCurrentUser && (
                              <div style={{ width: '45px', flexShrink: 0 }}></div>
                            )}
                            <div style={{
                              maxWidth: '75%',
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '8px',
                              justifyContent: isCurrentUser ? 'flex-end' : 'flex-start'
                            }}>
                              {message.fileUrls.map((fileUrl, fileIndex) => {
                                if (fileUrl) {
                                  const cleanFileUrl = `${import.meta.env.VITE_BASE_URL}${fileUrl.replace('uploads/', '')}`;
                                  const fileExtension = cleanFileUrl.split('.').pop().toLowerCase();
                                  if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
                                    return (
                                      <div key={fileIndex} style={{
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        border: `2px solid ${isCurrentUser ? 'rgba(82, 180, 71, 0.3)' : 'rgba(255, 138, 0, 0.3)'}`,
                                        width: '120px',
                                        height: '120px',
                                        position: 'relative'
                                      }}>
                                        <a href={cleanFileUrl} target="_blank" rel="noopener noreferrer">
                                          <img
                                            src={cleanFileUrl}
                                            alt={`Attachment ${fileIndex + 1}`}
                                            style={{
                                              width: '100%',
                                              height: '100%',
                                              objectFit: 'cover',
                                              cursor: 'pointer'
                                            }}
                                          />
                                        </a>
                                      </div>
                                    );
                                  } else if (fileExtension === 'pdf') {
                                    return (
                                      <a
                                        key={fileIndex}
                                        href={cleanFileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '8px',
                                          padding: '8px 12px',
                                          backgroundColor: isCurrentUser ? 'rgba(82, 180, 71, 0.1)' : 'rgba(255, 138, 0, 0.1)',
                                          borderRadius: '10px',
                                          color: isCurrentUser ? '#ff70b4' : '#4169e1',
                                          textDecoration: 'none',
                                          maxWidth: '250px'
                                        }}
                                      >
                                        <i className="bi bi-file-pdf" style={{ fontSize: '20px' }}></i>
                                        <span style={{
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          fontSize: '13px'
                                        }}>
                                          PDF File
                                        </span>
                                      </a>
                                    );
                                  } else {
                                    return (
                                      <a
                                        key={fileIndex}
                                        href={cleanFileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '8px',
                                          padding: '8px 12px',
                                          backgroundColor: isCurrentUser ? 'rgba(82, 180, 71, 0.1)' : 'rgba(255, 138, 0, 0.1)',
                                          borderRadius: '10px',
                                          color: isCurrentUser ? '#ff70b4' : '#4169e1',
                                          textDecoration: 'none',
                                          maxWidth: '250px'
                                        }}
                                      >
                                        <i className="bi bi-file-earmark-text" style={{ fontSize: '20px' }}></i>
                                        <span style={{
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          fontSize: '13px'
                                        }}>
                                          Download File
                                        </span>
                                      </a>
                                    );
                                  }
                                }
                                return null;
                              })}
                            </div>
                            {isCurrentUser && (
                              <div style={{ width: '45px', flexShrink: 0 }}></div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Message Input Area */}
            <div className="chat-input-area" style={{
              padding: '15px',
              backgroundColor: 'white',
              borderTop: '1px solid rgba(0,0,0,0.05)',
              boxShadow: '0 -2px 10px rgba(0,0,0,0.03)',
              zIndex: 1
            }}>
              <form onSubmit={handleSendMessage} className="d-flex flex-column">
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '10px'
                }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <textarea
                      className="form-control"
                      id="currentMessage"
                      name="message"
                      rows="1"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                      ref={messageInputRef}
                      style={{
                        borderRadius: '20px',
                        border: '1px solid rgba(0,0,0,0.1)',
                        padding: '12px 50px 12px 15px',
                        color: '#333',
                        boxShadow: 'none',
                        resize: 'none',
                        fontSize: '14px',
                        lineHeight: '1.4',
                        overflowY: 'auto',
                        maxHeight: '120px'
                      }}
                      placeholder="Type a message here..."
                    />
                    <label
                      htmlFor="fileUpload"
                      style={{
                        position: 'absolute',
                        right: '15px',
                        bottom: '10px',
                        margin: 0,
                        cursor: 'pointer',
                        color: '#4169e1'
                      }}
                    >
                      <i className="bi bi-paperclip" style={{ fontSize: '20px' }}></i>
                    </label>
                    <input
                      type="file"
                      className="form-control d-none"
                      id="fileUpload"
                      onChange={handleFileChange}
                      multiple
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      backgroundColor: '#ff70b4',
                      color: 'white',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(82,180,71,0.3)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.backgroundColor = '#ff69b4';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.backgroundColor = '#ff70b4';
                    }}
                  >
                    <i className="bi bi-send" style={{ fontSize: '18px' }}></i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tasks;
