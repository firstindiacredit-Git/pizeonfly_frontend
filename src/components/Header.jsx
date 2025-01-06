import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useTheme } from '../context/ThemeContext';

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

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "Images/user.jpeg";

    // Remove any backslashes and replace with forward slashes
    const cleanPath = imagePath.replace(/\\/g, '/');

    // Remove 'uploads/' from the path if it exists
    const pathWithoutUploads = cleanPath.replace('uploads/', '');

    // Combine with the backend URL
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

  return (
    <>
      <div className="header border-bottom">

        <nav className="navbar py-4">
          <div className="container-xxl">

            {/* header rightbar icon */}
            <div className="h-right d-flex gap-3 align-items-center mr-5 mr-lg-0 order-1">
              <button onClick={toggleTheme} className="border-0 bg-transparent">
                {isDarkMode ? <i className="bi bi-brightness-high text-light fs-5" /> : <i className="bi bi-moon-fill fs-5" />}
              </button>
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
                    src={getImageUrl(user?.profileImage)}
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
                          src={getImageUrl(user?.profileImage)}
                          alt="profile"
                        />
                        <div className="flex-fill ms-3">
                          <p className="mb-0 d-flex align-items-center gap-1">
                            <span className="font-weight-bold">{username}</span>
                            {/* <i className="bi bi-pencil-fill" style={{fontSize: "10px"}}/> */}
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
                        className="list-group-item list-group-item-action border-0"
                        data-bs-toggle="modal"
                        data-bs-target="#profileModal"
                      >
                        <i className="bi bi-person fs-6 me-3" />
                        Edit Profile
                      </button>
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
            <div className="">
              {/* Notification display */}
              {notifications.length > 0 ? (
                <div className="notification">
                  <marquee behavior="scroll" direction="left">
                    <p>
                      You have {notifications.length} meeting(s) scheduled: | {" "}
                      <strong>Today:</strong> 
                      {notifications.filter(meeting => {
                        const meetingDate = new Date(meeting.date);
                        return meetingDate.toDateString() === new Date().toDateString();
                      }).map((meeting, index) => (
                        <span key={meeting._id}>
                          <strong>{index + 1}. {meeting.title}</strong> at {meeting.startTime}
                          {index < notifications.length - 1 ? ' , ' : ''}
                        </span>
                      ))}
                      | {" "}
                      <strong>Tomorrow:</strong>
                      {notifications.filter(meeting => {
                        const meetingDate = new Date(meeting.date);
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        return meetingDate.toDateString() === tomorrow.toDateString();
                      }).map((meeting, index) => (
                        <span key={meeting._id}>
                          <strong>{index + 1}. {meeting.title}</strong> at {meeting.startTime}
                          {index < notifications.length - 1 ? ' , ' : ''}
                        </span>
                      ))}
                    </p>
                  </marquee>
                </div>
              ) : (
                <div className="notification">
                  <p>No meetings scheduled</p>
                </div>
              )}
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

        {/* Add Profile Edit Modal */}
        <div
          className="modal fade"
          id="profileModal"
          tabIndex={-1}
          aria-labelledby="profileLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body">
                <form onSubmit={handleProfileUpdate}>
                  <div className="container">
                    <div className="row">
                      <div className="col-12">
                        <label className="fw-bold fs-5">Edit Profile</label>
                        <div className="mb-3 mt-3 text-center">
                          <img
                            src={selectedImage
                              ? URL.createObjectURL(selectedImage)
                              : getImageUrl(user?.profileImage)}
                            alt="Profile"
                            className="rounded-circle"
                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                          />
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="d-none"
                            accept="image/*"
                            onChange={(e) => setSelectedImage(e.target.files[0])}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-dark mt-2"
                            onClick={() => fileInputRef.current.click()}
                          >
                            Change Photo
                          </button>
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold">Username</label>
                          <input
                            type="text"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row mt-3">
                      <div className="col-12 d-flex justify-content-end">
                        <button type="submit" className="btn btn-dark">
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
