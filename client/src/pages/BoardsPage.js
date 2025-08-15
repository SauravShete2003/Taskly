import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import BoardCard from '../components/BoardCard';

const BoardsPage = () => {
  const { projectId } = useParams();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);

  // Dummy data for demonstration
  const dummyBoards = [
    {
      id: 1,
      title: "To Do",
      description: "Tasks that need to be started",
      color: "#FF6B6B",
      taskCount: 5,
      projectId: 1
    },
    {
      id: 2,
      title: "In Progress",
      description: "Currently working on these tasks",
      color: "#4ECDC4",
      taskCount: 3,
      projectId: 1
    },
    {
      id: 3,
      title: "Review",
      description: "Tasks ready for review",
      color: "#45B7D1",
      taskCount: 2,
      projectId: 1
    },
    {
      id: 4,
      title: "Done",
      description: "Completed tasks",
      color: "#96CEB4",
      taskCount: 8,
      projectId: 1
    }
  ];

  const dummyProject = {
    id: 1,
    name: "Website Redesign",
    description: "Complete redesign of company website with modern UI/UX",
    startDate: "2024-01-15",
    endDate: "2024-03-30",
    status: "active"
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBoards(dummyBoards);
      setProject(dummyProject);
      setLoading(false);
    }, 1000);
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="mt-2 text-gray-600">{project.description}</p>
              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                <span>Start: {project.startDate}</span>
                <span>•</span>
                <span>End: {project.endDate}</span>
                <span>•</span>
                <span className="capitalize font-medium text-green-600">{project.status}</span>
              </div>
            </div>
            <Link
              to={`/projects/${projectId}/boards/new`}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add New Board
            </Link>
          </div>
        </div>

        {/* Boards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              projectId={projectId}
            />
          ))}
        </div>

        {/* Empty State */}
        {boards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No boards yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first board</p>
            <Link
              to={`/projects/${projectId}/boards/new`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Board
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardsPage;
