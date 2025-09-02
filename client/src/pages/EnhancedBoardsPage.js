
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  getBoards, createBoard, deleteBoard, reorderBoards, updateBoard,
} from '../services/boards';
import BoardCard from '../components/BoardCard';
import StatisticsCard from '../components/StatisticsCard';
import Notification from '../components/Notification';
import { CheckCircle, Clock, List as ListIcon, AlertCircle } from 'lucide-react';
import taskService from '../services/tasks';

export default function EnhancedBoardsPage() {
  const { projectId } = useParams();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectStats, setProjectStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    completionRate: 0
  });

  const isInvalidProjectId = !projectId || projectId === 'undefined';

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  const sortedBoards = useMemo(() => {
    return [...boards].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }, [boards]);

  const filteredBoards = useMemo(() => {
    let filtered = sortedBoards;
    
    if (searchTerm) {
      filtered = filtered.filter(board =>
        board.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        board.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [sortedBoards, searchTerm]);

  const fetchBoards = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBoards(projectId);
      // Filter out boards with undefined or missing _id
      const validBoards = data.filter(board => board._id !== undefined && board._id !== null);
      setBoards(validBoards);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load boards');
      showNotification(e?.response?.data?.message || 'Failed to load boards', 'error');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

 const fetchProjectStats = useCallback(async () => {
  try {
    setStatsLoading(true);
    let total = 0, completed = 0, inProgress = 0, overdue = 0;

    // Filter out boards with invalid IDs before making API calls
    const validBoards = boards.filter(board => board._id && board._id !== 'undefined');
    
    for (const board of validBoards) {
      const tasks = await taskService.getTasks(board._id); 
      total += tasks.length;
      completed += tasks.filter(t => t.status === "done" || t.isCompleted).length;
      inProgress += tasks.filter(t => t.status === "in_progress").length;
      overdue += tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.isCompleted && t.status !== "done").length;
    }

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    setProjectStats({
      totalTasks: total,
      completedTasks: completed,
      inProgressTasks: inProgress,
      overdueTasks: overdue,
      completionRate
    });
  } catch (e) {
    console.error("Failed to fetch project stats:", e);
  } finally {
    setStatsLoading(false);
  }
}, [boards]);


  useEffect(() => {
    if (boards.length > 0) {
      fetchProjectStats();
    }
  }, [boards, fetchProjectStats]);

  useEffect(() => {
    if (projectId && projectId !== 'undefined') {
      fetchBoards();
    }
  }, [projectId, fetchBoards]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showNotification('Board name is required', 'error');
      return;
    }

    try {
      setCreating(true);
      const newBoard = await createBoard(projectId, {
        name: form.name.trim(),
        description: form.description.trim(),
      });
      setForm({ name: '', description: '' });
      setBoards((prev) => [...prev, newBoard]);
      showNotification('Board created successfully!', 'success');
    } catch (e) {
      showNotification(e?.response?.data?.message || 'Failed to create board', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (boardId) => {
    try {
      await deleteBoard(boardId);
      setBoards((prev) => prev.filter((b) => b._id !== boardId));
      showNotification('Board deleted successfully', 'success');
    } catch (e) {
      showNotification(e?.response?.data?.message || 'Failed to delete board', 'error');
    }
  };

  const handleUpdate = async (boardId, updates) => {
    try {
      const updated = await updateBoard(boardId, updates);
      setBoards((prev) => prev.map((b) => (b._id === boardId ? updated : b)));
      showNotification('Board updated successfully', 'success');
      return updated;
    } catch (e) {
      showNotification(e?.response?.data?.message || 'Failed to update board', 'error');
      throw e;
    }
  };

  const moveBoard = (boardId, direction) => {
    setBoards((prev) => {
      const arr = [...prev].sort((a, b) => a.order - b.order);
      const idx = arr.findIndex((b) => b._id === boardId);
      if (idx === -1) return prev;
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= arr.length) return prev;
      const tmp = arr[idx];
      arr[idx] = arr[targetIdx];
      arr[targetIdx] = tmp;
      return arr.map((b, i) => ({ ...b, order: i }));
    });
  };

  const persistOrder = async () => {
    try {
      const boardOrders = sortedBoards.map((b, index) => ({
        boardId: b._id,
        order: index,
      }));
      
      // Debug: Log the data being sent
      console.log('Sending board orders:', boardOrders);
      
      await reorderBoards(boardOrders);
      showNotification('Board order saved successfully', 'success');
    } catch (e) {
      console.error('Reorder error:', e);
      showNotification(e?.response?.data?.message || 'Failed to save order', 'error');
    }
  };

  if (isInvalidProjectId) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchBoards}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link
                to={`/projects/${projectId}`}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Project
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Boards</h1>
            </div>
            <div className="text-sm text-gray-500">
              {filteredBoards.length} board{filteredBoards.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Statistics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatisticsCard
              title="Total Tasks"
              value={projectStats.totalTasks}
              subtitle="Across all boards"
              icon={ListIcon}
              color="blue"
              loading={statsLoading}
            />
            <StatisticsCard
              title="Completed"
              value={projectStats.completedTasks}
              subtitle={`${projectStats.completionRate}% completion rate`}
              icon={CheckCircle}
              color="green"
              loading={statsLoading}
            />
            <StatisticsCard
              title="In Progress"
              value={projectStats.inProgressTasks}
              subtitle="Tasks being worked on"
              icon={Clock}
              color="orange"
              loading={statsLoading}
            />
            <StatisticsCard
              title="Overdue"
              value={projectStats.overdueTasks}
              subtitle="Tasks past due date"
              icon={AlertCircle}
              color="red"
              loading={statsLoading}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search boards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">Create New Board</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Board name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={creating || !form.name.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Board'}
              </button>
            </div>
          </form>

          {sortedBoards.length > 1 && (
            <div className="mb-4">
              <button
                onClick={persistOrder}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Save Board Order
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBoards.map((board, idx) => (
              <BoardCard
                key={board._id}
                board={board}
                projectId={projectId}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                onMove={moveBoard}
                index={idx}
                total={filteredBoards.length}
              />
            ))}
          </div>

          {filteredBoards.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No boards found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'No boards match your search.' : 'Get started by creating a new board.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
