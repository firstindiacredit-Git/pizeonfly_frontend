import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Header = () => {
  const [employeeName, setEmployeeName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [aadhaarCard, setAadhaarCard] = useState("");
  const [panCard, setPanCard] = useState("");
  const [resume, setResume] = useState("");
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
    aadhaarCard: null,
    panCard: null,
    resume: null,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const dropdownRef = useRef(null);
  const [pdfUrl, setPdfUrl] = useState(null);

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
        employeeCompany: user.employeeCompany || "", // Add more fields as needed
        employeeId: user.employeeId || "", // Ensure employeeId is set
        joiningDate: user.joiningDate ? user.joiningDate.split('T')[0] : "", // Format date if necessary
        username: user.username || "",
        password: user.password || "",
        emailid: user.emailid || "",
        phone: user.phone || "",
        department: user.department || "",
        designation: user.designation || "",
        description: user.description || "",
        employeeImage: user.employeeImage ? user.employeeImage.replace('uploads/', '') : null,
      });
      setEmployeeName(user.employeeName);
      setEmail(user.emailid);
      setAadhaarCard(user.aadhaarCard);
      setPanCard(user.panCard);
      setResume(user.resume);
      // Remove 'uploads/' from the employeeImage path
      const modifiedImage = user.employeeImage.replace('uploads/', '');
      setImage(modifiedImage);
    }
  }, [navigation]);

  useEffect(() => {
    const positionDropdown = () => {
      if (dropdownRef.current) {
        const dropdown = dropdownRef.current;
        const rect = dropdown.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        if (rect.right > viewportWidth) {
          dropdown.style.left = 'auto';
          dropdown.style.right = '0';
        } else {
          dropdown.style.left = '';
          dropdown.style.right = '';
        }
      }
    };

    window.addEventListener('resize', positionDropdown);
    positionDropdown(); // Initial positioning

    return () => window.removeEventListener('resize', positionDropdown);
  }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const updateSubmit = async () => {
    const formData = new FormData();
    formData.append("employeeName", employeeData.employeeName);
    formData.append("joiningDate", employeeData.joiningDate);
    formData.append("emailid", employeeData.emailid);
    formData.append("password", employeeData.password);
    formData.append("phone", employeeData.phone);
    formData.append("description", employeeData.description);

    if (selectedFile) {
      formData.append("employeeImage", selectedFile);
    }

    // Add new file uploads
    if (employeeData.aadhaarCard) {
      formData.append("aadhaarCard", employeeData.aadhaarCard);
    }
    if (employeeData.panCard) {
      formData.append("panCard", employeeData.panCard);
    }
    if (employeeData.resume) {
      formData.append("resume", employeeData.resume);
    }

    try {
      const token = localStorage.getItem("emp_token");
      const employeeId = JSON.parse(localStorage.getItem("emp_user"))._id;

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}api/employees/${employeeId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );

      if (response.status === 200) {
        // Update localStorage with new user data
        const updatedUser = response.data;
        localStorage.setItem("emp_user", JSON.stringify(updatedUser));

        // Update local state to reflect new data
        setEmployeeName(updatedUser.employeeName);
        const updatedImage = updatedUser.employeeImage.replace('uploads/', '');
        setImage(updatedImage);

        // Close the modal
        const modalElement = document.getElementById("editemp");
        const modal = window.bootstrap.Modal.getInstance(modalElement);
        modal.hide();

        // Show toast notification
        toast.success("Your Profile Updated Successfully!", {
          style: {
            backgroundColor: "#4c3575",
            color: "white",
          },
        });

        // Reload the page after 5 seconds
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      }
    } catch (err) {
      if (err.response && err.response.status === 413) {
        toast.error("Uploaded file is too large. Please select a smaller file.");
      } else {
        console.log(err);
        alert("Error updating profile.");
      }
    }
  };

  const handleImageClick = useCallback((imageUrl) => {
    window.open(imageUrl, '_blank');
  }, []);

  const [selectedImage, setSelectedImage] = useState(null);

  const handleFileClick = useCallback((e, fileUrl, fileType) => {
    e.preventDefault(); // Prevent default link behavior
    e.stopPropagation(); // Stop event propagation
    if (fileType === 'pdf') {
      setPdfUrl(fileUrl);
    } else {
      setSelectedImage(fileUrl);
    }
  }, []);

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const closePdfViewer = () => {
    setPdfUrl(null);
  };

  useEffect(() => {
    // Check if any required document is missing
    const checkMissingDocuments = () => {
      const user = JSON.parse(localStorage.getItem("emp_user"));
      if (user && (!user.aadhaarCard || !user.panCard || !user.resume)) {
        toast.error("Please update your profile with missing documents.", {
          style: {
            backgroundColor: "#4c3575",
            color: "white",
          },
        });
      }
    };

    // Initial check
    checkMissingDocuments();

    // Set up interval to check every minute
    const intervalId = setInterval(checkMissingDocuments, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <div className="header">
        <nav className="navbar py-4">
          <div className="container-xxl">
            {/* header rightbar icon */}
            <div className="h-right d-flex align-items-center mr-5 mr-lg-0 order-1">
              <div className="dropdown user-profile ml-2 ml-sm-3 d-flex align-items-center zindex-popover">
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
                <div className="dropdown-menu rounded-lg shadow border-0 dropdown-animation dropdown-menu-end p-0 m-0"
                  ref={dropdownRef}>
                  <div className="card border-0 w280">
                    <div className="card-body pb-0">
                      <div className="d-flex py-1">
                        <img
                          className="avatar rounded-circle"
                          src={`${import.meta.env.VITE_BASE_URL}` + image}
                          alt="profile"
                          style={{
                            transition: 'transform 0.3s ease-in-out',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(8)';
                            e.target.style.zIndex = '100';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.zIndex = '1';
                          }}
                          onClick={() => handleImageClick(`${import.meta.env.VITE_BASE_URL}${image}`)}
                        />
                        <div className="flex-fill ms-3">
                          <p className="mb-0">
                            <span className="font-weight-bold">
                              {employeeName}
                            </span>
                          </p>
                          <p style={{ width: "210px", fontSize: "small" }}>{email}</p>
                          {/* <img src={`${import.meta.env.VITE_BASE_URL}` + resume} alt="" className="avatar sm img-thumbnail shadow-sm" /> */}
                            <div style={{marginTop:"-18px"}}>
                              <strong>Aadhaar Card - </strong>
                              {aadhaarCard ? (
                                aadhaarCard.toLowerCase().endsWith('.pdf') ? (
                                  <a href="#" onClick={(e) => handleFileClick(e, `${import.meta.env.VITE_BASE_URL}${aadhaarCard.replace('uploads/', '')}`, 'pdf')}>View PDF</a>
                                ) : (
                                  <img
                                    src={`${import.meta.env.VITE_BASE_URL}${aadhaarCard.replace('uploads/', '')}`}
                                    alt="Aadhaar Card"
                                    className="avatar sm img-thumbnail shadow-sm"
                                    onClick={(e) => handleFileClick(e, `${import.meta.env.VITE_BASE_URL}${aadhaarCard.replace('uploads/', '')}`, 'image')}
                                    style={{ cursor: 'pointer' }}
                                  />
                                )
                              ) : (
                                <i className="bi bi-x-lg text-danger"></i>
                              )}
                            </div>

                            <div>
                              <strong>Pan Card - </strong>
                              {panCard ? (
                                panCard.toLowerCase().endsWith('.pdf') ? (
                                  <a href="#" onClick={(e) => handleFileClick(e, `${import.meta.env.VITE_BASE_URL}${panCard.replace('uploads/', '') }`, 'pdf')}>View PDF</a>
                                ) : (
                                  <img
                                    src={`${import.meta.env.VITE_BASE_URL}${panCard.replace('uploads/', '')}`}
                                    alt="Pan Card"
                                    className="avatar sm img-thumbnail shadow-sm"
                                    onClick={(e) => handleFileClick(e, `${import.meta.env.VITE_BASE_URL}${panCard.replace('uploads/', '')}`, 'image')}
                                    style={{ cursor: 'pointer' }}
                                  />
                                )
                              ) : (
                                <i className="bi bi-x-lg text-danger"></i>
                              )}
                            </div>

                            <div>
                              <strong>Resume - </strong>
                              {resume ? (
                                resume.toLowerCase().endsWith('.pdf') ? (
                                  <a href="#" onClick={(e) => handleFileClick(e, `${import.meta.env.VITE_BASE_URL}${resume.replace('uploads/', '')}`, 'pdf')}>View PDF</a>
                                ) : (
                                  <img
                                    src={`${import.meta.env.VITE_BASE_URL}${resume.replace('uploads/', '')}`}
                                    alt="Resume"
                                    className="avatar sm img-thumbnail shadow-sm"
                                    onClick={(e) => handleFileClick(e, `${import.meta.env.VITE_BASE_URL}${resume.replace('uploads/', '')}`, 'image')}
                                    style={{ cursor: 'pointer' }}
                                  />
                                )
                              ) : (
                                <i className="bi bi-x-lg text-danger"></i>
                              )}
                            </div>

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
                      // onClick={() => setToEdit(employees._id)}
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
                        onChange={handleChange}
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
                        onChange={handleFileChange}
                      />
                    </div>
                    {/* New file upload fields */}
                    <div className="mb-3">
                      <label htmlFor="aadhaarCardUpload" className="form-label">Aadhaar Card</label>
                      <input
                        type="file"
                        className="form-control"
                        id="aadhaarCardUpload"
                        name="aadhaarCard"
                        onChange={(e) => setEmployeeData({ ...employeeData, aadhaarCard: e.target.files[0] })}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="panCardUpload" className="form-label">PAN Card</label>
                      <input
                        type="file"
                        className="form-control"
                        id="panCardUpload"
                        name="panCard"
                        onChange={(e) => setEmployeeData({ ...employeeData, panCard: e.target.files[0] })}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="resumeUpload" className="form-label">Resume</label>
                      <input
                        type="file"
                        className="form-control"
                        id="resumeUpload"
                        name="resume"
                        onChange={(e) => setEmployeeData({ ...employeeData, resume: e.target.files[0] })}
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
                              value={employeeData.password}
                              onChange={handleChange} />
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
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="row g-3 mb-3">
                          <div className="col">
                            <label className="form-label">Department</label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleFormControlInput777"
                              placeholder="Department"
                              maxLength={14}
                              name="department"
                              value={employeeData.department}
                            />
                          </div>
                          <div className="col">
                            <label className="form-label">Designation</label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleFormControlInput777"
                              placeholder="Designation"
                              maxLength={14}
                              name="designation"
                              value={employeeData.designation}
                            />
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
                      onClick={updateSubmit}                    >
                      Update
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

            {/* PDF Viewer Modal */}
            {pdfUrl && (
              <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">PDF Viewer</h5>
                      <button type="button" className="btn-close" onClick={closePdfViewer}></button>
                    </div>
                    <div className="modal-body">
                      <iframe src={pdfUrl} style={{ width: '100%', height: '500px' }} title="PDF Viewer"></iframe>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Image Viewer Modal */}
            {selectedImage && !pdfUrl && (
              <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Image Viewer</h5>
                      <button type="button" className="btn-close" onClick={closeImageModal}></button>
                    </div>
                    <div className="modal-body">
                      <img src={selectedImage} alt="Enlarged view" style={{ width: '100%', height: 'auto' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </nav >
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div >
      <style jsx>{`
        .dropdown-menu {
          position: absolute !important;
        }
        @media (max-width: 767px) {
          .zindex-popover {
            position: static !important;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
