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

                      <div className="filter-container">
                        <select
                          className="form-select d-md-none"
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          style={{ width: 'auto' }}
                        >
                          <option value="All">All</option>
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>

                        <ul className="nav nav-tabs tab-body-header rounded prtab-set d-none d-md-flex" style={{ cursor: 'pointer', height: "fit-content" }} role="tablist">
                          <li className="nav-item">
                            <a
                              className={`nav-link ${filterStatus === "All" ? "active" : ""}`}
                              onClick={() => setFilterStatus("All")}
                              role="tab"
                            >
                              All
                            </a>
                          </li>
                          <li className="nav-item">
                            <a
                              className={`nav-link ${filterStatus === "Not Started" ? "active" : ""}`}
                              onClick={() => setFilterStatus("Not Started")}
                              role="tab"
                            >
                              Not Started
                            </a>
                          </li>
                          <li className="nav-item">
                            <a
                              className={`nav-link ${filterStatus === "In Progress" ? "active" : ""}`}
                              onClick={() => setFilterStatus("In Progress")}
                              role="tab"
                            >
                              In Progress
                            </a>
                          </li>
                          <li className="nav-item">
                            <a
                              className={`nav-link ${filterStatus === "Completed" ? "active" : ""}`}
                              onClick={() => setFilterStatus("Completed")}
                              role="tab"
                            >
                              Completed
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>

                  </div>
                </div>{" "}
                {/* Row end  */}
                <div className="row">
                  {viewMode === "list" ? (
                    // List View Rendering
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0" style={{ width: "100%" }}>
                        <thead>
                          <tr>
                            <th>Sr.No</th>
                            <th>Project Name</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Due Date</th>
                            <th>Assigned To</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentTasks.map((task, index) => {
                            const getFormattedDate = (date) => {
                              const newDate = new Date(date);
                              return `${newDate.getDate()}/${newDate.getMonth() + 1}/${newDate.getFullYear()}`;
                            };
                            return (
                              <tr key={task._id}>
                                <td><span className="fw-bold fs-6">{index + 1}.</span></td>
                                <td>
                                  {task.projectName}
                                  <br />
                                  <span
                                    className={`badge ${taskStatuses[task._id] === "Not Started"
                                      ? "bg-warning text-dark"
                                      : taskStatuses[task._id] === "In Progress"
                                        ? "bg-info text-dark"
                                        : "bg-success"
                                      }`}
                                  >
                                    {taskStatuses[task._id]}
                                  </span>
                                </td>
                                <td>
                                  <span className="fw-bold text-uppercase ">{task.taskTitle}</span>
                                  <p
                                    className="py-2 mb-0 task-description"
                                    style={{
                                      maxHeight: "5em",
                                      overflowY: "auto",
                                      width: "200px",  // Adjust this value as needed
                                    }}
                                  >

                                    {task.description}
                                  </p>
                                </td>
                                <td>
                                  <select
                                    className="form-select"
                                    aria-label="Default select Status"
                                    name="taskStatus"
                                    onChange={(e) => handleTaskUpdate(e, task._id)}
                                    value={taskStatuses[task._id]}
                                  >
                                    <option value="Not Started">Not Started</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                  </select>
                                </td>
                                <td>{getFormattedDate(task.taskEndDate)}</td>
                                <td className="">
                                  <img
                                    src={`${import.meta.env.VITE_BASE_URL}${task.taskAssignPerson.employeeImage.replace('uploads/', '')}`}
                                    alt=""
                                    className="avatar rounded-circle"
                                    style={{
                                      width: '40px',
                                      height: '40px',
                                      transition: 'transform 0.3s ease-in-out',
                                      cursor: 'pointer',
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
                                  <br />
                                  {task.taskAssignPerson.employeeName}
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <button
                                      className="btn btn-outline-secondary btn-sm me-2 position-relative"
                                      data-bs-toggle="modal"
                                      data-bs-target="#taskMessages"
                                      onClick={() => handleOpenMessages(task)}
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
                                    >
                                      <i className="bi-paperclip"></i>
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    // Grid View Rendering
                    <div className="row">
                      {currentTasks.map((task, index) => {
                        const getFormattedDate = (date) => {
                          const newDate = new Date(date);
                          const day = newDate.getDate();
                          const month = newDate.getMonth() + 1;
                          const year = newDate.getFullYear();

                          return `${day}/${month}/${year}`;
                        };

                        return (
                          <div className="col-md-4 mb-4" key={task._id}>
                            <div className="card task-card" style={{ width: "18rem" }}>
                              <div className="card-body dd-handle">
                                <div className="">
                                  <h5 className="fw-bold">{index + 1}. {task.projectName}</h5>
                                  <div className="text-muted" style={{ marginTop: "-0.8rem", marginLeft: "1.5rem" }}>{getFormattedDate(task.taskDate)}</div>
                                </div>
                                <div className="task-info d-flex align-items-center justify-content-between">
                                  <h6 className="py-1 px-2 rounded-1 d-inline-block fw-bold small-14 mb-0">
                                    <span className={`badge ${taskStatuses[task._id] === "Not Started" ? "bg-warning text-dark" : taskStatuses[task._id] === "In Progress" ? "bg-info text-dark" : "bg-success"}`}>
                                      {taskStatuses[task._id]}

                                    </span>
                                  </h6>
                                  <div className="task-priority d-flex flex-column align-items-center justify-content-center">
                                    <div className="avatar-list avatar-list-stacked m-0">
                                      <img
                                        className="avatar rounded-circle small-avt"
                                        src={`${import.meta.env.VITE_BASE_URL}${task.taskAssignPerson.employeeImage.replace('uploads/', '')}`}
                                        alt=""
                                        style={{
                                          transition: 'transform 0.3s ease-in-out',
                                          cursor: 'pointer',
                                        }}
                                        onMouseEnter={(e) => {
                                          e.target.style.transform = 'scale(8)';
                                          e.target.style.zIndex = '100';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.target.style.transform = 'scale(1)';
                                          e.target.style.zIndex = '1';
                                        }}
                                        onClick={() => handleImageClick(`${import.meta.env.VITE_BASE_URL}${task.taskAssignPerson.employeeImage.replace('uploads/', '')}`)}
                                      />
                                    </div>
                                    <div>{task.taskAssignPerson.employeeName}</div>
                                    <span className="badge bg-danger text-end mt-2">
                                      {task.taskPriority}
                                    </span>
                                  </div>
                                </div>
                                <span className="fw-bold text-uppercase ">{task.taskTitle}</span>
                                <p
                                  className="py-2 mb-0 task-description"
                                  style={{
                                    maxHeight: showFullDescription ? "none" : "11em",
                                    overflowY: "auto",
                                  }}
                                >
                                  {task.description}

                                </p>
                                <div className="tikit-info row g-3 align-items-center">
                                  <div className="col-sm">
                                    <ul className="d-flex list-unstyled align-items-center justify-content-between">
                                      <li className="me-2">
                                        <div className="d-flex gap-5">
                                          <div className="d-flex align-items-center fw-bold">
                                            Due Date:
                                            <span className="ms-1">
                                              {getFormattedDate(task.taskEndDate)}
                                            </span>
                                          </div>
                                          <button
                                            className="btn btn-outline-secondary btn-sm me-2 position-relative"
                                            data-bs-toggle="modal"
                                            data-bs-target="#taskMessages"
                                            onClick={() => handleOpenMessages(task)}
                                          >
                                            <i className="bi bi-chat-left-dots"></i>
                                            {notifications[task._id] > 0 && (
                                              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                                {notifications[task._id]}
                                              </span>
                                            )}
                                          </button>
                                        </div>
                                      </li>
                                    </ul>
                                    <div className="fw-bold">Task Given By - {task.assignedBy}</div>
                                  </div>

                                  <div className="d-flex justify-content-between align-items-center">

                                    <select
                                      className="form-select"
                                      aria-label="Default select Status"
                                      name="taskStatus"
                                      onChange={(e) => handleTaskUpdate(e, task._id)}
                                      value={taskStatuses[task._id]}
                                    >
                                      <option value="Not Started">Not Started</option>
                                      <option value="In Progress">In Progress</option>
                                      <option value="Completed">Completed</option>
                                    </select>

                                    <div className="btn-group" role="group" aria-label="Basic outlined example">
                                      <Link
                                        to="/images"
                                        className="btn btn-outline-secondary"
                                        state={{
                                          images: task.taskImages,
                                          projectName: task.projectName,
                                        }}
                                      >
                                        <i className="bi-paperclip fs-6" />
                                      </Link>
                                    </div>
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
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="taskMessagesLabel">Task Messages</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div ref={messageContainerRef} style={{ height: '300px', overflowY: 'auto' }}>
                {messages.map((message, index) => (
                  <div key={index} className="mb-2">
                    <strong>{message.senderId}: </strong>
                    {message.content}
                    <span className="px-3 text-muted">{new Date(message.createdAt).toLocaleString()}</span>
                    {message.fileUrls && message.fileUrls.map((fileUrl, fileIndex) => {
                      if (fileUrl) {
                        const cleanFileUrl = `${import.meta.env.VITE_BASE_URL}${fileUrl.replace('uploads/', '')}`;
                        const fileExtension = cleanFileUrl.split('.').pop().toLowerCase();

                        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
                          return (
                            <div key={fileIndex} className="px-3">
                              <a href={cleanFileUrl} target="_blank" rel="noopener noreferrer">
                                <img src={cleanFileUrl} alt={`Attachment ${fileIndex + 1}`} style={{ maxWidth: '5rem', cursor: 'pointer' }} />
                              </a>
                            </div>
                          );
                        } else if (fileExtension === 'pdf') {
                          return (
                            <div key={fileIndex} className="px-3">
                              <a href={cleanFileUrl} target="_blank" rel="noopener noreferrer" className="">PDF File</a>
                            </div>
                          );
                        } else {
                          return (
                            <div key={fileIndex} className="px-3">
                              <a href={cleanFileUrl} target="_blank" rel="noopener noreferrer" className="">Download File</a>
                            </div>
                          );
                        }
                      }
                      return null;
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <form onSubmit={handleSendMessage} className="w-100">
                <div className="mb-3">
                  <label htmlFor="currentMessage" className="form-label">Add Message</label>
                  <textarea
                    className="form-control"
                    id="currentMessage"
                    name="message"
                    rows="3"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    ref={messageInputRef}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="fileUpload" className="form-label">Upload Files</label>
                  <input
                    type="file"
                    className="form-control"
                    id="fileUpload"
                    onChange={handleFileChange}
                    multiple
                  />
                </div>
                <button type="submit" className="btn btn-primary">Send</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tasks;
