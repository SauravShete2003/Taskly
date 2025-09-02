import React from 'react';

const StatisticsCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  color = 'primary',
  loading = false 
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-success-600 dark:text-success-400';
      case 'negative':
        return 'text-danger-600 dark:text-danger-400';
      case 'neutral':
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return '↗';
      case 'negative':
        return '↘';
      case 'neutral':
      default:
        return '→';
    }
  };

  const getIconBgColor = () => {
    const colors = {
      primary: 'bg-primary-100 dark:bg-primary-900/20',
      success: 'bg-success-100 dark:bg-success-900/20',
      warning: 'bg-warning-100 dark:bg-warning-900/20',
      danger: 'bg-danger-100 dark:bg-danger-900/20',
      info: 'bg-blue-100 dark:bg-blue-900/20',
    };
    return colors[color] || colors.primary;
  };

  const getIconTextColor = () => {
    const colors = {
      primary: 'text-primary-600 dark:text-primary-400',
      success: 'text-success-600 dark:text-success-400',
      warning: 'text-warning-600 dark:text-warning-400',
      danger: 'text-danger-600 dark:text-danger-400',
      info: 'text-blue-600 dark:text-blue-400',
    };
    return colors[color] || colors.primary;
  };

  if (loading) {
    return (
      <div className="stat-card animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="skeleton h-4 w-28"></div>
            <div className="skeleton h-8 w-20"></div>
            <div className="skeleton h-3 w-16"></div>
          </div>
          <div className="skeleton w-14 h-14 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="stat-card group hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {value}
          </p>
          {change && (
            <div className={`flex items-center text-sm font-semibold ${getChangeColor()}`}>
              <span className="mr-1.5 text-base">{getChangeIcon()}</span>
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-full ${getIconBgColor()} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`h-7 w-7 ${getIconTextColor()}`} />
        </div>
      </div>
    </div>
  );
};

export default StatisticsCard;
