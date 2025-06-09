export const formatTime12Hour = (time) => {
  // If time already contains AM/PM, return as is
  if (time.toLowerCase().includes('am') || time.toLowerCase().includes('pm')) {
    return time;
  }

  // Convert 24h to 12h format
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  } catch (error) {
    return time; // Return original if parsing fails
  }
}; 