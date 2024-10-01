import React, { useState, useEffect } from "react";
import Sidebar from "../employeeCompt/EmployeeSidebar";
import Header from "../employeeCompt/EmployeeHeader";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./Loading.css";

const Project = () => {
  const [viewMode, setViewMode] = useState("list");

  // GET SINGLE PROJECT
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState([]);
  const handleSearch = async (searchQuery) => {
    if (searchQuery !== "") {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}api/pro/search?id=${searchQuery}`
        );
        setProjects(response.data);
      } catch (error) {
        console.error("Error:", error);
        setProjects(null);
      }
    } else {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}api/projects`
          );
          setProjects(response.data);
        } catch (error) {
          console.error("Error:", error);
        }
      };

      fetchData();
    }
  };
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
    const Token = localStorage.getItem("emp_token");
    const UserDetails = JSON.parse(localStorage.getItem("emp_user"));
    setLoginUserId(UserDetails._id);
    // console.log(UserDetails);

    async function fetchData() {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/auth`, {
          headers: {
            authorization: Token,
          },
        });
        // console.log(response.data);
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    }

    fetchData();
  }, []);


  // Delete Status
  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}api/project-status/${projectId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.message);
      }

      console.log("Project status deleted successfully");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting project status:", error.message);
    }
  };


  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');

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

    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}api/projectMessage`, {
        content,
        senderId,
        projectId: selectProject._id,
      });
      setContent('');
      fetchProjectMessages(selectProject._id); // Refresh messages
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    if (selectProject._id) {
      fetchProjectMessages(selectProject._id);
    }
  }, [selectProject]);





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
                      </div>
                    </div>
                  </div>
                </div>{" "}
                {/* Row end  */}
                {viewMode === "list" && (
                  <div className="row g-3 mb-3 row-deck">
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
                                    </td>
                                    <td>{getFormattedDate(project.projectStartDate)}</td>
                                    <td>{getFormattedDate(project.projectEndDate)} </td>
                                    <td>
                                      {project.taskAssignPerson.map(
                                        (name) => name.employeeName + ", "
                                      )}
                                    </td>
                                    <td>
                                      <div className="d-flex justify-content-center">0%</div>
                                    </td>
                                    <td>
                                      <button
                                        className="d-flex justify-content-center bi bi-chat-left-dots btn outline-secondary text-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#addUser"
                                        onClick={() => {
                                          setSelectProject(project);
                                          fetchProjectMessages(project._id);
                                        }}
                                      ></button>
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
                                className="bi bi-chat-left-dots btn outline-secondary text-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#addUser"
                                onClick={() => {
                                  setSelectProject(project);
                                  fetchProjectMessages(project._id);
                                }}
                              >
                                Add Message
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
            <div className="modal fade" id="addUser" tabIndex={-1} aria-labelledby="addUserLabel" aria-hidden="true">
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="addUserLabel">
                      {selectProject.projectName}
                    </h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    <ul className="list-group">
                      {messages.map((message) => (
                        <li key={message._id}>
                          <div className="d-flex border-bottom py-1">
                            <h6 className="fw-bold px-3">{message.senderId}</h6> - <span className="px-3 text-break">{message.content}</span>
                          </div>
                        </li>
                      ))}                    </ul>

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
                        />
                      </div>
                      <button type="submit" className="btn btn-dark">Submit</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </>
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
                  <h5 className="modal-title  fw-bold" id="deleteprojectLabel">
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
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    </>
  );
};

export default Project;
