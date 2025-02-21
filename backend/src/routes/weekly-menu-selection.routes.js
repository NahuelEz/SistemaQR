const express = require('express');
const router = express.Router();
const WeeklyMenuSelectionController = require('../controllers/weekly-menu-selection.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Middleware to ensure user is authenticated
router.use(authMiddleware.verifyToken);

// Create weekly menu selection (only on Sundays)
router.post(
  '/selections',
  WeeklyMenuSelectionController.createWeeklySelection
);

// Get user's weekly menu selections
router.get(
  '/selections',
  WeeklyMenuSelectionController.getWeeklySelection
);

// Get available menus for next week
router.get(
  '/available-menus',
  WeeklyMenuSelectionController.getAvailableMenusForWeek
);

// Admin routes
router.get(
  '/users-without-selection',
  authMiddleware.isAdmin,
  WeeklyMenuSelectionController.getUsersWithoutSelection
);

router.get(
  '/statistics',
  authMiddleware.isAdmin,
  WeeklyMenuSelectionController.getSelectionStatistics
);

module.exports = router;
