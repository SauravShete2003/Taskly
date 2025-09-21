import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { projectService } from "../services/projects";
import { authService } from "../services/auth";
import { UserPlus, Trash2, Shield, Search, X } from "lucide-react";
import debounce from "lodash.debounce";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch project + user
  useEffect(() => {
    async function fetchData() {
      try {
        const [proj, me] = await Promise.all([
          projectService.getProjectById(projectId),
          authService.getProfile(),
        ]);
        setProject(proj);
        setCurrentUser(me);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [projectId]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(async (q) => {
      if (q.length < 2) {
        setResults([]);
        return;
      }
      setSearchLoading(true);
      try {
        const users = await authService.searchUsers(q);
        setResults(users);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchLoading(false);
      }
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleAddMember = async (identifier) => {
    try {
      const updated = await projectService.addMember(
        projectId,
        identifier,
        "member"
      );
      setProject(updated);
      setQuery("");
      setResults([]);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to add member");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      const updated = await projectService.removeMember(projectId, userId);
      setProject(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeRole = async (userId, role) => {
    try {
      const updated = await projectService.updateMemberRole(
        projectId,
        userId,
        role
      );
      setProject(updated);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading project...</div>
      </div>
    );
  if (!project)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Project not found</div>
      </div>
    );

  // 🎨 Role badge styles
  const getRoleBadge = (role) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200";
      case "member":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-700/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Project Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {project.name}
          </h1>
          {project.description && (
            <p className="mt-2 text-lg text-gray-600">{project.description}</p>
          )}
        </div>

        {/* Members Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <UserPlus size={20} className="text-blue-600" />
                Project Members
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {project.members.length + 1} total
              </span>
            </div>

            {/* Search Member Input */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users to invite by name or email..."
                value={query}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {results.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto animate-in fade-in slide-in-from-top-1">
                {searchLoading ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    Searching...
                  </div>
                ) : (
                  results.map((user) => (
                    <div
                      key={user._id || user.email}
                      className="flex justify-between items-center p-3 hover:bg-gray-50 dark:bg-gray-700/50 border-b last:border-b-0 transition-colors duration-150"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleAddMember(user._id || user.email)
                        }
                        className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 flex items-center gap-1"
                      >
                        <UserPlus size={14} />
                        Invite
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Members List */}
            <div className="space-y-4 mt-6">
              {/* Owner */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <span className="font-medium text-gray-900">
                      {project.owner.name}
                    </span>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      ({project.owner.email})
                    </span>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    Owner
                  </span>
                </div>
              </div>

              {/* Members */}
              {project.members.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <UserPlus size={48} className="mx-auto opacity-50" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">No additional members yet.</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Invite team members using the search above.
                  </p>
                </div>
              ) : (
                project.members.map((m) => (
                  <div
                    key={m.user._id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-700/50 transition-colors duration-150"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <span className="font-medium text-gray-900">
                          {m.user.name}
                        </span>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          ({m.user.email})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadge(
                            m.role
                          )}`}
                        >
                          {m.role.charAt(0).toUpperCase() + m.role.slice(1)}
                        </span>

                        {/* Action buttons (not for owner) */}
                        {m.user._id !== project.owner._id && (
                          <>
                            <button
                              onClick={() =>
                                handleChangeRole(
                                  m.user._id,
                                  m.role === "admin" ? "member" : "admin"
                                )
                              }
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
                              aria-label={
                                m.role === "admin"
                                  ? "Demote to member"
                                  : "Promote to admin"
                              }
                            >
                              <Shield size={14} className="mr-1" />
                              {m.role === "admin" ? "Demote" : "Promote"}
                            </button>
                            <button
                              onClick={() => handleRemoveMember(m.user._id)}
                              className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white dark:bg-gray-800 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-150"
                              aria-label="Remove member"
                            >
                              <Trash2 size={14} className="mr-1" />
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-8 text-center">
          <Link
            to={`/projects/${projectId}/boards`}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            View Project Boards →
          </Link>
        </div>
      </div>
    </div>
  );
}