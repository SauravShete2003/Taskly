import Project from '../models/Project.js';
import User from '../models/User.js';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse,
  forbiddenResponse,
  asyncHandler 
} from '../utils/responseHandler.js';
import { HTTP_STATUS, PROJECT_ROLES } from '../utils/constants.js';

// Get user's projects
export const getProjects = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const projects = await Project.find({
    $or: [
      { owner: userId },
      { 'members.user': userId }
    ],
    isArchived: false
  })
  .populate('owner', 'name email avatar')
  .populate('members.user', 'name email avatar')
  .sort({ updatedAt: -1 });

  return successResponse(res, { projects });
});

// Get project by ID
export const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  const project = await Project.findById(projectId)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  if (!project) {
    return notFoundResponse(res, 'Project not found');
  }

  // Check if user has access to this project
  if (!project.isMember(userId)) {
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
    isPublic: isPublic || false,
    owner: userId
  });

  await project.save();

  const populatedProject = await Project.findById(project._id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  return successResponse(
    res, 
    { project: populatedProject }, 
    'Project created successfully',
    HTTP_STATUS.CREATED
  );
});

// Update project
export const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { name, description, color, isPublic } = req.body;
  const userId = req.user._id;

  const project = await Project.findById(projectId);

  if (!project) {
    return notFoundResponse(res, 'Project not found');
  }

  // Check if user is admin or owner
  if (!project.isAdmin(userId)) {
    return forbiddenResponse(res, 'Only admins can update project settings');
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (color !== undefined) updateData.color = color;
  if (isPublic !== undefined) updateData.isPublic = isPublic;

  const updatedProject = await Project.findByIdAndUpdate(
    projectId,
    updateData,
    { new: true, runValidators: true }
  )
  .populate('owner', 'name email avatar')
  .populate('members.user', 'name email avatar');

  return successResponse(res, { project: updatedProject }, 'Project updated successfully');
});

// Delete project
export const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  const project = await Project.findById(projectId);

  if (!project) {
    return notFoundResponse(res, 'Project not found');
  }

  // Only owner can delete project
  if (!project.isOwner(userId)) {
    return forbiddenResponse(res, 'Only project owner can delete the project');
  }

  await Project.findByIdAndDelete(projectId);

  return successResponse(res, null, 'Project deleted successfully');
});

// Add member to project
export const addMember = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { userId, role = PROJECT_ROLES.MEMBER } = req.body;
  const currentUserId = req.user._id;

  const project = await Project.findById(projectId);

  if (!project) {
    return notFoundResponse(res, 'Project not found');
  }

  // Check if current user is admin
  if (!project.isAdmin(currentUserId)) {
    return forbiddenResponse(res, 'Only admins can add members');
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return notFoundResponse(res, 'User not found');
  }

  // Check if user is already a member
  if (project.isMember(userId)) {
    return errorResponse(res, 'User is already a member of this project', HTTP_STATUS.CONFLICT);
  }

  project.addMember(userId, role);
  await project.save();

  const updatedProject = await Project.findById(projectId)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  return successResponse(res, { project: updatedProject }, 'Member added successfully');
});

// Remove member from project
export const removeMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const currentUserId = req.user._id;

  const project = await Project.findById(projectId);

  if (!project) {
    return notFoundResponse(res, 'Project not found');
  }

  // Check if current user is admin or removing themselves
  if (!project.isAdmin(currentUserId) && currentUserId.toString() !== userId) {
    return forbiddenResponse(res, 'Only admins can remove members');
  }

  // Cannot remove owner
  if (project.isOwner(userId)) {
    return forbiddenResponse(res, 'Cannot remove project owner');
  }

  project.removeMember(userId);
  await project.save();

  const updatedProject = await Project.findById(projectId)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  return successResponse(res, { project: updatedProject }, 'Member removed successfully');
});

// Update member role
export const updateMemberRole = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { role } = req.body;
  const currentUserId = req.user._id;

  const project = await Project.findById(projectId);

  if (!project) {
    return notFoundResponse(res, 'Project not found');
  }

  // Check if current user is admin
  if (!project.isAdmin(currentUserId)) {
    return forbiddenResponse(res, 'Only admins can update member roles');
  }

  // Cannot change owner role
  if (project.isOwner(userId)) {
    return forbiddenResponse(res, 'Cannot change owner role');
  }

  project.updateMemberRole(userId, role);
  await project.save();

  const updatedProject = await Project.findById(projectId)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  return successResponse(res, { project: updatedProject }, 'Member role updated successfully');
}); 