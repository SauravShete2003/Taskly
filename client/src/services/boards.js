import api from './api';

const unwrap = (res) => res?.data ?? {};

export const getBoards = async (projectId) => {
  const res = await api.get(`/boards/projects/${projectId}`);
  const payload = unwrap(res);
  return payload.boards ?? [];
};

// POST /boards/projects/:projectId
export const createBoard = async (projectId, input) => {
  const res = await api.post(`/boards/projects/${projectId}`, input);
  const payload = unwrap(res);
  return payload.board;
};

// GET /boards/:boardId
export const getBoard = async (boardId) => {
  const res = await api.get(`/boards/${boardId}`);
  const payload = unwrap(res);
  return payload.board;
};

// PUT /boards/:boardId
export const updateBoard = async (boardId, input) => {
  const res = await api.put(`/boards/${boardId}`, input);
  const payload = unwrap(res);
  return payload.board;
};

// DELETE /boards/:boardId
export const deleteBoard = async (boardId) => {
  await api.delete(`/boards/${boardId}`);
  return true;
};

// PUT /boards/reorder
export const reorderBoards = async (boardOrders) => {
  const res = await api.put('/boards/reorder', { boardOrders });
  return unwrap(res);
};

// GET /boards/:boardId/stats
export const getBoardStats = async (boardId) => {
  const res = await api.get(`/boards/${boardId}/stats`);
  const payload = unwrap(res);
  return payload.stats || {};
};
