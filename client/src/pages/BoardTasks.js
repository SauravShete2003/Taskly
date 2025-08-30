import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import taskService from '../services/tasks';
import { Plus, Pencil, Trash2, Eye, Flag, Calendar, ArrowLeft, RefreshCw } from 'lucide-react';

function priorityPill(priority = 'MEDIUM') {
  const p = String(priority).toUpperCase();
  const styles = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles[p] || styles.MEDIUM}`}>
      {p}
    </span>
  );
}

const BoardTasks = () => {
  const { projectId, boardId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      // Check if boardId is valid before making the API call
      if (!boardId || boardId === 'undefined') {
        console.warn('Invalid boardId provided to loadTasks:', boardId);
        setTasks([]);
        return;
      }
      const list = await taskService.getTasks(boardId);
      setTasks(Array.isArray(list) ? list : []);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        (e?.response?.status === 403 ? 'Access denied' : 'Failed to load tasks');
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  // Load tasks initially + refresh when coming back from task creation page
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    loadTasks();
  }, [projectId, boardId, location.key, loadTasks, navigate]);

  const onDelete = async (taskId) => {
    const ok = window.confirm('Delete this task? This cannot be undone.');
    if (!ok) return;
    try {
      await taskService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => (t._id || t.id) !== taskId));
    } catch (e) {
      setErr(e?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link to={`/projects/${projectId}`} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">Board Tasks</h1>
          </div>
          <Link
            to={`/tasks/board/${boardId}/new`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md inline-flex items-center space-x-2 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            <span>New Task</span>
          </Link>
        </div>

        {/* States */}
        {loading ? (
          <div className="py-10 text-center text-gray-600">Loading tasks...</div>
        ) : err ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p>{err}</p>
            <button
              onClick={loadTasks}
              className="mt-3 inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-1" /> Retry
            </button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No tasks on this board yet.</p>
            <Link
              to={`/tasks/board/${boardId}/new`}
              className="bg-blue-600 text-white px-4 py-2 rounded-md inline-flex items-center space-x-2 hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              <span>Create Task</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((t) => {
              const id = t._id || t.id;
              return (
                <div
                  key={id}
                  className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold">{t.title}</h3>
                    {priorityPill(t.priority)}
                  </div>
                  {t.description && (
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">{t.description}</p>
                  )}
                  <div className="flex items-center text-sm text-gray-500 mt-3 space-x-4">
                    {t.dueDate && (
                      <span className="inline-flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(t.dueDate).toLocaleDateString()}</span>
                      </span>
                    )}
                    <span className="inline-flex items-center space-x-1">
                      <Flag className="h-4 w-4" />
                      <span>Order: {t.order ?? 0}</span>
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-2">
                      <Link
                        to={`/tasks/${id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Link>
                      <Link
                        to={`/tasks/${id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </Link>
                    </div>
                    <button
                      onClick={() => onDelete(id)}
                      className="inline-flex items-center px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BoardTasks;
