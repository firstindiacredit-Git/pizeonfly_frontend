import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { MultiSelect } from "react-multi-select-component";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Loading.css";

const Tasks = () => {
  const [viewMode, setViewMode] = useState('list'); // Default is list view

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');


  //CREATE TASK

  const User = JSON.parse(localStorage.getItem('user'));

  const [formData, setFormData] = useState({
    assignedBy: User.username || "",
    projectName: "",
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
          backgroundColor: "#4c3575",
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
    taskEndDate: "",
    taskAssignPerson: "",
    taskPriority: "",
    description: "",
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Formats date to 'YYYY-MM-DD'
  };

  const [taskStatuses, setTaskStatuses] = useState({});
  const [activeTab, setActiveTab] = useState('All'); // State for active tab filter
  const [filterDate, setFilterDate] = useState(''); // Date for date filter
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const tasksPerPage = 10; // Number of tasks per page
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/tasks`);
        const formattedTasks = response.data.map(task => ({
          ...task,
          taskEndDate: formatDate(task.taskEndDate),
          taskDate: formatDate(task.taskDate),
        }));

        // Sort tasks by taskDate in descending order
        formattedTasks.sort((a, b) => new Date(b.taskDate) - new Date(a.taskDate));

        setTasks(formattedTasks);
        console.log(response.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);
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
          backgroundColor: "#4c3575",
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
      (task.taskAssignPerson && task.taskAssignPerson.employeeName.toLowerCase().includes(searchTerm.toLowerCase()));

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
          backgroundColor: "#4c3575",
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

  const userData = JSON.parse(localStorage.getItem('user')); // Assuming 'user' is the key where user info is stored
  const userId = userData._id; // User ID
  const userName = userData.username;

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
    const messageContent = e.target.elements.message.value;

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}api/taskMessage`, {
        content: messageContent,
        senderId: userId, // Sender ID from localStorage
        taskId: selectedTaskId,
      });
      setMessages([...messages, response.data]); // Update messages
      e.target.reset(); // Reset form
    } catch (error) {
      console.error("Error submitting message:", error);
    }
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
                    <div className="card-header py-3 no-bg bg-transparent d-flex align-items-center px-0 justify-content-between border-bottom flex-wrap">
                      <h3 className="fw-bold mb-0">Task Management</h3>
                      <div className="col-auto d-flex w-sm-100">
                        <button
                          type="button"
                          className="btn btn-dark btn-set-task w-sm-100 me-2"
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
                <div className="d-flex justify-content-between">

                  <div>
                    <h6>Change View</h6>
                    <div className="d-flex justify-content-around">
                      <button className="bi bi-list-task bg-primary text-white border-0 rounded" onClick={() => setViewMode('list')}></button>
                      <button className="bi bi-grid-3x3-gap-fill bg-primary text-white border-0 rounded" onClick={() => setViewMode('row')}></button>
                    </div>
                  </div>

                  <div className="order-0">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by Project Name or Assignee"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: "19rem", height:"3rem"}}
                      />
                      <button
                        type="button"
                        className="input-group-text"
                      >
                        <i className="fa fa-search" />
                      </button>
                    </div>

                  </div>



                  <div className=" text-end mb-3" >
                    <p className="fw-bold">Filter by Date:</p>

                    <input
                      className="form-control"
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      style={{ width: '10rem' }}
                    /></div>
                </div>

                {/* Row end  */}
                {viewMode === 'list' ? (
                  <div className="modal-body">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th scope="col" style={{ width: '7.5rem' }}>Project name</th>
                          <th scope="col">Task name</th>
                          <th scope="col" style={{ width: '9rem' }}>Assignee</th>
                          <th scope="col" style={{ width: '' }}>Due Date</th>
                          <th scope="col" style={{ width: '9rem' }}>Priority</th>
                          <th scope="col" style={{ width: '' }}>U/D</th>
                          <th scope="col" style={{ width: '' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <div className="custom-loader"></div>
                        ) : (
                          currentTasks.map((task) => {
                            const currentDate = new Date();
                            const taskEndDate = new Date(task.taskEndDate);
                            const taskStartDate = new Date(task.taskDate);
                            const isOverdue = taskEndDate < currentDate && task.taskStatus !== 'Completed';
                            const isCompletedAfterDue = task.taskStatus === 'Completed' && taskEndDate < currentDate && taskEndDate.getTime() !== taskStartDate.getTime();

                            let backgroundColor = '';
                            if (isOverdue) {
                              backgroundColor = '#f6c8b7';
                            } else if (isCompletedAfterDue) {
                              backgroundColor = '#c6f2c1';
                            }

                            return (
                              <tr
                                key={task._id}
                                style={{ backgroundColor }}
                              >
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
                                  {task.taskAssignPerson.employeeName}
                                  <p className="text-muted">By:-{task.assignedBy}</p>
                                </td>
                                <td style={{ backgroundColor }}>
                                  <input
                                    type="date"
                                    className="form-control"
                                    name="taskEndDate"
                                    value={task.taskEndDate}
                                    onChange={(e) => taskHandleChange(e, task._id)}
                                  />
                                </td>
                                <td style={{ backgroundColor }}>
                                  <select
                                    className="form-select"
                                    aria-label="Default select Priority"
                                    name="taskPriority"
                                    value={task.taskPriority}
                                    onChange={(e) => taskHandleChange(e, task._id)}
                                  >
                                    <option value="">Set Priority</option>
                                    <option value="Highest">Highest</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Lowest">Lowest</option>
                                  </select>
                                </td>
                                <td style={{ display: 'flex', justifyContent: 'center', gap: '2vh', marginTop: '1.1rem', backgroundColor }}>
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
                                    className="d-flex justify-content-center bi bi-chat-left-dots btn outline-secondary text-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#taskMessage"
                                    onClick={() => handleViewMessages(task._id)}
                                  ></button>
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
                    {currentTasks.map((task) => (
                      <div key={task._id} className="col-md-4 mb-4">
                        <div className="card task-card" style={{ width: "18rem" }}>
                          <div className="card-body">
                            <h5 className="fw-bold">{task.projectName}</h5>
                            <p>{task.description}</p>
                            <p>Due Date: {task.taskEndDate}</p>
                            <p>Assigned to: {task.taskAssignPerson.employeeName}</p>
                            <div className="task-priority">{task.taskPriority}</div>
                            <div className="task-status">{task.taskStatus}</div>
                            <button
                              className="bi bi-stopwatch btn outline-secondary text-primary"
                              data-bs-toggle="modal"
                              data-bs-target="#taskMessage"
                              onClick={() => handleViewMessages(task._id)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}


                <nav className="d-flex justify-content-center">
                  <ul className="pagination">
                    <li className="page-item">
                      <button onClick={prevPage} className="page-link" disabled={currentPage === 1}>
                        &laquo;
                      </button>
                    </li>
                    {Array.from({ length: Math.ceil(filteredTasks.length / tasksPerPage) }, (_, i) => (
                      <li key={i + 1} className="page-item">
                        <button onClick={() => paginate(i + 1)} className="page-link">
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className="page-item">
                      <button onClick={nextPage} className="page-link" disabled={currentPage === Math.ceil(filteredTasks.length / tasksPerPage)}>
                        &raquo;
                      </button>
                    </li>
                  </ul>
                </nav>


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
                        <label className="form-label">Project Name</label>
                        <select
                          className="form-select"
                          placeholder="Add Category"
                          aria-label="Default select Project Category"
                          name="projectName"
                          value={formData.projectName}
                          onChange={handleChange}
                        >
                          <option>Chosse Project</option>
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
                                Task End Date
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
                            <option value={"Heighest"}>Highest</option>
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
                          Task Name
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
                          <option>Chosse Project</option>
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
                            <option value={"Heighest"}>Heighest</option>
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
                      <h5 className="modal-title" id="addUserLabel">Task Messages</h5>
                      <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                      <ul className="list-group">
                        {messages.map(message => (
                          <li key={message._id} className="list-group-item">
                            <div className="d-flex border-bottom py-1">
                              {/* <h6 className="fw-bold px-3">{userName}</h6> -  */}
                              <span className="px-3 text-break">{message.content}</span>
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
                            required
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
      </div >
    </>
  );
};

export default Tasks;