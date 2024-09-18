import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const [role, setRole] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setRole(user.role);
    }
  }, []);

  return (
    <div className="sidebar px-4 py-4 py-md-5 me-0">
      <div className="d-flex flex-column h-100">
        <div className="mb-0 brand-icon">
          <span className="logo-icon">
            <img src='../Images/picon.png' style={{ height: "4rem" }} alt="Pizeonfly Logo" />
          </span>
          <div className=''>
            <span className="logo-text fs-4" style={{color:"#00f8ffdb"}}>pizeon</span>
            <span className="logo-text fs-4" style={{marginLeft:"-0.9rem", color:"#004eff"}}>fly</span>
            {/* <span className="logo-text" style={{ fontSize: "10px" }}>TECHNOLOGY NINJAS</span> */}
          </div>
        </div>
        {/* Menu: main ul */}
        <ul className="menu-list flex-grow-1 mt-3">
          <li className="collapsed">
            <a
              className="m-link"
              data-bs-toggle="collapse"
              data-bs-target="#dashboard-Components"
              href="#"
            >
              <i className="icofont-home fs-5" /> <span>Dashboard</span>{" "}
              <span className="arrow icofont-dotted-down ms-auto text-end fs-5" />
            </a>
            {/* Menu: Sub menu ul */}
            <ul className="sub-menu collapse show" id="dashboard-Components">
              <li>
                <Link className="ms-link" to="/project-dashboard">
                  <span>Admin Dashboard</span>
                </Link>
              </li>
            </ul>
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
          {role === 'superadmin' && (
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
            </>
          )}
        </ul>
        <button
          type="button"
          className="btn btn-link sidebar-mini-btn text-light"
        >
          <span className="ms-2">
            <i className="icofont-bubble-right" />
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
