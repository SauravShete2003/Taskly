import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, User, LogOut } from 'lucide-react';
import { authService } from '../../services/auth';

const Header = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
   <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      
      {/* Logo */}
      <Link to="/" className="flex items-center space-x-2">
        <Home className="h-6 w-6 text-blue-600" />
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Taskly
        </span>
      </Link>

      {/* Nav */}
      <nav className="hidden md:flex space-x-6">
        <Link to="/" className="hover:text-blue-600 font-medium transition-colors">Dashboard</Link>
        <Link to="/projects" className="hover:text-blue-600 font-medium transition-colors">Projects</Link>
      </nav>

      {/* Auth */}
      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            <Link to="/profile" className="text-gray-600 hover:text-blue-600 transition-colors">
              <User className="h-5 w-5" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="btn-primary text-sm"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  </div>
</header>

  );
};

export default Header;
