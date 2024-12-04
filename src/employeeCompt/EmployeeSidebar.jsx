import React from 'react'
import { Link } from 'react-router-dom'

const EmployeeSidebar = () => {
    return (

        <>
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
                    <ul className="menu-list flex-grow-1 mt-3">
                        <li className="collapsed">
                            <Link className="ms-link" to="/employee-dashboard">
                                <a
                                    className="m-link"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#dashboard-Components"
                                    href="#"
                                >
                                    <i className="icofont-home fs-5" /> <span className='fs-6'>Employee Dashboard</span>{" "}
                                    {/* <span className="arrow icofont-dotted-down ms-auto text-end fs-5" /> */}
                                </a>
                            </Link>
                            {/* Menu: Sub menu ul */}
                            {/* <ul className="sub-menu collapse show" id="dashboard-Components">
                                <li>
                                    <Link className="ms-link " to="/employee-dashboard">
                                        {" "}
                                        <span>Employee Dashboard</span>
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
                                    <Link className="ms-link" to="/employee-projects">
                                        <span>Projects</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link className="ms-link" to="/employee-tasks">
                                        <span>Tasks</span>
                                    </Link>
                                </li>
                            </ul>
                        </li>
                        {/* Add Tools Menu */}
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
                                    <Link className="ms-link" to="/employee-urlShortner">
                                        <span>URL Shortner</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link className="ms-link" to="/employee-qrCodeGenerate">
                                        <span>QR Code Generator</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link className="ms-link" to="/employee-saasManager">
                                        <span>Saas Manager</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link className="ms-link" to="/employee-htmlTemplateGenerator">
                                        <span>HTML Template Generator</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link className="ms-link" to="/employee-cardValidator">
                                        <span>Card Validator</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link className="ms-link" to="/employee-cardGenerator">
                                        <span>Card Generator</span>
                                    </Link>
                                </li>

                                <li>
                                    <Link className="ms-link" to="/employee-miscellaneous">
                                        <span>Miscellaneous</span>
                                    </Link>
                                </li>
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

export default EmployeeSidebar