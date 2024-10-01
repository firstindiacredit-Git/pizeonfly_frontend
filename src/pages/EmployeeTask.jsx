
import React, { useState, useEffect } from "react";
import Sidebar from "../employeeCompt/EmployeeSidebar";
import Header from "../employeeCompt/EmployeeHeader";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Loading.css";

const Tasks = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [taskStatuses, setTaskStatuses] = useState({});
  const [showFullDescription, setShowFullDescription] = useState("");
  const [taskMessages, setTaskMessages] = useState([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [messages, setMessages] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskMessage, setTaskMessage] = useState("");



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
    const Token = localStorage.getItem("emp_token");
    async function fetchTasks() {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/author`, {
          headers: {
            Authorization: Token,
          },
        });
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    }

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


  useEffect(() => {
    if (selectedTask) {
      fetchTaskMessages(selectedTask);
    }
  }, [selectedTask]);
  // Modify filtering logic based on filterStatus and searchQuery
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "All" || task.taskStatus === filterStatus;

    return matchesSearch && matchesFilter;
  });


  const userData = JSON.parse(localStorage.getItem('emp_user')); // Assuming 'user' is the key where user info is stored
  const userId = userData._id; // User ID
  const userName = userData.employeeName;

  // Function to fetch task messages
  const fetchTaskMessages = async (taskId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/taskMessages/${taskId}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Function to handle task message submission
  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    const messageContent = e.target.elements.message.value;

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}api/taskMessage`, {
        content: messageContent,
        senderId: userId, // Sender ID from localStorage
        taskId: selectedTask, // Selected Task ID
      });
      setMessages([...messages, response.data]); // Add new message to the list
      e.target.reset(); // Reset the form
    } catch (error) {
      console.error("Error submitting message:", error);
    }
  };

  // Function to handle view messages modal
  const handleViewMessages = (taskId) => {
    setSelectedTask(taskId);
    fetchTaskMessages(taskId);
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
                    <div className="card-header py-3 no-bg bg-transparent d-flex align-items-center px-0 justify-content-between border-bottom flex-wrap mb-3">
                      <h3 className="fw-bold mb-0">Task Management</h3>
                    </div>
                    <div className="col-auto d-flex justify-content-between">
                      <div>
                        <h6>Change View</h6>
                        <div className="d-flex justify-content-around">
                          <button
                            className="bi bi-list-task bg-primary text-white border-0 rounded"
                            onClick={() => setViewMode("list")} // Set to list view
                          ></button>
                          <button
                            className="bi bi-grid-3x3-gap-fill bg-primary text-white border-0 rounded"
                            onClick={() => setViewMode("grid")} // Set to grid view
                          ></button>
                        </div>
                      </div>

                      <div className="order-0">
                        <div className="input-group">
                          <input
                            type="search"
                            className="form-control"
                            aria-label="search"
                            aria-describedby="addon-wrapping"
                            placeholder="Enter Project Name"
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
                      <ul className="nav nav-tabs tab-body-header rounded prtab-set" style={{ cursor: 'pointer' }} role="tablist">
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
                </div>{" "}
                {/* Row end  */}
                <div className="row">
                  {viewMode === "list" ? (
                    // List View Rendering
                    <table className="table table-hover align-middle mb-0" style={{ width: "100%" }}>
                      <thead>
                        <tr>
                          <th>Sr.No</th>
                          <th>Project Name</th>
                          <th>Status</th>
                          <th>Due Date</th>
                          <th>Assigned To</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTasks.map((task, index) => {
                          const getFormattedDate = (date) => {
                            const newDate = new Date(date);
                            return `${newDate.getDate()}/${newDate.getMonth() + 1}/${newDate.getFullYear()}`;
                          };
                          return (
                            <tr key={task._id}>
                              <td><span className="fw-bold fs-6">{index + 1}.</span></td>
                              <td>{task.projectName}</td>
                              <td>
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
                              <td>{getFormattedDate(task.taskEndDate)}</td>
                              <td>{task.taskAssignPerson.employeeName}</td>
                              <td>
                                <button
                                  className="d-flex justify-content-center bi bi-chat-left-dots btn outline-secondary text-primary"
                                  data-bs-toggle="modal"
                                  data-bs-target="#taskMessage"
                                  onClick={() => handleViewMessages(task._id)}
                                >
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    // Grid View Rendering
                    <div className="row">
                      {filteredTasks.map((task, index) => {
                        const getFormattedDate = (date) => {
                          const newDate = new Date(date);
                          const day = newDate.getDate();
                          const month = newDate.getMonth() + 1;
                          const year = newDate.getFullYear();

                          return `${day}/${month}/${year}`;
                        };

                        return (
                          <div className="col-md-4 mb-4" key={task._id}>
                            <div className="card" style={{ width: "18rem" }}>
                              <div className="card-body dd-handle">
                                <div className="d-flex justify-content-between">
                                
                                  <h5 className="fw-bold">{index + 1}. {task.projectName}</h5>

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
                                        src={`${import.meta.env.VITE_BASE_URL}${task.taskAssignPerson.employeeImage}`}
                                        alt=""
                                      />
                                    </div>
                                    <div>{task.taskAssignPerson.employeeName}</div>
                                    <span className="badge bg-danger text-end mt-2">
                                      {task.taskPriority}
                                    </span>
                                  </div>
                                </div>
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
                                            className="d-flex justify-content-center bi bi-chat-left-dots btn outline-secondary text-primary"
                                            data-bs-toggle="modal"
                                            data-bs-target="#taskMessage"
                                            onClick={() => handleViewMessages(task._id)}
                                          ></button>
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


              </div>
            </div>

            {/* Message Modal */}
            <div
              className="modal fade"
              id="taskMessage"
              tabIndex={-1}
              aria-labelledby="taskMessageLabel"
              aria-hidden="true"
            >
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
                            {/* <h6 className="fw-bold px-3">{userName}</h6> */}
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
        </div>
      </div>
    </>
  );
};

export default Tasks;
