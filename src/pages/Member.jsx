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

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee); // Add this line
    setToEdit(employee._id);
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
  const handleSearch = async (searchQuery) => {
    if (searchQuery !== "") {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}api/search?id=${searchQuery}`
        );
        setEmployees(response.data);
      } catch (error) {
        console.error("Error:", error);
        setEmployees(null);
      }
    } else {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}api/employees`
          );
          setEmployees(response.data);
        } catch (error) {
          console.error("Error:", error);
        }
      };

      fetchData();
    }
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
                      <div className="card-header py-3 px-0 d-sm-flex align-items-center  justify-content-between border-bottom">
                        <h3 className=" fw-bold flex-fill mb-0 mt-sm-0">
                          Employees
                        </h3>
                        <button
                          type="button"
                          className="btn btn-dark me-1 mt-1 w-sm-100"
                          data-bs-toggle="modal"
                          data-bs-target="#createemp"
                        >
                          <i className="icofont-plus-circle me-2 fs-6" />
                          Add Employee
                        </button>
                        <div className="order-0 col-lg-4 col-md-4 col-sm-12 col-12 mb-3 mb-md-0 ">
                          <div className="input-group">
                            <input
                              type="search"
                              className="form-control"
                              aria-label="search"
                              aria-describedby="addon-wrapping"
                              value={searchQuery}
                              onChange={(e) => {
                                setSearchQuery(e.target.value);
                                handleSearch(e.target.value);
                              }}
                              placeholder="Enter Employee Name"
                            />
                            <button
                              type="button"
                              className="input-group-text"
                              id="addon-wrapping"
                              onClick={handleSearch}
                            >
                              <i className="fa fa-search" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex justify-content-between">
                        <div></div>
                        <div className="d-flex">
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
                      {employees.map((employee) => {
                        const newDate = new Date(employee?.joiningDate);
                        const date = newDate.getDate();
                        const month = newDate.getMonth() + 1; // months are 0-indexed
                        const year = newDate.getFullYear();
                        return (
                          <div className="col" key={employee.employeeId}>
                            <div className="card teacher-card">
                              <div className="card-body d-flex">

                                <div className="profile-av pe-xl-4 pe-md-2 pe-sm-4 pe-4 text-center w-75">
                                  <div className="position-relative d-inline-block">
                                    <img
                                      src={`${import.meta.env.VITE_BASE_URL}${employee.employeeImage}`}
                                      alt=""
                                      className="avatar xl rounded-circle img-thumbnail shadow-sm"
                                      style={{
                                        transition: 'transform 0.3s ease-in-out',
                                        cursor: 'pointer',
                                        objectFit: 'cover',
                                      }}
                                      onMouseEnter={(e) => {
                                        e.target.style.transform = 'scale(2.5)';
                                        e.target.style.zIndex = '100';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.target.style.transform = 'scale(1)';
                                        e.target.style.zIndex = '1';
                                      }}
                                      onClick={() => handleImageClick(
                                        `${import.meta.env.VITE_BASE_URL}${employee.employeeImage}`,
                                        employee.employeeName
                                      )}
                                    />
                                  </div>

                                  <div className="about-info mt-3">
                                    <div className="followers me-2">
                                    </div>
                                    <div className="own-video">
                                      <i className="bi bi-telephone-fill text-success fs-6 me-2" />
                                      <span>{employee.phone}</span>
                                    </div>
                                    <p className="rounded-1 d-inline-block fw-bold small-11 mb-1 d-flex justify-content-center">
                                      <i className="bi bi-envelope-at-fill text-primary fs-6 me-1" />
                                      {employee.emailid}
                                    </p>
                                  </div>

                                  <div className="mt-2 text-start border-top pt-2">
                                    {/* Aadhaar Card Row */}
                                    <div className="row border-bottom pb-2 mb-2">
                                      <div className="col-md-6 d-flex align-items-center">
                                        <strong>Aadhaar -</strong>
                                      </div>
                                      <div className="col-md-6">
                                        {employee.aadhaarCard ? (
                                          <div className="row align-items-center g-2">
                                            <div className="col-6">
                                              {employee.aadhaarCard.toLowerCase().endsWith('.pdf') ? (
                                                <a href="#" onClick={(e) => handleFileClick(
                                                  e,
                                                  `${import.meta.env.VITE_BASE_URL}${employee.aadhaarCard.replace('uploads/', '')}`,
                                                  'pdf',
                                                  employee.employeeName
                                                )}>View</a>
                                              ) : (
                                                <img
                                                  src={`${import.meta.env.VITE_BASE_URL}${employee.aadhaarCard.replace('uploads/', '')}`}
                                                  alt=""
                                                  className="avatar sm img-thumbnail shadow-sm"
                                                  onClick={(e) => handleFileClick(
                                                    e,
                                                    `${import.meta.env.VITE_BASE_URL}${employee.aadhaarCard.replace('uploads/', '')}`,
                                                    'image',
                                                    employee.employeeName
                                                  )}
                                                  style={{ cursor: 'pointer' }}
                                                />
                                              )}
                                            </div>
                                            <div className="col-3 text-center">
                                              <i
                                                className="bi bi-download text-primary"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleDownload(employee.aadhaarCard, `${employee.employeeName}_aadhaar${employee.aadhaarCard.substr(employee.aadhaarCard.lastIndexOf('.'))}`)}
                                                title="Download Aadhaar Card"
                                              ></i>
                                            </div>
                                            <div className="col-3 text-center">
                                              <i
                                                className="bi bi-trash text-danger"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleDocumentDelete(employee._id, 'aadhaarCard')}
                                                title="Delete Aadhaar Card"
                                              ></i>
                                            </div>
                                          </div>
                                        ) : (
                                          <i className="bi bi-x-lg text-danger"></i>
                                        )}
                                      </div>
                                    </div>

                                    {/* PAN Card Row */}
                                    <div className="row border-bottom pb-2 mb-2">
                                      <div className="col-md-6 d-flex align-items-center">
                                        <strong>Pan -</strong>
                                      </div>
                                      <div className="col-md-6">
                                        {employee.panCard ? (
                                          <div className="row align-items-center g-2">
                                            <div className="col-6">
                                              {employee.panCard.toLowerCase().endsWith('.pdf') ? (
                                                <a href="#" onClick={(e) => handleFileClick(
                                                  e,
                                                  `${import.meta.env.VITE_BASE_URL}${employee.panCard.replace('uploads/', '')}`,
                                                  'pdf',
                                                  employee.employeeName
                                                )}>View</a>
                                              ) : (
                                                <img
                                                  src={`${import.meta.env.VITE_BASE_URL}${employee.panCard.replace('uploads/', '')}`}
                                                  alt=""
                                                  className="avatar sm img-thumbnail shadow-sm"
                                                  onClick={(e) => handleFileClick(
                                                    e,
                                                    `${import.meta.env.VITE_BASE_URL}${employee.panCard.replace('uploads/', '')}`,
                                                    'image',
                                                    employee.employeeName
                                                  )}
                                                  style={{ cursor: 'pointer' }}
                                                />
                                              )}
                                            </div>
                                            <div className="col-3 text-center">
                                              <i
                                                className="bi bi-download text-primary"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleDownload(employee.panCard, `${employee.employeeName}_pan${employee.panCard.substr(employee.panCard.lastIndexOf('.'))}`)}
                                                title="Download Pan Card"
                                              ></i>
                                            </div>
                                            <div className="col-3 text-center">
                                              <i
                                                className="bi bi-trash text-danger"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleDocumentDelete(employee._id, 'panCard')}
                                                title="Delete Pan Card"
                                              ></i>
                                            </div>
                                          </div>
                                        ) : (
                                          <i className="bi bi-x-lg text-danger"></i>
                                        )}
                                      </div>
                                    </div>

                                    {/* Resume Row */}
                                    <div className="row border-bottom pb-2 mb-2">
                                      <div className="col-md-6 d-flex align-items-center">
                                        <strong>Resume -</strong>
                                      </div>
                                      <div className="col-md-6">
                                        {employee.resume ? (
                                          <div className="row align-items-center g-2">
                                            <div className="col-6">
                                              {employee.resume.toLowerCase().endsWith('.pdf') ? (
                                                <a href="#" onClick={(e) => handleFileClick(
                                                  e,
                                                  `${import.meta.env.VITE_BASE_URL}${employee.resume.replace('uploads/', '')}`,
                                                  'pdf',
                                                  employee.employeeName
                                                )}><i className="bi bi-filetype-pdf"></i></a>
                                              ) : (
                                                <img
                                                  src={`${import.meta.env.VITE_BASE_URL}${employee.resume.replace('uploads/', '')}`}
                                                  alt=""
                                                  className="avatar sm img-thumbnail shadow-sm"
                                                  onClick={(e) => handleFileClick(
                                                    e,
                                                    `${import.meta.env.VITE_BASE_URL}${employee.resume.replace('uploads/', '')}`,
                                                    'image',
                                                    employee.employeeName
                                                  )}
                                                  style={{ cursor: 'pointer' }}
                                                />
                                              )}
                                            </div>
                                            <div className="col-3 text-center">
                                              <i
                                                className="bi bi-download text-primary"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleDownload(employee.resume, `${employee.employeeName}_resume${employee.resume.substr(employee.resume.lastIndexOf('.'))}`)}
                                                title="Download Resume"
                                              ></i>
                                            </div>
                                            <div className="col-3 text-center">
                                              <i
                                                className="bi bi-trash text-danger"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleDocumentDelete(employee._id, 'resume')}
                                                title="Delete Resume"
                                              ></i>
                                            </div>
                                          </div>
                                        ) : (
                                          <i className="bi bi-x-lg text-danger"></i>
                                        )}
                                      </div>
                                    </div>

                                  </div>

                                </div>

                                <div className="teacher-info border-start ps-xl-4 ps-md-3 ps-sm-4 ps-4 w-100">
                                  <div>
                                    <div className="d-flex justify-content-between">

                                      <div>
                                        <h6
                                          className="mb-0 mt-2 fw-bold d-block fs-6"
                                          onClick={() => handleEmployeeClick(employee)}
                                          style={{ cursor: 'pointer' }}
                                          title="Click to View Employee Dashboard"
                                        >
                                          {employee.employeeName}
                                        </h6>
                                        <div className="followers me-2">
                                          <i className="bi bi-person-vcard-fill text-danger fs-6 me-2" />
                                          <span>{employee.employeeId}</span>
                                        </div>
                                      </div>

                                      <div>
                                        <div
                                          className="btn-group"
                                          role="group"
                                          aria-label="Basic outlined example"
                                        >
                                          <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            data-bs-toggle="modal"
                                            data-bs-target="#editemp"
                                            onClick={() => handleEditClick(employee)}
                                          >
                                            <i className="icofont-edit text-success" />
                                          </button>
                                          <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            data-bs-toggle="modal"
                                            data-bs-target="#deleteproject"
                                            onClick={() => {
                                              setDeletableId(employee._id);
                                            }}
                                          >
                                            <i className="icofont-ui-delete text-danger" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                      <span className="light-info-bg py-1 px-2 rounded-1 d-inline-block fw-bold small-11 mb-0 mt-1">
                                        <i className="bi bi-calendar-check-fill text-primary fs-6 me-2" />
                                        {date}/{month}/{year}
                                      </span>
                                      <span className="light-info-bg p-2 rounded-1 d-inline-block fw-bold small-11 mb-0 mt-1">
                                        {employee.designation}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="video-setting-icon mt-2 pt-2 border-top">
                                    <p>{employee.description}</p>
                                  </div>
                                  <div className="mt-2">
                                    <div className="d-flex gap-2 fw-bold">
                                      Projects :
                                      <span className="text-primary">
                                        {employeeProjects[employee._id] || 0}
                                      </span>
                                      <Link
                                        to="/projects"
                                        state={{ employeeName: employee.employeeName }}
                                        className="arrow-link"
                                        title={`Click to View Projects of ${employee.employeeName}`}
                                      >
                                        <i className="bi bi-arrow-right" />
                                      </Link>
                                    </div>
                                    <div className="d-flex gap-2 fw-bold">
                                      Tasks :
                                      <span className="text-success">
                                        {employeeTasks[employee._id] || 0}
                                      </span>
                                      <Link
                                        to="/tasks"
                                        state={{ employeeName: employee.employeeName }}
                                        className="arrow-link"
                                        title={`Click to View Tasks of ${employee.employeeName}`}
                                      >
                                        <i className="bi bi-arrow-right" />
                                      </Link>
                                    </div>
                                  </div>

                                  {/* bank details */}
                                  <button
                                    className="btn btn-sm btn-outline-primary mt-2"
                                    data-bs-toggle="modal"
                                    data-bs-target="#bankDetailsModal"
                                    onClick={() => setSelectedEmployee(employee)}
                                  >
                                    <i className="bi bi-bank me-2"></i>
                                    View Bank Details
                                  </button>

                                  {/* social links */}
                                  <div className="social-links mt-3">
                                    <div className="d-flex flex-wrap gap-2">
                                      {employee.socialLinks?.linkedin && (
                                        <a href={employee.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                                          className="btn btn-sm btn-outline-primary">
                                          <i className="bi bi-linkedin"></i>
                                        </a>
                                      )}
                                      {employee.socialLinks?.instagram && (
                                        <a href={employee.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                                          className="btn btn-sm btn-outline-danger">
                                          <i className="bi bi-instagram"></i>
                                        </a>
                                      )}
                                      {employee.socialLinks?.youtube && (
                                        <a href={employee.socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                                          className="btn btn-sm btn-outline-danger">
                                          <i className="bi bi-youtube"></i>
                                        </a>
                                      )}
                                      {employee.socialLinks?.facebook && (
                                        <a href={employee.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                                          className="btn btn-sm btn-outline-primary">
                                          <i className="bi bi-facebook"></i>
                                        </a>
                                      )}
                                      {employee.socialLinks?.github && (
                                        <a href={employee.socialLinks.github} target="_blank" rel="noopener noreferrer"
                                          className="btn btn-sm btn-outline-dark">
                                          <i className="bi bi-github"></i>
                                        </a>
                                      )}
                                      {employee.socialLinks?.website && (
                                        <a href={employee.socialLinks.website} target="_blank" rel="noopener noreferrer"
                                          className="btn btn-sm btn-outline-info">
                                          <i className="bi bi-globe"></i>
                                        </a>
                                      )}
                                      {employee.socialLinks?.other && (
                                        <a href={employee.socialLinks.other} target="_blank" rel="noopener noreferrer"
                                          className="btn btn-sm btn-outline-secondary">
                                          <i className="bi bi-link-45deg"></i>
                                        </a>
                                      )}
                                    </div>
                                  </div>



                                  {/* <button
                                    className="btn btn-sm btn-outline-secondary mt-2 ms-2"
                                    data-bs-toggle="modal"
                                    data-bs-target="#viewDocumentsModal"
                                    onClick={() => setSelectedEmployee(employee)}
                                  >
                                    <i className="bi bi-file-earmark-text me-2"></i>
                                    View Documents
                                  </button> */}





                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="row clearfix">
                      <div className="col-md-12">
                        <div className="card">
                          <div className="card-body">
                            <div className="table-responsive">
                              <table className="table table-hover align-middle mb-0">
                                <thead>
                                  <tr>
                                    <th>Employee</th>
                                    <th>Contact</th>
                                    <th>Department</th>
                                    <th>Projects</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {employees.map((employee) => {
                                    const newDate = new Date(employee?.joiningDate);
                                    const date = newDate.getDate();
                                    const month = newDate.getMonth() + 1; // months are 0-indexed
                                    const year = newDate.getFullYear();
                                    return (
                                      <tr key={employee.employeeId}>
                                        <td>
                                          <div className="d-flex align-items-center">
                                            <img
                                              src={`${import.meta.env.VITE_BASE_URL}${employee.employeeImage}`}
                                              alt=""
                                              className="avatar rounded-circle me-2"
                                              style={{
                                                width: '40px',
                                                height: '40px',
                                                objectFit: 'cover',
                                                cursor: 'pointer'
                                              }}
                                              onClick={() => handleImageClick(
                                                `${import.meta.env.VITE_BASE_URL}${employee.employeeImage}`,
                                                employee.employeeName
                                              )}
                                            />
                                            <div>
                                              <h6 className="mb-0">{employee.employeeName}</h6>
                                              <small>{employee.employeeId}</small>
                                            </div>
                                          </div>
                                        </td>
                                        <td>
                                          <div>{employee.phone}</div>
                                          <small>{employee.emailid}</small>
                                          <div> <i className="bi bi-calendar-check-fill text-primary fs-6 me-2" />
                                            {date}/{month}/{year}</div>
                                        </td>
                                        <td>
                                          <div>{employee.department}</div>
                                          <small>{employee.designation}</small>
                                        </td>
                                        <td>
                                          <div className="d-flex flex-column gap-1">
                                            <Link
                                              to="/projects"
                                              state={{ employeeName: employee.employeeName }}
                                              title={`Click to View Projects of ${employee.employeeName}`}
                                            >
                                              <span className="badge bg-primary px-3">
                                                Projects: {employeeProjects[employee._id] || 0}
                                              </span>
                                            </Link>
                                            <Link
                                              to="/tasks"
                                              state={{ employeeName: employee.employeeName }}
                                              title={`Click to View Tasks of ${employee.employeeName}`}
                                            >
                                              <span className="badge bg-success px-3">
                                                Tasks: {employeeTasks[employee._id] || 0}
                                              </span>
                                            </Link>
                                          </div>
                                        </td>
                                        <td>
                                          <div className="btn-group" role="group">
                                            <button
                                              className="btn btn-sm btn-outline-secondary"
                                              data-bs-toggle="modal"
                                              data-bs-target="#editemp"
                                              onClick={() => handleEditClick(employee)}
                                            >
                                              <i className="icofont-edit text-success"></i>
                                            </button>
                                            <button
                                              className="btn btn-sm btn-outline-secondary"
                                              data-bs-toggle="modal"
                                              data-bs-target="#deleteproject"
                                              onClick={() => setDeletableId(employee._id)}
                                            >
                                              <i className="icofont-ui-delete text-danger"></i>
                                            </button>
                                          </div>
                                          <div className="mt-2">
                                            <div className="btn-group" role="group">
                                              {/* DOCUMENTS */}
                                              <button
                                                className="btn btn-sm btn-outline-secondary"
                                                data-bs-toggle="modal"
                                                data-bs-target="#viewDocumentsModal"
                                                onClick={() => setSelectedEmployee(employee)}
                                                title="Click to View Documents of Employee"
                                              >
                                                <i className="bi bi-file-earmark-text"></i>

                                              </button>
                                              {/* BANK DETAILS */}
                                              <button
                                                className="btn btn-sm btn-outline-secondary"
                                                data-bs-toggle="modal"
                                                data-bs-target="#bankDetailsModal"
                                                onClick={() => setSelectedEmployee(employee)}
                                                title="Click to View Bank Details of Employee"
                                              >
                                                <i className="bi bi-bank"></i>
                                              </button>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
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
                <div className="modal-content">
                  <div className="modal-header">
                    <h5
                      className="modal-title  fw-bold"
                      id="createprojectlLabel"
                    >
                      {" "}
                      Edit Employee
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    />
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label
                        htmlFor="exampleFormControlInput877"
                        className="form-label"
                      >
                        Employee Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="exampleFormControlInput877"
                        placeholder="Explain what the Project Name"
                        name="employeeName"
                        value={employeeData.employeeName}
                        onChange={updateChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="updateEmployeeImage"
                        className="form-label"
                      >
                        Employee Image
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        id="updateEmployeeImage"
                        name="employeeImage"
                        onChange={updateChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="updateResume"
                        className="form-label"
                      >
                        Resume
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        id="updateResume"
                        name="resume"
                        onChange={updateChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="updateAadhaar"
                        className="form-label"
                      >
                        Aadhaar Card
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        id="updateAadhaar"
                        name="aadhaarCard"
                        onChange={updateChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="updatePan"
                        className="form-label"
                      >
                        PAN Card
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        id="updatePan"
                        name="panCard"
                        onChange={updateChange}
                      />
                    </div>
                    <div className="deadline-form">
                      <form>
                        <div className="row g-3 mb-3">
                          <div className="col-sm-6">
                            <label
                              htmlFor="exampleFormControlInput1778"
                              className="form-label"
                            >
                              Employee ID
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleFormControlInput1778"
                              placeholder="User Name"
                              name="employeeId"
                              value={employeeData.employeeId}
                              onChange={updateChange}
                            />
                          </div>
                          <div className="col-sm-6">
                            <label
                              htmlFor="exampleFormControlInput2778"
                              className="form-label"
                            >
                              Joining Date
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              id="exampleFormControlInput2778"
                              name="joiningDate"
                              value={employeeData.joiningDate}
                              onChange={updateChange}
                            />
                          </div>
                        </div>
                        <div className="row g-3 mb-3">
                          <div className="col">
                            <label
                              htmlFor="exampleFormControlInput477"
                              className="form-label"
                            >
                              Email ID
                            </label>
                            <input
                              type="email"
                              className="form-control"
                              id="exampleFormControlInput477"
                              placeholder="User Name"
                              name="emailid"
                              value={employeeData.emailid}
                              onChange={updateChange}
                            />
                          </div>
                          <div className="col">
                            <label
                              htmlFor="exampleFormControlInput277"
                              className="form-label"
                            >
                              Password
                            </label>
                            <input
                              type="Password"
                              className="form-control"
                              id="exampleFormControlInput277"
                              placeholder="Password"
                              name="password"
                              value={employeeData.password}
                              onChange={updateChange}
                            />
                          </div>
                        </div>
                        <div className="row g-3 mb-3">
                          <div className="col">
                            <label
                              htmlFor="exampleFormControlInput777"
                              className="form-label"
                            >
                              Phone
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleFormControlInput777"
                              placeholder="phone"
                              maxLength={14}
                              name="phone"
                              value={employeeData.phone}
                              onChange={updateChange}
                            />
                          </div>
                        </div>
                        <div className="row g-3 mb-3">
                          <div className="col">
                            <label className="form-label">Department</label>
                            <select
                              className="form-select"
                              aria-label="Default select Project Category"
                              name="department"
                              value={employeeData.department}
                              onChange={updateChange}
                            >
                              <option value={""}></option>
                              <option value={"Web Development"}>
                                Web Development
                              </option>
                              <option value={"It Management"}>
                                It Management
                              </option>
                              <option value={"Marketing"}>Marketing</option>
                              <option value={"Manager"}>Manager</option>
                            </select>
                          </div>
                          <div className="col">
                            <label className="form-label">Designation</label>
                            <select
                              className="form-select"
                              aria-label="Default select Project Category"
                              name="designation"
                              value={employeeData.designation}
                              onChange={updateChange}
                            >
                              <option value={""}></option>
                              <option value={"UI/UX Design"}>
                                UI/UX Design
                              </option>
                              <option value={"Website Design"}>
                                Website Design
                              </option>
                              <option value={"App Development"}>
                                App Development
                              </option>
                              <option value={"Quality Assurance"}>
                                Quality Assurance
                              </option>
                              <option value={"Development"}>Development</option>
                              <option value={"Backend Development"}>
                                Backend Development
                              </option>
                              <option value={"Software Testing"}>
                                Software Testing
                              </option>
                              <option value={"Website Design"}>
                                Website Design
                              </option>
                              <option value={"Marketing"}>Marketing</option>
                              <option value={"SEO"}>SEO</option>
                              <option value={"Project Manager"}>
                                Project Manager
                              </option>
                              <option value={"Other"}>Other</option>
                            </select>
                          </div>
                        </div>
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
                                  value={employeeData.instagram || employeeData.socialLinks?.instagram || ''}
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
                                  value={employeeData.youtube || employeeData.socialLinks?.youtube || ''}
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
                                  value={employeeData.facebook || employeeData.socialLinks?.facebook || ''}
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
                                  value={employeeData.github || employeeData.socialLinks?.github || ''}
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
                                  value={employeeData.website || employeeData.socialLinks?.website || ''}
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
                                  value={employeeData.other || employeeData.socialLinks?.other || ''}
                                  onChange={updateChange}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
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
                                  value={employeeData.bankName || ''} // Use employeeData for edit form
                                  onChange={updateChange} // Use updateChange for edit form
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
                                  value={employeeData.accountHolderName || ''} // Use employeeData for edit form
                                  onChange={updateChange} // Use updateChange for edit form
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
                                  value={employeeData.accountNumber || ''} // Use employeeData for edit form
                                  onChange={updateChange} // Use updateChange for edit form
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
                                  value={employeeData.ifscCode || ''} // Use employeeData for edit form
                                  onChange={updateChange} // Use updateChange for edit form
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="input-group mb-3">
                                <span className="input-group-text"><i className="bi bi-wallet2"></i></span>
                                <select
                                  className="form-select"
                                  name="accountType"
                                  value={employeeData.accountType || ''} // Use employeeData for edit form
                                  onChange={updateChange} // Use updateChange for edit form
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
                                  value={employeeData.upiId || ''} // Use employeeData for edit form
                                  onChange={updateChange} // Use updateChange for edit form
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
                                  onChange={updateChange} // Use updateChange for edit form
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
                                  value={employeeData.paymentApp || ''} // Use employeeData for edit form
                                  onChange={updateChange} // Use updateChange for edit form
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="exampleFormControlTextarea78"
                        className="form-label"
                      >
                        Description (optional)
                      </label>
                      <textarea
                        className="form-control"
                        id="exampleFormControlTextarea78"
                        rows={3}
                        placeholder="Add any extra details about the request"
                        defaultValue={""}
                        name="description"
                        value={employeeData.description}
                        onChange={updateChange}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                    >
                      Done
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={updateSubmit}
                    >
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
                <div className="modal-content">
                  <div className="modal-header">
                    <h5
                      className="modal-title  fw-bold"
                      id="createprojectlLabel"
                    >
                      {" "}
                      Add Employee
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    />
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label
                        htmlFor="exampleFormControlInput877"
                        className="form-label"
                      >
                        Employee Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="exampleFormControlInput877"
                        placeholder="Employee Name"
                        name="employeeName"
                        value={formData.employeeName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="formFileMultipleoneone"
                        className="form-label"
                      >
                        Employee Image <span className="text-danger">*</span>
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        id="formFileMultipleoneone"
                        name="employeeImage"
                        onChange={handleFileChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="resumeUpload"
                        className="form-label"
                      >
                        Resume
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        id="resumeUpload"
                        name="resume"
                        onChange={handleFileChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="aadhaarUpload"
                        className="form-label"
                      >
                        Aadhaar Card
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        id="aadhaarUpload"
                        name="aadhaarCard"
                        onChange={handleFileChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="panUpload"
                        className="form-label"
                      >
                        PAN Card
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        id="panUpload"
                        name="panCard"
                        onChange={handleFileChange}
                      />
                    </div>
                    <div className="deadline-form">
                      <form>
                        <div className="row g-3 mb-3">
                          <div className="col-sm-6">
                            <label
                              htmlFor="exampleFormControlInput1778"
                              className="form-label"
                            >
                              Employee ID <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleFormControlInput1778"
                              placeholder="Employee ID"
                              name="employeeId"
                              value={formData.employeeId}
                              onChange={handleChange}
                              disabled
                            />
                          </div>
                          <div className="col-sm-6">
                            <label
                              htmlFor="exampleFormControlInput2778"
                              className="form-label"
                            >
                              Joining Date
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              id="exampleFormControlInput2778"
                              name="joiningDate"
                              value={formData.joiningDate}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="row g-3 mb-3">

                          <div className="col">
                            <label
                              htmlFor="exampleFormControlInput477"
                              className="form-label"
                            >
                              Email ID <span className="text-danger">*</span>
                            </label>
                            <input
                              type="email"
                              className="form-control"
                              id="exampleFormControlInput477"
                              placeholder="Email ID"
                              name="emailid"
                              value={formData.emailid}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="col">
                            <label
                              htmlFor="exampleFormControlInput277"
                              className="form-label"
                            >
                              Password <span className="text-danger">*</span>
                            </label>
                            <input
                              type="Password"
                              className="form-control"
                              id="exampleFormControlInput277"
                              placeholder="Password"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="row g-3 mb-3">
                          <div className="col">
                            <label
                              htmlFor="exampleFormControlInput777"
                              className="form-label"
                            >
                              Phone
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleFormControlInput777"
                              placeholder="Phone"
                              maxLength={14}
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="row g-3 mb-3">
                          <div className="col">
                            <label className="form-label">Department</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter department or select"
                              name="department"
                              value={formData.department}
                              onChange={handleChange}
                            />
                            {/* <select
                              className="form-select mt-2"
                              aria-label="Department options"
                              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            >
                              <option value="">Select Department</option>
                              <option value="Web Development">Web Development</option>
                              <option value="IT Management">IT Management</option>
                              <option value="Marketing">Marketing</option>
                              <option value="Manager">Manager</option>
                              <button>Add Department</button>
                            </select> */}
                          </div>
                          <div className="col">
                            <label className="form-label">Designation</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter designation"
                              name="designation"
                              value={formData.designation}
                              onChange={handleChange}
                            />
                            {/* <select
                              className="form-select"
                              aria-label="Default select Project Category"
                              name="designation"
                              value={formData.designation}
                              onChange={handleChange}
                            >
                              <option value={""}>Select Designation</option>
                              <option value={"UI/UX Design"}>
                                UI/UX Design
                              </option>
                              <option value={"Website Design"}>
                                Web Design
                              </option>
                              <option value={"App Development"}>
                                App Development
                              </option>
                              <option value={"Quality Assurance"}>
                                Quality Assurance
                              </option>
                              <option value={"Fontend Development"}>Frontend Development</option>
                              <option value={"Backend Development"}>
                                Backend Development
                              </option>
                              <option value={"Software Testing"}>
                                Software Testing
                              </option>
                              <option value={"Digital Marketing"}>Digital Marketing</option>
                              <option value={"SEO"}>SEO</option>
                              <option value={"Project Manager"}>
                                Project Manager
                              </option>
                              <option value={"Other"}>Other</option>
                            </select> */}
                          </div>
                        </div>
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
                                  value={formData.linkedin}
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
                                  value={formData.instagram}
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
                                  value={formData.youtube}
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
                                  value={formData.facebook}
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
                                  value={formData.github}
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
                                  value={formData.website}
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
                                  value={formData.other}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

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
                                  value={formData.bankName || ''} // Use employeeData for edit form
                                  onChange={handleChange} // Use updateChange for edit form
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
                                  value={formData.accountHolderName || ''} // Use employeeData for edit form
                                  onChange={handleChange} // Use updateChange for edit form
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
                                  value={formData.accountNumber || ''} // Use employeeData for edit form
                                  onChange={handleChange} // Use updateChange for edit form
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
                                  value={formData.ifscCode || ''} // Use employeeData for edit form
                                  onChange={handleChange} // Use updateChange for edit form
                                />
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="input-group mb-3">
                                <span className="input-group-text"><i className="bi bi-wallet2"></i></span>
                                <select
                                  className="form-select"
                                  name="accountType"
                                  value={formData.accountType || ''} // Use employeeData for edit form
                                  onChange={handleChange} // Use updateChange for edit form
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
                                  value={formData.upiId || ''} // Use employeeData for edit form
                                  onChange={handleChange} // Use updateChange for edit form
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
                                  onChange={handleFileChange} // Use updateChange for edit form
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
                                  value={formData.paymentApp || ''} // Use employeeData for edit form
                                  onChange={handleChange} // Use updateChange for edit form
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                      </form>
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="exampleFormControlTextarea78"
                        className="form-label"
                      >
                        Description (optional)
                      </label>
                      <textarea
                        className="form-control"
                        id="exampleFormControlTextarea78"
                        rows={3}
                        placeholder="Add any extra details about the request"
                        defaultValue={""}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      data-bs-dismiss="modal"
                    >
                      Done
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSubmit}
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Modal  Delete Folder/ File*/}
            <div
              className="modal fade"
              id="deleteproject"
              tabIndex={-1}
              aria-hidden="true"
            >
              <div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5
                      className="modal-title  fw-bold"
                      id="deleteprojectLabel"
                    >
                      {" "}
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
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* PDF Viewer Modal */}
            {pdfUrl && (
              <div
                className="modal"
                style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
                onClick={handlePdfModalBackdropClick}
              >
                <div className="modal-dialog modal-dialog-centered modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">{selectedImageDetails.name}</h5>
                      <button type="button" className="btn-close" onClick={closePdfViewer}></button>
                    </div>
                    <div className="modal-body">
                      <iframe src={pdfUrl} style={{ width: '100%', height: '500px' }} title="PDF Viewer"></iframe>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Image Viewer Modal */}
            {selectedImageDetails.url && !pdfUrl && (
              <div
                className="modal"
                style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
                onClick={handleImageModalBackdropClick}
              >
                <div className="modal-dialog modal-dialog-centered modal-lg">
                  <div className="modal-content" style={{ marginLeft: '5rem' }}>
                    <div className="modal-header">
                      <h5 className="modal-title">{selectedImageDetails.name}</h5>
                      <button type="button" className="btn-close" onClick={closeImageModal}></button>
                    </div>
                    <div className="modal-body">
                      <img src={selectedImageDetails.url} alt="Enlarged view" style={{ width: '100%', height: '500px', objectFit: 'contain' }} />
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
                      {selectedEmployee?.employeeName || 'Employee'}'s Bank Details
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
                              <span className="me-2">{selectedEmployee?.bankDetails?.bankName || 'Not provided'}</span>
                              {selectedEmployee?.bankDetails?.bankName && (
                                <i
                                  className="bi bi-clipboard cursor-pointer"
                                  onClick={() => {
                                    navigator.clipboard.writeText(selectedEmployee.bankDetails.bankName);
                                    toast.success('Bank Name copied!');
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
                              <span className="me-2">{selectedEmployee?.bankDetails?.accountHolderName || 'Not provided'}</span>
                              {selectedEmployee?.bankDetails?.accountHolderName && (
                                <i
                                  className="bi bi-clipboard cursor-pointer"
                                  onClick={() => {
                                    navigator.clipboard.writeText(selectedEmployee.bankDetails.accountHolderName);
                                    toast.success('Account Holder Name copied!');
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
                              <span className="me-2">{selectedEmployee?.bankDetails?.accountNumber || 'Not provided'}</span>
                              {selectedEmployee?.bankDetails?.accountNumber && (
                                <i
                                  className="bi bi-clipboard cursor-pointer"
                                  onClick={() => {
                                    navigator.clipboard.writeText(selectedEmployee.bankDetails.accountNumber);
                                    toast.success('Account Number copied!');
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
                              <span className="me-2">{selectedEmployee?.bankDetails?.ifscCode || 'Not provided'}</span>
                              {selectedEmployee?.bankDetails?.ifscCode && (
                                <i
                                  className="bi bi-clipboard cursor-pointer"
                                  onClick={() => {
                                    navigator.clipboard.writeText(selectedEmployee.bankDetails.ifscCode);
                                    toast.success('IFSC Code copied!');
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
                              <span className="me-2">{selectedEmployee?.bankDetails?.accountType || 'Not provided'}</span>
                              {selectedEmployee?.bankDetails?.accountType && (
                                <i
                                  className="bi bi-clipboard cursor-pointer"
                                  onClick={() => {
                                    navigator.clipboard.writeText(selectedEmployee.bankDetails.accountType);
                                    toast.success('Account Type copied!');
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
                              <span className="me-2">{selectedEmployee?.bankDetails?.upiId || 'Not provided'}</span>
                              {selectedEmployee?.bankDetails?.upiId && (
                                <i
                                  className="bi bi-clipboard cursor-pointer"
                                  onClick={() => {
                                    navigator.clipboard.writeText(selectedEmployee.bankDetails.upiId);
                                    toast.success('UPI ID copied!');
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
                              <span className="me-2">{selectedEmployee?.bankDetails?.paymentApp || 'Not provided'}</span>
                              {selectedEmployee?.bankDetails?.paymentApp && (
                                <i
                                  className="bi bi-clipboard cursor-pointer"
                                  onClick={() => {
                                    navigator.clipboard.writeText(selectedEmployee.bankDetails.paymentApp);
                                    toast.success('Payment App copied!');
                                  }}
                                  title="Copy Payment App"
                                ></i>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {selectedEmployee?.bankDetails?.qrCode && (
                        <div className="col-md-6">
                          <div className="bank-info-item p-3 border rounded h-100">
                            <i className="bi bi-qr-code fs-4 text-dark me-2"></i>
                            <div>
                              <div className="fw-bold">QR Code</div>
                              <div className="d-flex align-items-center gap-2 mt-2">
                                <img
                                  src={`${import.meta.env.VITE_BASE_URL}${selectedEmployee.bankDetails.qrCode.replace('uploads/', '')}`}
                                  alt="QR Code"
                                  style={{ width: '100px', height: '100px', objectFit: 'contain', cursor: 'pointer' }}
                                  onClick={(e) => handleFileClick(
                                    e,
                                    `${import.meta.env.VITE_BASE_URL}${selectedEmployee.bankDetails.qrCode.replace('uploads/', '')}`,
                                    'image',
                                    `${selectedEmployee.employeeName} - QR Code`
                                  )}

                                />
                                <i
                                  className="bi bi-download fs-4 text-primary"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => handleDownload(
                                    selectedEmployee.bankDetails.qrCode,
                                    `${selectedEmployee.employeeName}_qr_code${selectedEmployee.bankDetails.qrCode.substr(selectedEmployee.bankDetails.qrCode.lastIndexOf('.'))}`
                                  )}
                                  title="Download QR Code"
                                ></i>
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
            <div className="modal fade" id="viewDocumentsModal" tabIndex={-1} aria-hidden="true" style={{ zIndex: 9998 }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title fw-bold">Employee Documents</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                  </div>
                  <div className="modal-body">
                    {selectedEmployee && (
                      <div className="row g-3">
                        <div className="col-12">
                          <h6 className="border-bottom pb-2">Resume</h6>
                          {selectedEmployee.resume ? (
                            <div className="d-flex align-items-center gap-3">
                              {selectedEmployee.resume.toLowerCase().endsWith('.pdf') ? (
                                <a href="#" onClick={(e) => handleFileClick(
                                  e,
                                  `${import.meta.env.VITE_BASE_URL}${selectedEmployee.resume}`,
                                  'pdf',
                                  selectedEmployee.employeeName
                                )}>View PDF</a>
                              ) : (
                                <img
                                  src={`${import.meta.env.VITE_BASE_URL}${selectedEmployee.resume}`}
                                  alt="Resume"
                                  className="img-thumbnail"
                                  style={{ maxWidth: '100px', cursor: 'pointer' }}
                                  onClick={(e) => handleFileClick(
                                    e,
                                    `${import.meta.env.VITE_BASE_URL}${selectedEmployee.resume}`,
                                    'image',
                                    selectedEmployee.employeeName
                                  )}
                                />
                              )}
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => handleDownload(selectedEmployee.resume, `${selectedEmployee.employeeName}_resume${selectedEmployee.resume.substr(selectedEmployee.resume.lastIndexOf('.'))}`)}
                                >
                                  <i className="bi bi-download"></i> Download
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDocumentDelete(selectedEmployee._id, 'resume')}
                                >
                                  <i className="bi bi-trash"></i> Delete
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-muted">No resume uploaded</p>
                          )}
                        </div>

                        <div className="col-12">
                          <h6 className="border-bottom pb-2">Aadhaar Card</h6>
                          {selectedEmployee.aadhaarCard ? (
                            <div className="row align-items-center g-2">
                              <div className="col-6">
                                {selectedEmployee.aadhaarCard.toLowerCase().endsWith('.pdf') ? (
                                  <a href="#" onClick={(e) => handleFileClick(
                                    e,
                                    `${import.meta.env.VITE_BASE_URL}${selectedEmployee.aadhaarCard.replace('uploads/', '')}`,
                                    'pdf',
                                    selectedEmployee.employeeName
                                  )}>View</a>
                                ) : (
                                  <img
                                    src={`${import.meta.env.VITE_BASE_URL}${selectedEmployee.aadhaarCard.replace('uploads/', '')}`}
                                    alt=""
                                    className="avatar sm img-thumbnail shadow-sm"
                                    onClick={(e) => handleFileClick(
                                      e,
                                      `${import.meta.env.VITE_BASE_URL}${selectedEmployee.aadhaarCard.replace('uploads/', '')}`,
                                      'image',
                                      selectedEmployee.employeeName
                                    )}
                                    style={{ cursor: 'pointer' }}
                                  />
                                )}
                              </div>
                              <div className="col-3 text-center">
                                <i
                                  className="bi bi-download text-primary"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => handleDownload(selectedEmployee.aadhaarCard, `${selectedEmployee.employeeName}_aadhaar${selectedEmployee.aadhaarCard.substr(selectedEmployee.aadhaarCard.lastIndexOf('.'))}`)}
                                  title="Download Aadhaar Card"
                                ></i>
                              </div>
                              <div className="col-3 text-center">
                                <i
                                  className="bi bi-trash text-danger"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => handleDocumentDelete(selectedEmployee._id, 'aadhaarCard')}
                                  title="Delete Aadhaar Card"
                                ></i>
                              </div>
                            </div>
                          ) : (
                            <p className="text-muted">No Aadhaar card uploaded</p>
                          )}
                        </div>

                        <div className="col-12">
                          <h6 className="border-bottom pb-2">PAN Card</h6>
                          {selectedEmployee.panCard ? (
                            <div className="row align-items-center g-2">
                              <div className="col-6">
                                {selectedEmployee.panCard.toLowerCase().endsWith('.pdf') ? (
                                  <a href="#" onClick={(e) => handleFileClick(
                                    e,
                                    `${import.meta.env.VITE_BASE_URL}${selectedEmployee.panCard.replace('uploads/', '')}`,
                                    'pdf',
                                    selectedEmployee.employeeName
                                  )}>View</a>
                                ) : (
                                  <img
                                    src={`${import.meta.env.VITE_BASE_URL}${selectedEmployee.panCard.replace('uploads/', '')}`}
                                    alt=""
                                    className="avatar sm img-thumbnail shadow-sm"
                                    onClick={(e) => handleFileClick(
                                      e,
                                      `${import.meta.env.VITE_BASE_URL}${selectedEmployee.panCard.replace('uploads/', '')}`,
                                      'image',
                                      selectedEmployee.employeeName
                                    )}
                                    style={{ cursor: 'pointer' }}
                                  />
                                )}
                              </div>
                              <div className="col-3 text-center">
                                <i
                                  className="bi bi-download text-primary"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => handleDownload(selectedEmployee.panCard, `${selectedEmployee.employeeName}_pan${selectedEmployee.panCard.substr(selectedEmployee.panCard.lastIndexOf('.'))}`)}
                                  title="Download Pan Card"
                                ></i>
                              </div>
                              <div className="col-3 text-center">
                                <i
                                  className="bi bi-trash text-danger"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => handleDocumentDelete(selectedEmployee._id, 'panCard')}
                                  title="Delete Pan Card"
                                ></i>
                              </div>
                            </div>
                          ) : (
                            <p className="text-muted">No PAN card uploaded</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  </div>
                </div>
              </div>
            </div>

          </>
        </div>
        <ToastContainer />
        <FloatingMenu userType="admin" isMobile={isMobile} />
      </div>
      <style>
        {`
          .arrow-link {
  display: inline-block;
  transition: transform 0.2s ease;
}

.arrow-link:hover {
  transform: translateX(5px);
}

.bank-info-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.bank-info-item:hover {
  background-color: #f8f9fa;
}
        `}
      </style>
    </>
  );
};

export default Member;