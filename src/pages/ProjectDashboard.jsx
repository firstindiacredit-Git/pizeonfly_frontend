import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from "react-router-dom";
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import Chat from "../Chats/Chat";
import FloatingMenu from '../Chats/FloatingMenu';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Checkbox, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomColorPicker, { isLightColor } from "./colorpicker/CustomColorPicker";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ProjectDashboard = () => {
  const { isDarkMode } = useTheme();
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [projectStatusCounts, setProjectStatusCounts] = useState({ completed: 0, inProgress: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [notes, setNotes] = useState('');
  const [notepadId, setNotepadId] = useState(null);
  const [notepadColor, setNotepadColor] = useState('#fff3cd');
  const [loading, setLoading] = useState({ notePad: false });
  const [error, setError] = useState({ notePad: null });
  const [showNotePadPicker, setShowNotePadPicker] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [todoId, setTodoId] = useState(null);
  const [todoColor, setTodoColor] = useState('#cfe2ff');
  const [showTodoPicker, setShowTodoPicker] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [editedTodoText, setEditedTodoText] = useState('');
  const [tables, setTables] = useState([]);
  const [excelSheetId, setExcelSheetId] = useState(null);
  const [excelSheetColor, setExcelSheetColor] = useState('#d4edda');
  const [showExcelPicker, setShowExcelPicker] = useState(false);
  const [deleteAction, setDeleteAction] = useState({ type: '', index: null });
  const [holidays, setHolidays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(null);
  const [decisionMade, setDecisionMade] = useState(false);

  const notePadRef = useRef(null);
  const colorPickerRef = useRef(null);

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

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const email = userData.email;
        console.log("Email:", email);

        const response = await fetch(`${import.meta.env.VITE_BASE_URL}api/adminNotePad/${email}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.notes !== undefined) {
          setNotes(data.notes);
        }
        if (data._id) {
          setNotepadId(data._id);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
        toast.error("Failed to fetch notes");
      }
    };

    fetchNotes();
  }, []);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const email = userData.email;

        const response = await fetch(`${import.meta.env.VITE_BASE_URL}api/adminTodoList/${email}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.todos) {
          setTodos(data.todos);
        }
        if (data._id) {
          setTodoId(data._id);
        }
      } catch (error) {
        console.error("Error fetching todos:", error);
        toast.error("Failed to fetch todos");
      }
    };

    fetchTodos();
  }, []);

  useEffect(() => {
    const fetchExcelSheet = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const email = userData.email;

        const response = await fetch(`${import.meta.env.VITE_BASE_URL}api/adminExcelSheet/${email}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.tables) {
          setTables(data.tables);
        }
        if (data._id) {
          setExcelSheetId(data._id);
        }
      } catch (error) {
        console.error("Error fetching excel sheet:", error);
        toast.error("Failed to fetch excel sheet");
      }
    };

    fetchExcelSheet();
  }, []);

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const email = userData.email;

        const response = await fetch(`${import.meta.env.VITE_BASE_URL}api/adminColors/${email}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        setNotepadColor(data.notepadColor || '#fff3cd');
        setTodoColor(data.todoColor || '#fff3cd');
        setExcelSheetColor(data.excelSheetColor || '#d4edda');
      } catch (error) {
        console.error("Error fetching colors:", error);
        toast.error("Failed to fetch colors");
      }
    };

    fetchColors();
  }, []);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/holidays`);
        setHolidays(response.data.response.holidays);
      } catch (error) {
        toast.error("Error fetching holidays");
      }
    };
    fetchHolidays();

    const existingDecisionDate = localStorage.getItem("decisionDate");
    const today = new Date().toISOString().split('T')[0];

    if (existingDecisionDate === today) {
      setDecisionMade(true);
    } else {
      setDecisionMade(false);
    }
  }, []);

  const handleNotesChange = async (e) => {
    const newNotes = e.target.value;
    setNotes(newNotes);

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const email = userData.email;

      const url = notepadId
        ? `${import.meta.env.VITE_BASE_URL}api/adminNotePad/${notepadId}`
        : `${import.meta.env.VITE_BASE_URL}api/adminNotePad`;

      const method = notepadId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: newNotes, email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data._id) {
        setNotepadId(data._id);
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save notes");
    }
  };

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



  const toggleBold = () => setIsBold(!isBold);
  const toggleUnderline = () => setIsUnderline(!isUnderline);

  const handleFontSizeChange = (newSize) => {
    if (newSize >= 8 && newSize <= 32) {
      setFontSize(newSize);
    }
  };

  const handleZoomIn = () => setZoomLevel(Math.min(zoomLevel + 10, 200));
  const handleZoomOut = () => setZoomLevel(Math.max(zoomLevel - 10, 50));

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      notePadRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSelectAll = () => {
    const textarea = notePadRef.current.querySelector('textarea');
    textarea.select();
  };

  const clearNotePad = () => {
    setDeleteAction({ type: 'notepad' });
    $('#deleteproject').modal('show');
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

  const toggleSpeechToText = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      if (!isListening) {
        recognition.start();
        setIsListening(true);

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');

          setNotes(prev => prev + ' ' + transcript);
          handleNotesChange({ target: { value: notes + ' ' + transcript } });
        };

        recognition.onerror = (event) => {
          console.error(event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };
      } else {
        recognition.stop();
        setIsListening(false);
      }
    } else {
      alert('Speech recognition is not supported in your browser.');
    }
  };

  const speakText = () => {
    if (!isSpeaking) {
      const utterance = new SpeechSynthesisUtterance(notes);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    } else {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };


  const updateColors = async (type, color) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const email = userData.email;

      if (type === 'notepad') {
        setNotepadColor(color);
      } else if (type === 'todo') {
        setTodoColor(color);
      } else if (type === 'excel') {
        setExcelSheetColor(color);
      }

      await fetch(`${import.meta.env.VITE_BASE_URL}api/adminColors/${email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notepadColor: type === 'notepad' ? color : notepadColor,
          todoColor: type === 'todo' ? color : todoColor,
          excelSheetColor: type === 'excel' ? color : excelSheetColor
        }),
      });
    } catch (error) {
      console.error('Error updating colors:', error);
      toast.error('Failed to update colors');
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const startEditing = (index, text) => {
    setEditingTodo(index);
    setEditedTodoText(text);
  };

  const handleEditTodo = async (index) => {
    if (!editedTodoText.trim()) return;

    const updatedTodos = [...todos];
    updatedTodos[index] = {
      ...updatedTodos[index],
      text: editedTodoText
    };
    setTodos(updatedTodos);
    setEditingTodo(null);

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const email = userData.email;

      await fetch(`${import.meta.env.VITE_BASE_URL}api/adminTodoList/${todoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ todos: updatedTodos, email }),
      });
    } catch (error) {
      console.error("Error updating todo:", error);
      toast.error("Failed to update todo");
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTodos(items);
  };

  const clearAllTodos = () => {
    setDeleteAction({ type: 'todos' });
    $('#deleteproject').modal('show');
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const newTodoItem = {
      id: Date.now(),
      text: newTodo,
      completed: false,
      createdAt: new Date().toISOString()
    };

    const updatedTodos = [...todos, newTodoItem];
    setTodos(updatedTodos);
    setNewTodo('');

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const email = userData.email;

      const url = todoId
        ? `${import.meta.env.VITE_BASE_URL}api/adminTodoList/${todoId}`
        : `${import.meta.env.VITE_BASE_URL}api/adminTodoList`;

      const method = todoId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ todos: updatedTodos, email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data._id) {
        setTodoId(data._id);
      }
    } catch (error) {
      console.error("Error saving todo:", error);
      toast.error("Failed to save todo");
    }
  };

  const deleteTodo = (index) => {
    setDeleteAction({ type: 'todo', index });
    $('#deleteproject').modal('show');
  };

  const toggleTodo = async (index) => {
    const updatedTodos = todos.map((todo, i) => {
      if (i === index) {
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });
    setTodos(updatedTodos);

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const email = userData.email;

      await fetch(`${import.meta.env.VITE_BASE_URL}api/adminTodoList/${todoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ todos: updatedTodos, email }),
      });
    } catch (error) {
      console.error("Error updating todo:", error);
      toast.error("Failed to update todo");
    }
  };

  const handleCellChange = async (tableIndex, rowIndex, colIndex, value) => {
    try {
      const newTables = [...tables];
      newTables[tableIndex].data[rowIndex][colIndex] = value;
      setTables(newTables);

      const userData = JSON.parse(localStorage.getItem('user'));
      const email = userData.email;

      const url = excelSheetId
        ? `${import.meta.env.VITE_BASE_URL}api/adminExcelSheet/${excelSheetId}`
        : `${import.meta.env.VITE_BASE_URL}api/adminExcelSheet`;

      const method = excelSheetId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tables: newTables, email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data._id) {
        setExcelSheetId(data._id);
      }
    } catch (error) {
      console.error("Error saving cell:", error);
      toast.error("Failed to save changes");
    }
  };

  const addTable = () => {
    const newTable = {
      id: Date.now(),
      rows: 5,
      cols: 5,
      data: Array(5).fill().map(() => Array(5).fill(''))
    };
    setTables([...tables, newTable]);
  };

  const addRow = async (tableIndex) => {
    try {
      const newTables = [...tables];
      const cols = newTables[tableIndex].cols;
      newTables[tableIndex].rows++;
      newTables[tableIndex].data.push(Array(cols).fill(''));
      setTables(newTables);

      const userData = JSON.parse(localStorage.getItem('user'));
      const email = userData.email;

      if (excelSheetId) {
        await fetch(`${import.meta.env.VITE_BASE_URL}api/adminExcelSheet/${excelSheetId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tables: newTables, email }),
        });
      }
    } catch (error) {
      console.error("Error adding row:", error);
      toast.error("Failed to add row");
    }
  };

  const addColumn = async (tableIndex) => {
    try {
      const newTables = [...tables];
      newTables[tableIndex].cols++;
      newTables[tableIndex].data = newTables[tableIndex].data.map(row => [...row, '']);
      setTables(newTables);

      const userData = JSON.parse(localStorage.getItem('user'));
      const email = userData.email;

      if (excelSheetId) {
        await fetch(`${import.meta.env.VITE_BASE_URL}api/adminExcelSheet/${excelSheetId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tables: newTables, email }),
        });
      }
    } catch (error) {
      console.error("Error adding column:", error);
      toast.error("Failed to add column");
    }
  };

  const clearTableData = (tableIndex) => {
    setDeleteAction({ type: 'table', index: tableIndex });
    $('#deleteproject').modal('show');
  };

  const deleteTable = (tableIndex) => {
    setDeleteAction({ type: 'deleteTable', index: tableIndex });
    $('#deleteproject').modal('show');
  };

  const downloadExcelSheet = (tableIndex) => {
    const table = tables[tableIndex];
    let csv = '';

    // Add headers (A, B, C, etc.)
    for (let i = 0; i < table.cols; i++) {
      csv += String.fromCharCode(65 + i) + ',';
    }
    csv = csv.slice(0, -1) + '\n';

    // Add data
    table.data.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `excel_sheet_${tableIndex + 1}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleTableNameChange = (tableIndex, newName) => {
    const updatedTables = [...tables];
    updatedTables[tableIndex].name = newName;
    setTables(updatedTables);
  };

  const deleteColumn = async (tableIndex, colIndex) => {
    try {
      const updatedTables = [...tables];
      // Remove the column from each row
      updatedTables[tableIndex].data = updatedTables[tableIndex].data.map(row =>
        row.filter((_, index) => index !== colIndex)
      );
      // Update the column count
      updatedTables[tableIndex].cols--;
      setTables(updatedTables);

      // Save to backend
      const userData = JSON.parse(localStorage.getItem('user'));
      const email = userData.email;

      await fetch(`${import.meta.env.VITE_BASE_URL}api/adminExcelSheet/${excelSheetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tables: updatedTables, email }),
      });
    } catch (error) {
      console.error("Error deleting column:", error);
      toast.error("Failed to delete column");
    }
  };

  const deleteRow = async (tableIndex, rowIndex) => {
    try {
      const updatedTables = [...tables];
      // Remove the row
      updatedTables[tableIndex].data = updatedTables[tableIndex].data.filter((_, index) => index !== rowIndex);
      // Update the row count
      updatedTables[tableIndex].rows--;
      setTables(updatedTables);

      // Save to backend
      const userData = JSON.parse(localStorage.getItem('user'));
      const email = userData.email;

      await fetch(`${import.meta.env.VITE_BASE_URL}api/adminExcelSheet/${excelSheetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tables: updatedTables, email }),
      });
    } catch (error) {
      console.error("Error deleting row:", error);
      toast.error("Failed to delete row");
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleCellKeyDown = (e, tableIndex, rowIndex, colIndex) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Move to next row
      if (rowIndex < tables[tableIndex].rows - 1) {
        const nextCell = document.querySelector(`[data-cell="${tableIndex}-${rowIndex + 1}-${colIndex}"]`);
        nextCell?.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Move to previous row
      if (rowIndex > 0) {
        const prevCell = document.querySelector(`[data-cell="${tableIndex}-${rowIndex - 1}-${colIndex}"]`);
        prevCell?.focus();
      }
    } else if (e.key === 'ArrowRight') {
      // Move to next column
      if (colIndex < tables[tableIndex].cols - 1) {
        const nextCell = document.querySelector(`[data-cell="${tableIndex}-${rowIndex}-${colIndex + 1}"]`);
        nextCell?.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      // Move to previous column
      if (colIndex > 0) {
        const prevCell = document.querySelector(`[data-cell="${tableIndex}-${rowIndex}-${colIndex - 1}"]`);
        prevCell?.focus();
      }
    }
  };

  const getColumnLabel = (colIndex) => {
    return String.fromCharCode(65 + colIndex);
  };

  const handleDeleteConfirm = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const email = userData.email;

      switch (deleteAction.type) {
        case 'notepad':
          setNotes('');
          handleNotesChange({ target: { value: '' } });
          break;

        case 'todos':
          setTodos([]);
          await fetch(`${import.meta.env.VITE_BASE_URL}api/adminTodoList/${todoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ todos: [], email }),
          });
          break;

        case 'todo':
          const updatedTodos = todos.filter((_, i) => i !== deleteAction.index);
          setTodos(updatedTodos);
          await fetch(`${import.meta.env.VITE_BASE_URL}api/adminTodoList/${todoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ todos: updatedTodos, email }),
          });
          break;

        case 'table':
          const newTables = [...tables];
          newTables[deleteAction.index].data = Array(newTables[deleteAction.index].rows)
            .fill()
            .map(() => Array(newTables[deleteAction.index].cols).fill(''));
          setTables(newTables);
          break;

        case 'deleteTable':
          const updatedTables = tables.filter((_, index) => index !== deleteAction.index);
          setTables(updatedTables);
          if (excelSheetId) {
            await fetch(`${import.meta.env.VITE_BASE_URL}api/adminExcelSheet/${excelSheetId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tables: updatedTables, email }),
            });
          }
          break;
      }

      $('#deleteproject').modal('hide');
    } catch (error) {
      console.error("Error handling delete:", error);
      toast.error("Failed to delete item");
    }
  };

  const highlightHolidays = ({ date }) => {
    const adjustedDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    const isoDate = adjustedDate.toISOString().split('T')[0];

    if (holidays.find(h => h.date.iso === isoDate)) {
      return 'text-success';
    }
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    const adjustedDate = new Date(newDate.getTime() - (newDate.getTimezoneOffset() * 60000));
    const isoDate = adjustedDate.toISOString().split('T')[0];

    const holiday = holidays.find(h => h.date.iso === isoDate);
    setSelectedHoliday(holiday ? holiday : null);
    setDecisionMade(false);
  };

  const handleConfirm = async (confirmation) => {
    setIsConfirmed(confirmation);
    setDecisionMade(true);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem("decisionDate", today);

    if (confirmation && selectedHoliday) {
      await axios.post(`${import.meta.env.VITE_BASE_URL}api/notifyHoliday`, {
        holidayName: selectedHoliday.name,
        holidayDate: selectedHoliday.date.iso,
        isConfirmed: confirmation
      });
      toast.success(`Tomorrow is a holiday of ${selectedHoliday.name} on ${selectedHoliday.date.iso}. Enjoy your day off!`);
    } else {
      await axios.post(`${import.meta.env.VITE_BASE_URL}api/notifyHoliday`, {
        isConfirmed: confirmation
      });
      toast.info("There is no holiday tomorrow. Please come on time, all employees.");
    }
  };

  // Add these theme-based styles
  const darkModeStyles = {
    card: {
      backgroundColor: isDarkMode ? '#2b2b2b' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
    },
    cardHeader: {
      backgroundColor: isDarkMode ? '#363636' : '#f8f9fa',
      color: isDarkMode ? '#fff' : '#000',
    },
    table: {
      backgroundColor: isDarkMode ? '#2b2b2b' : '#fff',
      color: isDarkMode ? '#fff' : '#000',
    },
    tableHeader: {
      backgroundColor: isDarkMode ? '#363636' : '#f8f9fa',
      color: isDarkMode ? '#fff' : '#000',
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
                      <div className="card shadow-lg" style={darkModeStyles.card}>
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
                      <div className="card shadow-lg" style={darkModeStyles.card}>
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
                      <div className="card shadow-lg" style={darkModeStyles.card}>
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
                    <div className="card shadow-lg" style={darkModeStyles.card}>
                      <div className="card-body">
                        <h5 className="card-title text-center mb-4">Overall Summary</h5>
                        <Bar data={chartData} options={chartOptions} />
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4 mb-4">
                    <div className="card shadow-lg" style={darkModeStyles.card}>
                      <div className="card-body">
                        <h5 className="card-title text-center">Project Status</h5>
                        <Doughnut data={projectStatusChartData} options={projectStatusChartOptions} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* NotePad */}
                <div className="row justify-content-center">
                  <div className="col-12 col-md-8 mb-4">
                    <div className="card shadow-lg" style={darkModeStyles.card}>
                      <div className="card-body" style={{
                        backgroundColor: notepadColor,
                        color: isLightColor(notepadColor) ? '#000' : '#fff'
                      }}>
                        <h5 className="card-title text-center mb-3" style={{ color: isLightColor(notepadColor) ? '#000' : '#fff' }}>
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
                                color: isLightColor(notepadColor) ? '#666' : '#ccc',
                                fontFamily: 'monospace',
                                fontSize: '14px',
                                lineHeight: '24px',
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
                                <div key={i} style={{ height: '24px' }}>{i + 1}</div>
                              ))}
                            </div>
                            <textarea
                              value={notes}
                              onChange={handleNotesChange}
                              className="form-control hindi-paper"
                              style={{
                                height: '345px',
                                marginBottom: '20px',
                                resize: 'none',
                                backgroundColor: 'transparent',
                                border: '1px solid #6c757d',
                                padding: '5px 10px 10px 40px',
                                fontSize: `${fontSize * (zoomLevel / 100)}px`,
                                lineHeight: '24px',
                                fontFamily: 'Arial, sans-serif',
                                position: 'relative',
                                backgroundAttachment: 'local',
                                width: '100%',
                                transform: `scale(${zoomLevel / 100})`,
                                transformOrigin: 'left top',
                                fontWeight: isBold ? 'bold' : 'normal',
                                textDecoration: isUnderline ? 'underline' : 'none',
                                color: isLightColor(notepadColor) ? '#000' : '#fff',
                                backgroundImage: `linear-gradient(${isLightColor(notepadColor) ? '#adb5bd' : '#ffffff33'} 1px, transparent 1px), linear-gradient(90deg, transparent 0px, transparent 1px, transparent 1px)`,
                                backgroundSize: '100% 24px',
                                backgroundPositionY: '-1px'
                              }}
                              placeholder="Start typing your notes here..."
                            />
                          </div>
                        )}

                        <div className="d-flex justify-content-between align-items-center mt-3">
                          {/* Color Picker */}
                          <div className="position-relative btn-group">
                            <button
                              className="btn btn-secondary btn-sm me-1"
                              onClick={() => setShowNotePadPicker(!showNotePadPicker)}
                              title="Change background color"
                            >
                              <i className="bi bi-palette-fill"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-dark"
                              onClick={downloadNotePad}
                            >
                              <i className="bi bi-download"></i>
                            </button>
                            {showNotePadPicker && (
                              <CustomColorPicker
                                color={notepadColor}
                                onChange={(color) => updateColors('notepad', color)}
                                onClose={() => setShowNotePadPicker(false)}
                              />
                            )}
                          </div>

                          <div className="">
                            <div className="btn-group">
                              <button
                                className={`btn btn-sm ${isBold ? 'btn-secondary' : 'btn-outline-dark'}`}
                                onClick={toggleBold}
                                title="Toggle Bold"
                              >
                                <i className="bi bi-type-bold"></i>
                              </button>
                              <button
                                className={`btn btn-sm ${isUnderline ? 'btn-secondary' : 'btn-outline-dark'}`}
                                onClick={toggleUnderline}
                                title="Toggle Underline"
                              >
                                <i className="bi bi-type-underline"></i>
                              </button>
                            </div>

                            <div className="btn-group">
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handleFontSizeChange(fontSize - 1)}
                                disabled={fontSize <= 8}
                              >
                                <i className="bi bi-dash"></i>
                              </button>
                              <button className="btn btn-sm btn-outline-secondary" disabled>
                                {fontSize}
                              </button>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handleFontSizeChange(fontSize + 1)}
                                disabled={fontSize >= 32}
                              >
                                <i className="bi bi-plus"></i>
                              </button>
                            </div>
                          </div>

                          <div className="btn-group">
                            <button
                              className={`btn btn-sm me-1 ${isListening ? 'btn-danger' : 'btn-secondary'}`}
                              onClick={toggleSpeechToText}
                            >
                              <i className={`bi ${isListening ? 'bi-mic-fill' : 'bi-mic'}`}></i>
                            </button>
                            <button
                              className={`btn btn-sm me-1 ${isSpeaking ? 'btn-danger' : 'btn-secondary'}`}
                              onClick={speakText}
                            >
                              <i className={`bi ${isSpeaking ? 'bi-volume-up-fill' : 'bi-volume-up'}`}></i>
                            </button>



                            <button
                              className="btn btn-sm btn-secondary me-1"
                              onClick={handleZoomIn}
                              disabled={zoomLevel >= 200}
                            >
                              <i className="bi bi-zoom-in"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={handleZoomOut}
                              disabled={zoomLevel <= 50}
                            >
                              <i className="bi bi-zoom-out"></i>
                            </button>
                          </div>

                          <div className="btn-group">
                            {/* <button
                              className="btn btn-sm btn-secondary me-1"
                              onClick={toggleFullscreen}
                            >
                              <i className={`bi bi-${isFullscreen ? 'fullscreen-exit' : 'fullscreen'}`}></i>
                            </button> */}
                            <button
                              className="btn btn-sm btn-danger text-white"
                              onClick={clearNotePad}
                            >
                              <i className="bi bi-trash"></i>
                            </button>

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Todo List */}
                  <div className="col-12 col-md-4 mb-4">
                    <div className="card shadow-lg" style={darkModeStyles.card}>
                      <div className="card-body" style={{
                        backgroundColor: todoColor,
                        color: isLightColor(todoColor) ? '#000' : '#fff'
                      }}>
                        <h5 className="card-title text-center mb-3">Todo List</h5>

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
                        <DragDropContext onDragEnd={handleDragEnd}>
                          <Droppable droppableId="todos">
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
                                          color: isLightColor(todoColor) ? '#000' : '#fff'
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
                                                  <DeleteIcon className='text-secondary' style={{ height: '20px', width: '20px' }} />
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
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div className="position-relative">
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setShowTodoPicker(!showTodoPicker)}
                              title="Change background color"
                            >
                              <i className="bi bi-palette-fill"></i>
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
                                className="btn btn-danger text-white btn-sm"
                                onClick={clearAllTodos}
                              >
                                <i className="bi bi-trash" title='Clear all'></i>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Excel Sheet */}
                <div className="card shadow-lg mb-5" style={darkModeStyles.card}>
                  <div className="card-body" style={{
                    backgroundColor: excelSheetColor
                  }}>
                    {/* <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="card-title text-center flex-grow-1" style={{ color: isLightColor(excelSheetColor) ? '#000' : '#fff' }}>
                        Excel Sheet
                      </h5>
                    </div> */}
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
                            <button className="btn btn-primary" onClick={addTable} title='Add New Table'>
                              <i className="icofont-plus me-1" />
                              <span className="">Add Excel Sheet</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            {tables.map((table, tableIndex) => (
                              <div key={table.id} className="">
                                <div className="d-flex justify-content-center align-items-center mb-3">
                                  <input
                                    type="text"
                                    value={table.name || `Table ${tableIndex + 1}`}
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
                                  <table className="table table-bordered" style={darkModeStyles.table}>
                                    <thead style={{
                                      ...darkModeStyles.tableHeader,
                                      position: 'sticky',
                                      top: 0,
                                      zIndex: 1
                                    }}>
                                      <tr>
                                        <th style={{
                                          width: '30px',
                                          backgroundColor: '#f8f9fa',
                                          position: 'sticky',
                                          left: 0,
                                          zIndex: 2
                                        }}></th>
                                        {Array(table.cols).fill().map((_, colIndex) => (
                                          <th key={colIndex} className="text-center" style={{
                                            backgroundColor: '#f8f9fa',
                                            padding: '2px',
                                            fontSize: '12px',
                                            width: '80px',
                                            color: isLightColor(excelSheetColor) ? '#000' : '#fff'
                                          }}>
                                            {getColumnLabel(colIndex)}
                                            <button
                                              className="btn text-danger btn-sm ms-1"
                                              onClick={() => deleteColumn(tableIndex, colIndex)}
                                              style={{ padding: '0px 2px', fontSize: '10px' }}
                                            >
                                              ×
                                            </button>
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody style={darkModeStyles.table}>
                                      {Array(table.rows).fill().map((_, rowIndex) => (
                                        <tr key={rowIndex}>
                                          <td className="text-center" style={{
                                            backgroundColor: '#f8f9fa',
                                            padding: '2px',
                                            fontSize: '12px',
                                            position: 'sticky',
                                            left: 0,
                                            zIndex: 1
                                          }}>
                                            {rowIndex + 1}
                                            <button
                                              className="btn text-danger btn-sm ms-1"
                                              onClick={() => deleteRow(tableIndex, rowIndex)}
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
                                                  tabIndex={0}
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
                                                      fontSize: '12px',
                                                      zIndex: '1000'
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
                                <div className="mb-4 d-flex justify-content-between">

                                  <div className="position-relative btn-group">
                                    <button
                                      className="btn btn-secondary me-1"
                                      onClick={() => setShowExcelPicker(!showExcelPicker)}
                                      title='Color The Sheet'
                                    >
                                      <i className="bi bi-palette-fill"></i>
                                      <span className="ms-1">Color</span>
                                    </button>
                                    <button
                                      className="btn btn-dark btn-sm"
                                      onClick={() => downloadExcelSheet(tableIndex)}
                                      title='Download The Excel Sheet'
                                    >
                                      <i className="bi bi-download"></i>
                                      <span className="ms-1">Excel</span>
                                    </button>
                                    {showExcelPicker && (
                                      <CustomColorPicker
                                        color={excelSheetColor}
                                        onChange={(color) => updateColors('excel', color)}
                                        onClose={() => setShowExcelPicker(false)}
                                      />
                                    )}
                                  </div>

                                  <div className="btn-group">
                                    <button
                                      className="btn btn-primary me-1"
                                      onClick={addTable}
                                      title='Add New Table'
                                    >
                                      <i className="icofont-plus me-1" />
                                      <span className="">Table</span>
                                    </button>
                                    <button
                                      className="btn btn-secondary me-1"
                                      onClick={() => addRow(tableIndex)}
                                      title='Add New Row In Table'
                                    >
                                      <i className="icofont-plus me-1" />
                                      <span className="">Row</span>
                                    </button>
                                    <button
                                      className="btn btn-secondary"
                                      onClick={() => addColumn(tableIndex)}
                                      title='Add New Column In Table'
                                    >
                                      <i className="icofont-plus me-1" />
                                      <span className="">Column</span>
                                    </button>
                                  </div>


                                  <div className="btn-group">
                                    <button
                                      className="btn btn-danger text-white me-1"
                                      onClick={() => clearTableData(tableIndex)}
                                      title='Clear All Table Value'
                                    >
                                      <i className="icofont-eraser  me-1" />
                                      <span className="">Erase</span>
                                    </button>
                                    {tables.length > 1 && (
                                      <button
                                        className="btn btn-danger me-2"
                                        onClick={() => deleteTable(tableIndex)}
                                      >
                                        <i className="icofont-trash me-1 text-white" />
                                        <span className="text-white">Table</span>
                                      </button>
                                    )}
                                  </div>
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

                <div className="card shadow-lg mb-5" style={darkModeStyles.card}>
                  <div className="card-body">
                    <div className='d-flex justify-content-around gap-5'>
                      <div>
                        <h5 className="card-title text-center mb-4" style={{ color: isDarkMode ? '#fff' : '#000' }}>Calendar</h5>
                        <Calendar
                          onChange={handleDateChange}
                          value={selectedDate}
                          tileClassName={highlightHolidays}
                          className={isDarkMode ? 'dark-calendar' : ''}
                        />
                      </div>
                      <div className='text-center'>
                        {decisionMade ? (
                          <h4 className='text-center mb-5' style={{ color: isDarkMode ? '#fff' : '#000' }}>
                            Thank you for your decision!
                          </h4>
                        ) : (
                          <div>
                            <h4 className='text-center mb-5 mt-5' style={{ color: isDarkMode ? '#fff' : '#000' }}>
                              Do you want to declare tomorrow as an office holiday?
                            </h4>
                            <div className=''>
                              <button
                                className="btn btn-success me-5"
                                onClick={() => handleConfirm(true)}
                                disabled={decisionMade}
                              >
                                Yes
                              </button>
                              <button
                                className="btn btn-danger"
                                onClick={() => handleConfirm(false)}
                                disabled={decisionMade}
                              >
                                No
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      {selectedHoliday ? (
                        <div className="card" style={darkModeStyles.card}>
                          <div className="card-header" style={darkModeStyles.cardHeader}>
                            <h3 style={{ color: isDarkMode ? '#fff' : '#000' }}>Holiday Details:</h3>
                          </div>
                          <div className="card-body">
                            <table className="table table-bordered" style={darkModeStyles.table}>
                              <thead className="thead-light" style={darkModeStyles.tableHeader}>
                                <tr>
                                  <th>Name</th>
                                  <th>Date</th>
                                  <th>Description</th>
                                  <th>Type</th>
                                  <th>Location</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr style={{ color: isDarkMode ? '#fff' : '#000' }}>
                                  <td>{selectedHoliday.name}</td>
                                  <td>{selectedHoliday.date.iso}</td>
                                  <td>{selectedHoliday.description}</td>
                                  <td>{selectedHoliday.type.join(', ')}</td>
                                  <td>{selectedHoliday.locations}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <p style={{ color: isDarkMode ? '#fff' : '#000' }}>
                          No holiday details available for the selected date.
                        </p>
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
        <ToastContainer />
        <FloatingMenu userType="admin" isMobile={isMobile} />
      </div>

      {/* Modal Delete Confirmation */}
      <div className="modal fade" id="deleteproject" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold" id="deleteprojectLabel">
                Delete item Permanently?
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body justify-content-center flex-column d-flex">
              <i className="icofont-ui-delete text-danger display-2 text-center mt-2" />
              <p className="mt-4 fs-5 text-center">
                You can only delete this item Permanently
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger color-fff"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDashboard;