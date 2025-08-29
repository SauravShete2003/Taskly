import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import taskService from '../services/tasks';
import { unwrap } from '../utils/shape.ts';
import TaskForm from '../components/TaskForm';
import CommentList from '../components/CommentList';
import CommentInput from '../components/CommentInput';
import { TASK_PRIORITIES, TASK_STATUSES } from '../constants/tasks';
import Notification from '../components/Notification';

export default function TaskDetailPage() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ message: '', type: 'info', visible: false });

  // ✅ safer notification
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // ✅ wrap fetchTask in useCallback so it’s stable
  const fetchTask = useCallback(async () => {
    try {
      console.log('Fetching task with ID:', taskId);
      setLoading(true);
      const payload = await taskService.getTaskById(taskId);
      console.log('Fetched task payload:', payload);
      const data = unwrap(payload);
      setTask(data.task || data);
    } catch (e) {
      console.error('Error fetching task:', e);
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    console.log('TaskDetailPage useEffect triggered with taskId:', taskId);
    if (taskId) fetchTask();
  }, [taskId, fetchTask]); // ✅ now fetchTask is stable

  const handleSave = async (form) => {
    try {
      const payload = await taskService.updateTask(taskId, form);
      const data = unwrap(payload);
      setTask(data.task || data);
      setEditing(false);
      showNotification('Task updated successfully!', 'success');
    } catch (e) {
      showNotification(e?.response?.data?.message || e.message || 'Failed to update task', 'error');
    }
  };

  const handleAddComment = async (content) => {
    try {
      const payload = await taskService.addComment(taskId, { content });
      const data = unwrap(payload);
      setTask(data.task || data);
      showNotification('Comment added successfully!', 'success');
    } catch (e) {
      showNotification(e?.response?.data?.message || e.message || 'Failed to add comment', 'error');
    }
  };

  const handleRemoveComment = async (commentId) => {
    try {
      const payload = await taskService.removeComment(taskId, commentId);
      const data = unwrap(payload);
      setTask(data.task || data);
      showNotification('Comment removed successfully!', 'success');
    } catch (e) {
      showNotification(e?.response?.data?.message || e.message || 'Failed to remove comment', 'error');
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (error) return <div style={{ padding: 24, color: 'red' }}>{error}</div>;
  if (!task) return <div style={{ padding: 24 }}>Task not found</div>;

  const priorityLabel = TASK_PRIORITIES.find(p => p.key === task.priority)?.label || task.priority;
  const statusLabel = TASK_STATUSES.find(s => s.key === task.status)?.label || task.status;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      {notification.visible && (
        <Notification message={notification.message} type={notification.type} />
      )}
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
