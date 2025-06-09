import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ meetingDate, meetingTime }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        const now = new Date();
        const meetingDateTime = new Date(meetingDate);
        
        // Convert meeting time to Date object
        const [time, period] = meetingTime.split(' ');
        const [hours, mins] = time.split(':');
        let hour = parseInt(hours);
        
        // Convert to 24-hour format for calculation
        if (period.toLowerCase() === 'pm' && hour !== 12) {
          hour += 12;
        } else if (period.toLowerCase() === 'am' && hour === 12) {
          hour = 0;
        }
        
        meetingDateTime.setHours(hour, parseInt(mins), 0);
        const difference = meetingDateTime - now;

        if (difference < 0) {
          return 'Meeting time passed';
        }

        // Calculate time components
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const remainingHours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const remainingMinutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Format the output string
        let timeString = '';
        if (days > 0) timeString += `${days}d `;
        
        // Convert hours to 12-hour format for display
        let displayHours = remainingHours;
        if (displayHours > 12) {
          displayHours = displayHours % 12 || 12;
        }
        
        if (remainingHours > 0 || days > 0) timeString += `${displayHours}h `;
        if (remainingMinutes > 0 || remainingHours > 0 || days > 0) timeString += `${remainingMinutes}m `;
        timeString += `${seconds}s`;

        return timeString;

      } catch (error) {
        console.error('Error in calculateTimeLeft:', error);
        return 'Error calculating time';
      }
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Cleanup
    return () => clearInterval(timer);
  }, [meetingDate, meetingTime]);

  return (
    <span className="badge bg-primary text-light ms-2">
      {timeLeft}
    </span>
  );
};

export default CountdownTimer;