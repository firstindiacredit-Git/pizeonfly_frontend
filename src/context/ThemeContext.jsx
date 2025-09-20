import { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // Active tab color state
  const [activeTabColor, setActiveTabColor] = useState(() => {
    const savedColor = localStorage.getItem('activeTabColor');
    return savedColor || 'rgba(255, 255, 255, 0.15)'; // Default active color
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('activeTabColor', activeTabColor);
  }, [activeTabColor]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Function to update active tab color based on sidebar color
  const updateActiveTabColor = (sidebarColor) => {
    // Convert sidebar color to active tab color
    // This creates a semi-transparent overlay that works with any sidebar color
    const rgb = hexToRgb(sidebarColor);
    if (rgb) {
      const newActiveColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`;
      setActiveTabColor(newActiveColor);
    }
  };

  // Helper function to convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  return (
    <ThemeContext.Provider value={{ 
      isDarkMode, 
      toggleTheme, 
      activeTabColor, 
      updateActiveTabColor 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
