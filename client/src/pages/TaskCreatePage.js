import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import TaskForm from "../components/TaskForm";
import taskService from "../services/tasks";
import { ArrowLeft } from "lucide-react";

export default function TaskCreatePage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleSave = async (form) => {
    try {
      setSaving(true);
      setErr("");
      const created = await taskService.createTask(boardId, form);

      const task = created?.task || created;
      if (!task?._id) {
        throw new Error("Invalid server response: no task id");
      }

      navigate(`/tasks/${task._id}`);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6 flex items-center space-x-3">
        <Link
          to={`/boards/${boardId}`}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Board
        </Link>
        <h2 className="text-2xl font-bold">Create Task</h2>
      </div>

      {err && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
          {err}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <TaskForm onSave={handleSave} saving={saving} />
      </div>
    </div>
  );
}
