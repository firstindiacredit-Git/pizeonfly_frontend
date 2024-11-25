import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from "react-router-dom";
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import Chat from "../components/Chat";
import FloatingMenu from '../components/FloatingMenu';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ProjectDashboard = () => {
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [projectStatusCounts, setProjectStatusCounts] = useState({ completed: 0, inProgress: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  useEffect(() => {
    const fetchProjectStatusCounts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}api/projectStatusCounts`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProjectStatusCounts(data);
      } catch (error) {
        console.error("Error fetching project status counts:", error);
      }
    };
    fetchProjectStatusCounts();
  }, []);

  const createChartData = (label, value, color) => ({
    labels: [label],
    datasets: [{
      label: 'Total Count',
      data: [value],
      backgroundColor: color,
      borderColor: color,
      borderWidth: 1,
    }],
  });

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  const projectsChartData = createChartData('Projects', totalProjects, 'rgba(255, 99, 132, 0.6)');
  const clientsChartData = createChartData('Clients', totalClients, 'rgba(54, 162, 235, 0.6)');
  const employeesChartData = createChartData('Employees', totalEmployees, 'rgba(75, 192, 192, 0.6)');

  const chartData = {
    labels: ['Projects', 'Clients', 'Employees'],
    datasets: [
      {
        label: 'Total Count',
        data: [totalProjects, totalClients, totalEmployees],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const projectStatusChartData = {
    labels: ['Completed', 'In Progress'],
    datasets: [
      {
        data: [projectStatusCounts.completed, projectStatusCounts.inProgress],
        backgroundColor: ['#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#36A2EB', '#FFCE56'],
      },
    ],
  };

  const projectStatusChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Project Status',
      },
    },
  };

  return (
    <>
      <div id="mytask-layout">
        <Sidebar />
        <div className="main px-lg-4 px-md-4">
          <Header />
          <div className="body d-flex py-lg-3 py-md-2">
            <div className="container-xxl">
              <div className="text-center">
                <div style={{ height: isMobile ? "6rem" : "9rem" }}>
                  <img
                    src="Images/icon.png"
                    className="img-fluid"
                    alt="No Data"
                    style={{
                      height: isMobile ? "3rem" : "5rem",
                      maxHeight: "100%",
                      width: "auto"
                    }}
                  />
                  <p className="fs-6" style={{ color: "#4989fd", fontSize: isMobile ? "0.8rem" : "1rem" }}>
                    An agency like no other. <span style={{ color: "#0c117b" }}>Results to match.</span>
                  </p>
                </div>

                <div className="row justify-content-center mt-4">
                  <div className="col-12 col-md-4 mb-4">
                    <Link to="/projects">
                      <div className="card shadow-lg">
                        <div className="card-body">
                          <h5 className="card-title text-center">Projects</h5>
                          <h2 className="text-center mb-4" style={{ color: 'rgba(255, 99, 132, 1)' }}>{totalProjects}</h2>
                          <Bar data={projectsChartData} options={chartOptions} />
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className="col-12 col-md-4 mb-4">
                    <Link to="/clients">
                      <div className="card shadow-lg">
                        <div className="card-body">
                          <h5 className="card-title text-center">Clients</h5>
                          <h2 className="text-center mb-4" style={{ color: 'rgba(54, 162, 235, 1)' }}>{totalClients}</h2>
                          <Bar data={clientsChartData} options={chartOptions} />
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className="col-12 col-md-4 mb-4">
                    <Link to="/members">
                      <div className="card shadow-lg">
                        <div className="card-body">
                          <h5 className="card-title text-center">Employees</h5>
                          <h2 className="text-center mb-4" style={{ color: 'rgba(75, 192, 192, 1)' }}>{totalEmployees}</h2>
                          <Bar data={employeesChartData} options={chartOptions} />
                        </div>
                      </div>
                    </Link>
                  </div>

                </div>
                
                <div className="row justify-content-center">
                  <div className="col-12 col-md-8 mb-4">
                    <div className="card shadow-lg">
                      <div className="card-body">
                        <h5 className="card-title text-center mb-4">Overall Summary</h5>
                        <Bar data={chartData} options={chartOptions} />
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4 mb-4">
                    <div className="card shadow-lg">
                      <div className="card-body">
                        <h5 className="card-title text-center">Project Status</h5>
                        <Doughnut data={projectStatusChartData} options={projectStatusChartOptions} />
                      </div>
                    </div>
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
        <FloatingMenu isMobile={isMobile} />
      </div>
    </>
  );
};

export default ProjectDashboard;













