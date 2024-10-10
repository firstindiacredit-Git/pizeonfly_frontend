import React from 'react'
import { Link } from 'react-router-dom'

const ClientSidebar = () => {
    return (

        <>
            <div className="sidebar px-4 py-4 py-md-5 me-0">
                <div className="d-flex flex-column h-100">
                    <div className="mb-0 brand-icon">
                        <span className="logo-icon">
                            <img src='../Images/picon.png' style={{ height: "4rem" }} alt="Pizeonfly Logo" />
                        </span>
                        <div className=''>
                            <span className="logo-text fs-4" style={{ color: "#00f8ffdb" }}>pizeon</span>
                            <span className="logo-text fs-4" style={{ marginLeft: "-0.9rem", color: "#004eff" }}>fly</span>
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
                                    <Link className="ms-link " to="/client-dashboard">
                                        {" "}
                                        <span>Client Dashboard</span>
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
                                    <Link className="ms-link" to="/client-projects">
                                        <span>Projects</span>
                                    </Link>
                                </li>
                                {/* <li>
                                    <Link className="ms-link" to="/tasks">
                                        <span>Tasks</span>
                                    </Link>
                                </li> */}
                            </ul>
                        </li>
                    </ul>
                    {/* Menu: menu collepce btn */}
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
        </>

    )
}

export default ClientSidebar