import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FloatingMenu from '../Chats/FloatingMenu'
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useLocation, useNavigate } from 'react-router-dom';

const CreateMeeting = () => {
  // Get admin user ID from localStorage
  const currentAdminUserId = JSON.parse(localStorage.getItem('user'))?._id;

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [step, setStep] = useState(1);
  const [meetingData, setMeetingData] = useState({
    title: "Consultation Call",
    description: "",
    date: "",
    startTime: "",
    duration: 30,
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    additionalGuests: [],
    currentRevenue: "",
    revenueGoal: "",
    businessStruggle: "",
    confirmAttendance: false,
    organizer: currentAdminUserId,
    agreedToTerms: false
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots] = useState([
    "9:30am", "10:00am", "10:30am", "11:00am", "11:30am",
    "12:00pm", "12:30pm", "1:00pm"
  ]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const { isRescheduling, meetingData: reschedulingData } = location.state || {};
  const navigate = useNavigate();

  useEffect(() => {
    if (isRescheduling && reschedulingData) {
      // Pre-fill the form with existing meeting data
      setMeetingData(reschedulingData);
    }
  }, [isRescheduling, reschedulingData]);

  const handleNextStep = () => {
    if (selectedTime) {
      setStep(2);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMeetingData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentAdminUserId) {
      toast.error("Please login to schedule a meeting");
      return;
    }

    if (!meetingData.agreedToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    // Ensure date and startTime are set before submitting
    if (selectedDate) {
        meetingData.date = selectedDate;
    }
    if (selectedTime) {
        meetingData.startTime = selectedTime;
    }

    // Set loading to true before API call
    setIsLoading(true);

    try {
      let response;
      if (isRescheduling) {
        response = await axios.put(
          `${import.meta.env.VITE_BASE_URL}api/meetings/${meetingData._id}`,
          meetingData
        );
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}api/create-meeting`,
          meetingData
        );
      }

      if (response.data.success) {
        toast.success(isRescheduling ? "Meeting rescheduled successfully!" : "Meeting created successfully!");
        navigate('/all-meetings');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "An error occurred");
    } finally {
      // Set loading to false after API call completes
      setIsLoading(false);
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
              <div className="border-0 mb-3">
                <div className="card-header py-3 no-bg bg-transparent d-flex align-items-center px-0 justify-content-between border-bottom flex-wrap">
                  <h3 className="fw-bold mb-0">Schedule Meeting</h3>
                </div>
              </div>

              <div className=" mb-3">
                <div className="">
                  <h5 className="mb-4">
                    {step === 1 ? "Select a Date & Time" : (

                      <div className="">
                          {/* <span className="cursor-pointer" onClick={() => setStep(1)}><i className="bi bi-arrow-left fs-5" /></span> */}
                        <div className="d-flex justify-content-between">
                          {/* <span className="" > Enter Details</span> */}
                          <span className="cursor-pointer" onClick={() => setStep(1)}><i className="bi bi-arrow-left fs-5 me-2" />Enter Details</span>
                          <span>
                            {selectedDate && `${selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at ${selectedTime}`}
                          </span>
                        </div>
                      </div>

                    )}
                  </h5>
                </div>
                <div className="card-body">
                  {step === 1 ? (
                    <>
                      <div className="row justify-content-center">
                        <div className={`col-md-7 ${!selectedDate ? 'col-lg-6 calendar-centered' : 'calendar-left'}`}>
                          <Calendar
                            onChange={setSelectedDate}
                            value={selectedDate}
                            minDate={new Date()}
                            className="w-100"
                          />
                        </div>
                        <div className={`col-md-5 time-selection ${selectedDate ? 'show' : ''}`}>
                          <div className="mb-3">
                            <label>Time zone</label>
                            <select className="form-select">
                              <option value="Asia/Kolkata">India Standard Time (IST)</option>
                              <option value="America/New_York">Eastern Time (ET)</option>
                              <option value="America/Los_Angeles">Pacific Time (PT)</option>
                              <option value="Europe/London">British Time (GMT/BST)</option>
                              <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
                              <option value="Asia/Singapore">Singapore Time (SGT)</option>
                              <option value="Australia/Sydney">Australian Eastern Time (AET)</option>
                              <option value="Europe/Paris">Central European Time (CET)</option>
                              <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                            </select>
                          </div>
                          <div className="d-flex justify-content-between">
                            <h4>
                              {selectedDate ? selectedDate.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                              }) : ''}
                            </h4>
                            <div className="d-flex align-items-center justify-content-center">
                              <div className="text-nowrap text-center me-2">Select Time - </div>
                              <input type="time" className="form-control form-control-sm w-auto" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} />
                            </div>
                          </div>

                          <div className="time-slots mt-3 mb-3">
                            {timeSlots.map((time) => (
                              <button
                                key={time}
                                className={`btn ${selectedTime === time ? 'btn-primary' : 'btn-outline-primary'} w-100 mb-2`}
                                onClick={() => setSelectedTime(time)}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                          <button
                            className="btn btn-primary w-100 mt-3 btn-lg"
                            onClick={handleNextStep}
                            disabled={!selectedTime}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleSubmit} className="px-4">
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Meeting Title *</label>
                          <input
                            type="text"
                            className="form-control"
                            name="title"
                            value={meetingData.title}
                            onChange={handleInputChange}
                            placeholder="e.g., Consultation Call"
                            required
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">Duration (minutes) *</label>
                          <select
                            className="form-select"
                            name="duration"
                            value={meetingData.duration}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="15">15 minutes</option>
                            <option value="30">30 minutes</option>
                            <option value="45">45 minutes</option>
                            <option value="60">60 minutes</option>
                          </select>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="guestName"
                          value={meetingData.guestName}
                          onChange={handleInputChange}
                          placeholder="e.g.,Jhone Doe"
                          required
                        />
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Email *</label>
                          <input
                            type="email"
                            className="form-control"
                            name="guestEmail"
                            value={meetingData.guestEmail}
                            onChange={handleInputChange}
                            placeholder="e.g.,jhone.doe@example.com"
                            required
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">Phone *</label>
                          <input
                            type="phone"
                            className="form-control"
                            name="guestPhone"
                            value={meetingData.guestPhone}
                            onChange={handleInputChange}
                            placeholder="e.g.,9999999999"
                            required
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Current Monthly Revenue *</label>
                          <input
                            type="text"
                            className="form-control"
                            name="currentRevenue"
                            value={meetingData.currentRevenue}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g., $5000-$7000"
                          />
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label">Revenue Goal *</label>
                          <input
                            type="text"
                            className="form-control"
                            name="revenueGoal"
                            value={meetingData.revenueGoal}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g., $10000 in 3 months"
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Business Struggle *</label>
                        <textarea
                          className="form-control"
                          name="businessStruggle"
                          value={meetingData.businessStruggle}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Any Description</label>
                        <textarea
                          className="form-control"
                          name="description"
                          value={meetingData.description}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="mb-3 form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          name="confirmAttendance"
                          checked={meetingData.confirmAttendance}
                          onChange={handleInputChange}
                          required
                        />
                        <label className="form-check-label">
                          I confirm and agree to come for the call once I book
                        </label>
                      </div>

                      <div className="mb-3 form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          name="agreedToTerms"
                          checked={meetingData.agreedToTerms}
                          onChange={handleInputChange}
                          required
                        />
                        <label className="form-check-label">
                          I agree to the Terms of Use and Privacy Notice
                        </label>
                      </div>

                      <button 
                        type="submit" 
                        className="btn btn-primary w-25 btn-lg fs-6"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        ) : null}
                        {isLoading ? 'Scheduling...' : 'Schedule Event'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer />
        <FloatingMenu userType="admin" isMobile={isMobile} />
      </div>
      <style>
        {`
          .react-calendar {
            width: 100%;
            min-height: 600px;
            border: none;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            padding: 20px;
            background: #fff;
            font-family: inherit;
          }

          /* कैलेंडर हेडर स्टाइलिंग */
          .react-calendar__navigation {
            margin-bottom: 20px;
            height: 60px;
          }

          .react-calendar__navigation button {
            min-width: 50px;
            background: none;
            font-size: 20px;
            font-weight: 600;
            color: #333;
            padding: 15px;
            border-radius: 8px;
          }

          .react-calendar__navigation button:hover {
            background-color: #f0f0f0;
          }

          /* वीकडे हेडर्स */
          .react-calendar__month-view__weekdays {
            font-weight: 600;
            font-size: 16px;
            color: #666;
            text-transform: uppercase;
            padding: 12px 0;
            display: grid !important;
            grid-template-columns: repeat(7, 1fr);
          }

          .react-calendar__month-view__weekdays__weekday {
            text-align: center;
            padding: 8px 0;
          }

          /* अब्ब्रेवीएशन टैग के स्टाइल को रीसेट करें */
          .react-calendar__month-view__weekdays__weekday abbr {
            text-decoration: none;
            cursor: default;
          }

          /* डेज़ ग्रिड को मेंटेन करें */
          .react-calendar__month-view__days {
            display: grid !important;
            grid-template-columns: repeat(7, 1fr);
            gap: 12px;
            padding: 12px;
          }

          /* डेट टाइल्स */
          .react-calendar__tile {
            aspect-ratio: 1/1;
            padding: 0;
            border-radius: 50%;
            font-weight: 500;
            font-size: 16px;
            transition: all 0.2s ease;
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: auto;
            width: 70px;
          }

          .react-calendar__tile--active {
            background: #0d6efd !important;
            color: white !important;
            border-radius: 50%;
          }

          .react-calendar__tile--now {
            background: #e6f3ff;
            color: #0d6efd;
            border-radius: 50%;
            font-weight: bold;
            font-size: 1.2rem
          }

          .react-calendar__tile:hover {
            background-color: #f0f8ff !important;
            border-radius: 50%;
          }

          /* टाइम स्लॉट्स स्टाइलिंग */
          .time-slots {
            max-height: 400px;
            overflow-y: auto;
            padding-right: 10px;
          }

          .time-slots::-webkit-scrollbar {
            width: 6px;
          }

          .time-slots::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }

          .time-slots::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 10px;
          }

          .time-slots .btn {
            text-align: center;
            border-radius: 10px;
            padding: 12px;
            margin: 6px 0;
            font-weight: 500;
            transition: all 0.2s ease;
          }

          .time-slots .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          .calendar-centered {
            transition: all 0.3s ease-in-out;
            margin: 0 auto;
          }

          .calendar-left {
            transition: all 0.3s ease-in-out;
          }

          .time-selection {
            opacity: 0;
            transform: translateX(20px);
            transition: all 0.3s ease-in-out;
            visibility: hidden;
          }

          .time-selection.show {
            opacity: 1;
            transform: translateX(0);
            visibility: visible;
          }

          /* Add these new styles at the end */
          .cursor-pointer i.bi-arrow-left {
            transition: transform 0.2s ease;
            display: inline-block;
          }

          .cursor-pointer:hover i.bi-arrow-left {
            transform: translateX(-4px);
          }
        `}
      </style>
    </>
  );
};

export default CreateMeeting;
