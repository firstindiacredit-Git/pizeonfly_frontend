import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FloatingMenu from '../Chats/FloatingMenu'

const AllInvoice = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/invoices`);
        setInvoices(response.data);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    };

    fetchInvoices();
  }, []);

  const formatDateToMonthYear = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
  };

  const handleDeleteInvoice = async (invoiceId) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_BASE_URL}api/invoices/${invoiceId}`);
      if (response.status === 200) {
        const remainingInvoice = invoices.filter((prevInvoice) => {
          return prevInvoice._id !== invoiceId;
        })
        setInvoices(remainingInvoice);
        toast.error("Invoices Deleted Successfully!", {
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
      console.error('Error deleting invoice:', error);
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

          {/*Body*/}
          <div className="body d-flex py-lg-3 py-md-2">
            <div className="container-xxl">
              <div className="row align-items-center">
                <div className="border-1 mb-4">
                  <div className="card-header py-3 no-bg bg-transparent d-flex align-items-center px-0 justify-content-between border-bottom flex-wrap">
                    <h3 className="fw-bold mb-0">ALL Invoices</h3>
                    <Link to="/create-invoice">
                      <button className="btn btn-lg btn-primary"><i className="icofont-plus-circle me-1" /> New Invoices</button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <table
                  id="myProjectTable"
                  className="table table-hover align-middle mb-0"
                  style={{ width: "100%" }}
                >
                  <thead>
                    <tr>
                      <th>S.No.</th>
                      <th>Invoice No.</th>
                      <th>Invoice Date</th>
                      <th>Client Business</th>
                      <th>Total Amount</th>
                      <th>Edit</th>
                      <th>Delete Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice, index) => (
                      <tr key={invoice.id}>
                        <td>{index + 1}</td>
                        <td>{invoice.invoiceNumber}</td>
                        <td>{formatDateToMonthYear(invoice.invoiceDate)}</td>
                        <td>{invoice.clientDetail?.split('\n')[0] || 'N/A'}</td>
                        <td>{invoice.total}</td>
                        <td>
                          <Link to="/update-invoice" state={{ invoice }}>
                            <i className="bi bi-pencil-square fs-6 text-success" />
                          </Link>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            // data-bs-toggle="modal"
                            // data-bs-target="#deleteInvoiceModal"
                            onClick={() => handleDeleteInvoice(invoice._id)}
                          >
                            <i className="icofont-ui-delete text-danger" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Modal Delete Invoice */}
          <div className="modal fade" id="deleteInvoiceModal" tabIndex={-1} aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold" id="deleteInvoiceModalLabel">
                    Delete Invoice Permanently?
                  </h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                </div>
                <div className="modal-body justify-content-center flex-column d-flex">
                  <i className="icofont-ui-delete text-danger display-2 text-center mt-2" />
                  <p className="mt-4 fs-5 text-center">
                    Are you sure you want to delete this invoice permanently?
                  </p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleDeleteInvoice(invoices._id)} // Handle deletion
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer />
        <FloatingMenu userType="admin" isMobile={isMobile} />
      </div>
    </>
  );
};

export default AllInvoice;
