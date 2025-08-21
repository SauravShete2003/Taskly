import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { taskService } from '../services/tasks';
import { unwrap } from '../utils/shape.ts';
import { TASK_STATUSES } from '../constants/tasks';
import TaskForm from '../components/TaskForm';
import TaskCard from '../components/TaskCard';

export default function BoardsPage() {
  const { boardId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const payload = await taskService.getTasks(boardId);
      const data = unwrap(payload);
      setTasks(data.tasks || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (boardId) fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  const grouped = useMemo(() => {
    const map = {};
    TASK_STATUSES.forEach(s => (map[s.key] = []));
    for (const t of tasks) {
      const key = t.status || 'todo';
      if (!map[key]) map[key] = [];
      map[key].push(t);
    }
    // sort by order then createdAt
    Object.keys(map).forEach(k => {
      map[k].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || new Date(a.createdAt) - new Date(b.createdAt));
    });
    return map;
  }, [tasks]);

  const handleCreate = async (form) => {
    try {
      const payload = await taskService.createTask(boardId, form);
      const data = unwrap(payload);
      if (data.task) {
        setTasks(prev => [...prev, data.task]);
        setCreating(false);
      } else {
        await fetchTasks();
      }
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    }
  };

  const handleDelete = async (taskId) => {
    const confirmed = window.confirm('Delete this task?');
    if (!confirmed) return;
    try {
      await taskService.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // Requires backend updateTask to accept 'status'
      const payload = await taskService.updateTask(taskId, { status: newStatus });
      const data = unwrap(payload);
      const updated = data.task;
      if (updated) {
        setTasks(prev => prev.map(t => (t._id === taskId ? updated : t)));
      } else {
        await fetchTasks(); // fallback if shape differs
      }
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2>Board Tasks</h2>
        <div>
          {!creating ? (
            <button onClick={() => setCreating(true)}>+ New Task</button>
          ) : (
            <button onClick={() => setCreating(false)}>Cancel</button>
          )}
        </div>
      </header>

      {creating && (
        <div style={{ margin: '16px 0', border: '1px solid #ddd', padding: 16, borderRadius: 8 }}>
          <TaskForm onSave={handleCreate} saving={false} />
        </div>
      )}

      {loading && <p>Loading tasks...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {TASK_STATUSES.map((col) => (
            <div key={col.key} style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
              <h3 style={{ margin: '8px 0 12px' }}>{col.label}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {grouped[col.key]?.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onDelete={() => handleDelete(task._id)}
                    onStatusChange={(s) => handleStatusChange(task._id, s)}
                  />
                ))}
                {grouped[col.key]?.length === 0 && <div style={{ color: '#999', fontSize: 14 }}>No tasks</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}