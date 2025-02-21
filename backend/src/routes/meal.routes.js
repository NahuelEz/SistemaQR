const express = require('express');
const { body, query, param } = require('express-validator');
const MealRegistrationController = require('../controllers/meal-registration.controller');
const { verifyToken, isAdmin, isAdminOrEmployee } = require('../middleware/auth.middleware');

const router = express.Router();

// Validation middleware
const registrationValidation = [
  body('menuId')
    .isInt()
    .withMessage('Valid menu ID is required'),
  body('mealType')
    .isIn(['breakfast', 'lunch', 'snack', 'dinner'])
    .withMessage('Invalid meal type')
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

const qrCodeValidation = [
  body('qrCode')
    .notEmpty()
    .withMessage('QR code is required')
];

const scanValidation = [
  body('qrCode')
    .notEmpty()
    .withMessage('QR code is required'),
  body('menuId')
    .isInt()
    .withMessage('Valid menu ID is required'),
  body('mealType')
    .isIn(['breakfast', 'lunch', 'snack', 'dinner'])
    .withMessage('Invalid meal type')
];

// Registration routes
router.post(
  '/register',
  [verifyToken, isAdminOrEmployee, ...registrationValidation],
  MealRegistrationController.registerMeal
);

// QR code routes
router.post(
  '/verify-qr',
  [verifyToken, isAdminOrEmployee, ...qrCodeValidation],
  MealRegistrationController.verifyQRCode
);

router.post(
  '/scan-and-register',
  [verifyToken, isAdminOrEmployee, ...scanValidation],
  MealRegistrationController.scanAndRegister
);

// Reporting routes
router.get(
  '/daily',
  [verifyToken, isAdmin, ...dateValidation],
  MealRegistrationController.getDailyRegistrations
);

router.get(
  '/weekly',
  [verifyToken, isAdmin, ...dateRangeValidation],
  MealRegistrationController.getWeeklyRegistrations
);

router.get(
  '/user/:userId?',
  [
    verifyToken,
    isAdminOrEmployee,
    param('userId').optional().isInt().withMessage('Invalid user ID'),
    ...dateRangeValidation
  ],
  MealRegistrationController.getUserRegistrations
);

router.get(
  '/stats',
  [verifyToken, isAdmin, ...dateRangeValidation],
  MealRegistrationController.getRegistrationStats
);

module.exports = router;
