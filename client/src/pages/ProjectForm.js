// src/pages/ProjectForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { projectService } from "../services/projects";
import { authService } from "../services/auth";
import Layout from "../components/Layout/Layout";
import { ArrowLeft, Save } from "lucide-react";

const defaultColor = "#3B82F6";

function isUserAdmin(project, userId) {
  if (!project || !userId) return false;
  const ownerId = project.owner?._id || project.owner;
  if (ownerId?.toString() === userId?.toString()) return true;

  const members = project.members || [];
  return members.some((m) => {
    const mid = m.user?._id || m.user;
    const role = (m.role || "").toLowerCase();
    return (
      mid?.toString() === userId?.toString() &&
      (role === "admin" || role === "owner")
    );
  });
}

const ProjectForm = () => {
  const { projectId } = useParams();
  const isEdit = Boolean(projectId);
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [project, setProject] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    color: defaultColor,
    isPublic: false,
  });

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canEdit = useMemo(() => isUserAdmin(project, me?._id), [project, me]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Load current user
    authService
      .getProfile()
      .then(setMe)
      .catch(() => {
        /* ignore for now, backend will enforce */
      });

    if (isEdit) {
      setLoading(true);
      projectService
        .getProjectById(projectId)
        .then((p) => {
          setProject(p);
          setForm({
            name: p?.name || "",
            description: p?.description || "",
            color: p?.color || defaultColor,
            isPublic: Boolean(p?.isPublic),
          });
        })
        .catch((err) => {
          setError(err?.response?.data?.message || "Failed to load project");
        })
        .finally(() => setLoading(false));
    }
  }, [isEdit, projectId]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (isEdit) {
        if (!canEdit) {
          setError("You don't have permission to edit this project.");
          setSubmitting(false);
          return;
        }
        const updated = await projectService.updateProject(projectId, form);

        // Normalize updated project ID: supports {data:{project}}, {project}, or direct object
        const updatedProject =
          updated?.data?.project || updated?.project || updated || null;
        const updatedId =
          updatedProject?._id || updatedProject?.id || projectId;

        if (!updatedId) {
          setError("Unexpected server response: no project ID returned.");
          setSubmitting(false);
          return;
        }

        navigate(`/projects/${updatedId}`);
      } else {
        const created = await projectService.createProject(form);

        // Normalize created project ID
        const createdProject =
          created?.data?.project || created?.project || created || null;
        const newId = createdProject?._id || createdProject?.id;

        if (!newId) {
          setError("Unexpected server response: no project ID returned.");
          setSubmitting(false);
          return;
        }

        navigate(`/projects/${newId}`);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status === 403
          ? "Forbidden: only admins can update"
          : "") ||
        err?.message ||
        "Save failed";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link
              to={isEdit ? `/projects/${projectId}` : "/dashboard"}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">
              {isEdit ? "Edit Project" : "Create Project"}
            </h1>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-600">Loading...</div>
        ) : isEdit && !canEdit ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
            You don’t have permission to edit this project.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                name="name"
                type="text"
                required
                value={form.name}
                onChange={onChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Project name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={onChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="What is this project about?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Color
                </label>
                <div className="mt-1 flex items-center space-x-3">
                  <input
                    name="color"
                    type="color"
                    value={form.color || defaultColor}
                    onChange={onChange}
                    className="h-10 w-16 p-0 border border-gray-300 rounded"
                  />
                  <input
                    name="color"
                    type="text"
                    value={form.color || defaultColor}
                    onChange={onChange}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-6 md:mt-0">
                <input
                  id="isPublic"
                  name="isPublic"
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={onChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-700">
                  Make project public
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{submitting ? "Saving..." : "Save"}</span>
              </button>
              <Link
                to={isEdit ? `/projects/${projectId}` : "/dashboard"}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default ProjectForm;
