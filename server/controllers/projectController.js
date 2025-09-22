import Project from '../models/Project.js';
import User from '../models/User.js'; // <-- THIS IS THE CRITICAL LINE THAT WAS MISSING
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  forbiddenResponse,
  asyncHandler,
} from '../utils/responseHandler.js';
import { HTTP_STATUS, PROJECT_ROLES } from '../utils/constants.js'; // Assuming PROJECT_ROLES is here

// --- NO CHANGES to the functions below. They are perfect. ---
export const getProjects = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  let query = { isArchived: false };
  if (req.user.role !== 'admin') {
    query.$or = [{ owner: userId }, { 'members.user': userId }];
  }
  const projects = await Project.find(query)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .sort({ updatedAt: -1 });
  return successResponse(res, { projects });
});

export const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;
  const project = await Project.findById(projectId)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');
  if (!project || project.isArchived) {
    return notFoundResponse(res, 'Project not found');
  }
  if (!project.isPublic && !project.isMember(userId)) {
    return forbiddenResponse(res, 'Access denied');
  }
  return successResponse(res, { project });
});

export const createProject = asyncHandler(async (req, res) => {
  const { name, description, color, isPublic } = req.body;
  const userId = req.user._id;
  const project = new Project({
    name,
    description,
    color: color || '#3B82F6',
    isPublic: Boolean(isPublic),
    owner: userId,
  });
  await project.save();
  const populated = await Project.findById(project._id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');
  return successResponse(
    res,
    { project: populated },
    'Project created successfully',
    HTTP_STATUS.CREATED
  );
});

export const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { name, description, color, isPublic } = req.body;
  const userId = req.user._id;
  const project = await Project.findById(projectId);
  if (!project || project.isArchived) {
    return notFoundResponse(res, 'Project not found');
  }
  if (!project.isAdmin(userId)) {
    return forbiddenResponse(res, 'Only admins can update project settings');
  }
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (color !== undefined) updateData.color = color;
  if (isPublic !== undefined) updateData.isPublic = Boolean(isPublic);
  const updated = await Project.findByIdAndUpdate(projectId, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');
  return successResponse(res, { project: updated }, 'Project updated successfully');
});

export const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;
  const project = await Project.findById(projectId);
  if (!project) {
    return notFoundResponse(res, 'Project not found');
  }
  if (!project.isOwner(userId)) {
    return forbiddenResponse(res, 'Only project owner can delete the project');
  }
  await Project.findByIdAndUpdate(projectId, { isArchived: true }, { new: true });
  return successResponse(res, null, 'Project archived successfully');
});
// --- End of unchanged functions ---


// ================== Members ==================

// ✅ This function is now complete with the User import.
export const addMember = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { userId, role } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    return notFoundResponse(res, "Project not found");
  }

  // Verify the user to be added actually exists
  const userToAdd = await User.findById(userId);
  if (!userToAdd) {
    return notFoundResponse(res, "User to add not found");
  }

  // Prevent adding the owner as a member
  if (project.isOwner(userId)) {
    return errorResponse(res, "User is already the project owner", HTTP_STATUS.BAD_REQUEST);
  }

  // Prevent duplicates
  if (project.isMember(userId)) {
    return errorResponse(res, "User is already a member", HTTP_STATUS.BAD_REQUEST);
  }

  // Validate role
  const validRoles = Object.values(PROJECT_ROLES);
  if (role && !validRoles.includes(role)) {
    return errorResponse(res, "Invalid role", HTTP_STATUS.BAD_REQUEST);
  }

  project.members.push({ user: userId, role: role || PROJECT_ROLES.MEMBER });
  await project.save();

  const updated = await Project.findById(projectId)
    .populate("owner", "name email avatar")
    .populate("members.user", "name email avatar");

  return successResponse(res, { project: updated }, "Member added successfully");
});

export const removeMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) {
    return notFoundResponse(res, "Project not found");
  }
  
  // ✅ ADDED: Security check to prevent removing the project owner
  if (project.isOwner(userId)) {
    return forbiddenResponse(res, "Cannot remove the project owner.");
  }

  project.members = project.members.filter(
    (m) => m.user.toString() !== userId
  );
  await project.save();

  const updated = await Project.findById(projectId)
    .populate("owner", "name email avatar")
    .populate("members.user", "name email avatar");

  return successResponse(res, { project: updated }, "Member removed successfully");
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { role } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    return notFoundResponse(res, "Project not found");
  }
  
  // ✅ ADDED: Security check to prevent changing the owner's role
  if (project.isOwner(userId)) {
    return forbiddenResponse(res, "Cannot change the project owner's role.");
  }

  const member = project.members.find((m) => m.user.toString() === userId);
  if (!member) {
    return notFoundResponse(res, "Member not found in this project");
  }

  // Validate role
  const validRoles = Object.values(PROJECT_ROLES);
  if (!validRoles.includes(role)) {
    return errorResponse(res, "Invalid role provided", HTTP_STATUS.BAD_REQUEST);
  }

  member.role = role;
  await project.save();

  const updated = await Project.findById(projectId)
    .populate("owner", "name email avatar")
    .populate("members.user", "name email avatar");

  return successResponse(res, { project: updated }, "Member role updated successfully");
});