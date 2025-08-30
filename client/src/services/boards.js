// client/src/services/boardService.js
import api from "./api.js";  // axios instance with token handling

const unwrap = (res) => res?.data ?? {};

// ✅ Fetch all boards for a project
export const getBoards = async (projectId) => {
  if (!projectId || projectId === 'undefined') {
    console.warn('Invalid projectId provided to getBoards:', projectId);
    return [];
  }
  const res = await api.get(`/projects/${projectId}/boards`);
  return res.data?.data?.boards || [];
};

// ✅ Create a new board
export const createBoard = async (projectId, boardData) => {
  if (!projectId || projectId === 'undefined') {
    console.warn('Invalid projectId provided to createBoard:', projectId);
    throw new Error('Invalid project ID provided');
  }
  const res = await api.post(`/projects/${projectId}/boards`, boardData);
  return res.data?.data;
};

// ✅ Update an existing board
export const updateBoard = async (boardId, updates) => {
  if (!boardId || boardId === 'undefined') {
    console.warn('Invalid boardId provided to updateBoard:', boardId);
    throw new Error('Invalid board ID provided');
  }
  const res = await api.put(`/boards/${boardId}`, updates);
  return res.data?.data;
};

// ✅ Delete a board
export const deleteBoard = async (boardId) => {
  if (!boardId || boardId === 'undefined') {
    console.warn('Invalid boardId provided to deleteBoard:', boardId);
    throw new Error('Invalid board ID provided');
  }
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
  if (!boardId || boardId === 'undefined') {
    console.warn('Invalid boardId provided to getBoardStats:', boardId);
    return {};
  }
  const res = await api.get(`/boards/${boardId}/stats`);
  const payload = unwrap(res);
  return payload.data?.stats || {};
};
