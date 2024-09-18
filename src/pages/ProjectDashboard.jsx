import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from "react-router-dom";

const ProjectDashboard = () => {
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);

  useEffect(() => {
    const fetchTotalProjects = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}api/totalProjects`);
        const data = await response.json();
        console.log("Total Projects:", data);
        setTotalProjects(data.totalProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchTotalProjects();
  }, []);

  useEffect(() => {
    const fetchTotalClients = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}api/totalClients`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Total Clients:", data);
        setTotalClients(data.totalClients);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchTotalClients();
  }, []);

  useEffect(() => {
    const fetchTotalEmployees = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}api/totalEmployees`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Total Employees:", data);
        setTotalEmployees(data.totalEmployees);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchTotalEmployees();
  }, []);

  return (
    <>
      <div id="mytask-layout">
        <Sidebar />
        <div className="main px-lg-4 px-md-4">
          <Header />
          <div className="body d-flex py-lg-3 py-md-2">
            <div className="container-xxl ">
              <div className="text-center">
                <img
                  src="../assets/images/no-data.svg"
                  className="img-fluid mx-size"
                  alt="No Data"
                />

                <div className="row justify-content-center mt-3">
                  <div className="col-12 col-md-4 mb-4">
                    <Link to="/projects">
                      <div className="card shadow-lg">
                        <div className="card-body text-center">
                          <h5 className="card-title">Total Projects</h5>
                          <p className="card-text display-4 font-weight-bold">{totalProjects}</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className="col-12 col-md-4 mb-4">
                    <Link to="/clients">
                      <div className="card shadow-lg">
                        <div className="card-body text-center">
                          <h5 className="card-title">Total Clients</h5>
                          <p className="card-text display-4 font-weight-bold">{totalClients}</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className="col-12 col-md-4 mb-4">
                    <Link to="/members">
                      <div className="card shadow-lg">
                        <div className="card-body text-center">
                          <h5 className="card-title">Total Employees</h5>
                          <p className="card-text display-4 font-weight-bold">{totalEmployees}</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
                <div className="mt-4 mb-2">
                  <Link to="https://pizeonfly.com/" className="text-muted">
                    GO TO THE WEBSITE
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div >
    </>
  );
};

export default ProjectDashboard;













