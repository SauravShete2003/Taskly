import Layout from '../components/Layout/Layout';
import { CheckSquare, Plus, } from 'lucide-react';

const TasksPage = () => {
  // Mock tasks data for demonstration
  const mockTasks = [
    {
      id: 1,
      title: 'Design homepage layout',
      status: 'completed',
      priority: 'high',
      project: 'Website Redesign',
      dueDate: '2024-01-15'
    },
    {
      id: 2,
      title: 'Implement user authentication',
      status: 'in-progress',
      priority: 'high',
      project: 'Mobile App Development',
      dueDate: '2024-02-01'
    },
    {
      id: 3,
      title: 'Write API documentation',
      status: 'pending',
      priority: 'medium',
      project: 'Mobile App Development',
      dueDate: '2024-02-15'
    },
    {
      id: 4,
      title: 'Review marketing materials',
      status: 'overdue',
      priority: 'low',
      project: 'Marketing Campaign Q1',
      dueDate: '2024-01-10'
    }
  ];

  // const getStatusIcon = (status) => {
  //   switch (status) {
  //     case 'completed':
  //       return <CheckCircle className="h-4 w-4 text-success-600" />;
  //     case 'in-progress':
  //       return <Clock className="h-4 w-4 text-warning-600" />;
  //     case 'overdue':
  //       return <AlertCircle className="h-4 w-4 text-danger-600" />;
  //     default:
  //       return <Clock className="h-4 w-4 text-gray-400" />;
  //   }
  // };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400';
      case 'in-progress':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400';
      case 'overdue':
        return 'bg-danger-100 text-danger-800 dark:bg-danger-900/20 dark:text-danger-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <Layout showSidebar={true}>
      <div className="space-y-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Tasks
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              Track and manage all your tasks across projects.
            </p>
          </div>
          <button className="btn-primary flex items-center space-x-3 px-6 py-3 text-lg">
            <Plus className="h-6 w-6" />
            <span>New Task</span>
          </button>
        </div>

        {/* Tasks List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              All Tasks ({mockTasks.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {mockTasks.map((task) => (
              <div key={task.id} className="px-8 py-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <CheckSquare className="h-6 w-6 text-gray-400" />
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {task.project}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${getStatusColor(task.status)}`}>
                      {task.status.replace('-', ' ')}
                    </span>
                    <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State (if no tasks) */}
        {mockTasks.length === 0 && (
          <div className="text-center py-20">
            <CheckSquare className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No tasks yet
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Create your first task to get started with project management.
            </p>
            <button className="btn-primary px-8 py-3 text-lg">
              <Plus className="h-5 w-5 mr-3" />
              Create Task
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TasksPage;
