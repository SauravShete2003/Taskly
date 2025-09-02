import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderOpen, Sparkles, ArrowRight } from 'lucide-react';

const EmptyState = ({ 
  title = "No projects yet", 
  description = "Get started by creating your first project to organize your work and collaborate with your team.",
  actionText = "Create Project",
  actionLink = "/projects/new",
  icon: Icon = FolderOpen,
  showSparkles = true,
  variant = "default"
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          iconBg: "bg-success-100 dark:bg-success-900/20",
          iconColor: "text-success-600 dark:text-success-400",
          borderColor: "border-success-200 dark:border-success-800",
          bgColor: "bg-success-50 dark:bg-success-900/10"
        };
      case "warning":
        return {
          iconBg: "bg-warning-100 dark:bg-warning-900/20",
          iconColor: "text-warning-600 dark:text-warning-400",
          borderColor: "border-warning-200 dark:border-warning-800",
          bgColor: "bg-warning-50 dark:bg-warning-900/10"
        };
      case "info":
        return {
          iconBg: "bg-blue-100 dark:bg-blue-900/20",
          iconColor: "text-blue-600 dark:text-blue-400",
          borderColor: "border-blue-200 dark:border-blue-800",
          bgColor: "bg-blue-50 dark:bg-blue-900/10"
        };
      default:
        return {
          iconBg: "bg-primary-100 dark:bg-primary-900/20",
          iconColor: "text-primary-600 dark:text-primary-400",
          borderColor: "border-primary-200 dark:border-primary-800",
          bgColor: "bg-primary-50 dark:bg-primary-900/10"
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`relative overflow-hidden rounded-2xl border-2 border-dashed ${styles.borderColor} ${styles.bgColor} p-12 text-center animate-fade-in-up`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, currentColor 2px, transparent 2px)`,
          backgroundSize: '24px 24px'
        }} />
      </div>

      {/* Sparkles */}
      {showSparkles && (
        <>
          <Sparkles className="absolute top-8 left-8 h-6 w-6 text-yellow-400 animate-pulse" />
          <Sparkles className="absolute top-12 right-12 h-4 w-4 text-yellow-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <Sparkles className="absolute bottom-8 left-16 h-5 w-5 text-yellow-400 animate-pulse" style={{ animationDelay: '1s' }} />
        </>
      )}

      {/* Main Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div className={`mx-auto w-20 h-20 ${styles.iconBg} rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`h-10 w-10 ${styles.iconColor}`} />
        </div>

        {/* Text Content */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {title}
        </h3>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
          {description}
        </p>

        {/* Action Button */}
        <Link
          to={actionLink}
          className="btn-primary inline-flex items-center space-x-2 text-lg px-8 py-3 hover:scale-105 transition-transform duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>{actionText}</span>
          <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>

        {/* Additional Info */}
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>✨ Start organizing your work today</p>
          <p className="mt-1">🚀 Collaborate with your team seamlessly</p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br from-primary-200 to-primary-300 dark:from-primary-800 dark:to-primary-900 rounded-full opacity-20 blur-xl" />
      <div className="absolute -top-2 -left-2 w-16 h-16 bg-gradient-to-br from-primary-200 to-primary-300 dark:from-primary-800 dark:to-primary-900 rounded-full opacity-20 blur-xl" />
    </div>
  );
};

export default EmptyState;
