import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { projectService } from "../services/projects";
import { authService } from "../services/auth";
import { useToast } from "../components/ui/toast";
import { UserPlus, Trash2, Shield, Search, X } from "lucide-react";
import debounce from "lodash.debounce";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const { toast } = useToast(); 
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [proj, me] = await Promise.all([
        projectService.getProjectById(projectId),
        authService.getProfile(),
      ]);
      setProject(proj);
      setCurrentUser(me);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to load project data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ CORRECTED: Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (q) => {
      if (q.length < 2) {
        setResults([]);
        return;
      }
      setSearchLoading(true);
      try {
        const response = await authService.searchUsers(q);
        // authService.searchUsers was normalized to return an array, but
        // accept multiple shapes for resilience (array or axios response)
        if (Array.isArray(response)) {
          setResults(response);
        } else {
          setResults(response?.data?.users || response?.data || []);
        }
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]); // Clear results on error
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

  const handleAddMember = async (userOrId) => {
    // Accept either a user object or an id string
    const id = typeof userOrId === 'string' ? userOrId : (userOrId && (userOrId._id || userOrId.id));
    // basic MongoId validation (24 hex chars)
    const isValidObjectId = typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
    if (!isValidObjectId) {
      toast({
        title: 'Invalid user',
        description: 'Selected user does not have a valid ID.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const updatedProject = await projectService.addMember(projectId, id, 'member');
      setProject(updatedProject);
      setQuery('');
      setResults([]);
      toast({
        title: 'Success',
        description: 'Member added to the project.',
      });
    } catch (err) {
      let errorMessage = 'An unexpected error occurred.';
      if (err.response?.status === 409) {
        errorMessage = 'This user is already a member of the project.';
      } else if (err.response?.status === 400) {
        errorMessage = err?.response?.data?.message || 'Invalid user ID';
      } else {
        errorMessage = err?.response?.data?.message || errorMessage;
      }

      toast({
        title: 'Error Adding Member',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      const updatedProject = await projectService.removeMember(projectId, userId);
      setProject(updatedProject);
      toast({
        title: "Success",
        description: "Member removed from the project.",
      });
    } catch (err) {
      toast({
        title: "Error Removing Member",
        description: err?.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const updatedProject = await projectService.updateMemberRole(projectId, userId, newRole);
      setProject(updatedProject);
      toast({
        title: "Success",
        description: "Member role updated.",
      });
    } catch (err) {
      toast({
        title: "Error Updating Role",
        description: err?.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };
  
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600 dark:text-gray-300">
        Loading project...
      </div>
    );
  if (!project)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        Project not found.
      </div>
    );

  const canManageMembers = currentUser && project && (
    project.owner._id === currentUser._id || 
    project.members.some(m => m.user._id === currentUser._id && m.role === 'admin')
  );

  const getRoleBadge = (role) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700";
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700";
      case "member":
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Project Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {project.name}
          </h1>
          {project.description && (
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{project.description}</p>
          )}
        </div>

        {/* Members Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <UserPlus size={20} className="text-blue-500" />
                Project Members
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {project.memberCount} total
              </span>
            </div>

            {canManageMembers && (
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users to invite by name or email..."
                  value={query}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                />
                {query && (
                  <button type="button" onClick={() => { setQuery(""); setResults([]); }} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                    <X size={18} />
                  </button>
                )}
                
                {/* Search Results Dropdown */}
                {results.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto animate-in fade-in slide-in-from-top-1">
                    {searchLoading ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">Searching...</div>
                    ) : (
                      results.map((user) => (
                        <div key={user._id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b dark:border-gray-700 last:border-b-0 transition-colors duration-150">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                          </div>
                          <button
                            onClick={() => handleAddMember(user)}
                            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 flex items-center gap-1"
                          >
                            <UserPlus size={14} /> Invite
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Members List */}
            <div className="space-y-4">
              {/* Owner */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{project.owner.name}</span>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({project.owner.email})</span>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadge('owner')}`}>
                    Owner
                  </span>
                </div>
              </div>

              {/* Members */}
              {project.members.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">No additional members yet.</p>
                  {canManageMembers && <p className="text-sm text-gray-400 mt-1">Invite team members using the search above.</p>}
                </div>
              ) : (
                project.members.map((m) => (
                  <div key={m.user._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">{m.user.name}</span>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({m.user.email})</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadge(m.role)}`}>
                          {m.role.charAt(0).toUpperCase() + m.role.slice(1)}
                        </span>

                        {canManageMembers && currentUser._id !== m.user._id && (
                          <>
                            <button onClick={() => handleChangeRole(m.user._id, m.role === "admin" ? "member" : "admin")} className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                              <Shield size={14} className="mr-1" />
                              {m.role === "admin" ? "Demote" : "Promote"}
                            </button>
                            <button onClick={() => handleRemoveMember(m.user._id)} className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500">
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
          <Link to={`/projects/${projectId}/boards`} className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900">
            View Project Boards →
          </Link>
        </div>
      </div>
    </div>
  );
}