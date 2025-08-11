// src/pages/TaskDetails.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import  tasksService  from '../services/tasks';
import { authService } from '../services/auth';
import { ArrowLeft, Pencil, Trash2, Calendar, Users, MessageSquare } from 'lucide-react';

function PriorityBadge({ value = 'MEDIUM' }) {
  const v = String(value).toUpperCase();
  const map = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800',
  };
  return <span className={`text-xs px-2 py-1 rounded-full ${map[v] || map.MEDIUM}`}>{v}</span>;
}

const TaskDetails = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [comment, setComment] = useState('');
  const canEditOrDelete = useMemo(() => !!task, [task]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    authService.getProfile().then(setMe).catch(() => {});
    loadTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const loadTask = async () => {
    setLoading(true);
    setErr('');
    try {
      const t = await tasksService.getTaskById(taskId);
      setTask(t);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        (e?.response?.status === 403 ? 'Access denied' : 'Failed to load task');
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!canEditOrDelete) return;
    const ok = window.confirm('Delete this task? This cannot be undone.');
    if (!ok) return;

    try {
      await tasksService.deleteTask(taskId);
      const projId = task?.board?.project;
      const brdId = task?.board?._id || task?.board;
      if (projId && brdId) {
        navigate(`/projects/${projId}/boards/${brdId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (e) {
      alert(e?.response?.data?.message || 'Delete failed');
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const updated = await tasksService.addComment(taskId, comment.trim());
      setTask(updated);
      setComment('');
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to add comment');
    }
  };

  const removeComment = async (cid) => {
    try {
      const updated = await tasksService.removeComment(taskId, cid);
      setTask(updated);
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to remove comment');
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link
              to={
                task?.board
                  ? `/projects/${task.board.project}/boards/${task.board._id || task.board}`
                  : '/dashboard'
              }
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">{task?.title || 'Task'}</h1>
          </div>
          <div className="flex items-center space-x-2">
            {canEditOrDelete && (
              <>
                <Link
                  to={`/tasks/${taskId}/edit`}
                  className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </button>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-600">Loading...</div>
        ) : err ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{err}</div>
        ) : task ? (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{task.title}</h2>
                  <p className="text-gray-600 mt-2 whitespace-pre-wrap">{task.description || 'No description'}</p>
                </div>
                <PriorityBadge value={task.priority} />
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-4 space-x-4">
                {task.dueDate && (
                  <span className="inline-flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                  </span>
                )}
                <span>Order: {task.order ?? 0}</span>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Assignees</span>
              </h3>
              {(task.assignees || []).length === 0 ? (
                <div className="text-gray-600">No assignees</div>
              ) : (
                <ul className="space-y-2">
                  {task.assignees.map((u) => (
                    <li key={u._id || u.id || u} className="flex items-center justify-between">
                      <div>
                        <div className="text-gray-900 font-medium">{u.name || u.email || 'User'}</div>
                        <div className="text-gray-500 text-sm">{u.email}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Comments</span>
              </h3>

              <form onSubmit={submitComment} className="mb-4">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Write a comment..."
                />
                <div className="mt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Add Comment
                  </button>
                </div>
              </form>

              {(task.comments || []).length === 0 ? (
                <div className="text-gray-600">No comments yet</div>
              ) : (
                <div className="space-y-4">
                  {task.comments.map((c) => {
                    const cid = c._id || c.id;
                    const isAuthor = me && (c.user?._id || c.user) === (me._id || me.id);
                    return (
                      <div key={cid} className="border-b last:border-b-0 pb-3 last:pb-0">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">
                              {c.user?.name || c.user?.email || 'User'}
                            </span>{' '}
                            <span className="text-gray-500">
                              • {new Date(c.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {isAuthor && (
                            <button
                              onClick={() => removeComment(cid)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                        <div className="mt-1 text-gray-800 whitespace-pre-wrap">{c.content}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
};

export default TaskDetails;