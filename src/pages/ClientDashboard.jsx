import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../clientCompt/ClientSidebar'
import Header from '../clientCompt/ClientHeader'
import axios from 'axios'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import FloatingMenu from '../Chats/FloatingMenu'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const ClientDashboard = () => {
  const [totalProjects, setTotalProjects] = useState(0)
  const [projectStatus, setProjectStatus] = useState({
    completed: 0,
    inProgress: 0
  })
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('client_token')
        const [projectsResponse, statusResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BASE_URL}api/totalClientProjects`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${import.meta.env.VITE_BASE_URL}api/client-projects`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setTotalProjects(projectsResponse.data.totalProjects);

        // Calculate completed and in-progress projects
        const projects = statusResponse.data;
        const completed = projects.filter(project => project.progress === "100.00").length;
        const inProgress = projects.length - completed;

        setProjectStatus({
          completed,
          inProgress
        });
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Projects Overview',
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
  }

  const projectsChartData = {
    labels: ['Total Projects'],
    datasets: [{
      label: 'Projects',
      data: [totalProjects],
      backgroundColor: 'rgba(255, 99, 132, 0.6)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
    }],
  }

  const doughnutOptions = {
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
  }

  const statusChartData = {
    labels: ['Completed', 'In Progress'],
    datasets: [
      {
        data: [projectStatus.completed, projectStatus.inProgress],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  return (
    <>
      <div id="mytask-layout">
        <Sidebar />
        <div className="main px-lg-4 px-md-4">
          <Header />
          <div className="body d-flex py-lg-3 py-md-2">
            <div className="container-xxl">
              <div className="col-12">
                <div className="card mb-3">
                  <div className="card-body text-center p-5">
                    <div style={{ height: "8rem" }}>
                      <img
                        src="Images/pizeonflylogo.png"
                        className="img-fluid"
                        alt="No Data"
                        style={{
                          height: isMobile ? "3rem" : "5rem",
                          maxHeight: "100%",
                          width: "auto"
                        }}
                      />
                      <p className="fs-6" style={{ color: "#4989fd" }}>An agency like no other. <span style={{ color: "#0c117b" }}>Results to match.</span></p>
                    </div>
                    <div className="mt-4 mb-2">
                      <div className="row justify-content-center">
                        <div className="col-12 col-md-7 mb-4">
                          <div className="card shadow-lg">
                            <div className="card-body text-center">
                              <h5 className="card-title">Your Projects</h5>
                              <h2 className="mb-4" style={{ color: 'rgba(255, 99, 132, 1)' }}>{totalProjects}</h2>
                              <Bar data={projectsChartData} options={chartOptions} />
                            </div>
                          </div>
                        </div>
                        <div className="col-12 col-md-5 mb-4">
                          <div className="card shadow-lg">
                            <div className="card-body text-center">
                              <Doughnut data={statusChartData} options={doughnutOptions} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-5 mb-4 text-center">
                        <Link
                          to="https://pizeonfly.com/"
                          className="btn btn-outline-primary btn-lg position-relative"
                          style={{
                            borderRadius: '30px',
                            padding: '12px 35px',
                            transition: 'all 0.3s ease',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            fontWeight: '600',
                            fontSize: '0.9rem'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <i className="bi bi-globe me-2"></i>
                          Visit Our Website
                          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                            style={{ fontSize: '0.7rem' }}>
                            New
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <FloatingMenu userType="client" isMobile={isMobile} />
      </div>
    </>
  )
}

export default ClientDashboard