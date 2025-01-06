import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FloatingMenu from '../Chats/FloatingMenu'
import { Link, useNavigate } from "react-router-dom";

const AllMeetings = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [meetings, setMeetings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [meetingsPerPage, setMeetingsPerPage] = useState(10);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // Default is list view
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [editMeeting, setEditMeeting] = useState(null);
  const navigate = useNavigate();

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'btn-info text-white';
      case 'postponed':
        return 'btn-warning text-white';
      case 'cancelled':
        return 'btn-danger text-white';
      case 'completed':
        return 'btn-success text-white';
      case 'rescheduled':
        return 'btn-info text-white';
      default:
        return 'btn-outline-secondary';
    }
  };

  const handleStatusUpdate = async (meetingId, status) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}api/meetings/${meetingId}/status`,
        { status }
      );

      if (response.data.success) {
        toast.success(`Meeting status updated to ${status}`);
        // Refresh the meetings list
        fetchMeetings();
        // Reload the page after 5 seconds
        setTimeout(() => {
          window.location.reload();
        }, 5000); v

      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error updating meeting status');
    }
  };

  const handleDelete = async (meetingId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BASE_URL}api/meetings/${meetingId}`);
      toast.success("Meeting deleted successfully");
      // Hide the modal programmatically
      const modalElement = document.getElementById("deleteMeetingModal");
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal.hide();
      fetchMeetings(); // Refresh the list
      // Reload the page after 5 seconds
      setTimeout(() => {
        window.location.reload();
      }, 5000);


    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast.error("Failed to delete meeting");
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/meetings`);
      setMeetings(response.data.meetings || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      // toast.error("Failed to fetch meetings");
      setMeetings([]);
    }
  };

  // Filter meetings based on search term
  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastMeeting = currentPage * meetingsPerPage;
  const indexOfFirstMeeting = indexOfLastMeeting - meetingsPerPage;
  const currentMeetings = filteredMeetings.slice(indexOfFirstMeeting, indexOfLastMeeting);
  const totalPages = Math.ceil(filteredMeetings.length / meetingsPerPage);

  // Pagination controls
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // Page number chunking
  const pageLimit = 5;
  const startPage = Math.floor((currentPage - 1) / pageLimit) * pageLimit + 1;
  const endPage = Math.min(startPage + pageLimit - 1, totalPages);

  const handleReschedule = (meeting) => {
    // Navigate to create-meeting with the meeting data
    navigate('/create-meeting', {
      state: {
        isRescheduling: true,
        meetingData: meeting
      }
    });
    fetchMeetings();
  };

  return (
    <>
      <div id="mytask-layout">
        <Sidebar />
        <div className="main px-lg-4 px-md-4">
          <Header />
          <div className="body d-flex py-lg-3 py-md-2">
            <div className="container-xxl">

              <div className="border-0 mb-3">
                <div className="card-header py-3 no-bg bg-transparent d-flex align-items-center px-0 justify-content-between border-bottom flex-wrap">
                  <h3 className="fw-bold mb-0">Meeting Management</h3>
                  <div className="col-auto d-flex w-sm-100 flex-wrap">
                    <Link to="/create-meeting">
                      <button
                        type="button"
                        className="btn btn-dark btn-set-task w-sm-100 me-2 mb-2 mb-md-0"
                        data-bs-toggle="modal"
                        data-bs-target="#createmeeting"
                      >
                        <i className="icofont-plus-circle me-2 fs-6" />
                        Schedule Meeting
                      </button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between border-bottom mb-3">
                <button
                  className="btn btn-outline-primary me-3 mb-3"
                  onClick={() => setViewMode(viewMode === 'row' ? 'list' : 'row')}
                  title={viewMode === 'row' ? "Switch to List View" : "Switch to Grid View"}
                >
                  <i className={`bi ${viewMode === 'row' ? 'bi-list-task' : 'bi-grid-3x3-gap-fill'}`}></i>
                </button>

                <div className="input-group mb-3" style={{ width: '250px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search meetings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="button" className="btn btn-outline-secondary">
                    <i className="fa fa-search" />
                  </button>
                </div>

              </div>

              {viewMode === 'list' ? (
                // List View
                <div>
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th className="text-center">Sr.No.</th>
                        <th className="text-center">Title</th>
                        <th className="text-center">Date</th>
                        <th className="text-center">Time</th>
                        <th className="text-center">Duration</th>
                        <th className="text-center">Guest Name</th>
                        <th className="text-center">Guest Email</th>
                        <th className="text-center">Status</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentMeetings.map((meeting, index) => (
                        <tr key={meeting._id}>
                          <td className="text-center">{index + 1}</td>
                          <td className="text-center">{meeting.title}</td>
                          <td className="text-center">{new Date(meeting.date).toLocaleDateString()}</td>
                          <td className="text-center">{meeting.startTime}</td>
                          <td className="text-center">{meeting.duration} minutes</td>
                          <td className="text-center">{meeting.guestName}</td>
                          <td className="text-center">{meeting.guestEmail}</td>
                          <td className="text-center">
                            <div className="dropdown">
                              <button
                                className={`btn btn-sm dropdown-toggle ${getStatusStyle(meeting.status)}`}
                                type="button"
                                data-bs-toggle="dropdown"
                                disabled={updatingStatus === meeting._id}
                              >
                                {updatingStatus === meeting._id ? (
                                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                ) : meeting.status}
                              </button>
                              <ul className="dropdown-menu">
                                <li><button className="dropdown-item" onClick={() => handleStatusUpdate(meeting._id, 'scheduled')}>Scheduled</button></li>
                                <li><button className="dropdown-item" onClick={() => handleStatusUpdate(meeting._id, 'postponed')}>Postponed</button></li>
                                <li><button className="dropdown-item" onClick={() => handleStatusUpdate(meeting._id, 'cancelled')}>Cancelled</button></li>
                                <li><button className="dropdown-item" onClick={() => handleStatusUpdate(meeting._id, 'completed')}>Completed</button></li>
                                <li><button className="dropdown-item" onClick={() => handleStatusUpdate(meeting._id, 'rescheduled')}>Rescheduled</button></li>
                              </ul>
                            </div>
                          </td>
                          <td className="text-center">
                            <div className="btn-group">
                              <button
                                type="button"
                                className="btn icofont-edit text-success fs-6"
                                onClick={() => handleReschedule(meeting)}
                                title="Reschedule"
                              >
                              </button>
                              <button
                                type="button"
                                className="btn icofont-ui-delete text-danger fs-6"
                                data-bs-toggle="modal"
                                data-bs-target="#deleteMeetingModal"
                                onClick={() => setSelectedMeetingId(meeting._id)}
                                title="Delete"
                              >
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                // Grid View
                <div className="row">
                  {currentMeetings.map((meeting, index) => (
                    <div className="col-md-4" key={meeting._id}>
                      <div
                        className="card mt-4 task-card"
                        style={{
                          height: '300px' // Adjusted height for meeting cards
                        }}
                      >
                        <div className="card-body d-flex flex-column">
                          <div className="d-flex justify-content-between">
                            <span className="fw-bold fs-5">{index + 1}. </span>
                            <h5 className="card-title text-capitalize fw-bold">
                              {meeting.title}
                            </h5>
                          </div>

                          <div className="mt-2">
                            <div className="d-flex justify-content-between">
                              <span className="text-muted fw-bold">
                                Date: {new Date(meeting.date).toLocaleDateString()}
                              </span>
                              <span className="text-muted fw-bold">
                                Time: {meeting.startTime}
                              </span>
                            </div>

                            <div className="mt-3">
                              <strong>Duration:</strong> {meeting.duration} mins
                            </div>

                            <div className="mt-3">
                              <strong>Guest Details:</strong>
                              <div className="ms-2">
                                <div><span className="fw-semibold">Name: </span>{meeting.guestName}</div>
                                <div><span className="fw-semibold">Email: </span>{meeting.guestEmail}</div>
                                <div><span className="fw-semibold">Phone: </span>{meeting.guestPhone}</div>
                              </div>
                            </div>

                            <div className="mt-3">
                              <strong>Status:</strong>
                              <div className="d-flex justify-content-between align-items-center mt-2">
                                <div className="dropdown">
                                  <button
                                    className={`btn btn-sm dropdown-toggle ${getStatusStyle(meeting.status)}`}
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    disabled={updatingStatus === meeting._id}
                                  >
                                    {updatingStatus === meeting._id ? (
                                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                    ) : meeting.status}
                                  </button>
                                  <ul className="dropdown-menu">
                                    <li><button className="dropdown-item" onClick={() => handleStatusUpdate(meeting._id, 'scheduled')}>Scheduled</button></li>
                                    <li><button className="dropdown-item" onClick={() => handleStatusUpdate(meeting._id, 'postponed')}>Postponed</button></li>
                                    <li><button className="dropdown-item" onClick={() => handleStatusUpdate(meeting._id, 'cancelled')}>Cancelled</button></li>
                                    <li><button className="dropdown-item" onClick={() => handleStatusUpdate(meeting._id, 'completed')}>Completed</button></li>
                                    <li><button className="dropdown-item" onClick={() => handleStatusUpdate(meeting._id, 'rescheduled')}>Rescheduled</button></li>
                                  </ul>
                                </div>
                                <button
                                  type="button"
                                  className="btn icofont-edit text-success fs-5"
                                  onClick={() => handleReschedule(meeting)}
                                  title="Reschedule"
                                >
                                </button>
                                <button
                                  type="button"
                                  className="btn icofont-ui-delete text-danger fs-5"
                                  data-bs-toggle="modal"
                                  data-bs-target="#deleteMeetingModal"
                                  onClick={() => setSelectedMeetingId(meeting._id)}
                                  title="Delete"
                                >
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add pagination controls */}
              <div className="row mt-3">
                <div className="col-12 col-md-6 mb-3">
                  <div className="d-flex align-items-center">
                    <label htmlFor="meetingsPerPage" className="form-label me-2 mb-0">Meetings per page:</label>
                    <select
                      id="meetingsPerPage"
                      className="form-select"
                      style={{ width: 'auto' }}
                      value={meetingsPerPage}
                      onChange={(e) => {
                        setMeetingsPerPage(e.target.value === 'all' ? filteredMeetings.length : parseInt(e.target.value, 10));
                        setCurrentPage(1);
                      }}
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="all">Show All</option>
                    </select>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <nav aria-label="Page navigation">
                    <ul className="pagination justify-content-md-end">
                      <li className="page-item">
                        <button onClick={prevPage} className="page-link" disabled={currentPage === 1}>
                          &laquo;
                        </button>
                      </li>
                      {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                          <button onClick={() => paginate(page)} className="page-link bg-white">
                            {page}
                          </button>
                        </li>
                      ))}
                      {endPage < totalPages && (
                        <li className="page-item">
                          <button onClick={nextPage} className="page-link">
                            &raquo;
                          </button>
                        </li>
                      )}
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer />
        <FloatingMenu userType="admin" isMobile={isMobile} />
      </div>
      <div className="modal fade" id="deleteMeetingModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold" id="deleteMeetingLabel">
                Delete Meeting Permanently?
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
                You can only delete this Meeting Permanently
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
                onClick={() => handleDelete(selectedMeetingId)}
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

export default AllMeetings;
