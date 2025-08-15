import http from './http';

const unwrap = (res) => res?.data?.data ?? res?.data ?? {};

// GET /boards/project/:projectId
export const getBoards = async (projectId) => {
  const res = await http.get(`/boards/project/${projectId}`);
  const payload = unwrap(res);
  return payload.boards ?? [];
};

// POST /boards/project/:projectId
export const createBoard = async (projectId, input) => {
  const res = await http.post(`/boards/project/${projectId}`, input);
  const payload = unwrap(res);
  return payload.board;
};

// GET /boards/:boardId
export const getBoard = async (boardId) => {
  const res = await http.get(`/boards/${boardId}`);
  const payload = unwrap(res);
  return payload.board;
};

// PUT /boards/:boardId
export const updateBoard = async (boardId, input) => {
  const res = await http.put(`/boards/${boardId}`, input);
  const payload = unwrap(res);
  return payload.board;
};

// DELETE /boards/:boardId
export const deleteBoard = async (boardId) => {
  await http.delete(`/boards/${boardId}`);
  return true;
};

// PUT /boards/reorder
export const reorderBoards = async (boardOrders) => {
  const res = await http.put('/boards/reorder', { boardOrders });
  return unwrap(res);
};