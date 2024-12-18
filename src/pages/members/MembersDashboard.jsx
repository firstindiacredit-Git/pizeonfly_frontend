import React, { useState, useEffect, useCallback, useRef } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'

import axios from 'axios'
import { Link } from 'react-router-dom'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Checkbox, IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { useLocation } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import CustomColorPicker, { isLightColor } from "../colorpicker/CustomColorPicker";
import FloatingMenu from '../../Chats/FloatingMenu'
import { evaluateFormula } from '../../utils/excelFormulas';
import { toast } from 'react-toastify';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const MemberDashboard = () => {
    const [currentEmployeeId, setCurrentEmployeeId] = useState("");

    const location = useLocation();
    const employeeId = location.state?.employeeId
    const employeeCode = location.state?.employeeCode
    const employee = location.state?.employee

    useEffect(() => {
        if (employeeId) {
            setCurrentEmployeeId(employeeId);
        }
    }, [])
    if (!employeeId) {
        return (<div>Error: Employee ID is missing!</div>);
    }

    const [totalProjects, setTotalProjects] = useState(0)
    const [totalTasks, setTotalTasks] = useState(0)
    const [assignedProjects, setAssignedProjects] = useState([])
    const [taskStatusCount, setTaskStatusCount] = useState({
        completed: 0,
        inProgress: 0,
        notStarted: 0
    })
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [notes, setNotes] = useState('')
    const [tables, setTables] = useState([{
        id: 1,
        rows: 5,
        cols: 5,
        data: Array(5).fill().map(() => Array(5).fill('')),
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
            bankName: "",
            accountHolderName: "",
            accountNumber: "",
            ifscCode: "",
            accountType: "",
            upiId: "",
            paymentApp: "",
            qrCode: ""
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

    // Add new state variables
    const [editingTodo, setEditingTodo] = useState(null);
    const [editedTodoText, setEditedTodoText] = useState('');

    // Add employeeId from localStorage

    // First, add a new state for tasks
    const [assignedTasks, setAssignedTasks] = useState([]);

    // Add color states
    const [notepadColor, setNotepadColor] = useState('#fdf8c8');
    const [todoColor, setTodoColor] = useState('#cfe2ff');
    const [excelSheetColor, setExcelSheetColor] = useState('#d4edda');

    // Add these state variables for color picker visibility
    const [showNotePadPicker, setShowNotePadPicker] = useState(false);
    const [showTodoPicker, setShowTodoPicker] = useState(false);
    const [showExcelPicker, setShowExcelPicker] = useState(false);

    // Add these new state variables
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const speechRecognition = useRef(null);

    // Add these new state variables after other state declarations
    const [zoomLevel, setZoomLevel] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const notePadRef = useRef(null);

    // Add these new state variables after other state declarations
    const [fontSize, setFontSize] = useState(14);
    const [isBold, setIsBold] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareEmail, setShareEmail] = useState('');
    const [shareMessage, setShareMessage] = useState('');

    // Add these new color options
    const colorOptions = {
        standard: [
            // Row 1
            '#000000', '#424242', '#666666', '#808080', '#999999', '#B3B3B3', '#CCCCCC', '#E6E6E6', '#F2F2F2', '#FFFFFF', '#fdf8c8',
            // Row 2 
            '#FF0000', '#FF4500', '#FF8C00', '#FFD700', '#32CD32', '#00FF00', '#00CED1', '#0000FF', '#8A2BE2', '#FF00FF',
            // Row 3
            '#FFB6C1', '#FFA07A', '#FFE4B5', '#FFFACD', '#98FB98', '#AFEEEE', '#87CEEB', '#E6E6FA', '#DDA0DD', '#FFC0CB',
            // Row 4
            '#DC143C', '#FF4500', '#FFA500', '#FFD700', '#32CD32', '#20B2AA', '#4169E1', '#8A2BE2', '#9370DB', '#FF69B4',
            // Row 5
            '#800000', '#D2691E', '#DAA520', '#808000', '#006400', '#008080', '#000080', '#4B0082', '#800080', '#C71585'
        ],
        custom: ['#FFFFFF', '#000000']
    };

    // Add these state variables
    const [columnWidths, setColumnWidths] = useState({});
    const [rowHeights, setRowHeights] = useState({});
    const [resizing, setResizing] = useState(null);

    // Add these resize handler functions
    const handleColumnResizeStart = (e, tableIndex, colIndex) => {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.pageX;
        const currentWidth = columnWidths[`${tableIndex}-${colIndex}`] || 80;

        const handleMouseMove = (e) => {
            e.preventDefault();
            const diff = e.pageX - startX;
            const newWidth = Math.max(50, currentWidth + diff);
            setColumnWidths(prev => ({
                ...prev,
                [`${tableIndex}-${colIndex}`]: newWidth
            }));
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            setResizing(null);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        setResizing('column');
    };

    const handleRowResizeStart = (e, tableIndex, rowIndex) => {
        e.preventDefault();
        e.stopPropagation();
        const startY = e.pageY;
        const currentHeight = rowHeights[`${tableIndex}-${rowIndex}`] || 22;

        const handleMouseMove = (e) => {
            e.preventDefault();
            const diff = e.pageY - startY;
            const newHeight = Math.max(22, currentHeight + diff);
            setRowHeights(prev => ({
                ...prev,
                [`${tableIndex}-${rowIndex}`]: newHeight
            }));
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            setResizing(null);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        setResizing('row');
    };

    // Add this CSS using useEffect
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
            .resize-handle {
                position: absolute;
                right: -2px;
                top: 0;
                bottom: 0;
                width: 4px;
                background: transparent;
                cursor: col-resize;
                z-index: 10;
            }

            .resize-handle:hover,
            .resize-handle.active {
                background: #0d6efd !important;
            }

            td {
                position: relative;
            }

            td:hover .resize-handle {
                background: rgba(13, 110, 253, 0.2);
            }

            .row-resize-handle {
                position: absolute;
                bottom: -2px;
                left: 0;
                right: 0;
                height: 4px;
                background: transparent;
                cursor: row-resize;
                z-index: 10;
            }

            td:hover .row-resize-handle {
                background: rgba(13, 110, 253, 0.2);
            }
        `;
        document.head.appendChild(styleSheet);
        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

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
                const token = employeeId;
                const [projectsResponse, tasksResponse, taskStatusResponse, assignedProjectsResponse] = await Promise.all([
                    axios.post(`${import.meta.env.VITE_BASE_URL}api/totalAssigneeProjects`, {
                        _id: token
                    }),
                    axios.post(`${import.meta.env.VITE_BASE_URL}api/totalAssigneeTasks`, {
                        _id: token
                    }),
                    axios.post(`${import.meta.env.VITE_BASE_URL}api/author`, {
                        _id: token
                    }),
                    axios.post(`${import.meta.env.VITE_BASE_URL}api/employee-projects`, {
                        _id: token
                    })
                ]);

                setTotalProjects(projectsResponse.data.totalProjects);
                setTotalTasks(tasksResponse.data.totalTasks);
                setTaskStatusCount(taskStatusResponse.data.taskStatusCount);
                setAssignedTasks(taskStatusResponse.data.tasks); // Store the tasks array
                setAssignedProjects(assignedProjectsResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const user = employee
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

    // Modified useEffect for fetching dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!employeeCode) return;

            try {
                // Fetch colors
                const colorResponse = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}api/employeeColors/${employeeCode}`
                );

                if (colorResponse.data) {
                    setNotepadColor(colorResponse.data.notepadColor || '#fff3cd');
                    setTodoColor(colorResponse.data.todoColor || '#cfe2ff');
                    setExcelSheetColor(colorResponse.data.excelSheetColor || '#d4edda');
                }

                // Fetch Excel Sheet data with employeeId
                const excelResponse = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet/${employeeCode}`
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
                    `${import.meta.env.VITE_BASE_URL}api/employeeNotePad/${employeeCode}`
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
                    `${import.meta.env.VITE_BASE_URL}api/employeeTodoList/${employeeCode}`
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
                    todoList: 'Failed to load Todo List',
                    colors: 'Failed to load color preferences'
                });
                setLoading({
                    excelSheet: false,
                    notePad: false,
                    todoList: false
                });
            }
        };

        fetchDashboardData();
    }, [currentEmployeeId]);

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
        },
    }

    // Add this function to determine if it's a small screen
    const isSmallScreen = () => window.innerWidth <= 576;

    // Excel sheet functions
    const handleCellChange = async (tableIndex, rowIndex, colIndex, value) => {
        try {
            const newTables = [...tables];

            // Check if the value starts with '=' for formula
            if (value.startsWith('=')) {
                const result = evaluateFormula(value, newTables[tableIndex].data);
                newTables[tableIndex].data[rowIndex][colIndex] = {
                    formula: value,
                    value: result
                };
            } else {
                // For non-formula values, store the value directly
                newTables[tableIndex].data[rowIndex][colIndex] = value;
            }

            setTables(newTables);

            const payload = {
                tables: newTables.map(table => ({
                    ...table,
                    data: table.data.map(row =>
                        row.map(cell => {
                            // If cell is an object with formula and value
                            if (cell && typeof cell === 'object' && 'formula' in cell) {
                                return cell;
                            }
                            // Otherwise return the cell value directly
                            return cell;
                        })
                    )
                })),
                employeeId: employeeCode
            };

            if (dashboardIds.excelSheet) {
                // Update existing excel sheet
                await axios.put(
                    `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet/${dashboardIds.excelSheet}`,
                    payload
                );
            } else {
                // Create new excel sheet
                const response = await axios.post(
                    `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet`,
                    payload
                );
                setDashboardIds(prev => ({ ...prev, excelSheet: response.data._id }));
            }
        } catch (error) {
            console.error('Error saving cell:', error);
            setError(prev => ({ ...prev, excelSheet: 'Failed to save changes' }));
        }
    };

    const addRow = async (tableIndex) => {
        try {
            const newTables = [...tables];
            const cols = newTables[tableIndex].cols;
            newTables[tableIndex].rows++;
            newTables[tableIndex].data.push(Array(cols).fill(''));
            setTables(newTables);

            const payload = {
                tables: newTables,
                employeeId: employeeCode
            };

            if (dashboardIds.excelSheet) {
                await axios.put(
                    `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet/${dashboardIds.excelSheet}`,
                    payload
                );
            } else {
                const response = await axios.post(
                    `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet`,
                    payload
                );
                setDashboardIds(prev => ({ ...prev, excelSheet: response.data._id }));
            }
        } catch (error) {
            console.error('Error adding row:', error);
            setError(prev => ({ ...prev, excelSheet: 'Failed to add row' }));
        }
    };

    const addColumn = async (tableIndex) => {
        try {
            const newTables = [...tables];
            newTables[tableIndex].cols++;
            newTables[tableIndex].data = newTables[tableIndex].data.map(row => [...row, '']);
            setTables(newTables);

            const payload = {
                tables: newTables,
                employeeId: employeeCode
            };

            if (dashboardIds.excelSheet) {
                await axios.put(
                    `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet/${dashboardIds.excelSheet}`,
                    payload
                );
            } else {
                const response = await axios.post(
                    `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet`,
                    payload
                );
                setDashboardIds(prev => ({ ...prev, excelSheet: response.data._id }));
            }
        } catch (error) {
            console.error('Error adding column:', error);
            setError(prev => ({ ...prev, excelSheet: 'Failed to add column' }));
        }
    };

    const addTable = async () => {
        try {
            const newTable = {
                id: Date.now(),
                rows: 5,
                cols: 5,
                data: Array(5).fill().map(() => Array(5).fill('')),
                name: `Table ${tables.length + 1}`
            };

            const newTables = [...tables, newTable];

            // First update the state
            setTables(newTables);

            // Then make the API call
            const payload = {
                tables: newTables,
                employeeId: employeeCode
            };

            if (dashboardIds.excelSheet) {
                await axios.put(
                    `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet/${dashboardIds.excelSheet}`,
                    payload
                );
            } else {
                const response = await axios.post(
                    `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet`,
                    payload
                );
                setDashboardIds(prev => ({ ...prev, excelSheet: response.data._id }));
            }
        } catch (error) {
            console.error('Error adding table:', error);
            setError(prev => ({ ...prev, excelSheet: 'Failed to add table' }));
            // Revert the state if API call fails
            setTables(prev => prev.slice(0, -1));
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
                    createdAt: new Date().toISOString(),
                    source: 'membersDashboard' // Add this line
                };
                const updatedTodos = [...todos, newTodoItem];
                setTodos(updatedTodos);
                setNewTodo('');

                const payload = {
                    todos: updatedTodos,
                    employeeId: employeeCode
                };

                if (dashboardIds.todoList) {
                    await axios.put(
                        `${import.meta.env.VITE_BASE_URL}api/employeeTodoList/${dashboardIds.todoList}`,
                        payload
                    );
                } else {
                    const response = await axios.post(
                        `${import.meta.env.VITE_BASE_URL}api/employeeTodoList`,
                        payload
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


            if (dashboardIds.todoList) {
                await axios.put(
                    `${import.meta.env.VITE_BASE_URL}api/employeeTodoList/${dashboardIds.todoList}`,
                    { todos: newTodos },
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

            if (dashboardIds.todoList) {
                await axios.put(
                    `${import.meta.env.VITE_BASE_URL}api/employeeTodoList/${dashboardIds.todoList}`,
                    { todos: newTodos },
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
        try {
            const updatedTables = [...tables];
            updatedTables[tableIndex].name = newName;
            setTables(updatedTables);

            // Save to database
            if (dashboardIds.excelSheet) {
                await axios.put(
                    `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet/${dashboardIds.excelSheet}`,
                    {
                        tables: updatedTables,
                        employeeId: employeeCode
                    }
                );
            } else {
                const response = await axios.post(
                    `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet`,
                    {
                        tables: updatedTables,
                        employeeId: employeeCode
                    }
                );
                setDashboardIds(prev => ({ ...prev, excelSheet: response.data._id }));
            }
        } catch (error) {
            console.error("Error updating table name:", error);
            toast.error("Failed to update table name");
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
        try {
            const newTables = [...tables];
            newTables[tableIndex].data.splice(rowIndex, 1);
            newTables[tableIndex].rows--;
            setTables(newTables);

            const payload = {
                tables: newTables,
                employeeId: employeeCode
            };

            if (dashboardIds.excelSheet) {
                await axios.put(
                    `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet/${dashboardIds.excelSheet}`,
                    payload
                );
            }
        } catch (error) {
            console.error('Error deleting row:', error);
            setError(prev => ({ ...prev, excelSheet: 'Failed to delete row' }));
        }
    };

    const deleteColumn = async (tableIndex, colIndex) => {
        try {
            const newTables = [...tables];
            newTables[tableIndex].data.forEach(row => row.splice(colIndex, 1));
            newTables[tableIndex].cols--;
            setTables(newTables);

            if (dashboardIds.excelSheet) {
                await axios.put(
                    `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet/${dashboardIds.excelSheet}`,
                    {
                        tables: newTables,
                        employeeId: employeeCode
                    }
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

    // Modified handleNotesChange function
    const handleNotesChange = async (value) => {
        try {
            setNotes(value);

            // Force update of line numbers by triggering a re-render
            const lineNumbers = document.querySelector('.line-numbers');
            if (lineNumbers) {
                const textarea = document.querySelector('.hindi-paper');
                lineNumbers.scrollTop = textarea.scrollTop;
            }

            const payload = {
                notes: value,
                employeeId: employeeCode
            };

            if (dashboardIds.notePad) {
                // Update existing notepad
                await axios.put(
                    `${import.meta.env.VITE_BASE_URL}api/employeeNotePad/${dashboardIds.notePad}`,
                    payload
                );
            } else {
                // Create new notepad
                const response = await axios.post(
                    `${import.meta.env.VITE_BASE_URL}api/employeeNotePad`,
                    payload
                );
                setDashboardIds(prev => ({ ...prev, notePad: response.data._id }));
            }
        } catch (error) {
            console.error('Error saving notepad:', error);
            setError(prev => ({ ...prev, notePad: 'Failed to save changes' }));
        }
    };

    // Add these new functions
    const clearNotePad = async () => {
        try {
            if (dashboardIds.notePad) {
                // Delete the notepad document entirely instead of just clearing it
                await axios.delete(
                    `${import.meta.env.VITE_BASE_URL}api/employeeNotePad/${dashboardIds.notePad}`
                );

                // Clear local state
                setNotes('');
                // Reset the dashboard ID for notepad
                setDashboardIds(prev => ({ ...prev, notePad: null }));
            }
        } catch (error) {
            console.error('Error clearing notepad:', error);
            setError(prev => ({ ...prev, notePad: 'Failed to clear notepad' }));
            // Revert the state if API call fails
            setNotes(notes);
        }
    };

    const downloadNotePad = () => {
        try {
            // Create a blob with the text content
            const blob = new Blob([notes], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);

            // Create and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = 'notepad.txt';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading notepad:', error);
            setError(prev => ({ ...prev, notePad: 'Failed to download notepad' }));
        }
    };

    // Add this new function
    const clearAllTodos = async () => {
        try {
            setTodos([]);
            if (dashboardIds.todoList) {
                await axios.put(
                    `${import.meta.env.VITE_BASE_URL}api/employeeTodoList/${dashboardIds.todoList}`,
                    { todos: [] }
                );
            }
        } catch (error) {
            console.error('Error clearing todos:', error);
            setError(prev => ({ ...prev, todoList: 'Failed to clear todos' }));
        }
    };

    const startEditing = (index, text) => {
        setEditingTodo(index);
        setEditedTodoText(text);
    };

    const handleEditTodo = async (index) => {
        try {
            const newTodos = [...todos];
            newTodos[index] = {
                ...newTodos[index],
                text: editedTodoText
            };
            setTodos(newTodos);
            setEditingTodo(null);

            if (dashboardIds.todoList) {
                await axios.put(
                    `${import.meta.env.VITE_BASE_URL}api/employeeTodoList/${dashboardIds.todoList}`,
                    { todos: newTodos }
                );
            }
        } catch (error) {
            console.error('Error updating todo:', error);
            setError(prev => ({ ...prev, todoList: 'Failed to update todo' }));
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
        if (interval > 1) return Math.floor(interval) + " hrs ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " mins ago";
        return Math.floor(seconds) + " sec ago";
    };

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
                );
            }
        } catch (error) {
            console.error('Error updating todo order:', error);
            setError(prev => ({ ...prev, todoList: 'Failed to update todo order' }));
        }
    };

    // Add these new functions for Excel sheet
    const clearTableData = async (tableIndex) => {
        try {
            const newTables = [...tables];
            const rows = newTables[tableIndex].rows;
            const cols = newTables[tableIndex].cols;
            newTables[tableIndex].data = Array(rows).fill().map(() => Array(cols).fill(''));
            setTables(newTables);

            if (dashboardIds.excelSheet) {
                await axios.put(
                    `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet/${dashboardIds.excelSheet}`,
                    {
                        tables: newTables,
                        employeeId: employeeCode
                    }
                );
            }
        } catch (error) {
            console.error('Error clearing table:', error);
            setError(prev => ({ ...prev, excelSheet: 'Failed to clear table' }));
        }
    };

    const deleteTable = async (tableIndex) => {
        try {
            const newTables = tables.filter((_, index) => index !== tableIndex);
            setTables(newTables);

            if (dashboardIds.excelSheet) {
                await axios.put(
                    `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet/${dashboardIds.excelSheet}`,
                    {
                        tables: newTables,
                        employeeId: employeeCode
                    }
                );
            }
        } catch (error) {
            console.error('Error deleting table:', error);
            setError(prev => ({ ...prev, excelSheet: 'Failed to delete table' }));
        }
    };

    // Add this function to handle color updates
    const updateColors = async (type, color) => {
        try {
            const colors = {
                notepadColor: type === 'notepad' ? color : notepadColor,
                todoColor: type === 'todo' ? color : todoColor,
                excelSheetColor: type === 'excel' ? color : excelSheetColor
            };

            await axios.put(
                `${import.meta.env.VITE_BASE_URL}api/employeeColors/${employeeCode}`,
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

    // Add this function to download Excel sheet
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
            const processedRow = row.map(cell => {
                // Check if cell is a formula object
                if (typeof cell === 'object' && cell !== null && 'value' in cell) {
                    return cell.value;
                }
                return cell;
            });
            csv += processedRow.join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Use table name if available, otherwise use default name with index
        const fileName = table.name ? `${table.name}.csv` : `excel_sheet_${tableIndex + 1}.csv`;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    // Add this useEffect for speech recognition setup
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            speechRecognition.current = new webkitSpeechRecognition();
            speechRecognition.current.continuous = true;
            speechRecognition.current.interimResults = true;

            speechRecognition.current.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');

                handleNotesChange(notes + ' ' + transcript);
            };

            speechRecognition.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
        }

        return () => {
            if (speechRecognition.current) {
                speechRecognition.current.stop();
            }
        };
    }, [notes]);

    // Add these new functions
    const toggleSpeechToText = () => {
        if (!speechRecognition.current) {
            alert('Speech recognition is not supported in your browser');
            return;
        }

        if (isListening) {
            speechRecognition.current.stop();
        } else {
            speechRecognition.current.start();
        }
        setIsListening(!isListening);
    };

    const speakText = () => {
        if (!window.speechSynthesis) {
            alert('Text-to-speech is not supported in your browser');
            return;
        }

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(notes);
        utterance.onend = () => setIsSpeaking(false);
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    // Add these new functions after other function declarations
    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 10, 200));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 10, 50));
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            notePadRef.current.requestFullscreen().catch(err => {
                alert(`Error attempting to enable fullscreen: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleSelectAll = () => {
        const textarea = document.querySelector('.hindi-paper');
        if (textarea) {
            textarea.select();
        }
    };

    // Add these new functions after other function declarations
    const handleFontSizeChange = (newSize) => {
        setFontSize(Math.min(Math.max(newSize, 8), 32)); // Limit between 8px and 32px
    };

    const toggleBold = () => {
        setIsBold(!isBold);
    };

    const toggleUnderline = () => {
        setIsUnderline(!isUnderline);
    };

    const handleShare = async (e) => {
        e.preventDefault();
        try {
            // Example API call - adjust according to your backend
            await axios.post(`${import.meta.env.VITE_BASE_URL}api/share-notes`, {
                to: shareEmail,
                content: notes,
                message: shareMessage
            });
            setShowShareModal(false);
            setShareEmail('');
            setShareMessage('');
            alert('Notes shared successfully!');
        } catch (error) {
            console.error('Error sharing notes:', error);
            alert('Failed to share notes. Please try again.');
        }
    };


    // Add this component before your main component
    const EmployeeTaskProgressBar = ({ tasks }) => {
        // Calculate totals
        const total = tasks.length;
        const completed = tasks.filter(task => task.isCompleted).length;
        const inProgress = tasks.filter(task => !task.isCompleted && task.taskStatus === 'In Progress').length;
        const notStarted = tasks.filter(task => !task.isCompleted && (!task.taskStatus || task.taskStatus === 'Not Started')).length;

        // Calculate percentages
        const completedPercent = total ? ((completed / total) * 100).toFixed(1) : 0;
        const inProgressPercent = total ? ((inProgress / total) * 100).toFixed(1) : 0;
        const notStartedPercent = total ? ((notStarted / total) * 100).toFixed(1) : 0;

        return (
            <div className="task-progress mb-3">
                {/* <div className="d-flex justify-content-between mb-1">
                    <span className="fw-bold">Task Progress</span>
                    <span className="fw-bold">{total} Total Tasks</span>
                </div> */}
                <div className="progress" style={{ height: "20px" }}>
                    <div
                        className="progress-bar bg-success"
                        style={{ width: `${completedPercent}%` }}
                        title={`Completed: ${completed} (${completedPercent}%)`}
                    >
                        {completed}
                    </div>
                    <div
                        className="progress-bar bg-primary"
                        style={{ width: `${inProgressPercent}%` }}
                        title={`In Progress: ${inProgress} (${inProgressPercent}%)`}
                    >
                        {inProgress}
                    </div>
                    <div
                        className="progress-bar bg-secondary"
                        style={{ width: `${notStartedPercent}%` }}
                        title={`Not Started: ${notStarted} (${notStartedPercent}%)`}
                    >
                        {notStarted}
                    </div>
                </div>
                <div className="d-flex justify-content-between mt-2 small">
                    <div>
                        <span className="text-success fw-bold">Completed: {completed}</span>
                    </div>
                    <div>
                        <span className="text-primary fw-bold">In Progress: {inProgress}</span>
                    </div>
                    <div>
                        <span className="text-secondary fw-bold">Not Started: {notStarted}</span>
                    </div>
                </div>
            </div>
        );
    };

    const EmployeeProjectProgressBar = ({ projects }) => {
        // Calculate totals
        const total = projects.length;
        const completed = projects.filter(project => project.progress === "100.00").length;
        const inProgress = projects.filter(project => project.progress !== "100.00").length;

        // Calculate percentages
        const completedPercent = total ? ((completed / total) * 100).toFixed(1) : 0;
        const inProgressPercent = total ? ((inProgress / total) * 100).toFixed(1) : 0;

        return (
            <div className="task-progress mb-3">
                <div className="progress" style={{ height: "20px" }}>
                    <div
                        className="progress-bar bg-success"
                        style={{ width: `${completedPercent}%` }}
                        title={`Completed: ${completed} (${completedPercent}%)`}
                    >
                        {completed}
                    </div>
                    <div
                        className="progress-bar bg-primary"
                        style={{ width: `${inProgressPercent}%` }}
                        title={`In Progress: ${inProgress} (${inProgressPercent}%)`}
                    >
                        {inProgress}
                    </div>
                </div>
                <div className="d-flex justify-content-between mt-2 small">
                    <div>
                        <span className="text-success fw-bold">Completed: {completed}</span>
                    </div>
                    <div>
                        <span className="text-primary fw-bold">In Progress: {inProgress}</span>
                    </div>
                    {/* <div>
                        <span className="text-secondary fw-bold">Total: {total}</span>
                    </div> */}
                </div>
            </div>
        );
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

    // Add these state variables at the top with other states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteAction, setDeleteAction] = useState({
        type: null, // 'notepad', 'todo', 'excel-table', 'excel-clear', 'excel-row', 'excel-column'
        payload: null,
        tableIndex: null
    });

    // Add these handler functions before the return statement
    const handleShowDeleteModal = (type, payload = null, tableIndex = null) => {
        setDeleteAction({ type, payload, tableIndex });
        setShowDeleteModal(true);
    };

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
                    await deleteRow(deleteAction.tableIndex, deleteAction.payload);
                    break;
                case 'excel-column':
                    await deleteColumn(deleteAction.tableIndex, deleteAction.payload);
                    break;
                default:
                    break;
            }
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Delete operation failed:', error);
        }
    };

    // Add the handleApplyFormula function
    const handleApplyFormula = async (tableIndex, rowIndex, colIndex) => {
        try {
            const newTables = [...tables];
            const cell = newTables[tableIndex].data[rowIndex][colIndex];
            const formula = typeof cell === 'object' ? cell.formula : cell;

            if (!formula?.startsWith('=')) {
                return;
            }

            const result = evaluateFormula(formula, newTables[tableIndex].data);
            newTables[tableIndex].data[rowIndex][colIndex] = {
                formula: formula,
                value: result
            };

            setTables(newTables);

            const payload = {
                tables: newTables.map(table => ({
                    ...table,
                    data: table.data.map(row =>
                        row.map(cell => {
                            if (cell && typeof cell === 'object' && 'formula' in cell) {
                                return cell;
                            }
                            return cell;
                        })
                    )
                })),
                employeeId: employeeCode
            };

            if (dashboardIds.excelSheet) {
                await axios.put(
                    `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet/${dashboardIds.excelSheet}`,
                    payload
                );
            } else {
                const response = await axios.post(
                    `${import.meta.env.VITE_BASE_URL}api/employeeExcelSheet`,
                    payload
                );
                setDashboardIds(prev => ({ ...prev, excelSheet: response.data._id }));
            }
        } catch (error) {
            console.error('Error applying formula:', error);
            setError(prev => ({ ...prev, excelSheet: 'Failed to apply formula' }));
        }
    };

    // Add these styles at the beginning of your component
    const styles = {
        resizableCell: {
            position: 'relative',
            minWidth: '80px',
            padding: '0px',
        },
        resizeHandle: {
            position: 'absolute',
            right: '-2px',
            top: '0',
            bottom: '0',
            width: '4px',
            background: 'transparent',
            cursor: 'col-resize',
            zIndex: 10,
        },
        rowResizeHandle: {
            position: 'absolute',
            bottom: '-2px',
            left: '0',
            right: '0',
            height: '4px',
            background: 'transparent',
            cursor: 'row-resize',
            zIndex: 10,
        }
    };

    // Add these new state variables after the existing ones
    const [selectedCells, setSelectedCells] = useState({ start: null, end: null });
    const [copiedData, setCopiedData] = useState(null);
    const [isSelecting, setIsSelecting] = useState(false);

    // Add these new functions before the return statement
    const handleCellMouseDown = (tableIndex, rowIndex, colIndex) => {
      setIsSelecting(true);
      setSelectedCells({
        start: { tableIndex, rowIndex, colIndex },
        end: { tableIndex, rowIndex, colIndex }
      });
    };

    const handleCellMouseEnter = (tableIndex, rowIndex, colIndex) => {
      if (isSelecting) {
        setSelectedCells(prev => ({
          ...prev,
          end: { tableIndex, rowIndex, colIndex }
        }));
      }
    };

    const handleCellMouseUp = () => {
      setIsSelecting(false);
    };

    const isCellSelected = (tableIndex, rowIndex, colIndex) => {
      if (!selectedCells.start || !selectedCells.end) return false;
      if (selectedCells.start.tableIndex !== tableIndex) return false;

      const startRow = Math.min(selectedCells.start.rowIndex, selectedCells.end.rowIndex);
      const endRow = Math.max(selectedCells.start.rowIndex, selectedCells.end.rowIndex);
      const startCol = Math.min(selectedCells.start.colIndex, selectedCells.end.colIndex);
      const endCol = Math.max(selectedCells.start.colIndex, selectedCells.end.colIndex);

      return rowIndex >= startRow && rowIndex <= endRow && 
             colIndex >= startCol && colIndex <= endCol;
    };

    const handleCopy = (e) => {
      if (e.key === 'c' && (e.ctrlKey || e.metaKey) && selectedCells.start && selectedCells.end) {
        const tableIndex = selectedCells.start.tableIndex;
        const startRow = Math.min(selectedCells.start.rowIndex, selectedCells.end.rowIndex);
        const endRow = Math.max(selectedCells.start.rowIndex, selectedCells.end.rowIndex);
        const startCol = Math.min(selectedCells.start.colIndex, selectedCells.end.colIndex);
        const endCol = Math.max(selectedCells.start.colIndex, selectedCells.end.colIndex);

        const copiedData = [];
        for (let i = startRow; i <= endRow; i++) {
          const row = [];
          for (let j = startCol; j <= endCol; j++) {
            const cellData = tables[tableIndex].data[i][j];
            row.push(typeof cellData === 'object' ? cellData.value : cellData);
          }
          copiedData.push(row);
        }
        setCopiedData(copiedData);
      }
    };

    const handlePaste = (e) => {
      if (e.key === 'v' && (e.ctrlKey || e.metaKey) && copiedData && selectedCells.start) {
        const tableIndex = selectedCells.start.tableIndex;
        const startRow = selectedCells.start.rowIndex;
        const startCol = selectedCells.start.colIndex;

        const newTables = [...tables];
        copiedData.forEach((row, rowIndex) => {
          if (startRow + rowIndex < tables[tableIndex].rows) {
            row.forEach((cell, colIndex) => {
              if (startCol + colIndex < tables[tableIndex].cols) {
                newTables[tableIndex].data[startRow + rowIndex][startCol + colIndex] = cell;
              }
            });
          }
        });

        setTables(newTables);

        // Save to backend
        handleSaveExcelSheet(newTables);
      }
    };

    const handleSaveExcelSheet = async (newTables) => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const email = userData.email;

        const url = dashboardIds.excelSheet
          ? `${import.meta.env.VITE_BASE_URL}api/memberExcelSheet/${dashboardIds.excelSheet}`
          : `${import.meta.env.VITE_BASE_URL}api/memberExcelSheet`;

        const method = dashboardIds.excelSheet ? 'PUT' : 'POST';

        await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tables: newTables, email }),
        });
      } catch (error) {
        console.error("Error saving excel sheet:", error);
        toast.error("Failed to save changes");
      }
    };

    // Add useEffect for keyboard events
    useEffect(() => {
      const handleKeyDown = (e) => {
        // Existing copy/paste handlers
        if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
          handleCopy(e);
        } else if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
          handlePaste(e);
        }
        // Add formula application shortcut
        else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && selectedCells.start) {
          e.preventDefault();
          handleApplyFormulaToSelection(selectedCells.start.tableIndex);
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mouseup', handleCellMouseUp);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('mouseup', handleCellMouseUp);
      };
    }, [selectedCells, copiedData, tables]);

    const handleApplyFormulaToSelection = async (tableIndex) => {
      if (!selectedCells.start || !selectedCells.end) return;

      try {
        const newTables = [...tables];
        const startCell = newTables[tableIndex].data[selectedCells.start.rowIndex][selectedCells.start.colIndex];
        
        // Check if the first cell contains a DATESERIES formula
        if (typeof startCell === 'string' && startCell.startsWith('=DATESERIES')) {
          const params = startCell.match(/DATESERIES\((.*)\)/i)[1].split(',').map(x => x.trim());
          const startDate = new Date(params[0]);
          const count = Math.abs(selectedCells.end.rowIndex - selectedCells.start.rowIndex + 1) *
                        Math.abs(selectedCells.end.colIndex - selectedCells.start.colIndex + 1);
          const increment = parseInt(params[2]) || 1;
          
          const dates = generateDateSeries(startDate, count, increment);
          let dateIndex = 0;

          // Apply dates to selected range
          const startRow = Math.min(selectedCells.start.rowIndex, selectedCells.end.rowIndex);
          const endRow = Math.max(selectedCells.start.rowIndex, selectedCells.end.rowIndex);
          const startCol = Math.min(selectedCells.start.colIndex, selectedCells.end.colIndex);
          const endCol = Math.max(selectedCells.start.colIndex, selectedCells.end.colIndex);

          for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
              newTables[tableIndex].data[row][col] = dates[dateIndex++];
            }
          }

          setTables(newTables);
          await handleSaveExcelSheet(newTables);
        }
      } catch (error) {
        console.error("Error applying date series:", error);
        toast.error("Failed to apply date series");
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
                                        {/* <div style={{ height: "8rem" }}>
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
                                        </div> */}

                                        <div className="profile-section p-3 bg-white rounded-4 shadow-sm mb-4">
                                            <div className="row g-3 align-items-center">
                                                {/* Profile Image & Details Column */}
                                                <div className="col-md-4">
                                                    <div className="d-flex align-items-center">
                                                        <div className="profile-image-container me-3">
                                                            <img
                                                                className="avatar rounded-circle border border-2 border-primary p-1"
                                                                src={`${import.meta.env.VITE_BASE_URL}${image ? image.replace('uploads/', '') : ''}`}
                                                                alt="profile"
                                                                style={{
                                                                    transition: 'all 0.3s ease-in-out',
                                                                    // cursor: 'pointer',
                                                                    width: '100px',
                                                                    height: '100px',
                                                                    objectFit: 'cover'
                                                                }}
                                                            // onMouseEnter={(e) => {
                                                            //     e.target.style.transform = 'scale(2.5)';
                                                            //     e.target.style.zIndex = '100';
                                                            //     e.target.style.borderRadius = '8px';
                                                            // }}
                                                            // onMouseLeave={(e) => {
                                                            //     e.target.style.transform = 'scale(1)';
                                                            //     e.target.style.zIndex = '1';
                                                            //     e.target.style.borderRadius = '50%';
                                                            // }}
                                                            // onClick={() => handleImageClick(`${import.meta.env.VITE_BASE_URL}${image.replace('uploads/', '')}`)}
                                                            />
                                                        </div>
                                                        <div className="profile-details">
                                                            <h5 className="mb-1 fw-bold text-primary text-start">{employeeName}</h5>
                                                            <p className="text-muted mb-1 small text-nowrap text-start">
                                                                <i className="bi bi-envelope-fill me-2"></i>
                                                                {email}
                                                            </p>
                                                            <p className="text-muted mb-1 small text-nowrap text-start">
                                                                <i className="bi bi-telephone-fill me-2"></i>
                                                                {employeeData?.phone}
                                                            </p>
                                                            <p className="text-muted mb-1 small text-nowrap text-start">
                                                                <i className="bi bi-calendar-date me-2"></i>
                                                                {employeeData?.joiningDate && new Date(employeeData.joiningDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary mt-2"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#bankDetailsModal"
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
                                                                    {/* Aadhaar Card */}
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
                                                                                            className="btn btn-sm btn-outline-primary"
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

                                                                    {/* Pan Card */}
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

                                                                    {/* Resume */}
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
                                                                <div className="row g-2 mt-2">
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
                                                                        <div className="col-2">
                                                                            <a href={employeeData.socialLinks.github}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="btn btn-outline-dark btn-sm">
                                                                                <i className="bi bi-github"></i>
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                    {employeeData?.socialLinks?.instagram && (
                                                                        <div className="col-2">
                                                                            <a href={employeeData.socialLinks.instagram}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="btn btn-outline-danger btn-sm">
                                                                                <i className="bi bi-instagram"></i>
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                    {employeeData?.socialLinks?.youtube && (
                                                                        <div className="col-2">
                                                                            <a href={employeeData.socialLinks.youtube}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="btn btn-outline-danger btn-sm">
                                                                                <i className="bi bi-youtube"></i>
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                    {employeeData?.socialLinks?.facebook && (
                                                                        <div className="col-2">
                                                                            <a href={employeeData.socialLinks.facebook}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="btn btn-outline-primary btn-sm">
                                                                                <i className="bi bi-facebook"></i>
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                    {employeeData?.socialLinks?.website && (
                                                                        <div className="col-2">
                                                                            <a href={employeeData.socialLinks.website}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="btn btn-outline-info btn-sm">
                                                                                <i className="bi bi-globe"></i>
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                    {employeeData?.socialLinks?.other && (
                                                                        <div className="col-2">
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

                                            {/* Add Edit Profile Button */}
                                            {/* <div className="position-absolute bottom-0 end-0 m-3">

                                                <i className="bi bi-pencil-square">Edit Profile</i>


                                            </div> */}
                                        </div>

                                        {/* Keep the existing styles */}
                                        <style jsx>{`
                      .profile-section {
                        transition: all 0.3s ease;
                        background: linear-gradient(145deg, #ffffff, #f5f7fa);
                        position: relative;  /* Add this to enable absolute positioning of children */
                        min-height: 160px;   /* Add minimum height to ensure space for the button */
                      }
                      
                      .profile-section:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important;
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
                                                <div className="card shadow-lg">
                                                    <div className="card-body">
                                                        {/* <div className="d-flex justify-content-between align-items-center"> */}
                                                        {/* <div></div> */}
                                                        <h5 className="card-title">Total Projects Assigned</h5>
                                                        {/* <button
                                                                type="button"
                                                                className="btn"
                                                                data-bs-toggle="modal"
                                                                data-bs-target="#createproject"
                                                            >
                                                                <i className="icofont-plus-circle me-1 text-primary fs-4" />
                                                            </button> */}
                                                        {/* </div> */}
                                                        <div className="">
                                                            <h2 className="mb-4 text-center" style={{ color: 'rgba(54, 162, 235, 1)' }}>{totalProjects}</h2>
                                                            {/* <span className="text-muted mb-4">({(totalProjects / (totalProjects + totalTasks) * 100).toFixed(1)}%)</span> */}
                                                            {/* Project Progress Bar */}
                                                            <p>
                                                                <EmployeeProjectProgressBar projects={assignedProjects} />
                                                            </p>
                                                        </div>


                                                        <div className="table-responsive" style={{
                                                            height: '400px',
                                                            overflowY: 'auto',
                                                            msOverflowStyle: 'none',  /* IE and Edge */
                                                            scrollbarWidth: 'none',   /* Firefox */
                                                            '&::-webkit-scrollbar': {
                                                                display: 'none'       /* Chrome, Safari and Opera */
                                                            }
                                                        }}>
                                                            <table className="table table-hover">
                                                                <thead>
                                                                    <tr>
                                                                        <th>SR.No</th>
                                                                        <th>Project Name</th>
                                                                        <th>Team Size</th>
                                                                        <th>Progress</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {assignedProjects.map((project, index) => (
                                                                        <tr key={project._id}>
                                                                            <td>{index + 1}</td>
                                                                            <td>
                                                                                <span className="text-primary">
                                                                                    {project.projectName}
                                                                                </span>
                                                                            </td>
                                                                            <td>{project.taskAssignPerson?.length || 0}</td>
                                                                            <td>
                                                                                <div className="progress" style={{ height: '5px' }}>
                                                                                    <div
                                                                                        className={`progress-bar ${parseFloat(project.progress) === 100
                                                                                            ? 'bg-success'
                                                                                            : parseFloat(project.progress) > 50
                                                                                                ? 'bg-info'
                                                                                                : 'bg-warning'
                                                                                            }`}
                                                                                        role="progressbar"
                                                                                        style={{ width: `${project.progress}%` }}
                                                                                        aria-valuenow={project.progress}
                                                                                        aria-valuemin="0"
                                                                                        aria-valuemax="100"
                                                                                    ></div>
                                                                                </div>
                                                                                <small className="text-muted">{project.progress}%</small>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12 col-md-6 mb-4">
                                                <div className="card shadow-lg">
                                                    <div className="card-body">
                                                        <h5 className="card-title text-center">Total Tasks Assigned</h5>

                                                        <div className="">
                                                            <h2 className="mb-4 text-center" style={{ color: 'rgba(54, 162, 235, 1)' }}>{totalTasks}</h2>
                                                            {/* <span className="text-muted mb-4">({(totalTasks / (totalProjects + totalTasks) * 100).toFixed(1)}%)</span> */}
                                                            {/* Task Progress Bar */}
                                                            <p>
                                                                <EmployeeTaskProgressBar tasks={assignedTasks} />
                                                            </p>
                                                        </div>

                                                        <div className="table-responsive" style={{
                                                            height: '400px',
                                                            overflowY: 'auto',
                                                            msOverflowStyle: 'none',  /* IE and Edge */
                                                            scrollbarWidth: 'none',   /* Firefox */
                                                            '&::-webkit-scrollbar': {
                                                                display: 'none'       /* Chrome, Safari and Opera */
                                                            }
                                                        }}>
                                                            <table className="table table-hover">
                                                                <thead>
                                                                    <tr>
                                                                        <th>SR.No</th>
                                                                        <th>Task Name</th>
                                                                        <th>Project</th>
                                                                        <th>Status</th>
                                                                        {/* <th>Priority</th> */}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {assignedTasks.map((task, index) => (
                                                                        <tr key={task._id}>
                                                                            <td>{index + 1}</td>
                                                                            <td>
                                                                                <span className="text-primary">
                                                                                    {task.description}
                                                                                </span>
                                                                            </td>
                                                                            <td>{task.projectName}</td>
                                                                            <td>
                                                                                <span className={`badge ${task.isCompleted
                                                                                    ? 'bg-success'
                                                                                    : task.taskStatus === 'In Progress'
                                                                                        ? 'bg-warning'
                                                                                        : 'bg-secondary'
                                                                                    }`}>
                                                                                    {task.isCompleted
                                                                                        ? 'Completed'
                                                                                        : task.taskStatus || 'Not Started'}
                                                                                </span>
                                                                            </td>
                                                                            {/* <td>
                                                                                <span className={`badge ${
                                                                                    task.taskPriority === 'High' 
                                                                                        ? 'bg-danger'
                                                                                        : task.taskPriority === 'Medium'
                                                                                        ? 'bg-warning'
                                                                                        : 'bg-info'
                                                                                }`}>
                                                                                    {task.taskPriority}
                                                                                </span>
                                                                            </td> */}
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
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
                                                                        color: isLightColor(notepadColor) ? '#666' : '#ccc',
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
                                                                    value={notes}
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
                                                                        color: isLightColor(notepadColor) ? '#000' : '#fff'
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
                                                            <div className="position-relative btn-group">
                                                                <button
                                                                    className="btn btn-secondary btn-sm me-1"
                                                                    onClick={() => setShowNotePadPicker(!showNotePadPicker)}
                                                                    title="Change background color"
                                                                >
                                                                    <i className="bi bi-palette-fill"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-dark btn-sm"
                                                                    onClick={downloadNotePad}
                                                                    title="Download notepad"
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
                                                            <div className="d-flex">
                                                                {/* Text Formatting Controls */}
                                                                <div className="btn-group me-2">
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
                                                                <div className="btn-group me-2">
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


                                                                <div className='btn-group'>
                                                                    {/* Speech Controls */}
                                                                    <button
                                                                        className={`btn ${isListening ? 'btn-danger' : 'btn-primary'} btn-sm me-1`}
                                                                        onClick={toggleSpeechToText}
                                                                        title={isListening ? 'Stop recording' : 'Start speech to text'}
                                                                    >
                                                                        <i className={`bi ${isListening ? 'bi-mic-fill' : 'bi-mic'}`}></i>
                                                                    </button>

                                                                    <button
                                                                        className={`btn ${isSpeaking ? 'btn-danger' : 'btn-primary'} btn-sm me-1`}
                                                                        onClick={speakText}
                                                                        title={isSpeaking ? 'Stop speaking' : 'Read text aloud'}
                                                                    >
                                                                        <i className={`bi ${isSpeaking ? 'bi-volume-up-fill' : 'bi-volume-up'}`}></i>
                                                                    </button>

                                                                    {/* Zoom Controls */}
                                                                    <button
                                                                        className="btn btn-info btn-sm me-1"
                                                                        onClick={handleZoomIn}
                                                                        title="Zoom in"
                                                                        disabled={zoomLevel >= 200}
                                                                    >
                                                                        <i className="bi bi-zoom-in"></i>
                                                                    </button>

                                                                    <button
                                                                        className="btn btn-info btn-sm me-1"
                                                                        onClick={handleZoomOut}
                                                                        title="Zoom out"
                                                                        disabled={zoomLevel <= 50}
                                                                    >
                                                                        <i className="bi bi-zoom-out"></i>
                                                                    </button>

                                                                    {/* Fullscreen and Select All */}
                                                                    {/* <button
                                                                    className="btn btn-secondary btn-sm"
                                                                    onClick={toggleFullscreen}
                                                                    title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                                                                >
                                                                    <i className={`bi bi-${isFullscreen ? 'fullscreen-exit' : 'fullscreen'}`}></i>
                                                                </button> */}

                                                                    <button
                                                                        className="btn btn-secondary btn-sm me-1"
                                                                        onClick={handleSelectAll}
                                                                        title="Select all text"
                                                                    >
                                                                        <i className="bi bi-check-all"></i>
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Existing Clear */}
                                                            <div className="d-flex gap-2">
                                                                <button
                                                                    className="btn btn-danger btn-sm text-white"
                                                                    onClick={() => handleShowDeleteModal('notepad')}
                                                                    title="Clear notepad"
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
                                                <div className="card shadow-lg">
                                                    <div className="card-body" style={{ backgroundColor: todoColor }}>
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
                                                                                                                    onClick={() => handleShowDeleteModal('todo', index)}
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
                                                                                                        `${new Date(todo.createdAt).toLocaleString()} (${getTimeAgo(todo.createdAt)})`
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
                                                                        className="btn btn-danger btn-sm text-white"
                                                                        onClick={() => handleShowDeleteModal('todo', 'all')}
                                                                    >
                                                                        <i className="bi bi-trash" title='Clear all'></i>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Excel Sheet */}
                                            <div className="card shadow-lg mb-5" style={{ backgroundColor: excelSheetColor }}>
                                                <div className="card-body" >
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
                                                                    <button
                                                                        className="btn btn-primary"
                                                                        onClick={addTable}
                                                                        title='Add New Table'
                                                                    >
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
                                                                                                        onClick={() => handleShowDeleteModal('excel-column', colIndex, tableIndex)}
                                                                                                        style={{ padding: '0px 2px', fontSize: '10px' }}
                                                                                                        title="Delete column"
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
                                                                                                    fontSize: '12px',
                                                                                                    position: 'sticky',
                                                                                                    left: 0,
                                                                                                    zIndex: 1
                                                                                                }}>
                                                                                                    {rowIndex + 1}
                                                                                                    <button
                                                                                                        className="btn text-danger btn-sm ms-1"
                                                                                                        onClick={() => handleShowDeleteModal('excel-row', rowIndex, tableIndex)}
                                                                                                        style={{ padding: '0px 2px', fontSize: '10px' }}
                                                                                                        title="Delete row"
                                                                                                    >
                                                                                                        ×
                                                                                                    </button>
                                                                                                </td>
                                                                                                {Array(table.cols).fill().map((_, colIndex) => (
                                                                                                    <td
                                                                                                        key={colIndex}
                                                                                                        style={{
                                                                                                            ...styles.resizableCell,
                                                                                                            width: columnWidths[`${tableIndex}-${colIndex}`] || '80px',
                                                                                                            maxWidth: 'none',
                                                                                                            position: 'relative'
                                                                                                        }}
                                                                                                    >
                                                                                                        <div
                                                                                                            className="d-flex align-items-center"
                                                                                                            style={{
                                                                                                                position: 'relative',
                                                                                                                height: rowHeights[`${tableIndex}-${rowIndex}`] || '22px',
                                                                                                                width: '100%'
                                                                                                            }}
                                                                                                        >
                                                                                                            <textarea
                                                                                                                data-cell={`${tableIndex}-${rowIndex}-${colIndex}`}
                                                                                                                value={typeof table.data[rowIndex][colIndex] === 'object' && table.data[rowIndex][colIndex] !== null
                                                                                                                    ? (document.activeElement === document.querySelector(`[data-cell="${tableIndex}-${rowIndex}-${colIndex}"]`)
                                                                                                                        ? table.data[rowIndex][colIndex].formula
                                                                                                                        : table.data[rowIndex][colIndex].value)
                                                                                                                    : (table.data[rowIndex][colIndex] || '')}
                                                                                                                onChange={(e) => handleCellChange(tableIndex, rowIndex, colIndex, e.target.value)}
                                                                                                                onKeyDown={(e) => handleCellKeyDown(e, tableIndex, rowIndex, colIndex)}
                                                                                                                onMouseDown={() => handleCellMouseDown(tableIndex, rowIndex, colIndex)}
                                                                                                                onMouseEnter={() => handleCellMouseEnter(tableIndex, rowIndex, colIndex)}
                                                                                                                className={`cell-input ${isCellSelected(tableIndex, rowIndex, colIndex) ? 'selected-cell' : ''}`}
                                                                                                                style={{
                                                                                                                    width: '100%',
                                                                                                                    height: '100%',
                                                                                                                    padding: '1px 2px',
                                                                                                                    border: 'none',
                                                                                                                    background: 'transparent',
                                                                                                                    resize: 'none',
                                                                                                                    overflow: 'hidden',
                                                                                                                    fontSize: '12px',
                                                                                                                    color: isValidUrl(table.data[rowIndex][colIndex]) ? '#0d6efd' : (isLightColor(excelSheetColor) ? '#000' : '#fff'),
                                                                                                                    textDecoration: isValidUrl(table.data[rowIndex][colIndex]) ? 'underline' : 'none',
                                                                                                                    backgroundColor: isCellSelected(tableIndex, rowIndex, colIndex) ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
                                                                                                                }}
                                                                                                            />

                                                                                                            {/* Column resize handle */}
                                                                                                            <div
                                                                                                                className={`resize-handle ${resizing === 'column' ? 'active' : ''}`}
                                                                                                                onMouseDown={(e) => handleColumnResizeStart(e, tableIndex, colIndex)}
                                                                                                            />

                                                                                                            {/* Row resize handle */}
                                                                                                            <div
                                                                                                                style={styles.rowResizeHandle}
                                                                                                                onMouseDown={(e) => handleRowResizeStart(e, tableIndex, rowIndex)}
                                                                                                                className={resizing === 'row' ? 'active' : ''}
                                                                                                            />

                                                                                                            {/* Add Apply Formula Button */}
                                                                                                            {(typeof table.data[rowIndex][colIndex] === 'string' ||
                                                                                                                (typeof table.data[rowIndex][colIndex] === 'object' &&
                                                                                                                    table.data[rowIndex][colIndex]?.formula)) &&
                                                                                                                (table.data[rowIndex][colIndex]?.formula?.startsWith('=') ||
                                                                                                                    (typeof table.data[rowIndex][colIndex] === 'string' &&
                                                                                                                        table.data[rowIndex][colIndex].startsWith('='))) &&
                                                                                                                // Only show button if it's a string (not yet applied) or if we're actively editing
                                                                                                                (typeof table.data[rowIndex][colIndex] === 'string' ||
                                                                                                                    document.activeElement === document.querySelector(`[data-cell="${tableIndex}-${rowIndex}-${colIndex}"]`)) && (
                                                                                                                    <button
                                                                                                                        className="btn btn-sm btn-success"
                                                                                                                        style={{
                                                                                                                            position: 'absolute',
                                                                                                                            right: '-60px',
                                                                                                                            padding: '0px 5px',
                                                                                                                            fontSize: '10px',
                                                                                                                            height: '20px',
                                                                                                                            lineHeight: '20px',
                                                                                                                            zIndex: 1000
                                                                                                                        }}
                                                                                                                        onClick={() => handleApplyFormula(tableIndex, rowIndex, colIndex)}
                                                                                                                        title="Apply Formula"
                                                                                                                    >
                                                                                                                        Apply
                                                                                                                    </button>
                                                                                                                )}

                                                                                                            {/* Existing URL icon code */}
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

                                                                                <div className='btn-group'>
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
                                                                                        className="btn btn-secondary me-1"
                                                                                        onClick={() => addColumn(tableIndex)}
                                                                                        title='Add New Column In Table'
                                                                                    >
                                                                                        <i className="icofont-plus me-1" />
                                                                                        <span className="">Column</span>
                                                                                    </button>
                                                                                </div>

                                                                                <div className='btn-group'>
                                                                                    <button
                                                                                        className="btn btn-danger me-1 text-white"
                                                                                        onClick={() => handleShowDeleteModal('excel-clear', tableIndex)}
                                                                                        title='Clear All Table Value'
                                                                                    >
                                                                                        <i className="icofont-eraser me-1" />
                                                                                        <span className="">Erase</span>
                                                                                    </button>
                                                                                    {tables.length > 1 && (
                                                                                        <button
                                                                                            className="btn btn-danger"
                                                                                            onClick={() => handleShowDeleteModal('excel-table', tableIndex)}
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
                <FloatingMenu userType="admin" isMobile={isMobile} />
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


            {/* Add Bank Details Modal */}
            <div className="modal fade" id="bankDetailsModal" tabIndex="-1" aria-hidden="true" style={{ zIndex: 9998 }}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content" style={{ marginLeft: "100px" }}>
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
                                {/* Bank Name */}
                                <div className="col-md-6">
                                    <div className="bank-info-item p-3 border rounded h-100">
                                        <i className="bi bi-bank fs-4 text-primary me-2"></i>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold">Bank Name</div>
                                            <div className="d-flex align-items-center">
                                                <span className="me-2">{employeeData?.bankDetails?.bankName || 'Not provided'}</span>
                                                {employeeData?.bankDetails?.bankName && (
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

                                {/* Account Holder */}
                                <div className="col-md-6">
                                    <div className="bank-info-item p-3 border rounded h-100">
                                        <i className="bi bi-person fs-4 text-success me-2"></i>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold">Account Holder</div>
                                            <div className="d-flex align-items-center">
                                                <span className="me-2">{employeeData?.bankDetails?.accountHolderName || 'Not provided'}</span>
                                                {employeeData?.bankDetails?.accountHolderName && (
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

                                {/* Account Number */}
                                <div className="col-md-6">
                                    <div className="bank-info-item p-3 border rounded h-100">
                                        <i className="bi bi-credit-card fs-4 text-info me-2"></i>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold">Account Number</div>
                                            <div className="d-flex align-items-center">
                                                <span className="me-2">{employeeData?.bankDetails?.accountNumber || 'Not provided'}</span>
                                                {employeeData?.bankDetails?.accountNumber && (
                                                    <i
                                                        className="bi bi-clipboard cursor-pointer"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(employeeData.bankDetails?.accountNumber || '');
                                                        }}
                                                        title="Copy Account Number"
                                                    ></i>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* IFSC Code */}
                                <div className="col-md-6">
                                    <div className="bank-info-item p-3 border rounded h-100">
                                        <i className="bi bi-building fs-4 text-warning me-2"></i>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold">IFSC Code</div>
                                            <div className="d-flex align-items-center">
                                                <span className="me-2">{employeeData?.bankDetails?.ifscCode || 'Not provided'}</span>
                                                {employeeData?.bankDetails?.ifscCode && (
                                                    <i
                                                        className="bi bi-clipboard cursor-pointer"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(employeeData.bankDetails?.ifscCode || '');
                                                        }}
                                                        title="Copy IFSC Code"
                                                    ></i>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Type */}
                                <div className="col-md-6">
                                    <div className="bank-info-item p-3 border rounded h-100">
                                        <i className="bi bi-wallet2 fs-4 text-danger me-2"></i>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold">Account Type</div>
                                            <div className="d-flex align-items-center">
                                                <span className="me-2">{employeeData?.bankDetails?.accountType || 'Not provided'}</span>
                                                {employeeData?.bankDetails?.accountType && (
                                                    <i
                                                        className="bi bi-clipboard cursor-pointer"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(employeeData.bankDetails?.accountType || '');
                                                        }}
                                                        title="Copy Account Type"
                                                    ></i>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* UPI ID */}
                                <div className="col-md-6">
                                    <div className="bank-info-item p-3 border rounded h-100">
                                        <i className="bi bi-phone fs-4 text-success me-2"></i>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold">UPI ID</div>
                                            <div className="d-flex align-items-center">
                                                <span className="me-2">{employeeData?.bankDetails?.upiId || 'Not provided'}</span>
                                                {employeeData?.bankDetails?.upiId && (
                                                    <i
                                                        className="bi bi-clipboard cursor-pointer"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(employeeData.bankDetails?.upiId || '');
                                                        }}
                                                        title="Copy UPI ID"
                                                    ></i>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment App */}
                                <div className="col-md-6">
                                    <div className="bank-info-item p-3 border rounded h-100">
                                        <i className="bi bi-app fs-4 text-primary me-2"></i>
                                        <div className="flex-grow-1">
                                            <div className="fw-bold">Payment App</div>
                                            <div className="d-flex align-items-center">
                                                <span className="me-2">{employeeData?.bankDetails?.paymentApp || 'Not provided'}</span>
                                                {employeeData?.bankDetails?.paymentApp && (
                                                    <i
                                                        className="bi bi-clipboard cursor-pointer"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(employeeData.bankDetails?.paymentApp || '');
                                                        }}
                                                        title="Copy Payment App"
                                                    ></i>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* QR Code */}
                                <div className="col-md-6">
                                    <div className="bank-info-item p-3 border rounded h-100">
                                        <i className="bi bi-qr-code fs-4 text-dark me-2"></i>
                                        <div>
                                            <div className="fw-bold">QR Code</div>
                                            <div className="d-flex align-items-center gap-2 mt-2">
                                                {employeeData?.bankDetails?.qrCode && (
                                                    <>
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
                                                                `qr_code${employeeData.bankDetails.qrCode.substring(employeeData.bankDetails.qrCode.lastIndexOf('.'))}`
                                                            )}
                                                            title="Download QR Code"
                                                        ></i>
                                                    </>
                                                )}
                                                {!employeeData?.bankDetails?.qrCode && (
                                                    <span>Not provided</span>
                                                )}
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
                            <h5 className="modal-title fw-bold">
                                Delete Confirmation
                            </h5>
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
                                {deleteAction.type === 'excel-row' && `Are you sure you want to delete row ${deleteAction.payload + 1}?`}
                                {deleteAction.type === 'excel-column' && `Are you sure you want to delete column ${getColumnLabel(deleteAction.payload)}?`}
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

            {/* Add this CSS style block at the bottom of your component, just before the closing tag */}
            <style>
                {`
                    .selected-cell {
                        background-color: rgba(0, 123, 255, 0.1) !important;
                    }

                    .cell-input {
                        user-select: none;
                    }

                    .cell-input:focus {
                        outline: 2px solid #007bff;
                    }
                `}
            </style>
        </>
    )
}

export default MemberDashboard
