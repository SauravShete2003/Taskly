// User roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Project member roles
export const PROJECT_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer'
};

// Task priorities
export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Task statuses
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done'
};

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER: 500
};

// Response messages
export const MESSAGES = {
  // Auth messages
  USER_REGISTERED: 'User registered successfully',
  LOGIN_SUCCESSFUL: 'Login successful',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  ACCOUNT_DEACTIVATED: 'Account is deactivated',
  TOKEN_EXPIRED: 'Token expired',
  INVALID_TOKEN: 'Invalid token',
  
  // Project messages
  PROJECT_CREATED: 'Project created successfully',
  PROJECT_UPDATED: 'Project updated successfully',
  PROJECT_DELETED: 'Project deleted successfully',
  PROJECT_NOT_FOUND: 'Project not found',
  ACCESS_DENIED: 'Access denied',
  
  // Task messages
  TASK_CREATED: 'Task created successfully',
  TASK_UPDATED: 'Task updated successfully',
  TASK_DELETED: 'Task deleted successfully',
  TASK_NOT_FOUND: 'Task not found',
  
  // General messages
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Something went wrong!',
  ROUTE_NOT_FOUND: 'Route not found'
};

// Default values
export const DEFAULTS = {
  PROJECT_COLOR: '#3B82F6',
  JWT_EXPIRY: '7d',
  PASSWORD_MIN_LENGTH: 6,
  NAME_MAX_LENGTH: 50,
  PROJECT_NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500
};

// File upload limits
export const UPLOAD_LIMITS = {
  FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']
}; 