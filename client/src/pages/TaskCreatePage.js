import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import TaskForm from '../components/TaskForm';
import taskService from '../services/tasks';
import Notification from '../components/Notification';

export default function TaskCreatePage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ message: '', type: 'info', visible: false });
  const [saving, setSaving] = useState(false);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification({ ...notification, visible: false });
    }, 3000);
  };

  const handleSave = async (form) => {
    try {
      setSaving(true);
      console.log('Creating task with form:', form, 'for board:', boardId);
      const result = await taskService.createTask(boardId, form);
      console.log('Task creation result:', result);
      setSaving(false);
      
      // Handle both response structures: {task: {...}} and direct task object
      const task = result.task || result;
      
      if (!task || !task._id) {
        console.error('Task creation failed - invalid response structure:', result);
        throw new Error('Task creation failed - invalid response from server');
      }
      
      showNotification('Task created successfully!', 'success');
      navigate(`/tasks/${task._id}`);
    } catch (e) {
      setSaving(false);
      console.error('Task creation error:', e);
      if (e.response) {
        console.error('Response data:', e.response.data);
        console.error('Response status:', e.response.status);
      }
      showNotification(e?.response?.data?.message || e.message || 'Failed to create task', 'error');
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      {notification.visible && (
        <Notification message={notification.message} type={notification.type} />
      )}
      <div style={{ marginBottom: 12 }}>
        <Link to={`/boards/${boardId}/tasks`}>&larr; Back to board</Link>
      </div>
      <h2>Create New Task</h2>
      <TaskForm onSave={handleSave} saving={saving} />
    </div>
  );
}
