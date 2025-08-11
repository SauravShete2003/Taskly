// src/pages/TaskForm.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import  tasksService  from '../services/tasks';
import  projectService from '../services/projects';
import  authService  from '../services/auth';
import { ArrowLeft, Save } from 'lucide-react';

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const TaskForm = () => {
  // Create mode: /projects/:projectId/boards/:boardId/tasks/new
  // Edit mode: /tasks/:taskId/edit
  const { projectId, boardId, taskId } = useParams();
  const isEdit = Boolean(taskId);
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [project, setProject] = useState(null);
  const [task, setTask] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    assignees: [], // user ids
  });

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const memberOptions = useMemo(() => {
    if (!project) return [];
    const owner = project.owner ? [{ user: project.owner, role: 'owner' }] : [];
    return [
      ...owner,
      ...(Array.isArray(project.members) ? project.members : []),
    ].map((m) => ({
      id: m.user?._id || m.user?.id || m.user,
      name: m.user?.name || m.user?.email || 'User',
      email: m.user?.email,
    }));
  }, [project]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    // Load logged-in user
    authService.getProfile().then(setMe).catch(() => {});

    if (isEdit) {
      setLoading(true);
      tasksService
        .getTaskById(taskId)
        .then(async (t) => {
          setTask(t);
          // Load project for assignee list
          const pid = t?.board?.project || projectId;
          if (pid) {
            const p = await projectService.getProjectById(pid);
            setProject(p);
          }
          setForm({
            title: t?.title || '',
            description: t?.description || '',
            priority: String(t?.priority || 'MEDIUM').toUpperCase(),
            dueDate: t?.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : '',
            assignees: (t?.assignees || []).map((u) => u?._id || u?.id || u),
          });
        })
        .catch((e) => setErr(e?.response?.data?.message || 'Failed to load task'))
        .finally(() => setLoading(false));
    } else {
      // Create mode: need project members for assignee list
      if (projectId) {
        projectService.getProjectById(projectId).then(setProject).catch(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, taskId, projectId, boardId]);

  const onChange = (e) => {
    const { name, value, type, checked, options } = e.target;
    if (name === 'assignees') {
      const vals = Array.from(options).filter((o) => o.selected).map((o) => o.value);
      setForm((prev) => ({ ...prev, assignees: vals }));
    } else {
      setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErr('');

    try {
      if (isEdit) {
        const updated = await tasksService.updateTask(taskId, {
          title: form.title,
          description: form.description,
          priority: form.priority,
          dueDate: form.dueDate || null,
          assignees: form.assignees,
        });
        navigate(`/tasks/${updated._id || taskId}`);
      } else {
        if (!boardId) {
          setErr('Missing board ID in URL.');
          setSubmitting(false);
          return;
        }
        const created = await tasksService.createTask(boardId, {
          title: form.title,
          description: form.description,
          priority: form.priority,
          dueDate: form.dueDate || null,
          assignees: form.assignees,
        });
        navigate(`/tasks/${created._id}`);
      }
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        (e?.response?.status === 403 ? 'Access denied' : '') ||
        e?.message ||
        'Save failed';
      setErr(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center space-x-2">
          <Link
            to={
              isEdit && task?.board
                ? `/projects/${task.board.project}/boards/${task.board._id || task.board}`
                : projectId && boardId
                ? `/projects/${projectId}/boards/${boardId}`
                : '/dashboard'
            }
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">{isEdit ? 'Edit Task' : 'Create Task'}</h1>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-600">Loading...</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            {err && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {err}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                name="title"
                type="text"
                required
                value={form.title}
                onChange={onChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Task title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={onChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the task"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={onChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Due date</label>
                <input
                  name="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={onChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Assignees</label>
              <select
                multiple
                name="assignees"
                value={form.assignees}
                onChange={onChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-32"
              >
                {memberOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.email ? `(${m.email})` : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple.</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{submitting ? 'Saving...' : 'Save'}</span>
              </button>
              <Link
                to={
                  isEdit && task?.board
                    ? `/projects/${task.board.project}/boards/${task.board._id || task.board}`
                    : projectId && boardId
                    ? `/projects/${projectId}/boards/${boardId}`
                    : '/dashboard'
                }
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default TaskForm;