import React, { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Loading.css"
import FloatingMenu from '../Chats/FloatingMenu'


const Client = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [selectedClient, setSelectedClient] = useState(null);

    // Create a client
    const [formData, setFormData] = useState({
        clientName: '',
        clientEmail: '',
        clientPassword: '',
        clientPhone: '',
        clientAddress: '',
        clientDL: null,
        clientPassport: null,
        clientAgentID: null,
        clientGovtID: null,
        clientImage: null, // Initialize clientImage state to null
        accountNumber: '',
        accountType: '',
        accountHolderName: '',
        ifscCode: '',
        bankName: '',
        upiId: '',
        qrCode: '',
        paymentApp: '',
    });
    const handleChange = (e) => {
        const { name, type } = e.target;
        
        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                [name]: e.target.files[0]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: e.target.value
            }));
        }
    };
    const handleImageChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.files[0], // Store the selected file in the appropriate state field
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('clientName', formData.clientName);
            formDataToSend.append('clientEmail', formData.clientEmail);
            formDataToSend.append('clientPassword', formData.clientPassword);
            formDataToSend.append('clientPhone', formData.clientPhone);
            formDataToSend.append('clientAddress', formData.clientAddress);
            formDataToSend.append('clientImage', formData.clientImage);
            formDataToSend.append('accountNumber', formData.accountNumber);
            formDataToSend.append('accountType', formData.accountType);
            formDataToSend.append('accountHolderName', formData.accountHolderName);
            formDataToSend.append('ifscCode', formData.ifscCode);
            formDataToSend.append('bankName', formData.bankName);
            formDataToSend.append('upiId', formData.upiId);
            formDataToSend.append('qrCode', formData.qrCode);
            formDataToSend.append('paymentApp', formData.paymentApp);

            // Append document images if they exist
            if (formData.clientDL) formDataToSend.append('clientDL', formData.clientDL);
            if (formData.clientPassport) formDataToSend.append('clientPassport', formData.clientPassport);
            if (formData.clientAgentID) formDataToSend.append('clientAgentID', formData.clientAgentID);
            if (formData.clientGovtID) formDataToSend.append('clientGovtID', formData.clientGovtID);
            if (formData.qrCode) formDataToSend.append('qrCode', formData.qrCode);

            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}api/clients`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const newClient = response.data;
            setClients((prevClient) => [newClient, ...prevClient]);
            setFormData({
                clientName: '',
                clientEmail: '',
                clientPassword: '',
                clientPhone: '',
                clientAddress: '',
                clientDL: null,
                clientPassport: null,
                clientAgentID: null,
                clientGovtID: null,
                clientImage: null,
                accountNumber: '',
                accountType: '',
                accountHolderName: '',
                ifscCode: '',
                bankName: '',
                upiId: '',
                qrCode: '',
                paymentApp: '',
            });
            // Close the modal programmatically
            const modalElement = document.getElementById("createproject");
            const modal = window.bootstrap.Modal.getInstance(modalElement);
            modal.hide();

            toast.success("Client Added Successfully!", {
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
            console.error('Error creating client:', error);
            // Handle error, show error message to the user, etc.
        }
    };

    //Get All Client
    useEffect(() => {
        const fetchClients = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/clients`);
                // console.log(response.data);
                setClients(response.data);
            } catch (error) {
                console.error('Error fetching clients:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    //Search By Name
    const [searchQuery, setSearchQuery] = useState('');
    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/search?name=${searchQuery}`);
            setClients(response.data);
            // setErrorMessage('');
        } catch (error) {
            console.error('Error searching clients:', error);
            setClients([]);
            // setErrorMessage('Error searching clients. Please try again later.');
        }
    };

    //Update a Client
    const [clientData, setClientData] = useState({
        clientName: '',
        clientEmail: '',
        clientPassword: '',
        clientPhone: '',
        clientAddress: '',
        clientDL: null,
        clientPassport: null,
        clientAgentID: null,
        clientGovtID: null,
        clientImage: null,
        accountNumber: '',
        accountType: '',
        accountHolderName: '',
        ifscCode: '',
        bankName: '',
        upiId: '',
        qrCode: '',
        paymentApp: ''
    });
    const [toEdit, setToEdit] = useState("");

    useEffect(() => {
        const fetchClientData = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}api/clients/${toEdit}`
                );


                setClientData({
                    clientName: response.data.clientName,
                    clientEmail: response.data.clientEmail,
                    clientPassword: response.data.clientPassword,
                    clientPhone: response.data.clientPhone,
                    clientAddress: response.data.clientAddress,
                    clientDL: response.data.clientDL,
                    clientPassport: response.data.clientPassport,
                    clientAgentID: response.data.clientAgentID,
                    clientGovtID: response.data.clientGovtID,
                    clientImage: response.data.clientImage,
                    accountNumber: response.data.bankDetails?.accountNumber || '',
                    accountType: response.data.bankDetails?.accountType || '',
                    accountHolderName: response.data.bankDetails?.accountHolderName || '',
                    ifscCode: response.data.bankDetails?.ifscCode || '',
                    bankName: response.data.bankDetails?.bankName || '',
                    upiId: response.data.bankDetails?.upiId || '',
                    qrCode: response.data.bankDetails?.qrCode || '',
                    paymentApp: response.data.bankDetails?.paymentApp || ''
                });
            } catch (error) {
                console.error('Error fetching client data:', error);
            }
        };

        if (toEdit) {
            fetchClientData();
        }
    }, [toEdit]);

    const updateChange = (e) => {
        const { name, value, files } = e.target;
        setClientData((prevState) => ({
            ...prevState,
            [name]: files ? files[0] : value,
        }));
    };

    const updateSubmit = async (e) => {
        e.preventDefault();
        try {
            const updateDataToSend = new FormData();
            Object.keys(clientData).forEach(key => {
                // Check if clientImage is a file and append correctly
                if (key === "clientImage" && clientData[key] instanceof File) {
                    updateDataToSend.append(key, clientData[key]);
                } else if (key === "qrCode" && clientData[key] instanceof File) {
                    updateDataToSend.append(key, clientData[key]);
                } else {
                    updateDataToSend.append(key, clientData[key]);
                }
            });

            const response = await axios.put(
                `${import.meta.env.VITE_BASE_URL}api/clients/${toEdit}`,
                updateDataToSend,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.status === 200) {
                // console.log('Client updated successfully');
            }

            //  Close the modal programmatically
            const modalElement = document.getElementById("editproject");
            const modal = window.bootstrap.Modal.getInstance(modalElement);
            modal.hide();

            toast.success("Client Updated", {
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
            console.error('Error updating client:', error);
        }
    };



    //Delete a Client
    const [deletableId, setDeletableId] = useState("");
    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_BASE_URL}api/clients/${deletableId}`
            );
            const remainingClitent = clients.filter((prevClient) => {
                return prevClient._id !== deletableId
            })
            setClients(remainingClitent); // Update state to remove deleted client
            const modalElement = document.getElementById("deleteproject");
            const modal = window.bootstrap.Modal.getInstance(modalElement);
            modal.hide();

            toast.error("Client Deleted Successfully!", {
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
            console.error('Error deleting client:', error);
        }
    };

    // Add this state for password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showEditPassword, setShowEditPassword] = useState(false);

    // Handle file click for preview
    const handleFileClick = (e, url, type, title) => {
        e.preventDefault();
        // Create a modal to display the file
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '9999';
        modal.style.padding = '20px';
        modal.style.flexDirection = 'column';

        // Add title
        const titleElement = document.createElement('h3');
        titleElement.textContent = title;
        titleElement.style.color = 'white';
        titleElement.style.marginBottom = '20px';
        modal.appendChild(titleElement);

        // Add content based on type
        if (type === 'image') {
            const img = document.createElement('img');
            img.src = url;
            img.style.maxWidth = '70%';
            img.style.maxHeight = '70%';
            img.style.marginLeft = '5rem';
            img.style.objectFit = 'contain';
            modal.appendChild(img);
        } else {
            const iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.style.width = '90%';
            iframe.style.height = '80%';
            iframe.style.border = 'none';
            modal.appendChild(iframe);
        }

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.marginTop = '20px';
        closeButton.style.padding = '10px 20px';
        closeButton.style.backgroundColor = '#0d6efd';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = () => {
            document.body.removeChild(modal);
        };
        modal.appendChild(closeButton);

        // Add modal to body
        document.body.appendChild(modal);
    };

    // Handle file download
    const handleDownload = async (filePath, fileName) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}${filePath}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('File downloaded successfully!');
        } catch (error) {
            console.error('Error downloading file:', error);
            toast.error('Error downloading file');
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
                                        <div className="card border-0 mb-2 no-bg">
                                            <div className="card-header py-4 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between" style={{
                                                borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
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
                                                        background: 'linear-gradient(to bottom, #ff8a00, #ff5e00)',
                                                        borderRadius: '3px'
                                                    }}></span>
                                                    Clients
                                                </h3>
                                                <div className="col-auto d-flex">
                                                    <button
                                                        type="button"
                                                        className="btn mb-3 mb-sm-0 me-sm-3"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#createproject"
                                                        style={{
                                                            background: 'linear-gradient(135deg, #52b447, #429938)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            padding: '10px 18px',
                                                            fontWeight: '600',
                                                            boxShadow: '0 4px 10px rgba(82, 180, 71, 0.2)',
                                                            transition: 'all 0.2s ease',
                                                            fontSize: '14px'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                            e.currentTarget.style.boxShadow = '0 6px 12px rgba(82, 180, 71, 0.3)';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = '0 4px 10px rgba(82, 180, 71, 0.2)';
                                                        }}
                                                    >
                                                        <i className="icofont-plus-circle me-2" style={{ fontSize: '16px' }} />
                                                        Add Client
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
                                                            value={searchQuery}
                                                            onChange={(e) => {
                                                                setSearchQuery(e.target.value);
                                                                handleSearchSubmit(e.target.value);
                                                            }}
                                                            placeholder="Enter Member Name"
                                                            style={{
                                                                border: '1px solid rgba(82, 180, 71, 0.2)',
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
                                                            onClick={handleSearchSubmit}
                                                            style={{
                                                                backgroundColor: '#52b447',
                                                                border: 'none',
                                                                color: 'white',
                                                                padding: '0 15px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <i className="fa fa-search" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Row End */}
                                {loading ? (
                                    <div className="custom-loader "></div>
                                ) : clients.length === 0 ? (
                                    <div className="text-center mt-4">
                                        <h1 className="text-muted">No Members available. Please add a Member.</h1>
                                    </div>
                                ) : (
                                    viewMode === 'grid' ? (
                                        // Existing grid view
                                        <div className="row g-3 row-cols-1 row-cols-sm-1 row-cols-md-2 row-cols-lg-2 row-cols-xl-2 row-cols-xxl-2">
                                            {clients.map((client, index) => (
                                                <div className="col" key={client._id}>
                                                    <div className="card" style={{
                                                        borderRadius: '20px',
                                                        border: 'none',
                                                        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                                                        transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                                                        overflow: 'hidden',
                                                        position: 'relative',
                                                        backgroundColor: '#ffffff'
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
                                                            background: 'linear-gradient(90deg, #2e7d32, #52b447, #ff8a00)',
                                                            opacity: 0.9
                                                        }}></div>

                                                        <div className="card-body" style={{ padding: '28px' }}>
                                                            {/* Header Section */}
                                                            <div className="d-flex align-items-center gap-4 mb-4">
                                                                {/* Client Number & Image */}
                                                                <div className="d-flex align-items-center gap-4">
                                                                    <span style={{
                                                                        background: 'linear-gradient(135deg, #2e7d32, #52b447)',
                                                                        color: 'white',
                                                                        borderRadius: '12px',
                                                                        width: '40px',
                                                                        height: '40px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontWeight: '600',
                                                                        fontSize: '16px',
                                                                        boxShadow: '0 4px 15px rgba(82, 180, 71, 0.3)',
                                                                        border: '2px solid rgba(255, 255, 255, 0.8)'
                                                                    }}>
                                                                        {index + 1}
                                                                    </span>

                                                                    <div style={{
                                                                        width: '60px',
                                                                        height: '60px',
                                                                        borderRadius: '16px',
                                                                        overflow: 'hidden',
                                                                        border: '3px solid #52b447',
                                                                        backgroundColor: 'white',
                                                                        boxShadow: '0 4px 15px rgba(82, 180, 71, 0.2)'
                                                                    }}>
                                                                        <img
                                                                            src={`${import.meta.env.VITE_BASE_URL}${client.clientImage}`}
                                                                            alt={client.clientName}
                                                                            style={{
                                                                                width: '100%',
                                                                                height: '100%',
                                                                                objectFit: 'cover',
                                                                                transition: 'transform 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)'
                                                                            }}
                                                                            onMouseEnter={(e) => {
                                                                                e.target.style.transform = 'scale(1.2) rotate(3deg)';
                                                                            }}
                                                                            onMouseLeave={(e) => {
                                                                                e.target.style.transform = 'scale(1) rotate(0deg)';
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Client Name and Actions */}
                                                                <div className="d-flex justify-content-between align-items-center flex-grow-1">
                                                                    <div>
                                                                        <h5 className="mb-1" style={{
                                                                            color: '#1a1a1a',
                                                                            fontWeight: '700',
                                                                            fontSize: '18px',
                                                                            letterSpacing: '-0.3px'
                                                                    }}>
                                                                        {client.clientName}
                                                                    </h5>
                                                                        <span style={{
                                                                            fontSize: '13px',
                                                                            color: '#666',
                                                                            fontWeight: '500'
                                                                        }}>
                                                                            Client ID: #{client._id.slice(-6)}
                                                                        </span>
                                                                    </div>

                                                                    <div className="d-flex gap-2">
                                                                        <button
                                                                            type="button"
                                                                            className="btn"
                                                                            data-bs-toggle="modal"
                                                                            data-bs-target="#editproject"
                                                                            onClick={() => setToEdit(client._id)}
                                                                            style={{
                                                                                backgroundColor: 'rgba(82, 180, 71, 0.08)',
                                                                                color: '#2e7d32',
                                                                                width: '38px',
                                                                                height: '38px',
                                                                                borderRadius: '12px',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                border: 'none',
                                                                                transition: 'all 0.3s ease'
                                                                            }}
                                                                            onMouseOver={(e) => {
                                                                                e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.15)';
                                                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                                            }}
                                                                            onMouseOut={(e) => {
                                                                                e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.08)';
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
                                                                            onClick={() => setDeletableId(client._id)}
                                                                            style={{
                                                                                backgroundColor: 'rgba(255, 138, 0, 0.08)',
                                                                                color: '#ff8a00',
                                                                                width: '38px',
                                                                                height: '38px',
                                                                                borderRadius: '12px',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                border: 'none',
                                                                                transition: 'all 0.3s ease'
                                                                            }}
                                                                            onMouseOver={(e) => {
                                                                                e.currentTarget.style.backgroundColor = 'rgba(255, 138, 0, 0.15)';
                                                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                                            }}
                                                                            onMouseOut={(e) => {
                                                                                e.currentTarget.style.backgroundColor = 'rgba(255, 138, 0, 0.08)';
                                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                                            }}
                                                                        >
                                                                            <i className="icofont-ui-delete" style={{ fontSize: '16px' }}></i>
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
                                                                            <i className="bi bi-telephone-fill" style={{ color: '#2e7d32', fontSize: '14px' }}></i>
                                                                            </div>
                                                                        <div style={{ minWidth: 0 }}> {/* Added minWidth: 0 for better text truncation */}
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
                                                                            }}>{client.clientPhone}</div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                                <div style={{
                                                                    flex: 1,
                                                                    padding: '12px',
                                                                    borderRadius: '12px',
                                                                    backgroundColor: 'rgba(255, 138, 0, 0.04)',
                                                                    border: '1px solid rgba(255, 138, 0, 0.15)',
                                                                    transition: 'all 0.3s ease'
                                                                }}
                                                                    onMouseOver={(e) => {
                                                                        e.currentTarget.style.backgroundColor = 'rgba(255, 138, 0, 0.08)';
                                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                                    }}
                                                                    onMouseOut={(e) => {
                                                                        e.currentTarget.style.backgroundColor = 'rgba(255, 138, 0, 0.04)';
                                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                                    }}>
                                                                    <div className="d-flex align-items-center">
                                                                        <div style={{
                                                                            width: '32px',
                                                                            height: '32px',
                                                                            borderRadius: '8px',
                                                                            backgroundColor: 'rgba(255, 138, 0, 0.1)',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            marginRight: '10px'
                                                                        }}>
                                                                            <i className="bi bi-envelope-fill" style={{ color: '#ff8a00', fontSize: '14px' }}></i>
                                                                        </div>
                                                                        <div style={{ minWidth: 0 }}> {/* Added minWidth: 0 for better text truncation */}
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
                                                                            }}>{client.clientEmail}</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            {/* Bottom Actions */}
                                                            <div className="d-flex gap-3">
                                                                    <button
                                                                        type="button"
                                                                    className="btn flex-grow-1"
                                                                        data-bs-toggle="modal"
                                                                        data-bs-target="#bankDetailsModal"
                                                                        onClick={() => setSelectedClient(client)}
                                                                        style={{
                                                                        backgroundColor: 'rgba(82, 180, 71, 0.08)',
                                                                        color: '#2e7d32',
                                                                            border: 'none',
                                                                        borderRadius: '12px',
                                                                        padding: '12px 20px',
                                                                        fontSize: '14px',
                                                                            fontWeight: '600',
                                                                        transition: 'all 0.3s ease'
                                                                        }}
                                                                        onMouseOver={(e) => {
                                                                        e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.15)';
                                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                                        }}
                                                                        onMouseOut={(e) => {
                                                                        e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.08)';
                                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                                        }}
                                                                    >
                                                                    <i className="bi bi-bank me-2"></i>
                                                                    Bank Details
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                    className="btn flex-grow-1"
                                                                        data-bs-toggle="modal"
                                                                        data-bs-target="#documentsDetailsModal"
                                                                        onClick={() => setSelectedClient(client)}
                                                                        style={{
                                                                        backgroundColor: 'rgba(255, 138, 0, 0.08)',
                                                                            color: '#ff8a00',
                                                                            border: 'none',
                                                                        borderRadius: '12px',
                                                                        padding: '12px 20px',
                                                                        fontSize: '14px',
                                                                            fontWeight: '600',
                                                                        transition: 'all 0.3s ease'
                                                                        }}
                                                                        onMouseOver={(e) => {
                                                                        e.currentTarget.style.backgroundColor = 'rgba(255, 138, 0, 0.15)';
                                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                                        }}
                                                                        onMouseOut={(e) => {
                                                                        e.currentTarget.style.backgroundColor = 'rgba(255, 138, 0, 0.08)';
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
                                            ))}
                                        </div>
                                    ) : (
                                        // New list view
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
                                                                        borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                                                        textAlign: 'center',
                                                                        fontSize: '14px'
                                                                    }}>Sr.No.</th>
                                                                    <th style={{
                                                                        padding: '16px 15px',
                                                                        fontWeight: '600',
                                                                        color: '#444',
                                                                        borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                                                        fontSize: '14px'
                                                                    }}>Client Name</th>
                                                                    <th style={{
                                                                        padding: '16px 15px',
                                                                        fontWeight: '600',
                                                                        color: '#444',
                                                                        borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                                                        fontSize: '14px'
                                                                    }}>Contact Info</th>
                                                                    <th style={{
                                                                        padding: '16px 15px',
                                                                        fontWeight: '600',
                                                                        color: '#444',
                                                                        borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                                                        fontSize: '14px'
                                                                    }}>Address</th>
                                                                    <th style={{
                                                                        padding: '16px 15px',
                                                                        fontWeight: '600',
                                                                        color: '#444',
                                                                        borderBottom: '2px solid rgba(82, 180, 71, 0.2)',
                                                                        textAlign: 'center',
                                                                        fontSize: '14px'
                                                                    }}>Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {clients.map((client, index) => (
                                                                    <tr key={client._id}
                                                                        style={{
                                                                            transition: 'background 0.2s ease',
                                                                        }}
                                                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(82, 180, 71, 0.04)'}
                                                                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                                                    >
                                                                        <td style={{
                                                                            padding: '16px 15px',
                                                                            borderBottom: '1px solid rgba(0,0,0,0.05)',
                                                                            textAlign: 'center'
                                                                        }}>
                                                                            <span style={{
                                                                                background: 'linear-gradient(135deg, #52b447, #2e7d32)',
                                                                                color: 'white',
                                                                                borderRadius: '50%',
                                                                                width: '30px',
                                                                                height: '30px',
                                                                                display: 'inline-flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                fontWeight: '600',
                                                                                fontSize: '14px',
                                                                                boxShadow: '0 2px 5px rgba(82, 180, 71, 0.3)'
                                                                            }}>
                                                                                {index + 1}
                                                                            </span>
                                                                        </td>
                                                                        <td style={{
                                                                            padding: '16px 15px',
                                                                            borderBottom: '1px solid rgba(0,0,0,0.05)'
                                                                        }}>
                                                                            <div className="d-flex align-items-center gap-3">
                                                                                <img
                                                                                    src={`${import.meta.env.VITE_BASE_URL}${client.clientImage}`}
                                                                                    alt={client.clientName}
                                                                                    className="rounded-circle"
                                                                                    style={{
                                                                                        width: '40px',
                                                                                        height: '40px',
                                                                                        objectFit: 'cover',
                                                                                        border: '2px solid #52b447',
                                                                                        padding: '2px'
                                                                                    }}
                                                                                />
                                                                                <div>
                                                                                    <div style={{
                                                                                        fontWeight: '600',
                                                                                        color: '#333',
                                                                                        fontSize: '14px'
                                                                                    }}>{client.clientName}</div>
                                                                                    <div style={{
                                                                                        fontSize: '12px',
                                                                                        color: '#666',
                                                                                        marginTop: '2px'
                                                                                    }}>ID: #{client._id.slice(-6)}</div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td style={{
                                                                            padding: '16px 15px',
                                                                            borderBottom: '1px solid rgba(0,0,0,0.05)'
                                                                        }}>
                                                                            <div>
                                                                                <div style={{
                                                                                    backgroundColor: 'rgba(82, 180, 71, 0.08)',
                                                                                    padding: '6px 12px',
                                                                                    borderRadius: '6px',
                                                                                    marginBottom: '6px',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: '8px'
                                                                                }}>
                                                                                    <i className="bi bi-telephone-fill" style={{ color: '#52b447', fontSize: '14px' }}></i>
                                                                                    <span style={{ fontSize: '13px', color: '#333' }}>{client.clientPhone}</span>
                                                                                    </div>
                                                                                <div style={{
                                                                                    backgroundColor: 'rgba(255, 138, 0, 0.08)',
                                                                                    padding: '6px 12px',
                                                                                    borderRadius: '6px',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: '8px'
                                                                                }}>
                                                                                    <i className="bi bi-envelope-fill" style={{ color: '#ff8a00', fontSize: '14px' }}></i>
                                                                                    <span style={{ fontSize: '13px', color: '#333' }}>{client.clientEmail}</span>
                                                                                    </div>
                                                                                    </div>
                                                                        </td>
                                                                        <td style={{
                                                                            padding: '16px 15px',
                                                                            borderBottom: '1px solid rgba(0,0,0,0.05)'
                                                                        }}>
                                                                            <div style={{
                                                                                backgroundColor: 'rgba(255, 94, 0, 0.08)',
                                                                                padding: '6px 12px',
                                                                                borderRadius: '6px',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: '8px'
                                                                            }}>
                                                                                <i className="bi bi-geo-alt-fill" style={{ color: '#ff5e00', fontSize: '14px' }}></i>
                                                                                <span style={{ fontSize: '13px', color: '#333' }}>{client.clientAddress}</span>
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
                                                                                    data-bs-toggle="modal"
                                                                                    data-bs-target="#bankDetailsModal"
                                                                                    onClick={() => setSelectedClient(client)}
                                                                                    style={{
                                                                                        backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                                                                        color: '#52b447',
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
                                                                                        e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.2)';
                                                                                    }}
                                                                                    onMouseOut={(e) => {
                                                                                        e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.1)';
                                                                                    }}
                                                                                >
                                                                                    <i className="bi bi-bank"></i>
                                                                                </button>

                                                                                <button
                                                                                    type="button"
                                                                                    className="btn"
                                                                                    data-bs-toggle="modal"
                                                                                    data-bs-target="#documentsDetailsModal"
                                                                                    onClick={() => setSelectedClient(client)}
                                                                                    style={{
                                                                                        backgroundColor: 'rgba(255, 138, 0, 0.1)',
                                                                                        color: '#ff8a00',
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
                                                                                        e.currentTarget.style.backgroundColor = 'rgba(255, 138, 0, 0.2)';
                                                                                    }}
                                                                                    onMouseOut={(e) => {
                                                                                        e.currentTarget.style.backgroundColor = 'rgba(255, 138, 0, 0.1)';
                                                                                    }}
                                                                                >
                                                                                    <i className="bi bi-file-earmark-text"></i>
                                                                                </button>

                                                                                <button
                                                                                    type="button"
                                                                                    className="btn"
                                                                                    data-bs-toggle="modal"
                                                                                    data-bs-target="#editproject"
                                                                                    onClick={() => setToEdit(client._id)}
                                                                                    style={{
                                                                                        backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                                                                        color: '#52b447',
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
                                                                                        e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.2)';
                                                                                    }}
                                                                                    onMouseOut={(e) => {
                                                                                        e.currentTarget.style.backgroundColor = 'rgba(82, 180, 71, 0.1)';
                                                                                    }}
                                                                                >
                                                                                    <i className="icofont-edit"></i>
                                                                                </button>

                                                                                <button
                                                                                    type="button"
                                                                                    className="btn"
                                                                                    data-bs-toggle="modal"
                                                                                    data-bs-target="#deleteproject"
                                                                                    onClick={() => setDeletableId(client._id)}
                                                                                    style={{
                                                                                        backgroundColor: 'rgba(255, 94, 0, 0.1)',
                                                                                        color: '#ff5e00',
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
                                                                                        e.currentTarget.style.backgroundColor = 'rgba(255, 94, 0, 0.2)';
                                                                                    }}
                                                                                    onMouseOut={(e) => {
                                                                                        e.currentTarget.style.backgroundColor = 'rgba(255, 94, 0, 0.1)';
                                                                                    }}
                                                                                >
                                                                                    <i className="icofont-ui-delete"></i>
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
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
                    </>


                    <>
                        {/* Create Client*/}
                        <div
                            className="modal fade"
                            id="createproject"
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
                                            Add Member
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
                                        {/* Member Name */}
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
                                                Member Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Member Name"
                                                name="clientName"
                                                value={formData.clientName}
                                                onChange={handleChange}
                                                style={{
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(82, 180, 71, 0.3)',
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
                                                Profile Image
                                            </label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                name="clientImage"
                                                onChange={handleImageChange}
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

                                        {/* Documents Section */}
                                        <div className="mb-4">
                                            <label style={{
                                                fontWeight: '600',
                                                color: '#444',
                                                fontSize: '14px',
                                                marginBottom: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}>
                                                <i className="icofont-papers" style={{ color: '#52b447' }}></i>
                                                Documents
                                            </label>
                                            <div className="row g-3" style={{
                                                backgroundColor: 'rgba(82, 180, 71, 0.03)',
                                                padding: '15px',
                                                borderRadius: '10px',
                                                border: '1px solid rgba(82, 180, 71, 0.2)'
                                            }}>
                                            <div className="col-md-6">
                                                    <div style={{ marginBottom: '15px' }}>
                                                        <label className="form-label" style={{
                                                            fontSize: '13px',
                                                            color: '#666',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '5px',
                                                            marginBottom: '5px'
                                                        }}>
                                                            <i className="icofont-license" style={{ color: '#52b447' }}></i>
                                                    Driving License
                                                </label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    name="clientDL"
                                                    onChange={handleImageChange}
                                                            style={{
                                                                borderRadius: '6px',
                                                                border: '1px solid rgba(82, 180, 71, 0.2)',
                                                                padding: '8px 12px',
                                                                fontSize: '13px',
                                                                backgroundColor: 'white'
                                                            }}
                                                        />
                                                    </div>
                                            </div>
                                            <div className="col-md-6">
                                                    <div style={{ marginBottom: '15px' }}>
                                                        <label className="form-label" style={{
                                                            fontSize: '13px',
                                                            color: '#666',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '5px',
                                                            marginBottom: '5px'
                                                        }}>
                                                            <i className="icofont-passport" style={{ color: '#ff5e00' }}></i>
                                                    Passport
                                                </label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    name="clientPassport"
                                                    onChange={handleImageChange}
                                                            style={{
                                                                borderRadius: '6px',
                                                                border: '1px solid rgba(255, 94, 0, 0.2)',
                                                                padding: '8px 12px',
                                                                fontSize: '13px',
                                                                backgroundColor: 'white'
                                                            }}
                                                        />
                                                    </div>
                                            </div>
                                            <div className="col-md-6">
                                                    <div style={{ marginBottom: '15px' }}>
                                                        <label className="form-label" style={{
                                                            fontSize: '13px',
                                                            color: '#666',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '5px',
                                                            marginBottom: '5px'
                                                        }}>
                                                            <i className="icofont-id" style={{ color: '#52b447' }}></i>
                                                    Agent ID
                                                </label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    name="clientAgentID"
                                                    onChange={handleImageChange}
                                                            style={{
                                                                borderRadius: '6px',
                                                                border: '1px solid rgba(82, 180, 71, 0.2)',
                                                                padding: '8px 12px',
                                                                fontSize: '13px',
                                                                backgroundColor: 'white'
                                                            }}
                                                        />
                                                    </div>
                                            </div>
                                            <div className="col-md-6">
                                                    <div style={{ marginBottom: '15px' }}>
                                                        <label className="form-label" style={{
                                                            fontSize: '13px',
                                                            color: '#666',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '5px',
                                                            marginBottom: '5px'
                                                        }}>
                                                            <i className="icofont-card" style={{ color: '#ff5e00' }}></i>
                                                    Government ID
                                                </label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    name="clientGovtID"
                                                    onChange={handleImageChange}
                                                            style={{
                                                                borderRadius: '6px',
                                                                border: '1px solid rgba(255, 94, 0, 0.2)',
                                                                padding: '8px 12px',
                                                                fontSize: '13px',
                                                                backgroundColor: 'white'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
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
                                                    name="clientEmail"
                                                    value={formData.clientEmail}
                                                    onChange={handleChange}
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: '1px solid rgba(82, 180, 71, 0.3)',
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
                                                <div className="input-group" style={{
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(255, 94, 0, 0.3)',
                                                    padding: '3px',
                                                    backgroundColor: 'rgba(255, 94, 0, 0.03)'
                                                }}>
                                                            <input
                                                                type={showPassword ? "text" : "password"}
                                                                className="form-control"
                                                                placeholder="Password"
                                                                name="clientPassword"
                                                                value={formData.clientPassword}
                                                                onChange={handleChange}
                                                        style={{
                                                            border: 'none',
                                                            padding: '7px 12px',
                                                            backgroundColor: 'transparent'
                                                        }}
                                                            />
                                                            <button
                                                        className="btn"
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                        style={{
                                                            backgroundColor: 'rgba(255, 94, 0, 0.1)',
                                                            border: 'none',
                                                            color: '#ff5e00'
                                                        }}
                                                            >
                                                                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                        {/* Address */}
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
                                                <i className="icofont-location-pin" style={{ color: '#52b447' }}></i>
                                                            Address
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                placeholder="Enter complete address"
                                                name="clientAddress"
                                                value={formData.clientAddress}
                                                onChange={handleChange}
                                                style={{
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(82, 180, 71, 0.3)',
                                                    padding: '10px 15px',
                                                    color: '#333',
                                                    boxShadow: 'none'
                                                }}
                                                        />
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
                                                name="clientPhone"
                                                value={formData.clientPhone}
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

                                        {/* Bank Details */}
                                        <div className="mb-4">
                                            <label className="form-label" style={{
                                                fontWeight: '600',
                                                color: '#444',
                                                fontSize: '14px',
                                                marginBottom: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}>
                                                <i className="icofont-bank-alt" style={{ color: '#52b447' }}></i>
                                                Bank Details
                                            </label>
                                            <div className="row g-3" style={{
                                                backgroundColor: 'rgba(82, 180, 71, 0.03)',
                                                padding: '15px',
                                                borderRadius: '10px',
                                                border: '1px solid rgba(82, 180, 71, 0.2)'
                                            }}>
                                                <div className="col-md-6">
                                                    <div className="input-group">
                                                        <span className="input-group-text" style={{
                                                            backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                                            border: 'none',
                                                            color: '#52b447'
                                                        }}>
                                                            <i className="bi bi-bank"></i>
                                                        </span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Account Number"
                                                            name="accountNumber"
                                                            value={formData.accountNumber || ''}
                                                            onChange={handleChange}
                                                            style={{
                                                                border: '1px solid rgba(82, 180, 71, 0.2)',
                                                                borderLeft: 'none',
                                                                borderRadius: '0 6px 6px 0'
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="input-group">
                                                        <span className="input-group-text" style={{
                                                            backgroundColor: 'rgba(255, 94, 0, 0.1)',
                                                            border: 'none',
                                                            color: '#ff5e00'
                                                        }}>
                                                            <i className="bi bi-credit-card"></i>
                                                        </span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Account Type"
                                                            name="accountType"
                                                            value={formData.accountType || ''}
                                                            onChange={handleChange}
                                                            style={{
                                                                border: '1px solid rgba(255, 94, 0, 0.2)',
                                                                borderLeft: 'none',
                                                                borderRadius: '0 6px 6px 0'
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="input-group">
                                                        <span className="input-group-text" style={{
                                                            backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                                            border: 'none',
                                                            color: '#52b447'
                                                        }}>
                                                            <i className="bi bi-person"></i>
                                                        </span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Account Holder Name"
                                                            name="accountHolderName"
                                                            value={formData.accountHolderName || ''}
                                                            onChange={handleChange}
                                                            style={{
                                                                border: '1px solid rgba(82, 180, 71, 0.2)',
                                                                borderLeft: 'none',
                                                                borderRadius: '0 6px 6px 0'
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="input-group">
                                                        <span className="input-group-text" style={{
                                                            backgroundColor: 'rgba(255, 94, 0, 0.1)',
                                                            border: 'none',
                                                            color: '#ff5e00'
                                                        }}>
                                                            <i className="bi bi-upc"></i>
                                                        </span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="IFSC Code"
                                                            name="ifscCode"
                                                            value={formData.ifscCode || ''}
                                                            onChange={handleChange}
                                                            style={{
                                                                border: '1px solid rgba(255, 94, 0, 0.2)',
                                                                borderLeft: 'none',
                                                                borderRadius: '0 6px 6px 0'
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="input-group">
                                                        <span className="input-group-text" style={{
                                                            backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                                            border: 'none',
                                                            color: '#52b447'
                                                        }}>
                                                            <i className="bi bi-building"></i>
                                                        </span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Bank Name"
                                                            name="bankName"
                                                            value={formData.bankName || ''}
                                                            onChange={handleChange}
                                                            style={{
                                                                border: '1px solid rgba(82, 180, 71, 0.2)',
                                                                borderLeft: 'none',
                                                                borderRadius: '0 6px 6px 0'
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="input-group">
                                                        <span className="input-group-text" style={{
                                                            backgroundColor: 'rgba(255, 94, 0, 0.1)',
                                                            border: 'none',
                                                            color: '#ff5e00'
                                                        }}>
                                                            <i className="bi bi-phone"></i>
                                                        </span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="UPI ID"
                                                            name="upiId"
                                                            value={formData.upiId || ''}
                                                            onChange={handleChange}
                                                            style={{
                                                                border: '1px solid rgba(255, 94, 0, 0.2)',
                                                                borderLeft: 'none',
                                                                borderRadius: '0 6px 6px 0'
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="input-group">
                                                        <span className="input-group-text" style={{
                                                            backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                                            border: 'none',
                                                            color: '#52b447'
                                                        }}>
                                                            <i className="bi bi-qr-code"></i>
                                                        </span>
                                                        <input
                                                            type="file"
                                                            className="form-control"
                                                            placeholder="QR Code"
                                                            name="qrCode"
                                                            onChange={handleChange}
                                                            accept="image/*"  // Only accept image files
                                                            style={{
                                                                border: '1px solid rgba(82, 180, 71, 0.2)',
                                                                borderLeft: 'none',
                                                                borderRadius: '0 6px 6px 0'
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-md-6">
                                                    <div className="input-group">
                                                        <span className="input-group-text" style={{
                                                            backgroundColor: 'rgba(255, 94, 0, 0.1)',
                                                            border: 'none',
                                                            color: '#ff5e00'
                                                        }}>
                                                            <i className="bi bi-wallet2"></i>
                                                        </span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Payment App"
                                                            name="paymentApp"
                                                            value={formData.paymentApp || ''}
                                                            onChange={handleChange}
                                                            style={{
                                                                border: '1px solid rgba(255, 94, 0, 0.2)',
                                                                borderLeft: 'none',
                                                                borderRadius: '0 6px 6px 0'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="modal-footer" style={{
                                        borderTop: '1px solid rgba(82, 180, 71, 0.1)',
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
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="btn"
                                            onClick={handleSubmit}
                                            style={{
                                                background: 'linear-gradient(135deg, #52b447, #429938)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '8px 20px',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                boxShadow: '0 4px 10px rgba(82, 180, 71, 0.2)',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 6px 12px rgba(82, 180, 71, 0.3)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 4px 10px rgba(82, 180, 71, 0.2)';
                                            }}
                                        >
                                            <i className="icofont-check-circled me-2"></i>
                                            Create Member
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Update Client*/}
                        <div
                            className="modal fade"
                            id="editproject"
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
                                            <i className="icofont-edit" style={{ fontSize: '22px' }}></i>
                                            Edit Member
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
                                        {/* Member Name */}
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
                                                Member Name
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Member Name"
                                                name="clientName"
                                                value={clientData.clientName}
                                                onChange={updateChange}
                                                style={{
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(82, 180, 71, 0.3)',
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
                                                Profile Image
                                            </label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                name="clientImage"
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

                                        {/* Documents Section */}
                                        <div className="mb-4">
                                            <label style={{
                                                fontWeight: '600',
                                                color: '#444',
                                                fontSize: '14px',
                                                marginBottom: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}>
                                                <i className="icofont-papers" style={{ color: '#52b447' }}></i>
                                                Documents
                                            </label>
                                            <div className="row g-3" style={{
                                                backgroundColor: 'rgba(82, 180, 71, 0.03)',
                                                padding: '15px',
                                                borderRadius: '10px',
                                                border: '1px solid rgba(82, 180, 71, 0.2)'
                                            }}>
                                                {/* Driving License */}
                                            <div className="col-md-6">
                                                    <div style={{ marginBottom: '15px' }}>
                                                        <label className="form-label" style={{
                                                            fontSize: '13px',
                                                            color: '#666',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '5px',
                                                            marginBottom: '5px'
                                                        }}>
                                                            <i className="icofont-license" style={{ color: '#52b447' }}></i>
                                                    Driving License
                                                </label>
                                                        <div style={{
                                                            position: 'relative',
                                                            backgroundColor: 'white',
                                                            borderRadius: '8px',
                                                            border: '1px solid rgba(82, 180, 71, 0.2)',
                                                            padding: '8px'
                                                        }}>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    id="clientDLEdit"
                                                    name="clientDL"
                                                    onChange={updateChange}
                                                                style={{
                                                                    border: 'none',
                                                                    padding: '8px',
                                                                    fontSize: '13px',
                                                                    backgroundColor: 'transparent'
                                                                }}
                                                            />
                                                            {clientData?.clientDL && (
                                                                <div style={{
                                                                    marginTop: '8px',
                                                                    padding: '8px',
                                                                    backgroundColor: 'rgba(82, 180, 71, 0.05)',
                                                                    borderRadius: '6px',
                                                                    fontSize: '12px',
                                                                    color: '#52b447',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '5px'
                                                                }}>
                                                                    <i className="icofont-file-pdf"></i>
                                                                    Current file: {typeof clientData.clientDL === 'string' ?
                                                                        clientData.clientDL.split('/').pop() :
                                                                        'File selected'}
                                            </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Passport */}
                                            <div className="col-md-6">
                                                    <div style={{ marginBottom: '15px' }}>
                                                        <label className="form-label" style={{
                                                            fontSize: '13px',
                                                            color: '#666',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '5px',
                                                            marginBottom: '5px'
                                                        }}>
                                                            <i className="icofont-passport" style={{ color: '#ff5e00' }}></i>
                                                    Passport
                                                </label>
                                                        <div style={{
                                                            position: 'relative',
                                                            backgroundColor: 'white',
                                                            borderRadius: '8px',
                                                            border: '1px solid rgba(255, 94, 0, 0.2)',
                                                            padding: '8px'
                                                        }}>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    id="clientPassportEdit"
                                                    name="clientPassport"
                                                    onChange={updateChange}
                                                                style={{
                                                                    border: 'none',
                                                                    padding: '8px',
                                                                    fontSize: '13px',
                                                                    backgroundColor: 'transparent'
                                                                }}
                                                            />
                                                            {clientData?.clientPassport && (
                                                                <div style={{
                                                                    marginTop: '8px',
                                                                    padding: '8px',
                                                                    backgroundColor: 'rgba(255, 94, 0, 0.05)',
                                                                    borderRadius: '6px',
                                                                    fontSize: '12px',
                                                                    color: '#ff5e00',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '5px'
                                                                }}>
                                                                    <i className="icofont-file-pdf"></i>
                                                                    Current file: {typeof clientData.clientPassport === 'string' ?
                                                                        clientData.clientPassport.split('/').pop() :
                                                                        'File selected'}
                                            </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Agent ID */}
                                            <div className="col-md-6">
                                                    <div style={{ marginBottom: '15px' }}>
                                                        <label className="form-label" style={{
                                                            fontSize: '13px',
                                                            color: '#666',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '5px',
                                                            marginBottom: '5px'
                                                        }}>
                                                            <i className="icofont-id" style={{ color: '#52b447' }}></i>
                                                    Agent ID
                                                </label>
                                                        <div style={{
                                                            position: 'relative',
                                                            backgroundColor: 'white',
                                                            borderRadius: '8px',
                                                            border: '1px solid rgba(82, 180, 71, 0.2)',
                                                            padding: '8px'
                                                        }}>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    id="clientAgentIDEdit"
                                                    name="clientAgentID"
                                                    onChange={updateChange}
                                                                style={{
                                                                    border: 'none',
                                                                    padding: '8px',
                                                                    fontSize: '13px',
                                                                    backgroundColor: 'transparent'
                                                                }}
                                                            />
                                                            {clientData?.clientAgentID && (
                                                                <div style={{
                                                                    marginTop: '8px',
                                                                    padding: '8px',
                                                                    backgroundColor: 'rgba(82, 180, 71, 0.05)',
                                                                    borderRadius: '6px',
                                                                    fontSize: '12px',
                                                                    color: '#52b447',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '5px'
                                                                }}>
                                                                    <i className="icofont-file-pdf"></i>
                                                                    Current file: {typeof clientData.clientAgentID === 'string' ?
                                                                        clientData.clientAgentID.split('/').pop() :
                                                                        'File selected'}
                                            </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Government ID */}
                                            <div className="col-md-6">
                                                    <div style={{ marginBottom: '15px' }}>
                                                        <label className="form-label" style={{
                                                            fontSize: '13px',
                                                            color: '#666',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '5px',
                                                            marginBottom: '5px'
                                                        }}>
                                                            <i className="icofont-card" style={{ color: '#ff5e00' }}></i>
                                                    Government ID
                                                </label>
                                                        <div style={{
                                                            position: 'relative',
                                                            backgroundColor: 'white',
                                                            borderRadius: '8px',
                                                            border: '1px solid rgba(255, 94, 0, 0.2)',
                                                            padding: '8px'
                                                        }}>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    id="clientGovtIDEdit"
                                                    name="clientGovtID"
                                                    onChange={updateChange}
                                                                style={{
                                                                    border: 'none',
                                                                    padding: '8px',
                                                                    fontSize: '13px',
                                                                    backgroundColor: 'transparent'
                                                                }}
                                                            />
                                                            {clientData?.clientGovtID && (
                                                                <div style={{
                                                                    marginTop: '8px',
                                                                    padding: '8px',
                                                                    backgroundColor: 'rgba(255, 94, 0, 0.05)',
                                                                    borderRadius: '6px',
                                                                    fontSize: '12px',
                                                                    color: '#ff5e00',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '5px'
                                                                }}>
                                                                    <i className="icofont-file-pdf"></i>
                                                                    Current file: {typeof clientData.clientGovtID === 'string' ?
                                                                        clientData.clientGovtID.split('/').pop() :
                                                                        'File selected'}
                                                                </div>
                                                            )}
                                                        </div>
                                            </div>
                                        </div>

                                                {/* Help Text */}
                                                <div className="col-12">
                                                    <div style={{
                                                        backgroundColor: 'rgba(82, 180, 71, 0.05)',
                                                        padding: '10px',
                                                        borderRadius: '8px',
                                                        fontSize: '12px',
                                                        color: '#666',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}>
                                                        <i className="icofont-info-circle" style={{ color: '#52b447', fontSize: '16px' }}></i>
                                                        <span>Upload new files only if you want to update the existing documents. Leave empty to keep current files.</span>
                                                    </div>
                                                </div>

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
                                                        Email ID
                                                    </label>
                                                        <input
                                                            type="email"
                                                            className="form-control"
                                                            placeholder="Email ID"
                                                            name="clientEmail"
                                                            value={clientData.clientEmail}
                                                            onChange={updateChange}
                                                        style={{
                                                            borderRadius: '8px',
                                                            border: '1px solid rgba(82, 180, 71, 0.3)',
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
                                                        Password
                                                    </label>
                                                    <div className="input-group" style={{
                                                        borderRadius: '8px',
                                                        border: '1px solid rgba(255, 94, 0, 0.3)',
                                                        padding: '3px',
                                                        backgroundColor: 'rgba(255, 94, 0, 0.03)'
                                                    }}>
                                                            <input
                                                                type={showEditPassword ? "text" : "password"}
                                                                className="form-control"
                                                                placeholder="Password"
                                                                name="clientPassword"
                                                                value={clientData.clientPassword}
                                                                onChange={updateChange}
                                                            style={{
                                                                border: 'none',
                                                                padding: '7px 12px',
                                                                backgroundColor: 'transparent'
                                                            }}
                                                            />
                                                            <button
                                                            className="btn"
                                                                type="button"
                                                                onClick={() => setShowEditPassword(!showEditPassword)}
                                                            style={{
                                                                backgroundColor: 'rgba(255, 94, 0, 0.1)',
                                                                border: 'none',
                                                                color: '#ff5e00'
                                                            }}
                                                            >
                                                                <i className={`bi ${showEditPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                            {/* Address */}
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
                                                    <i className="icofont-location-pin" style={{ color: '#52b447' }}></i>
                                                    Address
                                                </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                    placeholder="Enter complete address"
                                                            name="clientAddress"
                                                            value={clientData.clientAddress}
                                                            onChange={updateChange}
                                                    style={{
                                                        borderRadius: '8px',
                                                        border: '1px solid rgba(82, 180, 71, 0.3)',
                                                        padding: '10px 15px',
                                                        color: '#333',
                                                        boxShadow: 'none'
                                                    }}
                                                        />
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
                                                    name="clientPhone"
                                                    value={clientData.clientPhone}
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

                                            {/* Bank Details Section */}
                                            <div className="mb-4">
                                                <label className="form-label" style={{
                                                    fontWeight: '600',
                                                    color: '#444',
                                                    fontSize: '14px',
                                                    marginBottom: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px'
                                                }}>
                                                    <i className="icofont-bank-alt" style={{ color: '#52b447' }}></i>
                                                    Bank Details
                                                </label>
                                                <div className="row g-3" style={{
                                                    backgroundColor: 'rgba(82, 180, 71, 0.03)',
                                                    padding: '15px',
                                                    borderRadius: '10px',
                                                    border: '1px solid rgba(82, 180, 71, 0.2)'
                                                }}>
                                                    {/* Account Number */}
                                                <div className="col-md-6">
                                                        <div className="input-group">
                                                            <span className="input-group-text" style={{
                                                                backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                                                border: 'none',
                                                                color: '#52b447'
                                                            }}>
                                                                <i className="bi bi-bank"></i>
                                                            </span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Account Number"
                                                            name="accountNumber"
                                                            value={clientData.accountNumber || ''}
                                                            onChange={updateChange}
                                                                style={{
                                                                    border: '1px solid rgba(82, 180, 71, 0.2)',
                                                                    borderLeft: 'none',
                                                                    borderRadius: '0 6px 6px 0'
                                                                }}
                                                        />
                                                    </div>
                                                </div>

                                                    {/* Account Type */}
                                                <div className="col-md-6">
                                                        <div className="input-group">
                                                            <span className="input-group-text" style={{
                                                                backgroundColor: 'rgba(255, 94, 0, 0.1)',
                                                                border: 'none',
                                                                color: '#ff5e00'
                                                            }}>
                                                                <i className="bi bi-credit-card"></i>
                                                            </span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Account Type"
                                                            name="accountType"
                                                            value={clientData.accountType || ''}
                                                            onChange={updateChange}
                                                                style={{
                                                                    border: '1px solid rgba(255, 94, 0, 0.2)',
                                                                    borderLeft: 'none',
                                                                    borderRadius: '0 6px 6px 0'
                                                                }}
                                                        />
                                                    </div>
                                                </div>

                                                    {/* Account Holder Name */}
                                                <div className="col-md-6">
                                                        <div className="input-group">
                                                            <span className="input-group-text" style={{
                                                                backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                                                border: 'none',
                                                                color: '#52b447'
                                                            }}>
                                                                <i className="bi bi-person"></i>
                                                            </span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Account Holder Name"
                                                            name="accountHolderName"
                                                            value={clientData.accountHolderName || ''}
                                                            onChange={updateChange}
                                                                style={{
                                                                    border: '1px solid rgba(82, 180, 71, 0.2)',
                                                                    borderLeft: 'none',
                                                                    borderRadius: '0 6px 6px 0'
                                                                }}
                                                        />
                                                    </div>
                                                </div>

                                                    {/* IFSC Code */}
                                                <div className="col-md-6">
                                                        <div className="input-group">
                                                            <span className="input-group-text" style={{
                                                                backgroundColor: 'rgba(255, 94, 0, 0.1)',
                                                                border: 'none',
                                                                color: '#ff5e00'
                                                            }}>
                                                                <i className="bi bi-upc"></i>
                                                            </span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="IFSC Code"
                                                            name="ifscCode"
                                                            value={clientData.ifscCode || ''}
                                                            onChange={updateChange}
                                                                style={{
                                                                    border: '1px solid rgba(255, 94, 0, 0.2)',
                                                                    borderLeft: 'none',
                                                                    borderRadius: '0 6px 6px 0'
                                                                }}
                                                        />
                                                    </div>
                                                </div>

                                                    {/* Bank Name */}
                                                <div className="col-md-6">
                                                        <div className="input-group">
                                                            <span className="input-group-text" style={{
                                                                backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                                                border: 'none',
                                                                color: '#52b447'
                                                            }}>
                                                                <i className="bi bi-building"></i>
                                                            </span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Bank Name"
                                                            name="bankName"
                                                            value={clientData.bankName || ''}
                                                            onChange={updateChange}
                                                                style={{
                                                                    border: '1px solid rgba(82, 180, 71, 0.2)',
                                                                    borderLeft: 'none',
                                                                    borderRadius: '0 6px 6px 0'
                                                                }}
                                                        />
                                                    </div>
                                                </div>

                                                    {/* UPI ID */}
                                                <div className="col-md-6">
                                                        <div className="input-group">
                                                            <span className="input-group-text" style={{
                                                                backgroundColor: 'rgba(255, 94, 0, 0.1)',
                                                                border: 'none',
                                                                color: '#ff5e00'
                                                            }}>
                                                                <i className="bi bi-phone"></i>
                                                            </span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="UPI ID"
                                                            name="upiId"
                                                            value={clientData.upiId || ''}
                                                            onChange={updateChange}
                                                                style={{
                                                                    border: '1px solid rgba(255, 94, 0, 0.2)',
                                                                    borderLeft: 'none',
                                                                    borderRadius: '0 6px 6px 0'
                                                                }}
                                                        />
                                                    </div>
                                                </div>

                                                    {/* QR Code */}
                                                <div className="col-md-6">
                                                        <div className="input-group">
                                                            <span className="input-group-text" style={{
                                                                backgroundColor: 'rgba(82, 180, 71, 0.1)',
                                                                border: 'none',
                                                                color: '#52b447'
                                                            }}>
                                                                <i className="bi bi-qr-code"></i>
                                                            </span>
                                                        <input
                                                            type="file"
                                                            className="form-control"
                                                            placeholder="QR Code"
                                                            name="qrCode"
                                                            onChange={updateChange}
                                                            accept="image/*"  // Only accept image files
                                                            style={{
                                                                border: '1px solid rgba(82, 180, 71, 0.2)',
                                                                borderLeft: 'none',
                                                                borderRadius: '0 6px 6px 0'
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                    {/* Payment App */}
                                                <div className="col-md-6">
                                                        <div className="input-group">
                                                            <span className="input-group-text" style={{
                                                                backgroundColor: 'rgba(255, 94, 0, 0.1)',
                                                                border: 'none',
                                                                color: '#ff5e00'
                                                            }}>
                                                                <i className="bi bi-wallet2"></i>
                                                            </span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Payment App"
                                                            name="paymentApp"
                                                            value={clientData.paymentApp || ''}
                                                            onChange={updateChange}
                                                                style={{
                                                                    border: '1px solid rgba(255, 94, 0, 0.2)',
                                                                    borderLeft: 'none',
                                                                    borderRadius: '0 6px 6px 0'
                                                                }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                        {/* Footer */}
                                        <div className="modal-footer" style={{
                                            borderTop: '1px solid rgba(82, 180, 71, 0.1)',
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
                                                Cancel
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
                                                    boxShadow: '0 4px 10px rgba(82, 180, 71, 0.2)',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(82, 180, 71, 0.3)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 4px 10px rgba(82, 180, 71, 0.2)';
                                                }}
                                            >
                                                <i className="icofont-check-circled me-2"></i>
                                                Update Member
                                            </button>
                                        </div>
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
                                        <h5 className="modal-title  fw-bold" id="deleteprojectLabel">
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
                                        <button type="button" className="btn btn-danger color-fff" onClick={handleDelete}>
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
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title fw-bold">
                                            {selectedClient?.clientName || 'Member'}'s Bank Details
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
                                                            <span className="me-2">{selectedClient?.bankDetails?.bankName || 'Not provided'}</span>
                                                            {selectedClient?.bankDetails?.bankName && (
                                                                <i
                                                                    className="bi bi-clipboard cursor-pointer"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(selectedClient.bankDetails.bankName);
                                                                        toast.success('Bank Name copied!');
                                                                    }}
                                                                    title="Copy Bank Name"
                                                                    style={{ cursor: 'pointer' }}
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
                                                            <span className="me-2">{selectedClient?.bankDetails?.accountHolderName || 'Not provided'}</span>
                                                            {selectedClient?.bankDetails?.accountHolderName && (
                                                                <i
                                                                    className="bi bi-clipboard cursor-pointer"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(selectedClient.bankDetails.accountHolderName);
                                                                        toast.success('Account Holder Name copied!');
                                                                    }}
                                                                    title="Copy Account Holder Name"
                                                                    style={{ cursor: 'pointer' }}
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
                                                            <span className="me-2">{selectedClient?.bankDetails?.accountNumber || 'Not provided'}</span>
                                                            {selectedClient?.bankDetails?.accountNumber && (
                                                                <i
                                                                    className="bi bi-clipboard cursor-pointer"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(selectedClient.bankDetails.accountNumber);
                                                                        toast.success('Account Number copied!');
                                                                    }}
                                                                    title="Copy Account Number"
                                                                    style={{ cursor: 'pointer' }}
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
                                                            <span className="me-2">{selectedClient?.bankDetails?.ifscCode || 'Not provided'}</span>
                                                            {selectedClient?.bankDetails?.ifscCode && (
                                                                <i
                                                                    className="bi bi-clipboard cursor-pointer"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(selectedClient.bankDetails.ifscCode);
                                                                        toast.success('IFSC Code copied!');
                                                                    }}
                                                                    title="Copy IFSC Code"
                                                                    style={{ cursor: 'pointer' }}
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
                                                            <span className="me-2">{selectedClient?.bankDetails?.accountType || 'Not provided'}</span>
                                                            {selectedClient?.bankDetails?.accountType && (
                                                                <i
                                                                    className="bi bi-clipboard cursor-pointer"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(selectedClient.bankDetails.accountType);
                                                                        toast.success('Account Type copied!');
                                                                    }}
                                                                    title="Copy Account Type"
                                                                    style={{ cursor: 'pointer' }}
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
                                                            <span className="me-2">{selectedClient?.bankDetails?.upiId || 'Not provided'}</span>
                                                            {selectedClient?.bankDetails?.upiId && (
                                                                <i
                                                                    className="bi bi-clipboard cursor-pointer"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(selectedClient.bankDetails.upiId);
                                                                        toast.success('UPI ID copied!');
                                                                    }}
                                                                    title="Copy UPI ID"
                                                                    style={{ cursor: 'pointer' }}
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
                                                            <span className="me-2">{selectedClient?.bankDetails?.paymentApp || 'Not provided'}</span>
                                                            {selectedClient?.bankDetails?.paymentApp && (
                                                                <i
                                                                    className="bi bi-clipboard cursor-pointer"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(selectedClient.bankDetails.paymentApp);
                                                                        toast.success('Payment App copied!');
                                                                    }}
                                                                    title="Copy Payment App"
                                                                    style={{ cursor: 'pointer' }}
                                                                ></i>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {selectedClient?.bankDetails?.qrCode && (
                                                <div className="col-md-6">
                                                    <div className="bank-info-item p-3 border rounded h-100">
                                                        <i className="bi bi-qr-code fs-4 text-dark me-2"></i>
                                                        <div>
                                                            <div className="fw-bold">QR Code</div>
                                                            <div className="d-flex align-items-center gap-2 mt-2">
                                                                <img
                                                                    src={`${import.meta.env.VITE_BASE_URL}${selectedClient.bankDetails.qrCode}`}
                                                                    alt="QR Code"
                                                                    style={{ width: '100px', height: '100px', objectFit: 'contain', cursor: 'pointer' }}
                                                                    onClick={(e) => handleFileClick(
                                                                        e,
                                                                        `${import.meta.env.VITE_BASE_URL}${selectedClient.bankDetails.qrCode}`,
                                                                        'image',
                                                                        `${selectedClient.clientName} - QR Code`
                                                                    )}
                                                                />
                                                                <i
                                                                    className="bi bi-download fs-4 text-primary"
                                                                    style={{ cursor: 'pointer' }}
                                                                    onClick={() => handleDownload(
                                                                        selectedClient.bankDetails.qrCode,
                                                                        `${selectedClient.clientName}_qr_code${selectedClient.bankDetails.qrCode.substr(selectedClient.bankDetails.qrCode.lastIndexOf('.'))}`
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

                        {/* Documents Modal */}
                        <div
                            className="modal fade"
                            id="documentsDetailsModal"
                            tabIndex={-1}
                            aria-hidden="true"
                            style={{ zIndex: 9999, marginLeft: '1rem' }}
                        >
                            <div className="modal-dialog modal-dialog-centered modal-lg" style={{ zIndex: 9999, marginLeft: '20rem' }}>
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title fw-bold">
                                            {selectedClient?.clientName || 'Member'}'s Documents
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
                                            {selectedClient?.clientDL && (
                                                <div className="col-md-6">
                                                    <div className="document-item p-3 border rounded h-100">
                                                        <div className="d-flex flex-column align-items-center">
                                                            <i className="bi bi-file-earmark-text fs-1 text-primary mb-2"></i>
                                                            <div className="fw-bold mb-2">Driving License</div>
                                                            <div className="d-flex justify-content-center gap-3 mt-2">
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={(e) => handleFileClick(
                                                                        e,
                                                                        `${import.meta.env.VITE_BASE_URL}${selectedClient.clientDL}`,
                                                                        'image',
                                                                        `${selectedClient.clientName} - Driving License`
                                                                    )}
                                                                >
                                                                    <i className="bi bi-eye me-1"></i> View
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-success"
                                                                    onClick={() => handleDownload(
                                                                        selectedClient.clientDL,
                                                                        `${selectedClient.clientName}_driving_license${selectedClient.clientDL.substr(selectedClient.clientDL.lastIndexOf('.'))}`
                                                                    )}
                                                                >
                                                                    <i className="bi bi-download me-1"></i> Download
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedClient?.clientPassport && (
                                                <div className="col-md-6">
                                                    <div className="document-item p-3 border rounded h-100">
                                                        <div className="d-flex flex-column align-items-center">
                                                            <i className="bi bi-file-earmark-text fs-1 text-success mb-2"></i>
                                                            <div className="fw-bold mb-2">Passport</div>
                                                            <div className="d-flex justify-content-center gap-3 mt-2">
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={(e) => handleFileClick(
                                                                        e,
                                                                        `${import.meta.env.VITE_BASE_URL}${selectedClient.clientPassport}`,
                                                                        'image',
                                                                        `${selectedClient.clientName} - Passport`
                                                                    )}
                                                                >
                                                                    <i className="bi bi-eye me-1"></i> View
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-success"
                                                                    onClick={() => handleDownload(
                                                                        selectedClient.clientPassport,
                                                                        `${selectedClient.clientName}_passport${selectedClient.clientPassport.substr(selectedClient.clientPassport.lastIndexOf('.'))}`
                                                                    )}
                                                                >
                                                                    <i className="bi bi-download me-1"></i> Download
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedClient?.clientAgentID && (
                                                <div className="col-md-6">
                                                    <div className="document-item p-3 border rounded h-100">
                                                        <div className="d-flex flex-column align-items-center">
                                                            <i className="bi bi-file-earmark-text fs-1 text-warning mb-2"></i>
                                                            <div className="fw-bold mb-2">Agent ID</div>
                                                            <div className="d-flex justify-content-center gap-3 mt-2">
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={(e) => handleFileClick(
                                                                        e,
                                                                        `${import.meta.env.VITE_BASE_URL}${selectedClient.clientAgentID}`,
                                                                        'image',
                                                                        `${selectedClient.clientName} - Agent ID`
                                                                    )}
                                                                >
                                                                    <i className="bi bi-eye me-1"></i> View
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-success"
                                                                    onClick={() => handleDownload(
                                                                        selectedClient.clientAgentID,
                                                                        `${selectedClient.clientName}_agent_id${selectedClient.clientAgentID.substr(selectedClient.clientAgentID.lastIndexOf('.'))}`
                                                                    )}
                                                                >
                                                                    <i className="bi bi-download me-1"></i> Download
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedClient?.clientGovtID && (
                                                <div className="col-md-6">
                                                    <div className="document-item p-3 border rounded h-100">
                                                        <div className="d-flex flex-column align-items-center">
                                                            <i className="bi bi-file-earmark-text fs-1 text-danger mb-2"></i>
                                                            <div className="fw-bold mb-2">Government ID</div>
                                                            <div className="d-flex justify-content-center gap-3 mt-2">
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={(e) => handleFileClick(
                                                                        e,
                                                                        `${import.meta.env.VITE_BASE_URL}${selectedClient.clientGovtID}`,
                                                                        'image',
                                                                        `${selectedClient.clientName} - Government ID`
                                                                    )}
                                                                >
                                                                    <i className="bi bi-eye me-1"></i> View
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-success"
                                                                    onClick={() => handleDownload(
                                                                        selectedClient.clientGovtID,
                                                                        `${selectedClient.clientName}_govt_id${selectedClient.clientGovtID.substr(selectedClient.clientGovtID.lastIndexOf('.'))}`
                                                                    )}
                                                                >
                                                                    <i className="bi bi-download me-1"></i> Download
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {!selectedClient?.clientDL && !selectedClient?.clientPassport &&
                                                !selectedClient?.clientAgentID && !selectedClient?.clientGovtID && (
                                                    <div className="col-12 text-center py-5">
                                                        <i className="bi bi-exclamation-circle fs-1 text-muted"></i>
                                                        <h5 className="mt-3 text-muted">No documents available for this member</h5>
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </>
                </div>
                <ToastContainer />
                <FloatingMenu userType="client" isMobile={isMobile} />
            </div>
        </>
    )
}

export default Client
