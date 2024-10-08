import React, { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const Calander = () => {
    const [holidays, setHolidays] = useState([]); // State to store fetched holidays
    const [date, setDate] = useState(new Date()); // Selected date
    const [selectedHoliday, setSelectedHoliday] = useState(null); // State to store selected holiday details
    const [isConfirmed, setIsConfirmed] = useState(null); // State to track the confirmation
    const [decisionMade, setDecisionMade] = useState(false); // New state to track if a decision is made


    // Fetch holidays from your new API endpoint
    useEffect(() => {
        const fetchHolidays = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/holidays`); // Update this line
                setHolidays(response.data.response.holidays); // Store holidays
            } catch (error) {
                toast.error("Error fetching holidays");
            }
        };
        fetchHolidays();
        // Check for existing decision in local storage
        const existingDecision = localStorage.getItem("decisionMade");
        if (existingDecision) {
            setDecisionMade(true); // Set decision made to true if exists
        }
    }, []);

    // Highlight holidays on calendar
    const highlightHolidays = ({ date }) => {
        const adjustedDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        const isoDate = adjustedDate.toISOString().split('T')[0];

        if (holidays.find(h => h.date.iso === isoDate)) {
            return 'text-success'; // Bootstrap class for holidays
        }
    };

    // Handle date change
    const handleDateChange = (newDate) => {
        setDate(newDate);
        const adjustedDate = new Date(newDate.getTime() - (newDate.getTimezoneOffset() * 60000));
        const isoDate = adjustedDate.toISOString().split('T')[0];

        const holiday = holidays.find(h => h.date.iso === isoDate);
        setSelectedHoliday(holiday ? holiday : null); // Set holiday details if exists
    };

    // Handle confirmation of holiday
    const handleConfirm = async (confirmation) => {
        setIsConfirmed(confirmation);
        setDecisionMade(true); // Set decision made to true
        localStorage.setItem("decisionMade", true); // Save decision to local storage
        const adjustedDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        const isoDate = adjustedDate.toISOString().split('T')[0];

        if (confirmation) {
            // Notify employees about the holiday
            const holidayDetails = selectedHoliday;
            await axios.post(`${import.meta.env.VITE_BASE_URL}api/notifyHoliday`, {
                holidayName: holidayDetails.name,
                holidayDate: holidayDetails.date.iso,
                isConfirmed: confirmation
            });
            toast.success(`Tomorrow is a holiday of ${holidayDetails.name} on ${holidayDetails.date.iso}. Enjoy your day off!`);
        } else {
            await axios.post(`${import.meta.env.VITE_BASE_URL}api/notify-holiday`, {
                isConfirmed: confirmation
            });
            toast.info("There is no holiday tomorrow. Please come on time, all employees.");
        }
    };


    return (
        <>
            <div id="mytask-layout">
                <Sidebar />
                <div className="main px-lg-4 px-md-4">
                    <Header />

                    <div className="body d-flex py-lg-3 py-md-2">
                        <div className='d-flex justify-content-around gap-5'>
                            <div>
                                {/* React Calendar */}
                                <Calendar
                                    onChange={handleDateChange}
                                    value={date}
                                    tileClassName={highlightHolidays}
                                />
                            </div>
                            <div className='text-center'>
                                {decisionMade ? (
                                    <h4 className='text-center mb-5'>Thank you for your decision!</h4> // Show "Thank you" message after decision
                                ) : (
                                    <div>
                                        <h4 className='text-center mb-5'>Do you want to declare tomorrow as an office holiday?</h4>

                                        <div className=''>
                                            <button
                                                className="btn btn-success me-5"
                                                onClick={() => handleConfirm(true)} // Confirm holiday
                                            >
                                                Yes
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => handleConfirm(false)} // Decline holiday
                                            >
                                                No
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-4">
                            {selectedHoliday ? (
                                <div className="card">
                                    <div className="card-header">
                                        <h3>Holiday Details:</h3>
                                    </div>
                                    <div className="card-body">
                                        <table className="table table-bordered">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Date</th>
                                                    <th>Description</th>
                                                    <th>Type</th>
                                                    <th>Location</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>{selectedHoliday.name}</td>
                                                    <td>{selectedHoliday.date.iso}</td>
                                                    <td>{selectedHoliday.description}</td>
                                                    <td>{selectedHoliday.type.join(', ')}</td>
                                                    <td>{selectedHoliday.locations}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <p>No holiday details available for the selected date.</p>
                            )}
                        </div>
                    </div>
                </div>
                <ToastContainer />
            </div>
        </>
    );
}

export default Calander;
