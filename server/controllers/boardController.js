import Board from '../models/Board.js';
import Project from '../models/Project.js';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse,
  forbiddenResponse,
  asyncHandler 
} from '../utils/responseHandler.js';
import { HTTP_STATUS } from '../utils/constants.js';

// Get boards for a project
export const getBoards = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  // Check if user has access to this project
  const project = await Project.findById(projectId);
  if (!project || !project.isMember(userId)) {
    return forbiddenResponse(res, 'Access denied');
  }

  const boards = await Board.find({ project: projectId })
    .sort({ order: 1, createdAt: 1 });

  return successResponse(res, { boards });
});

// Get board by ID
export const getBoardById = asyncHandler(async (req, res) => {
  const { boardId } = req.params;
  const userId = req.user._id;

  const board = await Board.findById(boardId).populate('project');

  if (!board) {
    return notFoundResponse(res, 'Board not found');
  }

  // Check if user has access to the project
  if (!board.project.isMember(userId)) {
    return forbiddenResponse(res, 'Access denied');
  }

  return successResponse(res, { board });
});

// Create new board
export const createBoard = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { name, description } = req.body;
  const userId = req.user._id;

  // Check if user has access to this project
  const project = await Project.findById(projectId);
  if (!project || !project.isMember(userId)) {
    return forbiddenResponse(res, 'Access denied');
  }

  // Get the highest order number
  const lastBoard = await Board.findOne({ project: projectId })
    .sort({ order: -1 });
  const order = lastBoard ? lastBoard.order + 1 : 0;

  const board = new Board({
    name,
    description,
    project: projectId,
    order
  });

  await board.save();

  const populatedBoard = await Board.findById(board._id).populate('project');

  return successResponse(
    res, 
    { board: populatedBoard }, 
    'Board created successfully',
    HTTP_STATUS.CREATED
  );
});

// Update board
export const updateBoard = asyncHandler(async (req, res) => {
  const { boardId } = req.params;
  const { name, description } = req.body;
  const userId = req.user._id;

  const board = await Board.findById(boardId).populate('project');

  if (!board) {
    return notFoundResponse(res, 'Board not found');
  }

  // Check if user has access to the project
  if (!board.project.isMember(userId)) {
    return forbiddenResponse(res, 'Access denied');
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;

  const updatedBoard = await Board.findByIdAndUpdate(
    boardId,
    updateData,
    { new: true, runValidators: true }
  ).populate('project');

  return successResponse(res, { board: updatedBoard }, 'Board updated successfully');
});

// Delete board
export const deleteBoard = asyncHandler(async (req, res) => {
  const { boardId } = req.params;
  const userId = req.user._id;

  const board = await Board.findById(boardId).populate('project');

  if (!board) {
    return notFoundResponse(res, 'Board not found');
  }

  // Check if user has access to the project
  if (!board.project.isMember(userId)) {
    return forbiddenResponse(res, 'Access denied');
  }

  await Board.findByIdAndDelete(boardId);

  return successResponse(res, null, 'Board deleted successfully');
});

// Reorder boards
export const reorderBoards = asyncHandler(async (req, res) => {
  const { boardOrders } = req.body; // Array of { boardId, order }
  const userId = req.user._id;

  if (!Array.isArray(boardOrders)) {
    return errorResponse(res, 'boardOrders must be an array', HTTP_STATUS.BAD_REQUEST);
  }

  // Update board orders
  const updatePromises = boardOrders.map(({ boardId, order }) =>
    Board.findByIdAndUpdate(boardId, { order })
  );

  await Promise.all(updatePromises);

  return successResponse(res, null, 'Boards reordered successfully');
}); 