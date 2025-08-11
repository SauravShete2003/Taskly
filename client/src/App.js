// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ProjectForm from './pages/ProjectForm';
import ProjectDetails from './pages/ProjectDetails';
import BoardTasks from './pages/BoardTasks';
import TaskForm from './pages/TaskForm';
import TaskDetails from './pages/TaskDetails';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
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

          {/* Protected */}
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} />
          <Route path="/projects/new" element={isAuthenticated ? <ProjectForm /> : <Navigate to="/login" replace />} />
          <Route path="/projects/:projectId" element={isAuthenticated ? <ProjectDetails /> : <Navigate to="/login" replace />} />
          <Route path="/projects/:projectId/edit" element={isAuthenticated ? <ProjectForm /> : <Navigate to="/login" replace />} />

          {/* Boards + Tasks */}
          <Route
            path="/projects/:projectId/boards/:boardId"
            element={isAuthenticated ? <BoardTasks /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/projects/:projectId/boards/:boardId/tasks/new"
            element={isAuthenticated ? <TaskForm /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/tasks/:taskId"
            element={isAuthenticated ? <TaskDetails /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/tasks/:taskId/edit"
            element={isAuthenticated ? <TaskForm /> : <Navigate to="/login" replace />}
          />

          {/* Guests */}
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;