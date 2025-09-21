import { useState, useEffect } from "react";
import { projectService } from "../services/projects";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ui/toast";

const defaultColor = "#3bf796";

export default function ProjectForm({ isEdit = false, projectId }) {
  // ✅ All your logic is back in here! This is what was missing.
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: defaultColor,
    isPublic: false,
    priority: "low",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && projectId) {
      projectService
        .getProjectById(projectId)
        .then((data) => {
          setForm({
            name: data.name || "",
            description: data.description || "",
            color: data.color || defaultColor,
            isPublic: data.isPublic || false,
            priority: data.priority || "low",
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

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!form.name.trim() || form.name.length < 1 || form.name.length > 100) {
      toast({
        title: "Validation Error",
        description: "Project name must be between 1 and 100 characters",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    try {
      // Note: your original logic didn't submit priority, so I'm keeping it that way.
      // If you want to submit priority, remove the line below.
      const { priority, ...formData } = form;
      if (isEdit) {
        await projectService.updateProject(projectId, formData);
      } else {
        await projectService.createProject(formData);
      }
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
  // ✅ End of logic section

  return (
    // The parent div ensures a nice background behind the form
    <div className="bg-gray-100 dark:bg-slate-900 min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit} // Now defined
        className="w-full max-w-lg bg-white dark:bg-[#1f2937] rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Header - The vibrant gradient from your image */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
          <h2 className="text-xl font-bold text-white">
            {isEdit ? "Edit Project" : "Create New Project"}
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            {isEdit
              ? "Update the project details"
              : "Fill in the details to create a new project"}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Project Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name} // Now defined
              onChange={onChange} // Now defined
              required
              placeholder="e.g. Website Redesign"
              className="w-full px-4 py-3 border-transparent rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description} // Now defined
              onChange={onChange} // Now defined
              rows="3"
              placeholder="Briefly describe your project..."
              className="w-full px-4 py-3 border-transparent rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Project Color
            </label>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-100 dark:bg-slate-800">
              <input
                type="color"
                name="color"
                value={form.color} // Now defined
                onChange={onChange} // Now defined
                className="h-10 w-14 rounded cursor-pointer border-none bg-transparent"
                title="Choose project color"
              />
              <span
                className="inline-block h-6 w-6 rounded-md"
                style={{ backgroundColor: form.color }} // Now defined
              ></span>
              <span className="font-mono text-sm text-gray-600 dark:text-slate-400">
                {form.color.toUpperCase()} {/* Now defined */}
              </span>
            </div>
          </div>

          {/* Public Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-100 dark:bg-slate-800">
            <div>
              <label className="font-semibold text-gray-800 dark:text-slate-200">
                Public Access
              </label>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Make this project visible to others
              </p>
            </div>
            <input
              type="checkbox"
              name="isPublic"
              checked={form.isPublic} // Now defined
              onChange={onChange} // Now defined
              className="h-5 w-5 rounded-sm border-2 border-gray-300 dark:border-slate-600 bg-gray-200 dark:bg-slate-700 text-blue-600 focus:ring-blue-500"
            />
          </div>

          {/* Priority Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
              Priority Level
            </label>
            <select
              name="priority"
              value={form.priority} // Now defined
              onChange={onChange} // Now defined
              className="w-full px-4 py-3 border-transparent rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.2em_1.2em] bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-width=%271.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e')] dark:[background-image:url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%239ca3af%27 stroke-width=%271.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e')]"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading} // Now defined
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? "Saving..." : isEdit ? "Update Project" : "Create Project"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}