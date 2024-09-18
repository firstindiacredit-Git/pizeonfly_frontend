// AuthCheck.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCheck = () => {
    const navigate = useNavigate();
  
    useEffect(() => {
      const checkAuth = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            navigate('/signin');
            return;
          }
  
          const response = await fetch('http://localhost:3000/authenticate', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token,
            },
          });
  
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
  
          const data = await response.json();
          console.log('Response data:', data);
  
          if (!data.authenticated) {
            navigate('/signin');
          }
        } catch (error) {
          console.error('Error checking authentication:', error);
          navigate('/signin');
        }
      };
  
      checkAuth();
    }, [navigate]);
  
    return null;
  };
  
  

export default AuthCheck;
