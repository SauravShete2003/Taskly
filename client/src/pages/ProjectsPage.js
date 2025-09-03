import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Grid3X3, List as ListIcon } from 'lucide-react';
import { projectService } from '../services/projects';
import Layout from '../components/Layout/Layout';
import ProjectCard from '../components/ProjectCard';

const normalizeStatus = (status) => {
  const s = (status || '').toString().toLowerCase().trim();
  if (!s) return 'pending';
  if (['in progress', 'in-progress', 'active', 'ongoing'].includes(s)) return 'active';
  if (['completed', 'complete', 'done'].includes(s)) return 'completed';
  if (['overdue', 'late', 'past due', 'past-due'].includes(s)) return 'overdue';
  if (['pending', 'to do', 'to-do', 'todo', 'not started', 'not-started'].includes(s)) return 'pending';
  return s;
};

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all');
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

  const handleProjectMenuClick = (project, event) => {
    console.log('Project menu clicked:', project);
  };

  // Filter projects based on search and status
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const normalized = normalizeStatus(project.status);
    const selected = normalizeStatus(filterStatus);
    const matchesStatus = filterStatus === 'all' || normalized === selected;
    return matchesSearch && matchesStatus;
  });

  const items = Array.isArray(filteredProjects) ? filteredProjects : [];

  if (error) {
    return (
      <Layout showSidebar={true}>
        <div className="text-center py-20">
          <div className="text-red-500 text-xl mb-6 font-medium">{error}</div>
          <button onClick={fetchProjects} className="btn-primary px-6 py-3">
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true}>
      <div className="space-y-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Projects
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              Manage and organize all your projects in one place.
            </p>
          </div>
          <Link
            to="/projects/new"
            className="btn-primary flex items-center space-x-3 px-6 py-3 text-lg"
          >
            <Plus className="h-6 w-6" />
            <span>New Project</span>
          </Link>
        </div>

        {/* Projects Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pt-10 border-t border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              All Projects
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {items.length} project{items.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white dark:placeholder-gray-400"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white font-medium"
            >
              <option value="all">All Status</option>
              <option value="active">Active / In Progress</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <ListIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Projects Content */}
        {loading ? (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="space-y-5">
                  <div className="flex items-center space-x-3">
                    <div className="skeleton w-5 h-5 rounded-full"></div>
                    <div className="space-y-2.5 flex-1">
                      <div className="skeleton h-6 w-3/4"></div>
                      <div className="skeleton h-4 w-1/2"></div>
                    </div>
                  </div>
                  <div className="skeleton h-4 w-full"></div>
                  <div className="skeleton h-2.5 w-full"></div>
                  <div className="flex justify-between">
                    <div className="skeleton h-4 w-24"></div>
                    <div className="skeleton h-4 w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`grid gap-8 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}
          >
            {items.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onMenuClick={handleProjectMenuClick}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProjectsPage;
