import { useEffect, useState } from 'react';
import { Link, useNavigate , useParams  } from 'react-router-dom';
import { Plus, Folder, CheckSquare, Users } from 'lucide-react';
import { projectService } from '../services/projects';
import Layout from '../components/Layout/Layout';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { projectId } = useParams();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchProjects = async () => {
    try {
      const list = await projectService.getProjects();
      setProjects(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to load projects');
      }
    } finally {
      setLoading(false);
    }
  };

  const items = Array.isArray(projects) ? projects : [];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

              <Link to={`/projects/${projectId}/boards`}>View Boards</Link>
          <Link
            to="/projects/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            <span>New Project</span>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first project</p>
            <Link
              to="/projects/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md inline-flex items-center space-x-2 hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              <span>Create Project</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((project) => (
              <div
                key={project._id || project.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      project.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : project.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{project.members?.length || 0} members</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckSquare className="h-4 w-4" />
                    <span>{project.tasks?.length || 0} tasks</span>
                  </div>
                </div>

                <Link
                  to={`/projects/${project._id || project.id}`}
                  className="mt-4 block w-full text-center bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                >
                  View Project
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;