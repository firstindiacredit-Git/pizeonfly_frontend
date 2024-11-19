import React, { useState, useEffect } from 'react'
import Sidebar from '../employeeCompt/EmployeeSidebar'
import Header from '../employeeCompt/EmployeeHeader'

import axios from 'axios'
import { Link } from 'react-router-dom'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const EmployeeDashboard = () => {
  const [totalProjects, setTotalProjects] = useState(0)
  const [totalTasks, setTotalTasks] = useState(0)
  const [taskStatusCount, setTaskStatusCount] = useState({
    completed: 0,
    inProgress: 0,
    notStarted: 0
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
        const token = localStorage.getItem('emp_token')
        const [projectsResponse, tasksResponse, taskStatusResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BASE_URL}api/totalAssigneeProjects`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${import.meta.env.VITE_BASE_URL}api/totalAssigneeTasks`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${import.meta.env.VITE_BASE_URL}api/author`, {
            headers: { Authorization: token }
          })
        ])
        setTotalProjects(projectsResponse.data.totalProjects)
        setTotalTasks(tasksResponse.data.totalTasks)
        setTaskStatusCount(taskStatusResponse.data.taskStatusCount)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  const createChartData = (label, value, color) => ({
    labels: [label],
    datasets: [{
      label: 'Total Count',
      data: [value],
      backgroundColor: color,
      borderColor: color,
      borderWidth: 1,
    }],
  })

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
  }

  const projectsChartData = createChartData('Projects', totalProjects, 'rgba(255, 99, 132, 0.6)')
  const tasksChartData = createChartData('Tasks', totalTasks, 'rgba(54, 162, 235, 0.6)')

  const overallChartData = {
    labels: ['Projects', 'Tasks'],
    datasets: [
      {
        label: 'Total Count',
        data: [totalProjects, totalTasks],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const taskStatusChartData = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [
      {
        data: [taskStatusCount.completed, taskStatusCount.inProgress, taskStatusCount.notStarted],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Task Status Breakdown',
      },
    },
  }

  // Add this function to determine if it's a small screen
  const isSmallScreen = () => window.innerWidth <= 576;

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
                        src="Images/icon.png"
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
                    <div className="mt-2 mb-2">
                      <div className="row justify-content-center">
                        <div className={`col-12 ${isSmallScreen() ? 'mb-4' : 'col-md-7'}`}>
                          <div className="card shadow-lg mb-4">
                            <div className="card-body">
                              <h5 className="card-title text-center mb-4">Overall Summary</h5>
                              <Bar data={overallChartData} options={chartOptions} />
                            </div>
                          </div>
                        </div>
                        <div className={`col-12 ${isSmallScreen() ? '' : 'col-md-4'}`}>
                          <div className="card shadow-lg">
                            <div className="card-body">
                              <h5 className="card-title text-center">Project Status</h5>
                              <Doughnut data={taskStatusChartData} options={doughnutOptions} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row justify-content-center mt-3">
                        <div className="col-12 col-md-6 mb-4">
                          <Link to="/employee-projects">
                            <div className="card shadow-lg">
                              <div className="card-body text-center">
                                <h5 className="card-title">Total Projects Assigned</h5>
                                <h2 className="mb-4" style={{ color: 'rgba(255, 99, 132, 1)' }}>{totalProjects}</h2>
                                <Bar data={projectsChartData} options={chartOptions} />
                              </div>
                            </div>
                          </Link>
                        </div>
                        <div className="col-12 col-md-6 mb-4">
                          <Link to="/employee-tasks">
                            <div className="card shadow-lg">
                              <div className="card-body text-center">
                                <h5 className="card-title">Total Tasks Assigned</h5>
                                <h2 className="mb-4" style={{ color: 'rgba(54, 162, 235, 1)' }}>{totalTasks}</h2>
                                <Bar data={tasksChartData} options={chartOptions} />
                              </div>
                            </div>
                          </Link>
                        </div>

                      </div>
                      <Link to="https://pizeonfly.com/" className="text-muted">GO TO THE WEBSITE</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default EmployeeDashboard
