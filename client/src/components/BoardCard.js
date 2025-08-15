import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BoardCard({ board, projectId, onDelete, onUpdate, onMove, index, total }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: board.name, description: board.description || '' });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    try {
      await onUpdate(board._id, editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update board:', error);
    }
  };

  const handleCancel = () => {
    setEditForm({ name: board.name, description: board.description || '' });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(board._id);
    } catch (error) {
      console.error('Failed to delete board:', error);
      setIsDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
        <input
          type="text"
          value={editForm.name}
          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          className="w-full mb-2 px-2 py-1 border border-gray-300 rounded"
          placeholder="Board name"
          autoFocus
        />
        <textarea
          value={editForm.description}
          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
          className="w-full mb-3 px-2 py-1 border border-gray-300 rounded resize-none"
          placeholder="Description"
          rows="2"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg text-gray-800">{board.name}</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          #{board.order}
        </span>
      </div>
      
      {board.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{board.description}</p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/projects/${projectId}/boards/${board._id}`)}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
          >
            Open
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isDeleting ? '...' : 'Delete'}
          </button>
        </div>
        
        <div className="flex gap-1">
          <button
            onClick={() => onMove(board._id, -1)}
            disabled={index === 0}
            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={() => onMove(board._id, 1)}
            disabled={index === total - 1}
            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
