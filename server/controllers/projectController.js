import Project from '../models/Project.js';
import User from '../models/User.js';
import { sendMail } from '../utils/mail.js';
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

// Add member to project (admin only)
export const addMember = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { userId, role = PROJECT_ROLES.MEMBER } = req.body;
  const currentUserId = req.user._id;

  const project = await Project.findById(projectId);
  if (!project || project.isArchived) {
    return notFoundResponse(res, 'Project not found');
  }

  if (!project.isAdmin(currentUserId)) {
    return forbiddenResponse(res, 'Only admins can add members');
  }

  const user = await User.findById(userId);
  if (!user) return notFoundResponse(res, 'User not found');

  if (project.isOwner(userId) || project.isMember(userId)) {
    return errorResponse(res, 'User is already in this project', HTTP_STATUS.CONFLICT);
  }

  // Validate role against enum
  const allowed = Object.values(PROJECT_ROLES);
  if (!allowed.includes(role)) {
    return errorResponse(res, 'Invalid role', HTTP_STATUS.BAD_REQUEST);
  }

  project.addMember(userId, role);
  await project.save();

  // Send email notification
  await sendMail({
    to: user.email,
    subject: `You've been added to project ${project.name}`,
    text: `Hello ${user.name},\n\nYou've been added to the project "${project.name}".`,
  });

  const updated = await Project.findById(projectId)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  return successResponse(res, { project: updated }, 'Member added successfully');
});

// Remove member (admin or self)
export const removeMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const currentUserId = req.user._id;

  const project = await Project.findById(projectId);
  if (!project || project.isArchived) {
    return notFoundResponse(res, 'Project not found');
  }

  if (!project.isAdmin(currentUserId) && currentUserId.toString() !== userId) {
    return forbiddenResponse(res, 'Only admins can remove members');
  }

  if (project.isOwner(userId)) {
    return forbiddenResponse(res, 'Cannot remove project owner');
  }

  project.removeMember(userId);
  await project.save();

  const updated = await Project.findById(projectId)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  return successResponse(res, { project: updated }, 'Member removed successfully');
});

// Update member role (admin only)
export const updateMemberRole = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { role } = req.body;
  const currentUserId = req.user._id;

  const project = await Project.findById(projectId);
  if (!project || project.isArchived) {
    return notFoundResponse(res, 'Project not found');
  }

  if (!project.isAdmin(currentUserId)) {
    return forbiddenResponse(res, 'Only admins can update member roles');
  }

  if (project.isOwner(userId)) {
    return forbiddenResponse(res, 'Cannot change owner role');
  }

  const allowed = Object.values(PROJECT_ROLES);
  if (!allowed.includes(role)) {
    return errorResponse(res, 'Invalid role', HTTP_STATUS.BAD_REQUEST);
  }

  project.updateMemberRole(userId, role);
  await project.save();

  const updated = await Project.findById(projectId)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  return successResponse(res, { project: updated }, 'Member role updated successfully');
});