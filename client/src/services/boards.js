// client/src/services/boardService.js
import api from "./api.js";  // axios instance with token handling

const unwrap = (res) => res?.data ?? {};

// ✅ Fetch all boards for a project
export const getBoards = async (projectId) => {
  const res = await api.get(`/projects/${projectId}/boards`);
  return res.data?.data?.boards || [];
};

// ✅ Create a new board
export const createBoard = async (projectId, boardData) => {
  const res = await api.post(`/projects/${projectId}/boards`, boardData);
  return res.data?.data;
};

// ✅ Update an existing board
export const updateBoard = async (boardId, updates) => {
  const res = await api.put(`/boards/${boardId}`, updates);
  return res.data?.data;
};

// ✅ Delete a board
export const deleteBoard = async (boardId) => {
  const res = await api.delete(`/boards/${boardId}`);
  return res.data?.data;
};

// ✅ Reorder boards
export const reorderBoards = async (boardOrders) => {
  const res = await api.put("/boards/reorder", { boardOrders });
  const payload = unwrap(res);
  return payload.data ?? {};
};

// ✅ Get board stats
export const getBoardStats = async (boardId) => {
  const res = await api.get(`/boards/${boardId}/stats`);
  const payload = unwrap(res);
  return payload.data?.stats || {};
};
