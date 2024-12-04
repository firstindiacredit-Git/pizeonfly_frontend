import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';  // Import axios
import './Sidebar.css';
import CustomColorPicker, { isLightColor } from '../pages/colorpicker/CustomColorPicker';

const Sidebar = () => {
  const [role, setRole] = useState('');
  const [isHolidayTomorrow, setIsHolidayTomorrow] = useState(false); // State to check if tomorrow is a holiday
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [sidebarColor, setSidebarColor] = useState(localStorage.getItem('sidebarColor') || '#485563');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setRole(user.role);
    }

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

  const handleColorChange = (color) => {
    setSidebarColor(color);
    localStorage.setItem('sidebarColor', color);
  };

  // Determine text color based on sidebar background color
  const textColorClass = isLightColor(sidebarColor) ? 'text-dark' : 'text-light';

  return (
    <div className={`sidebar px-4 py-4 py-md-5 me-0 ${textColorClass}`} style={{ background: sidebarColor }}>
      <div className="d-flex flex-column"style={{ height: '34rem' }}>


        <div className="mb-0 brand-icon">
          {/* <span className="logo-icon">
            <img src='../Images/picon.png' style={{ height: "4rem" }} alt="Pizeonfly Logo" />
          </span>
          <div className=''>
            <span className="logo-text fs-3" style={{ color: "#4989fd" }}>pizeon</span>
            <span className="logo-text fs-3" style={{ marginLeft: "-0.9rem", color: "#0c117b" }}>fly</span>
          </div> */}
          <img src='../Images/icon.png' style={{ height: "2.7rem" }} alt="Pizeonfly Logo" />
        </div>

        {/* Menu: main ul */}
        {/* {role === 'superadmin' && (
          )} */}
        <ul className="menu-list flex-grow-1 mt-3">
          <li>
            <Link className={`ms-link ${textColorClass}`} to="/project-dashboard">
              <i className={`icofont-home fs-5 ${textColorClass}`} /> <span className={`fs-6 ${textColorClass}`}>Admin Dashboard</span>
            </Link>
          </li>
          <li className="collapsed">
            <a
              className={`m-link ${textColorClass}`}
              data-bs-toggle="collapse"
              data-bs-target="#project-Components"
              href="#"
            >
              <i className={`icofont-briefcase ${textColorClass}`} />
              <span>Projects</span>{" "}
              <span className={`arrow icofont-dotted-down ms-auto text-end fs-5 ${textColorClass}`} />
            </a>
            {/* Menu: Sub menu ul */}
            <ul className="sub-menu collapse" id="project-Components">
              <li>
                <Link className="ms-link" to="/projects">
                  <span>Projects</span>
                </Link>
              </li>
              <li>
                <Link className="ms-link" to="/tasks">
                  <span>Tasks</span>
                </Link>
              </li>
            </ul>
          </li>

          <>
            <li className="collapsed">
              <a
                className={`m-link ${textColorClass}`}
                data-bs-toggle="collapse"
                data-bs-target="#client-Components"
                href="#"
              >
                <i className={`icofont-user-male ${textColorClass}`} /> <span>Our Clients</span>{" "}
                <span className={`arrow icofont-dotted-down ms-auto text-end fs-5 ${textColorClass}`} />
              </a>
              <ul className="sub-menu collapse" id="client-Components">
                <li>
                  <Link className="ms-link" to="/clients">
                    <span>Clients</span>
                  </Link>
                </li>
              </ul>
            </li>
            <li className="collapsed">
              <a
                className={`m-link ${textColorClass}`}
                data-bs-toggle="collapse"
                data-bs-target="#emp-Components"
                href="#"
              >
                <i className={`icofont-users-alt-5 ${textColorClass}`} /> <span>Employees</span>{" "}
                <span className={`arrow icofont-dotted-down ms-auto text-end fs-5 ${textColorClass}`} />
              </a>
              <ul className="sub-menu collapse" id="emp-Components">
                <li>
                  <Link className="ms-link" to="/members">
                    <span>Members</span>
                  </Link>
                </li>
                <li>

                </li>
              </ul>
            </li>

            <li className="collapsed">
              <a
                className={`m-link ${textColorClass}`}
                data-bs-toggle="collapse"
                data-bs-target="#tools-Components"
                href="#"
              >
                <i className={`icofont-tools-alt-2 ${textColorClass}`} /> <span>Tools</span>{" "}
                <span className={`arrow icofont-dotted-down ms-auto text-end fs-5 ${textColorClass}`} />
              </a>
              <ul className="sub-menu collapse" id="tools-Components">
                <li>
                  <Link className="ms-link"
                    // to="https://pizeonflyurl.vercel.app/"
                    to="/urlShortner"
                  >
                    <span>URL Shortner</span>
                  </Link>
                </li>
                <li>
                  <Link className="ms-link" to="/qrCodeGenerate">
                    <span>QR Code Generator</span>
                  </Link>
                </li>
                <li>
                  <Link className="ms-link" to="/saasManager">
                    <span>Saas Manager</span>
                  </Link>
                </li>

                {/* <li>
                    <Link className="ms-link" to="/htmlTemplateGenerator">
                      <span>HTML Template Generator</span>
                    </Link>
                  </li>
                  <li>
                    <Link className="ms-link" to="/cardValidator">
                      <span>Card Validator</span>
                    </Link>
                  </li>
                  <li>
                    <Link className="ms-link" to="/cardGenerator">
                      <span>Card Generator</span>
                    </Link>
                  </li> */}
                <li>
                  <Link className="ms-link" to="/miscellaneous">
                    <span>Miscellaneous</span>
                  </Link>
                </li>
                {/* <li>
                    <Link className="ms-link" to="/miscellaneous1">
                      <span>Miscellaneous1</span>
                    </Link>
                  </li> */}
              </ul>
            </li>
            <li className="collapsed">
              <a
                className={`m-link ${textColorClass}`}
                data-bs-toggle="collapse"
                data-bs-target="#accounts-Components"
                href="#"
              >
                <i className={`icofont-document-folder ${textColorClass}`} /> <span>Accounts & Billing</span>{" "}
                <span className={`arrow icofont-dotted-down ms-auto text-end fs-5 ${textColorClass}`} />
              </a>
              <ul className="sub-menu collapse" id="accounts-Components">
                <li>
                  <Link className="ms-link" to="/create-invoice">
                    <span>Create Invoice</span>
                  </Link>
                </li>
                <li>
                  <Link className="ms-link" to="/all-invoice">
                    <span>All Invoice</span>
                  </Link>
                </li>
              </ul>
            </li>

            {/* <li className="collapsed">
                <a
                  className="m-link"
                  data-bs-toggle="collapse"
                  data-bs-target="#more-Components"
                  href="#"
                >
                  <i className="icofont-listine-dots" /> <span>More</span>{" "}
                  {isHolidayTomorrow && (
                    <div style={{ marginTop: "-0.5rem", marginLeft: "-0.8rem" }}>
                      <span className="bi bi-dot text-danger fs-1" />
                    </div>
                  )}
                  <span className="arrow icofont-dotted-down ms-auto text-end fs-5" />
                </a>
                <ul className="sub-menu collapse" id="more-Components">
                  <li>
                    <Link className="ms-link" to="/calander">
                      <span>Calendar</span>
                      {isHolidayTomorrow && (
                        <div style={{ marginTop: "-0.8rem", marginLeft: "-0.6rem" }}>
                          <span className="bi bi-dot text-danger fs-1" />
                        </div>
                      )}
                    </Link>
                  </li>
                  <li>
                    <Link className="ms-link" to="#">
                      <span>Chat</span>
                    </Link>
                  </li>
                </ul>
              </li> */}
          </>
        </ul>

        {/* <button
          type="button"
          className="btn btn-link sidebar-mini-btn text-light"
        >
          <span className="ms-2">
            <i className="icofont-bubble-right" />
          </span>
        </button> */}
        <div className="d-flex justify-content-end mb-2">
          <button
            className={`btn btn-sm btn-outline-${isLightColor(sidebarColor) ? 'dark' : 'light'}`}
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Customize Sidebar Color"
          >
            <i className={`icofont-color-bucket ${textColorClass}`}></i>
          </button>
          {showColorPicker && (
            <div className='position-absolute' style={{ top: '25rem', right: '67rem' }}>
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
  );
};

export default Sidebar;
