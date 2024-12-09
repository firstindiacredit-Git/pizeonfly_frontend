import React from 'react';

const RecordingWave = () => {
  return (
    <div className="recording-wave-container" 
      style={{ 
        position: 'absolute', 
        left: '70px',
        right: '70px',
        top: '50%',
        transform: 'translateY(-50%)',
        backgroundColor: '#ffffff',
        padding: '10px 15px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
      <div className="recording-indicator" style={{ color: '#ff0000' }}>
        <i className="bi bi-record-circle" style={{ animation: 'blink 1s infinite' }}></i>
      </div>
      <div className="wave-container" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '3px' }}>
        {[...Array(30)].map((_, index) => (
          <div
            key={index}
            className="wave-bar"
            style={{
              width: '3px',
              backgroundColor: '#075E54',
              height: `${Math.random() * 20 + 5}px`,
              animation: `waveAnimation 0.5s infinite ${index * 0.05}s`,
            }}
          />
        ))}
      </div>
      <div className="recording-text" style={{ color: '#075E54' }}>
        Recording...
      </div>
    </div>
  );
};

export default RecordingWave; 