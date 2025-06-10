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
      const newProject = {
        ...response.data,
        taskStats: response.data.taskStats || { completed: 0, inProgress: 0, notStarted: 0 },
      };
      setProjects((prevProjects) => [newProject, ...prevProjects]);


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
    if (name === 'projectImage') {
      setProjectFormData(prevState => ({
        ...prevState,
        [name]: files
      }));
    } else {
      setProjectFormData(prevState => ({
        ...prevState,
        [name]: files ? files[0] : value
      }));
    }
  };
  const projectHandleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();

      // Add all non-file fields
      Object.keys(projectFormData).forEach(key => {
        if (key !== 'projectImage' && key !== 'projectIcon' && key !== 'taskAssignPerson' && key !== 'clientAssignPerson') {
          formDataToSend.append(key, projectFormData[key]);
        }
      });

      // Add project images if they exist
      if (projectFormData.projectImage) {
        Array.from(projectFormData.projectImage).forEach(file => {
          formDataToSend.append('projectImage', file);
        });
      }

      // Add project icon if it exists
      if (projectFormData.projectIcon instanceof File) {
        formDataToSend.append('projectIcon', projectFormData.projectIcon);
      }

      // Add assignees
      for (let obj of selectedEmployees) {
        formDataToSend.append("taskAssignPerson", obj.value);
      }
      for (let obj of selectedClients) {
        formDataToSend.append("clientAssignPerson", obj.value);
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
    const total = project.totalTasks || 0;
    const completed = project.taskStats.completed || 0;
    const inProgress = project.taskStats.inProgress || 0;
    const notStarted = project.taskStats.notStarted || 0;

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

  // Add state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage, setProjectsPerPage] = useState(10); // Default to 10 projects per page

  // Calculate the index of the last and first project
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Next page
  const nextPage = () => setCurrentPage((prevPage) => Math.min(prevPage + 1, Math.ceil(filteredProjects.length / projectsPerPage)));

  // Previous page
  const prevPage = () => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));

  // Logic for page number chunking (5 page limit)
  const pageLimit = 5;
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const startPage = Math.floor((currentPage - 1) / pageLimit) * pageLimit + 1;
  const endPage = Math.min(startPage + pageLimit - 1, totalPages);

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
                          background: 'linear-gradient(to bottom, #ff8a00, #ff5e00)',
                          borderRadius: '3px'
                        }}></span>
                        Projects
                      </h3>
                      <div className="d-flex flex-column flex-sm-row align-items-center">
                        {/* {role === 'superadmin' && ( */}
                        <button
                          type="button"
                          className="btn mb-3 mb-sm-0 me-sm-3"
                          data-bs-toggle="modal"
                          data-bs-target="#createproject"
                          style={{
                            background: 'linear-gradient(135deg, #52b447, #429938)',
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
                          Create Project
                        </button>
                        {/* )} */}
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
                          <div className="nav-item" style={{ position: 'relative' }}>
                            <a
                              className={`nav-link ${activeTab === "All" ? "active" : ""}`}
                              onClick={() => setActiveTab("All")}
                              data-bs-toggle="tab"
                              href="#All-list"
                              role="tab"
                              style={{
                                padding: '8px 20px',
                                fontWeight: '600',
                                fontSize: '14px',
                                color: activeTab === "All" ? 'white' : '#666',
                                background: activeTab === "All" ? 'linear-gradient(135deg, #ff8a00, #ff5e00)' : 'transparent',
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
                              className={`nav-link ${activeTab === "In Progress" ? "active" : ""}`}
                              onClick={() => setActiveTab("In Progress")}
                              data-bs-toggle="tab"
                              href="#Started-list"
                              role="tab"
                              style={{
                                padding: '8px 20px',
                                fontWeight: '600',
                                fontSize: '14px',
                                color: activeTab === "In Progress" ? 'white' : '#666',
                                background: activeTab === "In Progress" ? 'linear-gradient(135deg, #ff8a00, #ff5e00)' : 'transparent',
                                borderRadius: '8px',
                                border: 'none',
                                transition: 'all 0.2s ease',
                                zIndex: '1',
                                position: 'relative'
                              }}
                            >
                              <i className={`icofont-spinner-alt-3 me-1 ${activeTab === "In Progress" ? '' : 'text-warning'}`} 
                                style={{ fontSize: '14px' }}></i>
                              In Progress
                            </a>
                          </div>
                          <div className="nav-item" style={{ position: 'relative' }}>
                            <a
                              className={`nav-link ${activeTab === "Completed" ? "active" : ""}`}
                              onClick={() => setActiveTab("Completed")}
                              data-bs-toggle="tab"
                              href="#Completed-list"
                              role="tab"
                              style={{
                                padding: '8px 20px',
                                fontWeight: '600',
                                fontSize: '14px',
                                color: activeTab === "Completed" ? 'white' : '#666',
                                background: activeTab === "Completed" ? 'linear-gradient(135deg, #52b447, #429938)' : 'transparent',
                                borderRadius: '8px',
                                border: 'none',
                                transition: 'all 0.2s ease',
                                zIndex: '1',
                                position: 'relative'
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
                        <div className="d-flex align-items-center mb-3 mb-md-0 mx-auto">
                          <div style={{
                            backgroundColor: 'rgba(255, 138, 0, 0.1)',
                            padding: '8px 15px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}>
                            <i className="icofont-filter" style={{ color: '#ff5e00', fontSize: '16px' }}></i>
                            <span style={{ 
                              fontWeight: '600', 
                              color: '#333',
                              fontSize: '14px'
                            }}>Projects for: <span style={{ color: '#ff5e00' }}>{filteredEmployeeName}</span></span>
                          <button
                            type="button"
                              className="btn"
                            onClick={clearFilter}
                              style={{
                                backgroundColor: '#ff5e00',
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
                                e.currentTarget.style.backgroundColor = '#ff5e00';
                              }}
                            >
                              <i className="icofont-close-line"></i>
                              Clear
                          </button>
                          </div>
                        </div>
                      )}

                      <div className="order-0 mb-3 mb-md-0">
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
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={handleSearch}
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
                              backgroundColor: '#52b447',
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
                  </div>
                </div>{" "}
                {/* Row end  */}
                {loading ? (
                  <div className="custom-loader "></div>
                ) : filteredProjects.length === 0 ? (
                  <div className="text-center mt-4">
                    <h1 className="text-muted">No projects available. Please create a project.</h1>
                  </div>
                ) : (
                  <div className="row g-3 mb-3 row-deck">
                    <div className="col-md-12">
                      {viewMode === "list" ? (
                        <div className="card mb-3" style={{
                          borderRadius: '12px',
                          boxShadow: '0 6px 15px rgba(0,0,0,0.05)',
                          border: 'none',
                          overflow: 'hidden'
                        }}>
                          <div className="card-body" style={{ padding: '0' }}>
                            {/* Desktop view - with orange and green theme */}
                            <table className="table align-middle mb-0 d-none d-md-table" style={{ 
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
                                  }}>Sr.No.</th>
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
                                    width: "6rem",
                                    fontSize: '14px'
                                  }}>Client</th>
                                  <th style={{
                                    padding: '16px 15px',
                                    fontWeight: '600',
                                    color: '#444',
                                    borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                    fontSize: '14px'
                                  }}>Start Date</th>
                                  <th style={{
                                    padding: '16px 15px',
                                    fontWeight: '600',
                                    color: '#444',
                                    borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                    fontSize: '14px'
                                  }}>End Date</th>
                                  <th style={{
                                    padding: '16px 15px',
                                    fontWeight: '600',
                                    color: '#444',
                                    borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                    fontSize: '14px'
                                  }}>Employees</th>
                                  <th style={{
                                    padding: '16px 15px',
                                    fontWeight: '600',
                                    color: '#444',
                                    borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                    fontSize: '14px'
                                  }}>Progress</th>
                                  <th style={{
                                    padding: '16px 15px',
                                    fontWeight: '600',
                                    color: '#444',
                                    borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                    textAlign: 'center',
                                    fontSize: '14px'
                                  }}>Actions</th>
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
                                          background: 'linear-gradient(135deg, #ff8a00, #ff5e00)',
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
                                          <div className="d-flex align-items-center">
                                            {project.projectIcon && (
                                              <img
                                                src={`${import.meta.env.VITE_BASE_URL}${project.projectIcon}`}
                                                alt="Project Icon"
                                                className="me-2 rounded-circle"
                                                style={{
                                                  width: '36px',
                                                  height: '36px',
                                                  objectFit: 'cover',
                                                  cursor: 'pointer',
                                                  border: '2px solid #52b447',
                                                  padding: '2px',
                                                  backgroundColor: 'white'
                                                }}
                                                onClick={() => {
                                                  setSelectedImages([project.projectIcon]);
                                                  setSelectedImageTitle(`${project.projectName} Icon`);
                                                  const modal = new bootstrap.Modal(document.getElementById('imagePreviewModal'));
                                                  modal.show();
                                                }}
                                              />
                                            )}
                                            <div>
                                              <Link to="/tasks" className="text-capitalize" style={{
                                                fontWeight: '700',
                                                color: '#333',
                                                textDecoration: 'none',
                                                transition: 'color 0.2s ease',
                                                fontSize: '15px'
                                              }} 
                                              state={{ projectName: project.projectName }}
                                              onMouseOver={(e) => e.currentTarget.style.color = '#52b447'}
                                              onMouseOut={(e) => e.currentTarget.style.color = '#333'}>
                                              {project.projectName}
                                            </Link>
                                              <div className="mt-1" style={{ 
                                                fontSize: '12px',
                                                color: '#777'
                                              }}>
                                                <i className="icofont-clock-time me-1" style={{ color: '#52b447' }}></i>
                                                {getFormattedDate(project.projectDate, true)}
                                              </div>
                                            </div>
                                          </div>

                                          {project.projectImage && project.projectImage.length > 0 && (
                                            <button
                                              className="btn"
                                              style={{
                                                color: '#52b447',
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
                                              onClick={() => handleOpenProjectImages(project)}
                                              onMouseOver={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.2)';
                                              }}
                                              onMouseOut={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.1)';
                                              }}
                                            >
                                              <i className="icofont-attachment" style={{ fontSize: '14px' }} />
                                            </button>
                                          )}
                                          </div>
                                      </td>
                                      <td style={{
                                        padding: '16px 15px',
                                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                                      }}>
                                        {project.clientAssignPerson?.length > 0 ? (
                                          <div className="dropdown">
                                            <button 
                                              className="btn dropdown-toggle" 
                                              type="button" 
                                              data-bs-toggle="dropdown" 
                                              aria-expanded="false"
                                              style={{
                                                backgroundColor: 'rgba(255, 138, 0, 0.1)',
                                                color: '#ff5e00',
                                                borderRadius: '6px',
                                                padding: '6px 12px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                border: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                              }}
                                            >
                                              <i className="icofont-Client me-1"></i>
                                               ({project.clientAssignPerson.length})
                                            </button>
                                            <ul className="dropdown-menu" style={{
                                              padding: '10px',
                                              borderRadius: '8px',
                                              boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                                              border: '1px solid rgba(255, 138, 0, 0.2)',
                                              minWidth: '200px'
                                            }}>
                                              <li style={{
                                                borderBottom: '1px solid rgba(255, 138, 0, 0.1)',
                                                paddingBottom: '8px',
                                                marginBottom: '8px'
                                              }}>
                                                <div style={{
                                                  color: '#ff5e00',
                                                  fontWeight: '600',
                                                  fontSize: '13px',
                                                  display: 'flex',
                                                  alignItems: 'center'
                                                }}>
                                                  <i className="icofont-people me-2"></i>
                                                  Client Members
                                        </div>
                                              </li>
                                              {project.clientAssignPerson?.map((client, idx) => (
                                                <li key={idx} style={{ marginBottom: '8px' }}>
                                                  <div className="d-flex align-items-center">
                                                    <i className="icofont-business-man" style={{ 
                                                      color: '#ff5e00', 
                                                      fontSize: '14px',
                                                      marginRight: '8px'
                                                    }}></i>
                                                    <span style={{ 
                                                      fontSize: '13px',
                                                      color: '#444'
                                                    }}>{client.clientName}</span>
                                        </div>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        ) : (
                                          <span style={{
                                            color: '#999',
                                            fontStyle: 'italic',
                                            fontSize: '13px'
                                          }}>No Client members</span>
                                        )}
                                      </td>
                                      <td style={{
                                        padding: '16px 15px',
                                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                                      }}>
                                        <div style={{
                                          backgroundColor: 'rgba(255, 138, 0, 0.1)',
                                          padding: '6px 10px',
                                          borderRadius: '6px',
                                          color: '#ff5e00',
                                          fontSize: '13px',
                                          fontWeight: '600',
                                          display: 'inline-block'
                                        }}>
                                          <i className="icofont-calendar me-1"></i>
                                        {getFormattedDate(project.projectStartDate)}
                                        </div>
                                      </td>
                                      <td style={{
                                        padding: '16px 15px',
                                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                                      }}>
                                        <div style={{
                                          backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                          padding: '6px 10px',
                                          borderRadius: '6px',
                                          color: '#52b447',
                                          fontSize: '13px',
                                          fontWeight: '600',
                                          display: 'inline-block'
                                        }}>
                                          <i className="icofont-calendar me-1"></i>
                                        {getFormattedDate(project.projectEndDate)}
                                        </div>
                                      </td>
                                      <td style={{
                                        padding: '16px 15px',
                                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                                      }}>
                                        {project.taskAssignPerson.length > 0 ? (
                                          <div className="dropdown">
                                            <button 
                                              className="btn dropdown-toggle" 
                                              type="button" 
                                              data-bs-toggle="dropdown" 
                                              aria-expanded="false"
                                              style={{
                                                backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                                color: '#52b447',
                                                borderRadius: '6px',
                                                padding: '6px 12px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                border: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                              }}
                                            >
                                              <i className="icofont-users-alt-2 me-1"></i>
                                              ({project.taskAssignPerson.length})
                                            </button>
                                            <ul className="dropdown-menu" style={{
                                              padding: '10px',
                                              borderRadius: '8px',
                                              boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                                              border: '1px solid rgba(82, 180, 71, 0.2)',
                                              minWidth: '200px'
                                            }}>
                                              <li style={{
                                                borderBottom: '1px solid rgba(82, 180, 71, 0.1)',
                                                paddingBottom: '8px',
                                                marginBottom: '8px'
                                              }}>
                                                <div style={{
                                                  color: '#52b447',
                                                  fontWeight: '600',
                                                  fontSize: '13px',
                                                  display: 'flex',
                                                  alignItems: 'center'
                                                }}>
                                                  <i className="icofont-users-alt-2 me-2"></i>
                                                  Employee Members
                                                </div>
                                              </li>
                                              {project.taskAssignPerson.map((member, idx) => (
                                                <li key={idx} style={{ marginBottom: '8px' }}>
                                                  <div className="d-flex align-items-center">
                                                    <i className="icofont-user-alt-5" style={{ 
                                                      color: '#52b447', 
                                                      fontSize: '14px',
                                                      marginRight: '8px'
                                                    }}></i>
                                                    <span style={{ 
                                                      fontSize: '13px',
                                                      color: '#444'
                                                    }}>{member.employeeName}</span>
                                                  </div>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        ) : (
                                          <span style={{
                                            color: '#999',
                                            fontStyle: 'italic',
                                            fontSize: '13px'
                                          }}>No Employees</span>
                                        )}
                                      </td>
                                      <td style={{
                                        padding: '16px 15px',
                                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                                      }}>
                                        <div className="d-flex justify-content-center" style={{
                                          fontWeight: '600',
                                          color: project.progress > 75 ? '#52b447' : 
                                                 project.progress > 50 ? '#ff8a00' : 
                                                 project.progress > 25 ? '#ff5e00' : '#dc3545',
                                          marginBottom: '5px',
                                          fontSize: '14px'
                                        }}>
                                          {project.progress}%
                                        </div>
                                        <div className="progress" style={{ 
                                          height: "8px",
                                          backgroundColor: 'rgba(0,0,0,0.05)',
                                          borderRadius: '4px'
                                        }}>
                                          <div
                                            className="progress-bar"
                                            role="progressbar"
                                            style={{ 
                                              width: `${project.progress}%`,
                                              background: `linear-gradient(to right, 
                                                ${project.progress > 75 ? '#52b447' : '#ff8a00'}, 
                                                ${project.progress > 50 ? '#52b447' : '#ff5e00'}
                                              )`,
                                              borderRadius: '4px',
                                              transition: 'width 0.5s ease'
                                            }}
                                            aria-valuenow={project.progress}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                          ></div>
                                        </div>
                                      </td>
                                      <td style={{
                                        padding: '16px 15px',
                                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                                        textAlign: 'center'
                                      }}>
                                        <div className="d-flex gap-2 justify-content-center">
                                        <button
                                            type="button"
                                          onClick={() => setToEdit(project._id)}
                                            className="btn"
                                          data-bs-toggle="modal"
                                          data-bs-target="#editproject"
                                            title="Edit Project"
                                            style={{
                                              backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                              color: '#52b447',
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
                                            <i className="icofont-edit"></i>
                                          </button>
                                        <button
                                            type="button"
                                            className="btn"
                                          data-bs-toggle="modal"
                                          data-bs-target="#deleteproject"
                                            title="Delete Project"
                                            style={{
                                              backgroundColor: 'rgba(255, 94, 0, 0.1)',
                                              color: '#ff5e00',
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
                                          onClick={() => {
                                            setDeletableId(project._id);
                                          }}
                                            onMouseOver={(e) => {
                                              e.currentTarget.style.backgroundColor = 'rgba(255, 94, 0, 0.2)';
                                            }}
                                            onMouseOut={(e) => {
                                              e.currentTarget.style.backgroundColor = 'rgba(255, 94, 0, 0.1)';
                                            }}
                                          >
                                            <i className="icofont-ui-delete"></i>
                                          </button>
                                        <button
                                            className="btn position-relative"
                                          data-bs-toggle="modal"
                                          data-bs-target="#addUser"
                                          type="button"
                                            title="Messages"
                                            style={{
                                              backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                              color: '#52b447',
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
                                          onClick={() => handleOpenMessages(project)}
                                            onMouseOver={(e) => {
                                              e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.2)';
                                            }}
                                            onMouseOut={(e) => {
                                              e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.1)';
                                            }}
                                          >
                                            <i className="icofont-ui-message"></i>
                                          {notifications[project._id] > 0 && (
                                              <span style={{
                                                position: 'absolute',
                                                top: '-5px',
                                                right: '-5px',
                                                backgroundColor: '#ff5e00',
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
                                              <strong>Client:</strong> {project.clientAssignPerson?.map(client => client.clientName).join(", ")}<br />
                                              <strong>Start:</strong> {getFormattedDate(project.projectStartDate)}<br />
                                              <strong>End:</strong> {getFormattedDate(project.projectEndDate)}<br />
                                              <strong>Employees:</strong> {project.taskAssignPerson.map(name => name.employeeName).join(", ")}<br />
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
                        <div className="row w-100">
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
                              <div className="col-md-4" key={project.id} style={{ padding: '12px' }}>
                                <div
                                  className="card task-card"
                                  style={{
                                    backgroundColor: '#ffffff',
                                    color: 'inherit',
                                    height: '320px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: '12px',
                                    boxShadow: '0 6px 15px rgba(0,0,0,0.05)',
                                    border: 'none',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    transition: 'transform 0.3s, box-shadow 0.3s'
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,0,0,0.1)';
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.05)';
                                  }}
                                >
                                  <div
                                    style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      height: '6px',
                                      background: 'linear-gradient(90deg, #ff8a00, #ff5e00)'
                                    }}
                                  ></div>
                                  <div className="card-body d-flex flex-column" style={{ padding: '22px' }}>
                                    <div className="d-flex justify-content-between align-items-center">
                                      <span style={{ 
                                        background: 'linear-gradient(135deg, #ff8a00, #ff5e00)',
                                        color: 'white', 
                                        borderRadius: '50%',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        boxShadow: '0 4px 8px rgba(255, 138, 0, 0.3)'
                                      }}>
                                        {index + 1}
                                      </span>

                                      <div className="d-flex flex-grow-1 justify-content-center">
                                        {project.projectIcon && (
                                          <img
                                            src={`${import.meta.env.VITE_BASE_URL}${project.projectIcon}`}
                                            alt="Project Icon"
                                            className="me-2 rounded-circle"
                                            style={{
                                              width: '32px',
                                              height: '32px',
                                              objectFit: 'cover',
                                              cursor: 'pointer',
                                              border: '2px solid #52b447',
                                              padding: '2px',
                                              backgroundColor: 'white'
                                            }}
                                            onClick={() => {
                                              setSelectedImages([project.projectIcon]);
                                              setSelectedImageTitle(`${project.projectName} Icon`);
                                              const modal = new bootstrap.Modal(document.getElementById('imagePreviewModal'));
                                              modal.show();
                                            }}
                                          />
                                        )}
                                        <h5 className="card-title text-capitalize text-center mb-0 text-truncate"
                                          style={{ 
                                            maxWidth: '200px',
                                            color: '#333333',
                                            fontWeight: '700',
                                            fontSize: '17px'
                                          }}
                                          title={project.projectName}>
                                          {project.projectName}
                                        </h5>
                                      </div>

                                      {project.projectImage && project.projectImage.length > 0 && (
                                        <button
                                          className="btn"
                                          style={{
                                            color: '#52b447',
                                            padding: '6px',
                                            borderRadius: '50%',
                                            transition: 'all 0.2s',
                                            border: 'none',
                                            backgroundColor: 'rgba(82, 180, 71, 0.1)'
                                          }}
                                          onClick={() => handleOpenProjectImages(project)}
                                          onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.2)';
                                          }}
                                          onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.1)';
                                          }}
                                        >
                                          <i className="icofont-attachment fs-6" />
                                        </button>
                                      )}
                                    </div>

                                    <div className="mt-3" style={{ borderTop: '1px solid rgba(82, 180, 71, 0.1)', paddingTop: '12px' }}>
                                      <div className="d-flex justify-content-between">
                                        <div style={{
                                          backgroundColor: 'rgba(255, 138, 0, 0.1)',
                                          padding: '5px 10px',
                                          borderRadius: '6px',
                                          color: '#ff5e00',
                                          fontSize: '12px',
                                          fontWeight: '600'
                                        }}>
                                          <i className="icofont-calendar me-1"></i>
                                          {getFormattedDate(project.projectStartDate)}
                                        </div>
                                        <div style={{
                                          backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                          padding: '5px 10px',
                                          borderRadius: '6px',
                                          color: '#52b447',
                                          fontSize: '12px',
                                          fontWeight: '600'
                                        }}>
                                          <i className="icofont-calendar me-1"></i>
                                          {getFormattedDate(project.projectEndDate)}
                                        </div>
                                      </div>

                                      {/* Employees and Client row - placed side by side */}
                                      <div className="d-flex mt-3 gap-2">
                                        {/* Employees column */}
                                        <div style={{ flex: 1 }}>
                                        <div style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          marginBottom: '8px'
                                        }}>
                                          <span style={{
                                            backgroundColor: '#f9fcf7',
                                            color: '#52b447',
                                            padding: '3px 10px',
                                            borderRadius: '4px',
                                            fontWeight: '600',
                                            fontSize: '12px',
                                            display: 'flex',
                                            alignItems: 'center'
                                          }}>
                                            <i className="icofont-users-alt-2 me-1"></i>
                                            Employees
                                          </span>
                                        </div>
                                        <div
                                            className="members-list"
                                          style={{
                                            height: '80px',
                                            overflowY: 'auto',
                                            scrollbarWidth: 'thin',
                                            scrollbarColor: '#52b447 #f0f0f0',
                                            padding: '2px 8px'
                                          }}
                                        >
                                          {project.taskAssignPerson.map((member, idx) => (
                                            <div key={idx} className="mb-1" style={{ color: '#444' }}>
                                              <div className="d-flex gap-2 align-items-center">
                                                <i className="icofont-user-alt-5" style={{ color: '#52b447', fontSize: '14px' }}></i>
                                                  <span className="text-truncate" style={{ maxWidth: '120px', fontSize: '13px' }} title={member.employeeName}>
                                                  {member.employeeName}
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                        {/* Client column */}
                                        <div style={{ flex: 1 }}>
                                        <div style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          marginBottom: '8px'
                                        }}>
                                          <span style={{
                                            backgroundColor: 'rgba(255, 138, 0, 0.1)',
                                            color: '#ff5e00',
                                            padding: '3px 10px',
                                            borderRadius: '4px',
                                            fontWeight: '600',
                                            fontSize: '12px',
                                            display: 'flex',
                                            alignItems: 'center'
                                          }}>
                                            <i className="icofont-people me-1"></i>
                                            Client
                                          </span>
                                        </div>
                                        <div
                                          className="clients-list"
                                          style={{
                                              height: '80px',
                                            overflowY: 'auto',
                                            scrollbarWidth: 'thin',
                                            scrollbarColor: '#ff5e00 #f0f0f0',
                                            padding: '2px 8px'
                                          }}
                                        >
                                          {project.clientAssignPerson?.map((client, idx) => (
                                            <div key={idx} className="d-flex gap-2 align-items-center" title={client.clientName}>
                                              <i className="icofont-business-man" style={{ color: '#ff5e00', fontSize: '14px' }}></i>
                                              <span style={{ 
                                                  maxWidth: '120px',
                                                color: '#444',
                                                fontSize: '13px'
                                              }} className="text-truncate">
                                              {client.clientName}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mt-auto pt-2" style={{ 
                                      borderTop: '1px solid rgba(82, 180, 71, 0.1)',
                                      marginTop: '12px'
                                    }}>
                                      <span className="d-flex justify-content-start text-muted small" style={{ fontSize: '11px' }}>
                                        <i className="icofont-clock-time me-1" style={{ color: '#52b447' }}></i>
                                        {getFormattedDate(project.projectDate, true)}
                                      </span>
                                      <div className="d-flex justify-content-between" style={{ gap: '5px' }}>
                                        <button
                                          onClick={() => setToEdit(project._id)}
                                          className="btn"
                                          data-bs-toggle="modal"
                                          data-bs-target="#editproject"
                                          title="Edit"
                                          style={{
                                            backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                            color: '#52b447',
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
                                          <i className="icofont-edit"></i>
                                        </button>
                                        <button
                                          className="btn"
                                          data-bs-toggle="modal"
                                          data-bs-target="#deleteproject"
                                          onClick={() => setDeletableId(project._id)}
                                          title="Delete"
                                          style={{
                                            backgroundColor: 'rgba(255, 94, 0, 0.1)',
                                            color: '#ff5e00',
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
                                          <i className="icofont-ui-delete"></i>
                                        </button>
                                        <button
                                          className="btn position-relative"
                                          data-bs-toggle="modal"
                                          data-bs-target="#addUser"
                                          onClick={() => handleOpenMessages(project)}
                                          title="Message"
                                          style={{
                                            backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                            color: '#52b447',
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
                                          <i className="icofont-ui-message"></i>
                                          {notifications[project._id] > 0 && (
                                            <span style={{
                                              position: 'absolute',
                                              top: '-5px',
                                              right: '-5px',
                                              backgroundColor: '#ff5e00',
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
                                              {notifications[project._id]}
                                            </span>
                                          )}
                                        </button>
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

            {/* Create Project Modal */}
            <div
              className="modal fade"
              id="createproject"
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
                    background: 'linear-gradient(135deg, #52b447, #429938)',
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
                      <i className="icofont-plus-circle" style={{ fontSize: '22px' }}></i>
                      Create Project
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
                        htmlFor="exampleFormControlInput77"
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
                        <i className="icofont-paper" style={{ color: '#52b447' }}></i>
                        Project Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="exampleFormControlInput77"
                        placeholder="Enter project name"
                        name="projectName"
                        value={formData.projectName}
                        onChange={handleChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid rgba(82, 180, 71, 0.3)',
                          padding: '10px 15px',
                          color: '#333',
                          boxShadow: 'none'
                        }}
                      />
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
                        <i className="icofont-tag" style={{ color: '#52b447' }}></i>
                        Project Category <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter project category"
                        name="projectCategory"
                        value={formData.projectCategory}
                        onChange={handleChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid rgba(82, 180, 71, 0.3)',
                          padding: '10px 15px',
                          color: '#333',
                          boxShadow: 'none'
                        }}
                      />
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
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
                          <i className="icofont-file-image" style={{ color: '#ff5e00' }}></i>
                          Project Images
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        id="formFileMultipleone"
                        multiple
                        name="projectImage"
                        onChange={handleFileChange}
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
                      <div className="col-md-6">
                        <label 
                          htmlFor="projectIcon" 
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
                          <i className="icofont-image" style={{ color: '#ff5e00' }}></i>
                        Project Icon
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        id="projectIcon"
                        name="projectIcon"
                        accept="image/*"
                        onChange={handleFileChange}
                          style={{
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 94, 0, 0.3)',
                            padding: '10px 15px',
                            color: '#333',
                            boxShadow: 'none',
                            backgroundColor: 'rgba(255, 94, 0, 0.03)'
                          }}
                        />
                        <small style={{ color: '#777', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                          Upload an icon for your project (optional)
                        </small>
                    </div>
                    </div>
                    
                    <div className="deadline-form">
                      <form>
                        <div className="row g-3 mb-4">
                          <div className="col-md-6">
                            <label
                              htmlFor="datepickerded"
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
                              <i className="icofont-calendar" style={{ color: '#ff5e00' }}></i>
                              Start Date <span className="text-danger">*</span>
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              id="datepickerded"
                              name="projectStartDate"
                              value={formData.projectStartDate}
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
                          <div className="col-md-6">
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
                              <i className="icofont-calendar" style={{ color: '#52b447' }}></i>
                              End Date <span className="text-danger">*</span>
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              id="datepickerdedone"
                              name="projectEndDate"
                              value={formData.projectEndDate}
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
                          </div>
                        </div>
                        <div className="row g-3 mb-4">
                          <div className="col-sm-12">
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
                              <i className="icofont-users-alt-2" style={{ color: '#52b447' }}></i>
                              Project Employees <span className="text-danger">*</span>
                            </label>
                            <div style={{
                              border: '1px solid rgba(82, 180, 71, 0.3)',
                              borderRadius: '8px',
                              padding: '5px',
                              backgroundColor: 'rgba(82, 180, 71, 0.03)'
                            }}>
                              <MultiSelect
                                options={assignEmployee}
                                value={selectedEmployees}
                                onChange={setSelectedEmployees}
                                labelledBy="Select Employees"
                                style={{ backgroundColor: 'transparent' }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="row g-3 mb-4">
                          <div className="col-sm-12">
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
                              <i className="icofont-Client" style={{ color: '#ff5e00' }}></i>
                              Project Client
                            </label>
                            <div style={{
                              border: '1px solid rgba(255, 94, 0, 0.3)',
                              borderRadius: '8px',
                              padding: '5px',
                              backgroundColor: 'rgba(255, 94, 0, 0.03)'
                            }}>
                              <MultiSelect
                                options={assignClient}
                                value={selectedClients}
                                onChange={setSelectedClients}
                                labelledBy="Select Clients"
                                style={{ backgroundColor: 'transparent' }}
                              />
                            </div>
                          </div>
                        </div>

                      </form>
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="exampleFormControlTextarea78"
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
                        <i className="icofont-notepad" style={{ color: '#52b447' }}></i>
                        Description
                      </label>
                      <textarea
                        className="form-control"
                        id="exampleFormControlTextarea78"
                        rows={3}
                        placeholder="Explain what to do & how to do for this project..."
                        defaultValue={""}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid rgba(82, 180, 71, 0.3)',
                          padding: '12px 15px',
                          color: '#333',
                          boxShadow: 'none'
                        }}
                      />
                    </div>
                    <div className="mb-4">
                      <label 
                        htmlFor="backgroundColor" 
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
                        <i className="icofont-paint" style={{ color: '#ff5e00' }}></i>
                        Card Color
                      </label>
                      <div className="d-flex align-items-center gap-2" style={{
                        backgroundColor: 'rgba(255, 94, 0, 0.03)',
                        padding: '12px 15px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 94, 0, 0.3)'
                      }}>
                        <input
                          type="color"
                          className="form-control form-control-color"
                          id="backgroundColor"
                          name="backgroundColor"
                          value={formData.backgroundColor}
                          onChange={handleChange}
                          title="Choose card color"
                          style={{
                            border: 'none',
                            height: '38px',
                            width: '60px'
                          }}
                        />
                        <span style={{ color: '#666', margin: '0 10px' }}>
                          Selected: <code>{formData.backgroundColor}</code>
                        </span>
                        <button
                          type="button"
                          className="btn"
                          onClick={() => setFormData({ ...formData, backgroundColor: '#ffffff' })}
                          style={{
                            backgroundColor: 'white',
                            color: '#666',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '13px'
                          }}
                        >
                          <i className="icofont-refresh me-1"></i>
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer" style={{
                    borderTop: '1px solid rgba(82, 180, 71, 0.1)',
                    padding: '16px 25px'
                  }}>
                    <button
                      type="button"
                      className="btn"
                      data-bs-dismiss="modal"
                      style={{
                        backgroundColor: 'rgba(255, 94, 0, 0.1)',
                        color: '#ff5e00',
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
                        background: 'linear-gradient(135deg, #52b447, #429938)',
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
                      onClick={handleSubmit}
                    >
                      <i className="icofont-check-circled me-2"></i>
                      Create Project
                    </button>
                  </div>
                  {error && (
                    <div className="m-3 p-3" style={{
                      backgroundColor: 'rgba(255, 94, 0, 0.1)', 
                      color: '#dc3545',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 94, 0, 0.2)',
                      fontSize: '14px'
                    }}>
                      <i className="icofont-warning-alt me-2"></i>
                      {error}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Update Project Modal with Orange and Green Theme */}
            <div
              className="modal fade"
              id="editproject"
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
                    background: 'linear-gradient(135deg, #ff8a00, #ff5e00)',
                    borderBottom: 'none',
                    padding: '20px 25px',
                    position: 'relative'
                  }}>
                    <h5 
                      className="modal-title fw-bold" 
                      id="editprojectLabel"
                            style={{
                        color: 'white',
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <i className="icofont-edit" style={{ fontSize: '22px' }}></i>
                      Edit Project
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
                        htmlFor="exampleFormControlInput78"
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
                        <i className="icofont-paper" style={{ color: '#52b447' }}></i>
                        Project Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="exampleFormControlInput78"
                        placeholder="Enter project name"
                        name="projectName"
                        value={projectFormData.projectName}
                        onChange={projectHandleChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid rgba(82, 180, 71, 0.3)',
                          padding: '10px 15px',
                          color: '#333',
                          boxShadow: 'none'
                        }}
                      />
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
                        <i className="icofont-tag" style={{ color: '#52b447' }}></i>
                        Project Category
                      </label>
                      <select
                        className="form-select"
                        aria-label="Default select example"
                        name="projectCategory"
                        value={projectFormData.projectCategory}
                        onChange={projectHandleChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid rgba(82, 180, 71, 0.3)',
                          padding: '10px 15px',
                          color: '#333',
                          boxShadow: 'none',
                          background: `#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2352b447' d='M8 10.5l-4-4h8l-4 4z'/%3E%3C/svg%3E") no-repeat right 0.75rem center/8px 10px`
                        }}
                      >
                        <option value=""></option>
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

                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                      <label
                        htmlFor="formFileMultiple456"
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
                          <i className="icofont-file-image" style={{ color: '#ff5e00' }}></i>
                          Project Images
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        id="formFileMultiple456"
                        name="projectImage"
                        onChange={projectHandleChange}
                        multiple
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

                      <div className="col-md-6">
                        <label 
                          htmlFor="editProjectIcon" 
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
                          <i className="icofont-image" style={{ color: '#ff5e00' }}></i>
                          Project Icon
                        </label>
                        {projectFormData.projectIcon && (
                          <div className="mb-2 d-flex align-items-center gap-2">
                            <img
                              src={`${import.meta.env.VITE_BASE_URL}${projectFormData.projectIcon}`}
                              alt="Current Icon"
                              style={{
                                width: '36px',
                                height: '36px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: '2px solid #52b447',
                                padding: '2px'
                              }}
                            />
                            <span style={{ fontSize: '12px', color: '#666' }}>Current icon</span>
                          </div>
                        )}
                        <input
                          type="file"
                          className="form-control"
                          id="editProjectIcon"
                          name="projectIcon"
                          accept="image/*"
                          onChange={projectHandleChange}
                          style={{
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 94, 0, 0.3)',
                            padding: '10px 15px',
                            color: '#333',
                            boxShadow: 'none',
                            backgroundColor: 'rgba(255, 94, 0, 0.03)'
                          }}
                        />
                        <small style={{ color: '#777', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                          Upload a new icon to replace the current one (optional)
                        </small>
                      </div>
                    </div>
                    
                    <div className="deadline-form">
                      <form>
                        <div className="row g-3 mb-4">
                          <div className="col-md-6">
                            <label
                              htmlFor="datepickerded123"
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
                              <i className="icofont-calendar" style={{ color: '#ff5e00' }}></i>
                              Start Date
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              id="datepickerded123"
                              name="projectStartDate"
                              value={projectFormData.projectStartDate}
                              onChange={projectHandleChange}
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
                          <div className="col-md-6">
                            <label
                              htmlFor="datepickerded456"
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
                              <i className="icofont-calendar" style={{ color: '#52b447' }}></i>
                              End Date
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              id="datepickerded456"
                              name="projectEndDate"
                              value={projectFormData.projectEndDate}
                              onChange={projectHandleChange}
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
                        </div>
                        <div className="row g-3 mb-4">
                          <div className="col-sm-12">
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
                              <i className="icofont-users-alt-2" style={{ color: '#52b447' }}></i>
                              Project Employees
                            </label>
                            <div style={{
                              border: '1px solid rgba(82, 180, 71, 0.3)',
                              borderRadius: '8px',
                              padding: '5px',
                              backgroundColor: 'rgba(82, 180, 71, 0.03)'
                            }}>
                              <MultiSelect
                                options={assignEmployee}
                                value={selectedEmployees}
                                onChange={setSelectedEmployees}
                                labelledBy="Select Employees"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="row g-3 mb-4">
                          <div className="col-sm-12">
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
                              <i className="icofont-Client" style={{ color: '#ff5e00' }}></i>
                              Project Client
                            </label>
                            <div style={{
                              border: '1px solid rgba(255, 94, 0, 0.3)',
                              borderRadius: '8px',
                              padding: '5px',
                              backgroundColor: 'rgba(255, 94, 0, 0.03)'
                            }}>
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
                        <i className="icofont-notepad" style={{ color: '#52b447' }}></i>
                        Description (optional)
                      </label>
                      <textarea
                        className="form-control"
                        id="exampleFormControlTextarea786"
                        rows={3}
                        placeholder="Enter your project description"
                        name="description"
                        value={projectFormData.description}
                        onChange={projectHandleChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid rgba(82, 180, 71, 0.3)',
                          padding: '12px 15px',
                          color: '#333',
                          boxShadow: 'none'
                        }}
                      />
                    </div>
                    <div className="mb-4">
                      <label 
                        htmlFor="editBackgroundColor" 
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
                        <i className="icofont-paint" style={{ color: '#ff5e00' }}></i>
                        Card Color
                      </label>
                      <div className="d-flex align-items-center gap-2" style={{
                        backgroundColor: 'rgba(255, 94, 0, 0.03)',
                        padding: '12px 15px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 94, 0, 0.3)'
                      }}>
                        <input
                          type="color"
                          className="form-control form-control-color"
                          id="editBackgroundColor"
                          name="backgroundColor"
                          value={projectFormData.backgroundColor || '#ffffff'}
                          onChange={projectHandleChange}
                          title="Choose card color"
                          style={{
                            border: 'none',
                            height: '38px',
                            width: '60px'
                          }}
                        />
                        <span style={{ color: '#666', margin: '0 10px' }}>
                          Selected: <code>{projectFormData.backgroundColor}</code>
                        </span>
                        <button
                          type="button"
                          className="btn"
                          onClick={() => setProjectFormData({ ...projectFormData, backgroundColor: '#ffffff' })}
                          style={{
                            backgroundColor: 'white',
                            color: '#666',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '13px'
                          }}
                        >
                          <i className="icofont-refresh me-1"></i>
                          Reset
                        </button>
                      </div>
                    </div>
                        </div>
                  <div className="modal-footer" style={{
                    borderTop: '1px solid rgba(82, 180, 71, 0.1)',
                    padding: '16px 25px'
                  }}>
                    <button
                      type="button"
                      className="btn"
                      data-bs-dismiss="modal"
                      style={{
                        backgroundColor: 'rgba(255, 94, 0, 0.1)',
                        color: '#ff5e00',
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
                        background: 'linear-gradient(135deg, #52b447, #429938)',
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
                      onClick={projectHandleSubmit}
                    >
                      <i className="icofont-check-circled me-2"></i>
                      Update Project
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

            {/* Message Modal with Orange and Green Theme */}
            <div className="modal fade" id="addUser" tabIndex={-1} aria-labelledby="addUserLabel" aria-hidden="true" onHide={() => setIsChatModalOpen(false)}>
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
                    background: 'linear-gradient(135deg, #52b447, #429938)',
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
                        <i className="icofont-ui-message" style={{ fontSize: '20px', color: 'white' }}></i>
                      </div>
                      <div style={{ flex: 1 }}>
                    <h5 
                      className="modal-title" 
                      id="addUserLabel"
                      style={{
                        color: 'white',
                        fontSize: '18px',
                            fontWeight: '600',
                            margin: 0
                          }}
                        >
                      {selectProject.projectName}
                    </h5>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                          <i className="icofont-ui-user me-1"></i> Project Chat
                        </span>
                  </div>
                    <button 
                      type="button" 
                      className="btn-close" 
                      data-bs-dismiss="modal" 
                      aria-label="Close" 
                      onClick={() => setIsChatModalOpen(false)}
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
                  }}>
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
                          backgroundColor: 'rgba(82, 180, 71, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '15px'
                        }}>
                          <i className="icofont-ui-messaging" style={{ fontSize: '40px', color: '#52b447' }}></i>
                        </div>
                        <h6 style={{ color: '#666', marginBottom: '10px' }}>No messages yet</h6>
                        <p style={{ textAlign: 'center', fontSize: '14px' }}>
                          Start the conversation by sending your first message below.
                        </p>
                      </div>
                    ) : (
                      <div className="chat-messages">
                      {messages.map((message, index) => {
                          const isCurrentUser = message.senderId === "currentUser"; // Replace with your actual logic
                          const prevSender = index > 0 ? messages[index-1].senderId : null;
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
                                    <i className="icofont-user-alt-7" style={{ color: '#ff8a00', fontSize: '18px' }}></i>
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
                                  <div style={{ fontSize: '14px' }}>{message.content}</div>
                                  <div style={{ 
                                    fontSize: '11px',
                                    color: '#999',
                                    textAlign: 'right',
                                    marginTop: '4px' 
                                  }}>
                                    {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    {isCurrentUser && (
                                      <i className="icofont-check-circled ms-1" style={{ color: '#52b447' }}></i>
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
                                    <i className="icofont-user-alt-7" style={{ color: '#52b447', fontSize: '18px' }}></i>
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
                                  const cleanFileUrl = `${import.meta.env.VITE_BASE_URL}${fileUrl.replace('uploads/', '')}`;
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
                                                color: isCurrentUser ? '#52b447' : '#ff8a00',
                                                textDecoration: 'none',
                                                maxWidth: '250px'
                                              }}
                                            >
                                              <i className={`icofont-file-${isDoc ? 'pdf' : 'text'}`} style={{ fontSize: '20px' }}></i>
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
                    <form onSubmit={messageSubmit} className="d-flex flex-column">
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
                              color: '#ff8a00'
                            }}
                          >
                            <i className="icofont-attachment" style={{ fontSize: '20px' }}></i>
                          </label>
                        <input
                          type="file"
                            className="form-control d-none"
                          id="fileUpload"
                          onChange={messageFileChange}
                          multiple
                        />
                      </div>
                          <button 
                            type="submit" 
                            style={{
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            backgroundColor: '#52b447',
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
                            e.currentTarget.style.backgroundColor = '#429938';
                            }}
                            onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.backgroundColor = '#52b447';
                            }}
                          >
                          <i className="icofont-paper-plane" style={{ fontSize: '18px' }}></i>
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
                            <i className="icofont-attachment me-1"></i>
                            <span id="fileCount">0</span> files selected
                          </span>
                          <button 
                            type="button" 
                            id="clearFiles"
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#ff5e00',
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

            {/* Image Preview Modal with Orange and Green Theme */}
            <div className="modal fade" id="imagePreviewModal" tabIndex={-1} aria-hidden="true">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content" style={{
                  borderRadius: '15px',
                  border: 'none',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  overflow: 'hidden'
                }}>
                  <div className="modal-header" style={{
                    background: 'linear-gradient(135deg, #ff8a00, #ff5e00)',
                    borderBottom: 'none',
                    padding: '16px 25px',
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
                      <i className="icofont-image" style={{ fontSize: '22px' }}></i>
                      {selectedImageTitle}
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
                  <div className="modal-body" style={{ 
                    padding: '25px',
                    backgroundColor: '#f9fcf7'
                  }}>
                    <div>
                      {selectedImages.map((image, index) => (
                        <div key={index} className="position-relative mb-3" style={{
                          border: '3px solid #52b447',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
                        }}>
                          <img
                            src={`${import.meta.env.VITE_BASE_URL}${image}`}
                            alt={`Preview ${index + 1}`}
                            className="img-fluid"
                            style={{ 
                              cursor: 'pointer',
                              width: '100%',
                              display: 'block'
                            }}
                            onClick={() => window.open(`${import.meta.env.VITE_BASE_URL}${image}`, '_blank')}
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
                              onClick={() => window.open(`${import.meta.env.VITE_BASE_URL}${image}`, '_blank')}
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
                      ))}
                    </div>
                  </div>
                  <div className="modal-footer" style={{
                    borderTop: '1px solid rgba(82, 180, 71, 0.1)',
                    padding: '16px 25px',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <button 
                      type="button" 
                      className="btn"
                      data-bs-dismiss="modal"
                      style={{
                        background: 'linear-gradient(135deg, #52b447, #429938)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 20px',
                        fontWeight: '600',
                        fontSize: '14px',
                        boxShadow: '0 4px 10px rgba(82, 180, 71, 0.2)',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
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
                      <i className="icofont-close-circled"></i>
                      Close Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Images Modal with Orange and Green Theme */}
            <div className="modal fade" id="projectImagesModal" tabIndex={-1} aria-hidden="true">
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content" style={{
                  borderRadius: '15px',
                  border: 'none',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  overflow: 'hidden'
                }}>
                  <div className="modal-header" style={{
                    background: 'linear-gradient(135deg, #52b447, #429938)',
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
                      {selectedProjectName} - Project Images
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
                  <div className="modal-body" style={{ 
                    padding: '25px',
                    backgroundColor: '#f9fcf7'
                  }}>
                    <div className="row g-4">
                      {selectedProjectImages.length > 0 ? (
                        selectedProjectImages.map((image, index) => (
                        <div key={index} className="col-md-4">
                            <div style={{
                              borderRadius: '10px',
                              overflow: 'hidden',
                              boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                              backgroundColor: 'white',
                              border: '1px solid rgba(0,0,0,0.05)',
                              transition: 'all 0.3s ease',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'translateY(-5px)';
                              e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.15)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.08)';
                            }}
                            >
                              <div style={{
                                position: 'relative',
                                overflow: 'hidden'
                              }}>
                            <img
                              src={`${import.meta.env.VITE_BASE_URL}${image}`}
                              alt={`Project Image ${index + 1}`}
                              style={{
                                    height: '180px',
                                    width: '100%',
                                objectFit: 'cover',
                                    cursor: 'pointer',
                                    transition: 'transform 0.5s ease'
                              }}
                              onClick={() => window.open(`${import.meta.env.VITE_BASE_URL}${image}`, '_blank')}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                  }}
                                />
                                <div style={{
                                  position: 'absolute',
                                  top: '10px',
                                  right: '10px',
                                  backgroundColor: index % 2 === 0 ? 'rgba(82, 180, 71, 0.8)' : 'rgba(255, 94, 0, 0.8)',
                                  color: 'white',
                                  borderRadius: '20px',
                                  padding: '3px 10px',
                                  fontSize: '12px',
                                  fontWeight: '500'
                                }}>
                                  Image {index + 1}
                            </div>
                          </div>
                              <div style={{
                                padding: '15px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderTop: '1px solid rgba(0,0,0,0.05)',
                                flexGrow: 1
                              }}>
                                <button 
                                  onClick={() => window.open(`${import.meta.env.VITE_BASE_URL}${image}`, '_blank')}
                                  style={{
                                    backgroundColor: index % 2 === 0 ? 'rgba(82, 180, 71, 0.1)' : 'rgba(255, 94, 0, 0.1)',
                                    color: index % 2 === 0 ? '#52b447' : '#ff5e00',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 15px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    width: '100%',
                                    justifyContent: 'center'
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'rgba(82, 180, 71, 0.2)' : 'rgba(255, 94, 0, 0.2)';
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'rgba(82, 180, 71, 0.1)' : 'rgba(255, 94, 0, 0.1)';
                                  }}
                                >
                                  <i className="icofont-eye"></i>
                                  View Full Size
                                </button>
                        </div>
                    </div>
                  </div>
                        ))
                      ) : (
                        <div className="col-12 text-center py-5">
                          <div style={{
                            backgroundColor: 'rgba(82, 180, 71, 0.1)',
                            padding: '30px',
                            borderRadius: '10px',
                            border: '1px dashed rgba(82, 180, 71, 0.3)'
                          }}>
                            <i className="icofont-image" style={{ 
                              fontSize: '48px', 
                              color: '#52b447',
                              opacity: '0.5',
                              marginBottom: '15px',
                              display: 'block'
                            }}></i>
                            <p style={{ 
                              margin: 0, 
                              fontSize: '16px', 
                              fontWeight: '500',
                              color: '#666' 
                            }}>
                              No images available for this project
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer" style={{
                    borderTop: '1px solid rgba(82, 180, 71, 0.1)',
                    padding: '16px 25px'
                  }}>
                    <button 
                      type="button" 
                      className="btn"
                      data-bs-dismiss="modal"
                      style={{
                        background: 'linear-gradient(135deg, #ff8a00, #ff5e00)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 20px',
                        fontWeight: '600',
                        fontSize: '14px',
                        boxShadow: '0 4px 10px rgba(255, 94, 0, 0.2)',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(255, 94, 0, 0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 10px rgba(255, 94, 0, 0.2)';
                      }}
                    >
                      <i className="icofont-close-circled"></i>
                      Close Gallery
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Pagination controls with orange and green theme */}
            <div className="row mt-4" style={{ marginBottom: '20px' }}>
              <div className="col-12 col-md-6 mb-3">
                <div className="d-flex align-items-center" style={{ 
                  background: '#f9fcf7',
                  padding: '12px 15px',
                  borderRadius: '8px',
                  border: '1px solid rgba(82, 180, 71, 0.15)'
                }}>
                  <label htmlFor="projectsPerPage" className="form-label me-3 mb-0" style={{ 
                    fontWeight: '600',
                    color: '#444',
                    fontSize: '14px'
                  }}>Projects per page:</label>
                  <select
                    id="projectsPerPage"
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
                    value={projectsPerPage}
                    onChange={(e) => {
                      setProjectsPerPage(e.target.value === 'all' ? filteredProjects.length : parseInt(e.target.value, 10));
                      setCurrentPage(1); // Reset to first page when changing the number of projects per page
                    }}
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
                    color: '#52b447',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <i className="icofont-listine-dots me-1"></i>
                    Total: {filteredProjects.length}
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
                          color: currentPage === 1 ? '#999' : '#52b447',
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
                              'linear-gradient(135deg, #ff8a00, #ff5e00)' : 'white',
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
                            color: '#52b447',
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

          </>
        </div>
        <ToastContainer />
        <FloatingMenu userType="admin" isMobile={isMobile} />
      </div >
    </>
  );
};

export default Project;