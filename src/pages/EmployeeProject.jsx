import React, { useState, useEffect } from "react";
import Sidebar from "../employeeCompt/EmployeeSidebar";
import Header from "../employeeCompt/EmployeeHeader";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Project = () => {
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
  const [projects, setProjects] = useState([]);
  const [selectProject, setSelectProject] = useState([]);
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

  // Status
  const [currentStatus, setCurrentStatus] = useState("");
  const [user_id, setUser_id] = useState("");
  const [project_id, setProject_id] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}api/project-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentStatus,
          user_id: loginUserId,
          project_id: selectProject._id,
        }),
      });
      // console.log(response.json);

      if (!response.ok) {
        throw new Error("Failed to add project status");
      }

      // console.log(response.data);

      // const newStatus = await response.json(); // Assuming the response contains the new status

      // // Update the state of the project to include the new status
      // setProjects(prevProjects => prevProjects.map(project => 
      //   project._id === selectProject._id 
      //     ? { newStatus, ...prevProjects }
      //     : project
      // ));
      // setProjects((prevProjects) => [newStatus, ...prevProjects]);


      setCurrentStatus("");
      setUser_id("");
      setProject_id("");

      // Close the modal programmatically
      const modalElement = document.getElementById("addUser");
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      modal.hide();



      toast.success('Status Added Successfully!', {
        style: {
          backgroundColor: '#4c3575',
          color: 'white',
        },
      });

      window.location.reload()


    } catch (error) {
      console.error(error.message);
    }
  };

  const [projectStatuses, setProjectStatuses] = useState([]);
  const [projectId, setProjectId] = useState("");

  useEffect(() => {
    const fetchProjectStatuses = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}api/project-status/${projectId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch project statuses");
        }

        const data = await response.json();
        setProjectStatuses(data);
      } catch (error) {
        console.error(error.message);
      }
    };

    if (projectId) {
      fetchProjectStatuses();
    }
  }, [projectId]);


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
                        {/* <button
                          type="button"
                          className="btn btn-dark me-1 w-sm-100"
                          data-bs-toggle="modal"
                          data-bs-target="#createproject"
                        >
                          <i className="icofont-plus-circle me-2 fs-6" />
                          Create Project
                        </button> */}
                        {/* <div className="order-0 ">
                          <div className="input-group">
                            <input
                              type="search"
                              className="form-control"
                              aria-label="search"
                              aria-describedby="addon-wrapping"
                              value={searchQuery}
                              onChange={(e) => {
                                setSearchQuery(e.target.value);
                                handleSearch(e.target.value);
                              }}
                              placeholder="Enter Project Name"
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
                              onClick={handleSearch}
                            >
                              <i className="fa fa-search" />
                            </button>
                          </div>
                        </div> */}
                      </div>
                    </div>
                  </div>
                </div>{" "}
                {/* Row end  */}
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
                              {/* <th>Project Category</th> */}
                              <th>Start Date</th>
                              <th>End Date</th>
                              <th>Members</th>
                              <th>Progress</th>
                              <th>Add Status</th>
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
                                    <Link to="/employee-tasks">
                                      {project.projectName}
                                    </Link>
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
                                    <figcaption class="blockquote-footer">
                                      {project.projectCategory}
                                    </figcaption>
                                  </td>
                                  {/* <td>{project.projectCategory}</td> */}
                                  <td>
                                    {getFormattedDate(project.projectStartDate)}
                                  </td>
                                  <td>
                                    {getFormattedDate(project.projectEndDate)}{" "}
                                  </td>
                                  <td>
                                    {project.taskAssignPerson.map(
                                      (name) => name.employeeName + ", "
                                    )}
                                  </td>
                                  <td>
                                    <div className="d-flex justify-content-center">
                                      0%
                                    </div>
                                  </td>
                                  <td>
                                    <button
                                      className="d-flex justify-content-center bi bi-stopwatch btn outline-secondary text-primary"
                                      data-bs-toggle="modal"
                                      data-bs-target="#addUser"
                                      onClick={() => {
                                        // console.log("abc: " + project._id);
                                        setProjectId(project._id);
                                        setSelectProject(project);
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
              </div>
            </div>

            {/* Status Modal */}
            <div
              className="modal fade"
              id="addUser"
              tabIndex={-1}
              aria-labelledby="addUserLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title fs-4 fw-bold" id="addUserLabel">
                      {selectProject.projectName}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    />
                  </div>
                  <div className="modal-body">
                    {/* <div className="inviteby_email">
                      <div className="input-group mb-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder=""
                          id=""
                          aria-describedby="exampleInputEmail1"
                        />
                        <button
                          className="btn btn-dark"
                          type="button"
                          id="button-addon2"
                        >
                          Search
                        </button>
                      </div>
                    </div> */}
                    <div className="members_list" >

                      <ul className="list-unstyled list-group list-group-custom list-group-flush mb-0">
                        <li className="list-group-item py-3 text-center text-md-start" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          {projectStatuses.map((status) => {
                            const getFormattedDate = (date) => {
                              const newDate = new Date(date);
                              const day = newDate.getDate();
                              const month = newDate.getMonth() + 1;
                              const year = newDate.getFullYear();
                              let hours = newDate.getHours();
                              const minutes = newDate.getMinutes();

                              const meridiem = hours >= 12 ? "PM" : "AM";
                              hours = hours % 12 || 12;

                              return `${day}/${month}/${year} ${hours}:${minutes} ${meridiem}`;
                            };

                            return (
                              <div
                                key={status._id}
                                className="d-flex align-items-center flex-column flex-sm-column flex-md-column flex-lg-row"
                              >
                                <div className="no-thumbnail mb-2 mb-md-0">
                                  <img
                                    className="avatar md rounded-circle"
                                    src={
                                      `${import.meta.env.VITE_BASE_URL}` +
                                      status.user_id.employeeImage
                                    }
                                    alt=""
                                  />
                                  <p
                                    className="fw-bold text-uppercase"
                                    style={{ width: "6rem" }}
                                  >
                                    {status.user_id.employeeName}
                                  </p>
                                </div>
                                <div className="flex-fill ms-3 text-truncate">
                                  <p className="mb-0  fw-bold">
                                    {status.currentStatus}
                                  </p>
                                  <span className="text-muted">
                                    {getFormattedDate(status.createdAt)}
                                  </span>
                                </div>
                                <div className="members-action">
                                  {/* <div className="btn-group">
                                    <div className="btn-group">
                                      <button
                                        type=""
                                        className="btn outline-secondary icofont-ui-delete text-danger "
                                        data-bs-toggle="modal"
                                        data-bs-target="#deleteproject"
                                        onClick={() => {
                                          setProjectId(status._id);
                                        }}
                                      ></button>
                                    </div>
                                  </div> */}
                                </div>
                              </div>
                            );
                          })}
                        </li>
                      </ul>

                      <form onSubmit={handleSubmit}>
                        <div className="row g-3 mb-3">
                          <div className="col">
                            <label className="form-label" hidden>
                              Employee Name
                            </label>
                            <select
                              className="form-select"
                              aria-label="Default select Project Category"
                              id="user_id"
                              value={user_id}
                              onChange={(e) => setUser_id(e.target.value)}
                              hidden
                            >
                              {selectProject.taskAssignPerson?.map((item) => {
                                return (
                                  <option key={item}>
                                    {item.employeeName}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        </div>
                        <div className="container">
                          <div className="row">
                            <div className="col-12">
                              <label htmlFor="currentStatus" className="fw-bold fs-5">
                                Add Status
                              </label>
                              <textarea
                                rows=""
                                cols="50"
                                type="text"
                                id="currentStatus"
                                value={currentStatus}
                                onChange={(e) =>
                                  setCurrentStatus(e.target.value)
                                }
                                className="form-control"
                              />
                            </div>
                          </div>
                          <div className="row mt-3">
                            <div className="col-12 d-flex justify-content-end">
                              <button type="submit" className="btn btn-dark">
                                Submit
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
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
