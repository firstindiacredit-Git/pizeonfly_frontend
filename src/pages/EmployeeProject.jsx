import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../employeeCompt/EmployeeSidebar";
import Header from "../employeeCompt/EmployeeHeader";
import { Link } from "react-router-dom";
import axios from "axios";
import io from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./Loading.css";
import FloatingMenu from '../Chats/FloatingMenu'

const Project = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [viewMode, setViewMode] = useState("list");

  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/employees`);
        setEmployees(response.data);
        // console.log(response.data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []);

  // GET A PROJECT BY TOKEN
  const [selectProject, setSelectProject] = useState({});
  const [projects, setProjects] = useState([]);
  const [loginUserId, setLoginUserId] = useState([]);
  // console.log(selectProject);
  useEffect(() => {
    const Token = localStorage.getItem('emp_user_id') ? localStorage.getItem('emp_user_id') : navigate.state.employeeId
    const UserDetails = JSON.parse(localStorage.getItem("emp_user"));
    setLoginUserId(UserDetails._id);
    // console.log(UserDetails);

    async function fetchData() {
      try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}api/employee-projects`, {
          _id: Token,
        });
        console.log(response.data);
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    }

    fetchData();
  }, []);



  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState(() => {
    const savedNotifications = localStorage.getItem('employeeProjectNotifications');
    return savedNotifications ? JSON.parse(savedNotifications) : {};
  });
  const messageInputRef = useRef(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  useEffect(() => {
    const newSocket = io(`${import.meta.env.VITE_BASE_URL}`);
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket == null) return;

    socket.on('new message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      
      if (!isChatModalOpen || selectProject._id !== message.projectId) {
        setNotifications(prev => {
          const newNotifications = {
            ...prev,
            [message.projectId]: (prev[message.projectId] || 0) + 1
          };
          localStorage.setItem('employeeProjectNotifications', JSON.stringify(newNotifications));
          return newNotifications;
        });
      }
    });

    return () => {
      socket.off('new message');
    };
  }, [socket, selectProject._id, isChatModalOpen]);

  useEffect(() => {
    if (socket == null) return;

    projects.forEach(project => {
      socket.emit('join project', project._id);
    });

    return () => {
      projects.forEach(project => {
        socket.emit('leave project', project._id);
      });
    };
  }, [socket, projects]);

  const fetchProjectMessages = async (projectId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/messages/${projectId}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const messageSubmit = async (e) => {
    e.preventDefault();
    const userDetails = JSON.parse(localStorage.getItem('emp_user'));
    const senderId = userDetails.employeeName;

    const formData = new FormData();
    formData.append('content', content);
    formData.append('senderId', senderId);
    formData.append('projectId', selectProject._id);

    for (let file of files) {
      formData.append('files', file);
    }

    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}api/projectMessage`, formData, {
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

  const messageFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleOpenMessages = (project) => {
    setSelectProject(project);
    fetchProjectMessages(project._id);
    
    // Clear notifications for this specific project only
    setNotifications(prev => {
      const newNotifications = { ...prev, [project._id]: 0 };
      localStorage.setItem('employeeProjectNotifications', JSON.stringify(newNotifications));
      return newNotifications;
    });
    
    setIsChatModalOpen(true);

    setTimeout(() => {
      if (messageInputRef.current) {
        messageInputRef.current.focus();
        messageInputRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  };

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
                    <div className="card-header py-3 px-0 d-sm-flex align-items-center  justify-content-between border-bottom">
                      <h3 className="fw-bold py-3 mb-0">Projects</h3>
                      <div className="d-flex me-2">
                        <div>
                          <div className="d-flex">
                            {viewMode === 'grid' ? (
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
                                onClick={() => setViewMode('grid')}
                                title="Switch to Grid View"
                              >
                                <i className="bi bi-grid-3x3-gap-fill"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>{" "}
                {/* Row end  */}
                {viewMode === "list" && (
                  <div className="row g-3 mb-3 row-deck table-responsive">
                    <div className="col-md-12">
                      <div className="card mb-3">
                        <div className="card-body">
                          <table
                            className="table table-hover align-middle mb-0"
                            style={{ width: "100%" }}
                          >
                            <thead>
                              <tr>
                                <th>Project Name</th>
                                <th>Client Name</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Members</th>
                                <th>Progress</th>
                                <th>Add Message</th>
                              </tr>
                            </thead>
                            <tbody>
                              {projects.map((project) => {
                                const getFormattedDate = (date) => {
                                  const newDate = new Date(date);
                                  const day = newDate.getDate();
                                  const month = newDate.getMonth() + 1;
                                  const year = newDate.getFullYear();
                                  return `${day}/${month}/${year}`;
                                };

                                return (
                                  <tr key={project.id}>
                                    <td>
                                      <Link to="/employee-tasks">{project.projectName}</Link>
                                      <Link
                                        to="/images"
                                        className="btn btn-outline-secondary"
                                        state={{
                                          images: project.projectImage,
                                          projectName: project.projectName,
                                        }}
                                      >
                                        <i className="bi-paperclip fs-6" />
                                      </Link>
                                      <p />
                                      <figcaption className="blockquote-footer">
                                        {project.projectCategory}
                                      </figcaption>
                                      <p>{getFormattedDate(project.projectDate)}</p>
                                    </td>
                                    <td>
                                      {project.clientAssignPerson.map(
                                        (name) => name.clientName + ", "
                                      )}
                                    </td>
                                    <td>{getFormattedDate(project.projectStartDate)}</td>
                                    <td>{getFormattedDate(project.projectEndDate)} </td>
                                    <td>
                                      {project.taskAssignPerson.map(
                                        (name) => name.employeeName + ", "
                                      )}
                                    </td>

                                    <td>
                                      <div className="d-flex justify-content-center">{project.progress}%</div>
                                    </td>
                                    <td>
                                      <button
                                        className="d-flex justify-content-center bi bi-chat-left-dots btn outline-secondary text-primary position-relative"
                                        data-bs-toggle="modal"
                                        data-bs-target="#addUser"
                                        type="button"
                                        onClick={() => handleOpenMessages(project)}
                                      >
                                        {notifications[project._id] > 0 && (
                                          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                            {notifications[project._id]}
                                          </span>
                                        )}
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {viewMode === "grid" && (
                  <div className="row g-3 mb-3 row-deck">
                    {projects.map((project) => {
                      const getFormattedDate = (date) => {
                        const newDate = new Date(date);
                        const day = newDate.getDate();
                        const month = newDate.getMonth() + 1;
                        const year = newDate.getFullYear();
                        return `${day}/${month}/${year}`;
                      };

                      return (
                        <div className="col-md-4" key={project.id}>
                          <div className="card task-card">
                            <div className="card-body">
                              <h5 className="card-title">{project.projectName}</h5>
                              <figcaption className="blockquote-footer mt-2">
                                {project.projectCategory}
                              </figcaption>
                              <p>Start Date: {getFormattedDate(project.projectStartDate)}</p>
                              <p>End Date: {getFormattedDate(project.projectEndDate)}</p>
                              <p>Members: {project.taskAssignPerson.map((name) => name.employeeName + ", ")}</p>
                              <button
                                className="bi bi-chat-left-dots btn outline-secondary text-primary position-relative"
                                data-bs-toggle="modal"
                                data-bs-target="#addUser"
                                onClick={() => handleOpenMessages(project)}
                              >
                                Add Message
                                {notifications[project._id] > 0 && (
                                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                    {notifications[project._id]}
                                  </span>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}


              </div>
            </div>

            {/* Message Modal */}
            <div 
              className="modal fade" 
              id="addUser" 
              tabIndex={-1} 
              aria-labelledby="addUserLabel" 
              aria-hidden="true"
              onHide={() => setIsChatModalOpen(false)}
            >
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="addUserLabel">
                      {selectProject.projectName}
                    </h5>
                    <button 
                      type="button" 
                      className="btn-close" 
                      data-bs-dismiss="modal" 
                      aria-label="Close"
                      onClick={() => setIsChatModalOpen(false)}
                    ></button>
                  </div>
                  <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {/* Message List */}
                    <ul className="list-group mb-3">
                      {messages.map((message) => (
                        <li key={message._id}>
                          <div className="border-bottom">
                            <div className="d-flex py-1">
                              <h6 className="fw-bold px-3">{message.senderId}</h6> -
                              <span className="px-3 text-break">{message.content}</span>
                              {message.fileUrls && message.fileUrls.map((fileUrl, index) => {
                                if (fileUrl) {
                                  const cleanFileUrl = `${import.meta.env.VITE_BASE_URL}${fileUrl.replace('uploads/', '')}`;
                                  const fileExtension = cleanFileUrl.split('.').pop().toLowerCase();

                                  if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
                                    return (
                                      <div key={index} className="px-3">
                                        <a href={cleanFileUrl} target="_blank" rel="noopener noreferrer">
                                          <img src={cleanFileUrl} alt={`Attachment ${index + 1}`} style={{ maxWidth: '5rem', cursor: 'pointer' }} />
                                        </a>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <div key={index} className="px-3">
                                        <a href={cleanFileUrl} target="_blank" rel="noopener noreferrer" className="">Download File</a>
                                      </div>
                                    );
                                  }
                                }
                                return null;
                              })}
                            </div>
                            <p className="text-muted" style={{ marginTop: "-0.5rem", marginLeft: "1rem" }}>
                              {new Date(message.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* Message Form */}
                    <form onSubmit={messageSubmit}>
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
                          onChange={messageFileChange}
                          multiple
                        />
                      </div>
                      <button type="submit" className="btn btn-dark">Submit</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>

          </>

        </div>
        <ToastContainer />
        <FloatingMenu userType="employee" isMobile={isMobile} />
      </div>
    </>
  );
};

export default Project;
