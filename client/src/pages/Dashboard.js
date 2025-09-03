import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Folder, 
  Clock, 
  CheckCircle, 
  Calendar,
  BarChart3,
  Search,
  Grid3X3,
  List as ListIcon
} from 'lucide-react';
import { projectService } from '../services/projects';
import Layout from '../components/Layout/Layout';
import StatisticsCard from '../components/StatisticsCard';
import ProjectCard from '../components/ProjectCard';
import EmptyState from '../components/EmptyState';

const normalizeStatus = (status) => {
  const s = (status || '').toString().toLowerCase().trim();
  if (!s) return 'pending';
  if (['in progress', 'in-progress', 'active', 'ongoing'].includes(s)) return 'active';
  if (['completed', 'complete', 'done'].includes(s)) return 'completed';
  if (['overdue', 'late', 'past due', 'past-due'].includes(s)) return 'overdue';
  if (['pending', 'to do', 'to-do', 'todo', 'not started', 'not-started'].includes(s)) return 'pending';
  return s;
};

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); 
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  // ✅ Stable fetchProjects function
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const list = await projectService.getProjects();
      setProjects(Array.isArray(list) ? list : []);  
      setError(null);
    } catch (error) {
      console.error('Error fetching projects:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError("Failed to fetch projects");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Load projects on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProjects();
  }, [navigate, fetchProjects]);

  const handleProjectMenuClick = (project) => {
    console.log('Project menu clicked:', project);
  };

  // ✅ Stats
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => normalizeStatus(p.status) === 'completed').length;
  const inProgressProjects = projects.filter(p => normalizeStatus(p.status) === 'active').length;
  const overdueProjects = projects.filter(p => {
    if (!p.deadline) return false;
    return new Date(p.deadline) < new Date() && normalizeStatus(p.status) !== 'completed';
  }).length;

  // ✅ Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || normalizeStatus(project.status) === normalizeStatus(filterStatus);
    return matchesSearch && matchesStatus;
  });

  const items = Array.isArray(filteredProjects) ? filteredProjects : [];

  const stats = [
    {
      title: 'Total Projects',
      value: totalProjects,
      change: '+12%',
      changeType: 'positive',
      icon: Folder,
      color: 'primary'
    },
    {
      title: 'Completed',
      value: completedProjects,
      change: '+8%',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'success'
    },
    {
      title: 'In Progress',
      value: inProgressProjects,
      change: '+5%',
      changeType: 'neutral',
      icon: Clock,
      color: 'warning'
    },
    {
      title: 'Overdue',
      value: overdueProjects,
      change: overdueProjects > 0 ? '!' : '0',
      changeType: overdueProjects > 0 ? 'negative' : 'neutral',
      icon: Calendar,
      color: overdueProjects > 0 ? 'danger' : 'info'
    }
  ];

  if (error) {
    return (
      <Layout showSidebar={true}>
        <div className="text-center py-20">
          <div className="text-red-500 text-xl mb-6 font-medium">{error}</div>
          <button 
            onClick={fetchProjects}
            className="btn-primary px-6 py-3"
          >
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
              Welcome back! 👋
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              Here's what's happening with your projects today.
            </p>
          </div>
          <Link to="/projects/new" className="btn-primary flex items-center space-x-3 px-6 py-3 text-lg">
            <Plus className="h-6 w-6" />
            <span>New Project</span>
          </Link>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatisticsCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
              color={stat.color}
              loading={loading}
            />
          ))}
        </div>

        {/* Projects Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pt-10 border-t border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Your Projects
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {items.length} project{items.length !== 1 ? 's' : ''} • {totalProjects} total
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
              <option value="active">Active</option>
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
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className={`grid gap-8 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {items.map((project) => (
              <ProjectCard
                key={project._id || project.id}
                project={project}
                onMenuClick={handleProjectMenuClick}
              />
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {!loading && items.length > 0 && (
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-3xl p-10 border border-primary-200 dark:border-primary-800">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Need help getting started?
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Explore our guides and templates to kickstart your project management journey.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link to="/projects/new" className="btn-primary px-8 py-3 text-lg">
                  <Plus className="h-5 w-5 mr-3" />
                  Create Another Project
                </Link>
                <button className="btn-secondary px-8 py-3 text-lg">
                  <BarChart3 className="h-5 w-5 mr-3" />
                  View Templates
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
