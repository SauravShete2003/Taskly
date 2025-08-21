import { Link } from 'react-router-dom';
import { TASK_PRIORITIES, TASK_STATUSES } from '../constants/tasks';

export default function TaskCard({ task, onDelete, onStatusChange }) {
  const priority = TASK_PRIORITIES.find(p => p.key === task.priority)?.label || task.priority;
  const statusOptions = TASK_STATUSES;

  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <Link to={`/tasks/${task._id}`} style={{ textDecoration: 'none' }}>
          <div style={{ fontWeight: 600, color: '#333' }}>{task.title}</div>
        </Link>
        <button onClick={onDelete} style={{ color: '#b00' }}>Delete</button>
      </div>
      {task.description && (
        <div style={{ color: '#666', fontSize: 14, marginTop: 6, maxHeight: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {task.description}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#555' }}>Priority: {priority}</span>
        <div>
          <select
            value={task.status || 'todo'}
            onChange={(e) => onStatusChange(e.target.value)}
            title="Change status"
          >
            {statusOptions.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 6, color: '#777', fontSize: 12 }}>
        {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
        {Array.isArray(task.assignees) && task.assignees.length > 0 && (
          <span>Assignees: {task.assignees.length}</span>
        )}
      </div>
    </div>
  );
}