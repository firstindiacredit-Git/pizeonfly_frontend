import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import bootstrap from 'bootstrap';

const ClientHeader = () => {
  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const navigation = useNavigate();

  const [clientData, setClientData] = useState({
    clientName: "",
    companyName: "",
    clientImage: null,
    clientId: "",
    emailid: "",
    phone: "",
    description: "",
  });

  const [editClientData, setEditClientData] = useState({
    clientName: "",
    businessName: "",
    clientImage: null,
    clientEmail: "",
    clientPassword: "",
    clientPhone: "",
    clientAddress: "",
    clientGst: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("client_token");

    if (!token) {
      navigation("/");
    }
    const user = JSON.parse(localStorage.getItem("client_user"));
    if (token) {
      setClientData({
        ...clientData,
        clientName: user.clientName,
        clientEmail: user.clientEmail,
      });
      setEditClientData({
        ...user,
        clientPassword: "", // Don't populate the password field
      });
      setClientName(user.clientName);
      setEmail(user.clientEmail);
      setImage(user.clientImage);
    }
  }, [navigation]);

  const handleSignOut = () => {
    localStorage.removeItem("client_token");
    localStorage.removeItem("client_user");
    navigation("/clientsignin");
  };

  //   GET CLIENTS
  const [clients, setClients] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/clients`);
        setClients(response.data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []);

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "clientImage") {
      setEditClientData({ ...editClientData, [name]: files[0] });
    } else {
      setEditClientData({ ...editClientData, [name]: value });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("client_token");
    const user = JSON.parse(localStorage.getItem("client_user"));
    const formData = new FormData();

    const allowedUpdates = ['clientName', 'businessName', 'clientImage', 'clientEmail', 'clientPhone', 'clientAddress', 'clientGst'];

    allowedUpdates.forEach((key) => {
      if (editClientData[key] !== null && editClientData[key] !== undefined) {
        if (key === 'clientImage' && editClientData[key] instanceof File) {
          formData.append(key, editClientData[key], editClientData[key].name);
        } else {
          formData.append(key, editClientData[key]);
        }
      }
    });

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}api/clients/${user._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const updatedUser = response.data;
        localStorage.setItem("client_user", JSON.stringify(updatedUser));
        setClientData(updatedUser);
        setClientName(updatedUser.clientName);
        setEmail(updatedUser.clientEmail);
        setImage(updatedUser.clientImage);
        toast.success("Profile updated successfully!"); // Toast notification
        // Close the modal
        const modal = document.getElementById('editProfile');
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        bootstrapModal.hide();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response) {
        toast.error(`Failed to update profile: ${error.response.data.message || error.response.data.error}`);
      } else if (error.request) {
        toast.error("Failed to update profile: No response from server. Please try again.");
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    }
  };

  return (
    <>
      <ToastContainer /> {/* Add this at the top level of your component */}
      <div className="header">
        <nav className="navbar py-4">
          <div className="container-xxl">
            {/* header rightbar icon */}
            <div className="h-right d-flex align-items-center mr-5 mr-lg-0 order-1">
              <div className="dropdown user-profile ml-2 ml-sm-3 d-flex align-items-center">
                <div className="u-info me-2">
                  <p className="mb-0 text-end line-height-sm ">
                    <span className="font-weight-bold">{clientName}</span>
                  </p>
                  <small>Client Profile</small>
                </div>
                <a
                  className="nav-link dropdown-toggle pulse p-0"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  data-bs-display="static"
                >
                  <img
                    className="avatar lg rounded-circle img-thumbnail"
                    src={`${import.meta.env.VITE_BASE_URL}` + image}
                    alt="profile"
                  />
                </a>
                <div className="dropdown-menu rounded-lg shadow border-0 dropdown-animation dropdown-menu-end p-0 m-0">
                  <div className="card border-0 w280">
                    <div className="card-body pb-0">
                      <div className="d-flex py-1">
                        <img
                          className="avatar rounded-circle"
                          src={`${import.meta.env.VITE_BASE_URL}` + image}
                          alt="profile"
                        />
                        <div className="flex-fill ms-3">
                          <p className="mb-0">
                            <span className="font-weight-bold">
                              {clientName}
                            </span>
                          </p>
                          <p style={{ width: "210px", fontSize: "small" }}>{email}</p>
                        </div>
                      </div>
                      <div>
                        <hr className="dropdown-divider border-dark" />
                      </div>
                    </div>
                    <div className="list-group m-2 ">
                      <Link
                        type=""
                        className="list-group-item list-group-item-action border-0"
                        data-bs-toggle="modal"
                        data-bs-target="#editProfile"
                      >
                        <i className="icofont-ui-user-group fs-6 me-3" /> Edit
                        Profile
                      </Link>
                      {/* <Link
                        type=""
                        className="list-group-item list-group-item-action border-0"
                        data-bs-toggle="modal"
                        data-bs-target="#taskMessage"
                      >
                        <i className="icofont-ui-message fs-6 me-3" /> Message
                      </Link> */}
                      <button
                        onClick={handleSignOut}
                        className="list-group-item list-group-item-action border-0 "
                      >
                        <i className="icofont-logout fs-6 me-3" />
                        Signout
                      </button>
                      <div>
                        <hr className="dropdown-divider border-dark" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* menu toggler */}
            <button
              className="navbar-toggler p-0 border-0 menu-toggle order-3"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#mainHeader"
            >
              <span className="fa fa-bars" />
            </button>
            <div className="order-0 col-lg-4 col-md-4 col-sm-12 col-12 mb-3 mb-md-0 ">
            </div>


            

            {/* Edit Profile Modal */}
            <div className="modal fade" id="editProfile" tabIndex={-1} aria-hidden="true">
              <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title fw-bold">Edit Profile</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleEditSubmit}>
                      {/* Add form fields for editing profile */}
                      <div className="mb-3">
                        <label htmlFor="clientName" className="form-label">Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="clientName"
                          name="clientName"
                          value={editClientData.clientName}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="businessName" className="form-label">Business Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="businessName"
                          name="businessName"
                          value={editClientData.businessName}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="clientImage" className="form-label">Profile Image</label>
                        <input
                          type="file"
                          className="form-control"
                          id="clientImage"
                          name="clientImage"
                          onChange={handleEditChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="clientEmail" className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          id="clientEmail"
                          name="clientEmail"
                          value={editClientData.clientEmail}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="clientPhone" className="form-label">Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          id="clientPhone"
                          name="clientPhone"
                          value={editClientData.clientPhone}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="clientAddress" className="form-label">Address</label>
                        <input
                          type="text"
                          className="form-control"
                          id="clientAddress"
                          name="clientAddress"
                          value={editClientData.clientAddress}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="clientGst" className="form-label">GST No.</label>
                        <input
                          type="text"
                          className="form-control"
                          id="clientGst"
                          name="clientGst"
                          value={editClientData.clientGst}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </nav>
      </div>
    </>
  );
};

export default ClientHeader;
