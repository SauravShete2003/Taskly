import { useState } from 'react';
import { TASK_PRIORITIES, TASK_STATUSES } from '../constants/tasks';

export default function TaskForm({ defaultValues, onSave, saving, onCancel }) {
  const [form, setForm] = useState({
    title: defaultValues?.title || '',
    description: defaultValues?.description || '',
    priority: defaultValues?.priority || 'medium',
    dueDate: defaultValues?.dueDate || '',
    status: defaultValues?.status || 'todo',   // ✅ fixed missing field
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
    onSave({ ...form });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Task title"
          required
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          placeholder="Optional description"
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>

      {/* Priority, Due Date, Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
          >
            {TASK_PRIORITIES.map(p => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
          >
            {TASK_STATUSES.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Task"}
        </button>
      </div>
    </form>
  );
}
