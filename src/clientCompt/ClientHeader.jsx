import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

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

  return (
    <>
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
                      {/* <Link
                        type=""
                        className="list-group-item list-group-item-action border-0"
                        data-bs-toggle="modal"
                        data-bs-target="#editemp"
                        onClick={() => setToEdit(employees._id)}
                      >
                        <i className="icofont-ui-user-group fs-6 me-3" /> Edit
                        Profile
                      </Link> */}
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



          </div>
        </nav>
      </div>
    </>
  );
};

export default ClientHeader;
