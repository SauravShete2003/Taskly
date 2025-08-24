import { useState, useEffect } from "react";
import  api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ui/toast";

const defaultColor = "#3bf796";

export default function ProjectForm({ isEdit = false, projectId }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: defaultColor,
    isPublic: false,
    priority: "low", // ✅ added default
  });
  const [loading, setLoading] = useState(false);

  // ✅ Load existing project if edit mode
  useEffect(() => {
    if (isEdit && projectId) {
      api
        .request(`/projects/${projectId}`)
        .then((data) => {
          setForm({
            name: data.name || "",
            description: data.description || "",
            color: data.color || defaultColor,
            isPublic: data.isPublic || false,
            priority: data.priority || "low", // ✅ prefill priority
          });
        })
        .catch(() => {
          toast({
            title: "Error",
            description: "Failed to load project details",
            variant: "destructive",
          });
        });
    }
  }, [isEdit, projectId, toast]);

  // ✅ handle input change
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ handle submit
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEdit ? `/projects/${projectId}` : "/projects";
      const method = isEdit ? "PUT" : "POST";
      await api.request(url, {
        method,
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      });
      toast({
        title: "Success",
        description: `Project ${isEdit ? "updated" : "created"} successfully`,
      });
      navigate("/projects");
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to save project",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 bg-white p-6 rounded-lg shadow-md"
    >
      {/* Project Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Project Name
        </label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={onChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Color</label>
        <input
          type="color"
          name="color"
          value={form.color}
          onChange={onChange}
          className="mt-1 h-10 w-16 border-0"
        />
      </div>

      {/* Public checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          name="isPublic"
          checked={form.isPublic}
          onChange={onChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">Public</label>
      </div>

      {/* ✅ Priority Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Priority
        </label>
        <select
          name="priority"
          value={form.priority}
          onChange={onChange}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 focus:outline-none disabled:opacity-50"
        >
          {loading ? "Saving..." : isEdit ? "Update Project" : "Create Project"}
        </button>
      </div>
    </form>
  );
}
