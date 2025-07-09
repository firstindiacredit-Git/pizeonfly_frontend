import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useTheme } from '../context/ThemeContext';
import { formatTime12Hour } from '../utils/timeUtils';
import CountdownTimer from './CountdownTimer';

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigation = useNavigate();
  const [dropdownPosition, setDropdownPosition] = useState({});
  const dropdownRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showSignoutModal, setShowSignoutModal] = useState(false);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "Images/user.jpeg";

    // Remove any backslashes and replace with forward slashes
    const cleanPath = imagePath.replace(/\\/g, '/');

    // Remove 'uploads/' from the path if it exists
    const pathWithoutUploads = cleanPath.replace('uploads/', '');

    // Add 'profile/' to the path and combine with the backend URL
    const imageUrl = `${import.meta.env.VITE_BASE_URL}${pathWithoutUploads}`;
    // console.log("imageUrl", imageUrl);
    return imageUrl;
  };

  // Function to fetch meetings for today and tomorrow
  const fetchMeetingsForNotification = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/meetings`);
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      const upcomingMeetings = response.data.meetings.filter(meeting => {
        const meetingDate = new Date(meeting.date);
        const isUpcoming = meetingDate.toDateString() === today.toDateString() ||
          meetingDate.toDateString() === tomorrow.toDateString();
        const isNotCompletedOrPostponedOrCancelled = !['completed', 'postponed', 'cancelled'].includes(meeting.status.toLowerCase());

        return isUpcoming && isNotCompletedOrPostponedOrCancelled;
      });

      setNotifications(upcomingMeetings);
    } catch (error) {
      console.error('Error fetching meetings for notifications:', error);
    }
  };

  useEffect(() => {
    fetchMeetingsForNotification();
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user"));

    // console.log("Token:", token);
    // console.log("User Data from localStorage:", userData);

    if (token) {
      setUserName(userData.username);
      setEmail(userData.email);
      setUser(userData);

      // console.log("State after setting user data:");
      // console.log("Username:", userData.username);
      // console.log("Email:", userData.email);
      // console.log("Complete User Object:", userData);
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
          backgroundColor: "#0d6efd",
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

  // Add this useEffect for outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        dropdownRef.current.classList.remove('show');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('username', username);
      if (selectedImage) {
        formData.append('profileImage', selectedImage);
      }

      // console.log("Before API call - FormData contents:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}api/update-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      // console.log("API Response:", response.data);

      // Update local storage with new user data
      const updatedUser = { ...JSON.parse(localStorage.getItem("user")), ...response.data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Close the modal programmatically
      const modalElement = document.getElementById("profileModal");
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      modal.hide();

      toast.success("Profile updated successfully!", {
        style: {
          backgroundColor: "#0d6efd",
          color: "white",
        },
      });
      setSelectedImage(null);

      //reload after 5 sec
      setTimeout(() => {
        window.location.reload();
      }, 5000);

    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  useEffect(() => {
    if (showSignoutModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showSignoutModal]);

  const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error("Image size should not exceed 2MB");
        e.target.value = ""; // Reset the input
        return;
      }
      setSelectedImage(file);
    }
  };

  return (
    <>
      <div className="header">

        <nav className="navbar py-4" style={{ backgroundColor: isDarkMode ? "#1a1a2e" : "#ffffff", borderBottom: `2px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#f0f0f0"}` }}>
          <div className="container-xxl">

            {/* header rightbar icon */}
            <div className="h-right d-flex gap-3 align-items-center mr-5 mr-lg-0 order-1">
              {/* <button 
                onClick={toggleTheme} 
                className="border-0 bg-transparent"
                style={{ 
                  padding: "10px", 
                  borderRadius: "50%", 
                  transition: "all 0.3s ease",
                  backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                  transform: "scale(1)",
                  cursor: "pointer"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                {isDarkMode ? 
                  <i className="bi bi-brightness-high text-light fs-5" style={{ color: "#FFD700" }} /> : 
                  <i className="bi bi-moon-fill fs-5" style={{ color: "#6c757d" }} />
                }
              </button> */}
              <div className="dropdown user-profile ml-2 ml-sm-3 d-flex align-items-center zindex-popover">
                <div className="u-info me-2">
                  <p className="mb-0 text-end line-height-sm" style={{ fontWeight: "600", fontSize: "15px", color: isDarkMode ? "#e1e1e1" : "#333" }}>
                    <span className="font-weight-bold">{username}</span>
                  </p>
                  <small style={{ color: isDarkMode ? "#a0a0a0" : "#6c757d", fontSize: "12px", letterSpacing: "0.5px" }}>Admin Profile</small>
                </div>
                <a
                  className="nav-link dropdown-toggle pulse p-0"
                  href="#"
                  role="button"
                  onClick={handleDropdownToggle}
                  style={{ position: "relative" }}
                >
                  <img
                    className="avatar lg rounded-circle img-thumbnail"
                    src={getImageUrl(user?.profileImage)}
                    alt="profile"
                    style={{
                      border: "3px solid",
                      borderColor: isDarkMode ? "#4e4e6a" : "#e9ecef",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                      transition: "all 0.3s ease",

                      objectFit: "contain"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = "#0a9400"}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = isDarkMode ? "#4e4e6a" : "#e9ecef"}
                  />
                </a>
                <div
                  ref={dropdownRef}
                  className="dropdown-menu rounded-lg shadow border-0 dropdown-animation p-0 m-0"
                  style={{
                    ...dropdownPosition,
                    boxShadow: "0 5px 15px rgba(0,0,0,0.15)",
                    borderRadius: "15px",
                    backgroundColor: isDarkMode ? "#1a1a2e" : "#ffffff",
                    overflow: "hidden"
                  }}
                >
                  <div className="card border-0 w280" style={{ borderRadius: "15px", backgroundColor: "transparent" }}>
                    <div className="card-body pb-0" style={{ backgroundColor: isDarkMode ? "#242444" : "#f8f9fa", padding: "15px" }}>
                      <div className="d-flex py-1">
                        <img
                          className="avatar rounded-circle"
                          src={getImageUrl(user?.profileImage)}
                          alt="profile"
                          style={{
                            border: "3px solid",
                            borderColor: isDarkMode ? "#4e4e6a" : "#ffffff",
                            width: "50px",
                            height: "50px",
                            objectFit: "cover"
                          }}
                        />
                        <div className="flex-fill ms-3">
                          <p className="mb-0 d-flex align-items-center gap-1" style={{ fontWeight: "600", color: isDarkMode ? "#e1e1e1" : "#333" }}>
                            <span className="font-weight-bold">{username}</span>
                          </p>
                          <small style={{ color: isDarkMode ? "#a0a0a0" : "#6c757d", fontSize: "12px" }}>{email}</small>
                        </div>
                      </div>
                      <div>
                        <hr className="dropdown-divider border-dark" style={{ margin: "10px 0" }} />
                      </div>
                    </div>
                    <div className="list-group m-2 ">
                      <button
                        className="list-group-item list-group-item-action border-0"
                        data-bs-toggle="modal"
                        data-bs-target="#profileModal"
                        style={{
                          borderRadius: "10px",
                          margin: "5px 0",
                          backgroundColor: isDarkMode ? "#242444" : "#f8f9fa",
                          color: isDarkMode ? "#e1e1e1" : "#333",
                          transition: "all 0.2s ease",
                          padding: "12px 15px",
                          fontWeight: "500"
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = isDarkMode ? "#2d2d5a" : "#e9ecef";
                          e.currentTarget.style.transform = "translateX(5px)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = isDarkMode ? "#242444" : "#f8f9fa";
                          e.currentTarget.style.transform = "translateX(0)";
                        }}
                      >
                        <i className="bi bi-person fs-6 me-3" style={{ color: "#0a9400" }} />
                        Edit Profile
                      </button>
                      <button
                        className="list-group-item list-group-item-action border-0 "
                        data-bs-toggle="modal"
                        data-bs-target="#passwordModal"
                        style={{
                          borderRadius: "10px",
                          margin: "5px 0",
                          backgroundColor: isDarkMode ? "#242444" : "#f8f9fa",
                          color: isDarkMode ? "#e1e1e1" : "#333",
                          transition: "all 0.2s ease",
                          padding: "12px 15px",
                          fontWeight: "500"
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = isDarkMode ? "#2d2d5a" : "#e9ecef";
                          e.currentTarget.style.transform = "translateX(5px)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = isDarkMode ? "#242444" : "#f8f9fa";
                          e.currentTarget.style.transform = "translateX(0)";
                        }}
                      >
                        <i className="bi bi-gear fs-6 me-3" style={{ color: "#0077b6" }} />
                        Change Password
                      </button>
                      <button
                        onClick={() => setShowSignoutModal(true)}
                        className="list-group-item list-group-item-action border-0 "
                        style={{
                          borderRadius: "10px",
                          margin: "5px 0",
                          backgroundColor: isDarkMode ? "#242444" : "#f8f9fa",
                          color: isDarkMode ? "#e1e1e1" : "#333",
                          transition: "all 0.2s ease",
                          padding: "12px 15px",
                          fontWeight: "500"
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = isDarkMode ? "#2d2d5a" : "#e9ecef";
                          e.currentTarget.style.transform = "translateX(5px)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = isDarkMode ? "#242444" : "#f8f9fa";
                          e.currentTarget.style.transform = "translateX(0)";
                        }}
                      >
                        <i className="icofont-logout fs-6 me-3" style={{ color: "#dc3545" }} />
                        Signout
                      </button>

                      <div>
                        <hr className="dropdown-divider border-dark" style={{ margin: "10px 0" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Notification display */}
            <div className="" style={{
              flex: "1",
              maxWidth: "60%",
              margin: "0 auto"
            }}>
              {notifications.length > 0 ? (
                <div className="notification" style={{
                  padding: "14px 22px",
                  borderRadius: "12px",
                  backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(240, 250, 255, 0.95)",
                  boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
                  border: "1px solid",
                  borderColor: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(200, 220, 240, 0.8)",
                  transition: "all 0.3s ease"
                }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.15)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = "0 3px 12px rgba(0,0,0,0.1)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}>
                  <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.6" }}>
                    {(() => {
                      const todayMeetings = notifications.filter(meeting => {
                        const meetingDate = new Date(meeting.date);
                        return meetingDate.toDateString() === new Date().toDateString();
                      });

                      return todayMeetings.length > 0 ? (
                        <>
                          <strong style={{
                            color: "#0a9400",
                            fontSize: "15px",
                            background: isDarkMode ? "rgba(10, 148, 0, 0.1)" : "rgba(10, 148, 0, 0.08)",
                            padding: "3px 10px",
                            borderRadius: "15px",
                            marginRight: "8px"
                          }}>Today</strong>{" "}
                          {todayMeetings.map((meeting, index) => (
                            <span key={meeting._id} style={{
                              display: "inline-block",
                              marginRight: "5px",
                              padding: "3px 8px",
                              backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.6)",
                              borderRadius: "8px",
                              border: "1px solid",
                              borderColor: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"
                            }}>
                              <strong style={{ fontWeight: "600" }}>{meeting.title}</strong> at <strong style={{
                                color: "#0077b6",
                                backgroundColor: isDarkMode ? "rgba(0, 119, 182, 0.1)" : "rgba(0, 119, 182, 0.08)",
                                padding: "2px 6px",
                                borderRadius: "5px"
                              }}>{formatTime12Hour(meeting.startTime)}</strong>
                              <CountdownTimer
                                meetingDate={meeting.date}
                                meetingTime={meeting.startTime}
                              />
                              {index < todayMeetings.length - 1 ? <span style={{ marginLeft: "5px", marginRight: "5px", color: "#6c757d" }}>•</span> : ''}
                            </span>
                          ))}
                          {" "}
                        </>
                      ) : null;
                    })()}
                    {(() => {
                      const tomorrowMeetings = notifications.filter(meeting => {
                        const meetingDate = new Date(meeting.date);
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        return meetingDate.toDateString() === tomorrow.toDateString();
                      });

                      return tomorrowMeetings.length > 0 ? (
                        <div className="mt-2">
                          <strong style={{
                            color: "#dc3545",
                            fontSize: "15px",
                            background: isDarkMode ? "rgba(220, 53, 69, 0.1)" : "rgba(220, 53, 69, 0.08)",
                            padding: "3px 10px",
                            borderRadius: "15px",
                            marginRight: "8px"
                          }}>Tomorrow</strong>{" "}
                          {tomorrowMeetings.map((meeting, index) => (
                            <span key={meeting._id} style={{
                              display: "inline-block",
                              marginRight: "5px",
                              padding: "3px 8px",
                              backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.6)",
                              borderRadius: "8px",
                              border: "1px solid",
                              borderColor: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"
                            }}>
                              <strong style={{ fontWeight: "600" }}>{meeting.title}</strong> at <strong style={{
                                color: "#0077b6",
                                backgroundColor: isDarkMode ? "rgba(0, 119, 182, 0.1)" : "rgba(0, 119, 182, 0.08)",
                                padding: "2px 6px",
                                borderRadius: "5px"
                              }}>{formatTime12Hour(meeting.startTime)}</strong>
                              <CountdownTimer
                                meetingDate={meeting.date}
                                meetingTime={meeting.startTime}
                              />
                              {index < tomorrowMeetings.length - 1 ? <span style={{ marginLeft: "5px", marginRight: "5px", color: "#6c757d" }}>•</span> : ''}
                            </span>
                          ))}
                        </div>
                      ) : null;
                    })()}
                  </p>
                </div>
              ) : (
                <div className="notification" style={{
                  padding: "14px 22px",
                  borderRadius: "12px",
                  backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(240, 250, 255, 0.95)",
                  boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
                  textAlign: "center",
                  border: "1px solid",
                  borderColor: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(200, 220, 240, 0.8)",
                  transition: "all 0.3s ease"
                }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.15)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = "0 3px 12px rgba(0,0,0,0.1)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}>
                  <p style={{
                    margin: 0,
                    color: isDarkMode ? "#a0a0a0" : "#6c757d",
                    fontStyle: "italic",
                    fontSize: "14px"
                  }}>No meetings scheduled</p>
                </div>
              )}
            </div>
            {/* menu toggler */}
            <button
              className="navbar-toggler p-0 border-0 menu-toggle order-3"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#mainHeader"
              style={{
                padding: "10px",
                borderRadius: "8px",
                backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                transition: "all 0.3s ease",
                cursor: "pointer"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}
            >
              <span className="fa fa-bars" style={{ color: isDarkMode ? "#e1e1e1" : "#333" }} />
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
            <div className="modal-content" style={{
              borderRadius: "15px",
              border: "none",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
            }}>
              <div className="modal-header" style={{
                backgroundColor: isDarkMode ? "#1a1a2e" : "#f8f9fa",
                borderBottom: `1px solid ${isDarkMode ? "rgba(255,255,255,0.05)" : "#e9ecef"}`,
                padding: "20px 25px"
              }}>
                <h5 className="modal-title" style={{
                  color: "#FE6730",
                  fontWeight: "600",
                  fontSize: "22px",
                  marginBottom: "0"
                }}>Change Password</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  style={{
                    backgroundColor: isDarkMode ? "rgba(255,255,255,0.5)" : undefined
                  }}
                ></button>
              </div>
              <div className="modal-body" style={{
                padding: "25px",
                backgroundColor: isDarkMode ? "#242444" : "#ffffff"
              }}>
                <div className="members_list">
                  <form onSubmit={handleChangePassword}>
                    <div className="container">
                      <div className="row">
                        <div className="col-12">
                          <div className="mb-4 mt-2">
                            <label className="form-label" style={{
                              fontWeight: "600",
                              color: isDarkMode ? "#e1e1e1" : "#333",
                              marginBottom: "8px",
                              fontSize: "15px"
                            }}>Email</label>
                            <div style={{ position: "relative" }}>
                              <i className="bi bi-envelope" style={{
                                position: "absolute",
                                left: "15px",
                                top: "12px",
                                color: "#6c757d"
                              }}></i>
                              <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                  padding: "12px 12px 12px 40px",
                                  borderRadius: "10px",
                                  border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#ced4da"}`,
                                  backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#fff",
                                  color: isDarkMode ? "#e1e1e1" : "#333",
                                  fontSize: "15px",
                                  transition: "all 0.3s ease"
                                }}
                              />
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="form-label" style={{
                              fontWeight: "600",
                              color: isDarkMode ? "#e1e1e1" : "#333",
                              marginBottom: "8px",
                              fontSize: "15px"
                            }}>Old Password</label>
                            <div style={{ position: "relative" }}>
                              <i className="bi bi-lock" style={{
                                position: "absolute",
                                left: "15px",
                                top: "12px",
                                color: "#6c757d"
                              }}></i>
                              <input
                                type="password"
                                className="form-control"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                                style={{
                                  padding: "12px 12px 12px 40px",
                                  borderRadius: "10px",
                                  border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#ced4da"}`,
                                  backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#fff",
                                  color: isDarkMode ? "#e1e1e1" : "#333",
                                  fontSize: "15px",
                                  transition: "all 0.3s ease"
                                }}
                              />
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="form-label" style={{
                              fontWeight: "600",
                              color: isDarkMode ? "#e1e1e1" : "#333",
                              marginBottom: "8px",
                              fontSize: "15px"
                            }}>New Password</label>
                            <div style={{ position: "relative" }}>
                              <i className="bi bi-shield-lock" style={{
                                position: "absolute",
                                left: "15px",
                                top: "12px",
                                color: "#6c757d"
                              }}></i>
                              <input
                                type="password"
                                className="form-control"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                style={{
                                  padding: "12px 12px 12px 40px",
                                  borderRadius: "10px",
                                  border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#ced4da"}`,
                                  backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#fff",
                                  color: isDarkMode ? "#e1e1e1" : "#333",
                                  fontSize: "15px",
                                  transition: "all 0.3s ease"
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row mt-4">
                        <div className="col-12 d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            className="btn"
                            data-bs-dismiss="modal"
                            style={{
                              padding: "10px 20px",
                              borderRadius: "8px",
                              backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "#e9ecef",
                              color: isDarkMode ? "#e1e1e1" : "#333",
                              fontWeight: "500",
                              border: "none",
                              transition: "all 0.3s ease"
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn"
                            style={{
                              padding: "10px 25px",
                              borderRadius: "8px",
                              backgroundColor: "#FE6730",
                              color: "white",
                              fontWeight: "500",
                              border: "none",
                              boxShadow: "0 2px 5px rgba(254, 103, 48, 0.3)",
                              transition: "all 0.3s ease"
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = "#e55a2a";
                              e.currentTarget.style.transform = "translateY(-2px)";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = "#FE6730";
                              e.currentTarget.style.transform = "translateY(0)";
                            }}
                          >
                            Update Password
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

        {/* Add Profile Edit Modal */}
        <div
          className="modal fade"
          id="profileModal"
          tabIndex={-1}
          aria-labelledby="profileLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{
              borderRadius: "15px",
              border: "none",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
            }}>
              <div className="modal-header" style={{
                backgroundColor: isDarkMode ? "#1a1a2e" : "#f8f9fa",
                borderBottom: `1px solid ${isDarkMode ? "rgba(255,255,255,0.05)" : "#e9ecef"}`,
                padding: "20px 25px"
              }}>
                <h5 className="modal-title" style={{
                  color: "#FE6730",
                  fontWeight: "600",
                  fontSize: "22px",
                  marginBottom: "0"
                }}>Edit Profile</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  style={{
                    backgroundColor: isDarkMode ? "rgba(255,255,255,0.5)" : undefined
                  }}
                ></button>
              </div>
              <div className="modal-body" style={{
                padding: "25px",
                backgroundColor: isDarkMode ? "#242444" : "#ffffff"
              }}>
                <form onSubmit={handleProfileUpdate}>
                  <div className="container">
                    <div className="row">
                      <div className="col-12">
                        <div className="mb-4 mt-2 text-center">
                          <div style={{
                            position: "relative",
                            display: "inline-block",
                            margin: "0 auto"
                          }}>
                            <img
                              src={selectedImage
                                ? URL.createObjectURL(selectedImage)
                                : getImageUrl(user?.profileImage)}
                              alt="Profile"
                              className="rounded-circle"
                              style={{
                                width: '160px',
                                height: '160px',
                                objectFit: 'contain',
                                border: `4px solid ${isDarkMode ? "#4e4e6a" : "#ffffff"}`,
                                boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                                transition: "all 0.3s ease"
                              }}
                            />
                            <div style={{
                              position: "absolute",
                              bottom: "5px",
                              right: "5px",
                              backgroundColor: isDarkMode ? "#242444" : "#ffffff",
                              borderRadius: "50%",
                              padding: "8px",
                              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                              cursor: "pointer",
                              border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#e9ecef"}`,
                              transition: "all 0.3s ease"
                            }}
                              onClick={() => fileInputRef.current.click()}
                              onMouseOver={(e) => {
                                e.currentTarget.style.transform = "scale(1.1)";
                                e.currentTarget.style.backgroundColor = isDarkMode ? "#2d2d5a" : "#f8f9fa";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.backgroundColor = isDarkMode ? "#242444" : "#ffffff";
                              }}
                            >
                              <i className="bi bi-camera-fill" style={{
                                fontSize: "18px",
                                color: "#FE6730"
                              }}></i>
                            </div>
                          </div>
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="d-none"
                            accept="image/*"
                            onChange={handleProfileImageChange}
                          />
                          <p style={{
                            marginTop: "12px",
                            fontSize: "14px",
                            color: isDarkMode ? "#a0a0a0" : "#6c757d"
                          }}>
                            Click the camera icon to change your profile photo
                          </p>
                        </div>
                        <div className="mb-3">
                          <label className="form-label" style={{
                            fontWeight: "600",
                            color: isDarkMode ? "#e1e1e1" : "#333",
                            marginBottom: "8px",
                            fontSize: "15px"
                          }}>Username</label>
                          <div style={{ position: "relative" }}>
                            <i className="bi bi-person" style={{
                              position: "absolute",
                              left: "15px",
                              top: "12px",
                              color: "#6c757d"
                            }}></i>
                            <input
                              type="text"
                              className="form-control"
                              value={username}
                              onChange={(e) => setUserName(e.target.value)}
                              required
                              style={{
                                padding: "12px 12px 12px 40px",
                                borderRadius: "10px",
                                border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#ced4da"}`,
                                backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#fff",
                                color: isDarkMode ? "#e1e1e1" : "#333",
                                fontSize: "15px",
                                transition: "all 0.3s ease"
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row mt-4">
                      <div className="col-12 d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn"
                          data-bs-dismiss="modal"
                          style={{
                            padding: "10px 20px",
                            borderRadius: "8px",
                            backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "#e9ecef",
                            color: isDarkMode ? "#e1e1e1" : "#333",
                            fontWeight: "500",
                            border: "none",
                            transition: "all 0.3s ease"
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn"
                          style={{
                            padding: "10px 25px",
                            borderRadius: "8px",
                            backgroundColor: "#FE6730",
                            color: "white",
                            fontWeight: "500",
                            border: "none",
                            boxShadow: "0 2px 5px rgba(254, 103, 48, 0.3)",
                            transition: "all 0.3s ease"
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = "#e55a2a";
                            e.currentTarget.style.transform = "translateY(-2px)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = "#FE6730";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        {showSignoutModal && (
          <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.35)", zIndex: 2000 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content" style={{
                borderRadius: "18px",
                border: "none",
                overflow: "hidden",
                boxShadow: "0 10px 32px rgba(0,0,0,0.18)",
                background: isDarkMode ? "#23234a" : "#fff"
              }}>
                <div className="modal-header d-flex align-items-center gap-2" style={{
                  backgroundColor: isDarkMode ? "#1a1a2e" : "#f8f9fa",
                  borderBottom: `1px solid ${isDarkMode ? "rgba(255,255,255,0.08)" : "#e9ecef"}`,
                  padding: "22px 28px"
                }}>
                  <span style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isDarkMode ? "rgba(254,103,48,0.12)" : "rgba(254,103,48,0.08)",
                    borderRadius: "50%",
                    width: 44,
                    height: 44,
                    marginRight: 10
                  }}>
                    <i className="bi bi-box-arrow-right" style={{ fontSize: 26, color: "#FF6EB4" }}></i>
                  </span>
                  <h5 className="modal-title" style={{ color: "#365DD2", fontWeight: 700, fontSize: 22, margin: 0 }}>
                    Confirm Signout
                  </h5>
                  <button
                    type="button"
                    className="btn-close ms-auto"
                    onClick={() => setShowSignoutModal(false)}
                    aria-label="Close"
                    style={{ backgroundColor: isDarkMode ? "rgba(255,255,255,0.4)" : undefined }}
                  ></button>
                </div>
                <div className="modal-body text-center" style={{
                  backgroundColor: isDarkMode ? "#23234a" : "#fff",
                  padding: "32px 28px 18px 28px"
                }}>
                  <p style={{
                    color: isDarkMode ? "#e1e1e1" : "#333",
                    fontSize: 17,
                    fontWeight: 500,
                    marginBottom: 0
                  }}>
                    Are you sure you want to sign out?
                  </p>
                </div>
                <div className="modal-footer d-flex justify-content-center gap-3" style={{
                  backgroundColor: isDarkMode ? "#1a1a2e" : "#f8f9fa",
                  borderTop: `1px solid ${isDarkMode ? "rgba(255,255,255,0.08)" : "#e9ecef"}`,
                  padding: "18px 28px 22px 28px"
                }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setShowSignoutModal(false)}
                    style={{
                      padding: "10px 28px",
                      borderRadius: "8px",
                      backgroundColor: isDarkMode ? "rgba(255,255,255,0.08)" : "#e9ecef",
                      color: isDarkMode ? "#e1e1e1" : "#333",
                      fontWeight: 500,
                      border: "none",
                      transition: "all 0.2s",
                      boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,0.12)" : "0 2px 8px rgba(254,103,48,0.08)"
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? "#2d2d5a" : "#d1d1d1";
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? "rgba(255,255,255,0.08)" : "#e9ecef";
                    }}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={handleSignOut}
                    style={{
                      padding: "10px 28px",
                      borderRadius: "8px",
                      backgroundColor: "#FF6EB4",
                      color: "white",
                      fontWeight: 600,
                      border: "none",
                      boxShadow: "0 2px 8px rgba(254,103,48,0.18)",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.backgroundColor = "#365DD2";
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.backgroundColor = "#FF6EB4";
                    }}
                  >
                    Yes, Signout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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

        .notification .badge {
          margin-left: 8px;
          font-size: 0.85em;
          padding: 4px 8px;
          border-radius: 12px;
          background-color: #f8f9fa;
          color: #212529;
          border: 1px solid #dee2e6;
        }

        .notification span {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin: 0 4px;
        }

        @media (max-width: 768px) {
          .notification p {
            font-size: 0.9em;
          }
          
          .notification .badge {
            font-size: 0.8em;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
