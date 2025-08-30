import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Folder, Users } from 'lucide-react';
import { projectService } from '../services/projects';
import Layout from '../components/Layout/Layout';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    <div className="space-y-8">
  {/* Header */}
  <div className="flex justify-between items-center">
    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
    <Link to="/projects/new" className="btn-primary flex items-center space-x-2">
      <Plus className="h-5 w-5" />
      <span>New Project</span>
    </Link>
  </div>

  {/* Projects Section */}
  {loading ? (
    <div className="flex flex-col items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600">Loading projects...</p>
    </div>
  ) : items.length === 0 ? (
    <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
      <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold">No projects yet</h3>
      <p className="text-gray-600 mb-6">Get started by creating your first project</p>
      <Link to="/projects/new" className="btn-primary inline-flex items-center space-x-2">
        <Plus className="h-5 w-5" />
        <span>Create Project</span>
      </Link>
    </div>
  ) : (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((project) => {
        const membersCount = 1 + (project.members?.length || 0);
        return (
          <div
            key={project._id || project.id}
            className="card group hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {project.name}
              </h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                project.isPublic ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
              }`}>
                {project.isPublic ? "Public" : "Private"}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description || "No description"}</p>

            <div className="flex justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{membersCount} members</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: project.color || "#E5E7EB" }} />
                <span>Color</span>
              </div>
            </div>

            <Link
              to={`/projects/${project._id || project.id}`}
              className="mt-4 block w-full text-center btn-secondary"
            >
              View Project
            </Link>
          </div>
        );
      })}
    </div>
  )}
</div>

    </Layout>
  );
};

export default Dashboard;