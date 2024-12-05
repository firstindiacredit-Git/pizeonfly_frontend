import React, { useState, useEffect, useCallback, useRef } from 'react'
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
import CustomColorPicker, { isLightColor } from './colorpicker/CustomColorPicker';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

// Add this debounce utility function near the top of the file
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};


// Add this new helper function near the top of the file
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

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
    },
    bankDetails: {
      accountNumber: "",
      ifscCode: "",
      accountType: "",
      upiId: "",
      paymentApp: "",
      qrCode: null
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
  const [editedTodoText, setEditedTodoText] = useState('');
  const [showTodoPicker, setShowTodoPicker] = useState(false);

  // Add these state variables at the top with other states
  const [notepadColor, setNotepadColor] = useState('');
  const [todoColor, setTodoColor] = useState('');
  const [excelSheetColor, setExcelSheetColor] = useState('');

  // Add these new state variables for NotePad
  const [showNotePadPicker, setShowNotePadPicker] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [isBold, setIsBold] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const notePadRef = useRef(null);

  // Add state for Excel color picker
  const [showExcelPicker, setShowExcelPicker] = useState(false);

  // Add new state for local notes
  const [localNotes, setLocalNotes] = useState('');

  // Add this new state for bank details
  const [bankDetails, setBankDetails] = useState(null);

  // Add these new state variables near the top of your component
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAction, setDeleteAction] = useState({ type: '', payload: null });

  // Add this useEffect to fetch bank details
  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("emp_user"));
        if (!user || !user.employeeId) return;

        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}api/employeeBankDetails/${user.employeeId}`
        );

        setBankDetails(response.data);
      } catch (error) {
        console.error('Error fetching bank details:', error);
      }
    };

    fetchBankDetails();
  }, []);

  // Create a debounced version of the API call
  const debouncedSaveNotes = useCallback(
    debounce(async (value) => {
      if (!currentEmployeeId) {
        console.error('No employee ID found');
        setError(prev => ({ ...prev, notePad: 'Employee ID not found' }));
        return;
      }

      try {
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
      } catch (error) {
        console.error('Error saving notepad:', error);
        setError(prev => ({ ...prev, notePad: 'Failed to save changes' }));
      }
    }, 1000), // 1 second delay
    [currentEmployeeId]
  );

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
        socialLinks: user.socialLinks || {},
        bankDetails: user.bankDetails || {}
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

      if (dashboardIds.excelSheet) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet/${dashboardIds.excelSheet}`,
          {
            tables: newTables,
            employeeId: currentEmployeeId
          }
        );
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet`,
          {
            tables: newTables,
            employeeId: currentEmployeeId
          }
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

      if (dashboardIds.excelSheet) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet/${dashboardIds.excelSheet}`,
          {
            tables: newTables,
            employeeId: currentEmployeeId
          }
        );
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet`,
          {
            tables: newTables,
            employeeId: currentEmployeeId
          }
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

      if (dashboardIds.excelSheet) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet/${dashboardIds.excelSheet}`,
          {
            tables: newTables,
            employeeId: currentEmployeeId
          }
        );
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet`,
          {
            tables: newTables,
            employeeId: currentEmployeeId
          }
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

      if (dashboardIds.excelSheet) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet/${dashboardIds.excelSheet}`,
          {
            tables: newTables,
            employeeId: currentEmployeeId
          }
        );
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet`,
          {
            tables: newTables,
            employeeId: currentEmployeeId
          }
        );
        setDashboardIds(prev => ({ ...prev, excelSheet: response.data._id }));
      }
    } catch (error) {
      console.error('Error adding table:', error);
      setError(prev => ({ ...prev, excelSheet: 'Failed to add table' }));
    }
  };

  // Add this new function for downloading Excel sheet
  const downloadExcelSheet = (tableIndex) => {
    try {
      const table = tables[tableIndex];
      let csvContent = "data:text/csv;charset=utf-8,";

      // Add column headers (A, B, C, etc.)
      csvContent += "," + Array(table.cols).fill().map((_, i) => getColumnLabel(i)).join(",") + "\n";

      // Add data rows with row numbers
      table.data.forEach((row, rowIndex) => {
        csvContent += (rowIndex + 1) + "," + row.join(",") + "\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${table.name.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading excel sheet:', error);
      setError(prev => ({ ...prev, excelSheet: 'Failed to download excel sheet' }));
    }
  };

  // Todo list functions
  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const newTodoItem = {
        text: newTodo,
        completed: false,
        createdAt: new Date().toISOString()
      };

      const updatedTodos = [...todos, newTodoItem];

      if (dashboardIds.todoList) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}api/employeeTodoList/${dashboardIds.todoList}`,
          {
            todos: updatedTodos,
            employeeId: currentEmployeeId
          }
        );
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}api/employeeTodoList`,
          {
            todos: updatedTodos,
            employeeId: currentEmployeeId
          }
        );
        setDashboardIds(prev => ({ ...prev, todoList: response.data._id }));
      }

      setTodos(updatedTodos);
      setNewTodo('');
    } catch (error) {
      console.error('Error saving todo:', error);
      setError(prev => ({ ...prev, todoList: 'Failed to save changes' }));
    }
  };

  const toggleTodo = async (index) => {
    try {
      const updatedTodos = [...todos];
      updatedTodos[index] = {
        ...updatedTodos[index],
        completed: !updatedTodos[index].completed
      };

      if (dashboardIds.todoList) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}api/employeeTodoList/${dashboardIds.todoList}`,
          {
            todos: updatedTodos,
            employeeId: currentEmployeeId
          }
        );
      }

      setTodos(updatedTodos);
    } catch (error) {
      console.error('Error updating todo:', error);
      setError(prev => ({ ...prev, todoList: 'Failed to update todo' }));
    }
  };

  const deleteTodo = async (index) => {
    try {
      const updatedTodos = todos.filter((_, i) => i !== index);

      if (dashboardIds.todoList) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}api/employeeTodoList/${dashboardIds.todoList}`,
          {
            todos: updatedTodos,
            employeeId: currentEmployeeId
          }
        );
      }

      setTodos(updatedTodos);
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

  // Update the handleNotesChange function
  const handleNotesChange = (value) => {
    setLocalNotes(value); // Update local state immediately
    setNotes(value); // Update the main state for rendering
    debouncedSaveNotes(value); // Debounced API call
  };

  // Initialize localNotes when notes are fetched
  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

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
      const token = localStorage.getItem('emp_token');

      if (dashboardIds.notePad) {
        // Use DELETE request instead of PUT
        await axios.delete(
          `${import.meta.env.VITE_BASE_URL}api/employeeNotePad/${dashboardIds.notePad}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Clear local states
        setLocalNotes('');
        setNotes('');
        // Reset the dashboard ID for notepad
        setDashboardIds(prev => ({ ...prev, notePad: null }));
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
  const startEditing = (index) => {
    setEditingTodo(index);
    setEditedTodoText(todos[index].text);
  };

  // Add function to save edited todo
  const handleEditTodo = async (index) => {
    if (!editedTodoText.trim()) return;

    try {
      const updatedTodos = [...todos];
      updatedTodos[index] = {
        ...updatedTodos[index],
        text: editedTodoText
      };

      if (dashboardIds.todoList) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}api/employeeTodoList/${dashboardIds.todoList}`,
          {
            todos: updatedTodos,
            employeeId: currentEmployeeId
          }
        );
      }

      setTodos(updatedTodos);
      setEditingTodo(null);
      setEditedTodoText('');
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

  // Add these new functions for NotePad
  const handleFontSizeChange = (newSize) => {
    if (newSize >= 8 && newSize <= 32) {
      setFontSize(newSize);
    }
  };

  const toggleBold = () => setIsBold(!isBold);
  const toggleUnderline = () => setIsUnderline(!isUnderline);

  const handleZoomIn = () => {
    if (zoomLevel < 200) {
      setZoomLevel(prev => prev + 10);
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 50) {
      setZoomLevel(prev => prev - 10);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (notePadRef.current.requestFullscreen) {
        notePadRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleSelectAll = () => {
    const textarea = notePadRef.current.querySelector('textarea');
    if (textarea) {
      textarea.select();
    }
  };

  const toggleSpeechToText = () => {
    if (!isListening) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          setNotes(prev => prev + ' ' + transcript);
        };

        recognition.start();
        setIsListening(true);
      }
    } else {
      // Stop listening
      const recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (recognition) {
        recognition.stop();
      }
      setIsListening(false);
    }
  };

  const speakText = () => {
    if (!isSpeaking) {
      const utterance = new SpeechSynthesisUtterance(notes);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);

      utterance.onend = () => {
        setIsSpeaking(false);
      };
    } else {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const downloadNotePad = () => {
    const element = document.createElement('a');
    const file = new Blob([notes], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'notepad.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Add useEffect for fullscreen change detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Add this function to handle keyboard navigation
  const handleCellKeyDown = (e, tableIndex, rowIndex, colIndex) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Move to next row
      if (rowIndex < tables[tableIndex].rows - 1) {
        const nextCell = document.querySelector(
          `[data-cell="${tableIndex}-${rowIndex + 1}-${colIndex}"]`
        );
        nextCell?.focus();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (rowIndex < tables[tableIndex].rows - 1) {
        const nextCell = document.querySelector(
          `[data-cell="${tableIndex}-${rowIndex + 1}-${colIndex}"]`
        );
        nextCell?.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (rowIndex > 0) {
        const nextCell = document.querySelector(
          `[data-cell="${tableIndex}-${rowIndex - 1}-${colIndex}"]`
        );
        nextCell?.focus();
      }
    } else if (e.key === 'ArrowRight') {
      if (e.target.selectionStart === e.target.value.length) {
        e.preventDefault();
        if (colIndex < tables[tableIndex].cols - 1) {
          const nextCell = document.querySelector(
            `[data-cell="${tableIndex}-${rowIndex}-${colIndex + 1}"]`
          );
          nextCell?.focus();
        }
      }
    } else if (e.key === 'ArrowLeft') {
      if (e.target.selectionStart === 0) {
        e.preventDefault();
        if (colIndex > 0) {
          const nextCell = document.querySelector(
            `[data-cell="${tableIndex}-${rowIndex}-${colIndex - 1}"]`
          );
          nextCell?.focus();
        }
      }
    }
  };

  // Add this new function to handle delete confirmations
  const handleDeleteAction = (type, payload = null) => {
    setDeleteAction({ type, payload });
    setShowDeleteModal(true);
  };

  // Add this function to handle confirmed deletions
  const handleConfirmDelete = async () => {
    try {
      switch (deleteAction.type) {
        case 'notepad':
          await clearNotePad();
          break;
        case 'todo':
          if (deleteAction.payload === 'all') {
            await clearAllTodos();
          } else {
            await deleteTodo(deleteAction.payload);
          }
          break;
        case 'excel-table':
          await deleteTable(deleteAction.payload);
          break;
        case 'excel-clear':
          await clearTableData(deleteAction.payload);
          break;
        case 'excel-row':
          const { tableIndex: rowTableIndex, rowIndex } = deleteAction.payload;
          await deleteRow(rowTableIndex, rowIndex);
          break;
        case 'excel-column':
          const { tableIndex: colTableIndex, colIndex } = deleteAction.payload;
          await deleteColumn(colTableIndex, colIndex);
          break;
      }
    } catch (error) {
      console.error('Error handling delete action:', error);
    }
    setShowDeleteModal(false);
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

                    <div className="profile-section p-3 bg-white rounded-4 shadow-sm mb-4">
                      <div className="row g-3 align-items-center">
                        {/* Profile Image & Details Column */}
                        <div className="col-md-4">
                          <div className="d-flex align-items-center">
                            <div className="profile-image-container me-3">
                              <img
                                className="avatar rounded-circle border border-2 border-primary p-1"
                                src={`${import.meta.env.VITE_BASE_URL}${image.replace('uploads/', '')}`}
                                alt="profile"
                                style={{
                                  transition: 'all 0.3s ease-in-out',
                                  cursor: 'pointer',
                                  width: '100px', // Reduced from 150px
                                  height: '100px', // Reduced from 150px
                                  objectFit: 'cover'
                                }}
                                // onMouseEnter={(e) => {
                                //   e.target.style.transform = 'scale(2.5)'; // Reduced from scale(3)
                                //   e.target.style.zIndex = '100';
                                //   e.target.style.borderRadius = '8px';
                                // }}
                                // onMouseLeave={(e) => {
                                //   e.target.style.transform = 'scale(1)';
                                //   e.target.style.zIndex = '1';
                                //   e.target.style.borderRadius = '50%';
                                // }}
                                onClick={() => handleImageClick(`${import.meta.env.VITE_BASE_URL}${image.replace('uploads/', '')}`)}
                              />
                            </div>
                            <div className="profile-details">
                              <h5 className="mb-1 fw-bold text-primary text-start">{employeeName}</h5>
                              <p className="text-muted mb-1 small text-start">
                                <i className="bi bi-envelope-fill me-2"></i>
                                {email}
                              </p>
                              <p className="text-muted mb-1 small text-start">
                                <i className="bi bi-telephone-fill me-2"></i>
                                {employeeData.phone}
                              </p>
                              <p className="text-muted mb-1 small text-start">
                                <i className="bi bi-calendar-date me-2"></i>
                                {new Date(employeeData.joiningDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button
                            className="btn btn-sm btn-outline-primary mt-2"
                            data-bs-toggle="modal"
                            data-bs-target="#bankDetailsModal"
                          // onClick={() => setSelectedEmployee(employee)}
                          >
                            <i className="bi bi-bank me-2"></i>
                            View Bank Details
                          </button>
                        </div>

                        {/* Documents and Social Links in a row */}
                        <div className="col-md-8">
                          <div className="row">
                            {/* Documents Column */}
                            <div className="col-md-6">
                              <div className="documents-section p-2 rounded-3">
                                <h6 className="mb-2 fw-bold">
                                  <i className="bi bi-file-earmark-text me-2 text-secondary"></i>
                                  Documents
                                </h6>
                                <div className="row g-2 mt-2">
                                  {/* Document cards with reduced size */}
                                  <div className="col-12">
                                    <div className="document-card p-2 border rounded-3 bg-white">
                                      <div className="d-flex align-items-center justify-content-between">
                                        <strong className="small">
                                          <i className="bi bi-card-text text-secondary me-1"></i>
                                          Aadhaar Card
                                        </strong>
                                        {aadhaarCard ? (
                                          <div className="d-flex gap-1">
                                            <button
                                              className="btn btn-sm btn-outline-primary py-0 px-1"
                                              onClick={(e) => handleFileClick(e, `${import.meta.env.VITE_BASE_URL}${aadhaarCard.replace('uploads/', '')}`, aadhaarCard.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image')}
                                            >
                                              <i className="bi bi-eye small"></i>
                                            </button>
                                            <button
                                              className="btn btn-sm btn-outline-success py-0 px-1"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                handleDownload(
                                                  `${import.meta.env.VITE_BASE_URL}${aadhaarCard.replace('uploads/', '')}`,
                                                  `aadhaar-card${aadhaarCard.substring(aadhaarCard.lastIndexOf('.'))}`
                                                );
                                              }}
                                            >
                                              <i className="bi bi-download small"></i>
                                            </button>
                                          </div>
                                        ) : (
                                          <span className="text-danger small">
                                            <i className="bi bi-x-circle"></i>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Similar compact structure for PAN and Resume */}
                                  <div className="col-12">
                                    <div className="document-card p-2 border rounded-3 bg-white">
                                      <div className="d-flex align-items-center justify-content-between">
                                        <strong className="small">
                                          <i className="bi bi-card-heading text-secondary me-1"></i>
                                          PAN Card
                                        </strong>
                                        {panCard ? (
                                          <div className="d-flex gap-1">
                                            <button
                                              className="btn btn-sm btn-outline-primary py-0 px-1"
                                              onClick={(e) => handleFileClick(e, `${import.meta.env.VITE_BASE_URL}${panCard.replace('uploads/', '')}`, panCard.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image')}
                                            >
                                              <i className="bi bi-eye small"></i>
                                            </button>
                                            <button
                                              className="btn btn-sm btn-outline-success py-0 px-1"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                handleDownload(
                                                  `${import.meta.env.VITE_BASE_URL}${panCard.replace('uploads/', '')}`,
                                                  `pan-card${panCard.substring(panCard.lastIndexOf('.'))}`
                                                );
                                              }}
                                            >
                                              <i className="bi bi-download small"></i>
                                            </button>
                                          </div>
                                        ) : (
                                          <span className="text-danger small">
                                            <i className="bi bi-x-circle"></i>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="col-12">
                                    <div className="document-card p-2 border rounded-3 bg-white">
                                      <div className="d-flex align-items-center justify-content-between">
                                        <strong className="small">
                                          <i className="bi bi-file-person text-secondary me-1"></i>
                                          Resume
                                        </strong>
                                        {resume ? (
                                          <div className="d-flex gap-1">
                                            <button
                                              className="btn btn-sm btn-outline-primary py-0 px-1"
                                              onClick={(e) => handleFileClick(e, `${import.meta.env.VITE_BASE_URL}${resume.replace('uploads/', '')}`, resume.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image')}
                                            >
                                              <i className="bi bi-eye small"></i>
                                            </button>
                                            <button
                                              className="btn btn-sm btn-outline-success py-0 px-1"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                handleDownload(
                                                  `${import.meta.env.VITE_BASE_URL}${resume.replace('uploads/', '')}`,
                                                  `resume${resume.substring(resume.lastIndexOf('.'))}`
                                                );
                                              }}
                                            >
                                              <i className="bi bi-download small"></i>
                                            </button>
                                          </div>
                                        ) : (
                                          <span className="text-danger small">
                                            <i className="bi bi-x-circle"></i>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Social Links Column */}
                            <div className="col-md-6">
                              <div className="social-links-section p-2">
                                <h6 className="mb-2 fw-bold">
                                  <i className="bi bi-share me-2 text-secondary"></i>
                                  Social Links
                                </h6>
                                <div className="row d-flex flex-wrap mt-3 gap-1">
                                  {employeeData?.socialLinks?.linkedin && (
                                    <div className="col-2">
                                      <a href={employeeData.socialLinks.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline-primary btn-sm">
                                        <i className="bi bi-linkedin"></i>
                                      </a>
                                    </div>
                                  )}
                                  {employeeData?.socialLinks?.github && (
                                    <div className='col-2'>
                                      <a href={employeeData.socialLinks.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline-dark btn-sm">
                                        <i className="bi bi-github"></i>
                                      </a>
                                    </div>
                                  )}
                                  {employeeData?.socialLinks?.instagram && (
                                    <div className='col-2'>
                                      <a href={employeeData.socialLinks.instagram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline-danger btn-sm">
                                        <i className="bi bi-instagram"></i>
                                      </a>
                                    </div>
                                  )}
                                  {employeeData?.socialLinks?.youtube && (
                                    <div className='col-2'>
                                      <a href={employeeData.socialLinks.youtube}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline-danger btn-sm">
                                        <i className="bi bi-youtube"></i>
                                      </a>
                                    </div>
                                  )}
                                  {employeeData?.socialLinks?.facebook && (
                                    <div className='col-2'>
                                      <a href={employeeData.socialLinks.facebook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline-primary btn-sm">
                                        <i className="bi bi-facebook"></i>
                                      </a>
                                    </div>
                                  )}
                                  {employeeData?.socialLinks?.website && (
                                    <div className='col-2'>
                                      <a href={employeeData.socialLinks.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline-info btn-sm">
                                        <i className="bi bi-globe"></i>
                                      </a>
                                    </div>
                                  )}
                                  {employeeData?.socialLinks?.other && (
                                    <div className='col-2'>
                                      <a href={employeeData.socialLinks.other}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline-secondary btn-sm">
                                        <i className="bi bi-link-45deg"></i>
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
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
                            {/* NotePad Heading */}
                            <h5 className="card-title m-0 mb-3" style={{ color: isLightColor(notepadColor) ? '#000' : '#fff' }}>
                              NotePad
                            </h5>

                            {loading.notePad ? (
                              <div className="text-center">
                                <div className="spinner-border text-primary" role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </div>
                              </div>
                            ) : error.notePad ? (
                              <div className="alert alert-danger">{error.notePad}</div>
                            ) : (
                              <div className="notepad-container" ref={notePadRef} style={{ position: 'relative', overflow: 'hidden' }}>
                                <div
                                  className="line-numbers"
                                  style={{
                                    position: 'absolute',
                                    left: '5px',
                                    top: '10px',
                                    color: '#666',
                                    fontFamily: 'monospace',
                                    fontSize: '14px',
                                    lineHeight: '32px',
                                    textAlign: 'right',
                                    paddingRight: '5px',
                                    userSelect: 'none',
                                    pointerEvents: 'none',
                                    height: '315px',
                                    overflowY: 'hidden',
                                    transform: `scale(${zoomLevel / 100})`,
                                    transformOrigin: 'left top'
                                  }}
                                >
                                  {notes.split('\n').map((_, i) => (
                                    <div key={i} style={{ height: '32px' }}>{i + 1}</div>
                                  ))}
                                </div>
                                <textarea
                                  value={localNotes}
                                  onChange={(e) => handleNotesChange(e.target.value)}
                                  className="form-control hindi-paper"
                                  style={{
                                    height: '345px',
                                    marginBottom: '20px',
                                    resize: 'none',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #6c757d',
                                    padding: '10px 10px 10px 40px',
                                    fontSize: `${fontSize * (zoomLevel / 100)}px`,
                                    lineHeight: '32px',
                                    fontFamily: 'Arial, sans-serif',
                                    position: 'relative',
                                    backgroundAttachment: 'local',
                                    width: '100%',
                                    transform: `scale(${zoomLevel / 100})`,
                                    transformOrigin: 'left top',
                                    fontWeight: isBold ? 'bold' : 'normal',
                                    textDecoration: isUnderline ? 'underline' : 'none',
                                    color: isLightColor(notepadColor) ? '#000' : '#fff'  // Add this line
                                  }}
                                  onScroll={(e) => {
                                    const lineNumbers = document.querySelector('.line-numbers');
                                    if (lineNumbers) {
                                      lineNumbers.scrollTop = e.target.scrollTop;
                                    }
                                  }}
                                  placeholder="Start typing your notes here..."
                                />
                              </div>
                            )}

                            <div className="d-flex justify-content-between align-items-center">
                              {/* Color Picker */}
                              <div className="position-relative">
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => setShowNotePadPicker(!showNotePadPicker)}
                                  title="Change background color"
                                >
                                  <i className="bi bi-palette-fill"></i>
                                </button>
                                {showNotePadPicker && (
                                  <CustomColorPicker
                                    color={notepadColor}
                                    onChange={(color) => updateColors('notepad', color)}
                                    onClose={() => setShowNotePadPicker(false)}
                                  />
                                )}
                              </div>
                              <div className="d-flex gap-2">
                                {/* Text Formatting Controls */}
                                <div className="btn-group">
                                  <button
                                    className={`btn btn-sm ${isBold ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={toggleBold}
                                    title="Toggle Bold"
                                  >
                                    <i className="bi bi-type-bold"></i>
                                  </button>
                                  <button
                                    className={`btn btn-sm ${isUnderline ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={toggleUnderline}
                                    title="Toggle Underline"
                                  >
                                    <i className="bi bi-type-underline"></i>
                                  </button>
                                </div>

                                {/* Font Size Controls */}
                                <div className="btn-group">
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => handleFontSizeChange(fontSize - 1)}
                                    title="Decrease font size"
                                    disabled={fontSize <= 8}
                                  >
                                    <i className="bi bi-dash"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
                                    style={{ minWidth: '40px' }}
                                    title="Font size"
                                    disabled
                                  >
                                    {fontSize}
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => handleFontSizeChange(fontSize + 1)}
                                    title="Increase font size"
                                    disabled={fontSize >= 32}
                                  >
                                    <i className="bi bi-plus"></i>
                                  </button>
                                </div>



                                {/* Speech Controls */}
                                <button
                                  className={`btn ${isListening ? 'btn-danger' : 'btn-primary'} btn-sm`}
                                  onClick={toggleSpeechToText}
                                  title={isListening ? 'Stop recording' : 'Start speech to text'}
                                >
                                  <i className={`bi ${isListening ? 'bi-mic-fill' : 'bi-mic'}`}></i>
                                </button>

                                <button
                                  className={`btn ${isSpeaking ? 'btn-danger' : 'btn-primary'} btn-sm`}
                                  onClick={speakText}
                                  title={isSpeaking ? 'Stop speaking' : 'Read text aloud'}
                                >
                                  <i className={`bi ${isSpeaking ? 'bi-volume-up-fill' : 'bi-volume-up'}`}></i>
                                </button>

                                {/* Zoom Controls */}
                                <button
                                  className="btn btn-info btn-sm"
                                  onClick={handleZoomIn}
                                  title="Zoom in"
                                  disabled={zoomLevel >= 200}
                                >
                                  <i className="bi bi-zoom-in"></i>
                                </button>

                                <button
                                  className="btn btn-info btn-sm"
                                  onClick={handleZoomOut}
                                  title="Zoom out"
                                  disabled={zoomLevel <= 50}
                                >
                                  <i className="bi bi-zoom-out"></i>
                                </button>

                                {/* Fullscreen and Select All */}
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={toggleFullscreen}
                                  title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                                >
                                  <i className={`bi bi-${isFullscreen ? 'fullscreen-exit' : 'fullscreen'}`}></i>
                                </button>

                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={handleSelectAll}
                                  title="Select all text"
                                >
                                  <i className="bi bi-check-all"></i>
                                </button>
                              </div>

                              {/* Existing Clear and Download buttons */}
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-warning btn-sm"
                                  onClick={() => handleDeleteAction('notepad')}
                                  title="Clear notepad"
                                >
                                  <i className="bi bi-eraser-fill"></i>
                                </button>
                                <button
                                  className="btn btn-dark btn-sm"
                                  onClick={downloadNotePad}
                                  title="Download notepad"
                                >
                                  <i className="bi bi-download"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>


                      {/* Todo List */}
                      <div className="col-12 col-md-4 mb-4">
                        <div className="card shadow-lg">
                          <div className="card-body" style={{ backgroundColor: todoColor }}>
                            {/* Todo List Heading */}
                            <h5 className="card-title m-0 mb-3" style={{ color: isLightColor(todoColor) ? '#000' : '#fff' }}>
                              Todo List
                            </h5>

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
                                <form onSubmit={addTodo} className="mb-3">
                                  <div className="input-group">
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={newTodo}
                                      onChange={(e) => setNewTodo(e.target.value)}
                                      placeholder="Add new task..."
                                    />
                                    <button type="submit" className="btn btn-primary">Add</button>
                                  </div>
                                </form>
                                <DragDropContext onDragEnd={handleDragEnd} >
                                  <Droppable droppableId="todos" >
                                    {(provided) => (
                                      <ul
                                        className="list-group"
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        style={{
                                          height: '310px',
                                          overflowY: 'auto',
                                          msOverflowStyle: 'none',
                                          scrollbarWidth: 'none',
                                          '&::-webkit-scrollbar': {
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
                                            {(provided) => (
                                              <li
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className="list-group-item"
                                                style={{
                                                  backgroundColor: todoColor,
                                                  color: isLightColor(todoColor) ? '#000' : '#fff'  // Add this line
                                                }}
                                              >
                                                <div className="d-flex justify-content-between align-items-center" style={{ backgroundColor: todoColor }}>
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
                                                          value={editedTodoText}
                                                          onChange={(e) => setEditedTodoText(e.target.value)}
                                                          onKeyPress={(e) => {
                                                            if (e.key === 'Enter') {
                                                              handleEditTodo(index);
                                                            }
                                                          }}
                                                          autoFocus
                                                        />
                                                        <button
                                                          className="btn btn-sm btn-success me-2"
                                                          onClick={() => handleEditTodo(index)}
                                                        >
                                                          Save
                                                        </button>
                                                        <button
                                                          className="btn btn-sm btn-secondary"
                                                          onClick={() => setEditingTodo(null)}
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
                                                          onClick={() => startEditing(index)}
                                                        >
                                                          {todo.text}
                                                        </span>
                                                        <Checkbox
                                                          checked={todo.completed || false}
                                                          onChange={() => toggleTodo(index)}
                                                          style={{ height: '10px', width: '10px' }}
                                                        />
                                                        <IconButton
                                                          onClick={() => handleDeleteAction('todo', index)}
                                                          size="small"
                                                          style={{ marginLeft: '8px' }}
                                                        >
                                                          <DeleteIcon style={{ height: '20px', width: '20px' }} />
                                                        </IconButton>
                                                      </>
                                                    )}
                                                  </div>
                                                </div>
                                                <span className='text-muted' style={{ fontSize: '0.7rem', marginRight: '10px' }}>
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
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="position-relative">
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => setShowTodoPicker(!showTodoPicker)}
                                >
                                  <i className="bi bi-palette-fill" title='Color'></i>
                                </button>
                                {showTodoPicker && (
                                  <CustomColorPicker
                                    color={todoColor}
                                    onChange={(color) => updateColors('todo', color)}
                                    onClose={() => setShowTodoPicker(false)}
                                  />
                                )}
                              </div>

                              <div>
                                {todos.length > 0 && (
                                  <button
                                    className="btn btn-warning btn-sm"
                                    onClick={() => handleDeleteAction('todo', 'all')}
                                  >
                                    <i className="bi bi-eraser-fill" title='Clear all'></i>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>


                      {/* Excel Sheet */}
                      <div className="card shadow-lg mb-5" style={{ backgroundColor: excelSheetColor }}>
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            {/* Excel Sheet Heading */}
                            <h5 className="card-title text-center flex-grow-1" style={{ color: isLightColor(excelSheetColor) ? '#000' : '#fff' }}>
                              Excel Sheet
                            </h5>
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
                              {tables.length === 0 ? (
                                <div className="text-center">
                                  <p className="text-muted mb-3">No excel sheets available</p>
                                  <button
                                    className="btn btn-primary"
                                    onClick={addTable}
                                    title='Add New Excel Sheet'
                                  >
                                    <i className="icofont-plus me-1" />
                                    <span>Add Excel Sheet</span>
                                  </button>
                                </div>
                              ) : (
                                <>
                                  {tables.map((table, tableIndex) => (
                                    <div key={table.id} className="mt-3">
                                      <div className="d-flex justify-content-center align-items-center mb-3">
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
                                            width: 'auto',
                                            color: isLightColor(excelSheetColor) ? '#000' : '#fff'
                                          }}
                                        />

                                      </div>
                                      <div className="table-responsive mb-3" style={{
                                        maxHeight: table.rows > 10 ? '400px' : 'auto',
                                        overflowY: table.rows > 10 ? 'auto' : 'visible',
                                        overflowX: 'auto',
                                        msOverflowStyle: 'none',  // Hide scrollbar in IE/Edge
                                        scrollbarWidth: 'none',   // Hide scrollbar in Firefox
                                        '&::-webkit-scrollbar': { // Hide scrollbar in Chrome/Safari/Newer Edge
                                          display: 'none'
                                        }
                                      }}>
                                        <table className="table table-bordered" style={{
                                          minWidth: '100%',
                                          width: 'max-content'
                                        }}>
                                          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                                            <tr >
                                              <th style={{ width: '30px', backgroundColor: '#f8f9fa' }}></th>
                                              {Array(table.cols).fill().map((_, colIndex) => (
                                                <th key={colIndex} className="text-center" style={{
                                                  backgroundColor: '#f8f9fa',
                                                  padding: '2px',
                                                  fontSize: '12px',
                                                  width: '80px',
                                                  color: isLightColor(excelSheetColor) ? '#000' : '#fff'  // Add this line
                                                }}>
                                                  {getColumnLabel(colIndex)}
                                                  <button
                                                    className="btn text-danger btn-sm ms-1"
                                                    onClick={() => handleDeleteAction('excel-column', { tableIndex, colIndex })}
                                                    style={{ padding: '0px 2px', fontSize: '10px' }}
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
                                                    onClick={() => handleDeleteAction('excel-row', { tableIndex, rowIndex })}
                                                    style={{ padding: '0px 2px', fontSize: '10px' }}
                                                  >
                                                    ×
                                                  </button>
                                                </td>
                                                {Array(table.cols).fill().map((_, colIndex) => (
                                                  <td key={colIndex} style={{
                                                    padding: '0px',
                                                    width: '80px',
                                                    maxWidth: '80px'
                                                  }}>
                                                    <div className="d-flex align-items-center" style={{ position: 'relative' }}>
                                                      <textarea
                                                        data-cell={`${tableIndex}-${rowIndex}-${colIndex}`}
                                                        value={table.data[rowIndex][colIndex]}
                                                        onChange={(e) => handleCellChange(tableIndex, rowIndex, colIndex, e.target.value)}
                                                        onKeyDown={(e) => handleCellKeyDown(e, tableIndex, rowIndex, colIndex)}
                                                        className="cell-input"
                                                        style={{
                                                          width: '100%',
                                                          padding: '1px 2px',
                                                          border: 'none',
                                                          background: 'transparent',
                                                          resize: 'none',
                                                          overflow: 'hidden',
                                                          minHeight: '22px',
                                                          maxHeight: '60px',
                                                          fontSize: '12px',
                                                          color: isValidUrl(table.data[rowIndex][colIndex]) ? '#0d6efd' : (isLightColor(excelSheetColor) ? '#000' : '#fff'),
                                                          textDecoration: isValidUrl(table.data[rowIndex][colIndex]) ? 'underline' : 'none'
                                                        }}
                                                      />
                                                      {isValidUrl(table.data[rowIndex][colIndex]) && (
                                                        <a
                                                          href={table.data[rowIndex][colIndex]}
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          onClick={(e) => e.stopPropagation()}
                                                          style={{
                                                            position: 'absolute',
                                                            right: '2px',
                                                            top: '50%',
                                                            color: '#0d6efd',
                                                            fontSize: '12px'
                                                          }}
                                                        >
                                                          <i className="bi bi-box-arrow-up-right"></i>
                                                        </a>
                                                      )}
                                                    </div>
                                                  </td>
                                                ))}
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                      <div className="mb-4 d-flex justify-content-center">
                                        <div className="position-relative">
                                          <button
                                            className="btn btn-secondary me-2"
                                            onClick={() => setShowExcelPicker(!showExcelPicker)}
                                            title='Color The Sheet'
                                          >
                                            <i className="bi bi-palette-fill"></i>
                                            <span className="ms-1">Color</span>
                                          </button>
                                          {showExcelPicker && (
                                            <CustomColorPicker
                                              color={excelSheetColor}
                                              onChange={(color) => updateColors('excel', color)}
                                              onClose={() => setShowExcelPicker(false)}
                                            />
                                          )}
                                        </div>

                                        <button
                                          className="btn btn-warning me-2"
                                          onClick={() => handleDeleteAction('excel-clear', tableIndex)}
                                          title='Clear All Table Value'
                                        >
                                          <i className="icofont-eraser me-1" />
                                          <span className="">Table</span>
                                        </button>
                                        {tables.length > 1 && (
                                          <button
                                            className="btn btn-danger me-2"
                                            onClick={() => handleDeleteAction('excel-table', tableIndex)}
                                          >
                                            <i className="icofont-trash me-1 text-white" />
                                            <span className="text-white">Table</span>
                                          </button>
                                        )}

                                        <button
                                          className="btn btn-primary me-2"
                                          onClick={addTable}
                                          title='Add New Table'
                                        >
                                          <i className="icofont-plus me-1" />
                                          <span className="">Table</span>
                                        </button>
                                        <button
                                          className="btn btn-secondary me-2"
                                          onClick={() => addRow(tableIndex)}
                                          title='Add New Row In Table'
                                        >
                                          <i className="icofont-plus me-1" />
                                          <span className="">Row</span>
                                        </button>
                                        <button
                                          className="btn btn-secondary me-2"
                                          onClick={() => addColumn(tableIndex)}
                                          title='Add New Column In Table'
                                        >
                                          <i className="icofont-plus me-1" />
                                          <span className="">Column</span>
                                        </button>
                                        <button
                                          className="btn btn-dark btn-sm"
                                          onClick={() => downloadExcelSheet(tableIndex)}
                                          title='Download The Excel Sheet'
                                        >
                                          <i className="bi bi-download"></i>
                                          <span className="ms-1">Excel</span>
                                        </button>
                                      </div>
                                      <hr className="my-4" />
                                    </div>
                                  ))}
                                </>
                              )}
                            </>
                          )}
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


      {/* Bank Details Modal */}
      <div
        className="modal fade"
        id="bankDetailsModal"
        tabIndex={-1}
        aria-hidden="true"
        style={{ zIndex: 9998 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">
                {employeeName}'s Bank Details
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="bank-info-item p-3 border rounded h-100">
                    <i className="bi bi-bank fs-4 text-primary me-2"></i>
                    <div className="flex-grow-1">
                      <div className="fw-bold">Bank Name</div>
                      <div className="d-flex align-items-center">
                        <span className="me-2">{employeeData.bankDetails?.bankName || 'Not provided'}</span>
                        {employeeData.bankDetails?.bankName && (
                          <i
                            className="bi bi-clipboard cursor-pointer"
                            onClick={() => {
                              navigator.clipboard.writeText(employeeData.bankDetails?.bankName || '');
                            }}
                            title="Copy Bank Name"
                          ></i>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="bank-info-item p-3 border rounded h-100">
                    <i className="bi bi-person fs-4 text-success me-2"></i>
                    <div className="flex-grow-1">
                      <div className="fw-bold">Account Holder</div>
                      <div className="d-flex align-items-center">
                        <span className="me-2">{employeeData.bankDetails?.accountHolderName || 'Not provided'}</span>
                        {employeeData.bankDetails?.accountHolderName && (
                          <i
                            className="bi bi-clipboard cursor-pointer"
                            onClick={() => {
                              navigator.clipboard.writeText(employeeData.bankDetails?.accountHolderName || '');
                            }}
                            title="Copy Account Holder Name"
                          ></i>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="bank-info-item p-3 border rounded h-100">
                    <i className="bi bi-credit-card fs-4 text-info me-2"></i>
                    <div className="flex-grow-1">
                      <div className="fw-bold">Account Number</div>
                      <div className="d-flex align-items-center">
                        <span className="me-2">{employeeData.bankDetails?.accountNumber || 'Not provided'}</span>
                        {employeeData.bankDetails?.accountNumber && (
                          <i
                            className="bi bi-clipboard cursor-pointer"
                            onClick={() => {
                              navigator.clipboard.writeText(employeeData.bankDetails?.accountNumber || '');
                              // toast.success('Account Number copied!');
                            }}
                            title="Copy Account Number"
                          ></i>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="bank-info-item p-3 border rounded h-100">
                    <i className="bi bi-building fs-4 text-warning me-2"></i>
                    <div className="flex-grow-1">
                      <div className="fw-bold">IFSC Code</div>
                      <div className="d-flex align-items-center">
                        <span className="me-2">{employeeData.bankDetails?.ifscCode || 'Not provided'}</span>
                        {employeeData.bankDetails?.ifscCode && (
                          <i
                            className="bi bi-clipboard cursor-pointer"
                            onClick={() => {
                              navigator.clipboard.writeText(employeeData.bankDetails?.ifscCode || '');
                              // toast.success('IFSC Code copied!');
                            }}
                            title="Copy IFSC Code"
                          ></i>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="bank-info-item p-3 border rounded h-100">
                    <i className="bi bi-wallet2 fs-4 text-danger me-2"></i>
                    <div className="flex-grow-1">
                      <div className="fw-bold">Account Type</div>
                      <div className="d-flex align-items-center">
                        <span className="me-2">{employeeData.bankDetails?.accountType || 'Not provided'}</span>
                        {employeeData.bankDetails?.accountType && (
                          <i
                            className="bi bi-clipboard cursor-pointer"
                            onClick={() => {
                              navigator.clipboard.writeText(employeeData.bankDetails?.accountType || '');
                              // toast.success('Account Type copied!');
                            }}
                            title="Copy Account Type"
                          ></i>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="bank-info-item p-3 border rounded h-100">
                    <i className="bi bi-phone fs-4 text-success me-2"></i>
                    <div className="flex-grow-1">
                      <div className="fw-bold">UPI ID</div>
                      <div className="d-flex align-items-center">
                        <span className="me-2">{employeeData.bankDetails?.upiId || 'Not provided'}</span>
                        {employeeData.bankDetails?.upiId && (
                          <i
                            className="bi bi-clipboard cursor-pointer"
                            onClick={() => {
                              navigator.clipboard.writeText(employeeData.bankDetails?.upiId || '');
                              // toast.success('UPI ID copied!');
                            }}
                            title="Copy UPI ID"
                          ></i>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="bank-info-item p-3 border rounded h-100">
                    <i className="bi bi-app fs-4 text-primary me-2"></i>
                    <div className="flex-grow-1">
                      <div className="fw-bold">Payment App</div>
                      <div className="d-flex align-items-center">
                        <span className="me-2">{employeeData.bankDetails?.paymentApp || 'Not provided'}</span>
                        {employeeData.bankDetails?.paymentApp && (
                          <i
                            className="bi bi-clipboard cursor-pointer"
                            onClick={() => {
                              navigator.clipboard.writeText(employeeData.bankDetails?.paymentApp || '');
                              // toast.success('Payment App copied!');
                            }}
                            title="Copy Payment App"
                          ></i>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="bank-info-item p-3 border rounded h-100">
                    <i className="bi bi-qr-code fs-4 text-dark me-2"></i>
                    <div>
                      <div className="fw-bold">QR Code</div>
                      <div className="d-flex align-items-center gap-2 mt-2">
                        <img
                          src={`${import.meta.env.VITE_BASE_URL}${employeeData.bankDetails.qrCode}`}
                          alt="QR Code"
                          style={{ width: '100px', height: '100px', objectFit: 'contain', cursor: 'pointer' }}
                          onClick={(e) => handleFileClick(
                            e,
                            `${import.meta.env.VITE_BASE_URL}${employeeData.bankDetails.qrCode}`,
                            'image'
                          )}
                        />
                        <i
                          className="bi bi-download fs-4 text-primary"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleDownload(
                            `${import.meta.env.VITE_BASE_URL}${employeeData.bankDetails.qrCode}`,
                            `qr_code${bankDetails.qrCode.substring(bankDetails.qrCode.lastIndexOf('.'))}`
                          )}
                          title="Download QR Code"
                        ></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add this CSS to hide scrollbars globally for these elements */}
      <style>
        {`
                    .table-responsive::-webkit-scrollbar,
                    .list-group::-webkit-scrollbar {
                        display: none;
                    }
                    .table-responsive,
                    .list-group {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}
      </style>

      {/* Add this CSS style block at the bottom of your component, just before the closing tag */}
      <style>
        {`
                    .hindi-paper {
                        background-image: 
                            linear-gradient(${isLightColor(notepadColor) ? '#adb5bd' : '#ffffff33'} 1px, transparent 1px),
                            linear-gradient(90deg, transparent 0px, transparent 1px, transparent 1px);
                        background-size: 100% 32px;
                        background-position-y: -1px;
                        line-height: 32px;
                        padding: 0 10px;
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }

                    .line-numbers {
                        color: ${isLightColor(notepadColor) ? '#666' : '#ccc'};
                    }
                `}
      </style>

      <style>
        {`
          .cell-link:hover {
            text-decoration: underline !important;
            background-color: rgba(13, 110, 253, 0.1);
          }
          
          .cell-link:active {
            color: #0a58ca;
          }
        `}
      </style>

      {/* Delete Confirmation Modal */}
      <div
        className={`modal fade ${showDeleteModal ? 'show' : ''}`}
        id="deleteConfirmationModal"
        tabIndex={-1}
        aria-hidden="true"
        style={{ display: showDeleteModal ? 'block' : 'none' }}
      >
        <div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">Delete Confirmation</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowDeleteModal(false)}
              />
            </div>
            <div className="modal-body justify-content-center flex-column d-flex">
              <i className="icofont-ui-delete text-danger display-2 text-center mt-2" />
              <p className="mt-4 fs-5 text-center">
                {deleteAction.type === 'notepad' && 'Are you sure you want to clear the notepad?'}
                {deleteAction.type === 'todo' && deleteAction.payload === 'all'
                  ? 'Are you sure you want to clear all todos?'
                  : deleteAction.type === 'todo'
                    ? 'Are you sure you want to delete this todo item?'
                    : ''}
                {deleteAction.type === 'excel-table' && 'Are you sure you want to delete this table?'}
                {deleteAction.type === 'excel-clear' && 'Are you sure you want to clear all data from this table?'}
                {deleteAction.type === 'excel-row' && `Are you sure you want to delete row ${deleteAction.payload.rowIndex + 1}?`}
                {deleteAction.type === 'excel-column' && `Are you sure you want to delete column ${getColumnLabel(deleteAction.payload.colIndex)}?`}
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger color-fff"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal backdrop */}
      {showDeleteModal && (
        <div
          className="modal-backdrop fade show"
          onClick={() => setShowDeleteModal(false)}
        ></div>
      )}
    </>
  )
}

export default EmployeeDashboard
