import { HTTP_STATUS, MESSAGES } from './constants.js';

// Success response handler
export const successResponse = (res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

// Error response handler
export const errorResponse = (res, message = MESSAGES.INTERNAL_ERROR, statusCode = HTTP_STATUS.INTERNAL_SERVER, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = new Error().stack;
  }

  return res.status(statusCode).json(response);
};

// Validation error response
export const validationErrorResponse = (res, errors) => {
  return errorResponse(
    res,
    MESSAGES.VALIDATION_ERROR,
    HTTP_STATUS.BAD_REQUEST,
    errors
  );
};

// Not found response
export const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, message, HTTP_STATUS.NOT_FOUND);
};

// Unauthorized response
export const unauthorizedResponse = (res, message = MESSAGES.INVALID_TOKEN) => {
  return errorResponse(res, message, HTTP_STATUS.UNAUTHORIZED);
};

// Forbidden response
export const forbiddenResponse = (res, message = MESSAGES.ACCESS_DENIED) => {
  return errorResponse(res, message, HTTP_STATUS.FORBIDDEN);
};

// Conflict response
export const conflictResponse = (res, message = 'Resource already exists') => {
  return errorResponse(res, message, HTTP_STATUS.CONFLICT);
};

// Async error handler wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 