import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FloatingMenu from '../Chats/FloatingMenu'

const AllMeetings = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/meetings`);
      setMeetings(response.data.meetings || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast.error("Failed to fetch meetings");
      setMeetings([]);
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
              <div className="row">
                {meetings && meetings.length > 0 ? (
                  meetings.map((meeting) => (
                    <div key={meeting._id} className="col-md-4 mb-3">
                      <div className="card">
                        <div className="card-body">
                          <h5 className="card-title">{meeting.title}</h5>
                          <p>Date: {new Date(meeting.date).toLocaleDateString()}</p>
                          <p>Time: {meeting.startTime}</p>
                          <p>Duration: {meeting.duration} minutes</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center">
                    <p>No meetings found</p>
                  </div>
                )}
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

export default AllMeetings;
