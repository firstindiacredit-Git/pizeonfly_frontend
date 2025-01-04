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

  const [viewMode, setViewMode] = useState('list'); // Default is list view

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

      // Append multiple assignees if selected
      selectedEmployees.forEach((employee) => {
        formDataToSend.append("taskAssignPerson", employee.value);
      });

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
      const [tasksResponse, projectsResponse, employeesResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}api/tasks`),
        axios.get(`${import.meta.env.VITE_BASE_URL}api/projects`),
        axios.get(`${import.meta.env.VITE_BASE_URL}api/employees`)
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
          task.taskAssignPerson.employeeName === filteredEmployeeName
        );
      }

      setTasks(filteredTasks);
      setProjects(projectsResponse.data);
      setEmployees(employeesResponse.data);
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
      delete taskToUpdate.taskAssignPerson;
      for (const key in taskToUpdate) {
        formDataToSend.append(key, taskToUpdate[key]);
      }
      selectedEmployees.forEach((obj) => {
        formDataToSend.append("taskAssignPerson", obj.value);
      });
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
                    <div className="card-header py-3 no-bg bg-transparent d-flex align-items-center px-0 justify-content-between border-bottom flex-wrap">
                      <h3 className="fw-bold mb-0">Task Management</h3>

                      <div className="col-auto d-flex w-sm-100 flex-wrap">
                        <button
                          type="button"
                          className="btn btn-dark btn-set-task w-sm-100 me-2 mb-2 mb-md-0"
                          data-bs-toggle="modal"
                          data-bs-target="#createtask"
                        >
                          <i className="icofont-plus-circle me-2 fs-6" />
                          Create Task
                        </button>

                        <ul className="nav nav-tabs tab-body-header rounded ms-1 prtab-set w-sm-100" role="tablist">
                          <li className="nav-item">
                            <a
                              className={`nav-link ${activeTab === 'All' ? 'active' : ''}`}
                              onClick={() => setActiveTab('All')}
                              data-bs-toggle="tab"
                              href="#All-list"
                              role="tab"
                            >
                              All
                            </a>
                          </li>
                          <li className="nav-item">
                            <a
                              className={`nav-link ${activeTab === 'Not Started' ? 'active' : ''}`}
                              onClick={() => setActiveTab('Not Started')}
                              data-bs-toggle="tab"
                              href="#NotStarted-list"
                              role="tab"
                            >
                              Not Started
                            </a>
                          </li>
                          <li className="nav-item">
                            <a
                              className={`nav-link ${activeTab === 'In Progress' ? 'active' : ''}`}
                              onClick={() => setActiveTab('In Progress')}
                              data-bs-toggle="tab"
                              href="#Started-list"
                              role="tab"
                            >
                              In Progress
                            </a>
                          </li>
                          <li className="nav-item">
                            <a
                              className={`nav-link ${activeTab === 'Completed' ? 'active' : ''}`}
                              onClick={() => setActiveTab('Completed')}
                              data-bs-toggle="tab"
                              href="#Completed-list"
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
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-4">
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

                  <div className="col-12 col-md-4">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                      >
                        <i className="fa fa-search" />
                      </button>
                    </div>
                    {(filteredProjectName || filteredEmployeeName) && (
                      <div className="mt-2">
                        {filteredProjectName && <strong className="me-2">Project: {filteredProjectName}</strong>}
                        {filteredEmployeeName && <strong className="me-2">Employee: {filteredEmployeeName}</strong>}
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={clearFilter}>Clear Filter</button>
                      </div>
                    )}
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="input-group d-flex gap-2 align-items-center" style={{ width: "20rem" }}>
                      <span className="fw-bold">Filter by Date - </span>
                      <input
                        className="form-control"
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                      />

                    </div>
                  </div>
                </div>

                {/* Row end  */}
                {viewMode === 'list' ? (
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead>
                        <tr>
                          <th scope="col" >SrNo.</th>
                          <th scope="col" style={{ width: '6rem' }}>Project name</th>
                          <th scope="col">Task name</th>
                          <th scope="col" style={{ width: '7rem' }}>Assignee</th>
                          <th scope="col" style={{ width: '6rem' }}>Due Date</th>
                          <th scope="col" style={{ width: '6rem' }}>Priority</th>
                          <th scope="col" style={{ width: '' }}>U/D</th>
                          <th scope="col" style={{ width: '' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="8">
                              <div className="custom-loader" style={{ margin: "20px auto" }}></div>
                            </td>
                          </tr>
                        ) : (
                          currentTasks.map((task, index) => {
                            const currentDate = new Date();
                            const taskEndDate = new Date(task.taskEndDate);
                            const isOverdue = taskEndDate < currentDate && task.taskStatus !== 'Completed';

                            let backgroundColor = '';
                            if (isOverdue) {
                              backgroundColor = '#f6c8b7';
                            }

                            return (
                              <tr
                                key={task._id}
                                style={{ backgroundColor }}
                              >
                                <td><span className="fw-bold fs-6">{index + 1}. </span></td>
                                <td style={{ backgroundColor }}>

                                  {task.projectName}
                                  <p>{task.taskDate}</p>
                                  <Link
                                    to="/images"
                                    state={{
                                      images: task.taskImages,
                                      projectName: task.projectName,
                                    }}
                                    style={{ marginLeft: "33px" }}
                                  >
                                    <i className="bi-paperclip fs-6" />
                                  </Link>
                                </td>
                                <td className="" style={{ backgroundColor }}>
                                  <input
                                    className="form-control fw-bold"
                                    type="text"
                                    name="taskTitle"
                                    placeholder="Task Title"
                                    value={task.taskTitle}
                                    onChange={(e) => taskHandleChange(e, task._id)}
                                    style={{ backgroundColor: 'transparent', border: 'none' }}
                                  />
                                  <textarea
                                    className="w-100 form-control"
                                    type="text"
                                    placeholder="Explain The Task What To Do & How To Do"
                                    name="description"
                                    value={task.description}
                                    onChange={(e) => taskHandleChange(e, task._id)}
                                    style={{ outline: 'none', border: 'none', textWrap: 'wrap' }}
                                  />
                                </td>
                                <td style={{ backgroundColor }}>
                                  {task.taskAssignPerson && task.taskAssignPerson.employeeName ? task.taskAssignPerson.employeeName : 'Unassigned'}
                                  <p className="text-muted">By:-{task.assignedBy}</p>
                                </td>
                                <td style={{ backgroundColor }}>
                                  <input
                                    type="date"
                                    className="form-control"
                                    name="taskEndDate"
                                    value={task.taskEndDate}
                                    onChange={(e) => taskHandleChange(e, task._id)}
                                    style={{ width: '120px', fontSize: '0.8rem' }} // Adjusted width and font size
                                  />
                                </td>
                                <td style={{ backgroundColor }}>
                                  <select
                                    className="form-select"
                                    aria-label="Default select Priority"
                                    name="taskPriority"
                                    value={task.taskPriority}
                                    onChange={(e) => taskHandleChange(e, task._id)}
                                    style={{ width: '120px', fontSize: '0.8rem' }}
                                  >
                                    <option value="">Set Priority</option>
                                    <option value="Highest">Highest</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Lowest">Lowest</option>
                                  </select>
                                </td>
                                <td className="bg-transparent">
                                  <div className="d-flex gap-2 bg-transparent">
                                    <button
                                      onClick={() => taskHandleSubmit(task._id)}
                                      className="bi bi-check2 bg-primary text-white border-0 rounded"
                                    />
                                    <button
                                      data-bs-toggle="modal"
                                      data-bs-target="#dremovetask"
                                      onClick={() => setDeletableId(task._id)}
                                      className="bi bi-trash bg-danger text-white border-0 rounded"
                                    />
                                  </div>
                                </td>
                                <td style={{ backgroundColor }} className="">
                                  {task.taskStatus === 'Not Started' && (
                                    <span className="badge bg-warning text-dark">Not Started</span>
                                  )}
                                  {task.taskStatus === 'In Progress' && (
                                    <span className="badge bg-info text-dark">In Progress</span>
                                  )}
                                  {task.taskStatus === 'Completed' && (
                                    <span className="badge bg-success">Completed</span>
                                  )}

                                  <button
                                    className="btn btn-sm position-relative"
                                    data-bs-toggle="modal"
                                    data-bs-target="#taskMessage"
                                    onClick={() => handleOpenMessages(task)}
                                  >
                                    <i className="bi bi-chat-left-dots"></i>
                                    {notifications[task._id] > 0 && (
                                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                        {notifications[task._id]}
                                      </span>
                                    )}
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>



                    </table>
                  </div>
                ) : (
                  <div className="row">
                    {currentTasks.map((task, index) => {
                      const currentDate = new Date();
                      const taskEndDate = new Date(task.taskEndDate);
                      const isOverdue = taskEndDate < currentDate && task.taskStatus !== 'Completed';

                      let backgroundColor = '';
                      if (isOverdue) {
                        backgroundColor = '#f6c8b7';
                      }

                      return (
                        <div key={task._id} className="col-12 col-sm-6 col-md-4 col-lg-4 mb-4">
                          <div className="card task-card h-100" style={{ backgroundColor }}>
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="fw-bold fs-6">{index + 1}. </span>
                                <h5 className="fw-bold mb-0">{task.projectName}</h5>

                                <Link
                                  to="/images"
                                  state={{
                                    images: task.taskImages,
                                    projectName: task.projectName,
                                  }}
                                >
                                  <i className="bi-paperclip fs-6" />
                                </Link>
                              </div>
                              <input
                                className="form-control"
                                type="text"
                                name="taskTitle"
                                placeholder="Task Title"
                                value={task.taskTitle}
                                onChange={(e) => taskHandleChange(e, task._id)}
                                style={{
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  fontWeight: 'bold',
                                  width: '80%'
                                }}
                              />
                              <textarea
                                className="form-control mb-2"
                                rows="3"
                                name="description"
                                value={task.description}
                                onChange={(e) => taskHandleChange(e, task._id)}
                                style={{ resize: 'none' }}
                              />
                              <p className="mb-1">Assigned to: {task.taskAssignPerson && task.taskAssignPerson.employeeName ? task.taskAssignPerson.employeeName : 'Unassigned'}</p>
                              <p className="mb-1">By: {task.assignedBy}</p>
                              <input
                                type="date"
                                className="form-control mb-2"
                                name="taskEndDate"
                                value={task.taskEndDate}
                                onChange={(e) => taskHandleChange(e, task._id)}
                              />
                              <select
                                className="form-select mb-2"
                                name="taskPriority"
                                value={task.taskPriority}
                                onChange={(e) => taskHandleChange(e, task._id)}
                              >
                                <option value="">Set Priority</option>
                                <option value="Highest">Highest</option>
                                <option value="Medium">Medium</option>
                                <option value="Lowest">Lowest</option>
                              </select>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <button
                                  onClick={() => taskHandleSubmit(task._id)}
                                  className="btn btn-sm btn-primary"
                                >
                                  <i className="bi bi-check2"></i> Update
                                </button>
                                <button
                                  data-bs-toggle="modal"
                                  data-bs-target="#dremovetask"
                                  onClick={() => setDeletableId(task._id)}
                                  className="btn btn-sm btn-danger text-white"
                                >
                                  <i className="bi bi-trash"></i> Delete
                                </button>
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                {task.taskStatus === 'Not Started' && (
                                  <span className="badge bg-warning text-dark">Not Started</span>
                                )}
                                {task.taskStatus === 'In Progress' && (
                                  <span className="badge bg-info text-dark">In Progress</span>
                                )}
                                {task.taskStatus === 'Completed' && (
                                  <span className="badge bg-success">Completed</span>
                                )}
                                <button
                                  className="btn btn-sm position-relative"
                                  data-bs-toggle="modal"
                                  data-bs-target="#taskMessage"
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
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination controls */}
                <div className="row mt-3">
                  <div className="col-12 col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <label htmlFor="tasksPerPage" className="form-label me-2 mb-0">Tasks per page:</label>
                      <select
                        id="tasksPerPage"
                        className="form-select"
                        style={{ width: 'auto' }}
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
                  </div>
                  <div className="col-12 col-md-6">
                    <nav aria-label="Page navigation">
                      <ul className="pagination justify-content-md-end">
                        <li className="page-item">
                          <button onClick={prevPage} className="page-link" disabled={currentPage === 1}>
                            &laquo;
                          </button>
                        </li>
                        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
                          <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                            <button onClick={() => paginate(page)} className="page-link bg-white">
                              {page}
                            </button>
                          </li>
                        ))}
                        {endPage < totalPages && (
                          <li className="page-item">
                            <button onClick={() => paginate(endPage + 1)} className="page-link">
                              &raquo;
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
              {/* Create task */}
              <div
                className="modal fade"
                id="createtask"
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
                        Create Task
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
                        <label className="form-label">Project Name <span className="text-danger">*</span></label>
                        {/* <Select
                          className="form-control"
                          styles={customStyles}
                          options={projectOptions}
                          placeholder="Search and select project"
                          onChange={(selectedOption) => {
                            setFormData({
                              ...formData,
                              projectName: selectedOption.value
                            });
                          }}
                          value={projectOptions.find(option => option.value === formData.projectName)}
                        /> */}
                        <select
                          className="form-select"
                          placeholder="Add Category"
                          aria-label="Default select Project Category"
                          name="projectName"
                          value={formData.projectName}
                          onChange={handleChange}
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
                      {/* <div className="mb-3">
                        <label className="form-label">Task Category</label>
                        <select
                          className="form-select"
                          placeholder="Add Category"
                          aria-label="Default select Project Category"
                          name="taskCategory"
                          value={formData.taskCategory}
                          onChange={handleChange}
                        >
                          <option selected="Add Category">Add Category</option>
                          <option value={"UI/UX Design"}>UI/UX Design</option>
                          <option value={"Website Developement"}>
                            Website Developement
                          </option>
                          <option value={"App Development"}>
                            App Development
                          </option>
                          <option value={"Digital Marketing"}>
                            Digital Marketing
                          </option>
                        </select>
                      </div> */}
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
                          multiple
                          name="taskImages"
                          onChange={handleChange}
                        />
                      </div>
                      <div className="deadline-form mb-3">
                        <form>
                          <div className="row">
                            {/* <div className="col">
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
                                value={formData.taskStartDate}
                                onChange={handleChange}
                              />
                            </div> */}
                            <div className="col">
                              <label
                                htmlFor="datepickerdedone"
                                className="form-label"
                              >
                                Task End Date <span className="text-danger">*</span>
                              </label>
                              <input
                                type="date"
                                className="form-control"
                                id="datepickerdedone"
                                name="taskEndDate"
                                value={formData.taskEndDate}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </form>
                      </div>
                      <div className="row g-3 mb-3">
                        <div className="col-sm">
                          <label className="form-label">
                            Task Assign Person <span className="text-danger">*</span>
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
                            value={formData.taskPriority}
                            onChange={handleChange}
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
                        <label className="form-label">Task Title <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter Task Title"
                          name="taskTitle"
                          value={formData.taskTitle}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleFormControlTextarea786"
                          className="form-label"
                        >
                          Task Name <span className="text-danger">*</span>
                        </label>
                        <textarea
                          className="form-control"
                          id="exampleFormControlTextarea786"
                          rows={3}
                          placeholder="Explain The Task What To Do & How To Do"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
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
                        className="btn btn-primary"
                        data-bs-dismiss="modal"
                        onClick={handleSubmit}
                      >
                        Create
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
                        className="btn btn-primary"
                        onClick={taskHandleSubmit}
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Message Modal */}
              <div className="modal fade" id="taskMessage" tabIndex={-1} aria-labelledby="taskMessageLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="taskMessageLabel">{selectTask.projectName} - Task Messages</h5>
                      <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }} ref={messageContainerRef}>
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
                                    } else if (fileExtension === 'pdf') {
                                      return (
                                        <div key={index} className="px-3">
                                          <a href={cleanFileUrl} target="_blank" rel="noopener noreferrer" className="">PDF File</a>
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
                              <p className="text-muted" style={{ marginTop: "-0.5rem", marginLeft: "1rem" }}>{new Date(message.createdAt).toLocaleString()}</p>
                            </div>
                          </li>
                        ))}
                      </ul>

                      {/* Message Submission Form */}
                      <form onSubmit={handleSubmitMessage}>
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
                        <button type="submit" className="btn btn-dark">Submit</button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </>
          </>
        </div>
        <ToastContainer />
        <FloatingMenu userType="admin" isMobile={isMobile} />
      </div >
    </>
  );
};

export default Tasks;