import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ClientMeeting = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/client-meetings`);
      if (response.data.success) {
        setMeetings(response.data.meetings);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast.error('Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { class: 'badge bg-primary', text: 'Scheduled' },
      completed: { class: 'badge bg-success', text: 'Completed' },
      cancelled: { class: 'badge bg-danger', text: 'Cancelled' },
      postponed: { class: 'badge bg-warning', text: 'Postponed' },
      rescheduled: { class: 'badge bg-info', text: 'Rescheduled' }
    };
    
    const config = statusConfig[status] || { class: 'badge bg-secondary', text: status };
    return <span className={config.class}>{config.text}</span>;
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesStatus = filterStatus === 'all' || meeting.status === filterStatus;
    const matchesSearch = meeting.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.guestEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading meetings...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                <i className="bi bi-calendar-event me-2"></i>
                All Meetings
              </h4>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={fetchMeetings}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Refresh
                </button>
              </div>
            </div>
            
            <div className="card-body">
              {/* Filters */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name, title, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="postponed">Postponed</option>
                    <option value="rescheduled">Rescheduled</option>
                  </select>
                </div>
              </div>

              {/* Statistics */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card bg-primary text-white">
                    <div className="card-body text-center">
                      <h5 className="card-title">Total Meetings</h5>
                      <h3>{meetings.length}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-success text-white">
                    <div className="card-body text-center">
                      <h5 className="card-title">Scheduled</h5>
                      <h3>{meetings.filter(m => m.status === 'scheduled').length}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-info text-white">
                    <div className="card-body text-center">
                      <h5 className="card-title">Completed</h5>
                      <h3>{meetings.filter(m => m.status === 'completed').length}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-warning text-white">
                    <div className="card-body text-center">
                      <h5 className="card-title">Others</h5>
                      <h3>{meetings.filter(m => !['scheduled', 'completed'].includes(m.status)).length}</h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meetings Table */}
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Client Name</th>
                      <th>Meeting Title</th>
                      <th>Date & Time</th>
                      <th>Duration</th>
                      <th>Contact Info</th>
                      <th>Business Info</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMeetings.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <div className="text-muted">
                            <i className="bi bi-calendar-x fs-1 d-block mb-2"></i>
                            No meetings found
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredMeetings.map((meeting) => (
                        <tr key={meeting._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-sm bg-primary rounded-circle d-flex align-items-center justify-content-center me-2">
                                <span className="text-white fw-bold">
                                  {meeting.guestName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <strong>{meeting.guestName}</strong>
                                {meeting.additionalGuests && meeting.additionalGuests.length > 0 && (
                                  <div className="text-muted small">
                                    +{meeting.additionalGuests.length} guest(s)
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <strong>{meeting.title}</strong>
                              {meeting.description && (
                                <div className="text-muted small mt-1">
                                  {meeting.description.length > 50 
                                    ? `${meeting.description.substring(0, 50)}...` 
                                    : meeting.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div>
                              <div className="fw-bold">{formatDate(meeting.date)}</div>
                              <div className="text-muted">{formatTime(meeting.startTime)}</div>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-secondary">{meeting.duration} min</span>
                          </td>
                          <td>
                            <div className="small">
                              <div>
                                <i className="bi bi-envelope me-1"></i>
                                <a href={`mailto:${meeting.guestEmail}`} className="text-decoration-none">
                                  {meeting.guestEmail}
                                </a>
                              </div>
                              <div>
                                <i className="bi bi-telephone me-1"></i>
                                <a href={`tel:${meeting.guestPhone}`} className="text-decoration-none">
                                  {meeting.guestPhone}
                                </a>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="small">
                              <div>
                                <strong>Revenue:</strong> {meeting.currentRevenue}
                              </div>
                              <div>
                                <strong>Goal:</strong> {meeting.revenueGoal}
                              </div>
                              <div className="text-muted">
                                {meeting.businessStruggle.length > 30 
                                  ? `${meeting.businessStruggle.substring(0, 30)}...` 
                                  : meeting.businessStruggle}
                              </div>
                            </div>
                          </td>
                          <td>
                            {getStatusBadge(meeting.status)}
                          </td>
                          <td>
                            <div className="small text-muted">
                              {new Date(meeting.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Info */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted">
                  Showing {filteredMeetings.length} of {meetings.length} meetings
                </div>
                <div className="text-muted">
                  Last updated: {new Date().toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ClientMeeting;