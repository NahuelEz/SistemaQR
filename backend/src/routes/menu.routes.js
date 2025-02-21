const express = require('express');
const { body, query, param } = require('express-validator');
const MenuController = require('../controllers/menu.controller');
const { verifyToken, isAdmin, isAdminOrEmployee } = require('../middleware/auth.middleware');

const router = express.Router();

// Validation middleware
const menuValidation = [
  body('date')
    .isDate()
    .withMessage('Valid date is required'),
  body('mealType')
    .isIn(['breakfast', 'lunch', 'snack', 'dinner'])
    .withMessage('Invalid meal type'),
  body('mainDish')
    .trim()
    .notEmpty()
    .withMessage('Main dish is required'),
  body('alternativeDish')
    .optional()
    .trim(),
  body('dessert')
    .optional()
    .trim(),
  body('specialDietOptions')
    .optional()
    .isObject()
    .withMessage('Special diet options must be an object')
];

const dateRangeValidation = [
  query('startDate')
    .isDate()
    .withMessage('Valid start date is required'),
  query('endDate')
    .isDate()
    .withMessage('Valid end date is required')
];

const dateValidation = [
  query('date')
    .isDate()
    .withMessage('Valid date is required')
];

const menuSelectionValidation = [
  body('selectedDish')
    .isIn(['main', 'alternative'])
    .withMessage('Invalid dish selection'),
  body('specialRequirements')
    .optional()
    .trim()
];

// Admin routes
router.post(
  '/',
  [verifyToken, isAdmin, ...menuValidation],
  MenuController.createMenu
);

router.put(
  '/:id',
  [
    verifyToken,
    isAdmin,
    param('id').isInt().withMessage('Invalid menu ID'),
    ...menuValidation
  ],
  MenuController.updateMenu
);

router.delete(
  '/:id',
  [
    verifyToken,
    isAdmin,
    param('id').isInt().withMessage('Invalid menu ID')
  ],
  MenuController.deleteMenu
);

// Public routes (requires authentication)
router.get(
  '/weekly',
  [verifyToken, isAdminOrEmployee, ...dateRangeValidation],
  MenuController.getWeeklyMenu
);

router.get(
  '/daily',
  [verifyToken, isAdminOrEmployee, ...dateValidation],
  MenuController.getDailyMenu
);

// Menu selection routes
router.post(
  '/:menuId/selections',
  [
    verifyToken,
    isAdminOrEmployee,
    param('menuId').isInt().withMessage('Invalid menu ID'),
    ...menuSelectionValidation
  ],
  MenuController.createMenuSelection
);

router.get(
  '/:menuId/selections',
  [
    verifyToken,
    isAdmin,
    param('menuId').isInt().withMessage('Invalid menu ID')
  ],
  MenuController.getMenuSelections
);

router.get(
  '/selections/user/:userId?',
  [
    verifyToken,
    isAdminOrEmployee,
    param('userId').optional().isInt().withMessage('Invalid user ID'),
    ...dateRangeValidation
  ],
  MenuController.getUserMenuSelections
);

module.exports = router;
