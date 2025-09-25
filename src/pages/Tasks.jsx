import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Loading.css";
import Select from 'react-select';
import io from 'socket.io-client';
import FloatingMenu from '../Chats/FloatingMenu'

const Tasks = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();
  const navigate = useNavigate();
  const [filteredProjectName, setFilteredProjectName] = useState(null);
  const [filteredEmployeeName, setFilteredEmployeeName] = useState(null);

  const [viewMode, setViewMode] = useState('grid'); // Default is list view

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');


  //CREATE TASK

  const User = JSON.parse(localStorage.getItem('user'));

  const [formData, setFormData] = useState({
    assignedBy: User.username || "",
    projectName: "",
    taskTitle: "",
    taskEndDate: "",
    taskAssignPerson: "",
    taskPriority: "",
    taskImages: null,
    description: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: files ? files : value,
    }));
  };

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [assignType, setAssignType] = useState('employee'); // 'employee' or 'client'

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();

      if (formData.taskImages) {
        for (let i = 0; i < formData.taskImages.length; i++) {
          formDataToSend.append("taskImages", formData.taskImages[i]);
        }
      }

      for (let key in formData) {
        if (key !== "taskImages") {
          formDataToSend.append(key, formData[key]);
        }
      }

      if (assignType === 'employee') {
        // Append multiple employee assignees if selected
        selectedEmployees.forEach((employee) => {
          formDataToSend.append("taskAssignPerson", employee.value);
        });
      } else {
        // Append client assignee
        if (selectedClient) {
          formDataToSend.append("clientAssignPerson", selectedClient.value);
        }
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/tasks`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newTask = response.data;
      setTasks((prevTasks) => [newTask, ...prevTasks]);

      // Clear the form data after successful submission
      setFormData({
        assignedBy: User.username || "",
        projectName: "",
        taskTitle: "",
        taskEndDate: "",
        taskAssignPerson: "",
        taskPriority: "",
        taskImages: null,
        description: "",
      });

      setSelectedEmployees([]);
      setSelectedClient(null);

      // Close the modal programmatically
      const modalElement = document.getElementById("createtask");
      const modal = new bootstrap.Modal(modalElement);
      modal.hide();

      toast.success("Task Created Successfully!", {
        style: {
          backgroundColor: "#0d6efd",
          color: "white",
        },
      });

      // Reload the page after 5 seconds
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  //Fetch Task
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [taskFormData, setTaskFormData] = useState({
    projectName: "",
    taskTitle: "",
    taskEndDate: "",
    taskAssignPerson: "",
    taskPriority: "",
    description: "",
  });

  const formatDate = (dateString, includeTime = false) => {
    const date = new Date(dateString);
    if (includeTime) {
      return date.toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
    return date.toISOString().split('T')[0]; // Formats date to 'YYYY-MM-DD'
  };

  const [taskStatuses, setTaskStatuses] = useState({});
  const [activeTab, setActiveTab] = useState('All'); // State for active tab filter
  const [filterDate, setFilterDate] = useState(''); // Date for date filter
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const [tasksPerPage, setTasksPerPage] = useState(10); // Default to 10 tasks per page
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  // const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksResponse, projectsResponse, employeesResponse, clientsResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}api/tasks`),
        axios.get(`${import.meta.env.VITE_BASE_URL}api/projects`),
        axios.get(`${import.meta.env.VITE_BASE_URL}api/employees`),
        axios.get(`${import.meta.env.VITE_BASE_URL}api/clients`)
      ]);

      const formattedTasks = tasksResponse.data.map(task => ({
        ...task,
        taskEndDate: formatDate(task.taskEndDate),
        taskDate: formatDate(task.taskDate, true),
      }));

      formattedTasks.sort((a, b) => new Date(b.taskDate) - new Date(a.taskDate));

      // Filter tasks if there's a filtered project name or employee name
      let filteredTasks = formattedTasks;
      if (filteredProjectName) {
        filteredTasks = filteredTasks.filter(task => task.projectName === filteredProjectName);
      }
      if (filteredEmployeeName) {
        filteredTasks = filteredTasks.filter(task =>
          task.taskAssignPerson?.employeeName === filteredEmployeeName
        );
      }

      setTasks(filteredTasks);
      setProjects(projectsResponse.data);
      setEmployees(employeesResponse.data);
      setClients(clientsResponse.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const projectNameFromState = location.state?.projectName;
    const projectNameFromStorage = localStorage.getItem('filteredProjectName');
    const employeeNameFromState = location.state?.employeeName;
    const employeeNameFromStorage = localStorage.getItem('filteredEmployeeName');

    if (projectNameFromState) {
      setFilteredProjectName(projectNameFromState);
      localStorage.setItem('filteredProjectName', projectNameFromState);
    } else if (projectNameFromStorage) {
      setFilteredProjectName(projectNameFromStorage);
    }

    if (employeeNameFromState) {
      setFilteredEmployeeName(employeeNameFromState);
      localStorage.setItem('filteredEmployeeName', employeeNameFromState);
    } else if (employeeNameFromStorage) {
      setFilteredEmployeeName(employeeNameFromStorage);
    }

    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filteredProjectName, filteredEmployeeName]);

  // Update the clearFilter function
  const clearFilter = () => {
    setFilteredProjectName(null);
    setFilteredEmployeeName(null);
    localStorage.removeItem('filteredProjectName');
    localStorage.removeItem('filteredEmployeeName');
    navigate('/tasks', { replace: true }); // This will clear the location state
  };

  const handleViewMessages = (taskId) => {
    setSelectedTaskId(taskId);
    fetchTaskMessages(taskId);
  };



  useEffect(() => {
    // Initialize taskStatuses with existing task statuses
    const statuses = {};
    tasks.forEach(task => {
      statuses[task._id] = task.taskStatus;
    });
    setTaskStatuses(statuses);
  }, [tasks]);

  const taskHandleChange = (e, taskId) => {
    const { name, value, files } = e.target;
    setTasks((prevState) =>
      prevState.map((task) =>
        task._id === taskId
          ? { ...task, [name]: files ? files[0] : value }
          : task
      )
    );
  };

  const taskHandleSubmit = async (taskId) => {
    try {
      const taskToUpdate = tasks.find((task) => task._id === taskId);
      const formDataToSend = new FormData();

      // Helper function to safely parse dates
      const parseDate = (dateString) => {
        if (!dateString) return null;

        // Try parsing different date formats
        const date = new Date(dateString);

        // Check if date is valid
        if (isNaN(date.getTime())) {
          // Try parsing UK format (DD/MM/YYYY)
          const [day, month, yearTime] = dateString.split('/');
          const [year, time] = (yearTime || '').split(',');
          if (day && month && year) {
            return new Date(`${year.trim()}-${month.trim()}-${day.trim()}${time || ''}`);
          }
          return null;
        }

        return date;
      };

      // Create a copy of the task and format the dates
      const formattedTask = {
        ...taskToUpdate,
        taskDate: parseDate(taskToUpdate.taskDate)?.toISOString() || new Date().toISOString(),
        taskEndDate: parseDate(taskToUpdate.taskEndDate)?.toISOString() || new Date().toISOString()
      };

      // Remove taskAssignPerson and clientAssignPerson before sending
      delete formattedTask.taskAssignPerson;
      delete formattedTask.clientAssignPerson;

      // Append formatted data to FormData
      for (const key in formattedTask) {
        if (key !== 'taskAssignPerson' && key !== 'clientAssignPerson') {
          formDataToSend.append(key, formattedTask[key]);
        }
      }

      // Determine if we're updating an employee or client task
      // If the task currently has a client assigned, keep using client assignment
      // If it has an employee assigned, keep using employee assignment
      if (taskToUpdate.clientAssignPerson) {
        if (selectedClient) {
          formDataToSend.append("clientAssignPerson", selectedClient.value);
        } else {
          formDataToSend.append("clientAssignPerson", taskToUpdate.clientAssignPerson._id);
        }
      } else {
        // Default to using employee assignment
        if (selectedEmployees.length > 0) {
          formDataToSend.append("taskAssignPerson", selectedEmployees[0].value);
        } else if (taskToUpdate.taskAssignPerson) {
          formDataToSend.append("taskAssignPerson", taskToUpdate.taskAssignPerson._id);
        }
      }

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}api/tasks/${taskId}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const updatedTask = response.data;
      console.log(updatedTask);

      // Update task in state
      setTasks((prevState) =>
        prevState.map((task) => (task._id === taskId ? updatedTask : task))
      );

      toast.success("Task Updated Successfully!", {
        style: {
          backgroundColor: "#0d6efd",
          color: "white",
        },
      });

      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error updating task. Please check the date formats.", {
        style: {
          backgroundColor: "#dc3545",
          color: "white",
        },
      });
    }
  };

  // Filter tasks based on activeTab state and filterDate
  const filteredTasks = tasks.filter(task => {
    const taskDate = new Date(task.taskDate);
    const selectedDate = new Date(filterDate);
    const isSameDate = filterDate === '' || taskDate.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];

    const matchesSearch =
      task.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.taskAssignPerson && task.taskAssignPerson.employeeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.taskPriority.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.taskStatus.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedBy.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'All') {
      return isSameDate && matchesSearch;
    } else if (activeTab === 'Not Started') {
      return task.taskStatus === 'Not Started' && isSameDate && matchesSearch;
    } else {
      return task.taskStatus === activeTab && isSameDate && matchesSearch;
    }
  });


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

  // Logic for page number chunking (5 page limit)
  const pageLimit = 5;
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const startPage = Math.floor((currentPage - 1) / pageLimit) * pageLimit + 1;
  const endPage = Math.min(startPage + pageLimit - 1, totalPages);



  //DELETE TASK
  const [deletableId, setDeletableId] = useState("");
  const handleDeleteProject = async () => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}api/tasks/${deletableId}`
      );

      // Filter out the deleted task
      const remainingTasks = tasks.filter((task) => task._id !== deletableId);
      setTasks(remainingTasks);

      // Hide the modal
      const modalElement = document.getElementById("dremovetask");
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      modal.hide();

      // Display toast notification
      toast.error("Task Deleted Successfully!", {
        style: {
          backgroundColor: "#0d6efd",
          color: "white",
        },
      });

      // Reload the page after 5 seconds
      setTimeout(() => {
        window.location.reload();
      }, 5000);

    } catch (error) {
      console.error("Error:", error);
    }
  };
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


  // GET ALL PROJECTS IN INPUT
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/projects`);
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  const ccc = projects.filter((pro) => {
    return pro.projectName === formData.projectName;
  })[0];
  // console.log(ccc);
  const assignEmployee =
    ccc?.taskAssignPerson?.map((per) => {
      return {
        label: per.employeeName,
        value: per._id,
      };
    }) || [];
  // console.log(assignEmployee, 23423);

  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [notifications, setNotifications] = useState(() => {
    // Load notifications from localStorage on component mount
    const savedNotifications = localStorage.getItem('taskNotifications');
    return savedNotifications ? JSON.parse(savedNotifications) : {};
  });
  const [selectTask, setSelectTask] = useState({});
  const messageInputRef = useRef(null);
  const [socket, setSocket] = useState(null);

  const userData = JSON.parse(localStorage.getItem('user')); // Assuming 'user' is the key where user info is stored
  const userId = userData._id; // User ID
  const userName = userData.username;

  useEffect(() => {
    const newSocket = io(`${import.meta.env.VITE_BASE_URL}`);
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  useEffect(() => {
    if (socket == null) return;

    tasks.forEach(task => {
      socket.emit('join task', task._id);
    });

    socket.on('new task message', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
      // Only add notification if the message modal for this task isn't currently open
      if (!isMessageModalOpen || selectedTaskId !== message.taskId) {
        setNotifications(prev => ({
          ...prev,
          [message.taskId]: (prev[message.taskId] || 0) + 1
        }));
      }
    });

    return () => {
      tasks.forEach(task => {
        socket.emit('leave task', task._id);
      });
      socket.off('new task message');
    };
  }, [socket, tasks, isMessageModalOpen, selectedTaskId]);

  // Add useEffect to save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('taskNotifications', JSON.stringify(notifications));
  }, [notifications]);

  const fetchTaskMessages = async (taskId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/taskMessages/${taskId}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    const userDetails = JSON.parse(localStorage.getItem('user'));
    const senderId = userDetails.username;

    const formData = new FormData();
    formData.append('content', content);
    formData.append('senderId', senderId);
    formData.append('taskId', selectTask._id);

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

      // Add a small delay before scrolling
      setTimeout(() => {
        if (messageContainerRef.current) {
          messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleOpenMessages = (task) => {
    setSelectTask(task);
    setSelectedTaskId(task._id);
    fetchTaskMessages(task._id);

    // Add a small delay to ensure messages are loaded before scrolling
    setTimeout(() => {
      if (messageContainerRef.current) {
        messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  const globalSearch = () => {
    const searchResults = {
      tasks: filteredTasks,
      projects: projects.filter(project =>
        project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      ),
      employees: employees.filter(employee =>
        employee.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    };

    return searchResults;
  };

  // Add this function to handle the change in tasks per page
  const handleTasksPerPageChange = (e) => {
    const value = e.target.value;
    setTasksPerPage(value === 'all' ? filteredTasks.length : parseInt(value, 10));
    setCurrentPage(1); // Reset to first page when changing the number of tasks per page
  };

  const projectOptions = projects.map(project => ({
    value: project.projectName,
    label: project.projectName
  }));
  // Custom styles for react-select
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'transparent',
      border: 'none',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#80bdff'
      },

    }),
  };

  const messageContainerRef = useRef(null);

  // Modify the useEffect that handles messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages, selectedTaskId]); // Add selectedTaskId as dependency


  // Add these state declarations at the top of your Tasks component
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImageTitle, setSelectedImageTitle] = useState('');
  const [selectedTaskImages, setSelectedTaskImages] = useState([]);
  const [selectedTaskName, setSelectedTaskName] = useState('');

  // Add this function to handle opening the task images modal
  const handleOpenTaskImages = (task) => {
    setSelectedTaskImages(task.taskImages);
    setSelectedTaskName(task.taskTitle);
    const modalElement = document.getElementById('taskImagesModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    } else {
      console.error('Modal element not found');
    }
  };

  // Add this to your useEffect or create a new one
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/clients`);
        setClients(response.data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    fetchClients();
  }, []);

  return (
    <>
      <div id="mytask-layout">
        <Sidebar />
        {/* main body area */}
        <div className="main">
          {/* Body: Header */}
          <Header />
          <>
            {/* Body: Body */}
            <div className="body d-flex py-lg-3 py-md-2 px-lg-4 px-md-4">
              <div className="container-xxl">
                <div className="row align-items-center">
                  <div className="border-0 mb-3">
                    <div className="card-header py-4 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between" style={{
                      borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                      backgroundColor: 'transparent',
                      padding: '0 0 20px 0'
                    }}>
                      <h3 className="flex-fill mb-3 mb-sm-0" style={{
                        fontWeight: '700',
                        color: '#333',
                        fontSize: '24px',
                        position: 'relative',
                        paddingLeft: '15px'
                      }}>
                        <span style={{
                          position: 'absolute',
                          left: '0',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '5px',
                          height: '24px',
                          background: 'linear-gradient(to bottom, #4169e1, #1e40af)',
                          borderRadius: '3px'
                        }}></span>
                        Task Management
                      </h3>
                      <div className="d-flex flex-column flex-sm-row align-items-center">
                        <button
                          type="button"
                          className="btn mb-3 mb-sm-0 me-sm-3"
                          data-bs-toggle="modal"
                          data-bs-target="#createtask"
                          style={{
                            background: 'linear-gradient(135deg, #36a2eb, #36a2eb)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 18px',
                            fontWeight: '600',
                            boxShadow: '0 4px 10px rgba(82, 180, 71, 0.2)',
                            transition: 'all 0.2s ease',
                            fontSize: '14px'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 12px rgba(82, 180, 71, 0.3)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 10px rgba(82, 180, 71, 0.2)';
                          }}
                        >
                          <i className="icofont-plus-circle me-2" style={{ fontSize: '16px' }} />
                          Create Task
                        </button>
                        <div
                          className="nav tab-body-header rounded prtab-set d-inline-flex"
                          role="tablist"
                          style={{
                            padding: '5px',
                            background: '#f8f9fa',
                            borderRadius: '10px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                          }}
                        >
                          <style>
                            {`
                              .nav-link1.active {
                                background-color: #36a2eb !important;
                                color: white !important;
                                box-shadow: 0 2px 4px rgba(54, 162, 235, 0.3) !important;
                              }
                              .nav-link1.active:hover {
                                background-color: #36a2eb !important;
                                color: white !important;
                              }
                            `}
                          </style>
                          <div className="nav-item" style={{ position: 'relative' }}>
                            <a
                              className={`nav-link1 ${activeTab === "All" ? "active" : ""}`}
                              onClick={() => setActiveTab("All")}
                              data-bs-toggle="tab"
                              href="#All-list"
                              role="tab"
                              style={{
                                padding: '8px 20px',
                                fontWeight: '600',
                                fontSize: '14px',
                                color: activeTab === "All" ? 'white' : '#666',
                                borderRadius: '8px',
                                border: 'none',
                                transition: 'all 0.2s ease',
                                textDecoration: 'none',
                                display: 'inline-block'
                              }}
                            >
                              All
                            </a>
                          </div>
                          <div className="nav-item" style={{ position: 'relative' }}>
                            <a
                              className={`nav-link1 ${activeTab === "Not Started" ? "active" : ""}`}
                              onClick={() => setActiveTab("Not Started")}
                              data-bs-toggle="tab"
                              href="#NotStarted-list"
                              role="tab"
                              style={{
                                padding: '8px 20px',
                                fontWeight: '600',
                                fontSize: '14px',
                                color: activeTab === "Not Started" ? 'white' : '#666',
                                borderRadius: '8px',
                                border: 'none',
                                transition: 'all 0.2s ease',
                                textDecoration: 'none',
                                display: 'inline-block'
                              }}
                            >
                              <i className={`icofont-ui-timer me-1 ${activeTab === "Not Started" ? '' : 'text-warning'}`}
                                style={{ fontSize: '14px' }}></i>
                              Not Started
                            </a>
                          </div>
                          <div className="nav-item" style={{ position: 'relative' }}>
                            <a
                              className={`nav-link1 ${activeTab === "In Progress" ? "active" : ""}`}
                              onClick={() => setActiveTab("In Progress")}
                              data-bs-toggle="tab"
                              href="#Started-list"
                              role="tab"
                              style={{
                                padding: '8px 20px',
                                fontWeight: '600',
                                fontSize: '14px',
                                color: activeTab === "In Progress" ? 'white' : '#666',
                                borderRadius: '8px',
                                border: 'none',
                                transition: 'all 0.2s ease',
                                textDecoration: 'none',
                                display: 'inline-block'
                              }}
                            >
                              <i className={`icofont-spinner-alt-3 me-1 ${activeTab === "In Progress" ? '' : 'text-warning'}`}
                                style={{ fontSize: '14px' }}></i>
                              In Progress
                            </a>
                          </div>
                          <div className="nav-item" style={{ position: 'relative' }}>
                            <a
                              className={`nav-link1 ${activeTab === "Completed" ? "active" : ""}`}
                              onClick={() => setActiveTab("Completed")}
                              data-bs-toggle="tab"
                              href="#Completed-list"
                              role="tab"
                              style={{
                                padding: '8px 20px',
                                fontWeight: '600',
                                fontSize: '14px',
                                color: activeTab === "Completed" ? 'white' : '#666',
                                borderRadius: '8px',
                                border: 'none',
                                transition: 'all 0.2s ease',
                                textDecoration: 'none',
                                display: 'inline-block'
                              }}
                            >
                              <i className={`icofont-verification-check me-1 ${activeTab === "Completed" ? '' : 'text-success'}`}
                                style={{ fontSize: '14px' }}></i>
                              Completed
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>{" "}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mt-3 mb-3 gap-3">
                  <div>
                    <div className="d-flex">
                      {viewMode === 'row' ? (
                        <button
                          className="btn"
                          onClick={() => setViewMode('list')}
                          title="Switch to List View"
                          style={{
                            backgroundColor: 'rgba(82, 180, 71, 0.1)',
                            color: '#36a2eb',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.2)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.1)';
                          }}
                        >
                          <i className="bi bi-list-task"></i>
                        </button>
                      ) : (
                        <button
                          className="btn"
                          onClick={() => setViewMode('row')}
                          title="Switch to Grid View"
                          style={{
                            backgroundColor: 'rgba(82, 180, 71, 0.1)',
                            color: '#36a2eb',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.2)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.1)';
                          }}
                        >
                          <i className="bi bi-grid-3x3-gap-fill"></i>
                        </button>
                      )}
                    </div>
                  </div>

                  {(filteredProjectName || filteredEmployeeName) && (
                    <div className="d-flex align-items-center">
                      <div style={{
                        backgroundColor: 'rgba(255, 138, 0, 0.1)',
                        padding: '8px 15px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        flexWrap: 'wrap'
                      }}>
                        <i className="icofont-filter" style={{ color: '#1e40af', fontSize: '16px' }}></i>

                        {filteredProjectName && (
                          <span style={{
                            fontWeight: '600',
                            color: '#333',
                            fontSize: '14px'
                          }}>Project: <span style={{ color: '#1e40af' }}>{filteredProjectName}</span></span>
                        )}

                        {filteredEmployeeName && (
                          <span style={{
                            fontWeight: '600',
                            color: '#333',
                            fontSize: '14px',
                            marginLeft: filteredProjectName ? '10px' : '0'
                          }}>Assignee: <span style={{ color: '#1e40af' }}>{filteredEmployeeName}</span></span>
                        )}

                        <button
                          type="button"
                          className="btn"
                          onClick={clearFilter}
                          style={{
                            backgroundColor: '#1e40af',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#e65500';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#1e40af';
                          }}
                        >
                          <i className="icofont-close-line"></i>
                          Clear
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="input-group" style={{
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}>
                      <input
                        type="search"
                        className="form-control"
                        aria-label="search"
                        aria-describedby="addon-wrapping"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                          border: '1px solid rgba(82, 180, 71, 0.2)',
                          borderRight: 'none',
                          padding: '10px 15px',
                          fontSize: '14px',
                          color: '#333',
                          minWidth: '220px'
                        }}
                      />
                      <button
                        type="button"
                        className="input-group-text"
                        id="addon-wrapping"
                        style={{
                          backgroundColor: '#36a2eb',
                          border: 'none',
                          color: 'white',
                          padding: '0 15px',
                          cursor: 'pointer'
                        }}
                      >
                        <i className="icofont-search" />
                      </button>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <tr>
                    <td colSpan="8">
                      <div className="custom-loader" style={{ margin: "20px auto" }}></div>
                    </td>
                  </tr>
                ) : filteredTasks.length === 0 ? (
                  <div className="text-center mt-4">
                    <h1 className="text-muted">No tasks available. Please create a tasks.</h1>
                  </div>
                ) : (
                  <>
                    <div>
                      {viewMode === 'list' ? (
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
                                    }}>SrNo.</th>
                                    <th style={{
                                      padding: '16px 15px',
                                      fontWeight: '600',
                                      color: '#444',
                                      borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                      fontSize: '14px'
                                    }}>Project name</th>
                                    <th style={{
                                      padding: '16px 15px',
                                      fontWeight: '600',
                                      color: '#444',
                                      borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                      fontSize: '14px'
                                    }}>Task name</th>
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
                                    const currentDate = new Date();
                                    const taskEndDate = new Date(task.taskEndDate);
                                    const isOverdue = taskEndDate < currentDate && task.taskStatus !== 'Completed';

                                    // Remove the background color for overdue items since we'll use a badge instead

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
                                                <i className="bi-calendar3 me-1" style={{ color: '#36a2eb' }}></i>
                                                {task.taskDate}
                                              </div>
                                            </div>

                                            {/* <button
                                            className="btn"
                                            style={{
                                              color: '#36a2eb',
                                              padding: '5px',
                                              borderRadius: '50%',
                                              transition: 'all 0.2s',
                                              border: 'none',
                                              backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                              width: '30px',
                                              height: '30px',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              justifyContent: 'center'
                                            }}
                                            onClick={() => handleOpenTaskImages(task)}
                                            onMouseOver={(e) => {
                                              e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.2)';
                                            }}
                                            onMouseOut={(e) => {
                                              e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.1)';
                                            }}
                                          >
                                            <i className="bi-paperclip" style={{ fontSize: '14px' }} />
                                          </button> */}
                                          </div>
                                        </td>
                                        <td style={{
                                          padding: '16px 15px',
                                          borderBottom: '1px solid rgba(0,0,0,0.05)'
                                        }}>
                                          <div className="dropdown">
                                            {/* Task title display */}
                                            <div
                                              className="d-flex align-items-center justify-content-between"
                                              data-bs-toggle="dropdown"
                                              aria-expanded="false"
                                              style={{ cursor: 'pointer' }}
                                            >
                                              <div>
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

                                              <div style={{
                                                color: '#36a2eb',
                                                marginLeft: '10px'
                                              }}>
                                                <i className="bi-pencil"></i>
                                              </div>
                                            </div>

                                            {/* Dropdown menu with edit form */}
                                            <div className="dropdown-menu p-3" style={{
                                              width: '300px',
                                              boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
                                              border: '1px solid rgba(82, 180, 71, 0.2)',
                                              borderRadius: '8px'
                                            }}>
                                              <h6 style={{
                                                color: '#36a2eb',
                                                fontWeight: '600',
                                                marginBottom: '10px',
                                                borderBottom: '1px solid rgba(82, 180, 71, 0.2)',
                                                paddingBottom: '8px'
                                              }}>
                                                <i className="bi-list-task me-2"></i>
                                                Edit Task Details
                                              </h6>

                                              <div className="mb-3">
                                                <label className="form-label" style={{ fontSize: '13px', fontWeight: '600', color: '#555' }}>
                                                  Task Title
                                                </label>
                                                <input
                                                  className="form-control"
                                                  type="text"
                                                  name="taskTitle"
                                                  placeholder="Task Title"
                                                  value={task.taskTitle}
                                                  onChange={(e) => taskHandleChange(e, task._id)}
                                                  style={{
                                                    fontSize: '14px',
                                                    border: '1px solid rgba(82, 180, 71, 0.2)',
                                                    padding: '8px 12px'
                                                  }}
                                                />
                                              </div>

                                              <div className="mb-3">
                                                <label className="form-label" style={{ fontSize: '13px', fontWeight: '600', color: '#555' }}>
                                                  Task Description
                                                </label>
                                                <textarea
                                                  className="form-control"
                                                  type="text"
                                                  placeholder="Explain The Task What To Do & How To Do"
                                                  name="description"
                                                  value={task.description}
                                                  onChange={(e) => taskHandleChange(e, task._id)}
                                                  style={{
                                                    fontSize: '13px',
                                                    border: '1px solid rgba(82, 180, 71, 0.2)',
                                                    padding: '8px 12px',
                                                    resize: 'vertical',
                                                    minHeight: '80px'
                                                  }}
                                                />
                                              </div>

                                              <div className="d-flex justify-content-end">
                                                <button
                                                  className="btn"
                                                  onClick={() => taskHandleSubmit(task._id)}
                                                  style={{
                                                    backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                                    color: '#36a2eb',
                                                    fontWeight: '600',
                                                    fontSize: '13px',
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
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
                                                  <i className="bi-check2 me-1"></i>
                                                  Save Changes
                                                </button>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Overdue indicator below the task details */}
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
                                          <div>
                                            {task.taskAssignPerson && task.taskAssignPerson.employeeName ? (
                                              <>
                                                <div className="d-flex align-items-center">
                                                  <div style={{
                                                    backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                                    color: '#36a2eb',
                                                    width: '30px',
                                                    height: '30px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: '8px'
                                                  }}>
                                                    <i className="bi-person"></i>
                                                  </div>
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
                                              </>
                                            ) : task.clientAssignPerson && task.clientAssignPerson.clientName ? (
                                              <>
                                                <div className="d-flex align-items-center">
                                                  <div style={{
                                                    backgroundColor: 'rgba(255, 138, 0, 0.1)',
                                                    color: '#4169e1',
                                                    width: '30px',
                                                    height: '30px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: '8px'
                                                  }}>
                                                    <i className="bi-people"></i>
                                                  </div>
                                                  <div>
                                                    <div style={{
                                                      fontSize: '14px',
                                                      fontWeight: '600',
                                                      color: '#333'
                                                    }}>{task.clientAssignPerson.clientName}</div>
                                                    <span style={{
                                                      backgroundColor: 'rgba(255, 193, 7, 0.1)',
                                                      color: '#ffc107',
                                                      fontSize: '11px',
                                                      padding: '2px 6px',
                                                      borderRadius: '4px',
                                                      fontWeight: '600'
                                                    }}>Client Member</span>
                                                  </div>
                                                </div>
                                              </>
                                            ) : (
                                              <span style={{
                                                color: '#999',
                                                fontStyle: 'italic',
                                                fontSize: '13px'
                                              }}>Unassigned</span>
                                            )}
                                            <div className="mt-2" style={{
                                              fontSize: '12px',
                                              color: '#777'
                                            }}>
                                              <i className="bi-person-check me-1" style={{ color: '#36a2eb' }}></i>
                                              By: {task.assignedBy}
                                            </div>
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
                                            <input
                                              type="date"
                                              className="form-control"
                                              name="taskEndDate"
                                              value={task.taskEndDate}
                                              onChange={(e) => taskHandleChange(e, task._id)}
                                              style={{
                                                width: '100%',
                                                fontSize: '13px',
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                color: isOverdue ? '#dc3545' : '#36a2eb',
                                                fontWeight: '600',
                                                padding: '0'
                                              }}
                                            />
                                          </div>
                                        </td>
                                        <td style={{
                                          padding: '16px 15px',
                                          borderBottom: '1px solid rgba(0,0,0,0.05)'
                                        }}>
                                          <select
                                            className="form-select"
                                            aria-label="Default select Priority"
                                            name="taskPriority"
                                            value={task.taskPriority}
                                            onChange={(e) => taskHandleChange(e, task._id)}
                                            style={{
                                              width: '170%',
                                              fontSize: '13px',
                                              backgroundColor:
                                                task.taskPriority === 'Highest' ? 'rgba(220, 53, 69, 0.1)' :
                                                  task.taskPriority === 'Medium' ? 'rgba(255, 193, 7, 0.1)' :
                                                    task.taskPriority === 'Lowest' ? 'rgba(82, 180, 71, 0.1)' :
                                                      'white',
                                              color:
                                                task.taskPriority === 'Highest' ? '#dc3545' :
                                                  task.taskPriority === 'Medium' ? '#ffc107' :
                                                    task.taskPriority === 'Lowest' ? '#36a2eb' :
                                                      '#666',
                                              border: 'none',
                                              borderRadius: '6px',
                                              padding: '8px 12px',
                                              fontWeight: '600'
                                            }}
                                          >
                                            <option value="">Set Priority</option>
                                            <option value="Highest">Highest</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Lowest">Lowest</option>
                                          </select>
                                        </td>
                                        <td style={{
                                          padding: '16px 15px',
                                          borderBottom: '1px solid rgba(0,0,0,0.05)',
                                          textAlign: 'center'
                                        }}>
                                          <div className="d-flex gap-2 justify-content-center">
                                            <button
                                              onClick={() => taskHandleSubmit(task._id)}
                                              title="Update Task"
                                              style={{
                                                backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                                color: '#36a2eb',
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
                                              <i className="bi-check2"></i>
                                            </button>
                                            <button
                                              data-bs-toggle="modal"
                                              data-bs-target="#dremovetask"
                                              onClick={() => setDeletableId(task._id)}
                                              title="Delete Task"
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
                                              <i className="bi-trash"></i>
                                            </button>
                                          </div>
                                        </td>
                                        <td style={{
                                          padding: '16px 15px',
                                          borderBottom: '1px solid rgba(0,0,0,0.05)'
                                        }}>
                                          <div className="d-flex align-items-center gap-2">
                                            {task.taskStatus === 'Not Started' && (
                                              <div style={{
                                                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                                                color: '#ffc107',
                                                padding: '5px 10px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                              }}>Not Started</div>
                                            )}
                                            {task.taskStatus === 'In Progress' && (
                                              <div style={{
                                                backgroundColor: 'rgba(13, 202, 240, 0.1)',
                                                color: '#0dcaf0',
                                                padding: '5px 10px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                              }}>In Progress</div>
                                            )}
                                            {task.taskStatus === 'Completed' && (
                                              <div style={{
                                                backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                                color: '#36a2eb',
                                                padding: '5px 10px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                              }}>Completed</div>
                                            )}

                                            <button
                                              className="btn position-relative"
                                              data-bs-toggle="modal"
                                              data-bs-target="#taskMessage"
                                              onClick={() => handleOpenMessages(task)}
                                              style={{
                                                backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                                color: '#36a2eb',
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
                                              <i className="bi-chat-left-dots"></i>
                                              {notifications[task._id] > 0 && (
                                                <span style={{
                                                  position: 'absolute',
                                                  top: '-5px',
                                                  right: '-5px',
                                                  backgroundColor: '#1e40af',
                                                  color: 'white',
                                                  borderRadius: '50%',
                                                  width: '18px',
                                                  height: '18px',
                                                  fontSize: '10px',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                  fontWeight: 'bold',
                                                  boxShadow: '0 2px 5px rgba(255, 94, 0, 0.3)'
                                                }}>
                                                  {notifications[task._id]}
                                                </span>
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
                      ) : (
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
                              priorityColor = '#36a2eb';
                              priorityBg = 'rgba(82, 180, 71, 0.1)';
                            }

                            return (
                              <div key={task._id} className="col-12 col-sm-6 col-md-3 col-lg-3 mb-4">
                                <div className="card task-card" style={{
                                  height: '100%',
                                  minHeight: '320px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  borderRadius: '12px',
                                  border: 'none',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.07)',
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
                                  {/* <div style={{
                                    height: '6px',
                                    width: '100%',
                                    background: task.taskStatus === 'Completed'
                                      ? 'linear-gradient(to right, #36a2eb, #36a2eb)'
                                      : task.taskStatus === 'In Progress'
                                        ? 'linear-gradient(to right, #4169e1, #1e40af)'
                                        : isOverdue
                                          ? 'linear-gradient(to right, #1e40af, #d14b00)'
                                          : 'linear-gradient(to right, #ffb347, #ffcc33)'
                                  }}></div> */}

                                  <div className="card-body d-flex flex-column p-0">
                                    {/* Header with Project Name */}
                                    <div style={{
                                      padding: '12px 16px',
                                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      backgroundColor: 'rgba(0,0,0,0.02)',
                                    }}>
                                      <div className="d-flex align-items-center" style={{ flex: 1 }}>
                                        <span style={{
                                          width: '24px',
                                          height: '24px',
                                          borderRadius: '50%',
                                          backgroundColor: '#36a2eb',
                                          color: 'white',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontWeight: 'bold',
                                          marginRight: '8px',
                                          fontSize: '12px'
                                        }}>
                                          {index + 1}
                                        </span>
                                        <h5 className="card-title text-capitalize fw-bold mb-0 text-truncate"
                                          style={{ maxWidth: '140px', fontSize: '14px' }}
                                          title={task.projectName}>
                                          {task.projectName}
                                        </h5>
                                      </div>

                                      {task.taskImages && task.taskImages.length > 0 && (
                                        <button
                                          className="btn btn-link p-0 ms-2"
                                          onClick={() => handleOpenTaskImages(task)}
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
                                    <div className="flex-grow-1 p-2">
                                      <div className="mb-2">
                                        <input
                                          className="form-control mb-2"
                                          type="text"
                                          name="taskTitle"
                                          placeholder="Task Title"
                                          value={task.taskTitle}
                                          onChange={(e) => taskHandleChange(e, task._id)}
                                          style={{
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                            borderRadius: '0',
                                            padding: '6px 3px',
                                            fontWeight: 'bold',
                                            fontSize: '14px',
                                            width: '100%',
                                            color: '#333',
                                            transition: 'border-color 0.3s ease'
                                          }}
                                          onFocus={(e) => e.target.style.borderColor = 'rgba(82, 180, 71, 0.8)'}
                                          onBlur={(e) => e.target.style.borderColor = 'rgba(82, 180, 71, 0.2)'}
                                        />
                                        <textarea
                                          className="form-control mb-2"
                                          rows=""
                                          name="description"
                                          placeholder="Task description..."
                                          value={task.description}
                                          onChange={(e) => taskHandleChange(e, task._id)}
                                          style={{
                                            resize: 'none',
                                            backgroundColor: 'rgba(0,0,0,0.02)',
                                            height: '70px',
                                            border: '1px solid rgba(0,0,0,0.07)',
                                            borderRadius: '6px',
                                            padding: '8px',
                                            fontSize: '12px',
                                            lineHeight: '1.4',
                                            color: '#555'
                                          }}
                                        />

                                        {/* Priority & Date Display */}
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                          <div style={{
                                            backgroundColor: priorityBg,
                                            color: priorityColor,
                                            padding: '3px 8px',
                                            borderRadius: '15px',
                                            fontSize: '10px',
                                            fontWeight: '600',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '3px'
                                          }}>
                                            <i className="bi bi-flag-fill"></i>
                                            {task.taskPriority || 'No Priority'}
                                          </div>

                                          <div style={{
                                            color: isOverdue && task.taskStatus !== 'Completed' ? '#1e40af' : '#36a2eb',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '3px'
                                          }}>
                                            <i className={`bi ${isOverdue && task.taskStatus !== 'Completed' ? 'bi-alarm' : 'bi-calendar-check'}`}></i>
                                            {daysText}
                                          </div>
                                        </div>

                                        {/* Assigned Person */}
                                        <div className="mb-2" style={{
                                          backgroundColor: 'rgba(0,0,0,0.02)',
                                          borderRadius: '6px',
                                          padding: '8px 12px',
                                        }}>
                                          <p className="mb-1 fw-semibold" style={{ fontSize: '12px', color: '#666' }}>
                                            <i className="bi bi-person-fill me-1" style={{ color: '#36a2eb', fontSize: '10px' }}></i>
                                            Assigned to:
                                          </p>
                                          <p className="mb-1" style={{
                                            fontWeight: '600',
                                            color: '#333',
                                            fontSize: '13px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                          }}>
                                            {task.taskAssignPerson && task.taskAssignPerson.employeeName
                                              ? task.taskAssignPerson.employeeName
                                              : task.clientAssignPerson && task.clientAssignPerson.clientName
                                                ? task.clientAssignPerson.clientName
                                                : 'Unassigned'
                                            }
                                            <span className="badge" style={{
                                              backgroundColor: task.taskAssignPerson && task.taskAssignPerson.employeeName ? 'rgba(82, 180, 71, 0.2)' : 'rgba(255, 138, 0, 0.2)',
                                              color: task.taskAssignPerson && task.taskAssignPerson.employeeName ? '#36a2eb' : '#4169e1',
                                              fontSize: '9px',
                                              padding: '2px 6px',
                                              borderRadius: '3px',
                                            }}>
                                              {task.taskAssignPerson && task.taskAssignPerson.employeeName ? 'Employee' : 'Client Member'}
                                            </span>
                                          </p>
                                          <p className="mb-0" style={{ fontSize: '11px', color: '#666' }}>
                                            <i className="bi bi-person-plus me-1" style={{ fontSize: '9px' }}></i>
                                            By: <span style={{ color: '#36a2eb', fontWeight: '600' }}>{task.assignedBy}</span>
                                          </p>
                                        </div>
                                      </div>

                                      {/* Task Controls */}
                                      <div className="mb-2">
                                        <div className="row g-2">
                                          <div className="col-7">
                                            <label className="form-label mb-1" style={{ fontSize: '11px', color: '#666' }}>Due Date</label>
                                            <input
                                              type="date"
                                              className="form-control"
                                              name="taskEndDate"
                                              value={task.taskEndDate}
                                              onChange={(e) => taskHandleChange(e, task._id)}
                                              style={{
                                                fontSize: '12px',
                                                padding: '6px 8px',
                                                border: '1px solid rgba(0,0,0,0.1)',
                                                borderRadius: '4px'
                                              }}
                                            />
                                          </div>
                                          <div className="col-5">
                                            <label className="form-label mb-1" style={{ fontSize: '11px', color: '#666' }}>Priority</label>
                                            <select
                                              className="form-select"
                                              name="taskPriority"
                                              value={task.taskPriority}
                                              onChange={(e) => taskHandleChange(e, task._id)}
                                              style={{
                                                fontSize: '12px',
                                                padding: '6px 8px',
                                                border: '1px solid rgba(0,0,0,0.1)',
                                                borderRadius: '4px'
                                              }}
                                            >
                                              <option value="">Set Priority</option>
                                              <option value="Highest">Highest</option>
                                              <option value="Medium">Medium</option>
                                              <option value="Lowest">Lowest</option>
                                            </select>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="mt-auto p-2 pt-0">
                                      <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div>
                                          {task.taskStatus === 'Not Started' && (
                                            <span className="badge" style={{
                                              backgroundColor: 'rgba(255, 193, 7, 0.2)',
                                              color: '#ffc107',
                                              fontSize: '10px',
                                              padding: '3px 8px',
                                              borderRadius: '3px',
                                              fontWeight: '600'
                                            }}>Not Started</span>
                                          )}
                                          {task.taskStatus === 'In Progress' && (
                                            <span className="badge" style={{
                                              backgroundColor: 'rgba(255, 138, 0, 0.2)',
                                              color: '#4169e1',
                                              fontSize: '10px',
                                              padding: '3px 8px',
                                              borderRadius: '3px',
                                              fontWeight: '600'
                                            }}>In Progress</span>
                                          )}
                                          {task.taskStatus === 'Completed' && (
                                            <span className="badge" style={{
                                              backgroundColor: 'rgba(82, 180, 71, 0.2)',
                                              color: '#36a2eb',
                                              fontSize: '10px',
                                              padding: '3px 8px',
                                              borderRadius: '3px',
                                              fontWeight: '600'
                                            }}>Completed</span>
                                          )}
                                        </div>
                                        <button
                                          className="btn position-relative"
                                          data-bs-toggle="modal"
                                          data-bs-target="#taskMessage"
                                          onClick={() => handleOpenMessages(task)}
                                          style={{
                                            color: '#4169e1',
                                            padding: '4px 8px',
                                            transition: 'all 0.2s ease',
                                            borderRadius: '50%',
                                            backgroundColor: 'rgba(255, 138, 0, 0.1)',
                                            width: '32px',
                                            height: '32px',
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

                                      <div className="d-flex justify-content-between gap-2">
                                        <button
                                          onClick={() => taskHandleSubmit(task._id)}
                                          className="btn"
                                          style={{
                                            flex: 1,
                                            background: 'linear-gradient(135deg, #36a2eb, #36a2eb)',
                                            color: 'white',
                                            fontWeight: '600',
                                            fontSize: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '3px',
                                            padding: '6px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            boxShadow: '0 2px 4px rgba(82, 180, 71, 0.25)',
                                            transition: 'all 0.2s ease'
                                          }}
                                          onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 5px 12px rgba(82, 180, 71, 0.35)';
                                          }}
                                          onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 3px 6px rgba(82, 180, 71, 0.25)';
                                          }}
                                        >
                                          <i className="bi bi-check2"></i> Update
                                        </button>
                                        <button
                                          data-bs-toggle="modal"
                                          data-bs-target="#dremovetask"
                                          onClick={() => setDeletableId(task._id)}
                                          className="btn"
                                          style={{
                                            backgroundColor: 'rgba(255, 94, 0, 0.1)',
                                            color: '#1e40af',
                                            fontWeight: '600',
                                            fontSize: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '3px',
                                            padding: '6px 10px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            transition: 'all 0.2s ease'
                                          }}
                                          onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(255, 94, 0, 0.2)';
                                            e.currentTarget.style.color = '#d14b00';
                                          }}
                                          onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(255, 94, 0, 0.1)';
                                            e.currentTarget.style.color = '#1e40af';
                                          }}
                                        >
                                          <i className="bi bi-trash"></i> Delete
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
                  </>
                )}
                <div />

                {/* Pagination controls with orange and green theme */}
                <div className="row mt-4" style={{ marginBottom: '20px' }}>
                  <div className="col-12 col-md-6 mb-3">
                    <div className="d-flex align-items-center" style={{
                      background: '#f9fcf7',
                      padding: '12px 15px',
                      borderRadius: '8px',
                      border: '1px solid rgba(82, 180, 71, 0.15)'
                    }}>
                      <label htmlFor="tasksPerPage" className="form-label me-3 mb-0" style={{
                        fontWeight: '600',
                        color: '#444',
                        fontSize: '14px'
                      }}>Tasks per page:</label>
                      <select
                        id="tasksPerPage"
                        className="form-select"
                        style={{
                          width: 'auto',
                          border: '1px solid rgba(82, 180, 71, 0.3)',
                          borderRadius: '6px',
                          color: '#333',
                          fontWeight: '500',
                          padding: '8px 30px 8px 12px',
                          boxShadow: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2352b447' d='M8 10.5l-4-4h8l-4 4z'/%3E%3C/svg%3E")`,
                          cursor: 'pointer'
                        }}
                        value={tasksPerPage}
                        onChange={handleTasksPerPageChange}
                      >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="all">Show All</option>
                      </select>
                      <div style={{
                        marginLeft: '15px',
                        padding: '6px 12px',
                        backgroundColor: 'rgba(82, 180, 71, 0.1)',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#36a2eb',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <i className="icofont-listine-dots me-1"></i>
                        Total: {filteredTasks.length}
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <nav aria-label="Page navigation" style={{
                      background: '#f9fcf7',
                      padding: '12px 15px',
                      borderRadius: '8px',
                      border: '1px solid rgba(82, 180, 71, 0.15)'
                    }}>
                      <ul className="pagination justify-content-md-end mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button
                            onClick={prevPage}
                            className="page-link"
                            style={{
                              border: '1px solid rgba(82, 180, 71, 0.3)',
                              borderRadius: '6px 0 0 6px',
                              color: currentPage === 1 ? '#999' : '#36a2eb',
                              padding: '8px 14px',
                              fontWeight: '600',
                              backgroundColor: currentPage === 1 ? '#f8f8f8' : 'white',
                              transition: 'all 0.2s ease'
                            }}
                            disabled={currentPage === 1}
                          >
                            <i className="icofont-arrow-left" style={{ fontSize: '14px' }}></i>
                          </button>
                        </li>
                        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
                          <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                            <button
                              onClick={() => paginate(page)}
                              className="page-link"
                              style={{
                                border: '1px solid rgba(82, 180, 71, 0.3)',
                                borderLeft: 'none',
                                borderRight: 'none',
                                color: currentPage === page ? 'white' : '#555',
                                padding: '8px 14px',
                                fontWeight: '600',
                                background: currentPage === page ?
                                  'linear-gradient(135deg, #4169e1, #1e40af)' : 'white',
                                boxShadow: currentPage === page ?
                                  '0 2px 5px rgba(255, 94, 0, 0.3)' : 'none',
                                transition: 'all 0.2s ease',
                                minWidth: '40px',
                                textAlign: 'center'
                              }}
                            >
                              {page}
                            </button>
                          </li>
                        ))}
                        {endPage < totalPages && (
                          <li className="page-item">
                            <button
                              onClick={() => paginate(endPage + 1)}
                              className="page-link"
                              style={{
                                border: '1px solid rgba(82, 180, 71, 0.3)',
                                borderRadius: '0 6px 6px 0',
                                color: '#36a2eb',
                                padding: '8px 14px',
                                fontWeight: '600',
                                backgroundColor: 'white',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <i className="icofont-arrow-right" style={{ fontSize: '14px' }}></i>
                            </button>
                          </li>
                        )}
                      </ul>
                    </nav>
                  </div>
                </div>

              </div>
            </div>
            <>
              {/* Create task with Modern Design */}
              <div
                className="modal fade"
                id="createtask"
                tabIndex={-1}
                aria-hidden="true"
              >
                <div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
                  <div className="modal-content" style={{
                    borderRadius: '15px',
                    border: 'none',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    overflow: 'hidden'
                  }}>
                    <div className="modal-header" style={{
                      background: 'linear-gradient(135deg, #4169e1, #1e40af)',
                      borderBottom: 'none',
                      padding: '20px 25px',
                      position: 'relative'
                    }}>
                      <h5
                        className="modal-title fw-bold"
                        id="createprojectlLabel"
                        style={{
                          color: 'white',
                          fontSize: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                      >
                        <i className="icofont-tasks-alt" style={{ fontSize: '22px' }}></i>
                        Create Task
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          borderRadius: '50%',
                          padding: '8px',
                          opacity: '1',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                          e.currentTarget.style.transform = 'rotate(90deg)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                          e.currentTarget.style.transform = 'rotate(0deg)';
                        }}
                      />
                    </div>
                    <div className="modal-body" style={{ padding: '25px' }}>
                      <div className="mb-4">
                        <label
                          className="form-label"
                          style={{
                            fontWeight: '600',
                            color: '#444',
                            fontSize: '14px',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <i className="icofont-folder-open" style={{ color: '#1e40af' }}></i>
                          Project Name <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          aria-label="Default select Project"
                          name="projectName"
                          value={formData.projectName}
                          onChange={handleChange}
                          style={{
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 94, 0, 0.3)',
                            padding: '10px 15px',
                            color: '#333',
                            boxShadow: 'none',
                            backgroundColor: 'rgba(255, 94, 0, 0.03)'
                          }}
                        >
                          <option>Select Project</option>
                          {projects.map((project) => (
                            <option
                              key={project.id}
                              value={project.projectName}
                            >
                              {project.projectName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="formFileMultipleone"
                          className="form-label"
                          style={{
                            fontWeight: '600',
                            color: '#444',
                            fontSize: '14px',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <i className="icofont-file-image" style={{ color: '#36a2eb' }}></i>
                          Task Images &amp; Document
                        </label>
                        <input
                          className="form-control"
                          type="file"
                          id="formFileMultipleone"
                          multiple
                          name="taskImages"
                          onChange={handleChange}
                          style={{
                            borderRadius: '8px',
                            border: '1px solid rgba(82, 180, 71, 0.3)',
                            padding: '10px 15px',
                            color: '#333',
                            boxShadow: 'none',
                            backgroundColor: 'rgba(82, 180, 71, 0.03)'
                          }}
                        />
                        <small style={{ color: '#777', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                          Upload any relevant images or documents for this task
                        </small>
                      </div>

                      <div className="deadline-form mb-4">
                        <div className="row g-3">
                          <div className="col-12">
                            <label
                              htmlFor="datepickerdedone"
                              className="form-label"
                              style={{
                                fontWeight: '600',
                                color: '#444',
                                fontSize: '14px',
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <i className="icofont-calendar" style={{ color: '#1e40af' }}></i>
                              Task End Date <span className="text-danger">*</span>
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              id="datepickerdedone"
                              name="taskEndDate"
                              value={formData.taskEndDate}
                              onChange={handleChange}
                              style={{
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 94, 0, 0.3)',
                                padding: '10px 15px',
                                color: '#333',
                                boxShadow: 'none',
                                backgroundColor: 'rgba(255, 94, 0, 0.03)'
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mb-4" style={{
                        backgroundColor: 'rgba(82, 180, 71, 0.05)',
                        padding: '15px',
                        borderRadius: '10px',
                        border: '1px solid rgba(82, 180, 71, 0.1)'
                      }}>
                        <label
                          className="form-label mb-3"
                          style={{
                            fontWeight: '600',
                            color: '#444',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <i className="icofont-users" style={{ color: '#36a2eb' }}></i>
                          Assign Task To
                        </label>

                        <div className="d-flex mb-3" style={{
                          backgroundColor: 'white',
                          padding: '10px 15px',
                          borderRadius: '8px',
                          border: '1px solid rgba(82, 180, 71, 0.2)'
                        }}>
                          <div className="form-check form-check-inline me-4">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="assignType"
                              id="assignEmployee"
                              value="employee"
                              checked={assignType === 'employee'}
                              onChange={() => setAssignType('employee')}
                              style={{
                                cursor: 'pointer',
                                borderColor: '#36a2eb'
                              }}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="assignEmployee"
                              style={{
                                cursor: 'pointer',
                                fontWeight: assignType === 'employee' ? '600' : '400',
                                color: assignType === 'employee' ? '#36a2eb' : '#666'
                              }}
                            >
                              <i className={`icofont-business-man-alt-1 me-1 ${assignType === 'employee' ? 'text-success' : 'text-muted'}`}></i>
                              Employee
                            </label>
                          </div>
                          <div className="form-check form-check-inline">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="assignType"
                              id="assignClient"
                              value="client"
                              checked={assignType === 'client'}
                              onChange={() => setAssignType('client')}
                              style={{
                                cursor: 'pointer',
                                borderColor: '#4169e1'
                              }}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="assignClient"
                              style={{
                                cursor: 'pointer',
                                fontWeight: assignType === 'client' ? '600' : '400',
                                color: assignType === 'client' ? '#4169e1' : '#666'
                              }}
                            >
                              <i className={`icofont-user-alt-3 me-1 ${assignType === 'client' ? 'text-warning' : 'text-muted'}`}></i>
                              Client
                            </label>
                          </div>
                        </div>

                        {assignType === 'employee' ? (
                          <div>
                            <label
                              className="form-label"
                              style={{
                                fontWeight: '600',
                                color: '#444',
                                fontSize: '14px',
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <i className="icofont-user-suited" style={{ color: '#36a2eb' }}></i>
                              Task Assign Person <span className="text-danger">*</span>
                            </label>
                            <select
                              className="form-select"
                              value={selectedEmployees[0]?.value || ""}
                              onChange={(e) => setSelectedEmployees([{ label: e.target.options[e.target.selectedIndex].text, value: e.target.value }])}
                              style={{
                                borderRadius: '8px',
                                border: '1px solid rgba(82, 180, 71, 0.3)',
                                padding: '10px 15px',
                                color: '#333',
                                boxShadow: 'none',
                                backgroundColor: 'white'
                              }}
                            >
                              <option value="" disabled>Select Employees</option>
                              {assignEmployee.map((employee) => (
                                <option key={employee.value} value={employee.value}>
                                  {employee.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div>
                            <label
                              className="form-label"
                              style={{
                                fontWeight: '600',
                                color: '#444',
                                fontSize: '14px',
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <i className="icofont-user-alt-7" style={{ color: '#4169e1' }}></i>
                              Task Assign Client <span className="text-danger">*</span>
                            </label>
                            <select
                              className="form-select"
                              value={selectedClient?.value || ""}
                              onChange={(e) => setSelectedClient({
                                label: e.target.options[e.target.selectedIndex].text,
                                value: e.target.value
                              })}
                              style={{
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 94, 0, 0.3)',
                                padding: '10px 15px',
                                color: '#333',
                                boxShadow: 'none',
                                backgroundColor: 'white'
                              }}
                            >
                              <option value="" disabled>Select Client</option>
                              {clients.map((client) => (
                                <option key={client._id} value={client._id}>
                                  {client.clientName}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <label
                          className="form-label"
                          style={{
                            fontWeight: '600',
                            color: '#444',
                            fontSize: '14px',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <i className="icofont-flag" style={{ color: '#1e40af' }}></i>
                          Task Priority
                        </label>
                        <select
                          className="form-select"
                          aria-label="Default select Priority"
                          name="taskPriority"
                          value={formData.taskPriority}
                          onChange={handleChange}
                          style={{
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 94, 0, 0.3)',
                            padding: '10px 15px',
                            color: '#333',
                            boxShadow: 'none',
                            backgroundColor: 'rgba(255, 94, 0, 0.03)'
                          }}
                        >
                          <option value="">Set Priority</option>
                          <option value="Highest">Highest</option>
                          <option value="Medium">Medium</option>
                          <option value="Lowest">Lowest</option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label
                          className="form-label"
                          style={{
                            fontWeight: '600',
                            color: '#444',
                            fontSize: '14px',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <i className="icofont-ui-text-chat" style={{ color: '#36a2eb' }}></i>
                          Task Title <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Task Title"
                          name="taskTitle"
                          value={formData.taskTitle}
                          onChange={handleChange}
                          required
                          style={{
                            borderRadius: '8px',
                            border: '1px solid rgba(82, 180, 71, 0.3)',
                            padding: '10px 15px',
                            color: '#333',
                            boxShadow: 'none',
                            backgroundColor: 'rgba(82, 180, 71, 0.03)'
                          }}
                        />
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="exampleFormControlTextarea786"
                          className="form-label"
                          style={{
                            fontWeight: '600',
                            color: '#444',
                            fontSize: '14px',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <i className="icofont-notepad" style={{ color: '#36a2eb' }}></i>
                          Task Description <span className="text-danger">*</span>
                        </label>
                        <textarea
                          className="form-control"
                          id="exampleFormControlTextarea786"
                          rows={4}
                          placeholder="Explain The Task What To Do & How To Do"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          style={{
                            borderRadius: '8px',
                            border: '1px solid rgba(82, 180, 71, 0.3)',
                            padding: '12px 15px',
                            color: '#333',
                            boxShadow: 'none',
                            backgroundColor: 'rgba(82, 180, 71, 0.03)',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                    </div>

                    <div className="modal-footer" style={{
                      borderTop: '1px solid rgba(255, 94, 0, 0.1)',
                      padding: '16px 25px'
                    }}>
                      <button
                        type="button"
                        className="btn"
                        data-bs-dismiss="modal"
                        style={{
                          backgroundColor: 'rgba(255, 94, 0, 0.1)',
                          color: '#1e40af',
                          border: '1px solid rgba(255, 94, 0, 0.3)',
                          borderRadius: '8px',
                          padding: '8px 20px',
                          fontWeight: '600',
                          fontSize: '14px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 94, 0, 0.2)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 94, 0, 0.1)';
                        }}
                      >
                        <i className="icofont-close-circled me-2"></i>
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn"
                        style={{
                          background: 'linear-gradient(135deg, #36a2eb, #36a2eb)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 20px',
                          fontWeight: '600',
                          fontSize: '14px',
                          boxShadow: '0 4px 10px rgba(82, 180, 71, 0.2)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 12px rgba(82, 180, 71, 0.3)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 10px rgba(82, 180, 71, 0.2)';
                        }}
                        data-bs-dismiss="modal"
                        onClick={handleSubmit}
                      >
                        <i className="icofont-verification-check me-2"></i>
                        Create Task
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal  Delete Task */}
              <div
                className="modal fade"
                id="dremovetask"
                tabIndex={-1}
                aria-hidden="true"
              >
                <div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5
                        className="modal-title  fw-bold"
                        id="dremovetaskLabel"
                      >
                        {" "}
                        Delete Task Permanently?
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      />
                    </div>
                    <div className="modal-body justify-content-center flex-column d-flex">
                      <i className="icofont-ui-delete text-danger display-2 text-center mt-2" />
                      <p className="mt-4 fs-5 text-center">
                        You can only delete this Task Permanently
                      </p>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        data-bs-dismiss="modal"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger color-fff"
                        onClick={handleDeleteProject}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Update task */}
              <div
                className="modal fade"
                id="editemp"
                tabIndex={-1}
                aria-hidden="true"
              >
                <div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5
                        className="modal-title  fw-bold"
                        id="createprojectlLabel"
                      >
                        {" "}
                        Update Task
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      />
                    </div>
                    <div className="modal-body">
                      <div className="mb-3">
                        <label className="form-label">Project Name</label>
                        {/* <input
                          type="text"
                          className="form-control"
                          id="exampleFormControlInput77"
                          placeholder="Project Name"
                          name="projectName"
                          value={formData.projectName}
                          onChange={handleChange}
                        /> */}
                        <select
                          className="form-select"
                          placeholder="Add Category"
                          aria-label="Default select Project Category"
                          name="projectName"
                          value={taskFormData.projectName}
                          onChange={taskHandleChange}
                        >
                          <option>Select Project</option>
                          {projects.map((project) => (
                            <option
                              key={project.id}
                              value={project.projectName}
                            >
                              {project.projectName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Task Category</label>
                        <select
                          className="form-select"
                          placeholder="Add Category"
                          aria-label="Default select Project Category"
                          name="taskCategory"
                          value={taskFormData.taskCategory}
                          onChange={taskHandleChange}
                        >
                          <option selected="Add Category">Add Category</option>
                          <option value={"UI/UX Design"}>UI/UX Design</option>
                          <option value={"Website Developement"}>
                            Website Developement
                          </option>
                          <option value={"App Development"}>
                            App Development
                          </option>
                          {/* <option value={"Quality Assurance"}>
                          Quality Assurance
                        </option>
                        <option value={"Development"}>Development</option>
                        <option value={"Backend Development"}>
                          Backend Development
                        </option>
                        <option value={"Software Testing"}>
                          Software Testing
                        </option>
                        <option value={"Website Design"}>Website Design</option> */}
                          <option value={"Digital Marketing"}>
                            Digital Marketing
                          </option>
                          {/* <option value={"SEO"}>SEO</option> */}
                          {/* <option value={"Other"}>Other</option> */}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="formFileMultipleone"
                          className="form-label"
                        >
                          Task Images &amp; Document
                        </label>
                        <input
                          className="form-control"
                          type="file"
                          id="formFileMultipleone"
                          multiple=""
                          name="taskImages"
                          onChange={taskHandleChange}
                        />
                      </div>
                      <div className="deadline-form mb-3">
                        <form>
                          <div className="row">
                            <div className="col">
                              <label
                                htmlFor="datepickerded"
                                className="form-label"
                              >
                                Task Start Date
                              </label>
                              <input
                                type="date"
                                className="form-control"
                                id="datepickerded"
                                name="taskStartDate"
                                value={taskFormData.taskStartDate}
                                onChange={taskHandleChange}
                              />
                            </div>
                            <div className="col">
                              <label
                                htmlFor="datepickerdedone"
                                className="form-label"
                              >
                                Task End Date
                              </label>
                              <input
                                type="date"
                                className="form-control"
                                id="datepickerdedone"
                                name="taskEndDate"
                                value={taskFormData.taskEndDate}
                                onChange={taskHandleChange}
                              />
                            </div>
                          </div>
                        </form>
                      </div>
                      <div className="row g-3 mb-3">
                        <div className="col-sm">
                          <label className="form-label">
                            Task Assign Person
                          </label>
                          <div>
                            <select
                              className="form-select"
                              value={selectedEmployees[0]?.value || ""}
                              onChange={(e) => setSelectedEmployees([{ label: e.target.options[e.target.selectedIndex].text, value: e.target.value }])}
                            >
                              <option value="" disabled>Select Employee</option>
                              {assignEmployee.map((employee) => (
                                <option key={employee.value} value={employee.value}>
                                  {employee.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="row g-3 mb-3">
                        <div className="col-sm">
                          <label className="form-label">Task Priority</label>
                          <select
                            className="form-select"
                            aria-label="Default select Priority"
                            name="taskPriority"
                            value={taskFormData.taskPriority}
                            onChange={taskHandleChange}
                          >
                            <option placeholder="set priority">
                              Set Priority
                            </option>
                            <option value={"Highest"}>Highest</option>
                            <option value={"Medium"}>Medium</option>
                            <option value={"Lowest"}>Lowest</option>
                          </select>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleFormControlTextarea786"
                          className="form-label"
                        >
                          Description (optional)
                        </label>
                        <textarea
                          className="form-control"
                          id="exampleFormControlTextarea786"
                          rows={3}
                          placeholder="Explain The Task What To Do & How To Do"
                          name="description"
                          value={taskFormData.description}
                          onChange={taskHandleChange}
                        />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary bg-danger"
                        data-bs-dismiss="modal"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn close text-white"
                        style={{ backgroundColor: "#0a9400" }}
                        onClick={taskHandleSubmit}
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Message Modal with Orange and Green Theme */}
              <div className="modal fade" id="taskMessage" tabIndex={-1} aria-labelledby="taskMessageLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                  <div className="modal-content" style={{
                    borderRadius: '15px',
                    border: 'none',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    overflow: 'hidden',
                    height: '80vh', // Fixed height for better chat experience
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
                      <div
                        className="d-flex align-items-center"
                        style={{ width: '100%' }}
                      >
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '12px'
                          }}
                        >
                          <i className="bi bi-card-checklist" style={{ fontSize: '20px', color: 'white' }}></i>
                        </div>
                        <div style={{ flex: 1 }}>
                          <h5
                            className="modal-title"
                            id="taskMessageLabel"
                            style={{
                              color: 'white',
                              fontSize: '18px',
                              fontWeight: '600',
                              margin: 0
                            }}
                          >
                            {selectTask.projectName}
                          </h5>
                          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                            <i className="bi bi-chat-dots me-1"></i> Task Conversation
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn-close"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: '50%',
                            padding: '8px',
                            opacity: '1',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                            e.currentTarget.style.transform = 'rotate(90deg)';
                          }}
                          onMouseOut={(e) => {
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
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23000000" fill-opacity="0.03" fill-rule="evenodd"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3Ccircle cx="13" cy="13" r="3"/%3E%3C/g%3E%3C/svg%3E")',
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
                            const isCurrentUser = message.senderId === sessionStorage.getItem('employeeName'); // This should match your actual logic
                            const prevSender = index > 0 ? messages[index - 1].senderId : null;
                            const showSender = prevSender !== message.senderId;

                            return (
                              <div key={message._id} className={`message-group ${isCurrentUser ? 'own-messages' : ''}`} style={{
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
                                    {message.content.startsWith("```excel") ? (
                                      <div className="excel-message p-1 rounded bg-light w-100" style={{
                                        border: '1px solid rgba(0,0,0,0.1)',
                                        borderRadius: '8px',
                                        overflow: 'auto'
                                      }}>
                                        <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', padding: '0 5px' }}>
                                          <i className="bi bi-file-earmark-spreadsheet me-1"></i>Excel Sheet:
                                        </div>
                                        <table className="table table-sm table-bordered m-0">
                                          <tbody>
                                            {message.content
                                              .replace("```excel\n", "")
                                              .replace("```", "")
                                              .trim()
                                              .split('\n')
                                              .map((row, rowIdx) => (
                                                <tr key={rowIdx}>
                                                  {row.split('\t').map((cell, cellIdx) => (
                                                    <td key={cellIdx} className="px-2 py-1" style={{ fontSize: '13px' }}>{cell}</td>
                                                  ))}
                                                </tr>
                                              ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    ) : (
                                      <div style={{ fontSize: '14px' }}>{message.content}</div>
                                    )}
                                    <div style={{
                                      fontSize: '11px',
                                      color: '#999',
                                      textAlign: 'right',
                                      marginTop: '4px'
                                    }}>
                                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      {isCurrentUser && (
                                        <i className="bi bi-check-all ms-1" style={{ color: '#36a2eb' }}></i>
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
                                      <i className="bi bi-person" style={{ color: '#36a2eb', fontSize: '18px' }}></i>
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
                                      {message.fileUrls.map((fileUrl, index) => {
                                        if (fileUrl) {
                                          const cleanFileUrl = `${import.meta.env.VITE_BASE_URL}uploads${fileUrl}`;
                                          const fileExtension = cleanFileUrl.split('.').pop().toLowerCase();
                                          const fileName = cleanFileUrl.split('/').pop();

                                          if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
                                            return (
                                              <div key={index} style={{
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
                                                    alt={`Attachment ${index + 1}`}
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
                                          } else {
                                            const isDoc = fileExtension === 'pdf' || fileExtension === 'doc' || fileExtension === 'docx';
                                            return (
                                              <a
                                                key={index}
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
                                                  color: isCurrentUser ? '#36a2eb' : '#4169e1',
                                                  textDecoration: 'none',
                                                  maxWidth: '250px'
                                                }}
                                              >
                                                <i className={`bi bi-file-${isDoc ? 'pdf' : 'text'}`} style={{ fontSize: '20px' }}></i>
                                                <span style={{
                                                  whiteSpace: 'nowrap',
                                                  overflow: 'hidden',
                                                  textOverflow: 'ellipsis',
                                                  fontSize: '13px'
                                                }}>
                                                  {fileName}
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
                      <form onSubmit={handleSubmitMessage} className="d-flex flex-column">
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-end',
                          gap: '10px'
                        }}>
                          <div style={{
                            position: 'relative',
                            flex: 1
                          }}>
                            <textarea
                              className="form-control"
                              id="currentMessage"
                              name="message"
                              rows="1"
                              value={content}
                              onChange={(e) => {
                                setContent(e.target.value);
                                // Auto resize textarea
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(120, e.target.scrollHeight) + 'px';
                              }}
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
                              backgroundColor: '#36a2eb',
                              color: 'white',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 8px rgba(82,180,71,0.3)',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)';
                              e.currentTarget.style.backgroundColor = '#36a2eb';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.backgroundColor = '#36a2eb';
                            }}
                          >
                            <i className="bi bi-send" style={{ fontSize: '18px' }}></i>
                          </button>
                        </div>

                        {/* File preview area - shows when files are selected */}
                        <div id="filePreviewArea" style={{
                          display: 'none', /* Change this dynamically with JS when files are selected */
                          marginTop: '10px',
                          padding: '10px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(0,0,0,0.03)',
                          border: '1px dashed rgba(0,0,0,0.1)'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '8px'
                          }}>
                            <span style={{ fontSize: '13px', color: '#666' }}>
                              <i className="bi bi-paperclip me-1"></i>
                              <span id="fileCount">0</span> files selected
                            </span>
                            <button
                              type="button"
                              id="clearFiles"
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#1e40af',
                                fontSize: '13px',
                                cursor: 'pointer'
                              }}
                            >
                              Clear all
                            </button>
                          </div>
                          <div id="previewContainer" style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px'
                          }}>
                            {/* File previews will be added here dynamically */}
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </>
          </>
        </div>
      </div>

      {/* Task Images Modal */}
      <div className="modal fade" id="taskImagesModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content" style={{
            borderRadius: '15px',
            border: 'none',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}>
            <div className="modal-header" style={{
              background: 'linear-gradient(135deg, #36a2eb, #36a2eb)',
              borderBottom: 'none',
              padding: '20px 25px',
              position: 'relative'
            }}>
              <h5
                className="modal-title"
                style={{
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <i className="icofont-gallery" style={{ fontSize: '22px' }}></i>
                {selectedTaskName} - Task Images
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                style={{
                  filter: 'brightness(0) invert(1)',
                  opacity: '0.8'
                }}
              ></button>
            </div>
            <div className="modal-body" style={{
              padding: '25px',
              background: '#f8f9fa'
            }}>
              <div className="row g-4">
                {selectedTaskImages && selectedTaskImages.map((image, index) => (
                  <div key={index} className="col-md-4">
                    <div style={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      transition: 'transform 0.3s ease',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}>
                      <img
                        src={`${import.meta.env.VITE_BASE_URL}${image.replace('uploads/', '')}`}
                        alt={`Task image ${index + 1}`}
                        className="img-fluid"
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                        onClick={() => window.open(`${import.meta.env.VITE_BASE_URL}${image.replace('uploads/', '')}`, '_blank')}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '0',
                        right: '0',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                        padding: '20px 15px 10px 15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>
                          Image {index + 1}
                        </span>
                        <button
                          onClick={() => window.open(`${import.meta.env.VITE_BASE_URL}${image.replace('uploads/', '')}`, '_blank')}
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer',
                            transition: 'background 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                          }}
                        >
                          <i className="icofont-external-link"></i>
                          View Full Size
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer" style={{
              borderTop: '1px solid rgba(0,0,0,0.1)',
              padding: '20px 25px',
              background: '#fff'
            }}>
              <button
                type="button"
                className="btn"
                data-bs-dismiss="modal"
                style={{
                  background: 'linear-gradient(135deg, #4169e1, #1e40af)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 25px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 10px rgba(255, 138, 0, 0.2)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(255, 138, 0, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(255, 138, 0, 0.2)';
                }}
              >
                <i className="icofont-close-circled me-2"></i>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tasks;