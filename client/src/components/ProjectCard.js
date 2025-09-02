import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  MoreVertical, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  PlayCircle,
  FolderOpen
} from 'lucide-react';

const ProjectCard = ({ project, onMenuClick }) => {
  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'status-completed',
          text: 'Completed'
        };
      case 'in progress':
      case 'active':
        return {
          icon: PlayCircle,
          color: 'status-active',
          text: 'In Progress'
        };
      case 'overdue':
        return {
          icon: AlertCircle,
          color: 'status-overdue',
          text: 'Overdue'
        };
      case 'pending':
      default:
        return {
          icon: Clock,
          color: 'status-pending',
          text: 'Pending'
        };
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-success-500';
    if (progress >= 60) return 'bg-primary-500';
    if (progress >= 40) return 'bg-warning-500';
    return 'bg-danger-500';
  };

  const getProjectColor = (color) => {
    const colors = {
      blue: '#3B82F6',
      green: '#10B981',
      purple: '#8B5CF6',
      orange: '#F59E0B',
      red: '#EF4444',
      pink: '#EC4899',
      indigo: '#6366F1',
      teal: '#14B8A6',
    };
    return colors[color] || color || '#E5E7EB';
  };

  const StatusIcon = getStatusInfo(project.status).icon;
  const statusColor = getStatusInfo(project.status).color;
  const statusText = getStatusInfo(project.status).text;
  const progress = project.progress || 0;
  const membersCount = 1 + (project.members?.length || 0);
  const projectColor = getProjectColor(project.color);

  return (
    <div className="card group hover:shadow-xl transition-all duration-300 hover-lift">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div 
            className="project-color w-5 h-5 rounded-full border-2 border-white shadow-sm flex-shrink-0"
            style={{ backgroundColor: projectColor }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
              {project.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {project.category || 'Project'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          <span className={`status-badge ${statusColor} flex items-center`}>
            <StatusIcon className="h-3 w-3 mr-1.5" />
            {statusText}
          </span>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              onMenuClick?.(project, e);
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 line-clamp-2 leading-relaxed">
        {project.description || "No description available"}
      </p>

      {/* Progress Bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-sm mb-2.5">
          <span className="text-gray-600 dark:text-gray-400 font-medium">Progress</span>
          <span className="font-semibold text-gray-900 dark:text-white">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-2.5 rounded-full transition-all duration-500 ease-out ${getProgressColor(progress)}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Project Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-5">
        <div className="flex items-center space-x-1.5">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{membersCount} member{membersCount !== 1 ? 's' : ''}</span>
        </div>
        
        {project.deadline && (
          <div className="flex items-center space-x-1.5">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{new Date(project.deadline).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <span 
            className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: projectColor }}
          />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {project.isPublic ? 'Public' : 'Private'}
          </span>
        </div>
        
        <Link
          to={`/projects/${project._id || project.id}`}
          className="btn-secondary text-sm px-4 py-2.5 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-300 transition-all duration-200 font-medium"
        >
          <FolderOpen className="h-4 w-4 mr-2" />
          View Project
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
