const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/auth.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Validation middleware
const registerValidation = [
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
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'employee'])
    .withMessage('Invalid role')
];

const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('currentPassword')
    .optional()
    .notEmpty()
    .withMessage('Current password is required when changing password'),
  body('newPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

// Public routes
router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginValidation, AuthController.login);

// Protected routes
router.get('/profile', verifyToken, AuthController.getProfile);
router.put(
  '/profile',
  [verifyToken, updateProfileValidation],
  AuthController.updateProfile
);
router.put(
  '/change-password',
  [verifyToken, changePasswordValidation],
  AuthController.changePassword
);

// Admin routes
router.post(
  '/register-admin',
  [verifyToken, isAdmin, registerValidation],
  (req, res, next) => {
    req.body.role = 'admin';
    next();
  },
  AuthController.register
);

module.exports = router;
