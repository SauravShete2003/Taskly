// server/utils/validation.js
import { body, param, query, validationResult } from 'express-validator';
import { DEFAULTS } from './constants.js';

// Common validation result handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User validation schemas
export const userValidation = {
  register: [
    body('name')
      .trim()
      .isLength({ min: 2, max: DEFAULTS.NAME_MAX_LENGTH })
      .withMessage(`Name must be between 2 and ${DEFAULTS.NAME_MAX_LENGTH} characters`),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: DEFAULTS.PASSWORD_MIN_LENGTH })
      .withMessage(`Password must be at least ${DEFAULTS.PASSWORD_MIN_LENGTH} characters long`)
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one letter and one number'),
    handleValidationErrors
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidationErrors
  ],

  updateProfile: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: DEFAULTS.NAME_MAX_LENGTH })
      .withMessage(`Name must be between 2 and ${DEFAULTS.NAME_MAX_LENGTH} characters`),
    body('avatar')
      .optional()
      .isURL()
      .withMessage('Avatar must be a valid URL'),
    handleValidationErrors
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: DEFAULTS.PASSWORD_MIN_LENGTH })
      .withMessage(`New password must be at least ${DEFAULTS.PASSWORD_MIN_LENGTH} characters long`)
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one letter and one number'),
    handleValidationErrors
  ],

  userId: [
    param('id')
      .isMongoId()
      .withMessage('Invalid user ID'),
    handleValidationErrors
  ]
};

// Project validation schemas (keep if used elsewhere)
export const projectValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 1, max: DEFAULTS.PROJECT_NAME_MAX_LENGTH })
      .withMessage(`Project name must be between 1 and ${DEFAULTS.PROJECT_NAME_MAX_LENGTH} characters`),
    body('description')
      .optional()
      .trim()
      .isLength({ max: DEFAULTS.DESCRIPTION_MAX_LENGTH })
      .withMessage(`Description cannot exceed ${DEFAULTS.DESCRIPTION_MAX_LENGTH} characters`),
    body('color')
      .optional()
      .matches(/^#[0-9A-F]{6}$/i)
      .withMessage('Color must be a valid hex color'),
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic must be a boolean'),
    handleValidationErrors
  ],

  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: DEFAULTS.PROJECT_NAME_MAX_LENGTH })
      .withMessage(`Project name must be between 1 and ${DEFAULTS.PROJECT_NAME_MAX_LENGTH} characters`),
    body('description')
      .optional()
      .trim()
      .isLength({ max: DEFAULTS.DESCRIPTION_MAX_LENGTH })
      .withMessage(`Description cannot exceed ${DEFAULTS.DESCRIPTION_MAX_LENGTH} characters`),
    body('color')
      .optional()
      .matches(/^#[0-9A-F]{6}$/i)
      .withMessage('Color must be a valid hex color'),
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic must be a boolean'),
    handleValidationErrors
  ],

  projectId: [
    param('projectId')
      .isMongoId()
      .withMessage('Invalid project ID'),
    handleValidationErrors
  ]
};

// Board validation schemas (keep if used elsewhere)
export const boardValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Board name must be between 1 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('order')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Order must be a non-negative integer'),
    handleValidationErrors
  ],

  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Board name must be between 1 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('order')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Order must be a non-negative integer'),
    handleValidationErrors
  ],

  boardId: [
    param('boardId')
      .isMongoId()
      .withMessage('Invalid board ID'),
    handleValidationErrors
  ]
};

// Task validation schemas (keep if used elsewhere)
export const taskValidation = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Task title must be between 1 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Priority must be low, medium, high, or urgent'),
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Due date must be a valid date'),
    body('assignees')
      .optional()
      .isArray()
      .withMessage('Assignees must be an array'),
    body('assignees.*')
      .optional()
      .isMongoId()
      .withMessage('Invalid assignee ID'),
    handleValidationErrors
  ],

  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Task title must be between 1 and 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Priority must be low, medium, high, or urgent'),
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Due date must be a valid date'),
    body('assignees')
      .optional()
      .isArray()
      .withMessage('Assignees must be an array'),
    body('assignees.*')
      .optional()
      .isMongoId()
      .withMessage('Invalid assignee ID'),
    handleValidationErrors
  ],

  taskId: [
    param('taskId')
      .isMongoId()
      .withMessage('Invalid task ID'),
    handleValidationErrors
  ]
};

// Pagination validation
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];