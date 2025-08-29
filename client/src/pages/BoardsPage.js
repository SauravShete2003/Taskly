import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBoards } from "../services/boardService";

export default function ProjectBoardsPage() {
  const { projectId } = useParams();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBoards = async () => {
      try {
        setLoading(true);
        const result = await getBoards(projectId);
        setBoards(result);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Failed to load boards");
      } finally {
        setLoading(false);
      }
    };
    if (projectId) loadBoards();
  }, [projectId]);

  // Simple loading spinner
  const LoadingSpinner = () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
      <div className="spinner-border" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div style={{ textAlign: 'center', padding: '24px' }}>
      <p>No boards available for this project.</p>
      <p>Start by creating a new board!</p>
    </div>
  );

  return (
    <div style={{ padding: 24 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2>Boards</h2>
        <span>{boards.length} boards</span>
      </header>

      {loading && <p>Loading boards...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {boards.map((b) => (
            <div
              key={b._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 16,
                background: "#fafafa",
              }}
            >
              <h3>{b.name}</h3>
              <p>{b.description}</p>
              <Link to={`/boards/${b._id}`}>Open Board</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
