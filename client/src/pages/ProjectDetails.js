import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { projectService } from "../services/projects";
import { authService } from "../services/auth";
import { Pencil, Trash2, ArrowLeft, Users } from "lucide-react";

function isUserAdmin(project, userId) {
  if (!project || !userId) return false;
  const ownerId = project.owner?._id || project.owner;
  if (ownerId?.toString() === userId?.toString()) return true;

  const members = project.members || [];
  return members.some((m) => {
    const mid = m.user?._id || m.user;
    const role = (m.role || "").toLowerCase();
    return mid?.toString() === userId?.toString() && (role === "admin");
  });
}

function isUserOwner(project, userId) {
  const ownerId = project?.owner?._id || project?.owner;
  return ownerId?.toString() === userId?.toString();
}

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [addingMember, setAddingMember] = useState(false);
  const [addError, setAddError] = useState("");
  const [selectedRole, setSelectedRole] = useState("member");
  const [managingMember, setManagingMember] = useState(null);

  const canEdit = useMemo(() => isUserAdmin(project, me?._id), [project, me]);
  const canDelete = useMemo(() => isUserOwner(project, me?._id), [project, me]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    authService.getProfile().then(setMe).catch(() => {});
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      authService.searchUsers(searchQuery).then(setSearchResults).catch(() => setSearchResults([]));
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const loadProject = async () => {
    setLoading(true);
    setError("");
    try {
      const p = await projectService.getProjectById(projectId);
      setProject(p);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status === 403 ? "Access denied" : "") ||
        "Failed to load project";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    const ok = window.confirm("Are you sure you want to delete this project? This cannot be undone.");
    if (!ok) return;

    try {
      await projectService.deleteProject(projectId);
      navigate("/dashboard");
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  const handleAddMember = async (userId) => {
    setAddingMember(true);
    setAddError("");
    try {
      await projectService.addMember(projectId, userId, selectedRole);
      setSearchQuery("");
      setSearchResults([]);
      setSelectedRole("member");
      await loadProject();
    } catch (err) {
      setAddError(err?.response?.data?.message || "Failed to add member");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!canEdit) return;
    const ok = window.confirm("Are you sure you want to remove this member?");
    if (!ok) return;

    try {
      await projectService.removeMember(projectId, userId);
      await loadProject();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to remove member");
    }
  };

  const handleUpdateMemberRole = async (userId, newRole) => {
    if (!canEdit) return;
    try {
      await projectService.updateMemberRole(projectId, userId, newRole);
      await loadProject();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update member role");
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">{project?.name || "Project"}</h1>
          </div>

          <div className="flex items-center space-x-2">
            {canEdit && (
              <Link
                to={`/projects/${projectId}/edit`}
                className="inline-flex items-center space-x-2 px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4" />
                <span>Edit</span>
              </Link>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center space-x-2 px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-600">Loading...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
        ) : project ? (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full border"
                      style={{ backgroundColor: project.color || "#E5E7EB" }}
                      title={project.color || "No color"}
                    />
                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                  </div>
                  <p className="text-gray-600 mt-1">{project.description || "No description"}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className="inline-flex items-center justify-center h-6 w-6 rounded-full border"
                    style={{ backgroundColor: project.color || "#E5E7EB" }}
                    title={project.color}
                  />
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {project.isPublic ? "Public" : "Private"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Members</span>
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="text-gray-900 font-medium">
                      Owner: {project.owner?.name || project.owner?.email || "Owner"}
                    </div>
                    <div className="text-gray-500 text-sm">{project.owner?.email}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">owner</span>
                </div>

                {(project.members || []).length === 0 ? (
                  <div className="text-gray-600">No members</div>
                ) : (
                  (project.members || []).map((m) => (
                    <div
                      key={(m.user?._id || m.user) + m.role}
                      className="flex items-center justify-between border-b last:border-b-0 pb-2 last:pb-0"
                    >
                      <div>
                        <div className="text-gray-900 font-medium">{m.user?.name || m.user?.email || "Member"}</div>
                        <div className="text-gray-500 text-sm">{m.user?.email}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {canEdit && managingMember === (m.user?._id || m.user) ? (
                          <select
                            value={m.role}
                            onChange={(e) => handleUpdateMemberRole(m.user?._id || m.user, e.target.value)}
                            className="text-xs px-2 py-1 border border-gray-300 rounded"
                            onBlur={() => setManagingMember(null)}
                          >
                            <option value="member">member</option>
                            <option value="admin">admin</option>
                            <option value="viewer">viewer</option>
                          </select>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                            {(m.role || "member").toString().toLowerCase()}
                          </span>
                        )}
                        {canEdit && (
                          <div className="flex space-x-1">
                            {managingMember !== (m.user?._id || m.user) && (
                              <button
                                onClick={() => setManagingMember(m.user?._id || m.user)}
                                className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                Edit
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveMember(m.user?._id || m.user)}
                              className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {canEdit && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Add Member</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Search users by name or email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    disabled={addingMember}
                  />
                  
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    disabled={addingMember}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  
                  {addError && <div className="text-red-600 text-sm">{addError}</div>}
                  
                  {searchResults.length > 0 && (
                    <div className="border border-gray-300 rounded-md max-h-48 overflow-y-auto">
                      <div className="px-3 py-2 bg-gray-50 text-sm text-gray-600 border-b">
                        Select a user to add as {selectedRole}:
                      </div>
                      {searchResults.map((user) => (
                        <div
                          key={user._id}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
                          onClick={() => handleAddMember(user._id)}
                        >
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <Link to={`/projects/${projectId}/boards`} className="text-blue-600 hover:text-blue-800">
              View Boards
            </Link>
          </div>
        ) : null}
      </div>
    </Layout>
  );
};

export default ProjectDetails;
