export default function CommentList({ comments, onRemove, currentUserId }) {
  if (!comments?.length) return <div style={{ color: '#888' }}>No comments yet.</div>;

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {comments.map(c => {
        const canDelete = currentUserId && c.user && (c.user._id === currentUserId || c.user === currentUserId);
        const authorName = typeof c.user === 'object' ? (c.user.name || c.user.email) : 'User';
        return (
          <div key={c._id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 600 }}>{authorName}</div>
              <div style={{ color: '#999', fontSize: 12 }}>{new Date(c.createdAt).toLocaleString()}</div>
            </div>
            <div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{c.content}</div>
            <div style={{ marginTop: 6 }}>
              {canDelete && <button onClick={() => onRemove(c._id)} style={{ color: '#b00' }}>Delete</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}