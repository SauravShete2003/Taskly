import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Search,
  Plus
} from 'lucide-react';
import { authService } from '../../services/auth';

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    // Check for dark mode preference
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
    
    // Get user info if authenticated
    if (token) {
      // You can fetch user info here if needed
      setUser({ name: 'User', avatar: null });
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3" onClick={closeMobileMenu}>
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent dark:from-primary-400 dark:to-indigo-400">
              Taskly
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/dashboard" 
              className={`font-medium transition-colors ${
                isActiveRoute('/dashboard') 
                  ? 'text-primary-600 dark:text-primary-400' 
                  : 'text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/projects" 
              className={`font-medium transition-colors ${
                isActiveRoute('/projects') 
                  ? 'text-primary-600 dark:text-primary-400' 
                  : 'text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400'
              }`}
            >
              Projects
            </Link>
            <Link 
              to="/tasks" 
              className={`font-medium transition-colors ${
                isActiveRoute('/tasks') 
                  ? 'text-primary-600 dark:text-primary-400' 
                  : 'text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400'
              }`}
            >
              Tasks
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-64 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {/* New Project Button */}
            <Link 
              to="/projects/new" 
              className="hidden sm:inline-flex btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Link>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="hidden lg:block text-sm font-medium">{user?.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-danger-600 dark:text-gray-300 dark:hover:text-danger-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden lg:block text-sm font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-primary text-sm"
              >
                Login
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4 animate-fade-in-up">
            <div className="flex flex-col space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white dark:placeholder-gray-400"
                />
              </div>

              {/* Mobile Navigation Links */}
              <Link 
                to="/dashboard" 
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  isActiveRoute('/dashboard') 
                    ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800'
                }`}
                onClick={closeMobileMenu}
              >
                Dashboard
              </Link>
              <Link 
                to="/projects" 
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  isActiveRoute('/projects') 
                    ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800'
                }`}
                onClick={closeMobileMenu}
              >
                Projects
              </Link>
              <Link 
                to="/tasks" 
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  isActiveRoute('/tasks') 
                    ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800'
                }`}
                onClick={closeMobileMenu}
              >
                Tasks
              </Link>

              {/* Mobile New Project Button */}
              <Link 
                to="/projects/new" 
                className="mx-3 btn-primary justify-center"
                onClick={closeMobileMenu}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
