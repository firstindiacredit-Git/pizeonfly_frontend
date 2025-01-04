import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import io from 'socket.io-client';
import { MultiSelect } from "react-multi-select-component";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Loading.css";
import FloatingMenu from '../Chats/FloatingMenu'

const Project = () => {
  const [projects, setProjects] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(true);
  const [currProj, setCurrProj] = useState({});
  const [viewMode, setViewMode] = useState('row');
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState(() => {
    const savedNotifications = localStorage.getItem('projectNotifications');
    return savedNotifications ? JSON.parse(savedNotifications) : {};
  });

  // CREATE PROJECT
  const [formData, setFormData] = useState({
    projectName: "",
    projectCategory: "",
    projectImage: null,
    projectStartDate: "",
    projectEndDate: "",
    taskAssignPerson: "",
    description: "",
    clientAssignPerson: "",
    backgroundColor: "#ffffff",
    projectIcon: null,
  });
  const [error, setError] = useState("");
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'projectIcon') {
      setFormData({
        ...formData,
        projectIcon: files[0],
      });
    } else if (name === 'projectImage') {
      setFormData({
        ...formData,
        projectImage: files,
      });
    }
  };
  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();

      // Append all the basic fields
      Object.keys(formData).forEach(key => {
        if (key !== 'projectImage' && key !== 'projectIcon') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append project icon if exists
      if (formData.projectIcon) {
        formDataToSend.append('projectIcon', formData.projectIcon);
      }

      // Append project images if they exist
      if (formData.projectImage) {
        Array.from(formData.projectImage).forEach(file => {
          formDataToSend.append('projectImage', file);
        });
      }

      for (let obj of selectedEmployees) {
        formDataToSend.append("taskAssignPerson", obj.value);
      }
      // Add clients assignees
      for (let obj of selectedClients) {
        formDataToSend.append("clientAssignPerson", obj.value);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/projects`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // console.log(response.data);

      // Assuming the response contains the new project data
      const newProject = response.data;

      // Update the projects state
      setProjects((prevProjects) => [newProject, ...prevProjects]);
      // Clear the form data
      setFormData({
        projectName: "",
        projectCategory: "",
        projectImage: null,
        projectStartDate: "",
        projectEndDate: "",
        taskAssignPerson: "",
        description: "",
        clientAssignPerson: "",
        backgroundColor: "#ffffff",
        projectIcon: null,
      });

      // Close the modal programmatically
      const modalElement = document.getElementById("createproject");
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      modal.hide();

      toast.success("Project Created Successfully!", {
        style: {
          backgroundColor: "#0d6efd",
          color: "white",
        },
      });
      // Reload the page after 5 seconds
      setTimeout(() => {
        window.location.reload();
      }, 5000);

      console.log(response);
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred. Please try again later.");
    }
  };

  // GET ALL PROJECTS
  const [selectProject, setSelectProject] = useState({});
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const location = useLocation();
  const navigate = useNavigate();
  const [filteredEmployeeName, setFilteredEmployeeName] = useState(null);

  useEffect(() => {
    const employeeNameFromState = location.state?.employeeName;
    const employeeNameFromStorage = localStorage.getItem('filteredEmployeeName');

    if (employeeNameFromState) {
      setFilteredEmployeeName(employeeNameFromState);
      localStorage.setItem('filteredEmployeeName', employeeNameFromState);
    } else if (employeeNameFromStorage) {
      setFilteredEmployeeName(employeeNameFromStorage);
    }

    fetchProjects();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [filteredEmployeeName]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}api/projects`
      );

      let projectsData = response.data;

      if (filteredEmployeeName) {
        projectsData = projectsData.filter(project =>
          project.taskAssignPerson.some(person => person.employeeName === filteredEmployeeName)
        );
      }

      const sortedProjects = projectsData.sort(
        (a, b) => new Date(b.projectDate) - new Date(a.projectDate)
      );

      setProjects(sortedProjects);
      setFilteredProjects(sortedProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilter = () => {
    setFilteredEmployeeName(null);
    localStorage.removeItem('filteredEmployeeName');
    navigate('/projects', { replace: true });
  };

  useEffect(() => {
    filterProjects();
  }, [activeTab, projects, searchTerm]);
  const filterProjects = () => {
    let filtered = projects;

    // Filter by active tab
    if (activeTab === "Completed") {
      filtered = filtered.filter((project) => project.status === "Completed");
    } else if (activeTab === "In Progress") {
      filtered = filtered.filter((project) => project.status === "In Progress");
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((project) =>
        (project.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (project.clientAssignPerson?.some(client => client?.clientName?.toLowerCase().includes(searchTerm.toLowerCase())) || false) ||
        (project.projectDate?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (project.projectStartDate?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (project.projectEndDate?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (project.taskAssignPerson?.some(member => member?.employeeName?.toLowerCase().includes(searchTerm.toLowerCase())) || false) ||
        (project.progress?.toString().includes(searchTerm) || false)
      );
    }

    setFilteredProjects(filtered);
  };

  // Add this function to handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  //DELETE PROJECT
  const [deletableId, setDeletableId] = useState("");
  const handleDeleteProject = async () => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}api/projects/${deletableId}`
      );
      // console.log(response.data);

      const remainingProjects = projects.filter((prevProjects) => {
        return prevProjects._id !== deletableId;
      });
      // console.log(remainingProjects);
      setProjects(remainingProjects);
      // Hide the modal
      const modalElement = document.getElementById("deleteproject");
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      modal.hide();

      toast.error("Project Deleted Successfully!", {
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

  //UPDATE PROJECT
  const [projectFormData, setProjectFormData] = useState({
    projectName: "",
    projectCategory: "",
    projectImage: null,
    projectStartDate: "",
    projectEndDate: "",
    taskAssignPerson: "",
    clientAssignPerson: "", // Add this line
    description: "",
    backgroundColor: "#ffffff",
    projectIcon: null,
  });
  const [toEdit, setToEdit] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}api/projects/${toEdit}`
        );
        const { data } = response;
        let formattedDate = "";
        const fDate = (data) => {
          const sd = new Date(data);
          const sy = sd.getFullYear();
          const sm =
            sd.getMonth() + 1 < 10
              ? "0" + (Number(sd.getMonth()) + 1)
              : sd.getMonth();
          const sdd = sd.getDate() < 10 ? "0" + sd.getDate() : sd.getDate();
          formattedDate = `${sy}-${sm}-${sdd}`;
          return formattedDate;
        };
        const fStartDate = fDate(data.projectStartDate);
        const fEndDate = fDate(data.projectEndDate);
        // console.log(fStartDate);
        setProjectFormData({
          projectName: data.projectName,
          projectCategory: data.projectCategory,
          projectImage: data.projectImage,
          projectStartDate: fStartDate,
          projectEndDate: fEndDate,
          taskAssignPerson: data.taskAssignPerson,
          clientAssignPerson: data.clientAssignPerson, // Add this line
          description: data.description,
          backgroundColor: data.backgroundColor,
          projectIcon: data.projectIcon,
        });

        // console.log();

        // startDateEdit = formattedDate;

        const selectedEmp = data.taskAssignPerson?.map((o) => {
          return {
            label: o.employeeName,
            value: o._id,
          };
        });
        setSelectedEmployees(selectedEmp);
        // console.log(selectedEmp);

        // Add this block for selectedClients
        const selectedCli = data.clientAssignPerson?.map((c) => {
          return {
            label: c.clientName,
            value: c._id,
          };
        });
        setSelectedClients(selectedCli);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (toEdit) {
      fetchData();
    }
  }, [toEdit]);
  const projectHandleChange = (e) => {
    const { name, value, files } = e.target;
    // console.log(value);
    setProjectFormData((prevState) => ({
      ...prevState,
      [name]: files ? files[0] : value,
    }));
  };
  const projectHandleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      delete projectFormData?.taskAssignPerson;
      delete projectFormData?.clientAssignPerson;
      for (const key in projectFormData) {
        formDataToSend.append(key, projectFormData[key]);
      }
      for (let obj of selectedEmployees) {
        formDataToSend.append("taskAssignPerson", obj.value);
      }
      for (let obj of selectedClients) {
        formDataToSend.append("clientAssignPerson", obj.value);
      }

      // Log the data being sent
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}api/projects/${toEdit}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Close the modal programmatically
      const modalElement = document.getElementById("editproject");
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      modal.hide();

      toast.success("Project Updated Successfully!", {
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



  //get employee
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}api/employees`
        );
        setEmployees(response.data);
        // console.log(response.data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []);
  // console.log(selectedEmployees);
  const assignEmployee = employees?.map((emp) => {
    return {
      label: emp.employeeName,
      value: emp._id,
    };
  });

  //get client
  const [clients, setClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/clients`);
        console.log(response.data);

        setClients(response.data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    fetchClients();
  }, []);
  const assignClient = clients?.map((client) => {
    return {
      label: client.clientName,
      value: client._id,
    };
  });



  //GET TASK
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}api/tasks`
        );
        setTasks(response.data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchTasks();
  }, []);
  // console.log(tasks);



  const [role, setRole] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setRole(user.role);
    }
  }, []);


  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]); // State for multiple file uploads

  const fetchProjectMessages = async (projectId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/messages/${projectId}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(`${import.meta.env.VITE_BASE_URL}`);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => newSocket.close();
  }, []);

  // Add this state near your other state declarations
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  // Update the socket effect to save notifications to localStorage
  useEffect(() => {
    if (socket == null) return;

    const handleNewMessage = (message) => {
      console.log('New message received:', message);
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
      console.log('New notification received:', notification);
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
    if (socket == null || projects.length === 0) return;

    projects.forEach(project => {
      console.log(`Joining room for project: ${project._id}`);
      socket.emit('join project', project._id);
    });

    return () => {
      projects.forEach(project => {
        console.log(`Leaving room for project: ${project._id}`);
        socket.emit('leave project', project._id);
      });
    };
  }, [socket, projects]);

  const messageSubmit = async (e) => {
    e.preventDefault();
    const userDetails = JSON.parse(localStorage.getItem('user'));
    const senderId = userDetails.username;

    const formData = new FormData();
    formData.append('content', content);
    formData.append('senderId', senderId);
    formData.append('projectId', selectProject._id);

    for (let file of files) {
      formData.append('files', file);
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}api/projectMessage`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Clear the form and files
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

  // Handle file selection
  const messageFileChange = (e) => {
    setFiles(Array.from(e.target.files)); // Set selected files
  };


  useEffect(() => {
    if (selectProject._id) {
      // fetchProjectMessages(selectProject._id);
      const interval = setInterval(() => {
        fetchProjectMessages(selectProject._id); // Polling every 5 seconds
      }, 1000);

      return () => clearInterval(interval); // Clean up interval on component unmount
    }
  }, [selectProject, isChatModalOpen]); // Add isChatModalOpen as dependency

  const messageInputRef = useRef(null);

  // Update handleOpenMessages to clear notifications only when explicitly opening the chat
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

  // Add effect to handle modal close events
  useEffect(() => {
    const modalElement = document.getElementById('addUser');
    if (modalElement) {
      modalElement.addEventListener('hidden.bs.modal', () => {
        setIsChatModalOpen(false);
      });
    }
  }, []);

  const ProjectProgressBar = ({ project }) => {
    const total = project.totalTasks;
    const completed = project.taskStats.completed;
    const inProgress = project.taskStats.inProgress;
    const notStarted = project.taskStats.notStarted;

    // Calculate percentages
    const completedPercent = total ? ((completed / total) * 100).toFixed(1) : 0;
    const inProgressPercent = total ? ((inProgress / total) * 100).toFixed(1) : 0;
    const notStartedPercent = total ? ((notStarted / total) * 100).toFixed(1) : 0;

    return (
      <div className="project-progress mb-3">
        <div className="d-flex justify-content-between mb-1">
          <span className="fw-bold">Task Progress</span>
          <span className="fw-bold">{total} Total Tasks</span>
        </div>
        <div className="progress" style={{ height: "20px" }}>
          <div
            className="progress-bar bg-success"
            style={{ width: `${completedPercent}%` }}
            title={`Completed: ${completed} (${completedPercent}%)`}
          >
            {completed}
          </div>
          <div
            className="progress-bar bg-primary"
            style={{ width: `${inProgressPercent}%` }}
            title={`In Progress: ${inProgress} (${inProgressPercent}%)`}
          >
            {inProgress}
          </div>
          <div
            className="progress-bar bg-danger"
            style={{ width: `${notStartedPercent}%` }}
            title={`Not Started: ${notStarted} (${notStartedPercent}%)`}
          >
            {notStarted}
          </div>
        </div>
        <div className="d-flex justify-content-between mt-2 small">
          <div>
            <span className="text-success fw-bold">Completed:{completed} </span>
            {/* <span className="d-flex justify-content-center"> ({completedPercent}%)</span> */}
          </div>
          <div>
            <span className="text-primary fw-bold">In Progress: {inProgress}</span>
            {/* <span className="d-flex justify-content-center"> ({inProgressPercent}%)</span> */}
          </div>
          <div>
            <span className="text-danger fw-bold">Not Started: {notStarted}</span>
            {/* <span className="d-flex justify-content-center"> ({notStartedPercent}%)</span> */}
          </div>
        </div>
      </div>
    );
  };

  const EmployeeTaskProgress = ({ employee }) => {
    const total = employee.totalTasks;
    const completed = employee.completed;
    const inProgress = employee.inProgress;
    const notStarted = employee.notStarted;

    // Calculate percentages
    const completedPercent = total ? ((completed / total) * 100).toFixed(1) : 0;
    const inProgressPercent = total ? ((inProgress / total) * 100).toFixed(1) : 0;
    const notStartedPercent = total ? ((notStarted / total) * 100).toFixed(1) : 0;

    return (
      <div className="employee-progress">
        {/* <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-bold">{employee.employeeName}</span>
          <span className="small text-muted">{total} Tasks</span>
        </div> */}
        <div className="progress" style={{ height: "15px" }}>
          {completed > 0 && (
            <div
              className="progress-bar bg-success"
              style={{ width: `${completedPercent}%` }}
              title={`Completed: ${completed} (${completedPercent}%)`}
            >
              {completed}
            </div>
          )}
          {inProgress > 0 && (
            <div
              className="progress-bar bg-primary"
              style={{ width: `${inProgressPercent}%` }}
              title={`In Progress: ${inProgress} (${inProgressPercent}%)`}
            >
              {inProgress}
            </div>
          )}
          {notStarted > 0 && (
            <div
              className="progress-bar bg-secondary"
              style={{ width: `${notStartedPercent}%` }}
              title={`Not Started: ${notStarted} (${notStartedPercent}%)`}
            >
              {notStarted}
            </div>
          )}
        </div>
        {/* <div className="d-flex justify-content-between mt-1 small">
          <span className="text-success">Done: {completed} ({completedPercent}%)</span>
          <span className="text-primary">In Progress: {inProgress} ({inProgressPercent}%)</span>
          <span className="text-secondary">Not Started: {notStarted} ({notStartedPercent}%)</span>
        </div> */}
      </div>
    );
  };

  const getContrastColor = (hexcolor) => {
    const r = parseInt(hexcolor.slice(1, 3), 16);
    const g = parseInt(hexcolor.slice(3, 5), 16);
    const b = parseInt(hexcolor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  // Add these state declarations for the image modal
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImageTitle, setSelectedImageTitle] = useState('');

  // Add these state declarations near your other state declarations
  const [selectedProjectImages, setSelectedProjectImages] = useState([]);
  const [selectedProjectName, setSelectedProjectName] = useState('');

  // Add this function to handle opening the project images modal
  const handleOpenProjectImages = (project) => {
    setSelectedProjectImages(project.projectImage);
    setSelectedProjectName(project.projectName);
    const modal = new bootstrap.Modal(document.getElementById('projectImagesModal'));
    modal.show();
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
                  <div className="border-bottom mb-4">
                    <div className="card-header py-3 px-0 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between border-bottom">
                      <h3 className="fw-bold flex-fill mb-2 mb-sm-0">Projects</h3>
                      <div className="d-flex flex-column flex-sm-row align-items-center">
                        {/* {role === 'superadmin' && ( */}
                        <button
                          type="button"
                          className="btn btn-dark mb-2 mb-sm-0 me-sm-2"
                          data-bs-toggle="modal"
                          data-bs-target="#createproject"
                        >
                          <i className="icofont-plus-circle me-1" />
                          Create Project
                        </button>
                        {/* )} */}
                        <ul
                          className="nav nav-tabs tab-body-header rounded prtab-set"
                          role="tablist"
                        >
                          <li className="nav-item">
                            <a
                              className={`nav-link ${activeTab === "All" ? "active" : ""}`}
                              onClick={() => setActiveTab("All")}
                              data-bs-toggle="tab"
                              href="#All-list"
                              role="tab"
                            >
                              All
                            </a>
                          </li>
                          <li className="nav-item">
                            <a
                              className={`nav-link ${activeTab === "In Progress" ? "active" : ""}`}
                              onClick={() => setActiveTab("In Progress")}
                              data-bs-toggle="tab"
                              href="#Started-list"
                              role="tab"
                            >
                              In Progress
                            </a>
                          </li>
                          <li className="nav-item">
                            <a
                              className={`nav-link ${activeTab === "Completed" ? "active" : ""}`}
                              onClick={() => setActiveTab("Completed")}
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
                    <div className="d-flex justify-content-between mt-3 mb-3">
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

                      {filteredEmployeeName && (
                        <div className="d-flex justify-content-evenly mt-3 gap-2">
                          <strong className="mt-1">Projects for: {filteredEmployeeName} </strong>
                          <button
                            type="button"
                            className="btn btn-dark btn-set-task"
                            onClick={clearFilter}
                          >
                            Clear Filter
                          </button>
                        </div>
                      )}

                      <div className="order-0 ms-1">
                        <div className="input-group">
                          <input
                            type="search"
                            className="form-control"
                            aria-label="search"
                            aria-describedby="addon-wrapping"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={handleSearch}
                          />
                          <button
                            type="button"
                            className="input-group-text"
                            id="addon-wrapping"
                          >
                            <i className="fa fa-search" />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>{" "}
                {/* Row end  */}
                {loading ? (
                  <div className="custom-loader "></div>
                ) : (
                  <div className="row g-3 mb-3 row-deck">
                    <div className="col-md-12">
                      {viewMode === "list" ? (
                        <div className="card mb-3">
                          <div className="card-body">
                            {/* Desktop view - remains unchanged */}
                            <table className="table table-hover align-middle mb-0 d-none d-md-table" style={{ width: "100%" }}>
                              <thead>
                                <tr>
                                  <th>Sr.No.</th>
                                  <th>Project Name</th>
                                  <th style={{ width: "6rem" }}>Clients</th>
                                  <th>Start Date</th>
                                  <th>End Date</th>
                                  <th>Members</th>
                                  <th>Progress</th>
                                  <th>Edit</th>
                                  <th>Delete</th>
                                  <th>Message</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredProjects.map((project, index) => {
                                  const getFormattedDate = (date, includeTime = false) => {
                                    const newDate = new Date(date);
                                    let day = newDate.getDate();
                                    let month = newDate.getMonth() + 1;
                                    const year = newDate.getFullYear();

                                    // Adding leading zero to day and month if necessary
                                    if (day < 10) {
                                      day = "0" + day;
                                    }
                                    if (month < 10) {
                                      month = "0" + month;
                                    }

                                    if (includeTime) {
                                      let hour = newDate.getHours();
                                      let min = newDate.getMinutes();
                                      let period = "AM";

                                      // Convert hours to 12-hour format
                                      if (hour === 0) {
                                        hour = 12;
                                      } else if (hour >= 12) {
                                        period = "PM";
                                        if (hour > 12) {
                                          hour -= 12;
                                        }
                                      }

                                      // Adding leading zero to minutes if necessary
                                      if (min < 10) {
                                        min = "0" + min;
                                      }

                                      return `${day}/${month}/${year} (${hour}:${min} ${period})`;
                                    }

                                    return `${day}/${month}/${year}`;
                                  };

                                  return (
                                    <tr key={project.id}
                                    >
                                      <td><span className="fw-bold fs-6">{index + 1}.</span></td>
                                      <td>
                                        <div className="d-flex gap-2">
                                          <div className="d-flex justify-content-between">
                                            {project.projectIcon && (
                                              <img
                                                src={`${import.meta.env.VITE_BASE_URL}${project.projectIcon.replace('uploads/', '')}`}
                                                alt="Project Icon"
                                                className="me-2 rounded-circle"
                                                style={{
                                                  width: '30px',
                                                  height: '30px',
                                                  objectFit: 'cover',
                                                  cursor: 'pointer'
                                                }}
                                                onClick={() => {
                                                  setSelectedImages([project.projectIcon]);
                                                  setSelectedImageTitle(`${project.projectName} Icon`);
                                                  const modal = new bootstrap.Modal(document.getElementById('imagePreviewModal'));
                                                  modal.show();
                                                }}
                                              />
                                            )}
                                            <Link to="/tasks" className="text-capitalize fw-bold" state={{ projectName: project.projectName }}>
                                              {project.projectName}
                                            </Link>

                                            <button
                                              className="btn btn-link"
                                              onClick={() => handleOpenProjectImages(project)}
                                            >
                                              <i className="bi-paperclip fs-6" />
                                            </button>
                                          </div>
                                        </div>
                                        <div className="text-muted">
                                          -{getFormattedDate(project.projectDate, true)}
                                        </div>
                                      </td>
                                      <td>
                                        {project.clientAssignPerson?.map(client => client.clientName + ", ")}
                                      </td>
                                      <td>
                                        {getFormattedDate(project.projectStartDate)}
                                      </td>
                                      <td>
                                        {getFormattedDate(project.projectEndDate)}
                                      </td>
                                      <td>
                                        {project.taskAssignPerson.map(
                                          (name) => name.employeeName + ", "
                                        )}
                                      </td>
                                      <td>
                                        <div className="d-flex justify-content-center">
                                          {project.progress}%
                                        </div>
                                        <div className="progress mt-1" style={{ height: "10px" }}>
                                          <div
                                            className="progress-bar"
                                            role="progressbar"
                                            style={{ width: `${project.progress}%` }}
                                            aria-valuenow={project.progress}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                          ></div>
                                        </div>
                                      </td>
                                      <td>
                                        <button
                                          type=""
                                          onClick={() => setToEdit(project._id)}
                                          className="btn icofont-edit text-success"
                                          data-bs-toggle="modal"
                                          data-bs-target="#editproject"
                                        ></button>
                                      </td>
                                      <td>
                                        <button
                                          type=""
                                          className="btn outline-secondary icofont-ui-delete text-danger "
                                          data-bs-toggle="modal"
                                          data-bs-target="#deleteproject"
                                          onClick={() => {
                                            setDeletableId(project._id);
                                          }}
                                        ></button>
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

                            {/* Mobile view - responsive table */}
                            <div className="d-md-none">
                              <div className="table-responsive">
                                <table className="table table-hover">
                                  <thead>
                                    <tr>
                                      <th>Project</th>
                                      <th>Details</th>
                                      <th>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {filteredProjects.map((project, index) => {
                                      const getFormattedDate = (date, includeTime = false) => {
                                        const newDate = new Date(date);
                                        let day = newDate.getDate();
                                        let month = newDate.getMonth() + 1;
                                        const year = newDate.getFullYear();

                                        // Adding leading zero to day and month if necessary
                                        if (day < 10) {
                                          day = "0" + day;
                                        }
                                        if (month < 10) {
                                          month = "0" + month;
                                        }

                                        if (includeTime) {
                                          let hour = newDate.getHours();
                                          let min = newDate.getMinutes();
                                          let period = "AM";

                                          // Convert hours to 12-hour format
                                          if (hour === 0) {
                                            hour = 12;
                                          } else if (hour >= 12) {
                                            period = "PM";
                                            if (hour > 12) {
                                              hour -= 12;
                                            }
                                          }

                                          // Adding leading zero to minutes if necessary
                                          if (min < 10) {
                                            min = "0" + min;
                                          }

                                          return `${day}/${month}/${year} (${hour}:${min} ${period})`;
                                        }

                                        return `${day}/${month}/${year}`;
                                      };

                                      return (
                                        <tr key={project.id}>
                                          <td>
                                            <strong >{index + 1}. {project.projectName}</strong>
                                            <br />
                                            <small>{getFormattedDate(project.projectDate, true)}</small>
                                          </td>
                                          <td>
                                            <small>
                                              <strong>Clients:</strong> {project.clientAssignPerson?.map(client => client.clientName).join(", ")}<br />
                                              <strong>Start:</strong> {getFormattedDate(project.projectStartDate)}<br />
                                              <strong>End:</strong> {getFormattedDate(project.projectEndDate)}<br />
                                              <strong>Members:</strong> {project.taskAssignPerson.map(name => name.employeeName).join(", ")}<br />
                                              <strong>Progress:</strong> {project.progress}%
                                            </small>
                                            <div className="progress mt-1" style={{ height: "10px" }}>
                                              <div
                                                className="progress-bar"
                                                role="progressbar"
                                                style={{ width: `${project.progress}%` }}
                                                aria-valuenow={project.progress}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                              ></div>
                                            </div>
                                          </td>
                                          <td>
                                            <div className="btn-group-vertical btn-group-sm" role="group">
                                              <button
                                                type="button"
                                                onClick={() => setToEdit(project._id)}
                                                className="btn btn-outline-secondary"
                                                data-bs-toggle="modal"
                                                data-bs-target="#editproject"
                                              >
                                                <i className="icofont-edit text-success"></i>
                                              </button>
                                              <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                data-bs-toggle="modal"
                                                data-bs-target="#deleteproject"
                                                onClick={() => setDeletableId(project._id)}
                                              >
                                                <i className="icofont-ui-delete text-danger"></i>
                                              </button>
                                              <button
                                                className="btn btn-outline-secondary position-relative"
                                                data-bs-toggle="modal"
                                                data-bs-target="#addUser"
                                                type="button"
                                                onClick={() => handleOpenMessages(project)}
                                              >
                                                <i className="bi bi-chat-left-dots text-primary"></i>
                                                {notifications[project._id] > 0 && (
                                                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                                    {notifications[project._id]}
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
                        </div>
                      ) : (
                        <div className="row">
                          {filteredProjects.map((project, index) => {
                            const getFormattedDate = (date, includeTime = false) => {
                              const newDate = new Date(date);
                              let day = newDate.getDate();
                              let month = newDate.getMonth() + 1;
                              const year = newDate.getFullYear();

                              // Adding leading zero to day and month if necessary
                              if (day < 10) {
                                day = "0" + day;
                              }
                              if (month < 10) {
                                month = "0" + month;
                              }

                              if (includeTime) {
                                let hour = newDate.getHours();
                                let min = newDate.getMinutes();
                                let period = "AM";

                                // Convert hours to 12-hour format
                                if (hour === 0) {
                                  hour = 12;
                                } else if (hour >= 12) {
                                  period = "PM";
                                  if (hour > 12) {
                                    hour -= 12;
                                  }
                                }

                                // Adding leading zero to minutes if necessary
                                if (min < 10) {
                                  min = "0" + min;
                                }

                                return `${day}/${month}/${year} ${hour}:${min} ${period}`;
                              }

                              return `${day}/${month}/${year}`;
                            };
                            return (

                              <div className="col-md-4" key={project.id}>
                                <div
                                  className="card mt-4 task-card"
                                  style={{
                                    backgroundColor: project.backgroundColor || '#ffffff',
                                    color: project.backgroundColor ? getContrastColor(project.backgroundColor) : 'inherit',
                                    height: '470px' // Fixed height for the card
                                  }}
                                >
                                  <div className="card-body d-flex flex-column">
                                    <div className="d-flex justify-content-between">
                                      <span className="fw-bold fs-5">{index + 1}. </span>

                                      <div className="d-flex">
                                        {project.projectIcon && (
                                          <img
                                            src={`${import.meta.env.VITE_BASE_URL}${project.projectIcon.replace('uploads/', '')}`}
                                            alt="Project Icon"
                                            className="me-2 rounded-circle"
                                            style={{
                                              width: '30px',
                                              height: '30px',
                                              objectFit: 'cover',
                                              cursor: 'pointer'
                                            }}
                                            onClick={() => {
                                              setSelectedImages([project.projectIcon]);
                                              setSelectedImageTitle(`${project.projectName} Icon`);
                                              const modal = new bootstrap.Modal(document.getElementById('imagePreviewModal'));
                                              modal.show();
                                            }}
                                          />
                                        )}
                                        <h5 className="card-title text-capitalize fw-bold">
                                          <Link to="/tasks" state={{ projectName: project.projectName }}>
                                            {project.projectName}
                                          </Link>
                                        </h5>
                                      </div>

                                      {project.projectImage && project.projectImage.length > 0 && (
                                        <button
                                          className="btn btn-link"
                                          onClick={() => handleOpenProjectImages(project)}
                                        >
                                          <i className="bi-paperclip fs-6" />
                                        </button>
                                      )}
                                    </div>

                                    <div className="">
                                      <div className="d-flex justify-content-between">
                                        <span className="text-muted fw-bold">Start: {getFormattedDate(project.projectStartDate)}</span>
                                        <span className="text-muted fw-bold">End: {getFormattedDate(project.projectEndDate)}</span>
                                      </div>

                                      <div className="mt-1">
                                        <strong>Members:</strong>
                                        <div
                                          className="ms-2 members-list"
                                          style={{
                                            height: '110px',
                                            overflowY: 'auto',
                                            scrollbarWidth: 'none',  // Hide scrollbar in Firefox
                                            msOverflowStyle: 'none',  // Hide scrollbar in IE/Edge
                                            '&::-webkit-scrollbar': {  // Hide scrollbar in Chrome/Safari
                                              display: 'none'
                                            }
                                          }}
                                        >
                                          {project.taskAssignPerson.map((member, idx) => (
                                            <div key={idx} className="mb-2 text-dark">
                                              <div className="d-flex gap-2" style={{ width: '20rem' }}>
                                                <span className="">
                                                  <i className=" bi bi-dot" />
                                                  {member.employeeName}
                                                </span>
                                                <span className="" style={{ width: '13rem' }}>
                                                  {project.memberStats?.find(stat => stat._id === member._id) && (
                                                    <EmployeeTaskProgress
                                                      employee={project.memberStats.find(stat => stat._id === member._id)}
                                                    />
                                                  )}
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      <div className="mt-1">
                                        <strong>Clients:</strong>
                                        <div
                                          className=" clients-list"
                                          style={{
                                            height: '50px',
                                            overflowY: 'auto',
                                            scrollbarWidth: 'none',  // Hide scrollbar in Firefox
                                            msOverflowStyle: 'none',  // Hide scrollbar in IE/Edge
                                            '&::-webkit-scrollbar': {  // Hide scrollbar in Chrome/Safari
                                              display: 'none'
                                            }
                                          }}
                                        >
                                          {project.clientAssignPerson?.map((client, idx) => (
                                            <div key={idx} className="fw-bold text-primary">
                                              <span className="me-1 fw-bold"><i className="bi bi-dot"></i></span> {client.clientName}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="mt-2">
                                      <ProjectProgressBar project={project} />
                                      <div className="d-flex justify-content-between">
                                        <button
                                          onClick={() => setToEdit(project._id)}
                                          className="btn icofont-edit text-success fs-5"
                                          data-bs-toggle="modal"
                                          data-bs-target="#editproject"
                                          title="Edit"
                                        >

                                        </button>
                                        <button
                                          className="btn icofont-ui-delete text-danger fs-5"
                                          data-bs-toggle="modal"
                                          data-bs-target="#deleteproject"
                                          onClick={() => setDeletableId(project._id)}
                                          title="Delete"
                                        >

                                        </button>
                                        <button
                                          className="btn bi bi-chat-left-dots text-primary position-relative fs-5"
                                          data-bs-toggle="modal"
                                          data-bs-target="#addUser"
                                          onClick={() => handleOpenMessages(project)}
                                          title="Message"
                                        >

                                          {notifications[project._id] > 0 && (
                                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                              {notifications[project._id]}
                                            </span>
                                          )}
                                        </button>
                                      </div>
                                      <div className="d-flex justify-content-start text-muted">
                                        {getFormattedDate(project.projectDate, true)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Create Project*/}
            <div
              className="modal fade"
              id="createproject"
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
                      Create Project
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
                      <label
                        htmlFor="exampleFormControlInput77"
                        className="form-label"
                      >
                        Project Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="exampleFormControlInput77"
                        placeholder="Project Name"
                        name="projectName"
                        value={formData.projectName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Project Category <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Project Category"
                        name="projectCategory"
                        value={formData.projectCategory}
                        onChange={handleChange}
                      />
                      <select
                        className="form-select"
                        aria-label="Default select Project Category"
                        name="projectCategory"
                        value={formData.projectCategory}
                        onChange={handleChange}
                      >
                        <option selected="">Add Category</option>
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
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="formFileMultipleone"
                        className="form-label"
                      >
                        Project Images &amp; Document
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        id="formFileMultipleone"
                        multiple
                        name="projectImage"
                        onChange={handleFileChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="projectIcon" className="form-label">
                        Project Icon
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        id="projectIcon"
                        name="projectIcon"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <small className="text-muted">Upload an icon for your project (optional)</small>
                    </div>
                    <div className="deadline-form">
                      <form>
                        <div className="row g-3 mb-3">
                          <div className="col">
                            <label
                              htmlFor="datepickerded"
                              className="form-label"
                            >
                              Project Start Date <span className="text-danger">*</span>
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              id="datepickerded"
                              name="projectStartDate"
                              value={formData.projectStartDate}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="col">
                            <label
                              htmlFor="datepickerdedone"
                              className="form-label"
                            >
                              Project End Date <span className="text-danger">*</span>
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              id="datepickerdedone"
                              name="projectEndDate"
                              value={formData.projectEndDate}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="row g-3 mb-3">
                          <div className="col-sm-12">
                            <label
                              htmlFor="formFileMultipleone"
                              className="form-label"
                            >
                              Project Assign Person <span className="text-danger">*</span>
                            </label>
                            <div>
                              <MultiSelect
                                options={assignEmployee}
                                value={selectedEmployees}
                                onChange={setSelectedEmployees}
                                labelledBy="Select Employees"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="row g-3 mb-3">
                          <div className="col-sm-12">
                            <label className="form-label">
                              Project Assign Client
                            </label>
                            <div>
                              <MultiSelect
                                options={assignClient}
                                value={selectedClients}
                                onChange={setSelectedClients}
                                labelledBy="Select Clients"
                              />
                            </div>
                          </div>
                        </div>

                      </form>
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="exampleFormControlTextarea78"
                        className="form-label"
                      >
                        Description
                      </label>
                      <textarea
                        className="form-control"
                        id="exampleFormControlTextarea78"
                        rows={3}
                        placeholder="Explain The Project What To Do & How To Do"
                        defaultValue={""}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="backgroundColor" className="form-label">
                        Card Color
                      </label>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="color"
                          className="form-control form-control-color"
                          id="backgroundColor"
                          name="backgroundColor"
                          value={formData.backgroundColor}
                          onChange={handleChange}
                          title="Choose card color"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => setFormData({ ...formData, backgroundColor: '#ffffff' })}
                        >
                          Reset Color
                        </button>
                      </div>
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
                      className="btn btn-primary close"
                      data-dismiss="modal"
                      onClick={handleSubmit}
                    >
                      Create
                    </button>
                  </div>
                  {error && <p>{error}</p>}
                </div>
              </div>
            </div>

            {/* Update Project*/}
            <div
              className="modal fade"
              id="editproject"
              tabIndex={-1}
              aria-hidden="true"
            >
              <div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title  fw-bold" id="editprojectLabel">
                      {" "}
                      Edit Project
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
                      <label
                        htmlFor="exampleFormControlInput78"
                        className="form-label"
                      >
                        Project Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="exampleFormControlInput78"
                        placeholder="Project Name"
                        name="projectName"
                        value={projectFormData.projectName}
                        onChange={projectHandleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Project Category</label>
                      <select
                        className="form-select"
                        aria-label="Default select example"
                        name="projectCategory"
                        value={projectFormData.projectCategory}
                        onChange={projectHandleChange}
                      >
                        <option selected=""></option>
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
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="formFileMultiple456"
                        className="form-label"
                      >
                        Project Images &amp; Document
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        id="formFileMultiple456"
                        name="projectImages"
                        onChange={handleFileChange}
                      />
                    </div>
                    <div className="deadline-form">
                      <form>
                        <div className="row g-3 mb-3">
                          <div className="col">
                            <label
                              htmlFor="datepickerded123"
                              className="form-label"
                            >
                              Project Start Date
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              id="datepickerded123"
                              name="projectStartDate"
                              value={projectFormData.projectStartDate}
                              onChange={projectHandleChange}
                            />
                          </div>
                          <div className="col">
                            <label
                              htmlFor="datepickerded456"
                              className="form-label"
                            >
                              Project End Date
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              id="datepickerded456"
                              name="projectEndDate"
                              value={projectFormData.projectEndDate}
                              onChange={projectHandleChange}
                            />
                          </div>
                        </div>
                        <div className="row g-3 mb-3">
                          <div className="col-sm-12">
                            <label
                              htmlFor="formFileMultipleone"
                              className="form-label"
                            >
                              Task Assign Person
                            </label>
                            <div>
                              <MultiSelect
                                options={assignEmployee}
                                value={selectedEmployees}
                                onChange={setSelectedEmployees}
                                labelledBy="Select Employees"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="row g-3 mb-3">
                          <div className="col-sm-12">
                            <label className="form-label">
                              Project Assign Client
                            </label>
                            <div>
                              <MultiSelect
                                options={assignClient}
                                value={selectedClients}
                                onChange={setSelectedClients}
                                labelledBy="Select Clients"
                              />
                            </div>
                          </div>
                        </div>
                      </form>
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
                        placeholder="Enter your task description"
                        name="description"
                        value={projectFormData.description}
                        onChange={projectHandleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="editBackgroundColor" className="form-label">
                        Card Color
                      </label>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="color"
                          className="form-control form-control-color"
                          id="editBackgroundColor"
                          name="backgroundColor"
                          value={projectFormData.backgroundColor || '#ffffff'}
                          onChange={projectHandleChange}
                          title="Choose card color"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => setProjectFormData({ ...projectFormData, backgroundColor: '#ffffff' })}
                        >
                          Reset Color
                        </button>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="editProjectIcon" className="form-label">
                        Project Icon
                      </label>
                      {projectFormData.projectIcon && (
                        <div className="mb-2">
                          <img
                            src={`${import.meta.env.VITE_BASE_URL}${projectFormData.projectIcon}`}
                            alt="Current Icon"
                            style={{
                              width: '40px',
                              height: '40px',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        className="form-control"
                        id="editProjectIcon"
                        name="projectIcon"
                        accept="image/*"
                        onChange={projectHandleChange}
                      />
                      <small className="text-muted">Upload a new icon to replace the current one (optional)</small>
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
                      onClick={projectHandleSubmit}
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal  Delete Folder/ File*/}
            <div
              className="modal fade"
              id="deleteproject"
              tabIndex={-1}
              aria-hidden="true"
            >
              <div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5
                      className="modal-title  fw-bold"
                      id="deleteprojectLabel"
                    >
                      {" "}
                      Delete item Permanently?
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
                      You can only delete this item Permanently
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

            {/* Message Modal */}
            <div className="modal fade" id="addUser" tabIndex={-1} aria-labelledby="addUserLabel" aria-hidden="true" onHide={() => setIsChatModalOpen(false)}>
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="addUserLabel">
                      {selectProject.projectName}
                    </h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setIsChatModalOpen(false)}></button>
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
                                  // Remove 'uploads/' from the file path
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

            {/* Image Preview Modal */}
            <div className="modal fade" id="imagePreviewModal" tabIndex={-1} aria-hidden="true">
              <div className="modal-dialog modal-dialog-centered modal-sm">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{selectedImageTitle}</h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    />
                  </div>
                  <div className="modal-body">
                    <div className="">
                      {selectedImages.map((image, index) => (
                        <div key={index} className=" mb-3">
                          <img
                            src={`${import.meta.env.VITE_BASE_URL}${image.replace('uploads/', '')}`}
                            alt={`Preview ${index + 1}`}
                            className="img-fluid rounded"
                            style={{ cursor: 'pointer' }}
                            onClick={() => window.open(`${import.meta.env.VITE_BASE_URL}${image.replace('uploads/', '')}`, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Images Modal */}
            <div className="modal fade" id="projectImagesModal" tabIndex={-1} aria-hidden="true">
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{selectedProjectName} - Project Images</h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    />
                  </div>
                  <div className="modal-body">
                    <div className="row g-3">
                      {selectedProjectImages.map((image, index) => (
                        <div key={index} className="col-md-4">
                          <div className="card">
                            <img
                              src={`${import.meta.env.VITE_BASE_URL}${image.replace('uploads/', '')}`}
                              alt={`Project Image ${index + 1}`}
                              className="card-img-top"
                              style={{
                                height: '200px',
                                objectFit: 'cover',
                                cursor: 'pointer'
                              }}
                              onClick={() => window.open(`${import.meta.env.VITE_BASE_URL}${image.replace('uploads/', '')}`, '_blank')}
                            />
                            <div className="card-body">
                              <p className="card-text text-center mb-0">Image {index + 1}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </>
        </div>
        <ToastContainer />
        <FloatingMenu userType="admin" isMobile={isMobile} />
      </div >
    </>
  );
};

export default Project;