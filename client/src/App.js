import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProjectForm from "./pages/ProjectForm";
import ProjectDetails from "./pages/ProjectDetails";
import BoardTasks from "./pages/BoardTasks";
import EnhancedBoardsPage from "./pages/EnhancedBoardsPage";
import Profile from "./pages/Profile";
import TaskDetailPage from "./pages/TaskDetailPage";
import TaskCreatePage from "./pages/TaskCreatePage";
import ProjectsPage from "./pages/ProjectsPage";
import TasksPage from "./pages/TasksPage";
import AcceptInvite from "./components/AcceptInvite";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token);
        setAuthError(''); // Clear any previous error
      } catch (error) {
        setAuthError('Failed to check authentication status. Please try again.');
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    const handleAuthChange = () => checkAuth();
    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  // Display auth error if present
  if (authError) {
    return <div style={{ padding: 24, color: 'red' }}>{authError}</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/projects"
            element={
              isAuthenticated ? <ProjectsPage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/tasks"
            element={
              isAuthenticated ? <TasksPage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/projects/new"
            element={
              isAuthenticated ? (
                <ProjectForm />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              isAuthenticated ? (
                <ProjectDetails />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/projects/:projectId/edit"
            element={
              isAuthenticated ? (
                <ProjectForm />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/tasks/board/:boardId/new" element={<TaskCreatePage />} />
          <Route path="/tasks/:taskId" element={<TaskDetailPage />} />

          <Route
            path="/projects/:projectId/boards"
            element={
              isAuthenticated ? (
                <EnhancedBoardsPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/projects/:projectId/boards/:boardId"
            element={
              isAuthenticated ? (
                <BoardTasks />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/profile"
            element={
              isAuthenticated ? <Profile /> : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <Login />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/register"
            element={
              !isAuthenticated ? (
                <Register />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to={isAuthenticated ? "/dashboard" : "/login"}
                replace
              />
            }
          />
           <Route path="/accept-invite/:token" element={<AcceptInvite />} />
        </Routes>

      </div>
    </Router>
  );
}

export default App;
