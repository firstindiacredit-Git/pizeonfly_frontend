import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from '../employeeCompt/EmployeeSidebar'
import Header from '../employeeCompt/EmployeeHeader'

import axios from 'axios'
import { Link } from 'react-router-dom'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { Checkbox, IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [totalProjects, setTotalProjects] = useState(0)
  const [totalTasks, setTotalTasks] = useState(0)
  const [taskStatusCount, setTaskStatusCount] = useState({
    completed: 0,
    inProgress: 0,
    notStarted: 0
  })
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [notes, setNotes] = useState('')
  const [tables, setTables] = useState([{
    id: 1,
    rows: 4,
    cols: 4,
    data: Array(4).fill().map(() => Array(4).fill('')),
    name: 'Table 1'
  }])
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [employeeName, setEmployeeName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [aadhaarCard, setAadhaarCard] = useState("");
  const [panCard, setPanCard] = useState("");
  const [resume, setResume] = useState("");
  const [employeeData, setEmployeeData] = useState({
    employeeName: "",
    employeeCompany: "",
    employeeImage: null,
    employeeId: "",
    joiningDate: "",
    username: "",
    password: "",
    emailid: "",
    phone: "",
    department: "",
    designation: "",
    description: "",
    aadhaarCard: null,
    panCard: null,
    resume: null,
    socialLinks: {
      linkedin: "",
      instagram: "",
      youtube: "",
      facebook: "",
      github: "",
      website: "",
      other: ""
    }
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  // Add new state for tracking IDs and loading states
  const [dashboardIds, setDashboardIds] = useState({
    excelSheet: null,
    notePad: null,
    todoList: null
  });
  const [loading, setLoading] = useState({
    excelSheet: true,
    notePad: true,
    todoList: true
  });
  const [error, setError] = useState({
    excelSheet: null,
    notePad: null,
    todoList: null
  });

  // Add employeeId from localStorage
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null);

  // Add new state for editing
  const [editingTodo, setEditingTodo] = useState(null);
  const [editText, setEditText] = useState('');

  // Add these state variables at the top with other states
  const [notepadColor, setNotepadColor] = useState('');
  const [todoColor, setTodoColor] = useState('');
  const [excelSheetColor, setExcelSheetColor] = useState('');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get employeeId when component mounts
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("emp_user"));
    if (user && user.employeeId) {
      setCurrentEmployeeId(user.employeeId);
    }
  }, []);

  useEffect(() => {
    // console.log(currentEmployeeId + "currentEmployeeId")
    const fetchData = async () => {
      try {
        // const token = localStorage.getItem('emp_token')
        const token = localStorage.getItem('emp_user_id') ? localStorage.getItem('emp_user_id') : navigate.state.employeeId
        const [projectsResponse, tasksResponse, taskStatusResponse] = await Promise.all([
          axios.post(`${import.meta.env.VITE_BASE_URL}api/totalAssigneeProjects`, {
            // headers: { Authorization: `Bearer ${token}` }
            _id: token
          }),
          axios.post(`${import.meta.env.VITE_BASE_URL}api/totalAssigneeTasks`, {
            // headers: { Authorization: `Bearer ${token}` }
            _id: token
          }),
          axios.post(`${import.meta.env.VITE_BASE_URL}api/author`, {
            // headers: { Authorization: token }
            _id: token
          })
        ])
        // console.log(projectsResponse.data.totalProjects + "projectsResponse")
        setTotalProjects(projectsResponse.data.totalProjects)
        setTotalTasks(tasksResponse.data.totalTasks)
        setTaskStatusCount(taskStatusResponse.data.taskStatusCount)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("emp_user"));
    if (user) {
      setEmployeeData({
        ...employeeData,
        employeeName: user.employeeName || "",
        employeeId: user.employeeId || "",
        joiningDate: user.joiningDate || "",
        emailid: user.emailid || "",
        password: user.password || "",
        phone: user.phone || "",
        description: user.description || "",
        socialLinks: user.socialLinks || {}
      });
      setEmployeeName(user.employeeName);
      setEmail(user.emailid);
      setImage(user.employeeImage);
      setAadhaarCard(user.aadhaarCard);
      setPanCard(user.panCard);
      setResume(user.resume);
    }
  }, []);

  // Add this function to handle color updates
  const updateColors = async (type, color) => {
    try {
      const employeeId = JSON.parse(localStorage.getItem("emp_user")).employeeId;
      const colors = {
        notepadColor: type === 'notepad' ? color : notepadColor,
        todoColor: type === 'todo' ? color : todoColor,
        excelSheetColor: type === 'excel' ? color : excelSheetColor
      };

      await axios.put(
        `${import.meta.env.VITE_BASE_URL}api/employeeColors/${employeeId}`,
        colors
      );

      // Update local state based on type
      switch (type) {
        case 'notepad':
          setNotepadColor(color);
          break;
        case 'todo':
          setTodoColor(color);
          break;
        case 'excel':
          setExcelSheetColor(color);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error updating colors:', error);
    }
  };

  // Add this to your existing useEffect that fetches dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      const user = JSON.parse(localStorage.getItem("emp_user"));
      if (!user || !user.employeeId) return;

      try {
        // Fetch colors
        const colorResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}api/employeeColors/${user.employeeId}`
        );

        if (colorResponse.data) {
          setNotepadColor(colorResponse.data.notepadColor);
          setTodoColor(colorResponse.data.todoColor);
          setExcelSheetColor(colorResponse.data.excelSheetColor);
        }

        // Fetch Excel Sheet data with employeeId
        const excelResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet/${user.employeeId}`
          // {
          //   headers: { Authorization: `Bearer ${localStorage.getItem('emp_token')}` }
          // }
        );
        if (excelResponse.data.tables) {
          setTables(excelResponse.data.tables);
          setDashboardIds(prev => ({ ...prev, excelSheet: excelResponse.data._id }));
        }
        setLoading(prev => ({ ...prev, excelSheet: false }));

        // Fetch NotePad data with employeeId
        const noteResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}api/employeeNotePad/${user.employeeId}`
          // {
          //   headers: { Authorization: `Bearer ${localStorage.getItem('emp_token')}` }
          // }
        );
        if (noteResponse.data.notes) {
          setNotes(noteResponse.data.notes);
          setDashboardIds(prev => ({ ...prev, notePad: noteResponse.data._id }));
        }
        setLoading(prev => ({ ...prev, notePad: false }));

        // Fetch TodoList data with employeeId
        const todoResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}api/employeeTodoList/${user.employeeId}`
          // {
          //   headers: { Authorization: `Bearer ${localStorage.getItem('emp_token')}` }
          // }
        );
        if (todoResponse.data.todos) {
          setTodos(todoResponse.data.todos);
          setDashboardIds(prev => ({ ...prev, todoList: todoResponse.data._id }));
        }
        setLoading(prev => ({ ...prev, todoList: false }));

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError({
          excelSheet: 'Failed to load Excel Sheet',
          notePad: 'Failed to load NotePad',
          todoList: 'Failed to load Todo List'
        });
        setLoading({
          excelSheet: false,
          notePad: false,
          todoList: false
        });
      }
    };

    fetchDashboardData();
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
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw;
            const backgroundColor = context.dataset.backgroundColor[context.dataIndex];
            return [
              `${context.dataset.label}`,
              `${value}%`
            ];
          },
          labelTextColor: function (context) {
            return context.dataset.backgroundColor[context.dataIndex];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value + '%';
          },
          precision: 0,
        },
      },
    },
  }

  const projectsChartData = createChartData('Projects', totalProjects, 'rgba(255, 99, 132, 0.6)')
  const tasksChartData = createChartData('Tasks', totalTasks, 'rgba(54, 162, 235, 0.6)')

  const overallChartData = {
    labels: [`Projects (${totalProjects})`, `Tasks (${totalTasks})`],
    datasets: [
      {
        label: 'Percentage',
        data: [
          (totalProjects / (totalProjects + totalTasks) * 100).toFixed(1),
          (totalTasks / (totalProjects + totalTasks) * 100).toFixed(1)
        ],
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
    labels: [
      `${((taskStatusCount.completed / totalTasks) * 100).toFixed(1)}% Completed (${taskStatusCount.completed})`,
      `${((taskStatusCount.inProgress / totalTasks) * 100).toFixed(1)}% In Progress (${taskStatusCount.inProgress})`,
      `${((taskStatusCount.notStarted / totalTasks) * 100).toFixed(1)}% Not Started (${taskStatusCount.notStarted})`
    ],
    datasets: [
      {
        data: [
          ((taskStatusCount.completed / totalTasks) * 100).toFixed(1),
          ((taskStatusCount.inProgress / totalTasks) * 100).toFixed(1),
          ((taskStatusCount.notStarted / totalTasks) * 100).toFixed(1)
        ],
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
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw;
            const backgroundColor = context.dataset.backgroundColor[context.dataIndex];
            return [
              `${context.label}`,
              `${value}%`
            ];
          },
          labelTextColor: function (context) {
            return context.dataset.backgroundColor[context.dataIndex];
          }
        }
      }
    },
  }

  // Add this function to determine if it's a small screen
  const isSmallScreen = () => window.innerWidth <= 576;

  // Excel sheet functions
  const handleCellChange = async (tableIndex, rowIndex, colIndex, value) => {
    if (!currentEmployeeId) {
      console.error('No employee ID found');
      setError(prev => ({ ...prev, excelSheet: 'Employee ID not found' }));
      return;
    }

    try {
      const newTables = [...tables];
      newTables[tableIndex].data[rowIndex][colIndex] = value;
      setTables(newTables);

      const token = localStorage.getItem('emp_token');
      if (dashboardIds.excelSheet) {
        const response = await axios.put(
          `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet/${dashboardIds.excelSheet}`,
          {
            tables: newTables,
            employeeId: currentEmployeeId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.tables) {
          setTables(response.data.tables);
        }
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet`,
          {
            tables: newTables,
            employeeId: currentEmployeeId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDashboardIds(prev => ({ ...prev, excelSheet: response.data._id }));
      }
    } catch (error) {
      console.error('Error saving excel sheet:', error);
      setError(prev => ({ ...prev, excelSheet: 'Failed to save changes' }));
    }
  };

  const addRow = async (tableIndex) => {
    if (!currentEmployeeId) {
      console.error('No employee ID found');
      setError(prev => ({ ...prev, excelSheet: 'Employee ID not found' }));
      return;
    }

    try {
      const newTables = [...tables];
      const cols = newTables[tableIndex].cols;
      newTables[tableIndex].rows++;
      newTables[tableIndex].data.push(Array(cols).fill(''));
      setTables(newTables);

      const token = localStorage.getItem('emp_token');
      if (dashboardIds.excelSheet) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet/${dashboardIds.excelSheet}`,
          {
            tables: newTables,
            employeeId: currentEmployeeId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet`,
          {
            tables: newTables,
            employeeId: currentEmployeeId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDashboardIds(prev => ({ ...prev, excelSheet: response.data._id }));
      }
    } catch (error) {
      console.error('Error adding row:', error);
      setError(prev => ({ ...prev, excelSheet: 'Failed to add row' }));
    }
  };

  const addColumn = async (tableIndex) => {
    if (!currentEmployeeId) {
      console.error('No employee ID found');
      setError(prev => ({ ...prev, excelSheet: 'Employee ID not found' }));
      return;
    }

    try {
      const newTables = [...tables];
      newTables[tableIndex].cols++;
      newTables[tableIndex].data = newTables[tableIndex].data.map(row => [...row, '']);
      setTables(newTables);

      const token = localStorage.getItem('emp_token');
      if (dashboardIds.excelSheet) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet/${dashboardIds.excelSheet}`,
          {
            tables: newTables,
            employeeId: currentEmployeeId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet`,
          {
            tables: newTables,
            employeeId: currentEmployeeId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDashboardIds(prev => ({ ...prev, excelSheet: response.data._id }));
      }
    } catch (error) {
      console.error('Error adding column:', error);
      setError(prev => ({ ...prev, excelSheet: 'Failed to add column' }));
    }
  };

  const addTable = async () => {
    if (!currentEmployeeId) {
      console.error('No employee ID found');
      setError(prev => ({ ...prev, excelSheet: 'Employee ID not found' }));
      return;
    }

    try {
      const newTable = {
        id: tables.length + 1,
        rows: 4,
        cols: 4,
        data: Array(4).fill().map(() => Array(4).fill('')),
        name: `Table ${tables.length + 1}`
      };
      const newTables = [...tables, newTable];
      setTables(newTables);

      const token = localStorage.getItem('emp_token');
      if (dashboardIds.excelSheet) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet/${dashboardIds.excelSheet}`,
          {
            tables: newTables,
            employeeId: currentEmployeeId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet`,
          {
            tables: newTables,
            employeeId: currentEmployeeId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDashboardIds(prev => ({ ...prev, excelSheet: response.data._id }));
      }
    } catch (error) {
      console.error('Error adding table:', error);
      setError(prev => ({ ...prev, excelSheet: 'Failed to add table' }));
    }
  };

  // Todo list functions
  const addTodo = async (e) => {
    e.preventDefault();
    if (newTodo.trim()) {
      try {
        const newTodoItem = {
          text: newTodo,
          completed: false,
          createdAt: new Date().toISOString()
        };
        const updatedTodos = [...todos, newTodoItem];
        setTodos(updatedTodos);
        setNewTodo('');

        const token = localStorage.getItem('emp_token');
        if (dashboardIds.todoList) {
          await axios.put(
            `${import.meta.env.VITE_BASE_URL}api/employeeTodoList/${dashboardIds.todoList}`,
            {
              todos: updatedTodos,
              employeeId: currentEmployeeId
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          const response = await axios.post(
            `${import.meta.env.VITE_BASE_URL}api/employeeTodoList`,
            {
              todos: updatedTodos,
              employeeId: currentEmployeeId
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setDashboardIds(prev => ({ ...prev, todoList: response.data._id }));
        }
      } catch (error) {
        console.error('Error saving todo:', error);
        setError(prev => ({ ...prev, todoList: 'Failed to save changes' }));
      }
    }
  };

  const toggleTodo = async (index) => {
    try {
      const newTodos = [...todos];
      newTodos[index] = {
        ...newTodos[index],
        completed: !newTodos[index].completed
      };
      setTodos(newTodos);

      const token = localStorage.getItem('emp_token');
      if (dashboardIds.todoList) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}api/employeeTodoList/${dashboardIds.todoList}`,
          { todos: newTodos },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      setError(prev => ({ ...prev, todoList: 'Failed to update todo' }));
      // Revert the state if the API call fails
      const revertedTodos = [...todos];
      revertedTodos[index].completed = !revertedTodos[index].completed;
      setTodos(revertedTodos);
    }
  };

  const deleteTodo = async (index) => {
    try {
      const newTodos = todos.filter((_, i) => i !== index);
      const token = localStorage.getItem('emp_token');

      if (dashboardIds.todoList) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}api/employeeTodoList/${dashboardIds.todoList}`,
          { todos: newTodos },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Only update state after successful API call
        setTodos(newTodos);
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError(prev => ({ ...prev, todoList: 'Failed to delete todo' }));
    }
  };

  const handleTableNameChange = async (tableIndex, newName) => {
    if (!currentEmployeeId) {
      console.error('No employee ID found');
      setError(prev => ({ ...prev, excelSheet: 'Employee ID not found' }));
      return;
    }

    try {
      const newTables = [...tables];
      newTables[tableIndex].name = newName;
      setTables(newTables);

      const token = localStorage.getItem('emp_token');
      if (dashboardIds.excelSheet) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet/${dashboardIds.excelSheet}`,
          {
            tables: newTables,
            employeeId: currentEmployeeId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error('Error updating table name:', error);
      setError(prev => ({ ...prev, excelSheet: 'Failed to update table name' }));
    }
  };

  // Add these helper functions at the top of your component
  const getColumnLabel = (index) => {
    let label = '';
    while (index >= 0) {
      label = String.fromCharCode(65 + (index % 26)) + label;
      index = Math.floor(index / 26) - 1;
    }
    return label;
  };

  // Add these new functions
  const deleteRow = async (tableIndex, rowIndex) => {
    if (!currentEmployeeId) {
      console.error('No employee ID found');
      setError(prev => ({ ...prev, excelSheet: 'Employee ID not found' }));
      return;
    }

    try {
      const newTables = [...tables];
      newTables[tableIndex].data.splice(rowIndex, 1);
      newTables[tableIndex].rows--;
      setTables(newTables);

      const token = localStorage.getItem('emp_token');
      if (dashboardIds.excelSheet) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet/${dashboardIds.excelSheet}`,
          {
            tables: newTables,
            employeeId: currentEmployeeId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet`,
          {
            tables: newTables,
            employeeId: currentEmployeeId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDashboardIds(prev => ({ ...prev, excelSheet: response.data._id }));
      }
    } catch (error) {
      console.error('Error deleting row:', error);
      setError(prev => ({ ...prev, excelSheet: 'Failed to delete row' }));
    }
  };

  const deleteColumn = async (tableIndex, colIndex) => {
    if (!currentEmployeeId) {
      console.error('No employee ID found');
      setError(prev => ({ ...prev, excelSheet: 'Employee ID not found' }));
      return;
    }

    try {
      const newTables = [...tables];
      newTables[tableIndex].data = newTables[tableIndex].data.map(row => {
        row.splice(colIndex, 1);
        return row;
      });
      newTables[tableIndex].cols--;
      setTables(newTables);

      const token = localStorage.getItem('emp_token');
      if (dashboardIds.excelSheet) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet/${dashboardIds.excelSheet}`,
          {
            tables: newTables,
            employeeId: currentEmployeeId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet`,
          {
            tables: newTables,
            employeeId: currentEmployeeId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDashboardIds(prev => ({ ...prev, excelSheet: response.data._id }));
      }
    } catch (error) {
      console.error('Error deleting column:', error);
      setError(prev => ({ ...prev, excelSheet: 'Failed to delete column' }));
    }
  };

  const handleImageClick = useCallback((imageUrl) => {
    window.open(imageUrl, '_blank');
  }, []);

  const handleFileClick = useCallback((e, fileUrl, fileType) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileType === 'pdf') {
      setPdfUrl(fileUrl);
    } else {
      setSelectedImage(fileUrl);
    }
  }, []);

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Modify handleNotesChange function
  const handleNotesChange = async (value) => {
    if (!currentEmployeeId) {
      console.error('No employee ID found');
      setError(prev => ({ ...prev, notePad: 'Employee ID not found' }));
      return;
    }

    try {
      setNotes(value); // Optimistic update
      const token = localStorage.getItem('emp_token');

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/employeeNotePad`,
        {
          notes: value,
          employeeId: currentEmployeeId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data._id) {
        setDashboardIds(prev => ({ ...prev, notePad: response.data._id }));
      }
      if (response.data.notes) {
        setNotes(response.data.notes);
      }
    } catch (error) {
      console.error('Error saving notepad:', error);
      setError(prev => ({ ...prev, notePad: 'Failed to save changes' }));
      // Revert to previous value if save fails
      setNotes(prev => prev);
    }
  };

  // Add this new function inside the EmployeeDashboard component
  const deleteTable = async (tableIndex) => {
    if (!currentEmployeeId) {
      console.error('No employee ID found');
      setError(prev => ({ ...prev, excelSheet: 'Employee ID not found' }));
      return;
    }

    try {
      const newTables = tables.filter((_, index) => index !== tableIndex);
      setTables(newTables);

      const token = localStorage.getItem('emp_token');
      if (dashboardIds.excelSheet) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet/${dashboardIds.excelSheet}`,
          {
            tables: newTables,
            employeeId: currentEmployeeId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error('Error deleting table:', error);
      setError(prev => ({ ...prev, excelSheet: 'Failed to delete table' }));
    }
  };

  // Add this new function inside the EmployeeDashboard component
  const clearTableData = async (tableIndex) => {
    if (!currentEmployeeId) {
      console.error('No employee ID found');
      setError(prev => ({ ...prev, excelSheet: 'Employee ID not found' }));
      return;
    }

    try {
      const newTables = [...tables];
      // Create empty data array with same dimensions
      newTables[tableIndex].data = Array(newTables[tableIndex].rows)
        .fill()
        .map(() => Array(newTables[tableIndex].cols).fill(''));
      setTables(newTables);

      if (dashboardIds.excelSheet) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet/${dashboardIds.excelSheet}`,
          {
            tables: newTables,
            employeeId: currentEmployeeId
          }
        );
      }
    } catch (error) {
      console.error('Error clearing table data:', error);
      setError(prev => ({ ...prev, excelSheet: 'Failed to clear table data' }));
    }
  };

  // Add this new function inside the EmployeeDashboard component
  const clearNotePad = async () => {
    if (!currentEmployeeId) {
      console.error('No employee ID found');
      setError(prev => ({ ...prev, notePad: 'Employee ID not found' }));
      return;
    }

    try {
      setNotes(''); // Clear the notes in frontend

      const token = localStorage.getItem('emp_token');
      if (dashboardIds.notePad) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}api/employeeNotePad/${dashboardIds.notePad}`,
          {
            notes: '',
            employeeId: currentEmployeeId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error('Error clearing notepad:', error);
      setError(prev => ({ ...prev, notePad: 'Failed to clear notepad' }));
    }
  };

  // Add this new function inside the EmployeeDashboard component
  const clearAllTodos = async () => {
    if (!currentEmployeeId) {
      console.error('No employee ID found');
      setError(prev => ({ ...prev, todoList: 'Employee ID not found' }));
      return;
    }

    try {
      const token = localStorage.getItem('emp_token');
      if (dashboardIds.todoList) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}api/employeeTodoList/${dashboardIds.todoList}`,
          {
            todos: [],
            employeeId: currentEmployeeId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTodos([]); // Clear todos in frontend
      }
    } catch (error) {
      console.error('Error clearing todos:', error);
      setError(prev => ({ ...prev, todoList: 'Failed to clear todos' }));
    }
  };

  // Add new function to handle edit mode
  const startEditing = (index, text) => {
    setEditingTodo(index);
    setEditText(text);
  };

  // Add function to save edited todo
  const saveEditedTodo = async (index) => {
    try {
      const newTodos = [...todos];
      newTodos[index] = {
        ...newTodos[index],
        text: editText,
        createdAt: newTodos[index].createdAt || new Date().toLocaleString()
      };

      const token = localStorage.getItem('emp_token');
      if (dashboardIds.todoList) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}api/employeeTodoList/${dashboardIds.todoList}`,
          { todos: newTodos },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTodos(newTodos);
      }
      setEditingTodo(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating todo:', error);
      setError(prev => ({ ...prev, todoList: 'Failed to update todo' }));
    }
  };

  // Add this helper function near the top of the component
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  // Add new function to handle drag end
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTodos(items);

    // Update in backend
    try {
      if (dashboardIds.todoList) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}api/employeeTodoList/${dashboardIds.todoList}`,
          { todos: items },
          { headers: { Authorization: `Bearer ${localStorage.getItem('emp_token')}` } }
        );
      }
    } catch (error) {
      console.error('Error updating todo order:', error);
      setError(prev => ({ ...prev, todoList: 'Failed to update todo order' }));
    }
  };

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

                    <div className="profile-section p-4 bg-white rounded-4 shadow-sm mb-4">
                      <div className="d-flex align-items-start gap-4">
                        {/* Profile Image Section */}
                        <div className="profile-image-container position-relative">
                          <img
                            className="avatar rounded-circle border border-2 border-primary p-1"
                            src={`${import.meta.env.VITE_BASE_URL}${image.replace('uploads/', '')}`}
                            alt="profile"
                            style={{
                              transition: 'all 0.3s ease-in-out',
                              cursor: 'pointer',
                              width: '100px',
                              height: '100px',
                              objectFit: 'cover'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'scale(3)';
                              e.target.style.zIndex = '100';
                              e.target.style.borderRadius = '8px';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'scale(1)';
                              e.target.style.zIndex = '1';
                              e.target.style.borderRadius = '50%';
                            }}
                            onClick={() => handleImageClick(`${import.meta.env.VITE_BASE_URL}${image.replace('uploads/', '')}`)}
                          />
                        </div>

                        {/* Profile Details Section */}
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h3 className="mb-1 fw-bold text-primary">{employeeName}</h3>
                              <p className="text-muted mb-2">
                                <i className="bi bi-envelope-fill me-2"></i>
                                {email}
                              </p>
                            </div>
                          </div>

                          {/* Documents Section */}
                          <div className="documents-section bg-light p-3 rounded-3 mb-3">
                            <h5 className="mb-3 fw-bold">
                              <i className="bi bi-file-earmark-text me-2 text-secondary"></i>
                              Documents
                            </h5>
                            <div className="row g-3">
                              {/* Aadhaar Card */}
                              <div className="col-md-4">
                                <div className="document-card p-2 border rounded-3 bg-white">
                                  <strong className="d-block mb-2">
                                    <i className="bi bi-card-text text-secondary me-2"></i>
                                    Aadhaar Card
                                  </strong>
                                  {aadhaarCard ? (
                                    <div>
                                      {aadhaarCard.toLowerCase().endsWith('.pdf') ? (
                                        <div className="text-center">
                                          <i className="bi bi-file-pdf text-danger" style={{ fontSize: '2.8rem' }}></i>
                                        </div>
                                      ) : (
                                        <img
                                          src={`${import.meta.env.VITE_BASE_URL}${aadhaarCard.replace('uploads/', '')}`}
                                          alt="Aadhaar Card"
                                          className="img-thumbnail cursor-pointer mb-2"
                                          onClick={(e) => handleFileClick(e, `${import.meta.env.VITE_BASE_URL}${aadhaarCard.replace('uploads/', '')}`, 'image')}
                                          style={{ height: '60px', objectFit: 'cover' }}
                                        />
                                      )}
                                      <div className="d-flex gap-2 mt-2">
                                        <a
                                          href="#"
                                          className="btn btn-sm btn-outline-primary flex-grow-1"
                                          onClick={(e) => handleFileClick(e, `${import.meta.env.VITE_BASE_URL}${aadhaarCard.replace('uploads/', '')}`, aadhaarCard.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image')}
                                        >
                                          <i className="bi bi-eye me-1"></i>View
                                        </a>
                                        <a
                                          href="#"
                                          className="btn btn-sm btn-outline-success flex-grow-1"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleDownload(
                                              `${import.meta.env.VITE_BASE_URL}${aadhaarCard.replace('uploads/', '')}`,
                                              `aadhaar-card${aadhaarCard.substring(aadhaarCard.lastIndexOf('.'))}`
                                            );
                                          }}
                                        >
                                          <i className="bi bi-download me-1"></i>Download
                                        </a>
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-danger">
                                      <i className="bi bi-x-circle me-2"></i>Not uploaded
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Pan Card */}
                              <div className="col-md-4">
                                <div className="document-card p-2 border rounded-3 bg-white">
                                  <strong className="d-block mb-2">
                                    <i className="bi bi-card-heading text-secondary me-2"></i>
                                    Pan Card
                                  </strong>
                                  {panCard ? (
                                    <div>
                                      {panCard.toLowerCase().endsWith('.pdf') ? (
                                        <div className="text-center">
                                          <i className="bi bi-file-pdf text-danger" style={{ fontSize: '2.8rem' }}></i>
                                        </div>
                                      ) : (
                                        <img
                                          src={`${import.meta.env.VITE_BASE_URL}${panCard.replace('uploads/', '')}`}
                                          alt="Pan Card"
                                          className="img-thumbnail cursor-pointer mb-2"
                                          onClick={(e) => handleFileClick(e, `${import.meta.env.VITE_BASE_URL}${panCard.replace('uploads/', '')}`, 'image')}
                                          style={{ height: '60px', objectFit: 'cover' }}
                                        />
                                      )}
                                      <div className="d-flex gap-2 mt-2">
                                        <a
                                          href="#"
                                          className="btn btn-sm btn-outline-primary flex-grow-1"
                                          onClick={(e) => handleFileClick(e, `${import.meta.env.VITE_BASE_URL}${panCard.replace('uploads/', '')}`, panCard.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image')}
                                        >
                                          <i className="bi bi-eye me-1"></i>View
                                        </a>
                                        <a
                                          href="#"
                                          className="btn btn-sm btn-outline-success flex-grow-1"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleDownload(
                                              `${import.meta.env.VITE_BASE_URL}${panCard.replace('uploads/', '')}`,
                                              `pan-card${panCard.substring(panCard.lastIndexOf('.'))}`
                                            );
                                          }}
                                        >
                                          <i className="bi bi-download me-1"></i>Download
                                        </a>
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-danger">
                                      <i className="bi bi-x-circle me-2"></i>Not uploaded
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Resume */}
                              <div className="col-md-4">
                                <div className="document-card p-2 border rounded-3 bg-white">
                                  <strong className="d-block mb-2">
                                    <i className="bi bi-file-person text-secondary me-2"></i>
                                    Resume
                                  </strong>
                                  {resume ? (
                                    <div>
                                      {resume.toLowerCase().endsWith('.pdf') ? (
                                        <div className="text-center">
                                          <i className="bi bi-file-pdf text-danger" style={{ fontSize: '2.8rem' }}></i>
                                        </div>
                                      ) : (
                                        <img
                                          src={`${import.meta.env.VITE_BASE_URL}${resume.replace('uploads/', '')}`}
                                          alt="Resume"
                                          className="img-thumbnail cursor-pointer mb-2"
                                          onClick={(e) => handleFileClick(e, `${import.meta.env.VITE_BASE_URL}${resume.replace('uploads/', '')}`, 'image')}
                                          style={{ height: '60px', objectFit: 'cover' }}
                                        />
                                      )}
                                      <div className="d-flex gap-2 mt-2">
                                        <a
                                          href="#"
                                          className="btn btn-sm btn-outline-primary flex-grow-1"
                                          onClick={(e) => handleFileClick(e, `${import.meta.env.VITE_BASE_URL}${resume.replace('uploads/', '')}`, resume.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image')}
                                        >
                                          <i className="bi bi-eye me-1"></i>View
                                        </a>
                                        <a
                                          href="#"
                                          className="btn btn-sm btn-outline-success flex-grow-1"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleDownload(
                                              `${import.meta.env.VITE_BASE_URL}${resume.replace('uploads/', '')}`,
                                              `resume${resume.substring(resume.lastIndexOf('.'))}`
                                            );
                                          }}
                                        >
                                          <i className="bi bi-download me-1"></i>Download
                                        </a>
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-danger">
                                      <i className="bi bi-x-circle me-2"></i>Not uploaded
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Social Links */}
                          <div className="social-links-section">
                            <h5 className="mb-3 fw-bold">
                              <i className="bi bi-share me-2 text-secondary"></i>
                              Social Links
                            </h5>
                            <div className="d-flex flex-wrap gap-2">
                              {employeeData?.socialLinks?.linkedin && (
                                <a href={employeeData.socialLinks.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-outline-primary btn-sm px-3 d-flex align-items-center gap-2">
                                  <i className="bi bi-linkedin"></i>
                                  <span>LinkedIn</span>
                                </a>
                              )}
                              {employeeData?.socialLinks?.github && (
                                <a href={employeeData.socialLinks.github}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-outline-dark btn-sm px-3 d-flex align-items-center gap-2">
                                  <i className="bi bi-github"></i>
                                  <span>GitHub</span>
                                </a>
                              )}
                              {employeeData?.socialLinks?.instagram && (
                                <a href={employeeData.socialLinks.instagram}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-outline-danger btn-sm px-3 d-flex align-items-center gap-2">
                                  <i className="bi bi-instagram"></i>
                                  <span>Instagram</span>
                                </a>
                              )}
                              {employeeData?.socialLinks?.youtube && (
                                <a href={employeeData.socialLinks.youtube}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-outline-danger btn-sm px-3 d-flex align-items-center gap-2">
                                  <i className="bi bi-youtube"></i>
                                  <span>YouTube</span>
                                </a>
                              )}
                              {employeeData?.socialLinks?.facebook && (
                                <a href={employeeData.socialLinks.facebook}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-outline-primary btn-sm px-3 d-flex align-items-center gap-2">
                                  <i className="bi bi-facebook"></i>
                                  <span>Facebook</span>
                                </a>
                              )}
                              {employeeData?.socialLinks?.website && (
                                <a href={employeeData.socialLinks.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-outline-info btn-sm px-3 d-flex align-items-center gap-2">
                                  <i className="bi bi-globe"></i>
                                  <span>Website</span>
                                </a>
                              )}
                              {employeeData?.socialLinks?.other && (
                                <a href={employeeData.socialLinks.other}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-outline-secondary btn-sm px-3 d-flex align-items-center gap-2">
                                  <i className="bi bi-link-45deg"></i>
                                  <span>Other</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    <style jsx>{`
                      .profile-section {
                        transition: all 0.3s ease;
                      }
                      .profile-section:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
                      }
                      .document-card {
                        transition: all 0.3s ease;
                      }
                      .document-card:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                      }
                      .cursor-pointer {
                        cursor: pointer;
                      }
                      .btn {
                        transition: all 0.3s ease;
                      }
                      .btn:hover {
                        transform: translateY(-2px);
                      }
                    `}</style>

                    <div className="row justify-content-center">
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

                    <div className="row justify-content-center mt-3">
                      <div className={`col-12 ${isSmallScreen() ? 'mb-4' : 'col-md-8'}`}>
                        <div className="card shadow-lg mb-4">
                          <div className="card-body">
                            <h5 className="card-title text-center mb-4">Overall Summary</h5>
                            <Bar data={overallChartData} options={chartOptions} />
                          </div>
                        </div>
                      </div>
                      <div className={`col-12 ${isSmallScreen() ? '' : 'col-md-4'}`}>
                        <div className="card shadow-lg" style={{ height: '95%' }}>
                          <div className="card-body">
                            <h5 className="card-title text-center">Project Status</h5>
                            <Doughnut data={taskStatusChartData} options={doughnutOptions} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row justify-content-center mt-3">



                      {/* NotePad */}
                      <div className="col-12 col-md-8 mb-4">
                        <div className="card shadow-lg mb-4">
                          <div className="card-body" style={{ backgroundColor: notepadColor }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <div className="btn-group">
                                <button
                                  className="btn btn-sm"
                                  style={{ marginLeft: "-15px" }}
                                  onClick={() => updateColors('notepad', '#ffffff')}
                                  title="#ffffff"
                                >
                                  <i className="bi bi-circle-fill text-white"></i>
                                </button>
                                <button
                                  className="btn btn-sm"
                                  style={{ marginLeft: "-15px" }}
                                  onClick={() => updateColors('notepad', '#fff3cd')}
                                  title="#fff3cd"
                                >
                                  <i className="bi bi-circle-fill text-warning"></i>
                                </button>
                                <button
                                  className="btn btn-sm"
                                  style={{ marginLeft: "-15px" }}
                                  onClick={() => updateColors('notepad', '#f8d7da')}
                                  title="Red"
                                >
                                  <i className="bi bi-circle-fill text-danger"></i>
                                </button>
                                <button
                                  className="btn btn-sm"
                                  style={{ marginLeft: "-15px" }}
                                  onClick={() => updateColors('notepad', '#cfe2ff')}
                                  title="Blue"
                                >
                                  <i className="bi bi-circle-fill text-primary"></i>
                                </button>
                              </div>
                              <h5 className="card-title m-0">NotePad</h5>
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={clearNotePad}
                              >
                                Clear All
                              </button>
                            </div>
                            {loading.notePad ? (
                              <div className="text-center">
                                <div className="spinner-border text-primary" role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </div>
                              </div>
                            ) : error.notePad ? (
                              <div className="alert alert-danger">{error.notePad}</div>
                            ) : (
                              <ReactQuill
                                value={notes}
                                onChange={handleNotesChange}
                                style={{ height: '310px', marginBottom: '50px' }}
                              />
                            )}
                          </div>
                        </div>


                      </div>
                      {/* Todo List */}
                      <div className="col-12 col-md-4 mb-4">
                        <div className="card shadow-lg">
                          <div className="card-body" style={{ backgroundColor: todoColor }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <div className="btn-group">
                                <button
                                  className="btn btn-sm"
                                  style={{ marginLeft: "-15px" }}
                                  onClick={() => updateColors('todo', '#ffffff')}
                                  title="#ffffff"
                                >
                                  <i className="bi bi-circle-fill text-white"></i>
                                </button>
                                <button
                                  className="btn btn-sm"
                                  style={{ marginLeft: "-15px" }}
                                  onClick={() => updateColors('todo', '#fff3cd')}
                                  title="#fff3cd"
                                >
                                  <i className="bi bi-circle-fill text-warning"></i>
                                </button>
                                <button
                                  className="btn btn-sm"
                                  style={{ marginLeft: "-15px" }}
                                  onClick={() => updateColors('todo', '#f8d7da')}
                                  title="Red"
                                >
                                  <i className="bi bi-circle-fill text-danger"></i>
                                </button>
                                <button
                                  className="btn btn-sm"
                                  style={{ marginLeft: "-15px" }}
                                  onClick={() => updateColors('todo', '#cfe2ff')}
                                  title="Blue"
                                >
                                  <i className="bi bi-circle-fill text-primary"></i>
                                </button>
                              </div>
                              <h5 className="card-title m-0">Todo List</h5>
                              {todos.length > 0 && (
                                <button
                                  className="btn btn-warning btn-sm"
                                  onClick={clearAllTodos}
                                >
                                  Clear All
                                </button>
                              )}
                            </div>
                            {loading.todoList ? (
                              <div className="text-center">
                                <div className="spinner-border text-primary" role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </div>
                              </div>
                            ) : error.todoList ? (
                              <div className="alert alert-danger">{error.todoList}</div>
                            ) : (
                              <>
                                <DragDropContext onDragEnd={handleDragEnd}>
                                  <Droppable droppableId="todos">
                                    {(provided) => (
                                      <ul
                                        className="list-group"
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        style={{
                                          maxHeight: '19.1rem',
                                          overflowY: 'auto',
                                          scrollbarWidth: 'thin',
                                          msOverflowStyle: 'none',
                                          '&::-webkit-scrollbar': {
                                            width: '6px',
                                          },
                                          '&::-webkit-scrollbar-track': {
                                            background: '#f1f1f1',
                                            display: 'none'
                                          },
                                          '&::-webkit-scrollbar-thumb': {
                                            background: '#888',
                                            borderRadius: '4px',
                                            display: 'none'
                                          }
                                        }}
                                      >
                                        {todos.map((todo, index) => (
                                          <Draggable
                                            key={todo.createdAt || index}
                                            draggableId={todo.createdAt || `todo-${index}`}
                                            index={index}
                                          >
                                            {(provided, snapshot) => (
                                              <li
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className="list-group-item"
                                                style={{
                                                  ...provided.draggableProps.style,
                                                  background: snapshot.isDragging ? '#f8f9fa' : 'white',
                                                  cursor: 'grab'
                                                }}
                                              >
                                                <div className="d-flex justify-content-between align-items-center">
                                                  <div className="d-flex align-items-center" style={{ width: '100%' }}>
                                                    <span className="me-2" style={{
                                                      minWidth: '25px',
                                                      color: '#666',
                                                      fontWeight: '500'
                                                    }}>
                                                      {index + 1}.
                                                    </span>
                                                    {editingTodo === index ? (
                                                      <div className="d-flex align-items-center flex-grow-1">
                                                        <input
                                                          type="text"
                                                          className="form-control form-control-sm me-2"
                                                          value={editText}
                                                          onChange={(e) => setEditText(e.target.value)}
                                                          autoFocus
                                                          onKeyPress={(e) => {
                                                            if (e.key === 'Enter') {
                                                              saveEditedTodo(index);
                                                            }
                                                          }}
                                                        />
                                                        <button
                                                          className="btn btn-sm btn-success me-1"
                                                          onClick={() => saveEditedTodo(index)}
                                                        >
                                                          Save
                                                        </button>
                                                        <button
                                                          className="btn btn-sm btn-secondary"
                                                          onClick={() => {
                                                            setEditingTodo(null);
                                                            setEditText('');
                                                          }}
                                                        >
                                                          Cancel
                                                        </button>
                                                      </div>
                                                    ) : (
                                                      <>
                                                        <span className='text-start'
                                                          style={{
                                                            textDecoration: todo.completed ? 'line-through' : 'none',
                                                            marginLeft: '8px',
                                                            flex: 1,
                                                            overflow: 'hidden',
                                                            color: todo.completed ? '#888' : 'inherit',
                                                            cursor: 'pointer'
                                                          }}
                                                          onClick={() => startEditing(index, todo.text)}
                                                        >
                                                          {todo.text}
                                                        </span>

                                                        <Checkbox
                                                          checked={todo.completed || false}
                                                          onChange={() => toggleTodo(index)}
                                                          style={{ height: '10px', width: '10px' }}
                                                        />
                                                        <IconButton
                                                          onClick={() => deleteTodo(index)}
                                                          size="small"
                                                          style={{ marginLeft: '8px' }}
                                                        >
                                                          <DeleteIcon style={{ height: '20px', width: '20px' }} />
                                                        </IconButton>

                                                      </>

                                                    )}
                                                  </div>
                                                </div>
                                                <span className='text-muted' style={{ fontSize: '0.8rem', marginRight: '10px' }}>
                                                  {todo.createdAt ? (
                                                    <>
                                                      {new Date(todo.createdAt).toLocaleString()} ({getTimeAgo(todo.createdAt)})
                                                    </>
                                                  ) : 'No date'}
                                                </span>
                                              </li>
                                            )}
                                          </Draggable>
                                        ))}
                                        {provided.placeholder}
                                      </ul>
                                    )}
                                  </Droppable>
                                </DragDropContext>
                              </>
                            )}
                          </div>
                        </div>
                      </div>


                      {/* Excel Sheet */}
                      <div className="card shadow-lg mb-5">
                        <div className="card-body" style={{ backgroundColor: excelSheetColor }}>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="btn-group">
                              <button
                                className="btn btn-sm"
                                style={{ marginLeft: "-15px" }}
                                onClick={() => updateColors('excel', '#ffffff')}
                                title="#ffffff"
                              >
                                <i className="bi bi-circle-fill text-white"></i>
                              </button>
                              <button
                                className="btn btn-sm"
                                style={{ marginLeft: "-15px" }}
                                onClick={() => updateColors('excel', '#fff3cd')}
                                title="#fff3cd"
                              >
                                <i className="bi bi-circle-fill text-warning"></i>
                              </button>
                              <button
                                className="btn btn-sm"
                                style={{ marginLeft: "-15px" }}
                                onClick={() => updateColors('excel', '#f8d7da')}
                                title="Red"
                              >
                                <i className="bi bi-circle-fill text-danger"></i>
                              </button>
                              <button
                                className="btn btn-sm"
                                style={{ marginLeft: "-15px" }}
                                onClick={() => updateColors('excel', '#cfe2ff')}
                                title="Blue"
                              >
                                <i className="bi bi-circle-fill text-primary"></i>
                              </button>
                            </div>
                            <h5 className="card-title text-center flex-grow-1">Excel Sheet</h5>
                            <div style={{ width: '70px' }}></div>
                          </div>
                          {loading.excelSheet ? (
                            <div className="text-center">
                              <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                            </div>
                          ) : error.excelSheet ? (
                            <div className="alert alert-danger">{error.excelSheet}</div>
                          ) : (
                            <>
                              <button
                                className="btn btn-primary mb-3"
                                onClick={addTable}
                                style={{ marginBottom: '20px' }}
                              >
                                Add New Table
                              </button>

                              {tables.map((table, tableIndex) => (
                                <div key={table.id} className="mb-4">
                                  <div className="d-flex justify-content-between align-items-center mb-3">
                                    <input
                                      type="text"
                                      value={table.name}
                                      onChange={(e) => handleTableNameChange(tableIndex, e.target.value)}
                                      className="form-control text-center"
                                      style={{
                                        border: 'none',
                                        backgroundColor: 'transparent',
                                        fontSize: '1.1rem',
                                        fontWeight: 'bold',
                                        width: 'auto'
                                      }}
                                    />
                                    <div>
                                      <button
                                        className="btn btn-warning btn-sm me-2"
                                        onClick={() => clearTableData(tableIndex)}
                                      >
                                        Clear All
                                      </button>
                                      <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => deleteTable(tableIndex)}
                                      >
                                        Delete Table
                                      </button>
                                    </div>
                                  </div>
                                  <div className="table-responsive mb-3">
                                    <table className="table table-bordered">
                                      <thead>
                                        <tr>
                                          <th style={{ width: '30px', backgroundColor: '#f8f9fa' }}></th>
                                          {Array(table.cols).fill().map((_, colIndex) => (
                                            <th key={colIndex} className="text-center" style={{
                                              backgroundColor: '#f8f9fa',
                                              padding: '2px',
                                              fontSize: '12px',
                                              width: '80px'  // Reduced from 120px
                                            }}>
                                              {getColumnLabel(colIndex)}
                                              <button
                                                className="btn text-danger btn-sm ms-1"  // Reduced margin
                                                onClick={() => deleteColumn(tableIndex, colIndex)}
                                                style={{ padding: '0px 2px', fontSize: '8px' }}  // Reduced padding and font
                                              >
                                                ×
                                              </button>
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {Array(table.rows).fill().map((_, rowIndex) => (
                                          <tr key={rowIndex}>
                                            <td className="text-center" style={{
                                              backgroundColor: '#f8f9fa',
                                              padding: '2px',
                                              fontSize: '12px'
                                            }}>
                                              {rowIndex + 1}
                                              <button
                                                className="btn text-danger btn-sm ms-1"
                                                onClick={() => deleteRow(tableIndex, rowIndex)}
                                                style={{ padding: '0px 2px', fontSize: '8px' }}
                                              >
                                                ×
                                              </button>
                                            </td>
                                            {Array(table.cols).fill().map((_, colIndex) => (
                                              <td key={colIndex} style={{
                                                padding: '0px',
                                                width: '80px',  // Reduced from 120px
                                                maxWidth: '80px'  // Added maxWidth
                                              }}>
                                                <textarea
                                                  value={table.data[rowIndex][colIndex]}
                                                  onChange={(e) => handleCellChange(tableIndex, rowIndex, colIndex, e.target.value)}
                                                  className="cell-input"
                                                  style={{
                                                    width: '100%',
                                                    padding: '1px 2px',  // Reduced padding
                                                    border: 'none',
                                                    background: 'transparent',
                                                    resize: 'none',
                                                    overflow: 'hidden',
                                                    minHeight: '22px',   // Reduced from 28px
                                                    maxHeight: '60px',   // Reduced from 80px
                                                    fontSize: '12px'     // Reduced from 14px
                                                  }}
                                                />
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  <div className="mb-4">
                                    <button
                                      className="btn btn-secondary me-2"
                                      onClick={() => addRow(tableIndex)}
                                    >
                                      Add Row
                                    </button>
                                    <button
                                      className="btn btn-secondary"
                                      onClick={() => addColumn(tableIndex)}
                                    >
                                      Add Column
                                    </button>
                                  </div>
                                  <hr className="my-4" />
                                </div>
                              ))}
                            </>
                          )}
                        </div>
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

      {/* PDF Viewer Modal */}
      {pdfUrl && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                {/* <h5 className="modal-title">PDF Viewer</h5> */}
                <button type="button" className="btn-close" onClick={() => setPdfUrl(null)}></button>
              </div>
              <div className="modal-body">
                <iframe src={pdfUrl} style={{ width: '100%', height: '500px' }} title="PDF Viewer"></iframe>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {selectedImage && !pdfUrl && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                {/* <h5 className="modal-title">Image Viewer</h5> */}
                <button type="button" className="btn-close" onClick={() => setSelectedImage(null)}></button>
              </div>
              <div className="modal-body">
                <img src={selectedImage} alt="Enlarged view" style={{ width: '100%', height: 'auto' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default EmployeeDashboard
