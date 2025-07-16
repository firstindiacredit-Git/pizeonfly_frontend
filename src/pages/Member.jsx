import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Loading.css"
import { useNavigate } from "react-router-dom";
import FloatingMenu from '../Chats/FloatingMenu'

const Member = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [employeeProjects, setEmployeeProjects] = useState({});
  const [employeeTasks, setEmployeeTasks] = useState({});

  //CREATE EMPLOYEE
  const [formData, setFormData] = useState({
    employeeName: "",
    employeeCompany: "",
    employeeImage: null,
    resume: null,
    aadhaarCard: null,
    panCard: null,
    employeeId: "",
    joiningDate: "",
    password: "",
    emailid: "",
    phone: "+91 ",
    department: "",
    designation: "",
    description: "",
    linkedin: "",
    instagram: "",
    youtube: "",
    facebook: "",
    github: "",
    website: "",
    other: "",
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    accountType: "",
    upiId: "",
    qrCode: null,
    paymentApp: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    // Add basic fields
    formDataToSend.append('employeeName', formData.employeeName);
    formDataToSend.append('employeeId', formData.employeeId);
    formDataToSend.append('emailid', formData.emailid);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('department', formData.department);
    formDataToSend.append('designation', formData.designation);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('joiningDate', formData.joiningDate);

    // Add file fields - make sure these match exactly with Multer config
    if (formData.employeeImage) {
      formDataToSend.append('employeeImage', formData.employeeImage);
    }
    if (formData.resume) {
      formDataToSend.append('resume', formData.resume);
    }
    if (formData.aadhaarCard) {
      formDataToSend.append('aadhaarCard', formData.aadhaarCard);
    }
    if (formData.panCard) {
      formDataToSend.append('panCard', formData.panCard);
    }
    if (formData.qrCode) {
      formDataToSend.append('qrCode', formData.qrCode);
    }

    // Add social links
    formDataToSend.append('linkedin', formData.linkedin || '');
    formDataToSend.append('instagram', formData.instagram || '');
    formDataToSend.append('youtube', formData.youtube || '');
    formDataToSend.append('facebook', formData.facebook || '');
    formDataToSend.append('github', formData.github || '');
    formDataToSend.append('website', formData.website || '');
    formDataToSend.append('other', formData.other || '');

    // Add bank details
    formDataToSend.append('bankName', formData.bankName || '');
    formDataToSend.append('accountHolderName', formData.accountHolderName || '');
    formDataToSend.append('accountNumber', formData.accountNumber || '');
    formDataToSend.append('ifscCode', formData.ifscCode || '');
    formDataToSend.append('accountType', formData.accountType || '');
    formDataToSend.append('upiId', formData.upiId || '');
    formDataToSend.append('paymentApp', formData.paymentApp || '');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/employees`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      const newEmployee = response.data;
      setEmployees((prevEmployee) => [newEmployee, ...prevEmployee]);
      // Clear the form
      setFormData({
        employeeName: "",
        employeeCompany: "",
        employeeImage: null,
        resume: null,
        aadhaarCard: null,
        panCard: null,
        employeeId: "",
        joiningDate: "",
        password: "",
        emailid: "",
        phone: "+91 ",
        department: "",
        designation: "",
        description: "",
        linkedin: "",
        instagram: "",
        youtube: "",
        facebook: "",
        github: "",
        website: "",
        other: "",
        bankName: "",
        accountHolderName: "",
        accountNumber: "",
        ifscCode: "",
        accountType: "",
        upiId: "",
        qrCode: null,
        paymentApp: ""
      });

      // Close the modal programmatically
      const modalElement = document.getElementById("createemp");
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      modal.hide();

      toast.success("Employee Added Successfully!", {
        style: {
          backgroundColor: "#0d6efd",
          color: "white",
        },
      });
      // Reload the page after 5 seconds
      setTimeout(() => {
        window.location.reload();
      }, 5000);
      // Handle successful response
    } catch (error) {
      console.error("Error:", error);
      // Handle error
    }
  };

  // Add this function to fetch project counts for each employee
  const fetchEmployeeProjects = async (employeeId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/totalAssigneeProjects`,
        { _id: employeeId }
      );
      return response.data.totalProjects;
    } catch (error) {
      console.error("Error fetching project count:", error);
      return 0;
    }
  };

  // Add this function to fetch task counts for each employee
  const fetchEmployeeTasks = async (employeeId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}api/totalAssigneeTasks`,
        { _id: employeeId }
      );
      return response.data.totalTasks;
    } catch (error) {
      console.error("Error fetching task count:", error);
      return 0;
    }
  };

  // Modify the useEffect to fetch both projects and tasks
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}api/employees`
        );

        let lastOldId = 1;
        response.data.forEach((d) => {
          // Add null check and ensure employeeId exists and has the expected format
          if (d && d.employeeId && typeof d.employeeId === 'string') {
            const newId = parseInt(d.employeeId.slice(2), 10);
            if (!Number.isNaN(newId) && newId > lastOldId) {
              lastOldId = newId;
            }
          }
        });

        const newId = `PF00${lastOldId + 1}`;
        setFormData((prevFormData) => ({
          ...prevFormData,
          employeeId: newId,
        }));

        // Save the fetched employees
        const modifiedEmployees = response.data.map(employee => ({
          ...employee,
          employeeImage: employee.employeeImage ? employee.employeeImage.replace('uploads/', '') : ''
        }));

        // Fetch both project and task counts for each employee
        const projectCounts = {};
        const taskCounts = {};
        await Promise.all(
          modifiedEmployees.map(async (employee) => {
            const [projectCount, taskCount] = await Promise.all([
              fetchEmployeeProjects(employee._id),
              fetchEmployeeTasks(employee._id)
            ]);
            projectCounts[employee._id] = projectCount;
            taskCounts[employee._id] = taskCount;
          })
        );

        setEmployeeProjects(projectCounts);
        setEmployeeTasks(taskCounts);
        setEmployees(modifiedEmployees); // Set the modified employees
        setAllEmployees(modifiedEmployees); // Store the full list for global search

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  //DELETE EMPLOYEE
  const [deletableId, setDeletableId] = useState("");
  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}api/employees/` + deletableId
      );
      // console.log(response.data);
      // window.location.reload();
      const remainingEmployee = employees.filter((prevEmployee) => {
        return prevEmployee._id !== deletableId;
      });
      setEmployees(remainingEmployee);

      const modalElement = document.getElementById("deleteproject");
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      modal.hide();

      toast.error("Employee Deleted Successfully!", {
        style: {
          backgroundColor: "#0d6efd",
          color: "white",
        },
      });
      // Reload the page after 5 seconds
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // UPDATE EMPLOYEE
  const [employeeData, setEmployeeData] = useState({
    employeeName: "",
    employeeCompany: "",
    employeeImage: null,
    resume: null,
    aadhaarCard: null,
    panCard: null,
    employeeId: "",
    joiningDate: "",
    username: "",
    password: "",
    emailid: "",
    phone: "+91",
    department: "",
    designation: "",
    description: "",
    linkedin: "",
    instagram: "",
    youtube: "",
    facebook: "",
    github: "",
    website: "",
    other: "",
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    accountType: "",
    upiId: "",
    qrCode: null,
    paymentApp: ""
  });
  const [toEdit, setToEdit] = useState("");
  // console.log(projectFormData);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}api/employees/${toEdit}`
        );
        const { data } = response;
        let formattedDate = "";
        const fDate = (data) => {
          const sd = new Date(data);
          const sy = sd.getFullYear();
          const sm =
            sd.getMonth() + 1 < 10
              ? "0" + (Number(sd.getMonth()) + 1)
              : sd.getMonth();
          const sdd = sd.getDate() < 10 ? "0" + sd.getDate() : sd.getDate();
          formattedDate = `${sy}-${sm}-${sdd}`;
          return formattedDate;
        };
        const fStartDate = fDate(data.joiningDate);
        // console.log(fStartDate);
        setEmployeeData({
          employeeName: data.employeeName,
          employeeCompany: data.employeeCompany,
          employeeImage: data.employeeImage,
          resume: data.resume,
          aadhaarCard: data.aadhaarCard,
          panCard: data.panCard,
          employeeId: data.employeeId,
          joiningDate: fStartDate,
          username: data.username,
          password: data.password,
          emailid: data.emailid,
          phone: data.phone,
          department: data.department,
          designation: data.designation,
          description: data.description,
          linkedin: data.socialLinks?.linkedin || '',
          instagram: data.socialLinks?.instagram || '',
          youtube: data.socialLinks?.youtube || '',
          facebook: data.socialLinks?.facebook || '',
          github: data.socialLinks?.github || '',
          website: data.socialLinks?.website || '',
          other: data.socialLinks?.other || '',
          bankName: data.bankDetails?.bankName || '',
          accountHolderName: data.bankDetails?.accountHolderName || '',
          accountNumber: data.bankDetails?.accountNumber || '',
          ifscCode: data.bankDetails?.ifscCode || '',
          accountType: data.bankDetails?.accountType || '',
          upiId: data.bankDetails?.upiId || '',
          qrCode: data.bankDetails?.qrCode || null,
          paymentApp: data.bankDetails?.paymentApp || ''
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (toEdit) {
      fetchData();
    }
  }, [toEdit]);
  const updateChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      setEmployeeData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setEmployeeData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const getInitials = (name) => {
    if (!name) return 'E';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };
  
  // State to track broken images
  const [brokenImages, setBrokenImages] = useState({});

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setToEdit(employee._id); // <-- Add this line
    setEmployeeData({
      ...employee,
      linkedin: employee.socialLinks?.linkedin || '',
      instagram: employee.socialLinks?.instagram || '',
      youtube: employee.socialLinks?.youtube || '',
      facebook: employee.socialLinks?.facebook || '',
      github: employee.socialLinks?.github || '',
      website: employee.socialLinks?.website || '',
      other: employee.socialLinks?.other || '',
      bankName: employee.bankDetails?.bankName || '',
      accountHolderName: employee.bankDetails?.accountHolderName || '',
      accountNumber: employee.bankDetails?.accountNumber || '',
      ifscCode: employee.bankDetails?.ifscCode || '',
      accountType: employee.bankDetails?.accountType || '',
      upiId: employee.bankDetails?.upiId || '',
      paymentApp: employee.bankDetails?.paymentApp || ''
    });
  };

  // Add this function before the updateSubmit function
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}api/employees`
      );

      // Save the fetched employees
      const modifiedEmployees = response.data.map(employee => ({
        ...employee,
        employeeImage: employee.employeeImage ? employee.employeeImage.replace('uploads/', '') : ''
      }));

      // Fetch both project and task counts for each employee
      const projectCounts = {};
      const taskCounts = {};
      await Promise.all(
        modifiedEmployees.map(async (employee) => {
          const [projectCount, taskCount] = await Promise.all([
            fetchEmployeeProjects(employee._id),
            fetchEmployeeTasks(employee._id)
          ]);
          projectCounts[employee._id] = projectCount;
          taskCounts[employee._id] = taskCount;
        })
      );

      setEmployeeProjects(projectCounts);
      setEmployeeTasks(taskCounts);
      setEmployees(modifiedEmployees);

    } catch (error) {
      console.error("Error:", error);
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const updateSubmit = async () => {
    try {
      const formData = new FormData();

      // Add basic fields
      Object.keys(employeeData).forEach(key => {
        if (employeeData[key] !== null &&
          key !== 'socialLinks' &&
          key !== '_id' &&
          key !== '__v' &&
          key !== 'createdAt' &&
          key !== 'updatedAt') {
          // Ensure social link values are strings
          if (typeof employeeData[key] === 'string') {
            formData.append(key, employeeData[key]);
          }
        }
      });

      // Add social links fields individually, ensuring they're strings
      formData.append('linkedin', String(employeeData.linkedin || ''));
      formData.append('instagram', String(employeeData.instagram || ''));
      formData.append('youtube', String(employeeData.youtube || ''));
      formData.append('facebook', String(employeeData.facebook || ''));
      formData.append('github', String(employeeData.github || ''));
      formData.append('website', String(employeeData.website || ''));
      formData.append('other', String(employeeData.other || ''));

      // Add files if they exist
      if (employeeData.employeeImage instanceof File) {
        formData.append('employeeImage', employeeData.employeeImage);
      }
      if (employeeData.resume instanceof File) {
        formData.append('resume', employeeData.resume);
      }
      if (employeeData.aadhaarCard instanceof File) {
        formData.append('aadhaarCard', employeeData.aadhaarCard);
      }
      if (employeeData.panCard instanceof File) {
        formData.append('panCard', employeeData.panCard);
      }

      // Add bank details
      formData.append('bankName', employeeData.bankName || '');
      formData.append('accountHolderName', employeeData.accountHolderName || '');
      formData.append('accountNumber', employeeData.accountNumber || '');
      formData.append('ifscCode', employeeData.ifscCode || '');
      formData.append('accountType', employeeData.accountType || '');
      formData.append('upiId', employeeData.upiId || '');
      formData.append('paymentApp', employeeData.paymentApp || '');

      if (employeeData.qrCode instanceof File) {
        formData.append('qrCode', employeeData.qrCode);
      }

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}api/employees/${toEdit}`, // Use toEdit instead of selectedEmployee._id
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        toast.success('Employee updated successfully!', {
          style: {
            backgroundColor: "#0d6efd",
            color: "white",
          },
        });
        // Close modal
        const modal = document.getElementById('editemp');
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        bootstrapModal.hide();

        // Refresh employee list
        await fetchEmployees();

        // Optional: Reload page after 5 seconds (keeping your existing pattern)
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error(error.response?.data?.message || 'Failed to update employee');
    }
  };

  // GET SINGLE EMPLOYEE
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = (searchQuery) => {
    if (!searchQuery) {
      setEmployees(allEmployees);
      return;
    }
    const lower = searchQuery.toLowerCase();
    const filtered = allEmployees.filter(emp =>
      (emp.employeeName && emp.employeeName.toLowerCase().includes(lower)) ||
      (emp.employeeId && emp.employeeId.toLowerCase().includes(lower)) ||
      (emp.emailid && emp.emailid.toLowerCase().includes(lower))
    );
    setEmployees(filtered);
  };

  const [selectedImageDetails, setSelectedImageDetails] = useState({ url: null, name: null });

  const handleImageClick = useCallback((imageUrl, employeeName) => {
    setSelectedImageDetails({ url: imageUrl, name: employeeName });
  }, []);

  const [pdfUrl, setPdfUrl] = useState(null);


  const handleFileClick = useCallback((e, fileUrl, fileType, employeeName) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileType === 'pdf') {
      setPdfUrl(fileUrl);
      setSelectedImageDetails(prev => ({ ...prev, name: employeeName }));
    } else {
      setSelectedImageDetails({ url: fileUrl, name: employeeName });
    }
  }, []);
  const closeImageModal = () => {
    setSelectedImageDetails({ url: null, name: null });
  };
  const closePdfViewer = () => {
    setPdfUrl(null);
  };

  const handleEmployeeClick = (employee) => {
    console.log(employee.employeeId)
    navigate('/members/MembersDashboard', {
      state: {
        employeeId: employee._id,
        employeeCode: employee.employeeId,
        employee
      }
    });
  };

  // Add useEffect for handling ESC key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        if (pdfUrl) {
          closePdfViewer();
        }
        if (selectedImageDetails.url) {
          closeImageModal();
        }
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [pdfUrl, selectedImageDetails.url]);

  // Add click handler functions for modal backdrop
  const handlePdfModalBackdropClick = (e) => {
    if (e.target.classList.contains('modal')) {
      closePdfViewer();
    }
  };

  const handleImageModalBackdropClick = (e) => {
    if (e.target.classList.contains('modal')) {
      closeImageModal();
    }
  };

  // Add this function near your other handler functions
  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}${fileUrl.replace('uploads/', '')}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed');
    }
  };

  // Add this new function to handle document deletion
  const handleDocumentDelete = async (employeeId, documentType) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}api/employees/${employeeId}/document`,
        { documentType }
      );

      if (response.status === 200) {
        // Update the local state to reflect the change
        setEmployees(employees.map(emp => {
          if (emp._id === employeeId) {
            return {
              ...emp,
              [documentType]: null
            };
          }
          return emp;
        }));

        toast.success('Document deleted successfully!', {
          style: {
            backgroundColor: "#0d6efd",
            color: "white",
          },
        });
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  // Add the toggleDisable function
  const toggleDisable = async (employee) => {
    const newDisabled = !employee.disabled;
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}api/employees/${employee._id}/disable`,
        { disabled: newDisabled }
      );
      // Update local state with the new employee data
      setEmployees(prev =>
        prev.map(emp =>
          emp._id === employee._id ? { ...emp, disabled: newDisabled } : emp
        )
      );
    } catch (error) {
      // handle error (optional: toast)
    }
  };

  return (
    <>
      <div id="mytask-layout">
        <Sidebar />
        {/* main body area */}
        <div className="main px-lg-4 px-md-4">
          {/* Body: Header */}
          <Header />
          <>
            {/* Body: Body */}
            <div className="body d-flex py-lg-3 py-md-2">
              <div className="container-xxl">
                <div className="row clearfix">
                  <div className="col-md-12">
                    <div className="card border-0 mb-4 no-bg">
                      <div className="card-header py-4 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between" style={{
                        borderBottom: '2px solid rgba(65, 105, 225, 0.2)',
                        backgroundColor: 'transparent',
                        padding: '0 0 20px 0'
                      }}>
                        <h3 className="flex-fill mb-3 mb-sm-0" style={{
                          fontWeight: '700',
                          color: '#333',
                          fontSize: '24px',
                          position: 'relative',
                          paddingLeft: '15px'
                        }}>
                          <span style={{
                            position: 'absolute',
                            left: '0',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '5px',
                            height: '24px',
                            background: 'linear-gradient(to bottom, #4169e1, #1e40af)',
                            borderRadius: '3px'
                          }}></span>
                          Employees
                        </h3>
                        <div className="col-auto d-flex">
                          <button
                            type="button"
                            className="btn mb-3 mb-sm-0 me-sm-3"
                            data-bs-toggle="modal"
                            data-bs-target="#createemp"
                            style={{
                              background: 'linear-gradient(135deg, #ff70b4, #ff69b4)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '10px 18px',
                              fontWeight: '600',
                              boxShadow: '0 4px 10px rgba(65, 105, 225, 0.2)',
                              transition: 'all 0.2s ease',
                              fontSize: '14px'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 6px 12px rgba(65, 105, 225, 0.3)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 4px 10px rgba(65, 105, 225, 0.2)';
                            }}
                          >
                            <i className="icofont-plus-circle me-2" style={{ fontSize: '16px' }} />
                            Add Employee
                          </button>
                        </div>
                      </div>

                      <div className="d-flex justify-content-between mt-3 border-bottom">
                        <div className="d-flex mb-3">
                          {viewMode === 'grid' ? (
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => setViewMode('list')}
                              title="Switch to List View"
                            >
                              <i className="bi bi-list-task"></i>
                            </button>
                          ) : (
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => setViewMode('grid')}
                              title="Switch to Grid View"
                            >
                              <i className="bi bi-grid-3x3-gap-fill"></i>
                            </button>
                          )}
                        </div>
                        <div className="order-0">
                          <form autoComplete="off" style={{margin:0}} onSubmit={e => e.preventDefault()}>
                            <div className="input-group" style={{
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                              borderRadius: '8px',
                              overflow: 'hidden'
                            }}>
                              <input
                                type="search"
                                className="form-control"
                                aria-label="search"
                                aria-describedby="addon-wrapping"
                                name="searchEmployee"
                                value={searchQuery}
                                onChange={(e) => {
                                  setSearchQuery(e.target.value);
                                  handleSearch(e.target.value);
                                }}
                                placeholder="Enter Employee Name"
                                autoComplete="new-password"
                                style={{
                                  border: '1px solid rgba(65, 105, 225, 0.2)',
                                  borderRight: 'none',
                                  padding: '10px 15px',
                                  fontSize: '14px',
                                  color: '#333',
                                  minWidth: '220px'
                                }}
                              />
                              <button
                                type="button"
                                className="input-group-text"
                                id="addon-wrapping"
                                onClick={handleSearch}
                                style={{
                                  backgroundColor: '#4169e1',
                                  border: 'none',
                                  color: 'white',
                                  padding: '0 15px',
                                  cursor: 'pointer'
                                }}
                              >
                                <i className="fa fa-search" />
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row End */}
                {loading ? (
                  <div className="custom-loader "></div>
                ) : (
                  viewMode === 'grid' ? (
                    <div className="row g-3 row-cols-1 row-cols-sm-1 row-cols-md-1 row-cols-lg-2 row-cols-xl-2 row-cols-xxl-2 row-deck py-1 pb-4">
                      {employees && employees.length > 0 ? employees.map((employee, index) => {
                        const newDate = new Date(employee?.joiningDate);
                        const date = newDate.getDate();
                        const month = newDate.getMonth() + 1; // months are 0-indexed
                        const year = newDate.getFullYear();
                        return (
                          <div className="col" key={employee.employeeId}>
                            <div className="card" style={{
                              borderRadius: '20px',
                              border: 'none',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                              transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                              overflow: 'hidden',
                              position: 'relative',
                              backgroundColor: employee.disabled ? '#f0f0f0' : '#ffffff',
                              opacity: employee.disabled ? 0.5 : 1
                            }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-10px)';
                                e.currentTarget.style.boxShadow = '0 20px 35px rgba(0,0,0,0.1)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)';
                              }}>
                              {/* Gradient Border Effect */}
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '6px',
                                background: 'linear-gradient(90deg, #4169e1, #1e40af, #ff69b4)',
                                opacity: 0.9
                              }}></div>

                              <div className="card-body" style={{ padding: '28px' }}>
                                {/* Header Section */}
                                <div className="d-flex align-items-center gap-4 mb-4">
                                  {/* Employee Number & Image */}
                                  <div className="d-flex align-items-center gap-4">
                                    <span style={{
                                      background: 'linear-gradient(135deg, #4169e1, #1e40af)',
                                      color: 'white',
                                      borderRadius: '12px',
                                      width: '40px',
                                      height: '40px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontWeight: '600',
                                      fontSize: '16px',
                                      boxShadow: '0 4px 15px rgba(65, 105, 225, 0.3)',
                                      border: '2px solid rgba(255, 255, 255, 0.8)'
                                    }}>
                                      {index + 1}
                                    </span>

                                    <div style={{
                                      width: '60px',
                                      height: '60px',
                                      borderRadius: '16px',
                                      overflow: 'hidden',
                                      border: '3px solid #ff69b4',
                                      backgroundColor: 'white',
                                      boxShadow: '0 4px 15px rgba(65, 105, 225, 0.2)'
                                    }}>
                                      {(!employee.employeeImage || brokenImages[employee._id]) ? (
                                        <div style={{
                                          width: '100%',
                                          height: '100%',
                                          background: '#ff69b4',
                                          color: 'white',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontWeight: '700',
                                          fontSize: '28px',
                                        }}
                                          title={employee.employeeName}
                                        >
                                          {getInitials(employee.employeeName)}
                                        </div>
                                      ) : (
                                        <img
                                          src={`${import.meta.env.VITE_BASE_URL}${employee.employeeImage}`}
                                          alt={employee.employeeName}
                                          style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            transition: 'transform 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)',
                                            cursor: 'pointer'
                                          }}
                                          onMouseEnter={(e) => {
                                            e.target.style.transform = 'scale(1.2) rotate(3deg)';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.target.style.transform = 'scale(1) rotate(0deg)';
                                          }}
                                          onClick={() => handleImageClick(
                                            `${import.meta.env.VITE_BASE_URL}${employee.employeeImage}`,
                                            employee.employeeName
                                          )}
                                          onError={() => setBrokenImages(prev => ({ ...prev, [employee._id]: true }))}
                                        />
                                      )}
                                    </div>
                                  </div>

                                  {/* Employee Name and Actions */}
                                  <div className="d-flex justify-content-between align-items-center flex-grow-1">
                                    <div>
                                      <div className="d-flex align-items-center gap-2 mb-1">
                                        <h5 className="mb-0" style={{
                                          color: '#1a1a1a',
                                          fontWeight: '700',
                                          fontSize: '18px',
                                          letterSpacing: '-0.3px',
                                          cursor: 'pointer'
                                        }}
                                          onClick={() => handleEmployeeClick(employee)}
                                          title="Click to View Employee Dashboard"
                                        >
                                          {employee.employeeName}
                                        </h5>
                                        {/* Social Media Icon */}
                                        {(employee.socialLinks?.linkedin || 
                                          employee.socialLinks?.instagram || 
                                          employee.socialLinks?.youtube || 
                                          employee.socialLinks?.facebook || 
                                          employee.socialLinks?.github || 
                                          employee.socialLinks?.website || 
                                          employee.socialLinks?.other) && (
                                          <button
                                            type="button"
                                            className="btn p-0"
                                            onClick={() => {
                                              setSelectedEmployee(employee);
                                              // Open modal programmatically after setting state
                                              setTimeout(() => {
                                                const modal = new window.bootstrap.Modal(document.getElementById('socialMediaModal'));
                                                modal.show();
                                              }, 100);
                                            }}
                                            style={{
                                              backgroundColor: 'transparent',
                                              border: 'none',
                                              padding: '0',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              transition: 'all 0.3s ease'
                                            }}
                                            title="View Social Media Links"
                                          >
                                            <i className="bi bi-share-fill" style={{ 
                                              color: '#ff69b4', 
                                              fontSize: '10px',
                                              transition: 'all 0.3s ease'
                                            }}
                                              onMouseOver={(e) => {
                                                e.target.style.color = '#1e40af';
                                                e.target.style.transform = 'scale(1.2)';
                                              }}
                                              onMouseOut={(e) => {
                                                e.target.style.color = '#ff69b4';
                                                e.target.style.transform = 'scale(1)';
                                              }}
                                            ></i>
                                          </button>
                                        )}
                                      </div>
                                      <span style={{
                                        fontSize: '13px',
                                        color: '#666',
                                        fontWeight: '500'
                                      }}>
                                        Employee ID: {employee.employeeId}
                                      </span>
                                    </div>

                                    <div className="d-flex gap-2">
                                      <button
                                        type="button"
                                        className="btn"
                                        data-bs-toggle="modal"
                                        data-bs-target="#editemp"
                                        title="Edit Member"
                                        onClick={() => handleEditClick(employee)}
                                        style={{
                                          backgroundColor: 'rgba(65, 105, 225, 0.08)',
                                          color: '#1e40af',
                                          width: '38px',
                                          height: '38px',
                                          borderRadius: '12px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          border: 'none',
                                          transition: 'all 0.3s ease',
                                          pointerEvents: employee.disabled ? 'none' : 'auto',
                                          opacity: employee.disabled ? 0.5 : 1
                                        }}
                                        disabled={employee.disabled}
                                        onMouseOver={(e) => {
                                          e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.15)';
                                          e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseOut={(e) => {
                                          e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.08)';
                                          e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                      >
                                        <i className="icofont-edit" style={{ fontSize: '16px' }}></i>
                                      </button>

                                      <button
                                        type="button"
                                        className="btn"
                                        data-bs-toggle="modal"
                                        data-bs-target="#deleteproject"
                                        title="Delete Member"
                                        onClick={() => {
                                          setDeletableId(employee._id);
                                        }}
                                        style={{
                                          backgroundColor: 'rgba(255, 105, 180, 0.08)',
                                          color: '#ff69b4',
                                          width: '38px',
                                          height: '38px',
                                          borderRadius: '12px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          border: 'none',
                                          transition: 'all 0.3s ease',
                                          pointerEvents: employee.disabled ? 'none' : 'auto',
                                          opacity: employee.disabled ? 0.5 : 1
                                        }}
                                        disabled={employee.disabled}
                                        onMouseOver={(e) => {
                                          e.currentTarget.style.backgroundColor = 'rgba(255, 105, 180, 0.15)';
                                          e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseOut={(e) => {
                                          e.currentTarget.style.backgroundColor = 'rgba(255, 105, 180, 0.08)';
                                          e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                      >
                                        <i className="icofont-ui-delete" style={{ fontSize: '16px' }}></i>
                                      </button>
                                      <button
                                        type="button"
                                        className="btn"
                                        title={employee.disabled ? 'Enable Member' : 'Disable Member'}
                                        style={{
                                          backgroundColor: 'rgba(128,128,128,0.08)',
                                          color: '#888',
                                          width: '38px',
                                          height: '38px',
                                          borderRadius: '12px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          border: 'none',
                                          transition: 'all 0.3s ease'
                                        }}
                                        onClick={() => toggleDisable(employee)}
                                      >
                                        {employee.disabled ? (
                                          <i className="bi bi-toggle-off" style={{ fontSize: '20px' }}></i>
                                        ) : (
                                          <i className="bi bi-toggle-on" style={{ fontSize: '20px' }}></i>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Contact Info Cards - More Compact Design */}
                                <div className="d-flex gap-3 mb-4">
                                  <div style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(65, 105, 225, 0.04)',
                                    border: '1px solid rgba(65, 105, 225, 0.15)',
                                    transition: 'all 0.3s ease'
                                  }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.08)';
                                      e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.04)';
                                      e.currentTarget.style.transform = 'translateY(0)';
                                    }}>
                                    <div className="d-flex align-items-center">
                                      <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(65, 105, 225, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '10px'
                                      }}>
                                        <i className="bi bi-telephone-fill" style={{ color: '#1e40af', fontSize: '14px' }}></i>
                                      </div>
                                      <div style={{ minWidth: 0 }}>
                                        <div style={{
                                          fontSize: '11px',
                                          color: '#666',
                                          marginBottom: '2px',
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.5px'
                                        }}>Phone</div>
                                        <div style={{
                                          fontSize: '13px',
                                          fontWeight: '600',
                                          color: '#1a1a1a',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}>{employee.phone}</div>
                                      </div>
                                    </div>
                                  </div>

                                  <div style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(255, 105, 180, 0.04)',
                                    border: '1px solid rgba(255, 105, 180, 0.15)',
                                    transition: 'all 0.3s ease'
                                  }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(255, 105, 180, 0.08)';
                                      e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(255, 105, 180, 0.04)';
                                      e.currentTarget.style.transform = 'translateY(0)';
                                    }}>
                                    <div className="d-flex align-items-center">
                                      <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(255, 105, 180, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '10px'
                                      }}>
                                        <i className="bi bi-envelope-fill" style={{ color: '#ff69b4', fontSize: '14px' }}></i>
                                      </div>
                                      <div style={{ minWidth: 0 }}>
                                        <div style={{
                                          fontSize: '11px',
                                          color: '#666',
                                          marginBottom: '2px',
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.5px'
                                        }}>Email</div>
                                        <div style={{
                                          fontSize: '13px',
                                          fontWeight: '600',
                                          color: '#1a1a1a',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}>{employee.emailid}</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Department & Joining Date */}
                                <div className="d-flex gap-3 mb-4">
                                  <div style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(82, 180, 71, 0.04)',
                                    border: '1px solid rgba(82, 180, 71, 0.15)',
                                    transition: 'all 0.3s ease'
                                  }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.08)';
                                      e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.04)';
                                      e.currentTarget.style.transform = 'translateY(0)';
                                    }}>
                                    <div className="d-flex align-items-center">
                                      <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '10px'
                                      }}>
                                        <i className="bi bi-building" style={{ color: '#52b447', fontSize: '14px' }}></i>
                                      </div>
                                      <div style={{ minWidth: 0 }}>
                                        <div style={{
                                          fontSize: '11px',
                                          color: '#666',
                                          marginBottom: '2px',
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.5px'
                                        }}>Department</div>
                                        <div style={{
                                          fontSize: '13px',
                                          fontWeight: '600',
                                          color: '#1a1a1a',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}>{employee.department}</div>
                                      </div>
                                    </div>
                                  </div>

                                  <div style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(255, 94, 0, 0.04)',
                                    border: '1px solid rgba(255, 94, 0, 0.15)',
                                    transition: 'all 0.3s ease'
                                  }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(255, 94, 0, 0.08)';
                                      e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(255, 94, 0, 0.04)';
                                      e.currentTarget.style.transform = 'translateY(0)';
                                    }}>
                                    <div className="d-flex align-items-center">
                                      <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(255, 94, 0, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '10px'
                                      }}>
                                        <i className="bi bi-calendar-check-fill" style={{ color: '#ff5e00', fontSize: '14px' }}></i>
                                      </div>
                                      <div style={{ minWidth: 0 }}>
                                        <div style={{
                                          fontSize: '11px',
                                          color: '#666',
                                          marginBottom: '2px',
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.5px'
                                        }}>Joined</div>
                                        <div style={{
                                          fontSize: '13px',
                                          fontWeight: '600',
                                          color: '#1a1a1a',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis'
                                        }}>{date}/{month}/{year}</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Projects & Tasks Stats */}
                                <div className="d-flex gap-3 mb-4">
                                  <div style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(65, 105, 225, 0.04)',
                                    border: '1px solid rgba(65, 105, 225, 0.15)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                  }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.08)';
                                      e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.04)';
                                      e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                    onClick={() => navigate('/projects', { state: { employeeName: employee.employeeName } })}
                                  >
                                    <div className="d-flex align-items-center">
                                      <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(65, 105, 225, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '10px'
                                      }}>
                                        <i className="bi bi-folder-fill" style={{ color: '#1e40af', fontSize: '14px' }}></i>
                                      </div>
                                      <div style={{ minWidth: 0 }}>
                                        <div style={{
                                          fontSize: '11px',
                                          color: '#666',
                                          marginBottom: '2px',
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.5px'
                                        }}>Projects</div>
                                        <div style={{
                                          fontSize: '13px',
                                          fontWeight: '600',
                                          color: '#1a1a1a'
                                        }}>{employeeProjects[employee._id] || 0}</div>
                                      </div>
                                    </div>
                                  </div>

                                  <div style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '12px',
                                    backgroundColor: 'rgba(82, 180, 71, 0.04)',
                                    border: '1px solid rgba(82, 180, 71, 0.15)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                  }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.08)';
                                      e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.04)';
                                      e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                    onClick={() => navigate('/tasks', { state: { employeeName: employee.employeeName } })}
                                  >
                                    <div className="d-flex align-items-center">
                                      <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '10px'
                                      }}>
                                        <i className="bi bi-list-task" style={{ color: '#52b447', fontSize: '14px' }}></i>
                                      </div>
                                      <div style={{ minWidth: 0 }}>
                                        <div style={{
                                          fontSize: '11px',
                                          color: '#666',
                                          marginBottom: '2px',
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.5px'
                                        }}>Tasks</div>
                                        <div style={{
                                          fontSize: '13px',
                                          fontWeight: '600',
                                          color: '#1a1a1a'
                                        }}>{employeeTasks[employee._id] || 0}</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Bottom Actions */}
                                <div className="d-flex gap-3">
                                  <button
                                    type="button"
                                    className="btn flex-grow-1"
                                    onClick={() => {
                                      console.log("Bank Details button clicked for employee:", employee);
                                      setSelectedEmployee(employee);
                                      // Open modal programmatically after setting state
                                      setTimeout(() => {
                                        const modal = new window.bootstrap.Modal(document.getElementById('bankDetailsModal'));
                                        modal.show();
                                      }, 100);
                                    }}
                                    style={{
                                      backgroundColor: 'rgba(65, 105, 225, 0.08)',
                                      color: '#1e40af',
                                      border: 'none',
                                      borderRadius: '12px',
                                      padding: '12px 20px',
                                      fontSize: '14px',
                                      fontWeight: '600',
                                      transition: 'all 0.3s ease'
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.15)';
                                      e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.08)';
                                      e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                  >
                                    <i className="bi bi-bank me-2"></i>
                                    Bank Details
                                  </button>

                                  <button
                                    type="button"
                                    className="btn flex-grow-1"
                                    onClick={() => {
                                      console.log("Documents button clicked for employee:", employee);
                                      setSelectedEmployee(employee);
                                      // Open modal programmatically after setting state
                                      setTimeout(() => {
                                        const modal = new window.bootstrap.Modal(document.getElementById('viewDocumentsModal'));
                                        modal.show();
                                      }, 100);
                                    }}
                                    style={{
                                      backgroundColor: 'rgba(255, 105, 180, 0.08)',
                                      color: '#ff69b4',
                                      border: 'none',
                                      borderRadius: '12px',
                                      padding: '12px 20px',
                                      fontSize: '14px',
                                      fontWeight: '600',
                                      transition: 'all 0.3s ease'
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(255, 105, 180, 0.15)';
                                      e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(255, 105, 180, 0.08)';
                                      e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                  >
                                    <i className="bi bi-file-earmark-text me-2"></i>
                                    Documents
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }) : (
                        <div className="col-12 text-center py-5">
                          <i className="bi bi-search display-1 text-muted mb-3"></i>
                          <h4 className="text-muted">No employees found</h4>
                          <p className="text-muted">Try adjusting your search criteria</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="row clearfix g-3">
                      <div className="col-sm-12">
                        <div className="card mb-3">
                          <div className="card-body" style={{ padding: '0' }}>
                            <table className="table align-middle mb-0" style={{
                              width: "100%",
                              borderCollapse: 'separate',
                              borderSpacing: '0'
                            }}>
                              <thead>
                                <tr style={{ background: '#f8f9fa' }}>
                                  <th style={{
                                    padding: '16px 15px',
                                    fontWeight: '600',
                                    color: '#444',
                                    borderBottom: '2px solid rgba(65, 105, 225, 0.2)',
                                    textAlign: 'center',
                                    fontSize: '14px'
                                  }}>Sr.No.</th>
                                  <th style={{
                                    padding: '16px 15px',
                                    fontWeight: '600',
                                    color: '#444',
                                    borderBottom: '2px solid rgba(65, 105, 225, 0.2)',
                                    fontSize: '14px'
                                  }}>Employee Name</th>
                                  <th style={{
                                    padding: '16px 15px',
                                    fontWeight: '600',
                                    color: '#444',
                                    borderBottom: '2px solid rgba(65, 105, 225, 0.2)',
                                    fontSize: '14px'
                                  }}>Contact Info</th>
                                  <th style={{
                                    padding: '16px 15px',
                                    fontWeight: '600',
                                    color: '#444',
                                    borderBottom: '2px solid rgba(65, 105, 225, 0.2)',
                                    fontSize: '14px'
                                  }}>Department</th>
                                  <th style={{
                                    padding: '16px 15px',
                                    fontWeight: '600',
                                    color: '#444',
                                    borderBottom: '2px solid rgba(65, 105, 225, 0.2)',
                                    textAlign: 'center',
                                    fontSize: '14px'
                                  }}>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {employees && employees.length > 0 ? employees.map((employee, index) => {
                                  const newDate = new Date(employee?.joiningDate);
                                  const date = newDate.getDate();
                                  const month = newDate.getMonth() + 1;
                                  const year = newDate.getFullYear();
                                  return (
                                    <tr key={employee.employeeId}
                                      style={{
                                        transition: 'background 0.2s ease',
                                        background: employee.disabled ? '#f0f0f0' : 'transparent',
                                        opacity: employee.disabled ? 0.5 : 1
                                      }}
                                      onMouseOver={(e) => e.currentTarget.style.background = employee.disabled ? '#f0f0f0' : 'rgba(65, 105, 225, 0.04)'}
                                      onMouseOut={(e) => e.currentTarget.style.background = employee.disabled ? '#f0f0f0' : 'transparent'}
                                    >
                                      <td style={{
                                        padding: '16px 15px',
                                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                                        textAlign: 'center'
                                      }}>
                                        <span style={{
                                          background: 'linear-gradient(135deg, #4169e1, #1e40af)',
                                          color: 'white',
                                          borderRadius: '50%',
                                          width: '30px',
                                          height: '30px',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontWeight: '600',
                                          fontSize: '14px',
                                          boxShadow: '0 2px 5px rgba(65, 105, 225, 0.3)'
                                        }}>
                                          {index + 1}
                                        </span>
                                      </td>
                                      <td style={{
                                        padding: '16px 15px',
                                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                                      }}>
                                        <div className="d-flex align-items-center gap-3">
                                          {(!employee.employeeImage || brokenImages[employee._id]) ? (
                                            <div
                                              className="rounded-circle"
                                              style={{
                                                width: '40px',
                                                height: '40px',
                                                background: '#ff69b4',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: '700',
                                                fontSize: '18px',
                                              }}
                                              title={employee.employeeName}
                                            >
                                              {getInitials(employee.employeeName)}
                                            </div>
                                          ) : (
                                            <img
                                              src={`${import.meta.env.VITE_BASE_URL}${employee.employeeImage}`}
                                              alt={employee.employeeName}
                                              className="rounded-circle"
                                              style={{
                                                width: '40px',
                                                height: '40px',
                                                objectFit: 'cover',
                                                border: '2px solid #ff69b4',
                                                padding: '2px',
                                                cursor: 'pointer'
                                              }}
                                              onClick={() => handleImageClick(
                                                `${import.meta.env.VITE_BASE_URL}${employee.employeeImage}`,
                                                employee.employeeName
                                              )}
                                              onError={() => setBrokenImages(prev => ({ ...prev, [employee._id]: true }))}
                                            />
                                          )}
                                          <div>
                                            <div style={{
                                              fontWeight: '600',
                                              color: '#333',
                                              fontSize: '14px',
                                              cursor: 'pointer'
                                            }}
                                              onClick={() => handleEmployeeClick(employee)}
                                              title="Click to View Employee Dashboard"
                                            >{employee.employeeName}</div>
                                            <div style={{
                                              fontSize: '12px',
                                              color: '#666',
                                              marginTop: '2px'
                                            }}>ID: {employee.employeeId}</div>
                                          </div>
                                        </div>
                                      </td>
                                      <td style={{
                                        padding: '16px 15px',
                                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                                      }}>
                                        <div>
                                          <div style={{
                                            backgroundColor: 'rgba(65, 105, 225, 0.08)',
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            marginBottom: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                          }}>
                                            <i className="bi bi-telephone-fill" style={{ color: '#4169e1', fontSize: '14px' }}></i>
                                            <span style={{ fontSize: '13px', color: '#333' }}>{employee.phone}</span>
                                          </div>
                                          <div style={{
                                            backgroundColor: 'rgba(255, 105, 180, 0.08)',
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                          }}>
                                            <i className="bi bi-envelope-fill" style={{ color: '#ff69b4', fontSize: '14px' }}></i>
                                            <span style={{ fontSize: '13px', color: '#333' }}>{employee.emailid}</span>
                                          </div>
                                          <div style={{
                                            backgroundColor: 'rgba(255, 94, 0, 0.08)',
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            marginTop: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                          }}>
                                            <i className="bi bi-calendar-check-fill" style={{ color: '#ff5e00', fontSize: '14px' }}></i>
                                            <span style={{ fontSize: '13px', color: '#333' }}>{date}/{month}/{year}</span>
                                          </div>
                                        </div>
                                      </td>
                                      <td style={{
                                        padding: '16px 15px',
                                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                                      }}>
                                        <div style={{
                                          backgroundColor: 'rgba(82, 180, 71, 0.08)',
                                          padding: '6px 12px',
                                          borderRadius: '6px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '8px',
                                          marginBottom: '6px'
                                        }}>
                                          <i className="bi bi-building" style={{ color: '#52b447', fontSize: '14px' }}></i>
                                          <span style={{ fontSize: '13px', color: '#333' }}>{employee.department}</span>
                                        </div>
                                        <div style={{
                                          backgroundColor: 'rgba(65, 105, 225, 0.08)',
                                          padding: '6px 12px',
                                          borderRadius: '6px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '8px'
                                        }}>
                                          <i className="bi bi-person-badge" style={{ color: '#1e40af', fontSize: '14px' }}></i>
                                          <span style={{ fontSize: '13px', color: '#333' }}>{employee.designation}</span>
                                        </div>
                                      </td>
                                      <td style={{
                                        padding: '16px 15px',
                                        borderBottom: '1px solid rgba(0,0,0,0.05)',
                                        textAlign: 'center'
                                      }}>
                                        <div className="d-flex gap-2 justify-content-center">
                                          <button
                                            type="button"
                                            className="btn"
                                            onClick={() => {
                                              console.log("Bank Details button clicked for employee:", employee);
                                              setSelectedEmployee(employee);
                                              // Open modal programmatically after setting state
                                              setTimeout(() => {
                                                const modal = new window.bootstrap.Modal(document.getElementById('bankDetailsModal'));
                                                modal.show();
                                              }, 100);
                                            }}
                                            style={{
                                              backgroundColor: 'rgba(65, 105, 225, 0.1)',
                                              color: '#1e40af',
                                              width: '32px',
                                              height: '32px',
                                              borderRadius: '50%',
                                              padding: '0',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              border: 'none',
                                              transition: 'all 0.2s ease'
                                            }}
                                            onMouseOver={(e) => {
                                              e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.2)';
                                            }}
                                            onMouseOut={(e) => {
                                              e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.1)';
                                            }}
                                          >
                                            <i className="bi bi-bank"></i>
                                          </button>

                                          <button
                                            type="button"
                                            className="btn"
                                            onClick={() => {
                                              console.log("Documents button clicked for employee:", employee);
                                              setSelectedEmployee(employee);
                                              // Open modal programmatically after setting state
                                              setTimeout(() => {
                                                const modal = new window.bootstrap.Modal(document.getElementById('viewDocumentsModal'));
                                                modal.show();
                                              }, 100);
                                            }}
                                            style={{
                                              backgroundColor: 'rgba(255, 105, 180, 0.1)',
                                              color: '#ff69b4',
                                              width: '32px',
                                              height: '32px',
                                              borderRadius: '50%',
                                              padding: '0',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              border: 'none',
                                              transition: 'all 0.2s ease'
                                            }}
                                            onMouseOver={(e) => {
                                              e.currentTarget.style.backgroundColor = 'rgba(255, 105, 180, 0.2)';
                                            }}
                                            onMouseOut={(e) => {
                                              e.currentTarget.style.backgroundColor = 'rgba(255, 105, 180, 0.1)';
                                            }}
                                          >
                                            <i className="bi bi-file-earmark-text"></i>
                                          </button>

                                          <button
                                            type="button"
                                            className="btn"
                                            data-bs-toggle="modal"
                                            data-bs-target="#editemp"
                                            onClick={() => handleEditClick(employee)}
                                            style={{
                                              backgroundColor: 'rgba(65, 105, 225, 0.1)',
                                              color: '#1e40af',
                                              width: '32px',
                                              height: '32px',
                                              borderRadius: '50%',
                                              padding: '0',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              border: 'none',
                                              transition: 'all 0.2s ease'
                                            }}
                                            onMouseOver={(e) => {
                                              e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.2)';
                                            }}
                                            onMouseOut={(e) => {
                                              e.currentTarget.style.backgroundColor = 'rgba(65, 105, 225, 0.1)';
                                            }}
                                          >
                                            <i className="icofont-edit"></i>
                                          </button>

                                          <button
                                            type="button"
                                            className="btn"
                                            data-bs-toggle="modal"
                                            data-bs-target="#deleteproject"
                                            onClick={() => setDeletableId(employee._id)}
                                            style={{
                                              backgroundColor: 'rgba(255, 105, 180, 0.1)',
                                              color: '#ff69b4',
                                              width: '32px',
                                              height: '32px',
                                              borderRadius: '50%',
                                              padding: '0',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              border: 'none',
                                              transition: 'all 0.2s ease'
                                            }}
                                            onMouseOver={(e) => {
                                              e.currentTarget.style.backgroundColor = 'rgba(255, 105, 180, 0.2)';
                                            }}
                                            onMouseOut={(e) => {
                                              e.currentTarget.style.backgroundColor = 'rgba(255, 105, 180, 0.1)';
                                            }}
                                          >
                                            <i className="icofont-ui-delete"></i>
                                          </button>
                                          <button
                                            type="button"
                                            className="btn"
                                            title={employee.disabled ? 'Enable Member' : 'Disable Member'}
                                            style={{
                                              backgroundColor: 'rgba(128,128,128,0.08)',
                                              color: '#888',
                                              width: '32px',
                                              height: '32px',
                                              borderRadius: '50%',
                                              padding: '0',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              border: 'none',
                                              transition: 'all 0.2s ease'
                                            }}
                                            onClick={() => toggleDisable(employee)}
                                          >
                                            {employee.disabled ? (
                                              <i className="bi bi-toggle-off" style={{ fontSize: '18px' }}></i>
                                            ) : (
                                              <i className="bi bi-toggle-on" style={{ fontSize: '18px' }}></i>
                                            )}
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                }) : (
                                  <tr>
                                    <td colSpan="5" className="text-center py-5">
                                      <i className="bi bi-search display-4 text-muted mb-3"></i>
                                      <h4 className="text-muted">No employees found</h4>
                                      <p className="text-muted">Try adjusting your search criteria</p>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Update Employee*/}
            <div
              className="modal fade"
              id="editemp"
              tabIndex={-1}
              aria-hidden="true"
            >
              <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                <div className="modal-content" style={{
                  borderRadius: '15px',
                  border: 'none',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  overflow: 'hidden'
                }}>
                  <div className="modal-header" style={{
                    background: 'linear-gradient(135deg, #52b447, #429938)',
                    borderBottom: 'none',
                    padding: '20px 25px',
                    position: 'relative'
                  }}>
                    <h5 className="modal-title fw-bold" style={{ color: 'white', fontSize: '18px', fontWeight: 700 }}>
                      <i className="icofont-edit me-2"></i>
                      Edit Employee
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '50%',
                        padding: '8px',
                        opacity: '1',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                        e.currentTarget.style.transform = 'rotate(90deg)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                        e.currentTarget.style.transform = 'rotate(0deg)';
                      }}
                    />
                  </div>
                  <div className="modal-body" style={{ padding: '25px' }}>
                    {/* Employee Name */}
                    <div className="mb-4">
                      <label className="form-label" style={{
                        fontWeight: '600',
                        color: '#444',
                        fontSize: '14px',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        <i className="icofont-user" style={{ color: '#52b447' }}></i>
                        Employee Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Employee Name"
                        name="employeeName"
                        value={employeeData.employeeName}
                        onChange={updateChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid rgba(65, 105, 225, 0.3)',
                          padding: '10px 15px',
                          color: '#333',
                          boxShadow: 'none'
                        }}
                      />
                    </div>

                    {/* Profile Image */}
                    <div className="mb-4">
                      <label className="form-label" style={{
                        fontWeight: '600',
                        color: '#444',
                        fontSize: '14px',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        <i className="icofont-image" style={{ color: '#ff5e00' }}></i>
                        Profile Image <span className="text-danger">*</span>
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        name="employeeImage"
                        onChange={updateChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 94, 0, 0.3)',
                          padding: '10px 15px',
                          color: '#333',
                          boxShadow: 'none',
                          backgroundColor: 'rgba(255, 94, 0, 0.03)'
                        }}
                      />
                    </div>

                    {/* Contact Information */}
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label" style={{
                          fontWeight: '600',
                          color: '#444',
                          fontSize: '14px',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <i className="icofont-email" style={{ color: '#52b447' }}></i>
                          Email ID <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="Email ID"
                          name="emailid"
                          value={employeeData.emailid}
                          onChange={updateChange}
                          style={{
                            borderRadius: '8px',
                            border: '1px solid rgba(65, 105, 225, 0.3)',
                            padding: '10px 15px',
                            color: '#333',
                            boxShadow: 'none'
                          }}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label" style={{
                          fontWeight: '600',
                          color: '#444',
                          fontSize: '14px',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <i className="icofont-key" style={{ color: '#ff5e00' }}></i>
                          Password <span className="text-danger">*</span>
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Password"
                          name="password"
                          value={employeeData.password}
                          onChange={updateChange}
                          style={{
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 94, 0, 0.3)',
                            padding: '10px 15px',
                            color: '#333',
                            boxShadow: 'none',
                            backgroundColor: 'rgba(255, 94, 0, 0.03)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Employee ID & Joining Date */}
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label" style={{
                          fontWeight: '600',
                          color: '#444',
                          fontSize: '14px',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <i className="icofont-id-card" style={{ color: '#52b447' }}></i>
                          Employee ID <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Employee ID"
                          name="employeeId"
                          value={employeeData.employeeId}
                          onChange={updateChange}
                          disabled
                          style={{
                            borderRadius: '8px',
                            border: '1px solid rgba(65, 105, 225, 0.3)',
                            padding: '10px 15px',
                            color: '#333',
                            boxShadow: 'none',
                            backgroundColor: 'rgba(65, 105, 225, 0.05)'
                          }}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label" style={{
                          fontWeight: '600',
                          color: '#444',
                          fontSize: '14px',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <i className="icofont-calendar" style={{ color: '#ff5e00' }}></i>
                          Joining Date
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          name="joiningDate"
                          value={employeeData.joiningDate}
                          onChange={updateChange}
                          style={{
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 94, 0, 0.3)',
                            padding: '10px 15px',
                            color: '#333',
                            boxShadow: 'none',
                            backgroundColor: 'rgba(255, 94, 0, 0.03)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="mb-4">
                      <label className="form-label" style={{
                        fontWeight: '600',
                        color: '#444',
                        fontSize: '14px',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        <i className="icofont-phone" style={{ color: '#ff5e00' }}></i>
                        Phone Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter phone number"
                        maxLength={14}
                        name="phone"
                        value={employeeData.phone}
                        onChange={updateChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 94, 0, 0.3)',
                          padding: '10px 15px',
                          color: '#333',
                          boxShadow: 'none',
                          backgroundColor: 'rgba(255, 94, 0, 0.03)'
                        }}
                      />
                    </div>

                    {/* Department & Designation */}
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label" style={{
                          fontWeight: '600',
                          color: '#444',
                          fontSize: '14px',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <i className="icofont-building" style={{ color: '#52b447' }}></i>
                          Department
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter department"
                          name="department"
                          value={employeeData.department}
                          onChange={updateChange}
                          style={{
                            borderRadius: '8px',
                            border: '1px solid rgba(65, 105, 225, 0.3)',
                            padding: '10px 15px',
                            color: '#333',
                            boxShadow: 'none'
                          }}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label" style={{
                          fontWeight: '600',
                          color: '#444',
                          fontSize: '14px',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <i className="icofont-badge" style={{ color: '#ff5e00' }}></i>
                          Designation
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter designation"
                          name="designation"
                          value={employeeData.designation}
                          onChange={updateChange}
                          style={{
                            borderRadius: '8px',
                            border: '1px solid rgba(65, 105, 225, 0.3)',
                            padding: '10px 15px',
                            color: '#333',
                            boxShadow: 'none'
                          }}
                        />
                      </div>
                    </div>

                    {/* Social Media & Website Links */}
                    <div className="mb-3">
                      <label className="form-label">Social Media & Website Links</label>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-linkedin"></i></span>
                            <input
                              type="url"
                              className="form-control"
                              placeholder="LinkedIn Profile URL"
                              name="linkedin"
                              value={employeeData.linkedin || ''}
                              onChange={updateChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-instagram"></i></span>
                            <input
                              type="url"
                              className="form-control"
                              placeholder="Instagram Profile URL"
                              name="instagram"
                              value={employeeData.instagram || ''}
                              onChange={updateChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-youtube"></i></span>
                            <input
                              type="url"
                              className="form-control"
                              placeholder="YouTube Channel URL"
                              name="youtube"
                              value={employeeData.youtube || ''}
                              onChange={updateChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-facebook"></i></span>
                            <input
                              type="url"
                              className="form-control"
                              placeholder="Facebook Profile URL"
                              name="facebook"
                              value={employeeData.facebook || ''}
                              onChange={updateChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-github"></i></span>
                            <input
                              type="url"
                              className="form-control"
                              placeholder="GitHub Profile URL"
                              name="github"
                              value={employeeData.github || ''}
                              onChange={updateChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-globe"></i></span>
                            <input
                              type="url"
                              className="form-control"
                              placeholder="Personal Website URL"
                              name="website"
                              value={employeeData.website || ''}
                              onChange={updateChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-link-45deg"></i></span>
                            <input
                              type="url"
                              className="form-control"
                              placeholder="Other URL"
                              name="other"
                              value={employeeData.other || ''}
                              onChange={updateChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bank Details */}
                    <div className="mb-3">
                      <label className="form-label">Bank Details</label>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-bank"></i></span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Bank Name"
                              name="bankName"
                              value={employeeData.bankName || ''}
                              onChange={updateChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-person"></i></span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Account Holder Name"
                              name="accountHolderName"
                              value={employeeData.accountHolderName || ''}
                              onChange={updateChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-credit-card"></i></span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Account Number"
                              name="accountNumber"
                              value={employeeData.accountNumber || ''}
                              onChange={updateChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-building"></i></span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="IFSC Code"
                              name="ifscCode"
                              value={employeeData.ifscCode || ''}
                              onChange={updateChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-wallet2"></i></span>
                            <select
                              className="form-select"
                              name="accountType"
                              value={employeeData.accountType || ''}
                              onChange={updateChange}
                            >
                              <option value="">Select Account Type</option>
                              <option value="Savings">Savings</option>
                              <option value="Current">Current</option>
                              <option value="Salary">Salary</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-phone"></i></span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="UPI ID"
                              name="upiId"
                              value={employeeData.upiId || ''}
                              onChange={updateChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-qr-code"></i></span>
                            <input
                              type="file"
                              className="form-control"
                              name="qrCode"
                              onChange={updateChange}
                              accept="image/*"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-app"></i></span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Payment App (e.g., PayTM, PhonePe)"
                              name="paymentApp"
                              value={employeeData.paymentApp || ''}
                              onChange={updateChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-3">
                      <label className="form-label">Description (optional)</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Add any extra details about the employee"
                        name="description"
                        value={employeeData.description}
                        onChange={updateChange}
                      />
                    </div>

                    {/* Documents */}
                    <div className="mb-3">
                      <label className="form-label" style={{
                        fontWeight: '600',
                        color: '#444',
                        fontSize: '16px',
                        marginBottom: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <i className="bi bi-file-earmark-text" style={{ color: '#52b447' }}></i>
                        Documents
                      </label>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text">
                              <i className="bi bi-file-earmark-text"></i>
                            </span>
                            <input
                              type="file"
                              className="form-control"
                              name="resume"
                              onChange={updateChange}
                              accept=".pdf,.doc,.docx"
                              style={{
                                borderRadius: '8px',
                                border: '1px solid rgba(65, 105, 225, 0.3)',
                                padding: '10px 15px',
                                color: '#333',
                                boxShadow: 'none',
                                backgroundColor: 'rgba(65, 105, 225, 0.03)'
                              }}
                            />
                          </div>
                          <small className="text-muted">Resume (PDF, DOC, DOCX)</small>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text">
                              <i className="bi bi-card-text"></i>
                            </span>
                            <input
                              type="file"
                              className="form-control"
                              name="aadhaarCard"
                              onChange={updateChange}
                              accept=".pdf,.jpg,.jpeg,.png"
                              style={{
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 105, 180, 0.3)',
                                padding: '10px 15px',
                                color: '#333',
                                boxShadow: 'none',
                                backgroundColor: 'rgba(255, 105, 180, 0.03)'
                              }}
                            />
                          </div>
                          <small className="text-muted">Aadhaar Card (PDF, JPG, PNG)</small>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text">
                              <i className="bi bi-card-heading"></i>
                            </span>
                            <input
                              type="file"
                              className="form-control"
                              name="panCard"
                              onChange={updateChange}
                              accept=".pdf,.jpg,.jpeg,.png"
                              style={{
                                borderRadius: '8px',
                                border: '1px solid rgba(82, 180, 71, 0.3)',
                                padding: '10px 15px',
                                color: '#333',
                                boxShadow: 'none',
                                backgroundColor: 'rgba(82, 180, 71, 0.03)'
                              }}
                            />
                          </div>
                          <small className="text-muted">PAN Card (PDF, JPG, PNG)</small>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-3">
                      <label className="form-label">Description (optional)</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Add any extra details about the employee"
                        name="description"
                        value={employeeData.description}
                        onChange={updateChange}
                      />
                    </div>
                  </div>
                  <div className="modal-footer" style={{
                    borderTop: '1px solid rgba(65, 105, 225, 0.1)',
                    padding: '16px 25px'
                  }}>
                    <button
                      type="button"
                      className="btn"
                      data-bs-dismiss="modal"
                      style={{
                        backgroundColor: 'rgba(255, 94, 0, 0.1)',
                        color: '#ff5e00',
                        border: '1px solid rgba(255, 94, 0, 0.3)',
                        borderRadius: '8px',
                        padding: '8px 20px',
                        fontWeight: '600',
                        fontSize: '14px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 94, 0, 0.2)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 94, 0, 0.1)';
                      }}
                    >
                      <i className="icofont-close-circled me-2"></i>
                      Done
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={updateSubmit}
                      style={{
                        background: 'linear-gradient(135deg, #52b447, #429938)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 20px',
                        fontWeight: '600',
                        fontSize: '14px',
                        boxShadow: '0 4px 10px rgba(65, 105, 225, 0.2)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(65, 105, 225, 0.3)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 10px rgba(65, 105, 225, 0.2)';
                      }}
                    >
                      <i className="icofont-check-circled me-2"></i>
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Create Employee*/}
            <div
              className="modal fade"
              id="createemp"
              tabIndex={-1}
              aria-hidden="true"
            >
              <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                <div className="modal-content" style={{
                  borderRadius: '15px',
                  border: 'none',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  overflow: 'hidden'
                }}>
                  <div className="modal-header" style={{
                    background: 'linear-gradient(135deg, #52b447, #429938)',
                    borderBottom: 'none',
                    padding: '20px 25px',
                    position: 'relative'
                  }}>
                    <h5
                      className="modal-title fw-bold"
                      id="createprojectlLabel"
                      style={{
                        color: 'white',
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <i className="icofont-plus-circle" style={{ fontSize: '22px' }}></i>
                      Add Employee
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '50%',
                        padding: '8px',
                        opacity: '1',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                        e.currentTarget.style.transform = 'rotate(90deg)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                        e.currentTarget.style.transform = 'rotate(0deg)';
                      }}
                    />
                  </div>
                  <div className="modal-body" style={{ padding: '25px' }}>
                    {/* Employee Name */}
                    <div className="mb-4">
                      <label className="form-label" style={{
                        fontWeight: '600',
                        color: '#444',
                        fontSize: '14px',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        <i className="icofont-user" style={{ color: '#52b447' }}></i>
                        Employee Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Employee Name"
                        name="employeeName"
                        value={formData.employeeName}
                        onChange={handleChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid rgba(65, 105, 225, 0.3)',
                          padding: '10px 15px',
                          color: '#333',
                          boxShadow: 'none'
                        }}
                      />
                    </div>

                    {/* Profile Image */}
                    <div className="mb-4">
                      <label className="form-label" style={{
                        fontWeight: '600',
                        color: '#444',
                        fontSize: '14px',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        <i className="icofont-image" style={{ color: '#ff5e00' }}></i>
                        Profile Image <span className="text-danger">*</span>
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        name="employeeImage"
                        onChange={handleFileChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 94, 0, 0.3)',
                          padding: '10px 15px',
                          color: '#333',
                          boxShadow: 'none',
                          backgroundColor: 'rgba(255, 94, 0, 0.03)'
                        }}
                      />
                    </div>

                    {/* Contact Information */}
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label" style={{
                          fontWeight: '600',
                          color: '#444',
                          fontSize: '14px',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <i className="icofont-email" style={{ color: '#52b447' }}></i>
                          Email ID <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="Email ID"
                          name="emailid"
                          value={formData.emailid}
                          onChange={handleChange}
                          style={{
                            borderRadius: '8px',
                            border: '1px solid rgba(65, 105, 225, 0.3)',
                            padding: '10px 15px',
                            color: '#333',
                            boxShadow: 'none'
                          }}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label" style={{
                          fontWeight: '600',
                          color: '#444',
                          fontSize: '14px',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <i className="icofont-key" style={{ color: '#ff5e00' }}></i>
                          Password <span className="text-danger">*</span>
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          style={{
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 94, 0, 0.3)',
                            padding: '10px 15px',
                            color: '#333',
                            boxShadow: 'none',
                            backgroundColor: 'rgba(255, 94, 0, 0.03)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Employee ID & Joining Date */}
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label" style={{
                          fontWeight: '600',
                          color: '#444',
                          fontSize: '14px',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <i className="icofont-id-card" style={{ color: '#52b447' }}></i>
                          Employee ID <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Employee ID"
                          name="employeeId"
                          value={formData.employeeId}
                          onChange={handleChange}
                          disabled
                          style={{
                            borderRadius: '8px',
                            border: '1px solid rgba(65, 105, 225, 0.3)',
                            padding: '10px 15px',
                            color: '#333',
                            boxShadow: 'none',
                            backgroundColor: 'rgba(65, 105, 225, 0.05)'
                          }}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label" style={{
                          fontWeight: '600',
                          color: '#444',
                          fontSize: '14px',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <i className="icofont-calendar" style={{ color: '#ff5e00' }}></i>
                          Joining Date
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          name="joiningDate"
                          value={formData.joiningDate}
                          onChange={handleChange}
                          style={{
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 94, 0, 0.3)',
                            padding: '10px 15px',
                            color: '#333',
                            boxShadow: 'none',
                            backgroundColor: 'rgba(255, 94, 0, 0.03)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="mb-4">
                      <label className="form-label" style={{
                        fontWeight: '600',
                        color: '#444',
                        fontSize: '14px',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        <i className="icofont-phone" style={{ color: '#ff5e00' }}></i>
                        Phone Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter phone number"
                        maxLength={14}
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 94, 0, 0.3)',
                          padding: '10px 15px',
                          color: '#333',
                          boxShadow: 'none',
                          backgroundColor: 'rgba(255, 94, 0, 0.03)'
                        }}
                      />
                    </div>

                    {/* Department & Designation */}
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label" style={{
                          fontWeight: '600',
                          color: '#444',
                          fontSize: '14px',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <i className="icofont-building" style={{ color: '#52b447' }}></i>
                          Department
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter department"
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          style={{
                            borderRadius: '8px',
                            border: '1px solid rgba(65, 105, 225, 0.3)',
                            padding: '10px 15px',
                            color: '#333',
                            boxShadow: 'none'
                          }}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label" style={{
                          fontWeight: '600',
                          color: '#444',
                          fontSize: '14px',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <i className="icofont-badge" style={{ color: '#ff5e00' }}></i>
                          Designation
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter designation"
                          name="designation"
                          value={formData.designation}
                          onChange={handleChange}
                          style={{
                            borderRadius: '8px',
                            border: '1px solid rgba(65, 105, 225, 0.3)',
                            padding: '10px 15px',
                            color: '#333',
                            boxShadow: 'none'
                          }}
                        />
                      </div>
                    </div>

                    {/* Social Media & Website Links */}
                    <div className="mb-3">
                      <label className="form-label">Social Media & Website Links</label>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-linkedin"></i></span>
                            <input
                              type="url"
                              className="form-control"
                              placeholder="LinkedIn Profile URL"
                              name="linkedin"
                              value={formData.linkedin || ''}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-instagram"></i></span>
                            <input
                              type="url"
                              className="form-control"
                              placeholder="Instagram Profile URL"
                              name="instagram"
                              value={formData.instagram || ''}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-youtube"></i></span>
                            <input
                              type="url"
                              className="form-control"
                              placeholder="YouTube Channel URL"
                              name="youtube"
                              value={formData.youtube || ''}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-facebook"></i></span>
                            <input
                              type="url"
                              className="form-control"
                              placeholder="Facebook Profile URL"
                              name="facebook"
                              value={formData.facebook || ''}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-github"></i></span>
                            <input
                              type="url"
                              className="form-control"
                              placeholder="GitHub Profile URL"
                              name="github"
                              value={formData.github || ''}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-globe"></i></span>
                            <input
                              type="url"
                              className="form-control"
                              placeholder="Personal Website URL"
                              name="website"
                              value={formData.website || ''}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-link-45deg"></i></span>
                            <input
                              type="url"
                              className="form-control"
                              placeholder="Other URL"
                              name="other"
                              value={formData.other || ''}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bank Details */}
                    <div className="mb-3">
                      <label className="form-label">Bank Details</label>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-bank"></i></span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Bank Name"
                              name="bankName"
                              value={formData.bankName || ''}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-person"></i></span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Account Holder Name"
                              name="accountHolderName"
                              value={formData.accountHolderName || ''}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-credit-card"></i></span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Account Number"
                              name="accountNumber"
                              value={formData.accountNumber || ''}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-building"></i></span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="IFSC Code"
                              name="ifscCode"
                              value={formData.ifscCode || ''}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-wallet2"></i></span>
                            <select
                              className="form-select"
                              name="accountType"
                              value={formData.accountType || ''}
                              onChange={handleChange}
                            >
                              <option value="">Select Account Type</option>
                              <option value="Savings">Savings</option>
                              <option value="Current">Current</option>
                              <option value="Salary">Salary</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-phone"></i></span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="UPI ID"
                              name="upiId"
                              value={formData.upiId || ''}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-qr-code"></i></span>
                            <input
                              type="file"
                              className="form-control"
                              name="qrCode"
                              onChange={handleFileChange}
                              accept="image/*"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text"><i className="bi bi-app"></i></span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Payment App (e.g., PayTM, PhonePe)"
                              name="paymentApp"
                              value={formData.paymentApp || ''}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-3">
                      <label className="form-label">Description (optional)</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Add any extra details about the employee"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Documents */}
                    <div className="mb-3">
                      <label className="form-label" style={{
                        fontWeight: '600',
                        color: '#444',
                        fontSize: '16px',
                        marginBottom: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <i className="bi bi-file-earmark-text" style={{ color: '#52b447' }}></i>
                        Documents
                      </label>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text">
                              <i className="bi bi-file-earmark-text"></i>
                            </span>
                            <input
                              type="file"
                              className="form-control"
                              name="resume"
                              onChange={handleFileChange}
                              accept=".pdf,.doc,.docx"
                              style={{
                                borderRadius: '8px',
                                border: '1px solid rgba(65, 105, 225, 0.3)',
                                padding: '10px 15px',
                                color: '#333',
                                boxShadow: 'none',
                                backgroundColor: 'rgba(65, 105, 225, 0.03)'
                              }}
                            />
                          </div>
                          <small className="text-muted">Resume (PDF, DOC, DOCX)</small>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text">
                              <i className="bi bi-card-text"></i>
                            </span>
                            <input
                              type="file"
                              className="form-control"
                              name="aadhaarCard"
                              onChange={handleFileChange}
                              accept=".pdf,.jpg,.jpeg,.png"
                              style={{
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 105, 180, 0.3)',
                                padding: '10px 15px',
                                color: '#333',
                                boxShadow: 'none',
                                backgroundColor: 'rgba(255, 105, 180, 0.03)'
                              }}
                            />
                          </div>
                          <small className="text-muted">Aadhaar Card (PDF, JPG, PNG)</small>
                        </div>
                        <div className="col-md-6">
                          <div className="input-group mb-3">
                            <span className="input-group-text">
                              <i className="bi bi-card-heading"></i>
                            </span>
                            <input
                              type="file"
                              className="form-control"
                              name="panCard"
                              onChange={handleFileChange}
                              accept=".pdf,.jpg,.jpeg,.png"
                              style={{
                                borderRadius: '8px',
                                border: '1px solid rgba(82, 180, 71, 0.3)',
                                padding: '10px 15px',
                                color: '#333',
                                boxShadow: 'none',
                                backgroundColor: 'rgba(82, 180, 71, 0.03)'
                              }}
                            />
                          </div>
                          <small className="text-muted">PAN Card (PDF, JPG, PNG)</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
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
                      className="btn btn-primary"
                      onClick={handleSubmit}
                    >
                      Create Employee
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        </div>
      </div>
      <ToastContainer />
      <FloatingMenu userType="admin" isMobile={isMobile} />
      {/* Modal  Delete Folder/ File*/}
      <div
        className="modal fade"
        id="deleteproject"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
          <div className="modal-content" style={{
            borderRadius: '15px',
            border: 'none',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}>
            <div className="modal-header" style={{
              background: 'linear-gradient(135deg, #ff70b4, #ff69b4)',
              borderBottom: 'none',
              padding: '20px 25px',
              position: 'relative'
            }}>
              <h5
                className="modal-title fw-bold"
                id="deleteprojectLabel"
                style={{ color: 'white', fontSize: '18px', fontWeight: 700 }}
              >
                <i className="icofont-ui-delete me-2"></i>
                Delete item Permanently?
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '50%',
                  padding: '8px',
                  opacity: '1',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                  e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}
              />
            </div>
            <div className="modal-body justify-content-center flex-column d-flex">
              <i className="icofont-ui-delete text-danger display-2 text-center mt-2" />
              <p className="mt-4 fs-5 text-center">
                You can only delete this item Permanently
              </p>
            </div>
            <div className="modal-footer" style={{
              borderTop: '1px solid rgba(255, 105, 180, 0.1)',
              padding: '16px 25px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button
                type="button"
                className="btn"
                data-bs-dismiss="modal"
                style={{
                  backgroundColor: 'rgba(255, 94, 0, 0.1)',
                  color: '#ff5e00',
                  border: '1px solid rgba(255, 94, 0, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  marginRight: '10px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 94, 0, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 94, 0, 0.1)';
                }}
              >
                <i className="icofont-close-circled me-2"></i>
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                style={{
                  background: 'linear-gradient(135deg, #ff70b4, #ff69b4)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontWeight: '600',
                  fontSize: '14px',
                  boxShadow: '0 4px 10px rgba(255, 105, 180, 0.2)',
                  transition: 'all 0.2s ease'
                }}
                onClick={handleDelete}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(255, 105, 180, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(255, 105, 180, 0.2)';
                }}
              >
                <i className="icofont-ui-delete me-2"></i>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Bank Details Modal */}
      <div
        className="modal fade"
        id="bankDetailsModal"
        tabIndex={-1}
        aria-hidden="true"
        style={{ zIndex: 9998 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{
            borderRadius: '15px',
            border: 'none',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}>
            <div className="modal-header" style={{
              background: 'linear-gradient(135deg, #52b447, #429938)',
              borderBottom: 'none',
              padding: '20px 25px',
              position: 'relative'
            }}>
              <h5 className="modal-title fw-bold" style={{ color: 'white', fontSize: '18px', fontWeight: 700 }}>
                <i className="bi bi-bank me-2"></i>
                {selectedEmployee?.employeeName || 'Employee'}'s Bank Details
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '50%',
                  padding: '8px',
                  opacity: '1',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                  e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}
              />
            </div>
            <div className="modal-body">
              <div className="row g-3">
                {/* Bank Name */}
                <div className="col-md-6">
                  <div className="bank-info-item p-3 border rounded h-100" style={{
                    backgroundColor: 'rgba(65, 105, 225, 0.02)',
                    border: '1px solid rgba(65, 105, 225, 0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-bank fs-4 text-primary me-3" style={{ color: '#1e40af' }}></i>
                      <div className="flex-grow-1">
                        <div className="fw-bold mb-1" style={{ color: '#444', fontSize: '14px' }}>Bank Name</div>
                        <div className="d-flex align-items-center">
                          <span className="me-2" style={{ color: '#666', fontSize: '13px' }}>
                            {selectedEmployee?.bankDetails?.bankName || 'Not provided'}
                          </span>
                          {selectedEmployee?.bankDetails?.bankName && (
                            <i
                              className="bi bi-clipboard cursor-pointer"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedEmployee.bankDetails.bankName);
                                toast.success('Bank Name copied!');
                              }}
                              title="Copy Bank Name"
                              style={{ color: '#1e40af', fontSize: '14px' }}
                            ></i>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Holder Name */}
                <div className="col-md-6">
                  <div className="bank-info-item p-3 border rounded h-100" style={{
                    backgroundColor: 'rgba(255, 105, 180, 0.02)',
                    border: '1px solid rgba(255, 105, 180, 0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-person fs-4 text-primary me-3" style={{ color: '#ff69b4' }}></i>
                      <div className="flex-grow-1">
                        <div className="fw-bold mb-1" style={{ color: '#444', fontSize: '14px' }}>Account Holder</div>
                        <div className="d-flex align-items-center">
                          <span className="me-2" style={{ color: '#666', fontSize: '13px' }}>
                            {selectedEmployee?.bankDetails?.accountHolderName || 'Not provided'}
                          </span>
                          {selectedEmployee?.bankDetails?.accountHolderName && (
                            <i
                              className="bi bi-clipboard cursor-pointer"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedEmployee.bankDetails.accountHolderName);
                                toast.success('Account Holder Name copied!');
                              }}
                              title="Copy Account Holder Name"
                              style={{ color: '#ff69b4', fontSize: '14px' }}
                            ></i>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Number */}
                <div className="col-md-6">
                  <div className="bank-info-item p-3 border rounded h-100" style={{
                    backgroundColor: 'rgba(82, 180, 71, 0.02)',
                    border: '1px solid rgba(82, 180, 71, 0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-credit-card fs-4 text-primary me-3" style={{ color: '#52b447' }}></i>
                      <div className="flex-grow-1">
                        <div className="fw-bold mb-1" style={{ color: '#444', fontSize: '14px' }}>Account Number</div>
                        <div className="d-flex align-items-center">
                          <span className="me-2" style={{ color: '#666', fontSize: '13px' }}>
                            {selectedEmployee?.bankDetails?.accountNumber || 'Not provided'}
                          </span>
                          {selectedEmployee?.bankDetails?.accountNumber && (
                            <i
                              className="bi bi-clipboard cursor-pointer"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedEmployee.bankDetails.accountNumber);
                                toast.success('Account Number copied!');
                              }}
                              title="Copy Account Number"
                              style={{ color: '#52b447', fontSize: '14px' }}
                            ></i>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* IFSC Code */}
                <div className="col-md-6">
                  <div className="bank-info-item p-3 border rounded h-100" style={{
                    backgroundColor: 'rgba(255, 94, 0, 0.02)',
                    border: '1px solid rgba(255, 94, 0, 0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-building fs-4 text-primary me-3" style={{ color: '#ff5e00' }}></i>
                      <div className="flex-grow-1">
                        <div className="fw-bold mb-1" style={{ color: '#444', fontSize: '14px' }}>IFSC Code</div>
                        <div className="d-flex align-items-center">
                          <span className="me-2" style={{ color: '#666', fontSize: '13px' }}>
                            {selectedEmployee?.bankDetails?.ifscCode || 'Not provided'}
                          </span>
                          {selectedEmployee?.bankDetails?.ifscCode && (
                            <i
                              className="bi bi-clipboard cursor-pointer"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedEmployee.bankDetails.ifscCode);
                                toast.success('IFSC Code copied!');
                              }}
                              title="Copy IFSC Code"
                              style={{ color: '#ff5e00', fontSize: '14px' }}
                            ></i>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Type */}
                <div className="col-md-6">
                  <div className="bank-info-item p-3 border rounded h-100" style={{
                    backgroundColor: 'rgba(65, 105, 225, 0.02)',
                    border: '1px solid rgba(65, 105, 225, 0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-wallet2 fs-4 text-primary me-3" style={{ color: '#1e40af' }}></i>
                      <div className="flex-grow-1">
                        <div className="fw-bold mb-1" style={{ color: '#444', fontSize: '14px' }}>Account Type</div>
                        <div className="d-flex align-items-center">
                          <span className="me-2" style={{ color: '#666', fontSize: '13px' }}>
                            {selectedEmployee?.bankDetails?.accountType || 'Not provided'}
                          </span>
                          {selectedEmployee?.bankDetails?.accountType && (
                            <i
                              className="bi bi-clipboard cursor-pointer"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedEmployee.bankDetails.accountType);
                                toast.success('Account Type copied!');
                              }}
                              title="Copy Account Type"
                              style={{ color: '#1e40af', fontSize: '14px' }}
                            ></i>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* UPI ID */}
                <div className="col-md-6">
                  <div className="bank-info-item p-3 border rounded h-100" style={{
                    backgroundColor: 'rgba(255, 105, 180, 0.02)',
                    border: '1px solid rgba(255, 105, 180, 0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-phone fs-4 text-primary me-3" style={{ color: '#ff69b4' }}></i>
                      <div className="flex-grow-1">
                        <div className="fw-bold mb-1" style={{ color: '#444', fontSize: '14px' }}>UPI ID</div>
                        <div className="d-flex align-items-center">
                          <span className="me-2" style={{ color: '#666', fontSize: '13px' }}>
                            {selectedEmployee?.bankDetails?.upiId || 'Not provided'}
                          </span>
                          {selectedEmployee?.bankDetails?.upiId && (
                            <i
                              className="bi bi-clipboard cursor-pointer"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedEmployee.bankDetails.upiId);
                                toast.success('UPI ID copied!');
                              }}
                              title="Copy UPI ID"
                              style={{ color: '#ff69b4', fontSize: '14px' }}
                            ></i>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment App */}
                <div className="col-md-6">
                  <div className="bank-info-item p-3 border rounded h-100" style={{
                    backgroundColor: 'rgba(82, 180, 71, 0.02)',
                    border: '1px solid rgba(82, 180, 71, 0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-app fs-4 text-primary me-3" style={{ color: '#52b447' }}></i>
                      <div className="flex-grow-1">
                        <div className="fw-bold mb-1" style={{ color: '#444', fontSize: '14px' }}>Payment App</div>
                        <div className="d-flex align-items-center">
                          <span className="me-2" style={{ color: '#666', fontSize: '13px' }}>
                            {selectedEmployee?.bankDetails?.paymentApp || 'Not provided'}
                          </span>
                          {selectedEmployee?.bankDetails?.paymentApp && (
                            <i
                              className="bi bi-clipboard cursor-pointer"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedEmployee.bankDetails.paymentApp);
                                toast.success('Payment App copied!');
                              }}
                              title="Copy Payment App"
                              style={{ color: '#52b447', fontSize: '14px' }}
                            ></i>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                {selectedEmployee?.bankDetails?.qrCode && (
                  <div className="col-md-6">
                    <div className="bank-info-item p-3 border rounded h-100" style={{
                      backgroundColor: 'rgba(255, 94, 0, 0.02)',
                      border: '1px solid rgba(255, 94, 0, 0.1)',
                      transition: 'all 0.3s ease'
                    }}>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-qr-code fs-4 text-primary me-3" style={{ color: '#ff5e00' }}></i>
                        <div className="flex-grow-1">
                          <div className="fw-bold mb-1" style={{ color: '#444', fontSize: '14px' }}>QR Code</div>
                          <div className="d-flex align-items-center">
                            <img
                              src={`${import.meta.env.VITE_BASE_URL}${selectedEmployee.bankDetails.qrCode}`}
                              alt="QR Code"
                              style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '8px',
                                cursor: 'pointer'
                              }}
                              onClick={() => handleImageClick(
                                `${import.meta.env.VITE_BASE_URL}${selectedEmployee.bankDetails.qrCode}`,
                                `${selectedEmployee.employeeName} - QR Code`
                              )}
                              title="Click to view QR Code"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* View Documents Modal */}
      <div
        className="modal fade"
        id="viewDocumentsModal"
        tabIndex={-1}
        aria-hidden="true"
        style={{ zIndex: 9999 }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content" style={{
            borderRadius: '15px',
            border: 'none',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}>
            <div className="modal-header" style={{
              background: 'linear-gradient(135deg, #ff70b4, #ff69b4)',
              borderBottom: 'none',
              padding: '20px 25px',
              position: 'relative'
            }}>
              <h5 className="modal-title fw-bold" style={{ color: 'white', fontSize: '18px', fontWeight: 700 }}>
                <i className="bi bi-file-earmark-text me-2"></i>
                {selectedEmployee?.employeeName || 'Employee'}'s Documents
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '50%',
                  padding: '8px',
                  opacity: '1',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                  e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}
              />
            </div>
            <div className="modal-body">
              <div className="row g-3">
                {/* Resume */}
                <div className="col-md-6">
                  <div className="document-item p-3 border rounded h-100" style={{
                    backgroundColor: 'rgba(65, 105, 225, 0.02)',
                    border: '1px solid rgba(65, 105, 225, 0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div className="d-flex flex-column align-items-center">
                      <i className="bi bi-file-earmark-text fs-1 text-primary mb-2" style={{ color: '#1e40af' }}></i>
                      <div className="fw-bold mb-2" style={{ color: '#444', fontSize: '16px' }}>Resume</div>
                      {selectedEmployee?.resume ? (
                        <div className="d-flex justify-content-center gap-3 mt-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={(e) => handleFileClick(
                              e,
                              `${import.meta.env.VITE_BASE_URL}${selectedEmployee.resume}`,
                              selectedEmployee.resume.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image',
                              `${selectedEmployee.employeeName} - Resume`
                            )}
                            style={{
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            <i className="bi bi-eye me-1"></i> View
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleDownload(
                              `${import.meta.env.VITE_BASE_URL}${selectedEmployee.resume}`,
                              `${selectedEmployee.employeeName}_resume${selectedEmployee.resume.substring(selectedEmployee.resume.lastIndexOf('.'))}`
                            )}
                            style={{
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            <i className="bi bi-download me-1"></i> Download
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDocumentDelete(selectedEmployee._id, 'resume')}
                            style={{
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            <i className="bi bi-trash me-1"></i> Delete
                          </button>
                        </div>
                      ) : (
                        <p className="text-muted mb-0" style={{ fontSize: '13px' }}>No resume uploaded</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Aadhaar Card */}
                <div className="col-md-6">
                  <div className="document-item p-3 border rounded h-100" style={{
                    backgroundColor: 'rgba(255, 105, 180, 0.02)',
                    border: '1px solid rgba(255, 105, 180, 0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div className="d-flex flex-column align-items-center">
                      <i className="bi bi-card-text fs-1 text-primary mb-2" style={{ color: '#ff69b4' }}></i>
                      <div className="fw-bold mb-2" style={{ color: '#444', fontSize: '16px' }}>Aadhaar Card</div>
                      {selectedEmployee?.aadhaarCard ? (
                        <div className="d-flex justify-content-center gap-3 mt-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={(e) => handleFileClick(
                              e,
                              `${import.meta.env.VITE_BASE_URL}${selectedEmployee.aadhaarCard}`,
                              selectedEmployee.aadhaarCard.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image',
                              `${selectedEmployee.employeeName} - Aadhaar Card`
                            )}
                            style={{
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            <i className="bi bi-eye me-1"></i> View
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleDownload(
                              `${import.meta.env.VITE_BASE_URL}${selectedEmployee.aadhaarCard}`,
                              `${selectedEmployee.employeeName}_aadhaar${selectedEmployee.aadhaarCard.substring(selectedEmployee.aadhaarCard.lastIndexOf('.'))}`
                            )}
                            style={{
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            <i className="bi bi-download me-1"></i> Download
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDocumentDelete(selectedEmployee._id, 'aadhaarCard')}
                            style={{
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            <i className="bi bi-trash me-1"></i> Delete
                          </button>
                        </div>
                      ) : (
                        <p className="text-muted mb-0" style={{ fontSize: '13px' }}>No Aadhaar card uploaded</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* PAN Card */}
                <div className="col-md-6">
                  <div className="document-item p-3 border rounded h-100" style={{
                    backgroundColor: 'rgba(82, 180, 71, 0.02)',
                    border: '1px solid rgba(82, 180, 71, 0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div className="d-flex flex-column align-items-center">
                      <i className="bi bi-card-heading fs-1 text-primary mb-2" style={{ color: '#52b447' }}></i>
                      <div className="fw-bold mb-2" style={{ color: '#444', fontSize: '16px' }}>PAN Card</div>
                      {selectedEmployee?.panCard ? (
                        <div className="d-flex justify-content-center gap-3 mt-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={(e) => handleFileClick(
                              e,
                              `${import.meta.env.VITE_BASE_URL}${selectedEmployee.panCard}`,
                              selectedEmployee.panCard.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image',
                              `${selectedEmployee.employeeName} - PAN Card`
                            )}
                            style={{
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            <i className="bi bi-eye me-1"></i> View
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleDownload(
                              `${import.meta.env.VITE_BASE_URL}${selectedEmployee.panCard}`,
                              `${selectedEmployee.employeeName}_pan${selectedEmployee.panCard.substring(selectedEmployee.panCard.lastIndexOf('.'))}`
                            )}
                            style={{
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            <i className="bi bi-download me-1"></i> Download
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDocumentDelete(selectedEmployee._id, 'panCard')}
                            style={{
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            <i className="bi bi-trash me-1"></i> Delete
                          </button>
                        </div>
                      ) : (
                        <p className="text-muted mb-0" style={{ fontSize: '13px' }}>No PAN card uploaded</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{
              borderTop: '1px solid rgba(255, 105, 180, 0.1)',
              padding: '16px 25px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button
                type="button"
                className="btn"
                data-bs-dismiss="modal"
                style={{
                  backgroundColor: 'rgba(255, 94, 0, 0.1)',
                  color: '#ff5e00',
                  border: '1px solid rgba(255, 94, 0, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 94, 0, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 94, 0, 0.1)';
                }}
              >
                <i className="icofont-close-circled me-2"></i>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Social Media Modal */}
      <div
        className="modal fade"
        id="socialMediaModal"
        tabIndex={-1}
        aria-hidden="true"
        style={{ zIndex: 9999 }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content" style={{
            borderRadius: '15px',
            border: 'none',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}>
            <div className="modal-header" style={{
              background: 'linear-gradient(135deg, #ff70b4, #ff69b4)',
              borderBottom: 'none',
              padding: '20px 25px',
              position: 'relative'
            }}>
              <h5 className="modal-title fw-bold" style={{ color: 'white', fontSize: '18px', fontWeight: 700 }}>
                <i className="bi bi-share-fill me-2"></i>
                {selectedEmployee?.employeeName || 'Employee'}'s Social Media Links
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '50%',
                  padding: '8px',
                  opacity: '1',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                  e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}
              />
            </div>
            <div className="modal-body" style={{ padding: '25px' }}>
              <div className="row g-3">
                {/* LinkedIn */}
                {selectedEmployee?.socialLinks?.linkedin && (
                  <div className="col-md-6 col-lg-4">
                    <div className="social-link-item p-3 border rounded h-100" style={{
                      backgroundColor: 'rgba(0, 119, 181, 0.05)',
                      border: '1px solid rgba(0, 119, 181, 0.2)',
                      transition: 'all 0.3s ease'
                    }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 119, 181, 0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 119, 181, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-linkedin fs-4 me-3" style={{ color: '#0077b5' }}></i>
                        <div className="flex-grow-1">
                          <div className="fw-bold mb-1" style={{ color: '#444', fontSize: '14px' }}>LinkedIn</div>
                          <div className="d-flex align-items-center">
                            <a 
                              href={selectedEmployee.socialLinks.linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-decoration-none"
                              style={{ color: '#0077b5', fontSize: '13px' }}
                            >
                              View Profile
                            </a>
                            <i
                              className="bi bi-clipboard cursor-pointer ms-2"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedEmployee.socialLinks.linkedin);
                                toast.success('LinkedIn URL copied!');
                              }}
                              title="Copy LinkedIn URL"
                              style={{ color: '#0077b5', fontSize: '14px' }}
                            ></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Instagram */}
                {selectedEmployee?.socialLinks?.instagram && (
                  <div className="col-md-6 col-lg-4">
                    <div className="social-link-item p-3 border rounded h-100" style={{
                      backgroundColor: 'rgba(225, 48, 108, 0.05)',
                      border: '1px solid rgba(225, 48, 108, 0.2)',
                      transition: 'all 0.3s ease'
                    }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(225, 48, 108, 0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(225, 48, 108, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-instagram fs-4 me-3" style={{ color: '#e1306c' }}></i>
                        <div className="flex-grow-1">
                          <div className="fw-bold mb-1" style={{ color: '#444', fontSize: '14px' }}>Instagram</div>
                          <div className="d-flex align-items-center">
                            <a 
                              href={selectedEmployee.socialLinks.instagram} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-decoration-none"
                              style={{ color: '#e1306c', fontSize: '13px' }}
                            >
                              View Profile
                            </a>
                            <i
                              className="bi bi-clipboard cursor-pointer ms-2"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedEmployee.socialLinks.instagram);
                                toast.success('Instagram URL copied!');
                              }}
                              title="Copy Instagram URL"
                              style={{ color: '#e1306c', fontSize: '14px' }}
                            ></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* YouTube */}
                {selectedEmployee?.socialLinks?.youtube && (
                  <div className="col-md-6 col-lg-4">
                    <div className="social-link-item p-3 border rounded h-100" style={{
                      backgroundColor: 'rgba(255, 0, 0, 0.05)',
                      border: '1px solid rgba(255, 0, 0, 0.2)',
                      transition: 'all 0.3s ease'
                    }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 0, 0, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-youtube fs-4 me-3" style={{ color: '#ff0000' }}></i>
                        <div className="flex-grow-1">
                          <div className="fw-bold mb-1" style={{ color: '#444', fontSize: '14px' }}>YouTube</div>
                          <div className="d-flex align-items-center">
                            <a 
                              href={selectedEmployee.socialLinks.youtube} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-decoration-none"
                              style={{ color: '#ff0000', fontSize: '13px' }}
                            >
                              View Channel
                            </a>
                            <i
                              className="bi bi-clipboard cursor-pointer ms-2"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedEmployee.socialLinks.youtube);
                                toast.success('YouTube URL copied!');
                              }}
                              title="Copy YouTube URL"
                              style={{ color: '#ff0000', fontSize: '14px' }}
                            ></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Facebook */}
                {selectedEmployee?.socialLinks?.facebook && (
                  <div className="col-md-6 col-lg-4">
                    <div className="social-link-item p-3 border rounded h-100" style={{
                      backgroundColor: 'rgba(66, 103, 178, 0.05)',
                      border: '1px solid rgba(66, 103, 178, 0.2)',
                      transition: 'all 0.3s ease'
                    }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(66, 103, 178, 0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(66, 103, 178, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-facebook fs-4 me-3" style={{ color: '#4267b2' }}></i>
                        <div className="flex-grow-1">
                          <div className="fw-bold mb-1" style={{ color: '#444', fontSize: '14px' }}>Facebook</div>
                          <div className="d-flex align-items-center">
                            <a 
                              href={selectedEmployee.socialLinks.facebook} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-decoration-none"
                              style={{ color: '#4267b2', fontSize: '13px' }}
                            >
                              View Profile
                            </a>
                            <i
                              className="bi bi-clipboard cursor-pointer ms-2"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedEmployee.socialLinks.facebook);
                                toast.success('Facebook URL copied!');
                              }}
                              title="Copy Facebook URL"
                              style={{ color: '#4267b2', fontSize: '14px' }}
                            ></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* GitHub */}
                {selectedEmployee?.socialLinks?.github && (
                  <div className="col-md-6 col-lg-4">
                    <div className="social-link-item p-3 border rounded h-100" style={{
                      backgroundColor: 'rgba(36, 41, 46, 0.05)',
                      border: '1px solid rgba(36, 41, 46, 0.2)',
                      transition: 'all 0.3s ease'
                    }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(36, 41, 46, 0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(36, 41, 46, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-github fs-4 me-3" style={{ color: '#24292e' }}></i>
                        <div className="flex-grow-1">
                          <div className="fw-bold mb-1" style={{ color: '#444', fontSize: '14px' }}>GitHub</div>
                          <div className="d-flex align-items-center">
                            <a 
                              href={selectedEmployee.socialLinks.github} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-decoration-none"
                              style={{ color: '#24292e', fontSize: '13px' }}
                            >
                              View Profile
                            </a>
                            <i
                              className="bi bi-clipboard cursor-pointer ms-2"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedEmployee.socialLinks.github);
                                toast.success('GitHub URL copied!');
                              }}
                              title="Copy GitHub URL"
                              style={{ color: '#24292e', fontSize: '14px' }}
                            ></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Website */}
                {selectedEmployee?.socialLinks?.website && (
                  <div className="col-md-6 col-lg-4">
                    <div className="social-link-item p-3 border rounded h-100" style={{
                      backgroundColor: 'rgba(52, 152, 219, 0.05)',
                      border: '1px solid rgba(52, 152, 219, 0.2)',
                      transition: 'all 0.3s ease'
                    }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(52, 152, 219, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-globe fs-4 me-3" style={{ color: '#3498db' }}></i>
                        <div className="flex-grow-1">
                          <div className="fw-bold mb-1" style={{ color: '#444', fontSize: '14px' }}>Website</div>
                          <div className="d-flex align-items-center">
                            <a 
                              href={selectedEmployee.socialLinks.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-decoration-none"
                              style={{ color: '#3498db', fontSize: '13px' }}
                            >
                              Visit Website
                            </a>
                            <i
                              className="bi bi-clipboard cursor-pointer ms-2"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedEmployee.socialLinks.website);
                                toast.success('Website URL copied!');
                              }}
                              title="Copy Website URL"
                              style={{ color: '#3498db', fontSize: '14px' }}
                            ></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Other */}
                {selectedEmployee?.socialLinks?.other && (
                  <div className="col-md-6 col-lg-4">
                    <div className="social-link-item p-3 border rounded h-100" style={{
                      backgroundColor: 'rgba(155, 89, 182, 0.05)',
                      border: '1px solid rgba(155, 89, 182, 0.2)',
                      transition: 'all 0.3s ease'
                    }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(155, 89, 182, 0.1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(155, 89, 182, 0.05)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-link-45deg fs-4 me-3" style={{ color: '#9b59b6' }}></i>
                        <div className="flex-grow-1">
                          <div className="fw-bold mb-1" style={{ color: '#444', fontSize: '14px' }}>Other Link</div>
                          <div className="d-flex align-items-center">
                            <a 
                              href={selectedEmployee.socialLinks.other} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-decoration-none"
                              style={{ color: '#9b59b6', fontSize: '13px' }}
                            >
                              Visit Link
                            </a>
                            <i
                              className="bi bi-clipboard cursor-pointer ms-2"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedEmployee.socialLinks.other);
                                toast.success('Other URL copied!');
                              }}
                              title="Copy Other URL"
                              style={{ color: '#9b59b6', fontSize: '14px' }}
                            ></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Show message if no social media links */}
              {(!selectedEmployee?.socialLinks?.linkedin && 
                !selectedEmployee?.socialLinks?.instagram && 
                !selectedEmployee?.socialLinks?.youtube && 
                !selectedEmployee?.socialLinks?.facebook && 
                !selectedEmployee?.socialLinks?.github && 
                !selectedEmployee?.socialLinks?.website && 
                !selectedEmployee?.socialLinks?.other) && (
                <div className="text-center mt-4">
                  <i className="bi bi-share-fill display-4 text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mb-0" style={{ fontSize: '16px' }}>
                    No social media links added yet
                  </p>
                  <p className="text-muted mt-2" style={{ fontSize: '14px' }}>
                    Social media links can be added when editing the employee profile
                  </p>
                </div>
              )}
            </div>
            <div className="modal-footer" style={{
              borderTop: '1px solid rgba(255, 105, 180, 0.1)',
              padding: '16px 25px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button
                type="button"
                className="btn"
                data-bs-dismiss="modal"
                style={{
                  backgroundColor: 'rgba(255, 94, 0, 0.1)',
                  color: '#ff5e00',
                  border: '1px solid rgba(255, 94, 0, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 94, 0, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 94, 0, 0.1)';
                }}
              >
                <i className="icofont-close-circled me-2"></i>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Member;