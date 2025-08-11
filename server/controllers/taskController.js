import Task from '../models/Task.js';
import Board from '../models/Board.js';
import Project from '../models/Project.js';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse,
  forbiddenResponse,
  asyncHandler 
} from '../utils/responseHandler.js';
import { HTTP_STATUS, TASK_PRIORITIES } from '../utils/constants.js';

// Get tasks for a board
export const getTasks = asyncHandler(async (req, res) => {
  const { boardId } = req.params;
  const userId = req.user._id;

  // Check if user has access to this board
  const board = await Board.findById(boardId).populate('project');
  if (!board || !board.project.isMember(userId)) {
    return forbiddenResponse(res, 'Access denied');
  }

  const tasks = await Task.find({ board: boardId })
    .populate('assignees', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .sort({ order: 1, createdAt: 1 });

  return successResponse(res, { tasks });
});

// Get task by ID
export const getTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user._id;

  const task = await Task.findById(taskId)
    .populate('board')
    .populate('assignees', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('comments.user', 'name email avatar');

  if (!task) {
    return notFoundResponse(res, 'Task not found');
  }

  // Check if user has access to the project
  const project = await Project.findById(task.board.project);
  if (!project || !project.isMember(userId)) {
    return forbiddenResponse(res, 'Access denied');
  }

  return successResponse(res, { task });
});

// Create new task
export const createTask = asyncHandler(async (req, res) => {
  const { boardId } = req.params;
  const { title, description, priority, dueDate, assignees } = req.body;
  const userId = req.user._id;

  // Check if user has access to this board
  const board = await Board.findById(boardId).populate('project');
  if (!board || !board.project.isMember(userId)) {
    return forbiddenResponse(res, 'Access denied');
  }

  // Check if board has reached max tasks
  if (await board.hasReachedMaxTasks()) {
    return errorResponse(res, 'Board has reached maximum number of tasks', HTTP_STATUS.BAD_REQUEST);
  }

  // Get the highest order number
  const lastTask = await Task.findOne({ board: boardId })
    .sort({ order: -1 });
  const order = lastTask ? lastTask.order + 1 : 0;

  const task = new Task({
    title,
    description,
    priority: priority || TASK_PRIORITIES.MEDIUM,
    dueDate,
    assignees: assignees || [],
    board: boardId,
    createdBy: userId,
    order
  });

  await task.save();

  const populatedTask = await Task.findById(task._id)
    .populate('assignees', 'name email avatar')
    .populate('createdBy', 'name email avatar');

  return successResponse(
    res, 
    { task: populatedTask }, 
    'Task created successfully',
    HTTP_STATUS.CREATED
  );
});

// Update task
export const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title, description, priority, dueDate, assignees } = req.body;
  const userId = req.user._id;

  const task = await Task.findById(taskId).populate('board');

  if (!task) {
    return notFoundResponse(res, 'Task not found');
  }

  // Check if user has access to the project
  const project = await Project.findById(task.board.project);
  if (!project || !project.isMember(userId)) {
    return forbiddenResponse(res, 'Access denied');
  }

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (priority !== undefined) updateData.priority = priority;
  if (dueDate !== undefined) updateData.dueDate = dueDate;
  if (assignees !== undefined) updateData.assignees = assignees;

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    updateData,
    { new: true, runValidators: true }
  )
  .populate('assignees', 'name email avatar')
  .populate('createdBy', 'name email avatar');

  return successResponse(res, { task: updatedTask }, 'Task updated successfully');
});

// Delete task
export const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user._id;

  const task = await Task.findById(taskId).populate('board');

  if (!task) {
    return notFoundResponse(res, 'Task not found');
  }

  // Check if user has access to the project
  const project = await Project.findById(task.board.project);
  if (!project || !project.isMember(userId)) {
    return forbiddenResponse(res, 'Access denied');
  }

  await Task.findByIdAndDelete(taskId);

  return successResponse(res, null, 'Task deleted successfully');
});

// Move task to different board
export const moveTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { boardId, order } = req.body;
  const userId = req.user._id;

  const task = await Task.findById(taskId).populate('board');
  if (!task) {
    return notFoundResponse(res, 'Task not found');
  }

  // Check if user has access to the source project
  const sourceProject = await Project.findById(task.board.project);
  if (!sourceProject || !sourceProject.isMember(userId)) {
    return forbiddenResponse(res, 'Access denied');
  }

  // Check if user has access to the target board
  const targetBoard = await Board.findById(boardId).populate('project');
  if (!targetBoard || !targetBoard.project.isMember(userId)) {
    return forbiddenResponse(res, 'Access denied to target board');
  }

  // Check if target board has reached max tasks
  if (await targetBoard.hasReachedMaxTasks()) {
    return errorResponse(res, 'Target board has reached maximum number of tasks', HTTP_STATUS.BAD_REQUEST);
  }

  // Update task
  const updateData = { board: boardId };
  if (order !== undefined) updateData.order = order;

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    updateData,
    { new: true, runValidators: true }
  )
  .populate('assignees', 'name email avatar')
  .populate('createdBy', 'name email avatar');

  return successResponse(res, { task: updatedTask }, 'Task moved successfully');
});

// Add comment to task
export const addComment = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  const task = await Task.findById(taskId).populate('board');
  if (!task) {
    return notFoundResponse(res, 'Task not found');
  }

  // Check if user has access to the project
  const project = await Project.findById(task.board.project);
  if (!project || !project.isMember(userId)) {
    return forbiddenResponse(res, 'Access denied');
  }

  // Check if comments are allowed
  if (!task.board.settings.allowComments) {
    return forbiddenResponse(res, 'Comments are not allowed on this board');
  }

  const comment = {
    content,
    user: userId,
    createdAt: new Date()
  };

  task.comments.push(comment);
  await task.save();

  const populatedTask = await Task.findById(taskId)
    .populate('assignees', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('comments.user', 'name email avatar');

  return successResponse(res, { task: populatedTask }, 'Comment added successfully');
});

// Remove comment from task
export const removeComment = asyncHandler(async (req, res) => {
  const { taskId, commentId } = req.params;
  const userId = req.user._id;

  const task = await Task.findById(taskId).populate('board');
  if (!task) {
    return notFoundResponse(res, 'Task not found');
  }

  // Check if user has access to the project
  const project = await Project.findById(task.board.project);
  if (!project || !project.isMember(userId)) {
    return forbiddenResponse(res, 'Access denied');
  }

  const comment = task.comments.id(commentId);
  if (!comment) {
    return notFoundResponse(res, 'Comment not found');
  }

  // Check if user is comment author or project admin
  if (comment.user.toString() !== userId.toString() && !project.isAdmin(userId)) {
    return forbiddenResponse(res, 'You can only delete your own comments');
  }

  comment.remove();
  await task.save();

  const populatedTask = await Task.findById(taskId)
    .populate('assignees', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('comments.user', 'name email avatar');

  return successResponse(res, { task: populatedTask }, 'Comment removed successfully');
}); 