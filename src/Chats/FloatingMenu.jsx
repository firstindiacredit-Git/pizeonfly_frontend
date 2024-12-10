// import React, { useState } from 'react';
// import Chat from './Chat';
// import EmployeeChat from './EmployeeChat';
// import ClientChat from './ClientChat';

// const FloatingMenu = ({ isMobile, userType }) => {
//     const [showChat, setShowChat] = useState(false);

//     const getChatComponent = () => {
//         switch (userType) {
//             case 'admin':
//                 return <Chat onClose={() => setShowChat(false)} />;
//             case 'employee':
//                 return <EmployeeChat onClose={() => setShowChat(false)} />;
//             case 'client':
//                 return <ClientChat onClose={() => setShowChat(false)} />;
//             default:
//                 return <Chat onClose={() => setShowChat(false)} />;
//         }
//     };

//     const getTitle = () => {
//         switch (userType) {
//             case 'admin':
//                 return 'Admin Chat';
//             case 'employee':
//                 return 'Employee Messages';
//             case 'client':
//                 return 'Client Messages';
//             default:
//                 return 'Chat';
//         }
//     };

//     return (
//         <>
//             <div style={{
//                 position: 'fixed',
//                 bottom: '2rem',
//                 right: '2rem',
//                 zIndex: 1000,
//                 display: 'flex',
//                 flexDirection: 'column',
//                 alignItems: 'flex-end',
//                 gap: '1rem'
//             }}>
//                 <button
//                     className="btn rounded-circle shadow-lg"
//                     style={{
//                         width: '50px',
//                         height: '50px',
//                         backgroundColor: '#1daa61',
//                         color: 'white',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center'
//                     }}
//                     onClick={() => setShowChat(true)}
//                 >
//                     <i className="bi bi-chat" style={{ fontSize: '1.5rem' }}></i>
//                 </button>
//             </div>

//             {showChat && (
//                 <div
//                     className="modal show d-block"
//                     style={{
//                         backgroundColor: 'rgba(0,0,0,0.5)',
//                         paddingLeft: isMobile ? '0' : '240px'
//                     }}
//                 >
//                     <div className="modal-dialog modal-lg modal-dialog-centered" style={{ maxWidth: '74vw' }}>
//                         <div className="modal-content">
//                             <div className="modal-header">
//                                 <h5 className="modal-title">{getTitle()}</h5>
//                                 <button type="button" className="btn-close" onClick={() => setShowChat(false)}></button>
//                             </div>
//                             <div className="modal-body p-0">
//                                 {getChatComponent()}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// };

// export default FloatingMenu;


import React from 'react';
import { useNavigate } from 'react-router-dom';

const FloatingMenu = ({ userType }) => {
    const navigate = useNavigate();

    const getChatRoute = () => {
        switch (userType) {
            case 'admin':
                return '/admin-chat';
            case 'employee':
                return '/employee-chat';
            case 'client':
                return '/client-chat';
            default:
                return '/chat';
        }
    };

    return (
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
            <button
                className="btn rounded-circle shadow-lg"
                style={{
                    width: '50px',
                    height: '50px',
                    // backgroundColor: '#1daa61',
                    // backgroundColor: '#a8acaa91',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onClick={() => navigate(getChatRoute())}
            >
                {/* <i className="bi bi-chat" style={{ fontSize: '1.5rem' }}></i> */}
                <img src="/Images/meesage.gif" alt="chat" style={{ width: '3rem', height: '3rem' }} />
                
            </button>
        </div>
    );
};

export default FloatingMenu;