const express = require('express');
const { body, query, param } = require('express-validator');
const EmployeeController = require('../controllers/employee.controller');
const { verifyToken, isAdmin, isAdminOrEmployee, isResourceOwner } = require('../middleware/auth.middleware');

const router = express.Router();

// Validation middleware
const employeeValidation = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'employee'])
    .withMessage('Invalid role')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const dateRangeValidation = [
  query('startDate')
    .isDate()
    .withMessage('Valid start date is required'),
  query('endDate')
    .isDate()
    .withMessage('Valid end date is required')
];

// List and create routes (admin only)
router.get(
  '/',
  [verifyToken, isAdmin, ...paginationValidation],
  EmployeeController.listEmployees
);

// Individual employee routes
router.get(
  '/:id',
  [
    verifyToken,
    isAdminOrEmployee,
    isResourceOwner,
    param('id').isInt().withMessage('Invalid employee ID')
  ],
  EmployeeController.getEmployee
);

router.put(
  '/:id',
  [
    verifyToken,
    isAdmin,
    param('id').isInt().withMessage('Invalid employee ID'),
    ...employeeValidation
  ],
  EmployeeController.updateEmployee
);

router.delete(
  '/:id',
  [
    verifyToken,
    isAdmin,
    param('id').isInt().withMessage('Invalid employee ID')
  ],
  EmployeeController.deleteEmployee
);

// QR code routes
router.get(
  '/:id/qr-code',
  [
    verifyToken,
    isAdminOrEmployee,
    isResourceOwner,
    param('id').isInt().withMessage('Invalid employee ID')
  ],
  EmployeeController.getEmployeeQRCode
);

router.post(
  '/:id/regenerate-qr',
  [
    verifyToken,
    isAdminOrEmployee,
    isResourceOwner,
    param('id').isInt().withMessage('Invalid employee ID')
  ],
  EmployeeController.regenerateQRCode
);

// Menu selections routes
router.get(
  '/:id/menu-selections',
  [
    verifyToken,
    isAdminOrEmployee,
    isResourceOwner,
    param('id').isInt().withMessage('Invalid employee ID'),
    ...dateRangeValidation
  ],
  EmployeeController.getEmployeeMenuSelections
);

// Meal registrations routes
router.get(
  '/:id/meal-registrations',
  [
    verifyToken,
    isAdminOrEmployee,
    isResourceOwner,
    param('id').isInt().withMessage('Invalid employee ID'),
    ...dateRangeValidation
  ],
  EmployeeController.getEmployeeMealRegistrations
);

module.exports = router;
