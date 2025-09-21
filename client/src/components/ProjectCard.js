import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  MoreVertical, 
  FolderOpen,
  ExternalLink,
  KanbanSquare,
  Edit3
} from 'lucide-react';

const ProjectCard = ({ project, onMenuClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

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

  const membersCount = 1 + (project.members?.length || 0);
  const projectColor = getProjectColor(project.color);

  return (
    <div className="relative group rounded-2xl border border-gray-200 dark:border-gray-700 
      bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm 
      shadow-md hover:shadow-2xl transition-all duration-300 p-5 flex flex-col justify-between">

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div 
            className="w-5 h-5 rounded-full border border-white shadow-sm flex-shrink-0"
            style={{ backgroundColor: projectColor }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {project.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {project.category || 'Project'}
            </p>
          </div>
        </div>

        {/* Menu */}
        <div className="relative flex items-center flex-shrink-0" ref={menuRef}>
          <button
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen((v) => !v);
              onMenuClick?.(project, e);
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
              transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 w-48 rounded-xl border border-gray-200 dark:border-gray-700 
              bg-white dark:bg-gray-800 shadow-xl py-1 animate-in fade-in zoom-in-95">
              <Link
                to={`/projects/${project._id || project.id}`}
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                onClick={() => setMenuOpen(false)}
              >
                <ExternalLink className="h-4 w-4 mr-2" /> Open Project
              </Link>
              <Link
                to={`/projects/${project._id || project.id}/boards`}
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                onClick={() => setMenuOpen(false)}
              >
                <KanbanSquare className="h-4 w-4 mr-2" /> Show Boards / Tasks
              </Link>
              <Link
                to={`/projects/${project._id || project.id}/edit`}
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                onClick={() => setMenuOpen(false)}
              >
                <Edit3 className="h-4 w-4 mr-2" /> Edit Project
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
        {project.description || "No description available"}
      </p>

      {/* Stats */}
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

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <span 
            className="w-3 h-3 rounded-full border border-white shadow-sm"
            style={{ backgroundColor: projectColor }}
          />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {project.isPublic ? 'Public' : 'Private'}
          </span>
        </div>

        <Link
          to={`/projects/${project._id || project.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium 
            border border-gray-300 dark:border-gray-600 rounded-lg 
            text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 
            hover:bg-primary-50 hover:text-primary-600 hover:border-primary-300 
            dark:hover:bg-gray-800 transition-all duration-200"
        >
          <FolderOpen className="h-4 w-4" /> View Project
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
