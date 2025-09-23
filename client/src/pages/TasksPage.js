import { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import { CheckSquare, Plus } from 'lucide-react';
import { projectService } from '../services/projects';
import { authService } from '../services/auth';
import * as boardService from '../services/boards';
import taskService from '../services/tasks';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadAllTasks = async () => {
      setLoading(true);
      setError(null);
      // Quick guard: if there's no token, avoid making protected API calls
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please sign in to view tasks.');
        setLoading(false);
        return;
      }
      try {
        // 1. Get projects the user has access to
        const projects = await projectService.getProjects();

        // 2. For each project, fetch its boards
        // If a particular project's boards request fails (403/forbidden), skip it
        const projectBoards = await Promise.all(
          projects.map(async (p) => {
            try {
              const boards = await boardService.getBoards(p._id);
              return { project: p, boards };
            } catch (err) {
              // If forbidden, user may not have access to this project anymore; skip
              console.warn(`Unable to load boards for project ${p._id}:`, err?.response?.status || err?.message);
              return { project: p, boards: [] };
            }
          })
        );

        // 3. For each board fetch tasks and enrich with project/board info
        const tasksByBoardPromises = projectBoards.flatMap(({ project, boards }) =>
          boards.map(async (b) => {
            try {
              const boardTasks = await taskService.getTasks(b._id);
              // ensure array
              return (boardTasks || []).map((t) => ({ ...t, board: b, project }));
            } catch (err) {
              console.warn(`Unable to load tasks for board ${b._id}:`, err?.response?.status || err?.message);
              return [];
            }
          })
        );

        const nested = await Promise.all(tasksByBoardPromises);
        const flat = nested.flat();

        if (mounted) {
          setTasks(flat);
        }
      } catch (err) {
        console.error('Failed to load tasks:', err);
        if (!mounted) return;
        const status = err?.response?.status;
        if (status === 401) {
          setError('Not authenticated. Please sign in again.');
        } else if (status === 403) {
          setError('Access denied. You do not have permission to view these tasks.');
        } else {
          setError(err?.response?.data?.message || err?.message || 'Failed to load tasks');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAllTasks();
    return () => { mounted = false; };
  }, []);

  // const getStatusIcon = (status) => { ... }

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

  if (loading) return (
    <Layout showSidebar>
      <div className="p-8">Loading tasks…</div>
    </Layout>
  );

  if (error) return (
    <Layout showSidebar>
      <div className="p-8 text-red-600">{error}</div>
    </Layout>
  );

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
               All Tasks ({tasks.length})
             </h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
             {tasks.map((task) => (
               <div key={task._id || task.id} className="px-8 py-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center space-x-4">
                     <CheckSquare className="h-6 w-6 text-gray-400" />
                     <div>
                       <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                         {task.title || task.name}
                       </h3>
                       <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                         {task.project?.name || task.project}
                       </p>
                     </div>
                   </div>
                   
                   <div className="flex items-center space-x-4">
                     <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${getStatusColor(task.status || task.state)}`}>
                       {(task.status || task.state || '').replace('-', ' ')}
                     </span>
                     <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${getPriorityColor(task.priority || task.priorityLevel)}`}>
                       {task.priority || task.priorityLevel}
                     </span>
                     <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                       Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                     </span>
                   </div>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Empty State (if no tasks) */}
  {tasks.length === 0 && (
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
