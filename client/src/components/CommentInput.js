import { useState } from 'react';

export default function CommentInput({ onAdd }) {
  const [content, setContent] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setContent('');
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
      <input
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ flex: 1 }}
      />
      <button type="submit">Comment</button>
    </form>
  );
}