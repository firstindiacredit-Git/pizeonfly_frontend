import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
// import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Loading.css"
import { useNavigate } from "react-router-dom";

const Member = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  //CREATE EMPLOYEE
  const [formData, setFormData] = useState({
    employeeName: "",
    employeeCompany: "",
    employeeImage: null,
    employeeId: "",
    joiningDate: "",
    // username: "",
    password: "",
    emailid: "",
    phone: "+91 ",
    department: "",
    designation: "",
    description: "",
  });

  const handleChange = (e) => {
    // console.log(e.target.name);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    setFormData({
      ...formData,
      employeeImage: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      for (let key in formData) {
        formDataToSend.append(key, formData[key]);
      }
      console.log(formData);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/employees`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newEmployee = response.data;
      setEmployees((prevEmployee) => [newEmployee, ...prevEmployee]);
      // Clear the form
      setFormData({
        employeeName: "",
        employeeCompany: "",
        employeeImage: null,
        employeeId: "",
        joiningDate: "",
        // username: "",
        password: "",
        emailid: "",
        phone: "+91 ",
        department: "",
        designation: "",
        description: "",
      });

      // Close the modal programmatically
      const modalElement = document.getElementById("createemp");
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      modal.hide();

      // console.log(response.data);
      // window.location.reload();

      toast.success("Employee Added Successfully!", {
        style: {
          backgroundColor: "#4c3575",
          color: "white",
        },
      });
        // Reload the page after 5 seconds
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      // Handle successful response

    } catch (error) {
      console.error("Error:", error);
      // Handle error
    }
  };

  //   GET EMPLOYEES
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}api/employees`
        );

        let lastOldId = 1;
        response.data.forEach((d) => {
          const newId = parseInt(d.employeeId.slice(2), 10);
          if (!Number.isNaN(newId) && newId > lastOldId) {
            lastOldId = newId;
          }
        });

        const newId = `TN00${lastOldId + 1}`;
        setFormData((prevFormData) => ({
          ...prevFormData,
          employeeId: newId,
        }));
        console.log(response.data, "lll");
        
        setEmployees(response.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  //DELETE EMPLOYEE
  const [deletableId, setDeletableId] = useState("");
  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}api/employees/` + deletableId
      );
      // console.log(response.data);
      // window.location.reload();
      const remainingEmployee = employees.filter((prevEmployee) => {
        return prevEmployee._id !== deletableId;
      });
      setEmployees(remainingEmployee);

      const modalElement = document.getElementById("deleteproject");
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      modal.hide();

      toast.error("Employee Deleted Successfully!", {
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

  // UPDATE EMPLOYEE
  const [employeeData, setEmployeeData] = useState({
    employeeName: "",
    employeeCompany: "",
    employeeImage: null,
    employeeId: "",
    joiningDate: "",
    username: "",
    password: "",
    emailid: "",
    phone: "+91",
    department: "",
    designation: "",
    description: "",
  });
  const [toEdit, setToEdit] = useState("");
  // console.log(projectFormData);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}api/employees/${toEdit}`
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
        const fStartDate = fDate(data.joiningDate);
        // console.log(fStartDate);
        setEmployeeData({
          employeeName: data.employeeName,
          employeeCompany: data.employeeCompany,
          employeeImage: data.employeeImage,
          employeeId: data.employeeId,
          joiningDate: fStartDate,
          username: data.username,
          password: data.password,
          emailid: data.emailid,
          phone: data.phone,
          department: data.department,
          designation: data.designation,
          description: data.description,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (toEdit) {
      fetchData();
    }
  }, [toEdit]);
  const updateChange = (e) => {
    const { name, value, files } = e.target;
    // console.log(value);
    setEmployeeData((prevState) => ({
      ...prevState,
      [name]: files ? files[0] : value,
    }));
  };
  const updateSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      delete employeeData?.taskAssignPerson;
      for (const key in employeeData) {
        // console.log(key);
        formDataToSend.append(key, employeeData[key]);
      }
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}api/employees/${toEdit}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // console.log(response.data);
      const updatedEmployee = response.data;
      const updatedEmployeeData = employees.map((pro) => {
        if (pro._id === toEdit) {
          return {
            ...pro,
            employeeName: updatedEmployee.employeeName,
            employeeCompany: updatedEmployee.employeeCompany,
            employeeImage: updatedEmployee.employeeImage,
            employeeId: updatedEmployee.employeeId,
            joiningDate: updatedEmployee.joiningDate,
            username: updatedEmployee.username,
            password: updatedEmployee.password,
            emailid: updatedEmployee.emailid,
            phone: updatedEmployee.phone,
            department: updatedEmployee.department,
            designation: updatedEmployee.designation,
            description: updatedEmployee.description,
          };
        } else {
          return pro;
        }
      });
      setEmployees(updatedEmployeeData);

      const modalElement = document.getElementById("editemp");
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      modal.hide();
      // window.location.reload();

      toast.success("Employee Updated Successfully!", {
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

  // GET SINGLE EMPLOYEE
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = async (searchQuery) => {
    if (searchQuery !== "") {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}api/search?id=${searchQuery}`
        );
        setEmployees(response.data);
      } catch (error) {
        console.error("Error:", error);
        setEmployees(null);
      }
    } else {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}api/employees`
          );
          setEmployees(response.data);
        } catch (error) {
          console.error("Error:", error);
        }
      };

      fetchData();
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
                <div className="row clearfix">
                  <div className="col-md-12">
                    <div className="card border-0 mb-4 no-bg">
                      <div className="card-header py-3 px-0 d-sm-flex align-items-center  justify-content-between border-bottom">
                        <h3 className=" fw-bold flex-fill mb-0 mt-sm-0">
                          Employees
                        </h3>
                        <button
                          type="button"
                          className="btn btn-dark me-1 mt-1 w-sm-100"
                          data-bs-toggle="modal"
                          data-bs-target="#createemp"
                        >
                          <i className="icofont-plus-circle me-2 fs-6" />
                          Add Employee
                        </button>
                        <div className="order-0 col-lg-4 col-md-4 col-sm-12 col-12 mb-3 mb-md-0 ">
                          <div className="input-group">
                            <input
                              type="search"
                              className="form-control"
                              aria-label="search"
                              aria-describedby="addon-wrapping"
                              value={searchQuery}
                              // onChange={(e) => setSearchQuery(e.target.value)}
                              onChange={(e) => {
                                setSearchQuery(e.target.value);
                                handleSearch(e.target.value);
                              }}
                              placeholder="Enter Employee Name"
                            />
                            {/* <button
                              type="button"
                              className="input-group-text add-member-top"
                              id="addon-wrappingone"
                              data-bs-toggle="modal"
                              data-bs-target="#addUser"
                            >
                              <i className="fa fa-plus" />
                            </button> */}
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
                  </div>
                </div>
                {/* Row End */}
                {loading ? (
                  <div className="custom-loader "></div>
                ) : (
                  <div className="row g-3 row-cols-1 row-cols-sm-1 row-cols-md-1 row-cols-lg-2 row-cols-xl-2 row-cols-xxl-2 row-deck py-1 pb-4">
                    {employees.map((employee) => {
                      const newDate = new Date(employee?.joiningDate);
                      const date = newDate.getDate();
                      const month = newDate.getMonth() + 1; // months are 0-indexed
                      const year = newDate.getFullYear();
                      return (
                        <div className="col" key={employee.employeeId}>
                          <div className="card teacher-card">
                            <div className="card-body d-flex">
                              <div className="profile-av pe-xl-4 pe-md-2 pe-sm-4 pe-4 text-center w220">
                                <img
                                  src={`${import.meta.env.VITE_BASE_URL}${employee.employeeImage}`}
                                  alt=""
                                  className="avatar xl rounded-circle img-thumbnail shadow-sm"
                                />
                                <div className="about-info mt-3">
                                  <div className="followers me-2">
                                    <i className="bi bi-person-vcard-fill text-danger fs-6 me-2" />
                                    <span>{employee.employeeId}</span>
                                  </div>
                                  <div className="followers me-2">
                                    {/* <i className="bi bi-person-fill text-primary fs-6 me-2" />
                      <span>{employee.username}</span> */}
                                  </div>
                                  <div className="own-video">
                                    <i className="bi bi-telephone-fill text-success fs-6 me-2" />
                                    <span>{employee.phone}</span>
                                  </div>
                                  <p className="rounded-1 d-inline-block fw-bold small-11 mb-1 d-flex">
                                    <i className="bi bi-envelope-at-fill text-primary fs-6 me-1" />
                                    {employee.emailid}
                                  </p>
                                </div>
                              </div>
                              <div className="teacher-info border-start ps-xl-4 ps-md-3 ps-sm-4 ps-4 w-100">
                                <div>
                                  <div className="d-flex justify-content-between">
                                    <h6 className="mb-0 mt-2 fw-bold d-block fs-6">
                                      {employee.employeeName}
                                    </h6>
                                    <div
                                      className="btn-group"
                                      role="group"
                                      aria-label="Basic outlined example"
                                    >
                                      <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#editemp"
                                        onClick={() => setToEdit(employee._id)}
                                      >
                                        <i className="icofont-edit text-success" />
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        data-bs-toggle="modal"
                                        data-bs-target="#deleteproject"
                                        onClick={() => {
                                          setDeletableId(employee._id);
                                        }}
                                      >
                                        <i className="icofont-ui-delete text-danger" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="d-flex justify-content-between">
                                    <span className="light-info-bg py-1 px-2 rounded-1 d-inline-block fw-bold small-11 mb-0 mt-1">
                                      <i className="bi bi-calendar-check-fill text-primary fs-6 me-2" />
                                      {date}/{month}/{year}
                                    </span>
                                    <span className="light-info-bg p-2 rounded-1 d-inline-block fw-bold small-11 mb-0 mt-1">
                                      {employee.designation}
                                    </span>
                                  </div>
                                </div>
                                <div className="video-setting-icon mt-2 pt-2 border-top">
                                  <p>{employee.description}</p>
                                </div>
                                <div className="d-flex justify-content-center">
                                  {/* <Link
                    className="ms-link d-flex justify-content-center"
                    to="/tasks"
                  >
                    <div className="btn btn-dark btn-sm mt-1 ">
                      <i className="icofont-plus-circle me-2 fs-6" />
                      Add Task
                    </div>
                  </Link> */}
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
            {/* Modal Members*/}
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
                      Employee Invitation
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    />
                  </div>
                  <div className="modal-body">
                    <div className="inviteby_email">
                      <div className="input-group mb-3">
                        <input
                          type="email"
                          className="form-control"
                          placeholder="Email address"
                          id="exampleInputEmail1"
                          aria-describedby="exampleInputEmail1"
                        />
                        <button
                          className="btn btn-dark"
                          type="button"
                          id="button-addon2"
                        >
                          Sent
                        </button>
                      </div>
                    </div>
                    <div className="members_list">
                      <h6 className="fw-bold ">Employee </h6>
                      <ul className="list-unstyled list-group list-group-custom list-group-flush mb-0">
                        <li className="list-group-item py-3 text-center text-md-start">
                          <div className="d-flex align-items-center flex-column flex-sm-column flex-md-row">
                            <div className="no-thumbnail mb-2 mb-md-0">
                              <img
                                className="avatar lg rounded-circle"
                                src="assets/images/xs/avatar2.jpg"
                                alt=""
                              />
                            </div>
                            <div className="flex-fill ms-3 text-truncate">
                              <h6 className="mb-0  fw-bold">
                                Rachel Carr(you)
                              </h6>
                              <span className="text-muted">
                                rachel.carr@gmail.com
                              </span>
                            </div>
                            <div className="members-action">
                              <span className="members-role ">Admin</span>
                              <div className="btn-group">
                                <button
                                  type="button"
                                  className="btn bg-transparent dropdown-toggle"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  <i className="icofont-ui-settings  fs-6" />
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                  <li>
                                    <a className="dropdown-item" href="#">
                                      <i className="icofont-ui-password fs-6 me-2" />
                                      ResetPassword
                                    </a>
                                  </li>
                                  <li>
                                    <a className="dropdown-item" href="#">
                                      <i className="icofont-chart-line fs-6 me-2" />
                                      ActivityReport
                                    </a>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item py-3 text-center text-md-start">
                          <div className="d-flex align-items-center flex-column flex-sm-column flex-md-row">
                            <div className="no-thumbnail mb-2 mb-md-0">
                              <img
                                className="avatar lg rounded-circle"
                                src="assets/images/xs/avatar3.jpg"
                                alt=""
                              />
                            </div>
                            <div className="flex-fill ms-3 text-truncate">
                              <h6 className="mb-0  fw-bold">
                                Lucas Baker
                                <a href="#" className="link-secondary ms-2">
                                  (Resend invitation)
                                </a>
                              </h6>
                              <span className="text-muted">
                                lucas.baker@gmail.com
                              </span>
                            </div>
                            <div className="members-action">
                              <div className="btn-group">
                                <button
                                  type="button"
                                  className="btn bg-transparent dropdown-toggle"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  Members
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                  <li>
                                    <a className="dropdown-item" href="#">
                                      <i className="icofont-check-circled" />
                                      Member
                                      <span>
                                        Can view, edit, delete, comment on and
                                        save files
                                      </span>
                                    </a>
                                  </li>
                                  <li>
                                    <a className="dropdown-item" href="#">
                                      <i className="fs-6 p-2 me-1" />
                                      Admin
                                      <span>
                                        Member, but can invite and manage team
                                        members
                                      </span>
                                    </a>
                                  </li>
                                </ul>
                              </div>
                              <div className="btn-group">
                                <button
                                  type="button"
                                  className="btn bg-transparent dropdown-toggle"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  <i className="icofont-ui-settings  fs-6" />
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                  <li>
                                    <a className="dropdown-item" href="#">
                                      <i className="icofont-delete-alt fs-6 me-2" />
                                      Delete Member
                                    </a>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </li>
                        <li className="list-group-item py-3 text-center text-md-start">
                          <div className="d-flex align-items-center flex-column flex-sm-column flex-md-row">
                            <div className="no-thumbnail mb-2 mb-md-0">
                              <img
                                className="avatar lg rounded-circle"
                                src="assets/images/xs/avatar8.jpg"
                                alt=""
                              />
                            </div>
                            <div className="flex-fill ms-3 text-truncate">
                              <h6 className="mb-0  fw-bold">Una Coleman</h6>
                              <span className="text-muted">
                                una.coleman@gmail.com
                              </span>
                            </div>
                            <div className="members-action">
                              <div className="btn-group">
                                <button
                                  type="button"
                                  className="btn bg-transparent dropdown-toggle"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  Members
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                  <li>
                                    <a className="dropdown-item" href="#">
                                      <i className="icofont-check-circled" />
                                      Member
                                      <span>
                                        Can view, edit, delete, comment on and
                                        save files
                                      </span>
                                    </a>
                                  </li>
                                  <li>
                                    <a className="dropdown-item" href="#">
                                      <i className="fs-6 p-2 me-1" />
                                      Admin
                                      <span>
                                        Member, but can invite and manage team
                                        members
                                      </span>
                                    </a>
                                  </li>
                                </ul>
                              </div>
                              <div className="btn-group">
                                <div className="btn-group">
                                  <button
                                    type="button"
                                    className="btn bg-transparent dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                  >
                                    <i className="icofont-ui-settings  fs-6" />
                                  </button>
                                  <ul className="dropdown-menu dropdown-menu-end">
                                    <li>
                                      <a className="dropdown-item" href="#">
                                        <i className="icofont-ui-password fs-6 me-2" />
                                        ResetPassword
                                      </a>
                                    </li>
                                    <li>
                                      <a className="dropdown-item" href="#">
                                        <i className="icofont-chart-line fs-6 me-2" />
                                        ActivityReport
                                      </a>
                                    </li>
                                    <li>
                                      <a className="dropdown-item" href="#">
                                        <i className="icofont-delete-alt fs-6 me-2" />
                                        Suspend member
                                      </a>
                                    </li>
                                    <li>
                                      <a className="dropdown-item" href="#">
                                        <i className="icofont-not-allowed fs-6 me-2" />
                                        Delete Member
                                      </a>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Update Employee*/}
            <div
              className="modal fade"
              id="editemp"
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
                      {" "}
                      Edit Employee
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
                        htmlFor="exampleFormControlInput877"
                        className="form-label"
                      >
                        Employee Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="exampleFormControlInput877"
                        placeholder="Explain what the Project Name"
                        name="employeeName"
                        value={employeeData.employeeName}
                        onChange={updateChange}
                      />
                    </div>
                    {/* <div className="mb-3">
                      <label
                        htmlFor="exampleFormControlInput977"
                        className="form-label"
                      >
                        Employee Company
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="exampleFormControlInput977"
                        placeholder="Explain what the Project Name"
                        name="employeeCompany"
                        value={employeeData.employeeCompany}
                        onChange={updateChange}
                      />
                    </div> */}
                    <div className="mb-3">
                      <label
                        htmlFor="formFileMultipleoneone"
                        className="form-label"
                      >
                        Employee Profile
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        id="formFileMultipleoneone"
                        name="employeeImage"
                        onChange={handleImageChange}
                      />
                    </div>
                    <div className="deadline-form">
                      <form>
                        <div className="row g-3 mb-3">
                          <div className="col-sm-6">
                            <label
                              htmlFor="exampleFormControlInput1778"
                              className="form-label"
                            >
                              Employee ID
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleFormControlInput1778"
                              placeholder="User Name"
                              name="employeeId"
                              value={employeeData.employeeId}
                              onChange={updateChange}
                            />
                          </div>
                          <div className="col-sm-6">
                            <label
                              htmlFor="exampleFormControlInput2778"
                              className="form-label"
                            >
                              Joining Date
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              id="exampleFormControlInput2778"
                              name="joiningDate"
                              value={employeeData.joiningDate}
                              onChange={updateChange}
                            />
                          </div>
                        </div>
                        <div className="row g-3 mb-3">
                          {/* <div className="col">
                            <label
                              htmlFor="exampleFormControlInput177"
                              className="form-label"
                            >
                              User Name
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleFormControlInput177"
                              placeholder="User Name"
                              name="username"
                              value={employeeData.username}
                              onChange={updateChange}
                            />
                          </div> */}
                          <div className="col">
                            <label
                              htmlFor="exampleFormControlInput477"
                              className="form-label"
                            >
                              Email ID
                            </label>
                            <input
                              type="email"
                              className="form-control"
                              id="exampleFormControlInput477"
                              placeholder="User Name"
                              name="emailid"
                              value={employeeData.emailid}
                              onChange={updateChange}
                            />
                          </div>
                          <div className="col">
                            <label
                              htmlFor="exampleFormControlInput277"
                              className="form-label"
                            >
                              Password
                            </label>
                            <input
                              type="Password"
                              className="form-control"
                              id="exampleFormControlInput277"
                              placeholder="Password"
                              name="password"
                              value={employeeData.password}
                              onChange={updateChange}
                            />
                          </div>
                        </div>
                        <div className="row g-3 mb-3">
                          <div className="col">
                            <label
                              htmlFor="exampleFormControlInput777"
                              className="form-label"
                            >
                              Phone
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleFormControlInput777"
                              placeholder="phone"
                              maxLength={14}
                              name="phone"
                              value={employeeData.phone}
                              onChange={updateChange}
                            />
                          </div>
                        </div>
                        <div className="row g-3 mb-3">
                          <div className="col">
                            <label className="form-label">Department</label>
                            <select
                              className="form-select"
                              aria-label="Default select Project Category"
                              name="department"
                              value={employeeData.department}
                              onChange={updateChange}
                            >
                              <option value={""}></option>
                              <option value={"Web Development"}>
                                Web Development
                              </option>
                              <option value={"It Management"}>
                                It Management
                              </option>
                              <option value={"Marketing"}>Marketing</option>
                              <option value={"Manager"}>Manager</option>
                            </select>
                          </div>
                          <div className="col">
                            <label className="form-label">Designation</label>
                            <select
                              className="form-select"
                              aria-label="Default select Project Category"
                              name="designation"
                              value={employeeData.designation}
                              onChange={updateChange}
                            >
                              <option value={""}></option>
                              <option value={"UI/UX Design"}>
                                UI/UX Design
                              </option>
                              <option value={"Website Design"}>
                                Website Design
                              </option>
                              <option value={"App Development"}>
                                App Development
                              </option>
                              <option value={"Quality Assurance"}>
                                Quality Assurance
                              </option>
                              <option value={"Development"}>Development</option>
                              <option value={"Backend Development"}>
                                Backend Development
                              </option>
                              <option value={"Software Testing"}>
                                Software Testing
                              </option>
                              <option value={"Website Design"}>
                                Website Design
                              </option>
                              <option value={"Marketing"}>Marketing</option>
                              <option value={"SEO"}>SEO</option>
                              <option value={"Project Manager"}>
                                Project Manager
                              </option>
                              <option value={"Other"}>Other</option>
                            </select>
                          </div>
                        </div>
                      </form>
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="exampleFormControlTextarea78"
                        className="form-label"
                      >
                        Description (optional)
                      </label>
                      <textarea
                        className="form-control"
                        id="exampleFormControlTextarea78"
                        rows={3}
                        placeholder="Add any extra details about the request"
                        defaultValue={""}
                        name="description"
                        value={employeeData.description}
                        onChange={updateChange}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                    >
                      Done
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={updateSubmit}
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Create Employee*/}
            <div
              className="modal fade"
              id="createemp"
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
                      {" "}
                      Add Employee
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
                        htmlFor="exampleFormControlInput877"
                        className="form-label"
                      >
                        Employee Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="exampleFormControlInput877"
                        placeholder="Employee Name"
                        name="employeeName"
                        value={formData.employeeName}
                        onChange={handleChange}
                      />
                    </div>
                    {/* <div className="mb-3">
                      <label
                        htmlFor="exampleFormControlInput977"
                        className="form-label"
                      >
                        Employee Company
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="exampleFormControlInput977"
                        placeholder="Employee Company"
                        name="employeeCompany"
                        value={formData.employeeCompany}
                        onChange={handleChange}
                      />
                    </div> */}
                    <div className="mb-3">
                      <label
                        htmlFor="formFileMultipleoneone"
                        className="form-label"
                      >
                        Employee Image
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        id="formFileMultipleoneone"
                        name="employeeImage"
                        onChange={handleImageChange}
                      />
                    </div>
                    <div className="deadline-form">
                      <form>
                        <div className="row g-3 mb-3">
                          <div className="col-sm-6">
                            <label
                              htmlFor="exampleFormControlInput1778"
                              className="form-label"
                            >
                              Employee ID
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleFormControlInput1778"
                              placeholder="Employee ID"
                              name="employeeId"
                              value={formData.employeeId}
                              onChange={handleChange}
                              disabled
                            />
                          </div>
                          <div className="col-sm-6">
                            <label
                              htmlFor="exampleFormControlInput2778"
                              className="form-label"
                            >
                              Joining Date
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              id="exampleFormControlInput2778"
                              name="joiningDate"
                              value={formData.joiningDate}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="row g-3 mb-3">
                          {/* <div className="col">
                            <label
                              htmlFor="exampleFormControlInput177"
                              className="form-label"
                            >
                              User Name
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleFormControlInput177"
                              placeholder="User Name"
                              name="username"
                              value={formData.username}
                              onChange={handleChange}
                            />
                          </div> */}
                          <div className="col">
                            <label
                              htmlFor="exampleFormControlInput477"
                              className="form-label"
                            >
                              Email ID
                            </label>
                            <input
                              type="email"
                              className="form-control"
                              id="exampleFormControlInput477"
                              placeholder="Email ID"
                              name="emailid"
                              value={formData.emailid}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="col">
                            <label
                              htmlFor="exampleFormControlInput277"
                              className="form-label"
                            >
                              Password
                            </label>
                            <input
                              type="Password"
                              className="form-control"
                              id="exampleFormControlInput277"
                              placeholder="Password"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="row g-3 mb-3">
                          <div className="col">
                            <label
                              htmlFor="exampleFormControlInput777"
                              className="form-label"
                            >
                              Phone
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleFormControlInput777"
                              placeholder="Phone"
                              maxLength={14}
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="row g-3 mb-3">
                          <div className="col">
                            <label className="form-label">Department</label>
                            <select
                              className="form-select"
                              aria-label="Default select Project Category"
                              name="department"
                              value={formData.department}
                              onChange={handleChange}
                            >
                              <option value={""}>Select Department</option>
                              <option value={"Web Development"}>
                                Web Development
                              </option>
                              <option value={"It Management"}>
                                It Management
                              </option>
                              <option value={"Marketing"}>Marketing</option>
                              <option value={"Manager"}>Manager</option>
                            </select>
                          </div>
                          <div className="col">
                            <label className="form-label">Designation</label>
                            <select
                              className="form-select"
                              aria-label="Default select Project Category"
                              name="designation"
                              value={formData.designation}
                              onChange={handleChange}
                            >
                              <option value={""}>Select Designation</option>
                              <option value={"UI/UX Design"}>
                                UI/UX Design
                              </option>
                              <option value={"Website Design"}>
                                Website Design
                              </option>
                              <option value={"App Development"}>
                                App Development
                              </option>
                              <option value={"Quality Assurance"}>
                                Quality Assurance
                              </option>
                              <option value={"Development"}>Development</option>
                              <option value={"Backend Development"}>
                                Backend Development
                              </option>
                              <option value={"Software Testing"}>
                                Software Testing
                              </option>
                              <option value={"Website Design"}>
                                Website Design
                              </option>
                              <option value={"Marketing"}>Marketing</option>
                              <option value={"SEO"}>SEO</option>
                              <option value={"Project Manager"}>
                                Project Manager
                              </option>
                              <option value={"Other"}>Other</option>
                            </select>
                          </div>
                        </div>
                      </form>
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="exampleFormControlTextarea78"
                        className="form-label"
                      >
                        Description (optional)
                      </label>
                      <textarea
                        className="form-control"
                        id="exampleFormControlTextarea78"
                        rows={3}
                        placeholder="Add any extra details about the request"
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
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                    >
                      Done
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSubmit}
                    >
                      Create
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
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        </div>
        <ToastContainer />
      </div>
    </>
  );
};

export default Member;
