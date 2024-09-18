import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Header = () => {
  const [employeeName, setEmployeeName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const navigation = useNavigate();

  const [employeeData, setEmployeeData] = useState({
    employeeName: "",
    employeeCompany: "",
    employeeImage: null,
    employeeId: "",
    joiningDate: "",
    username: "",
    password: "",
    emailid: "",
    phone: "",
    department: "",
    designation: "",
    description: "",
  });
  useEffect(() => {
    const token = localStorage.getItem("emp_token");

    if (!token) {
      navigation("/");
    }
    const user = JSON.parse(localStorage.getItem("emp_user"));
    if (token) {
      setEmployeeData({
        ...employeeData,
        employeeName: user.employeeName,
        emailid: user.emailid,
        password: user.password,
      });
      setEmployeeName(user.employeeName);
      setEmail(user.emailid);
      setImage(user.employeeImage);
    }
  }, [navigation]);

  const handleSignOut = () => {
    localStorage.removeItem("emp_token");
    localStorage.removeItem("emp_user");
    navigation("/employeesignin");
  };

  //   GET EMPLOYEES
  const [employees, setEmployees] = useState([]);
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

  // UPDATE EMPLOYEE
  const [formData, setFormData] = useState({
    employeeName: "",
    employeeCompany: "",
    employeeImage: null,
    employeeId: "",
    joiningDate: "",
    username: "",
    password: "",
    emailid: "",
    phone: "",
    department: "",
    designation: "",
    description: "",
  });

  const handleImageChange = (e) => {
    setFormData({
      ...formData,
      employeeImage: e.target.files[0],
    });
  };

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
      const { token, user } = response.data;
      localStorage.setItem("emp_token", token);
      localStorage.setItem("emp_user", JSON.stringify(user));
      console.log(JSON.stringify(response.data));
      // console.log(response.data);
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <div className="header">
        <nav className="navbar py-4">
          <div className="container-xxl">
            {/* header rightbar icon */}
            <div className="h-right d-flex align-items-center mr-5 mr-lg-0 order-1">
              {/* <div className="d-flex">
                <a
                  className="nav-link text-primary collapsed"
                  href="help.html"
                  title="Get Help"
                >
                  <i className="icofont-info-square fs-5" />
                </a>
                <div className="avatar-list avatar-list-stacked px-3">
                  <img
                    className="avatar rounded-circle"
                    src="assets/images/xs/avatar2.jpg"
                    alt=""
                  />
                  <img
                    className="avatar rounded-circle"
                    src="assets/images/xs/avatar1.jpg"
                    alt=""
                  />
                  <img
                    className="avatar rounded-circle"
                    src="assets/images/xs/avatar3.jpg"
                    alt=""
                  />
                  <img
                    className="avatar rounded-circle"
                    src="assets/images/xs/avatar4.jpg"
                    alt=""
                  />
                  <img
                    className="avatar rounded-circle"
                    src="assets/images/xs/avatar7.jpg"
                    alt=""
                  />
                  <img
                    className="avatar rounded-circle"
                    src="assets/images/xs/avatar8.jpg"
                    alt=""
                  />
                  <span
                    className="avatar rounded-circle text-center pointer"
                    data-bs-toggle="modal"
                    data-bs-target="#addUser"
                  >
                    <i className="icofont-ui-add" />
                  </span>
                </div>
              </div> */}
              {/* <div className="dropdown notifications">
                <a
                  className="nav-link dropdown-toggle pulse"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  <i className="icofont-alarm fs-5" />
                  <span className="pulse-ring" />
                </a>
                <div
                  id="NotificationsDiv"
                  className="dropdown-menu rounded-lg shadow border-0 dropdown-animation dropdown-menu-sm-end p-0 m-0"
                >
                  <div className="card border-0 w380">
                    <div className="card-header border-0 p-3">
                      <h5 className="mb-0 font-weight-light d-flex justify-content-between">
                        <span>Notifications</span>
                        <span className="badge text-white">11</span>
                      </h5>
                    </div>
                    <div className="tab-content card-body">
                      <div className="tab-pane fade show active">
                        <ul className="list-unstyled list mb-0">
                          <li className="py-2 mb-1 border-bottom">
                            <a href="#" className="d-flex">
                              <img
                                className="avatar rounded-circle"
                                src="assets/images/xs/avatar1.jpg"
                                // src={"${import.meta.env.VITE_BASE_URL}" + image}
                                alt=""
                              />
                              <div className="flex-fill ms-2">
                                <p className="d-flex justify-content-between mb-0 ">
                                  <span className="font-weight-bold">
                                    Dylan Hunter
                                  </span>{" "}
                                  <small>2MIN</small>
                                </p>
                                <span className="">
                                  Added 2021-02-19 my-Task ui/ux Design{" "}
                                  <span className="badge bg-success">
                                    Review
                                  </span>
                                </span>
                              </div>
                            </a>
                          </li>
                          <li className="py-2 mb-1 border-bottom">
                            <a href="#" className="d-flex">
                              <div className="avatar rounded-circle no-thumbnail">
                                DF
                              </div>
                              <div className="flex-fill ms-2">
                                <p className="d-flex justify-content-between mb-0 ">
                                  <span className="font-weight-bold">
                                    Diane Fisher
                                  </span>{" "}
                                  <small>13MIN</small>
                                </p>
                                <span className="">
                                  Task added Get Started with Fast Cad project
                                </span>
                              </div>
                            </a>
                          </li>
                          <li className="py-2 mb-1 border-bottom">
                            <a href="#" className="d-flex">
                              <img
                                className="avatar rounded-circle"
                                src="assets/images/xs/avatar3.jpg"
                                alt=""
                              />
                              <div className="flex-fill ms-2">
                                <p className="d-flex justify-content-between mb-0 ">
                                  <span className="font-weight-bold">
                                    Andrea Gill
                                  </span>{" "}
                                  <small>1HR</small>
                                </p>
                                <span className="">
                                  Quality Assurance Task Completed
                                </span>
                              </div>
                            </a>
                          </li>
                          <li className="py-2 mb-1 border-bottom">
                            <a href="#" className="d-flex">
                              <img
                                className="avatar rounded-circle"
                                src="assets/images/xs/avatar5.jpg"
                                alt=""
                              />
                              <div className="flex-fill ms-2">
                                <p className="d-flex justify-content-between mb-0 ">
                                  <span className="font-weight-bold">
                                    Diane Fisher
                                  </span>{" "}
                                  <small>13MIN</small>
                                </p>
                                <span className="">
                                  Add New Project for App Developemnt
                                </span>
                              </div>
                            </a>
                          </li>
                          <li className="py-2 mb-1 border-bottom">
                            <a href="#" className="d-flex">
                              <img
                                className="avatar rounded-circle"
                                src="assets/images/xs/avatar6.jpg"
                                alt=""
                              />
                              <div className="flex-fill ms-2">
                                <p className="d-flex justify-content-between mb-0 ">
                                  <span className="font-weight-bold">
                                    Andrea Gill
                                  </span>{" "}
                                  <small>1HR</small>
                                </p>
                                <span className="">
                                  Add Timesheet For Rhinestone project
                                </span>
                              </div>
                            </a>
                          </li>
                          <li className="py-2">
                            <a href="#" className="d-flex">
                              <img
                                className="avatar rounded-circle"
                                src="assets/images/xs/avatar7.jpg"
                                alt=""
                              />
                              <div className="flex-fill ms-2">
                                <p className="d-flex justify-content-between mb-0 ">
                                  <span className="font-weight-bold">
                                    Zoe Wright
                                  </span>{" "}
                                  <small className="">1DAY</small>
                                </p>
                                <span className="">Add Calander Event</span>
                              </div>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <a
                      className="card-footer text-center border-top-0"
                      href="#"
                    >
                      {" "}
                      View all notifications
                    </a>
                  </div>
                </div>
              </div> */}
              <div className="dropdown user-profile ml-2 ml-sm-3 d-flex align-items-center">
                <div className="u-info me-2">
                  <p className="mb-0 text-end line-height-sm ">
                    <span className="font-weight-bold">{employeeName}</span>
                  </p>
                  <small>Employee Profile</small>
                </div>
                <a
                  className="nav-link dropdown-toggle pulse p-0"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  data-bs-display="static"
                >
                  <img
                    className="avatar lg rounded-circle img-thumbnail"
                    // src="assets/images/profile_av.png"
                    src={`${import.meta.env.VITE_BASE_URL}` + image}
                    alt="profile"
                  />
                </a>
                <div className="dropdown-menu rounded-lg shadow border-0 dropdown-animation dropdown-menu-end p-0 m-0">
                  <div className="card border-0 w280">
                    <div className="card-body pb-0">
                      <div className="d-flex py-1">
                        <img
                          className="avatar rounded-circle"
                          src={`${import.meta.env.VITE_BASE_URL}` + image}
                          alt="profile"
                        />
                        <div className="flex-fill ms-3">
                          <p className="mb-0">
                            <span className="font-weight-bold">
                              {employeeName}
                            </span>
                          </p>
                          <p style={{width:"210px", fontSize:"small"}}>{email}</p>
                        </div>
                      </div>
                      <div>
                        <hr className="dropdown-divider border-dark" />
                      </div>
                    </div>
                    <div className="list-group m-2 ">
                      {/* <a
                        href="task.html"
                        className="list-group-item list-group-item-action border-0 "
                      >
                        <i className="icofont-tasks fs-5 me-3" />
                        My Task
                      </a> */}
                      <Link
                        type=""
                        className="list-group-item list-group-item-action border-0"
                        data-bs-toggle="modal"
                        data-bs-target="#editemp"
                        onClick={() => setToEdit(employees._id)}
                      >
                        <i className="icofont-ui-user-group fs-6 me-3" /> Edit
                        Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="list-group-item list-group-item-action border-0 "
                      >
                        <i className="icofont-logout fs-6 me-3" />
                        Signout
                      </button>
                      <div>
                        <hr className="dropdown-divider border-dark" />
                      </div>
                      {/* <a
                        href="ui-elements/auth-signup.html"
                        className="list-group-item list-group-item-action border-0 "
                      >
                        <i className="icofont-contact-add fs-5 me-3" />
                        Add personal account
                      </a> */}
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="px-md-1">
                <a
                  href="#offcanvas_setting"
                  data-bs-toggle="offcanvas"
                  aria-expanded="false"
                  title="template setting"
                >
                  <svg
                    className="svg-stroke"
                    xmlns="http://www.w3.org/2000/svg"
                    width={22}
                    height={22}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
                    <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                  </svg>
                </a>
              </div> */}
            </div>
            {/* menu toggler */}
            <button
              className="navbar-toggler p-0 border-0 menu-toggle order-3"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#mainHeader"
            >
              <span className="fa fa-bars" />
            </button>
            <div className="order-0 col-lg-4 col-md-4 col-sm-12 col-12 mb-3 mb-md-0 ">
              {/* <div className="input-group flex-nowrap input-group-lg">
                <button
                  type="button"
                  className="input-group-text"
                  id="addon-wrapping"
                >
                  <i className="fa fa-search" />
                </button>
                <input
                  type="search"
                  className="form-control"
                  placeholder="Search"
                  aria-label="search"
                  aria-describedby="addon-wrapping"
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
              </div> */}
            </div>

            {/* Edit Employee*/}
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
                      Edit Profile
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
                        placeholder="Enter your name"
                        name="employeeName"
                        value={employeeData.employeeName}
                        onChange={updateChange}
                      />
                    </div>
                    <div className="mb-3">
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
                    </div>
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
                              value={employeeData.joiningDate}
                              onChange={updateChange}
                              disabled
                            />
                          </div>
                        </div>
                        <div className="row g-3 mb-3">
                          <div className="col">
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
                              htmlFor="exampleFormControlInput777"
                              className="form-label"
                            >
                              Phone
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleFormControlInput777"
                              placeholder="User Name"
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
                              disabled
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
                              disabled
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
          </div>
        </nav>
      </div>
    </>
  );
};

export default Header;
