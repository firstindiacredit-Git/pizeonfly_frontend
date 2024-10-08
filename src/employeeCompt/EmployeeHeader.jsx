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
                          <p style={{ width: "210px", fontSize: "small" }}>{email}</p>
                        </div>
                      </div>
                      <div>
                        <hr className="dropdown-divider border-dark" />
                      </div>
                    </div>
                    <div className="list-group m-2 ">
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
                      <Link
                        type=""
                        className="list-group-item list-group-item-action border-0"
                        data-bs-toggle="modal"
                        data-bs-target="#taskMessage"
                      >
                        <i className="icofont-ui-message fs-6 me-3" /> Message
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
                    </div>
                  </div>
                </div>
              </div>
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

                      <li className="list-group-item">
                        <div className="d-flex border-bottom py-1">
                          <span className="px-3 text-break">
                            {/* message content */}
                          </span>
                        </div>
                      </li>

                    </ul>
                    <form>
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


          </div>
        </nav>
      </div>
    </>
  );
};

export default Header;
