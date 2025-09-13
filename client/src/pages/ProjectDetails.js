import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { projectService } from "../services/projects";
import { authService } from "../services/auth";
import { UserPlus, Trash2, Shield } from "lucide-react";
import debounce from "lodash.debounce";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

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
      if (q.length < 2) return setResults([]);
      try {
        const users = await authService.searchUsers(q);
        setResults(users);
      } catch (err) {
        console.error(err);
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
    const updated = await projectService.addMember(projectId, identifier, "member");
    setProject(updated);
    setQuery("");
    setResults([]);
  } catch (err) {
    alert(err?.response?.data?.message || "Failed to add member");
  }
};


  const handleRemoveMember = async (userId) => {
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

  if (loading) return <p>Loading...</p>;
  if (!project) return <p>Project not found</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{project.name}</h1>
      <p className="text-gray-600 mb-6">{project.description}</p>

      <div className="mb-6 border rounded">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            Members <UserPlus size={18} />
          </h2>

          {/* Add Member Search */}
          <div className="mb-4">
            <input
              placeholder="Search users to invite..."
              value={query}
              onChange={handleSearchChange}
              className="w-full border rounded p-2"
            />
            {results.length > 0 && (
              <div className="border rounded mt-2 bg-white shadow-sm">
                {results.map((user) => (
                  <div
                    key={user._id || user.email}
                    className="flex justify-between items-center p-2 hover:bg-gray-50"
                  >
                    <span>
                      {user.name} ({user.email})
                    </span>
                    <button
                      className="text-sm bg-blue-600 text-white px-2 py-1 rounded"
                      onClick={() => handleAddMember(user._id || user.email)}
                    >
                      Invite
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Members List */}
          <ul className="space-y-2">
            <li className="flex justify-between items-center border-b pb-2">
              <span>
                Owner: {project.owner.name} ({project.owner.email})
              </span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                owner
              </span>
            </li>

            {project.members.length === 0 && (
              <p className="text-sm text-gray-500">No members</p>
            )}

            {project.members.map((m) => (
              <li
                key={m.user._id}
                className="flex justify-between items-center border-b pb-2"
              >
                <span>
                  {m.user.name} ({m.user.email})
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                    {m.role}
                  </span>

                  {/* don't allow changing role or removing the owner */}
                  {m.user._id !== project.owner._id && (
                    <>
                      <button
                        className="text-sm border rounded px-2 py-1 flex items-center gap-1"
                        onClick={() =>
                          handleChangeRole(
                            m.user._id,
                            m.role === "admin" ? "member" : "admin"
                          )
                        }
                      >
                        <Shield size={14} />
                        <span className="sr-only">Change role</span>
                        <span className="text-sm">
                          {m.role === "admin" ? "Demote" : "Promote"}
                        </span>
                      </button>
                      <button
                        className="text-sm border rounded px-2 py-1 flex items-center gap-1"
                        onClick={() => handleRemoveMember(m.user._id)}
                      >
                        <Trash2 size={14} />
                        <span className="text-sm">Remove</span>
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Link
        to={`/projects/${projectId}/boards`}
        className="text-blue-600 hover:underline"
      >
        View Boards
      </Link>
    </div>
  );
}
