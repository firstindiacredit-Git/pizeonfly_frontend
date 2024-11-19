import React, { useState } from 'react';
import Calendar from './Calander';
import Chat from './Chat';

const FloatingMenu = ({ isMobile }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showChat, setShowChat] = useState(false);

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

    return (
        <>
            <div style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '1rem'
            }}>
                {showMenu && (
                    <>
                        <button
                            className="btn rounded-circle shadow-lg"
                            style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: '#29323c',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onClick={() => setShowCalendar(true)}
                        >
                            <i className="bi bi-calendar-date fs-5"></i>
                        </button>
                        <button
                            className="btn rounded-circle shadow-lg"
                            style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: '#29323c',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onClick={() => setShowChat(true)}
                        >
                            <i className="bi bi-chat-dots fs-5"></i>
                        </button>
                    </>
                )}
                <button
                    className="btn rounded-circle shadow-lg"
                    style={{
                        width: '50px',
                        height: '50px',
                        backgroundColor: '#29323c',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onClick={toggleMenu}
                >
                    <i className="bi bi-list" style={{ fontSize: '1.5rem' }}></i>
                </button>
            </div>

            {showCalendar && (
                <div
                    className="modal show d-block"
                    style={{
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        paddingLeft: isMobile ? '0' : '240px'
                    }}
                >
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Calendar</h5>
                                <button type="button" className="btn-close" onClick={() => setShowCalendar(false)}></button>
                            </div>
                            <div className="modal-body">
                                <Calendar onClose={() => setShowCalendar(false)} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showChat && (
                <div
                    className="modal show d-block"
                    style={{
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        paddingLeft: isMobile ? '0' : '240px'
                    }}
                >
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Chat</h5>
                                <button type="button" className="btn-close" onClick={() => setShowChat(false)}></button>
                            </div>
                            <div className="modal-body">
                                <Chat onClose={() => setShowChat(false)} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FloatingMenu;