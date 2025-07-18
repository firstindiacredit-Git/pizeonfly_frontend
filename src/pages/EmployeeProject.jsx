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
    const savedNotifications = localStorage.getItem('projectNotifications');
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

    const handleNewMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      if (!isChatModalOpen || selectProject._id !== message.projectId) {
        setNotifications(prev => {
          const newNotifications = {
            ...prev,
            [message.projectId]: (prev[message.projectId] || 0) + 1
          };
          localStorage.setItem('projectNotifications', JSON.stringify(newNotifications));
          return newNotifications;
        });
      }
    };

    const handleNewNotification = (notification) => {
      if (!isChatModalOpen || selectProject._id !== notification.projectId) {
        setNotifications(prev => {
          const newNotifications = {
            ...prev,
            [notification.projectId]: (prev[notification.projectId] || 0) + 1
          };
          localStorage.setItem('projectNotifications', JSON.stringify(newNotifications));
          return newNotifications;
        });
      }
    };

    socket.on('new message', handleNewMessage);
    socket.on('new notification', handleNewNotification);

    return () => {
      socket.off('new message', handleNewMessage);
      socket.off('new notification', handleNewNotification);
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
      localStorage.setItem('projectNotifications', JSON.stringify(newNotifications));
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

  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImageTitle, setSelectedImageTitle] = useState('');
  const [selectedProjectImages, setSelectedProjectImages] = useState([]);
  const [selectedProjectName, setSelectedProjectName] = useState('');

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
                      <div className="card mb-3" style={{
                        borderRadius: '12px',
                        boxShadow: '0 6px 15px rgba(0,0,0,0.05)',
                        border: 'none',
                        overflow: 'hidden'
                      }}>
                        <div className="card-body" style={{ padding: '0' }}>
                          <table className="table align-middle mb-0" style={{
                            width: "100%",
                            borderCollapse: 'separate',
                            borderSpacing: '0'
                          }}>
                            <thead>
                              <tr style={{ background: '#f8f9fa' }}>
                                <th style={{ padding: '16px 15px', fontWeight: '600', color: '#444', borderBottom: '2px solid rgba(65, 105, 225, 0.2)', textAlign: 'center', fontSize: '14px' }}>Sr.No.</th>
                                <th style={{ padding: '16px 15px', fontWeight: '600', color: '#444', borderBottom: '2px solid rgba(65, 105, 225, 0.2)', fontSize: '14px' }}>Project Name</th>
                                <th style={{ padding: '16px 15px', fontWeight: '600', color: '#444', borderBottom: '2px solid rgba(65, 105, 225, 0.2)', fontSize: '14px' }}>Client Name</th>
                                <th style={{ padding: '16px 15px', fontWeight: '600', color: '#444', borderBottom: '2px solid rgba(65, 105, 225, 0.2)', fontSize: '14px' }}>Start Date</th>
                                <th style={{ padding: '16px 15px', fontWeight: '600', color: '#444', borderBottom: '2px solid rgba(65, 105, 225, 0.2)', fontSize: '14px' }}>End Date</th>
                                <th style={{ padding: '16px 15px', fontWeight: '600', color: '#444', borderBottom: '2px solid rgba(65, 105, 225, 0.2)', fontSize: '14px' }}>Members</th>
                                <th style={{ padding: '16px 15px', fontWeight: '600', color: '#444', borderBottom: '2px solid rgba(65, 105, 225, 0.2)', fontSize: '14px' }}>Progress</th>
                                <th style={{ padding: '16px 15px', fontWeight: '600', color: '#444', borderBottom: '2px solid rgba(65, 105, 225, 0.2)', textAlign: 'center', fontSize: '14px' }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {projects.map((project, index) => {
                                const getFormattedDate = (date) => {
                                  const newDate = new Date(date);
                                  let day = newDate.getDate();
                                  let month = newDate.getMonth() + 1;
                                  const year = newDate.getFullYear();
                                  if (day < 10) day = "0" + day;
                                  if (month < 10) month = "0" + month;
                                  return `${day}/${month}/${year}`;
                                };
                                return (
                                  <tr key={project._id}
                                    style={{ transition: 'background 0.2s ease' }}
                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(65, 105, 225, 0.04)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <td style={{ padding: '16px 15px', borderBottom: '1px solid rgba(0,0,0,0.05)', textAlign: 'center' }}>
                                      <span style={{ background: 'linear-gradient(135deg, #4169e1, #1e40af)', color: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px', boxShadow: '0 2px 5px rgba(65, 105, 225, 0.3)' }}>{index + 1}</span>
                                    </td>
                                    <td style={{ padding: '16px 15px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                      <div className="d-flex gap-2 align-items-center">
                                        <div>
                                          <Link to="/employee-tasks" className="text-capitalize" style={{ fontWeight: '700', color: '#333', textDecoration: 'none', transition: 'color 0.2s ease', fontSize: '15px' }} onMouseOver={e => e.currentTarget.style.color = '#4169e1'} onMouseOut={e => e.currentTarget.style.color = '#333'}>{project.projectName}</Link>
                                          <div className="mt-1" style={{ fontSize: '12px', color: '#777' }}>{project.projectCategory}</div>
                                          <div className="mt-1" style={{ fontSize: '12px', color: '#777' }}>{getFormattedDate(project.projectDate)}</div>
                                        </div>
                                        {project.projectImage && (
                                          <div className="btn" state={{ images: project.projectImage, projectName: project.projectName }} style={{ color: '#4169e1', padding: '5px', borderRadius: '50%', transition: 'all 0.2s', border: 'none', backgroundColor: 'rgba(65, 105, 225, 0.1)', width: '30px', height: '30px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.2)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.1)'}>
                                            <i className="icofont-attachment" style={{ fontSize: '14px' }} />
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    <td style={{ padding: '16px 15px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                      {project.clientAssignPerson?.map((name, idx) => <span key={idx}>{name.clientName}{idx < project.clientAssignPerson.length - 1 ? ', ' : ''}</span>)}
                                    </td>
                                    <td style={{ padding: '16px 15px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                      <div style={{ backgroundColor: 'rgba(65, 105, 225, 0.1)', padding: '6px 10px', borderRadius: '6px', color: '#4169e1', fontSize: '13px', fontWeight: '600', display: 'inline-block' }}><i className="icofont-calendar me-1"></i>{getFormattedDate(project.projectStartDate)}</div>
                                    </td>
                                    <td style={{ padding: '16px 15px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                      <div style={{ backgroundColor: 'rgba(255, 105, 180, 0.1)', padding: '6px 10px', borderRadius: '6px', color: '#ff69b4', fontSize: '13px', fontWeight: '600', display: 'inline-block' }}><i className="icofont-calendar me-1"></i>{getFormattedDate(project.projectEndDate)}</div>
                                    </td>
                                    <td style={{ padding: '16px 15px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                      {project.taskAssignPerson?.map((name, idx) => <span key={idx}>{name.employeeName}{idx < project.taskAssignPerson.length - 1 ? ', ' : ''}</span>)}
                                    </td>
                                    <td style={{ padding: '16px 15px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                      <div className="d-flex justify-content-center" style={{ fontWeight: '600', color: project.progress > 75 ? '#1e40af' : project.progress > 50 ? '#4169e1' : project.progress > 25 ? '#ff69b4' : '#dc3545', marginBottom: '5px', fontSize: '14px' }}>{project.progress}%</div>
                                      <div className="progress" style={{ height: "8px", backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
                                        <div className="progress-bar" role="progressbar" style={{ width: `${project.progress}%`, background: `linear-gradient(to right, ${project.progress > 75 ? '#1e40af' : '#4169e1'}, ${project.progress > 50 ? '#1e40af' : '#ff69b4'}`, borderRadius: '4px', transition: 'width 0.5s ease' }} aria-valuenow={project.progress} aria-valuemin="0" aria-valuemax="100"></div>
                                      </div>
                                    </td>
                                    <td style={{ padding: '16px 15px', borderBottom: '1px solid rgba(0,0,0,0.05)', textAlign: 'center' }}>
                                      <div className="d-flex gap-2 justify-content-center">
                                        <button className="btn position-relative" data-bs-toggle="modal" data-bs-target="#addUser" type="button" title="Messages" style={{ backgroundColor: 'rgba(65, 105, 225, 0.1)', color: '#4169e1', width: '32px', height: '32px', borderRadius: '50%', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', transition: 'all 0.2s ease' }} onClick={() => handleOpenMessages(project)} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.2)'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.1)'; }}>
                                          <i className="icofont-ui-message"></i>
                                          {notifications[project._id] > 0 && (
                                            <span style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#ff69b4', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(255, 105, 180, 0.3)' }}>{notifications[project._id]}</span>
                                          )}
                                        </button>
                                      </div>
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
                    {projects.map((project, index) => {
                      const getFormattedDate = (date) => {
                        const newDate = new Date(date);
                        let day = newDate.getDate();
                        let month = newDate.getMonth() + 1;
                        const year = newDate.getFullYear();
                        if (day < 10) day = "0" + day;
                        if (month < 10) month = "0" + month;
                        return `${day}/${month}/${year}`;
                      };
                      return (
                        <div className="col-md-4" key={project._id} style={{ padding: '12px' }}>
                          <div
                            className="card task-card"
                            style={{
                              backgroundColor: '#ffffff',
                              color: 'inherit',
                              height: '340px',
                              display: 'flex',
                              flexDirection: 'column',
                              borderRadius: '20px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                              border: 'none',
                              overflow: 'hidden',
                              position: 'relative',
                              transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
                            }}
                            onMouseOver={e => {
                              e.currentTarget.style.transform = 'translateY(-10px)';
                              e.currentTarget.style.boxShadow = '0 20px 35px rgba(0,0,0,0.1)';
                            }}
                            onMouseOut={e => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)';
                            }}
                          >
                            {/* Gradient Border Effect */}
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '6px',
                              background: 'linear-gradient(90deg, #4169e1, #1e40af, #ff69b4)',
                              opacity: 0.9
                            }}></div>
                            <div className="card-body d-flex flex-column" style={{ padding: '28px' }}>
                              <div className="d-flex justify-content-between align-items-center">
                                <span style={{
                                  background: 'linear-gradient(135deg, #4169e1, #1e40af)',
                                  color: 'white',
                                  borderRadius: '12px',
                                  width: '40px',
                                  height: '40px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: '600',
                                  fontSize: '16px',
                                  boxShadow: '0 4px 15px rgba(65, 105, 225, 0.3)',
                                  border: '2px solid rgba(255, 255, 255, 0.8)'
                                }}>{index + 1}</span>
                                <div className="d-flex flex-grow-1 flex-column align-items-center justify-content-center" style={{ minWidth: 0 }}>
                                  <h6 className="card-title text-capitalize text-center mb-0 text-truncate"
                                    style={{
                                      maxWidth: '120px',
                                      color: '#1a1a1a',
                                      fontWeight: '700',
                                      letterSpacing: '-0.3px',
                                      marginLeft: 0
                                    }}
                                    title={project.projectName}>
                                    {project.projectName}
                                  </h6>
                                </div>
                                {project.projectImage && (
                                  <div className="btn" state={{ images: project.projectImage, projectName: project.projectName }} style={{ color: '#4169e1', padding: '5px', borderRadius: '50%', transition: 'all 0.2s', border: 'none', backgroundColor: 'rgba(65, 105, 225, 0.1)', width: '30px', height: '30px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.2)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.1)'}>
                                    <i className="icofont-attachment" style={{ fontSize: '14px' }} />
                                  </div>
                                )}
                              </div>
                              <div className="mt-3" style={{ borderTop: '1px solid rgba(65, 105, 225, 0.1)', paddingTop: '12px' }}>
                                <div className="d-flex justify-content-between">
                                  <div style={{
                                    backgroundColor: 'rgba(65, 105, 225, 0.04)',
                                    padding: '8px 12px',
                                    borderRadius: '12px',
                                    color: '#4169e1',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    border: '1px solid rgba(65, 105, 225, 0.15)',
                                    transition: 'all 0.3s ease'
                                  }}>
                                    <div className="d-flex align-items-center">
                                      <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '6px',
                                        backgroundColor: 'rgba(65, 105, 225, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '8px'
                                      }}>
                                        <i className="icofont-calendar" style={{ color: '#4169e1', fontSize: '12px' }}></i>
                                      </div>
                                      <div>
                                        <div style={{ fontSize: '10px', color: '#666', marginBottom: '1px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Start</div>
                                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#1a1a1a' }}>{getFormattedDate(project.projectStartDate)}</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div style={{
                                    backgroundColor: 'rgba(255, 105, 180, 0.04)',
                                    padding: '8px 12px',
                                    borderRadius: '12px',
                                    color: '#ff69b4',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    border: '1px solid rgba(255, 105, 180, 0.15)',
                                    transition: 'all 0.3s ease'
                                  }}>
                                    <div className="d-flex align-items-center">
                                      <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '6px',
                                        backgroundColor: 'rgba(255, 105, 180, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '8px'
                                      }}>
                                        <i className="icofont-calendar" style={{ color: '#ff69b4', fontSize: '12px' }}></i>
                                      </div>
                                      <div>
                                        <div style={{ fontSize: '10px', color: '#666', marginBottom: '1px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>End</div>
                                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#1a1a1a' }}>{getFormattedDate(project.projectEndDate)}</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {/* Employees and Client row - placed side by side */}
                                <div className="d-flex mt-3 gap-2">
                                  {/* Employees column */}
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                      <span style={{ backgroundColor: 'rgba(65, 105, 225, 0.04)', color: '#4169e1', padding: '3px 10px', borderRadius: '4px', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', border: '1px solid rgba(65, 105, 225, 0.15)' }}>
                                        <i className="icofont-users-alt-2 me-1"></i>
                                        Employees
                                      </span>
                                    </div>
                                    <div className="members-list" style={{ height: '60px', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#4169e1 #f0f0f0', padding: '2px 8px' }}>
                                      {project.taskAssignPerson?.map((member, idx) => (
                                        <div key={idx} className="mb-1" style={{ color: '#444' }}>
                                          <div className="d-flex gap-2 align-items-center">
                                            <i className="icofont-user-alt-5" style={{ color: '#4169e1', fontSize: '12px' }}></i>
                                            <span className="text-truncate" style={{ maxWidth: '120px', fontSize: '11px' }} title={member.employeeName}>{member.employeeName}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  {/* Client column */}
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                      <span style={{ backgroundColor: 'rgba(255, 105, 180, 0.04)', color: '#ff69b4', padding: '3px 10px', borderRadius: '4px', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', border: '1px solid rgba(255, 105, 180, 0.15)' }}>
                                        <i className="icofont-people me-1"></i>
                                        Client
                                      </span>
                                    </div>
                                    <div className="clients-list" style={{ height: '60px', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#ff69b4 #f0f0f0', padding: '2px 8px' }}>
                                      {project.clientAssignPerson?.map((client, idx) => (
                                        <div key={idx} className="d-flex gap-2 align-items-center" title={client.clientName}>
                                          <i className="icofont-business-man" style={{ color: '#ff69b4', fontSize: '12px' }}></i>
                                          <span style={{ maxWidth: '120px', color: '#444', fontSize: '11px' }} className="text-truncate">{client.clientName}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mt-auto pt-2" style={{ borderTop: '1px solid rgba(65, 105, 225, 0.1)', marginTop: '12px' }}>
                                <span className="d-flex justify-content-start text-muted small" style={{ fontSize: '11px' }}>
                                  <i className="icofont-clock-time me-1" style={{ color: '#4169e1' }}></i>
                                  {getFormattedDate(project.projectDate)}
                                </span>
                                <div className="d-flex justify-content-between" style={{ gap: '5px' }}>
                                  <button
                                    className="btn position-relative"
                                    data-bs-toggle="modal"
                                    data-bs-target="#addUser"
                                    onClick={() => handleOpenMessages(project)}
                                    title="Message"
                                    style={{
                                      backgroundColor: 'rgba(65, 105, 225, 0.08)',
                                      color: '#4169e1',
                                      width: '38px',
                                      height: '38px',
                                      borderRadius: '12px',
                                      padding: '0',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      border: 'none',
                                      transition: 'all 0.3s ease'
                                    }}
                                    onMouseOver={e => {
                                      e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.15)';
                                      e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseOut={e => {
                                      e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.08)';
                                      e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                  >
                                    <i className="icofont-ui-message" style={{ fontSize: '16px' }}></i>
                                    {notifications[project._id] > 0 && (
                                      <span style={{
                                        position: 'absolute',
                                        top: '-5px',
                                        right: '-5px',
                                        backgroundColor: '#ff69b4',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: '18px',
                                        height: '18px',
                                        fontSize: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        boxShadow: '0 2px 5px rgba(255, 105, 180, 0.3)'
                                      }}>{notifications[project._id]}</span>
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
            </div>

            {/* Message Modal */}
            <div className="modal fade" id="addUser" tabIndex={-1} aria-labelledby="addUserLabel" aria-hidden="true" onHide={() => setIsChatModalOpen(false)}>
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
                    background: 'linear-gradient(135deg, #1e40af, #1e40af)',
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
                        <i className="icofont-ui-message" style={{ fontSize: '20px', color: 'white' }}></i>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h5 className="modal-title" id="addUserLabel" style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: 0 }}>{selectProject.projectName}</h5>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}><i className="icofont-ui-user me-1"></i> Project Chat</span>
                      </div>
                      <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setIsChatModalOpen(false)} style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '50%', padding: '8px', opacity: '1', transition: 'all 0.2s ease' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)'; e.currentTarget.style.transform = 'rotate(90deg)'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'; e.currentTarget.style.transform = 'rotate(0deg)'; }}></button>
                    </div>
                  </div>
                  {/* Chat Body */}
                  <div className="modal-body p-0" style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f5f5f5', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23000000\" fill-opacity=\"0.03\" fill-rule=\"evenodd\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"3\"/%3E%3Ccircle cx=\"13\" cy=\"13\" r=\"3\"/%3E%3C/g%3E%3C/svg%3E")', padding: '20px' }}>
                    {messages.length === 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888', padding: '30px' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(82, 180, 71, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                          <i className="icofont-ui-messaging" style={{ fontSize: '40px', color: '#1e40af' }}></i>
                        </div>
                        <h6 style={{ color: '#666', marginBottom: '10px' }}>No messages yet</h6>
                        <p style={{ textAlign: 'center', fontSize: '14px' }}>Start the conversation by sending your first message below.</p>
                      </div>
                    ) : (
                      <div className="chat-messages">
                        {messages.map((message, index) => {
                          const userDetails = JSON.parse(localStorage.getItem('emp_user'));
                          const isCurrentUser = message.senderId === userDetails.employeeName;
                          const prevSender = index > 0 ? messages[index - 1].senderId : null;
                          const showSender = prevSender !== message.senderId;
                          return (
                            <div key={message._id} className={`message-group ${isCurrentUser ? 'own-messages' : ''}`} style={{ marginBottom: showSender ? '20px' : '2px', marginTop: showSender ? '20px' : '2px' }}>
                              {/* Message Serial Number */}
                              {/* <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: 'bold', marginBottom: '2px', marginLeft: isCurrentUser ? 'auto' : '48px', textAlign: isCurrentUser ? 'right' : 'left' }}>
                                #{index + 1}
                              </div> */}
                              {showSender && !isCurrentUser && (
                                <div style={{ fontSize: '13px', color: '#666', marginLeft: '48px', marginBottom: '5px' }}>{message.senderId}</div>
                              )}
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: isCurrentUser ? 'flex-end' : 'flex-start', marginBottom: '1px' }}>
                                {!isCurrentUser && showSender && (
                                  <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: 'rgba(255, 138, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px', flexShrink: 0 }}>
                                    <i className="icofont-user-alt-7" style={{ color: '#ff8a00', fontSize: '18px' }}></i>
                                  </div>
                                )}
                                {!isCurrentUser && !showSender && (<div style={{ width: '45px', flexShrink: 0 }}></div>)}
                                <div style={{ maxWidth: '75%', wordBreak: 'break-word', backgroundColor: isCurrentUser ? 'rgba(82, 180, 71, 0.2)' : 'white', color: '#333', padding: '10px 14px', borderRadius: isCurrentUser ? '15px 15px 2px 15px' : '15px 15px 15px 2px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', position: 'relative' }}>
                                  <div style={{ fontSize: '14px' }}>{message.content}</div>
                                  <div style={{ fontSize: '11px', color: '#999', textAlign: 'right', marginTop: '4px' }}>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{isCurrentUser && (<i className="icofont-check-circled ms-1" style={{ color: '#1e40af' }}></i>)}</div>
                                </div>
                                {isCurrentUser && showSender && (
                                  <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: 'rgba(82, 180, 71, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '10px', flexShrink: 0 }}>
                                    <i className="icofont-user-alt-7" style={{ color: '#1e40af', fontSize: '18px' }}></i>
                                  </div>
                                )}
                                {isCurrentUser && !showSender && (<div style={{ width: '45px', flexShrink: 0 }}></div>)}
                              </div>
                              {/* Attachments */}
                              {message.fileUrls && message.fileUrls.length > 0 && message.fileUrls.some(url => url) && (
                                <div style={{ display: 'flex', justifyContent: isCurrentUser ? 'flex-end' : 'flex-start', marginTop: '5px' }}>
                                  {!isCurrentUser && (<div style={{ width: '45px', flexShrink: 0 }}></div>)}
                                  <div style={{ maxWidth: '75%', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: isCurrentUser ? 'flex-end' : 'flex-start' }}>
                                    {message.fileUrls.map((fileUrl, index) => {
                                      if (fileUrl) {
                                        const cleanFileUrl = `${import.meta.env.VITE_BASE_URL}${fileUrl.replace('uploads/', '')}`;
                                        const fileExtension = cleanFileUrl.split('.').pop().toLowerCase();
                                        const fileName = cleanFileUrl.split('/').pop();
                                        if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
                                          return (
                                            <div key={index} style={{ borderRadius: '10px', overflow: 'hidden', border: `2px solid ${isCurrentUser ? 'rgba(82, 180, 71, 0.3)' : 'rgba(255, 138, 0, 0.3)'}`, width: '120px', height: '120px', position: 'relative' }}>
                                              <a href={cleanFileUrl} target="_blank" rel="noopener noreferrer">
                                                <img src={cleanFileUrl} alt={`Attachment ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
                                              </a>
                                            </div>
                                          );
                                        } else {
                                          const isDoc = fileExtension === 'pdf' || fileExtension === 'doc' || fileExtension === 'docx';
                                          return (
                                            <a key={index} href={cleanFileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: isCurrentUser ? 'rgba(82, 180, 71, 0.1)' : 'rgba(255, 138, 0, 0.1)', borderRadius: '10px', color: isCurrentUser ? '#1e40af' : '#ff8a00', textDecoration: 'none', maxWidth: '250px' }}>
                                              <i className={`icofont-file-${isDoc ? 'pdf' : 'text'}`} style={{ fontSize: '20px' }}></i>
                                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '13px' }}>{fileName}</span>
                                            </a>
                                          );
                                        }
                                      }
                                      return null;
                                    })}
                                  </div>
                                  {isCurrentUser && (<div style={{ width: '45px', flexShrink: 0 }}></div>)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {/* Message Input Area */}
                  <div className="chat-input-area" style={{ padding: '15px', backgroundColor: 'white', borderTop: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 -2px 10px rgba(0,0,0,0.03)', zIndex: 1 }}>
                    <form onSubmit={messageSubmit} className="d-flex flex-column">
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <textarea className="form-control" id="currentMessage" name="message" rows="1" value={content} onChange={e => { setContent(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(120, e.target.scrollHeight) + 'px'; }} required ref={messageInputRef} style={{ borderRadius: '20px', border: '1px solid rgba(0,0,0,0.1)', padding: '12px 50px 12px 15px', color: '#333', boxShadow: 'none', resize: 'none', fontSize: '14px', lineHeight: '1.4', overflowY: 'auto', maxHeight: '120px' }} placeholder="Type a message here..." />
                          <label htmlFor="fileUpload" style={{ position: 'absolute', right: '15px', bottom: '10px', margin: 0, cursor: 'pointer', color: '#ff8a00' }}>
                            <i className="icofont-attachment" style={{ fontSize: '20px' }}></i>
                          </label>
                          <input type="file" className="form-control d-none" id="fileUpload" onChange={messageFileChange} multiple />
                        </div>
                        <button type="submit" style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#1e40af', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(82,180,71,0.3)', transition: 'all 0.2s ease' }} onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.backgroundColor = '#1e40af'; }} onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.backgroundColor = '#1e40af'; }}>
                          <i className="icofont-paper-plane" style={{ fontSize: '18px' }}></i>
                        </button>
                      </div>
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
