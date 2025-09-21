import Project from '../models/Project.js';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  forbiddenResponse,
  asyncHandler,
} from '../utils/responseHandler.js';
import { HTTP_STATUS, PROJECT_ROLES } from '../utils/constants.js';

export const getProjects = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  let query = { isArchived: false };

  // If not global admin, restrict to owned or member projects
  if (req.user.role !== 'admin') {
    query.$or = [{ owner: userId }, { 'members.user': userId }];
  }

  const projects = await Project.find(query)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .sort({ updatedAt: -1 });

  return successResponse(res, { projects });
});


// Get project by ID (public or member-only)
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

// Create new project
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

// Update project (admins/owner only)
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

// Archive (soft-delete) project (owner only)
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

  // Soft delete to preserve data
  await Project.findByIdAndUpdate(projectId, { isArchived: true }, { new: true });

  return successResponse(res, null, 'Project archived successfully');
});
// user routes
// ================== Members ==================
export const addMember = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { userId, role } = req.body;

  const project = await Project.findById(projectId)
    .populate("owner", "name email avatar")
    .populate("members.user", "name email avatar");

  if (!project) {
    return notFoundResponse(res, "Project not found");
  }

  // prevent duplicates
  if (project.members.some((m) => m.user.toString() === userId)) {
    return errorResponse(res, "User already a member", HTTP_STATUS.BAD_REQUEST);
  }

  // validate role
  const validRoles = Object.values(PROJECT_ROLES); // e.g. ["owner","admin","member","viewer"]
  if (role && !validRoles.includes(role)) {
    return errorResponse(res, "Invalid role", HTTP_STATUS.BAD_REQUEST);
  }

  project.members.push({ user: userId, role: role || "member" });
  await project.save();

  const updated = await Project.findById(projectId)
    .populate("owner", "name email avatar")
    .populate("members.user", "name email avatar");

  return successResponse(res, { project: updated }, "Member added successfully");
});

export const removeMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  const project = await Project.findById(projectId)
    .populate("owner", "name email avatar")
    .populate("members.user", "name email avatar");

  if (!project) {
    return notFoundResponse(res, "Project not found");
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

  const project = await Project.findById(projectId)
    .populate("owner", "name email avatar")
    .populate("members.user", "name email avatar");

  if (!project) {
    return notFoundResponse(res, "Project not found");
  }

  const member = project.members.find((m) => m.user.toString() === userId);
  if (!member) {
    return notFoundResponse(res, "Member not found");
  }

  // validate role
  const validRoles = Object.values(PROJECT_ROLES);
  if (!validRoles.includes(role)) {
    return errorResponse(res, "Invalid role", HTTP_STATUS.BAD_REQUEST);
  }

  member.role = role;
  await project.save();

  const updated = await Project.findById(projectId)
    .populate("owner", "name email avatar")
    .populate("members.user", "name email avatar");

  return successResponse(res, { project: updated }, "Member role updated successfully");
});
