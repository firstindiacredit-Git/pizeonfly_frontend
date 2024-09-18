import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import axios from "axios";
import { MultiSelect } from "react-multi-select-component";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Loading.css";

const Project = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currProj, setCurrProj] = useState({});


  // CREATE PROJECT
  const [formData, setFormData] = useState({
    projectName: "",
    projectCategory: "",
    projectImage: null,
    projectStartDate: "",
    projectEndDate: "",
    taskAssignPerson: "",
    description: "",
  });
  const [error, setError] = useState("");
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleFileChange = (e) => {
    console.log(e.target.files);
    setFormData({
      ...formData,
      projectImage: e.target.files,
    });
  };
  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      for (let i = 0; i < formData.projectImage?.length; i++) {
        formDataToSend.append("projectImage", formData.projectImage[i]);
      }
      for (let key in formData) {
        formDataToSend.append(key, formData[key]);
      }
      for (let obj of selectedEmployees) {
        formDataToSend.append("taskAssignPerson", obj.value);
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
      });

      // Close the modal programmatically
      const modalElement = document.getElementById("createproject");
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      modal.hide();

      toast.success("Project Created Successfully!", {
        style: {
          backgroundColor: "#4c3575",
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

  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}api/projects`
        );

        console.log(response.data, 'projects');
        // setProjects(response.data);
        // setFilteredProjects(response.data); // Initialize with all projects
        const sortedProjects = response?.data?.sort(
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

    fetchProjects();
  }, []);
  useEffect(() => {
    filterProjects();
  }, [activeTab, projects]);
  const filterProjects = () => {
    if (activeTab === "All") {
      setFilteredProjects(projects);
    } else if (activeTab === "Completed") {
      setFilteredProjects(
        projects.filter((project) => project.status === "Completed")
      );
    } else if (activeTab === "In Progress") {
      setFilteredProjects(
        projects.filter((project) => project.status === "In Progress")
      );
    }
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

  //UPDATE PROJECT
  const [projectFormData, setProjectFormData] = useState({
    projectName: "",
    projectCategory: "",
    projectImage: null,
    projectStartDate: "",
    projectEndDate: "",
    taskAssignPerson: "",
    description: "",
  });
  const [toEdit, setToEdit] = useState("");
  // console.log(projectFormData);
  useEffect(() => {
    // Assuming fetchData() fetches the data of the item to edit based on its ID
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
          projectImage: data.projectImage, // Assuming this is a URL or a reference to the image
          projectStartDate: fStartDate,
          projectEndDate: fEndDate,
          taskAssignPerson: data.taskAssignPerson,
          description: data.description,
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
      for (const key in projectFormData) {
        formDataToSend.append(key, projectFormData[key]);
      }
      for (let obj of selectedEmployees) {
        formDataToSend.append("taskAssignPerson", obj.value);
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
      // console.log(response.data);
      const updatedProject = response.data;
      const updatedProjectData = projects.map((pro) => {
        if (pro._id === toEdit) {
          return {
            ...pro,
            projectName: updatedProject.projectName,
            projectCategory: updatedProject.projectCategory,
            projectImage: updatedProject.projectImage,
            projectStartDate: updatedProject.projectStartDate,
            projectEndDate: updatedProject.projectEndDate,
            taskAssignPerson: updatedProject.taskAssignPerson,
            description: updatedProject.description,
          };
        } else {
          return pro;
        }
      });
      // console.log(updatedProjectData);

      setProjects(updatedProjectData);
      // setProjectFormData(formDataToSend)

      // Close the modal programmatically
      const modalElement = document.getElementById("editproject");
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      modal.hide();

      toast.success("Project Updated Successfully!", {
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

  // GET SINGLE PROJECT

  const [searchQuery, setSearchQuery] = useState("");
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
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  // console.log(selectedEmployees);
  const assignEmployee = employees?.map((emp) => {
    return {
      label: emp.employeeName,
      value: emp._id,
    };
  });

  // Status
  const [selectProject, setSelectProject] = useState([]);
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
        // console.log(data);
        setProjectStatuses(data);
      } catch (error) {
        console.error(error.message);
      }
    };
    if (projectId) {
      fetchProjectStatuses();
    }
  }, [projectId]);

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
                    <div className="card-header py-3 px-0 d-sm-flex align-items-center justify-content-between ">
                      <h3 className="fw-bold py-3 mb-0">Projects</h3>
                      <div className="d-flex me-2">
                        {role === 'superadmin' && (
                          <button
                            type="button"
                            className="btn btn-dark w-sm-100"
                            data-bs-toggle="modal"
                            data-bs-target="#createproject"
                          >
                            <i className="icofont-plus-circle me-1" />
                            Create Project
                          </button>
                        )}
                        <ul
                          className="nav nav-tabs tab-body-header rounded ms-1 prtab-set w-sm-100"
                          role="tablist"
                        >
                          <li className="nav-item">
                            <a
                              className={`nav-link ${activeTab === "All" ? "active" : ""
                                }`}
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
                              className={`nav-link ${activeTab === "In Progress" ? "active" : ""
                                }`}
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
                              className={`nav-link ${activeTab === "Completed" ? "active" : ""
                                }`}
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
                    <div className="d-flex justify-content-between mb-4">
                      <div></div>

                      <div className="order-0 ms-1">
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
                                <th>Edit</th>
                                <th>Delete</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredProjects.map((project) => {
                                const getFormattedDate = (date) => {
                                  const newDate = new Date(date);
                                  let day = newDate.getDate();
                                  let month = newDate.getMonth() + 1;
                                  const year = newDate.getFullYear();
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

                                  // Adding leading zero to day and month if necessary
                                  if (day < 10) {
                                    day = "0" + day;
                                  }
                                  if (month < 10) {
                                    month = "0" + month;
                                  }

                                  return `${day}/${month}/${year} --${hour}:${min} ${period}`;
                                };

                                return (
                                  <tr key={project.id}
                                  // data-bs-toggle="modal"
                                  // data-bs-target="#viewtask"
                                  // onClick={() => setCurrProj(project)}
                                  >
                                    <td>
                                      <div className="">
                                        <Link to="/tasks">
                                          {project.projectName}
                                        </Link>

                                        <Link
                                          to="/images"
                                          state={{
                                            images: project.projectImage,
                                            projectName: project.projectName,
                                          }}
                                          style={{ marginLeft: "33px" }}
                                        >
                                          <i className="bi-paperclip fs-6" />
                                        </Link>
                                      </div>
                                      <div className="text-muted">
                                        -{getFormattedDate(project.projectDate)}
                                      </div>
                                    </td>
                                    <td>
                                      {getFormattedDate(
                                        project.projectStartDate
                                      )}
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
                                        {project.progress}%
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
                                        className="d-flex justify-content-center bi bi-stopwatch btn outline-secondary text-primary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#addUser"
                                        onClick={() => {
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
                        Project Name
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
                      <label className="form-label">Project Category</label>
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
                    <div className="deadline-form">
                      <form>
                        <div className="row g-3 mb-3">
                          <div className="col">
                            <label
                              htmlFor="datepickerded"
                              className="form-label"
                            >
                              Project Start Date
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
                              Project End Date
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
                              Project Assign Person
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
                      {/* {projectFormData.projectImage && <img src={projectFormData.projectImage} alt="Project" />} */}
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
                          {/* <div className="col-sm-12">
                            <label className="form-label">
                              Notifation Sent
                            </label>
                            <select
                              className="form-select"
                              aria-label="Default select example"
                            >
                              <option selected="">All</option>
                              <option value={1}>Team Leader Only</option>
                              <option value={2}>Team Member Only</option>
                            </select>
                          </div> */}
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
                      </form>
                    </div>
                    {/* <div className="row g-3 mb-3">
                      <div className="col-sm">
                        <label
                          htmlFor="formFileMultipleone"
                          className="form-label"
                        >
                          Priority
                        </label>
                        <select
                          className="form-select"
                          aria-label="Default select Priority"
                        >
                          <option selected="">Medium</option>
                          <option value={1}>Highest</option>
                          <option value={2}>Low</option>
                          <option value={3}>Lowest</option>
                        </select>
                      </div>
                    </div> */}
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
                    <h5 className="modal-title  fw-bold" id="addUserLabel">
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
                    <div className="members_list">
                      <ul
                        className="list-unstyled list-group list-group-custom list-group-flush mb-0"
                        style={{ maxHeight: "350px", overflowY: "auto" }}
                      >
                        <li className="list-group-item py-3 text-center text-md-start">
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
                            // console.log(status);
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
                                    className="text-muted text-uppercase"
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
                                  <div className="btn-group">
                                    <div className="btn-group"></div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* vitew task Modal */}
            {/* <div
              className="modal fade"
              id="viewtask"
              tabIndex={-1}
              aria-hidden="true"
            >
              <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5
                      className="modal-title  fw-bold"
                      id="createprojectlLabel"
                    >
                      {currProj.projectName} - View Task
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    />
                  </div>
                  <div className="modal-body">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th scope="col">Task name</th>
                          <th scope="col">Assignee</th>
                          <th scope="col">Due Date</th>
                          <th scope="col">Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><input className="w-100" type="text"
                            value={currProj?.description} 
                            style={{ outline: "none", border: "none", textWrap: "wrap" }} />fffffffffff   </td>
                          <td>{currProj.taskAssignPerson?.employeeName}, Admin</td>
                            <td>{currProj.taskAssignPerson?.employeeName}</td>
                          <td>ddd</td>
                          <td> www </td>
                          <td> ss </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-primary"
                    // onClick={()=>{}}
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </div> */}

          </>
        </div>
        <ToastContainer />
      </div>
    </>
  );
};

export default Project;
