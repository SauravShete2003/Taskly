import Board from "../models/Board.js";
import Project from "../models/Project.js";
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  asyncHandler,
} from "../utils/responseHandler.js";
import { HTTP_STATUS } from "../utils/constants.js";

// Get boards for a project
export const getBoards = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  const project = await Project.findById(projectId);
  if (!project || !project.isMember(userId)) {
    return forbiddenResponse(res, "Access denied");
  }

  const boards = await Board.find({ project: projectId }).sort({ order: 1 });
  return successResponse(res, { boards }, "Success");
});

// Get board by ID
export const getBoardById = asyncHandler(async (req, res) => {
  const { boardId } = req.params;
  const userId = req.user._id;

  const board = await Board.findById(boardId).populate("project");
  if (!board) {
    return notFoundResponse(res, "Board not found");
  }

  if (!board.project.isMember(userId)) {
    return forbiddenResponse(res, "Access denied");
  }

  return successResponse(res, { board });
});

// Create new board
export const createBoard = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { name, description } = req.body;
  const userId = req.user._id;

  const project = await Project.findById(projectId);
  if (!project || !project.isMember(userId)) {
    return forbiddenResponse(res, "Access denied");
  }

  const lastBoard = await Board.findOne({ project: projectId }).sort({ order: -1 });
  const order = lastBoard ? lastBoard.order + 1 : 0;

  const board = new Board({
    name,
    description,
    project: projectId,
    order,
  });

  await board.save();
  const populatedBoard = await Board.findById(board._id).populate("project");

  return successResponse(
    res,
    { board: populatedBoard },
    "Board created successfully",
    HTTP_STATUS.CREATED
  );
});

// Update board
export const updateBoard = asyncHandler(async (req, res) => {
  const { boardId } = req.params;
  const { name, description } = req.body;
  const userId = req.user._id;

  const board = await Board.findById(boardId).populate("project");
  if (!board) {
    return notFoundResponse(res, "Board not found");
  }

  if (!board.project.isMember(userId)) {
    return forbiddenResponse(res, "Access denied");
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;

  const updatedBoard = await Board.findByIdAndUpdate(boardId, updateData, {
    new: true,
    runValidators: true,
  }).populate("project");

  return successResponse(res, { board: updatedBoard }, "Board updated successfully");
});

// Delete board
export const deleteBoard = asyncHandler(async (req, res) => {
  const { boardId } = req.params;
  const userId = req.user._id;

  const board = await Board.findById(boardId).populate("project");
  if (!board) {
    return notFoundResponse(res, "Board not found");
  }

  if (!board.project.isMember(userId)) {
    return forbiddenResponse(res, "Access denied");
  }

  await Board.findByIdAndDelete(boardId);

  return successResponse(res, {}, "Board deleted successfully");
});

// Reorder boards
export const reorderBoards = asyncHandler(async (req, res) => {
  const { boardOrders } = req.body; // Array of { boardId, order }

  if (!Array.isArray(boardOrders)) {
    return notFoundResponse(res, "boardOrders must be an array");
  }

  await Promise.all(
    boardOrders.map(({ boardId, order }) =>
      Board.findByIdAndUpdate(boardId, { order })
    )
  );

  return successResponse(res, {}, "Boards reordered successfully");
});
