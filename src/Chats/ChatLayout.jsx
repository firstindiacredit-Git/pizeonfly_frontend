import React from 'react';

const ChatLayout = ({
    users,
    selectedUser,
    messages,
    newMessage,
    activeTab,
    tabs,
    onTabChange,
    onUserSelect,
    onMessageChange,
    onMessageSubmit,
    messagesEndRef,
    renderUserItem
}) => {
    return (
        <div className="container-fluid p-0">
            <div className="row g-0" style={{ height: '100vh' }}>
                {/* Users List - Updated styling */}
                <div className="col-lg-4 col-md-12 border-end" style={{ height: '100vh', backgroundColor: '#ffffff' }}>
                    <div className="card border-0 h-100">
                        <div className="card-body p-0">
                            {/* Tabs - Updated styling */}
                            <div className="px-4 py-3 bg-primary bg-opacity-10">
                                <ul className="nav nav-pills" role="tablist">
                                    {tabs.map(tab => (
                                        <li key={tab.id} className="nav-item">
                                            <button
                                                className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                                                onClick={() => onTabChange(tab.id)}
                                                style={{
                                                    backgroundColor: activeTab === tab.id ? '#25D366' : 'transparent',
                                                    color: activeTab === tab.id ? 'white' : '#075E54'
                                                }}
                                            >
                                                {tab.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Users List - Updated styling */}
                            <div className="tab-content" style={{
                                height: 'calc(100vh - 70px)',
                                overflowY: 'auto',
                                msOverflowStyle: 'none',  /* Hide scrollbar for IEand Edge */
                                scrollbarWidth: 'none',   /* Hide scrollbar for Firefox */
                                '&::-webkit-scrollbar': {
                                    display: 'none'       /* Hide scrollbar for Chrome, Safari and Opera */
                                }
                            }}>
                                <div className="tab-pane fade show active">
                                    <ul className="list-unstyled list-group list-group-custom list-group-flush mb-0">
                                        {users.map(user => renderUserItem(user, selectedUser, onUserSelect))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Area - Updated styling */}
                <div className="col-lg-8 col-md-12" style={{ height: '100vh', backgroundColor: '#efeae2' }}>
                    {selectedUser ? (
                        <div className="card border-0 h-100">
                            {/* Chat Header - Updated styling */}
                            <div className="card-header py-3 px-4 bg-white">
                                <div className="d-flex align-items-center">
                                    {selectedUser.userType === 'AdminUser' ? (
                                        <div className="avatar rounded-circle d-flex align-items-center justify-content-center"
                                            style={{ width: '40px', height: '40px', backgroundColor: '#25D366', color: 'white' }}>
                                            {selectedUser.email.charAt(0).toUpperCase()}
                                        </div>
                                    ) : (
                                        <img
                                            src={`${import.meta.env.VITE_BASE_URL}${selectedUser.userType === 'Employee'
                                                ? selectedUser.employeeImage.replace('uploads/', '')
                                                : selectedUser.clientImage.replace('uploads/', '')
                                                }`}
                                            className="avatar rounded-circle"
                                            alt={selectedUser.employeeName || selectedUser.clientName}
                                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                        />
                                    )}
                                    <div className="flex-fill ms-3">
                                        <h6 className="mb-0 fw-bold">
                                            {selectedUser.employeeName || selectedUser.clientName || selectedUser.email}
                                        </h6>
                                        <small className="text-muted">{selectedUser.userType}</small>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Area - Updated styling */}
                            <div className="card-body chat-box p-4"
                                style={{
                                    height: 'calc(100vh - 140px)',
                                    overflowY: 'auto',
                                    backgroundImage: 'url("path-to-your-whatsapp-background.png")',
                                    backgroundColor: '#efeae2'
                                }}>
                                {messages.map((msg, index) => (
                                    <div key={index}
                                        className={`chat-message d-flex ${msg.isCurrentUser ? 'justify-content-end' : 'justify-content-start'} mb-3`}>
                                        <div className={`message-bubble p-3 rounded-3${msg.isCurrentUser ? 'bg-success bg-opacity-75 text-white' : 'bg-white'
                                            }`}
                                            style={{ maxWidth: '75%', position: 'relative' }}>
                                            {msg.message}
                                            <small className={`d-block text-end ${msg.isCurrentUser ? 'text-white-50' : 'text-muted'}`}
                                                style={{ fontSize: '0.7rem' }}>
                                                {new Date(msg.createdAt).toLocaleTimeString()}
                                            </small>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input - Updated styling */}
                            <div className="card-footer border-top bg-white py-3 px-4">
                                <form onSubmit={onMessageSubmit}>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control rounded-pill me-2"
                                            placeholder="Type your message..."
                                            value={newMessage}
                                            onChange={onMessageChange}
                                            style={{ backgroundColor: '#f0f2f5' }}
                                        />
                                        <button type="submit"
                                            className="btn btn-success rounded-circle d-flex align-items-center justify-content-center"
                                            style={{ width: '40px', height: '40px' }}>
                                            <i className="bi bi-send"></i>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="card border-0 h-100 d-flex align-items-center justify-content-center">
                            <div className="text-center text-muted">
                                <i className="bi bi-chat-dots" style={{ fontSize: '3rem' }}></i>
                                <h5 className="mt-3">Select a user tostart chatting</h5>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatLayout;
