import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import taskService from '../services/tasks';
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

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const fetchTask = useCallback(async () => {
    try {
      setLoading(true);
      const task = await taskService.getTaskById(taskId);
      setTask(task);
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
  }, [taskId, fetchTask]); 

  const handleSave = async (form) => {
    try {
      const task = await taskService.updateTask(taskId, form);
      setTask(task);
      setEditing(false);
      showNotification('Task updated successfully!', 'success');
    } catch (e) {
      showNotification(e?.response?.data?.message || e.message || 'Failed to update task', 'error');
    }
  };

  const handleAddComment = async (content) => {
    try {
      const task = await taskService.addComment(taskId, { content });
      setTask(task);
      showNotification('Comment added successfully!', 'success');
    } catch (e) {
      showNotification(e?.response?.data?.message || e.message || 'Failed to add comment', 'error');
    }
  };

  const handleRemoveComment = async (commentId) => {
    try {
      const task = await taskService.removeComment(taskId, commentId);
      setTask(task);
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
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: '#f9fafb', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      {notification.visible && (
        <Notification message={notification.message} type={notification.type} />
      )}
      <div style={{ marginBottom: 16 }}>
        <Link to={`/boards/${task.board?._id || task.board}/tasks`} style={{ textDecoration: 'none', color: '#3b82f6', fontWeight: 'bold' }}>&larr; Back to board</Link>
      </div>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 28, color: '#111827' }}>{task.title}</h2>
        {!editing ? (
          <button onClick={() => setEditing(true)} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontWeight: '600' }}>Edit</button>
        ) : (
          <button onClick={() => setEditing(false)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
        )}
      </header>

      {!editing ? (
        <div style={{ marginTop: 16, color: '#374151' }}>
          {task.description && <p style={{ whiteSpace: 'pre-wrap', fontSize: 16, lineHeight: 1.5 }}>{task.description}</p>}
          <div style={{ display: 'flex', gap: 24, fontSize: 15, margin: '12px 0', color: '#6b7280' }}>
            <div><b>Priority:</b> <span style={{ color: '#2563eb' }}>{priorityLabel}</span></div>
            <div><b>Status:</b> <span style={{ color: '#16a34a' }}>{statusLabel}</span></div>
            {task.dueDate && <div><b>Due:</b> <span>{new Date(task.dueDate).toLocaleDateString()}</span></div>}
          </div>
          {task.assignees?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <b>Assignees:</b> <span>{task.assignees.map(a => a?.name || a?.email).filter(Boolean).join(', ')}</span>
            </div>
          )}
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
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

      <section style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: 20, fontWeight: '600', color: '#111827', borderBottom: '2px solid #3b82f6', paddingBottom: 6 }}>Comments</h3>
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
