import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';  // Import axios
import './Sidebar.css';
import CustomColorPicker, { isLightColor } from '../pages/colorpicker/CustomColorPicker';
import Header from './Header';
import { useTheme } from '../context/ThemeContext';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";


const Sidebar = () => {
  const [role, setRole] = useState('');
  const [isHolidayTomorrow, setIsHolidayTomorrow] = useState(false); // State to check if tomorrow is a holiday
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [sidebarColor, setSidebarColor] = useState(localStorage.getItem('sidebarColor') || '#000000');
  const { isDarkMode, toggleTheme, updateActiveTabColor } = useTheme();
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({});
  const dropdownRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [showSignoutModal, setShowSignoutModal] = useState(false);
  const location = useLocation();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Active menu states
  const [activeDropdowns, setActiveDropdowns] = useState({});

  // Function to check if a route is active
  const isRouteActive = (routePath) => {
    return location.pathname === routePath;
  };

  // Function to check if any child route is active
  const isParentActive = (childRoutes) => {
    return childRoutes.some(route => location.pathname === route);
  };

  // Function to toggle dropdown
  const toggleDropdown = (dropdownId, e) => {
    if (e) {
      e.preventDefault();
    }
    setActiveDropdowns(prev => ({
      ...prev,
      [dropdownId]: !prev[dropdownId]
    }));
  };


  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setRole(user.role);
    }
  }, []);

  // Update active tab color when sidebar color changes or component mounts
  useEffect(() => {
    updateActiveTabColor(sidebarColor);
  }, [sidebarColor, updateActiveTabColor]);

  // Auto-open dropdowns for active routes
  useEffect(() => {
    setActiveDropdowns(prev => {
      const newActiveDropdowns = { ...prev };
      
      // Check which parent menus should be open based on current route
      if (isParentActive(['/projects', '/tasks'])) {
        newActiveDropdowns['project-Components'] = true;
      }
      if (isParentActive(['/clients'])) {
        newActiveDropdowns['client-Components'] = true;
      }
      if (isParentActive(['/members'])) {
        newActiveDropdowns['emp-Components'] = true;
      }
      if (isParentActive(['/urlShortner', '/qrCodeGenerate', '/saasManager', '/miscellaneous'])) {
        newActiveDropdowns['tools-Components'] = true;
      }
      if (isParentActive(['/create-invoice', '/all-invoice', '/balanceSheet', '/officeDocs'])) {
        newActiveDropdowns['accounts-Components'] = true;
      }
      if (isParentActive(['/create-meeting', '/all-meetings', '/client-meeting'])) {
        newActiveDropdowns['meetings-Components'] = true;
      }
      if (isParentActive(['/extractor'])) {
        newActiveDropdowns['datas-Components'] = true;
      }

      return newActiveDropdowns;
    });
  }, [location.pathname]);

  useEffect(() => {
    // Check if tomorrow is a holiday
    const checkHolidayTomorrow = async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1); // Set to tomorrow's date
      const isoTomorrow = tomorrow.toISOString().split('T')[0]; // Format YYYY-MM-DD

      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/holidays`);

        const holidays = response.data.response.holidays;
        const holidayTomorrow = holidays.find(h => h.date.iso === isoTomorrow);
        setIsHolidayTomorrow(!!holidayTomorrow); // Set to true if tomorrow is a holiday
      } catch (error) {
        console.error("Error fetching holidays:", error);
      }
    };

    checkHolidayTomorrow(); // Fetch holiday data on component mount
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user"));

    if (token) {
      setUserName(userData.username);
      setEmail(userData.email);
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    if (showSignoutModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showSignoutModal]);

  const handleColorChange = (color) => {
    setSidebarColor(color);
    localStorage.setItem('sidebarColor', color);
    // Update the active tab color in context when sidebar color changes
    updateActiveTabColor(color);
  };

  // Determine text color based on sidebar background color
  const textColorClass = isLightColor(sidebarColor) ? 'text-dark' : 'text-light';

  const handleDropdownToggle = (e) => {
    e.preventDefault();
    const rect = e.target.getBoundingClientRect();
    const isRightAligned = window.innerWidth - rect.right < rect.left;

    setDropdownPosition({
      position: 'fixed',
      bottom: `${window.innerHeight - rect.top}px`,
      [isRightAligned ? 'right' : 'left']: isRightAligned
        ? `${window.innerWidth - rect.right}px`
        : `${rect.left}px`,
    });

    if (dropdownRef.current) {
      dropdownRef.current.classList.toggle('show');
    }
  };

  // Add the getImageUrl function from Header
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "Images/default.jpeg";
    const cleanPath = imagePath.replace(/\\/g, '/');
    const pathWithoutUploads = cleanPath.replace('uploads/', '');
    return `${import.meta.env.VITE_BASE_URL}${pathWithoutUploads}`;
  };

  // Initialize navigation hook
  const navigate = useNavigate();

  // Inside the Sidebar component, add these handlers from Header
  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
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
      setOldPassword("");
      setNewPassword("");
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
      navigate("/");
    } catch (error) {
      alert("Incorrect Old Password");
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

      if (response.data && response.data.user) {
        const updatedUser = { ...JSON.parse(localStorage.getItem("user")), ...response.data.user };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Modal close
        const modalElement = document.getElementById("profileModal");
        const modal = window.bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }

        toast.success("Profile updated successfully!", {
          style: {
            backgroundColor: "#0d6efd",
            color: "white",
          },
        });
        setSelectedImage(null);

        setTimeout(() => {
          window.location.reload();
        }, 5000);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  // Function to check if we're on a chat route
  const isChatRoute = () => {
    return ['/admin-chat', '/employee-chat', '/client-chat', '/chat'].includes(location.pathname);
  };

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
    <div className={`sidebar-container ${textColorClass}`} style={{ background: sidebarColor }}>
      <div className="sidebar-content d-flex flex-column h-100">


        <div className="brand-section">
          <div className="brand-container">
            <img src='../Images/pizeonflylogo.png' alt="Pizeonfly Logo" className="brand-logo" />
          </div>
        </div>

        {/* Menu: main ul */}
        {/* {role === 'superadmin' && (
          )} */}
        <nav className="sidebar-nav flex-grow-1">
          <ul className="nav-list">
            <li className="nav-item">
              <Link 
                className={`nav-link ${textColorClass} ${isRouteActive('/project-dashboard') ? 'active' : ''}`} 
                to="/project-dashboard"
              >
                <div className="nav-icon">
                  <i className={`icofont-home ${textColorClass}`} />
                </div>
                <span className={`nav-text ${textColorClass}`}>Admin Dashboard</span>
              </Link>
            </li>
            <li className="nav-item has-submenu">
              <a
                className={`nav-link submenu-toggle ${textColorClass} ${isParentActive(['/projects', '/tasks']) ? 'active' : ''}`}
                onClick={(e) => toggleDropdown('project-Components', e)}
                href="#"
              >
                <div className="nav-icon">
                  <i className={`icofont-briefcase ${textColorClass}`} />
                </div>
                <span className="nav-text">Projects</span>
                <div className={`nav-arrow ${activeDropdowns['project-Components'] ? 'rotated' : ''}`}>
                  <i className={`icofont-dotted-down ${textColorClass}`} />
                </div>
              </a>
              <ul className={`submenu ${activeDropdowns['project-Components'] ? 'show' : 'collapse'}`} id="project-Components">
                <li className="submenu-item">
                  <Link className={`submenu-link ${isRouteActive('/projects') ? 'active' : ''}`} to="/projects">
                    <span>Projects</span>
                  </Link>
                </li>
                <li className="submenu-item">
                  <Link className={`submenu-link ${isRouteActive('/tasks') ? 'active' : ''}`} to="/tasks">
                    <span>Tasks</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item has-submenu">
              <a
                className={`nav-link submenu-toggle ${textColorClass} ${isParentActive(['/clients']) ? 'active' : ''}`}
                onClick={(e) => toggleDropdown('client-Components', e)}
                href="#"
              >
                <div className="nav-icon">
                  <i className={`icofont-user-male ${textColorClass}`} />
                </div>
                <span className="nav-text">Our Clients</span>
                <div className={`nav-arrow ${activeDropdowns['client-Components'] ? 'rotated' : ''}`}>
                  <i className={`icofont-dotted-down ${textColorClass}`} />
                </div>
              </a>
              <ul className={`submenu ${activeDropdowns['client-Components'] ? 'show' : 'collapse'}`} id="client-Components">
                <li className="submenu-item">
                  <Link className={`submenu-link ${isRouteActive('/clients') ? 'active' : ''}`} to="/clients">
                    <span>Clients</span>
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item has-submenu">
              <a
                className={`nav-link submenu-toggle ${textColorClass} ${isParentActive(['/members']) ? 'active' : ''}`}
                onClick={(e) => toggleDropdown('emp-Components', e)}
                href="#"
              >
                <div className="nav-icon">
                  <i className={`icofont-users-alt-5 ${textColorClass}`} />
                </div>
                <span className="nav-text">Employees</span>
                <div className={`nav-arrow ${activeDropdowns['emp-Components'] ? 'rotated' : ''}`}>
                  <i className={`icofont-dotted-down ${textColorClass}`} />
                </div>
              </a>
              <ul className={`submenu ${activeDropdowns['emp-Components'] ? 'show' : 'collapse'}`} id="emp-Components">
                <li className="submenu-item">
                  <Link className={`submenu-link ${isRouteActive('/members') ? 'active' : ''}`} to="/members">
                    <span>Members</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item has-submenu">
              <a
                className={`nav-link submenu-toggle ${textColorClass} ${isParentActive(['/urlShortner', '/qrCodeGenerate', '/saasManager', '/miscellaneous']) ? 'active' : ''}`}
                onClick={(e) => toggleDropdown('tools-Components', e)}
                href="#"
              >
                <div className="nav-icon">
                  <i className={`icofont-tools-alt-2 ${textColorClass}`} />
                </div>
                <span className="nav-text">Tools</span>
                <div className={`nav-arrow ${activeDropdowns['tools-Components'] ? 'rotated' : ''}`}>
                  <i className={`icofont-dotted-down ${textColorClass}`} />
                </div>
              </a>
              <ul className={`submenu ${activeDropdowns['tools-Components'] ? 'show' : 'collapse'}`} id="tools-Components">
                <li className="submenu-item">
                  <Link className={`submenu-link ${isRouteActive('/urlShortner') ? 'active' : ''}`} to="/urlShortner">
                    <span>URL Shortner</span>
                  </Link>
                </li>
                <li className="submenu-item">
                  <Link className={`submenu-link ${isRouteActive('/qrCodeGenerate') ? 'active' : ''}`} to="/qrCodeGenerate">
                    <span>QR Code Generator</span>
                  </Link>
                </li>
                <li className="submenu-item">
                  <Link className={`submenu-link ${isRouteActive('/saasManager') ? 'active' : ''}`} to="/saasManager">
                    <span>Saas Manager</span>
                  </Link>
                </li>
                <li className="submenu-item">
                  <Link className={`submenu-link ${isRouteActive('/miscellaneous') ? 'active' : ''}`} to="/miscellaneous">
                    <span>Miscellaneous</span>
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item has-submenu">
              <a
                className={`nav-link submenu-toggle ${textColorClass} ${isParentActive(['/create-invoice', '/all-invoice', '/balanceSheet', '/officeDocs']) ? 'active' : ''}`}
                onClick={(e) => toggleDropdown('accounts-Components', e)}
                href="#"
              >
                <div className="nav-icon">
                  <i className={`icofont-document-folder ${textColorClass}`} />
                </div>
                <span className="nav-text">Accounts & Billing</span>
                <div className={`nav-arrow ${activeDropdowns['accounts-Components'] ? 'rotated' : ''}`}>
                  <i className={`icofont-dotted-down ${textColorClass}`} />
                </div>
              </a>
              <ul className={`submenu ${activeDropdowns['accounts-Components'] ? 'show' : 'collapse'}`} id="accounts-Components">
                <li className="submenu-item">
                  <Link className={`submenu-link ${isRouteActive('/create-invoice') ? 'active' : ''}`} to="/create-invoice">
                    <span>Create Invoice</span>
                  </Link>
                </li>
                <li className="submenu-item">
                  <Link className={`submenu-link ${isRouteActive('/all-invoice') ? 'active' : ''}`} to="/all-invoice">
                    <span>All Invoice</span>
                  </Link>
                </li>
                <li className="submenu-item">
                  <Link className={`submenu-link ${isRouteActive('/balanceSheet') ? 'active' : ''}`} to="/balanceSheet">
                    <span>Balance Sheet</span>
                  </Link>
                </li>
                <li className="submenu-item">
                  <Link className={`submenu-link ${isRouteActive('/officeDocs') ? 'active' : ''}`} to="/officeDocs">
                    <span>Office Docs</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item has-submenu">
              <a
                className={`nav-link submenu-toggle ${textColorClass} ${isParentActive(['/create-meeting', '/all-meetings', '/client-meeting']) ? 'active' : ''}`}
                onClick={(e) => toggleDropdown('meetings-Components', e)}
                href="#"
              >
                <div className="nav-icon">
                  <i className={`icofont-meeting-add ${textColorClass}`} />
                </div>
                <span className="nav-text">Meetings Scheduler</span>
                <div className={`nav-arrow ${activeDropdowns['meetings-Components'] ? 'rotated' : ''}`}>
                  <i className={`icofont-dotted-down ${textColorClass}`} />
                </div>
              </a>
              <ul className={`submenu ${activeDropdowns['meetings-Components'] ? 'show' : 'collapse'}`} id="meetings-Components">
                <li className="submenu-item">
                  <Link className={`submenu-link ${isRouteActive('/create-meeting') ? 'active' : ''}`} to="/create-meeting">
                    <span>Create Meeting</span>
                  </Link>
                </li>
                <li className="submenu-item">
                  <Link className={`submenu-link ${isRouteActive('/all-meetings') ? 'active' : ''}`} to="/all-meetings">
                    <span>All Meetings</span>
                  </Link>
                </li>
                <li className="submenu-item">
                  <Link className={`submenu-link ${isRouteActive('/client-meeting') ? 'active' : ''}`} to="/client-meeting">
                    <span>Client Meeting</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item has-submenu">
              <a
                className={`nav-link submenu-toggle ${textColorClass} ${isParentActive(['/extractor']) ? 'active' : ''}`}
                onClick={(e) => toggleDropdown('datas-Components', e)}
                href="#"
              >
                <div className="nav-icon">
                  <i className={`icofont-data ${textColorClass}`} />
                </div>
                <span className="nav-text">Data Mining</span>
                <div className={`nav-arrow ${activeDropdowns['datas-Components'] ? 'rotated' : ''}`}>
                  <i className={`icofont-dotted-down ${textColorClass}`} />
                </div>
              </a>
              <ul className={`submenu ${activeDropdowns['datas-Components'] ? 'show' : 'collapse'}`} id="datas-Components">
                <li className="submenu-item">
                  <Link className={`submenu-link ${isRouteActive('/extractor') ? 'active' : ''}`} to="/extractor">
                    <span>Google Map Extrator</span>
                  </Link>
                </li>
              </ul>
            </li>



          </ul>
        </nav>

        {/* <button
          type="button"
          className="btn btn-link sidebar-mini-btn text-light"
        >
          <span className="ms-2">
            <i className="icofont-bubble-right" />
          </span>
        </button> */}
        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {/* Profile section - Only show on chat routes */}
          {isChatRoute() && (
            <div className="user-profile-section">
              <div className="profile-trigger" onClick={handleDropdownToggle}>
                <div className="profile-avatar">
                  <img
                    src={getImageUrl(user?.profileImage)}
                    alt="profile"
                  />
                </div>
                <div className="profile-info">
                  <div className={`profile-name ${textColorClass}`}>{username}</div>
                  <div className={`profile-role ${textColorClass}`}>Admin Profile</div>
                </div>
                <div className="profile-dropdown-icon">
                  <i className={`bi bi-chevron-up ${textColorClass}`}></i>
                </div>
              </div>
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
                        <p className="mb-0"><span className="font-weight-bold">{username}</span></p>
                        <small className="">{email}</small>
                      </div>
                    </div>
                    <div><hr className="dropdown-divider border-dark" /></div>
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
                      onClick={() => setShowSignoutModal(true)}
                      className="list-group-item list-group-item-action border-0 "
                    >
                      <i className="icofont-logout fs-6 me-3" />
                      Signout
                    </button>
                    {/* <div><hr className="dropdown-divider border-dark" /></div> */}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Color picker button - Always visible */}
          <div className="color-picker-section">
            <button
              className={`color-picker-btn ${textColorClass}`}
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Customize Sidebar Color"
            >
              <i className={`bi bi-palette-fill ${textColorClass}`}></i>
            </button>
            {showColorPicker && (
              <div className="color-picker-dropdown">
                <CustomColorPicker
                  color={sidebarColor}
                  onChange={handleColorChange}
                  onClose={() => setShowColorPicker(false)}
                />
              </div>
            )}
          </div>
        </div>

      </div>

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
                        <label htmlFor="currentStatus" className="fw-bold fs-5 text-dark">
                          Change Password
                        </label>
                        <div className="mb-3 mt-3">
                          <label className="form-label fw-bold text-dark">Email</label>
                          <input
                            type="email"
                            className="form-control bg-transparent border-0"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled
                          />
                        </div>
                        <div className="mb-3 mt-3">
                          <label className="form-label fw-bold text-dark">Old Password</label>
                          <div style={{ position: "relative" }}>
                            <input
                              type={showOldPassword ? "text" : "password"}
                              className="form-control"
                              value={oldPassword}
                              onChange={(e) => setOldPassword(e.target.value)}
                              required
                              style={{ paddingRight: "2.5rem" }}
                            />
                            <span
                              style={{
                                position: "absolute",
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                cursor: "pointer",
                                zIndex: 2
                              }}
                              onClick={() => setShowOldPassword((prev) => !prev)}
                              title={showOldPassword ? "Hide Password" : "Show Password"}
                            >
                              <i className={`bi ${showOldPassword ? "bi-eye-slash" : "bi-eye"}`} style={{ fontSize: "1.2rem", color: "#333" }}></i>
                            </span>
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold text-dark">New Password</label>
                          <div style={{ position: "relative" }}>
                            <input
                              type={showNewPassword ? "text" : "password"}
                              className="form-control"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              required
                              style={{ paddingRight: "2.5rem" }}
                            />
                            <span
                              style={{
                                position: "absolute",
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                cursor: "pointer",
                                zIndex: 2
                              }}
                              onClick={() => setShowNewPassword((prev) => !prev)}
                              title={showNewPassword ? "Hide Password" : "Show Password"}
                            >
                              <i className={`bi ${showNewPassword ? "bi-eye-slash" : "bi-eye"}`} style={{ fontSize: "1.2rem", color: "#333" }}></i>
                            </span>
                          </div>
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


      {/* Profile Edit Modal */}
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
                      <label className="fw-bold fs-5 text-dark">Edit Admin Profile</label>
                      <div className='mt-3 mb-3' style={{ position: "relative", width: "150px", margin: "0 auto" }}>
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
                          onChange={handleProfileImageChange}
                        />
                        <span
                          style={{
                            position: "absolute",
                            left: "50%",
                            bottom: "-10px",
                            transform: "translateX(-50%)",
                            // background: "#fff",
                            // borderRadius: "50%",
                            // boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            // padding: "6px",
                            cursor: "pointer",
                            // border: "1px solid #ddd"

                          }}
                          onClick={() => fileInputRef.current.click()}
                        >
                          <i className="bi bi-pencil-square" style={{ fontSize: "1.2rem", color: "#333", title: "Change Image" }}></i>
                        </span>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold text-dark">Username</label>
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                          <input
                            type="text"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                            ref={input => { window.usernameInputRef = input; }}
                            style={{ paddingRight: "2.5rem" }}
                          />
                          <span
                            style={{
                              position: "absolute",
                              right: "10px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              cursor: "pointer",
                              zIndex: 2
                            }}
                            onClick={() => {
                              if (window.usernameInputRef) {
                                window.usernameInputRef.focus();
                                window.usernameInputRef.select();
                              }
                            }}
                            title="Edit Username"
                          >
                            <i className="bi bi-pencil-square" style={{ fontSize: "1.1rem", color: "#333" }}></i>
                          </span>
                        </div>
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
                  <i className="bi bi-box-arrow-right" style={{ fontSize: 26, color: "#FE6730" }}></i>
                </span>
                <h5 className="modal-title" style={{ color: "#FE6730", fontWeight: 700, fontSize: 22, margin: 0 }}>
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
                    backgroundColor: "#FE6730",
                    color: "white",
                    fontWeight: 600,
                    border: "none",
                    boxShadow: "0 2px 8px rgba(254,103,48,0.18)",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.backgroundColor = "#e55a2a";
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.backgroundColor = "#FE6730";
                  }}
                >
                  Yes, Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
