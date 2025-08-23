import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { unwrap } from '../utils/shape';
import TaskForm from '../components/tasks/TaskForm';
import CommentList from '../components/comments/CommentList';
import CommentInput from '../components/comments/CommentInput';
import { TASK_PRIORITIES, TASK_STATUSES } from '../constants/tasks';

export default function TaskDetailPage() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  const fetchTask = async () => {
    try {
      setLoading(true);
      const payload = await taskService.getTaskById(taskId);
      const data = unwrap(payload);
      setTask(data.task || data);
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) fetchTask();
  
  }, [taskId]);

  const handleSave = async (form) => {
    try {
      const payload = await taskService.updateTask(taskId, form);
      const data = unwrap(payload);
      setTask(data.task || data);
      setEditing(false);
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    }
  };

  const handleAddComment = async (content) => {
    try {
      const payload = await taskService.addComment(taskId, { content });
      const data = unwrap(payload);
      setTask(data.task || data);
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    }
  };

  const handleRemoveComment = async (commentId) => {
    try {
      const payload = await taskService.removeComment(taskId, commentId);
      const data = unwrap(payload);
      setTask(data.task || data);
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (error) return <div style={{ padding: 24, color: 'red' }}>{error}</div>;
  if (!task) return <div style={{ padding: 24 }}>Task not found</div>;

  const priorityLabel = TASK_PRIORITIES.find(p => p.key === task.priority)?.label || task.priority;
  const statusLabel = TASK_STATUSES.find(s => s.key === task.status)?.label || task.status;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 12 }}>
        <Link to={`/boards/${task.board?._id || task.board}/tasks`}>&larr; Back to board</Link>
      </div>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 style={{ margin: 0 }}>{task.title}</h2>
        {!editing ? (
          <button onClick={() => setEditing(true)}>Edit</button>
        ) : (
          <button onClick={() => setEditing(false)}>Cancel</button>
        )}
      </header>

      {!editing ? (
        <div style={{ marginTop: 8 }}>
          {task.description && <p style={{ whiteSpace: 'pre-wrap' }}>{task.description}</p>}
          <div style={{ display: 'flex', gap: 16, color: '#555', fontSize: 14, margin: '8px 0' }}>
            <div><b>Priority:</b> {priorityLabel}</div>
            <div><b>Status:</b> {statusLabel}</div>
            {task.dueDate && <div><b>Due:</b> {new Date(task.dueDate).toLocaleDateString()}</div>}
          </div>
          {task.assignees?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <b>Assignees:</b> {task.assignees.map(a => a?.name || a?.email).filter(Boolean).join(', ')}
            </div>
          )}
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>
          <TaskForm
            defaultValues={{
              title: task.title,
              description: task.description || '',
              priority: task.priority || 'medium',
              dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
              // You can add status here if your backend supports it:
              // status: task.status,
            }}
            onSave={handleSave}
          />
        </div>
      )}

      <section style={{ marginTop: 24 }}>
        <h3>Comments</h3>
        <CommentInput onAdd={handleAddComment} />
        <CommentList
          comments={task.comments || []}
          onRemove={handleRemoveComment}
          currentUserId={localStorage.getItem('userId')}
        />
      </section>
    </div>
  );
}