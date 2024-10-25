import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const Header = () => {
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigation = useNavigate();
  const [dropdownPosition, setDropdownPosition] = useState({});
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigation("/");
    }
    const user = JSON.parse(localStorage.getItem("user"));
    if (token) {
      setUserName(user.username);
      setEmail(user.email);
    } else {
      navigation("/");
    }
  }, [navigation]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigation("/");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/change-password`,
        {
          email,
          oldPassword,
          newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      // Clear the form inputs
      setOldPassword("");
      setNewPassword("");
      // Close the modal programmatically
      const modalElement = document.getElementById("passwordModal");
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      modal.hide();

      toast.success("Password change Successfully!", {
        style: {
          backgroundColor: "#4c3575",
          color: "white",
        },
      });
      
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigation("/");


    } catch (error) {
      alert("Incorrect Old Password");
    }
  };

  const handleDropdownToggle = (e) => {
    e.preventDefault();
    const rect = e.target.getBoundingClientRect();
    const isRightAligned = window.innerWidth - rect.right < rect.left;
    
    setDropdownPosition({
      position: 'fixed',
      top: `${rect.bottom}px`,
      [isRightAligned ? 'right' : 'left']: isRightAligned 
        ? `${window.innerWidth - rect.right}px`
        : `${rect.left}px`,
    });

    if (dropdownRef.current) {
      dropdownRef.current.classList.toggle('show');
    }
  };

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
                    <span className="font-weight-bold">{username}</span>
                  </p>
                  <small>Admin Profile</small>
                </div>
                <a
                  className="nav-link dropdown-toggle pulse p-0"
                  href="#"
                  role="button"
                  onClick={handleDropdownToggle}
                >
                  <img
                    className="avatar lg rounded-circle img-thumbnail"
                    src="Images/superadminimg.jpg"
                    alt="profile"
                  />
                </a>
                <div 
                  ref={dropdownRef}
                  className="dropdown-menu rounded-lg shadow border-0 dropdown-animation p-0 m-0"
                  style={dropdownPosition}
                >
                  <div className="card border-0 w280">
                    <div className="card-body pb-0">
                      <div className="d-flex py-1">
                        <img
                          className="avatar rounded-circle"
                          src="Images/superadminimg.jpg"
                          alt="profile"
                        />
                        <div className="flex-fill ms-3">
                          <p className="mb-0">
                            <span className="font-weight-bold">{username}</span>
                          </p>
                          <small className="">{email}</small>
                        </div>
                      </div>
                      <div>
                        <hr className="dropdown-divider border-dark" />
                      </div>
                    </div>
                    <div className="list-group m-2 ">
                      <button
                        className="list-group-item list-group-item-action border-0 "
                        data-bs-toggle="modal"
                        data-bs-target="#passwordModal"
                      >
                        <i className="bi bi-gear fs-6 me-3" />
                        Change Password
                      </button>
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
          </div>
        </nav>

        {/* Password Change Modal */}
        <div
          className="modal fade"
          id="passwordModal"
          tabIndex={-1}
          aria-labelledby="passwordLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-body">
                <div className="members_list">
                  <form onSubmit={handleChangePassword}>
                    <div className="container">
                      <div className="row">
                        <div className="col-12">
                          <label htmlFor="currentStatus" className="fw-bold fs-5">
                            Change Password
                          </label>
                          <div className="mb-3 mt-3">
                            <label className="form-label fw-bold">Email</label>
                            <input
                              type="email"
                              className="form-control"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                            />
                          </div>
                          <div className="mb-3 mt-3">
                            <label className="form-label fw-bold">Old Password</label>
                            <input
                              type="password"
                              className="form-control"
                              value={oldPassword}
                              onChange={(e) => setOldPassword(e.target.value)}
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-bold">New Password</label>
                            <input
                              type="password"
                              className="form-control"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              required
                            />
                          </div>
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
        <ToastContainer />
      </div>

      {/* Add this style tag at the end of the component */}
      <style jsx>{`
        @media (max-width: 786px) {
          .dropdown-menu-right {
            right: 0 !important;
            left: auto !important;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
