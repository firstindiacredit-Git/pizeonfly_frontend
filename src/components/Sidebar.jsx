import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';  // Import axios
import './Sidebar.css';

const Sidebar = () => {
  const [role, setRole] = useState('');
  const [isHolidayTomorrow, setIsHolidayTomorrow] = useState(false); // State to check if tomorrow is a holiday

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

  return (
    <div className="sidebar px-4 py-4 py-md-5 me-0">
      <div className="d-flex flex-column h-100">

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
          <li className="collapsed">
            <Link className="ms-link" to="/project-dashboard">
              <a
                className="m-link"
                data-bs-toggle="collapse"
                data-bs-target="#dashboard-Components"
                href="#"
              >

                <i className="icofont-home fs-5" />
                <span className='fs-6'>Admin Dashboard</span>{" "}
                {/* <span className="arrow icofont-dotted-down ms-auto text-end fs-5" /> */}
              </a>
            </Link>
            {/* Menu: Sub menu ul */}
            {/* <ul className="sub-menu collapse show" id="dashboard-Components">
                <li>
                  <Link className="ms-link" to="/project-dashboard">
                    <span>Admin Dashboard</span>
                  </Link>
                </li>
              </ul> */}
          </li>
          <li className="collapsed">
            <a
              className="m-link"
              data-bs-toggle="collapse"
              data-bs-target="#project-Components"
              href="#"
            >
              <i className="icofont-briefcase" />
              <span>Projects</span>{" "}
              <span className="arrow icofont-dotted-down ms-auto text-end fs-5" />
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
                className="m-link"
                data-bs-toggle="collapse"
                data-bs-target="#client-Components"
                href="#"
              >
                <i className="icofont-user-male" /> <span>Our Clients</span>{" "}
                <span className="arrow icofont-dotted-down ms-auto text-end fs-5" />
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
                className="m-link"
                data-bs-toggle="collapse"
                data-bs-target="#emp-Components"
                href="#"
              >
                <i className="icofont-users-alt-5" /> <span>Employees</span>{" "}
                <span className="arrow icofont-dotted-down ms-auto text-end fs-5" />
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
                className="m-link"
                data-bs-toggle="collapse"
                data-bs-target="#tools-Components"
                href="#"
              >
                <i className="icofont-tools-alt-2" /> <span>Tools</span>{" "}
                <span className="arrow icofont-dotted-down ms-auto text-end fs-5" />
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
                className="m-link"
                data-bs-toggle="collapse"
                data-bs-target="#accounts-Components"
                href="#"
              >
                <i className="icofont-document-folder" /> <span>Accounts & Billing</span>{" "}
                <span className="arrow icofont-dotted-down ms-auto text-end fs-5" />
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
      </div>
    </div>
  );
};

export default Sidebar;
