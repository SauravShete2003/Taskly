import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children, showSidebar = false }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check for dark mode preference
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    
    // Listen for dark mode changes from header
    const handleDarkModeChange = () => {
      const newDarkMode = localStorage.getItem('darkMode') === 'true';
      setIsDarkMode(newDarkMode);
    };

    window.addEventListener('storage', handleDarkModeChange);
    window.addEventListener('darkModeChange', handleDarkModeChange);

    return () => {
      window.removeEventListener('storage', handleDarkModeChange);
      window.removeEventListener('darkModeChange', handleDarkModeChange);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300 ${
      isDarkMode ? 'dark' : ''
    }`}>
      <Header onMenuClick={toggleSidebar} />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
        )}
        
        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${
          showSidebar && sidebarOpen ? 'ml-64' : ''
        }`}>
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
