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
    <div className="container-xxl">
      <div className="row">
        {/* Users List */}
        <div className="col-lg-4 col-md-12">
          <div className="card border-0">
            <div className="card-body">
              {/* Tabs */}
              <ul className="nav nav-pills mb-3" role="tablist">
                {tabs.map(tab => (
                  <li key={tab.id} className="nav-item">
                    <button
                      className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => onTabChange(tab.id)}
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Users List */}
              <div className="tab-content">
                <div className="tab-pane fade show active">
                  <ul className="list-unstyled list-group list-group-custom list-group-flush mb-0">
                    {users.map(user => renderUserItem(user, selectedUser, onUserSelect))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="col-lg-8 col-md-12">
          {selectedUser ? (
            <div className="card border-0">
              {/* Chat Header */}
              <div className="card-header py-3 px-4 border-bottom">
                <div className="d-flex align-items-center">
                  {selectedUser.userType === 'AdminUser' ? (
                    <div className="avatar rounded-circle">
                      {selectedUser.email.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <img
                      src={`${import.meta.env.VITE_BASE_URL}${
                        selectedUser.userType === 'Employee'
                          ? selectedUser.employeeImage.replace('uploads/', '')
                          : selectedUser.clientImage.replace('uploads/', '')
                      }`}
                      className="avatar rounded-circle"
                      alt={selectedUser.employeeName || selectedUser.clientName}
                    />
                  )}
                  <div className="flex-fill ms-3">
                    <h6 className="mb-0">
                      {selectedUser.employeeName || selectedUser.clientName || selectedUser.email}
                    </h6>
                    <small className="text-muted">{selectedUser.userType}</small>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="card-body chat-box p-4" style={{ height: '500px', overflowY: 'auto' }}>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat-message ${msg.isCurrentUser ? 'me' : 'other'}`}
                  >
                    <div className={`message-bubble ${msg.isCurrentUser ? 'bg-primary text-white' : 'bg-light'}`}>
                      {msg.message}
                    </div>
                    <small className="text-muted">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </small>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="card-footer border-top bg-transparent py-3 px-4">
                <form onSubmit={onMessageSubmit}>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={onMessageChange}
                    />
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-send"></i>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="card border-0">
              <div className="card-body text-center py-5">
                <h5>Select a user to start chatting</h5>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;
