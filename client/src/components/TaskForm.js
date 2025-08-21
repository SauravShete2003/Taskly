import { useState } from 'react';
import { TASK_PRIORITIES /*, TASK_STATUSES*/ } from '../constants/tasks';

export default function TaskForm({ defaultValues, onSave, saving }) {
  const [form, setForm] = useState({
    title: defaultValues?.title || '',
    description: defaultValues?.description || '',
    priority: defaultValues?.priority || 'medium',
    dueDate: defaultValues?.dueDate || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Title is required');
      return;
    }
    // Convert dueDate to ISO if present
    const payload = { ...form };
    if (payload.dueDate) {
      // Keep it as YYYY-MM-DD for backend to parse Date
    }
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
      <div>
        <label>Title</label><br />
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Task title"
          required
          style={{ width: '100%' }}
        />
      </div>

      <div>
        <label>Description</label><br />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          placeholder="Optional description"
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div>
          <label>Priority</label><br />
          <select name="priority" value={form.priority} onChange={handleChange}>
            {TASK_PRIORITIES.map(p => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Due date</label><br />
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
          />
        </div>

        {/* If backend accepts it:
        <div>
          <label>Status</label><br />
          <select name="status" value={form.status} onChange={handleChange}>
            {TASK_STATUSES.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div> */}
      </div>

      <div>
        <button type="submit" disabled={saving}>Save</button>
      </div>
    </form>
  );
}