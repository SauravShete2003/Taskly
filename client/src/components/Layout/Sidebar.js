import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Folder, 
  CheckSquare, 
  Users, 
  Settings, 
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Overview and analytics'
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: Folder,
      description: 'Manage your projects'
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: CheckSquare,
      description: 'Track task progress'
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: Users,
      description: 'User profile and settings'
    }
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Navigation
          </h2>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={`
                  group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-r-2 border-primary-500' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                <Icon className={`
                  mr-3 h-5 w-5 transition-colors duration-200
                  ${isActive 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                  }
                `} />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className={`
                    text-xs transition-colors duration-200
                    ${isActive 
                      ? 'text-primary-500 dark:text-primary-300' 
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                    }
                  `}>
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/profile"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg transition-all duration-200"
          >
            <Settings className="mr-3 h-5 w-5 text-gray-400" />
            Settings
          </Link>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
