import React, { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Loading.css"


const Client = () => {

    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');

    // Create a client
    const [formData, setFormData] = useState({
        clientName: '',
        businessName: '',
        clientEmail: '',
        clientPassword: '',
        clientPhone: '',
        clientAddress: '',
        clientGst: '',
        clientImage: null, // Initialize clientImage state to null
    });
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleImageChange = (e) => {
        setFormData({
            ...formData,
            clientImage: e.target.files[0], // Store the selected file in clientImage state
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('clientName', formData.clientName);
            formDataToSend.append('businessName', formData.businessName);
            formDataToSend.append('clientEmail', formData.clientEmail);
            formDataToSend.append('clientPassword', formData.clientPassword);
            formDataToSend.append('clientPhone', formData.clientPhone);
            formDataToSend.append('clientAddress', formData.clientAddress);
            formDataToSend.append('clientGst', formData.clientGst);
            formDataToSend.append('clientImage', formData.clientImage); // Append the image file to the form data
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}api/clients`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // console.log('Phone Number:', formData.clientPhone);

            const newClient = response.data;
            setClients((prevClient) => [newClient, ...prevClient]);
            setFormData({
                clientName: '',
                businessName: '',
                clientEmail: '',
                clientPassword: '',
                clientPhone: '',
                clientAddress: '',
                clientGst: '',
                clientImage: null, // Reset the clientImage state to null
            });
            // Close the modal programmatically
            const modalElement = document.getElementById("createproject");
            const modal = window.bootstrap.Modal.getInstance(modalElement);
            modal.hide();

            toast.success("Client Added Successfully!", {
                style: {
                    backgroundColor: "#4c3575",
                    color: "white",
                },
            });
            // Reload the page after 5 seconds
            setTimeout(() => {
                window.location.reload();
            }, 5000);

            console.log('Client created:', response.data);
            // Optionally, you can redirect the user to another page or show a success message
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
                console.log(response.data);
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
        businessName: '',
        clientEmail: '',
        clientPassword: '',
        clientPhone: '',
        clientAddress: '',
        clientGst: '',
        clientImage: null,
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
                    businessName: response.data.businessName,
                    clientEmail: response.data.clientEmail,
                    clientPassword: response.data.clientPassword,
                    clientPhone: response.data.clientPhone,
                    clientAddress: response.data.clientAddress,
                    clientGst: response.data.clientGst,
                    clientImage: response.data.clientImage,
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
                console.log('Client updated successfully');
            }

            //  Close the modal programmatically
            const modalElement = document.getElementById("editproject");
            const modal = window.bootstrap.Modal.getInstance(modalElement);
            modal.hide();

            toast.success("Client Updated", {
                style: {
                    backgroundColor: "#4c3575",
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
                    backgroundColor: "#4c3575",
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
                                            <div className="card-header py-3 px-0 d-flex align-items-center  justify-content-between border-bottom">
                                                <h3 className=" fw-bold flex-fill mb-0">Clients</h3>
                                                <div className="col-auto d-flex">
                                                    <button
                                                        type="button"
                                                        className="btn btn-dark me-1 mt-1 w-sm-100"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#createproject"
                                                    >
                                                        <i className="icofont-plus-circle me-2 fs-6" />
                                                        Add Client
                                                    </button>

                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-between mt-2">
                                                <div className="">
                                                    <div className="input-group">
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
                                                            placeholder="Enter Client Name"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="input-group-text"
                                                            id="addon-wrapping"
                                                            onClick={handleSearchSubmit}
                                                        >
                                                            <i className="fa fa-search" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        className={`bi bi-list-task ${viewMode === 'list' ? 'bg-primary' : 'bg-secondary'} text-white border-0 rounded`}
                                                        style={{ width: '2.5rem' }}
                                                        onClick={() => setViewMode('list')}
                                                    ></button>
                                                    <button
                                                        className={`bi bi-grid-3x3-gap-fill ${viewMode === 'grid' ? 'bg-primary' : 'bg-secondary'} text-white border-0 rounded`}
                                                        style={{ width: '2.5rem' }}
                                                        onClick={() => setViewMode('grid')}
                                                    ></button>
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
                                        // Existing grid view
                                        <div className="row g-3 row-cols-1 row-cols-sm-1 row-cols-md-1 row-cols-lg-2 row-cols-xl-2 row-cols-xxl-2 row-deck py-1 pb-4">
                                            {clients.map(client => (
                                                <div className="col" key={client._id}>
                                                    <div className="card teacher-card">
                                                        <div className="card-body  d-flex" >
                                                            <div className="profile-av pe-xl-4 pe-md-2 pe-sm-4 pe-4 text-center w220">
                                                                <img
                                                                    src={
                                                                        `${import.meta.env.VITE_BASE_URL}` +
                                                                        client.clientImage.replace('uploads/', '')
                                                                    }
                                                                    alt=""
                                                                    className="avatar xl rounded-circle img-thumbnail shadow-sm"
                                                                />
                                                                <div className="about-info d-flex align-items-center mt-1 justify-content-center flex-column">
                                                                    <h6 className="mb-0 fw-bold d-block fs-6 mt-2">{client.clientName}</h6>
                                                                    <div
                                                                        className="btn-group mt-2"
                                                                        role="group"
                                                                        aria-label="Basic outlined example"
                                                                    >
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-outline-secondary"
                                                                            data-bs-toggle="modal"
                                                                            data-bs-target="#editproject"
                                                                            onClick={() => setToEdit(client._id)}
                                                                        >
                                                                            <i className="icofont-edit text-success" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-outline-secondary"
                                                                            data-bs-toggle="modal"
                                                                            data-bs-target="#deleteproject"
                                                                            onClick={() => {
                                                                                setDeletableId(client._id);
                                                                            }}
                                                                        >
                                                                            <i className="icofont-ui-delete text-danger" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="teacher-info border-start ps-xl-4 ps-md-3 ps-sm-4 ps-4 w-100">
                                                                <h6 className="mb-0 mt-2  fw-bold d-block fs-6">
                                                                    {client.businessName}
                                                                </h6>
                                                                <span className="py-1 fw-bold small-11 mb-0 mt-1 text-muted">
                                                                    Phone No. - {client.clientPhone}
                                                                </span>
                                                                <div className="video-setting-icon mt-3 pt-3 border-top">
                                                                    <p>Email - {client.clientEmail}</p>
                                                                    <p>Address - {client.clientAddress}</p>
                                                                    <p>GST No. - {client.clientGst}</p>
                                                                </div>
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
                                                    <div className="card-body">
                                                        <div className="table-responsive">
                                                            <table id="myProjectTable" className="table table-hover align-middle mb-0" style={{ width: '100%' }}>
                                                                <thead>
                                                                    <tr>
                                                                        <th>Client</th>
                                                                        <th>Business Name</th>
                                                                        <th>Contact</th>
                                                                        <th>Address</th>
                                                                        <th>Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {clients.map(client => (
                                                                        <tr key={client._id}>
                                                                            <td>
                                                                                <div className="d-flex align-items-center">
                                                                                    <img className="avatar rounded-circle me-2" src={`${import.meta.env.VITE_BASE_URL}${client.clientImage.replace('uploads/', '')}`} alt="" style={{width: '40px', height: '40px'}} />
                                                                                    <div>
                                                                                        <h6 className="mb-0">{client.clientName}</h6>
                                                                                        <small>{client.clientEmail}</small>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td>{client.businessName}</td>
                                                                            <td>
                                                                                <div>{client.clientPhone}</div>
                                                                                <small>{client.clientGst}</small>
                                                                            </td>
                                                                            <td>{client.clientAddress}</td>
                                                                            <td>
                                                                                <div className="btn-group" role="group" aria-label="Basic outlined example">
                                                                                    <button type="button" className="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#editproject" onClick={() => setToEdit(client._id)}>
                                                                                        <i className="icofont-edit text-success"></i>
                                                                                    </button>
                                                                                    <button type="button" className="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#deleteproject" onClick={() => setDeletableId(client._id)}>
                                                                                        <i className="icofont-ui-delete text-danger"></i>
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
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title  fw-bold" id="createprojectlLabel">
                                            {" "}
                                            Add Client
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
                                            <label htmlFor="exampleFormControlInput877" className="form-label">
                                                Client Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="exampleFormControlInput877"
                                                placeholder="Client Name"
                                                name="clientName" value={formData.clientName} onChange={handleChange}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="exampleFormControlInput977" className="form-label">
                                                Business Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="exampleFormControlInput977"
                                                placeholder="Business Name"
                                                name="businessName" value={formData.businessName} onChange={handleChange}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="formFileMultipleoneone" className="form-label">
                                                Profile Image
                                            </label>
                                            <input
                                                className="form-control"
                                                type="file"
                                                id="formFileMultipleoneone"
                                                name="clientImage"
                                                onChange={handleImageChange}
                                            />
                                        </div>
                                        <div className="deadline-form">
                                            <form>
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
                                                            name="clientEmail" value={formData.clientEmail} onChange={handleChange}
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
                                                            type="password"
                                                            className="form-control"
                                                            id="exampleFormControlInput277"
                                                            placeholder="Password"
                                                            name="clientPassword" value={formData.clientPassword} onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="row g-3 mb-3">
                                                    <div className="col">
                                                        <label
                                                            htmlFor="exampleFormControlInput477"
                                                            className="form-label"
                                                        >
                                                            Address
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="exampleFormControlInput477"
                                                            placeholder="Address"
                                                            name="clientAddress" value={formData.clientAddress} onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                            </form>
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
                                                    type="number"
                                                    className="form-control"
                                                    id="exampleFormControlInput777"
                                                    placeholder="Phone Number"
                                                    name="clientPhone" value={formData.clientPhone} onChange={handleChange}
                                                />
                                            </div>

                                            <div className="col">
                                                <label
                                                    htmlFor="exampleFormControlInput277"
                                                    className="form-label"
                                                >
                                                    GST No.
                                                </label>
                                                <input
                                                    type="gst"
                                                    className="form-control"
                                                    id="exampleFormControlInput277"
                                                    placeholder="GST No."
                                                    name="clientGst" value={formData.clientGst} onChange={handleChange}
                                                />
                                            </div>
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
                                        <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                                            Create
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
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title fw-bold" id="createprojectlLabel">Edit Client</h5>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                                    </div>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label htmlFor="exampleFormControlInput877" className="form-label">Client Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="exampleFormControlInput877"
                                                placeholder="Client Name"
                                                name="clientName"
                                                value={clientData.clientName}
                                                onChange={updateChange}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="exampleFormControlInput977" className="form-label">Business Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="exampleFormControlInput977"
                                                placeholder="Business Name"
                                                name="businessName"
                                                value={clientData.businessName}
                                                onChange={updateChange}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="formFileMultipleoneone" className="form-label">Profile Image</label>
                                            <input
                                                className="form-control"
                                                type="file"
                                                id="formFileMultipleoneone"
                                                name="clientImage"
                                                onChange={updateChange}
                                            />
                                        </div>
                                        <div className="deadline-form">
                                            <form>
                                                <div className="row g-3 mb-3">
                                                    <div className="col">
                                                        <label htmlFor="exampleFormControlInput477" className="form-label">Email ID</label>
                                                        <input
                                                            type="email"
                                                            className="form-control"
                                                            id="exampleFormControlInput477"
                                                            placeholder="Email ID"
                                                            name="clientEmail"
                                                            value={clientData.clientEmail}
                                                            onChange={updateChange}
                                                        />
                                                    </div>
                                                    <div className="col">
                                                        <label htmlFor="exampleFormControlInput277" className="form-label">Password</label>
                                                        <input
                                                            type="password"
                                                            className="form-control"
                                                            id="exampleFormControlInput277"
                                                            placeholder="Password"
                                                            name="clientPassword"
                                                            value={clientData.clientPassword}
                                                            onChange={updateChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="row g-3 mb-3">
                                                    <div className="col">
                                                        <label htmlFor="exampleFormControlInput477" className="form-label">Address</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="exampleFormControlInput477"
                                                            placeholder="Address"
                                                            name="clientAddress"
                                                            value={clientData.clientAddress}
                                                            onChange={updateChange}
                                                        />
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                        <div className="row g-3 mb-3">
                                            <div className="col">
                                                <label htmlFor="exampleFormControlInput777" className="form-label">Phone</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    id="exampleFormControlInput777"
                                                    placeholder="Phone Number"
                                                    name="clientPhone"
                                                    value={clientData.clientPhone}
                                                    onChange={updateChange}
                                                />
                                            </div>
                                            <div className="col">
                                                <label htmlFor="exampleFormControlInput277" className="form-label">GST No.</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="exampleFormControlInput277"
                                                    placeholder="GST No."
                                                    name="clientGst"
                                                    value={clientData.clientGst}
                                                    onChange={updateChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Done</button>
                                        <button type="button" className="btn btn-primary" onClick={updateSubmit}>Update</button>
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
                    </>
                </div>
                <ToastContainer />
            </div>
        </>
    )
}

export default Client
