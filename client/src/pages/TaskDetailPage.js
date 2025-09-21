import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import taskService from "../services/tasks";
import TaskForm from "../components/TaskForm";
import CommentList from "../components/CommentList";
import CommentInput from "../components/CommentInput";
import { TASK_PRIORITIES, TASK_STATUSES } from "../constants/tasks";

export default function TaskDetailPage() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  const fetchTask = useCallback(async () => {
    try {
      setLoading(true);
      const taskData = await taskService.getTaskById(taskId);
      setTask(taskData);
    } catch (e) {
      console.error("Error fetching task:", e);
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (taskId) fetchTask();
  }, [taskId, fetchTask]);

  const handleAddComment = async (content) => {
    try {
      const updatedTask = await taskService.addComment(taskId, { content });
      setTask(updatedTask);
    } catch (e) {
      console.error("Error adding comment:", e);
    }
  };

  const handleRemoveComment = async (commentId) => {
    try {
      const updatedTask = await taskService.removeComment(taskId, commentId);
      setTask(updatedTask);
    } catch (e) {
      console.error("Error removing comment:", e);
    }
  };

  const handleSave = async (updatedTask) => {
    try {
      const saved = await taskService.updateTask(taskId, updatedTask);
      setTask(saved);
      setEditing(false);
    } catch (e) {
      console.error("Error saving task:", e);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading task details...</div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="text-red-700 font-medium">Error</div>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );

  if (!task)
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-800">
            Task Not Found
          </h3>
          <p className="text-gray-500 mt-2">
            The task you're looking for doesn't exist.
          </p>
          <Link
            to="/"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );

  // 🎨 Get priority & status labels + colors
  const priority =
    TASK_PRIORITIES.find((p) => p.key === task.priority) ||
    { label: task.priority, color: "gray" };
  const status =
    TASK_STATUSES.find((s) => s.key === task.status) || {
      label: task.status,
      color: "gray",
    };

  // 🎯 Priority/Status Color Map (Tailwind classes)
  const getColorClass = (colorKey) => {
    switch (colorKey) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "todo":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "in-progress":
        return " bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200";
      case "done":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-700/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to={`/boards/${task.board?._id || task.board}/tasks`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
          >
            ← Back to Board
          </Link>
        </div>

        {/* Task Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
                {task.title}
              </h1>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Edit Task
                </button>
              ) : (
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {!editing ? (
              <div className="space-y-5">
                {/* Description */}
                {task.description && (
                  <div className="prose prose-gray max-w-none">
                    <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                      {task.description}
                    </p>
                  </div>
                )}

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  {/* Priority */}
                  <div className="flex items-center">
                    <span className="font-medium text-gray-600 w-20">
                      Priority:
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColorClass(
                        priority.color
                      )}`}
                    >
                      {priority.label}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center">
                    <span className="font-medium text-gray-600 w-20">
                      Status:
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColorClass(
                        status.color
                      )}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Due Date */}
                  {task.dueDate && (
                    <div className="flex items-center">
                      <span className="font-medium text-gray-600 w-20">
                        Due:
                      </span>
                      <span className="text-gray-900">
                        {new Date(task.dueDate).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}

                  {/* Assignees */}
                  {task.assignees?.length > 0 && (
                    <div className="sm:col-span-2 lg:col-span-3 flex items-start">
                      <span className="font-medium text-gray-600 w-20 pt-0.5">
                        Assignees:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {task.assignees.map((assignee, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200"
                          >
                            {assignee.name || assignee.email}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                <TaskForm
                  defaultValues={{
                    title: task.title,
                    description: task.description || "",
                    priority: task.priority || "medium",
                    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
                  }}
                  onSave={handleSave}
                />
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              💬 Comments
            </h2>
          </div>
          <div className="p-6">
            <CommentInput onAdd={handleAddComment} />

            <div className="mt-6">
              {task.comments && task.comments.length > 0 ? (
                <CommentList
                  comments={task.comments}
                  onRemove={handleRemoveComment}
                  currentUserId={localStorage.getItem("userId")}
                />
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-300 mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-12 h-12 mx-auto"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    No comments yet. Be the first to comment!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}