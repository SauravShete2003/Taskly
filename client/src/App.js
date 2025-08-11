import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ProjectForm from './pages/ProjectForm';
import ProjectDetails from './pages/ProjectDetails';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    checkAuth();

    // Listen for storage changes (logout/login in other tabs)
    window.addEventListener('storage', checkAuth);

    // Custom event for auth changes (dispatched in authService)
    const handleAuthChange = () => checkAuth();
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/projects/new"
            element={isAuthenticated ? <ProjectForm /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/projects/:projectId"
            element={isAuthenticated ? <ProjectDetails /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/projects/:projectId/edit"
            element={isAuthenticated ? <ProjectForm /> : <Navigate to="/login" replace />}
          />

          {/* Guest-only routes */}
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />}
          />
          <Route
            path="/register"
            element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />}
          />

          {/* Fallback */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;