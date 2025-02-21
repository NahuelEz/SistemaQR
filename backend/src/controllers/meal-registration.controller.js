const { validationResult } = require('express-validator');
const MealRegistration = require('../models/meal-registration.model');
const Menu = require('../models/menu.model');
const moment = require('moment');

class MealRegistrationController {
  static async registerMeal(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { menuId, mealType } = req.body;
      const userId = req.user.id;

      // Check if menu exists
      const menu = await Menu.findById(menuId);
      if (!menu) {
        return res.status(404).json({ message: 'Menu not found' });
      }

      // Check if menu is for today
      const today = moment().format('YYYY-MM-DD');
      if (menu.date !== today) {
        return res.status(400).json({ message: 'Menu is not for today' });
      }

      const registration = await MealRegistration.register(userId, menuId, mealType);

      res.status(201).json({
        message: 'Meal registered successfully',
        registration
      });
    } catch (error) {
      console.error('Register meal error:', error);
      if (error.message === 'Already registered for this meal today') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error registering meal' });
    }
  }

  static async getDailyRegistrations(req, res) {
    try {
      const { date } = req.query;

      // Validate date
      if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
        return res.status(400).json({ message: 'Invalid date format' });
      }

      const registrations = await MealRegistration.getDailyRegistrations(date);
      res.json(registrations);
    } catch (error) {
      console.error('Get daily registrations error:', error);
      res.status(500).json({ message: 'Error fetching daily registrations' });
    }
  }

  static async getWeeklyRegistrations(req, res) {
    try {
      const { startDate, endDate } = req.query;

      // Validate dates
      if (!moment(startDate, 'YYYY-MM-DD', true).isValid() ||
          !moment(endDate, 'YYYY-MM-DD', true).isValid()) {
        return res.status(400).json({ message: 'Invalid date format' });
      }

      const registrations = await MealRegistration.getWeeklyRegistrations(startDate, endDate);
      res.json(registrations);
    } catch (error) {
      console.error('Get weekly registrations error:', error);
      res.status(500).json({ message: 'Error fetching weekly registrations' });
    }
  }

  static async getUserRegistrations(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const userId = req.params.userId || req.user.id;

      // Validate dates
      if (!moment(startDate, 'YYYY-MM-DD', true).isValid() ||
          !moment(endDate, 'YYYY-MM-DD', true).isValid()) {
        return res.status(400).json({ message: 'Invalid date format' });
      }

      const registrations = await MealRegistration.getUserRegistrations(userId, startDate, endDate);
      res.json(registrations);
    } catch (error) {
      console.error('Get user registrations error:', error);
      res.status(500).json({ message: 'Error fetching user registrations' });
    }
  }

  static async getRegistrationStats(req, res) {
    try {
      const { startDate, endDate } = req.query;

      // Validate dates
      if (!moment(startDate, 'YYYY-MM-DD', true).isValid() ||
          !moment(endDate, 'YYYY-MM-DD', true).isValid()) {
        return res.status(400).json({ message: 'Invalid date format' });
      }

      const stats = await MealRegistration.getRegistrationStats(startDate, endDate);
      res.json(stats);
    } catch (error) {
      console.error('Get registration stats error:', error);
      res.status(500).json({ message: 'Error fetching registration statistics' });
    }
  }

  static async verifyQRCode(req, res) {
    try {
      const { qrCode } = req.body;

      const user = await MealRegistration.verifyQRCode(qrCode);
      if (!user) {
        return res.status(404).json({ message: 'Invalid QR code' });
      }

      // Get today's menus
      const today = moment().format('YYYY-MM-DD');
      const menus = await Menu.getDailyMenu(today);

      res.json({
        user,
        menus
      });
    } catch (error) {
      console.error('Verify QR code error:', error);
      res.status(500).json({ message: 'Error verifying QR code' });
    }
  }

  static async scanAndRegister(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { qrCode, menuId, mealType } = req.body;

      // Verify QR code
      const user = await MealRegistration.verifyQRCode(qrCode);
      if (!user) {
        return res.status(404).json({ message: 'Invalid QR code' });
      }

      // Register meal
      const registration = await MealRegistration.scanAndRegister(user.id, menuId, mealType);

      res.status(201).json({
        message: 'Meal registered successfully',
        registration: {
          ...registration,
          username: user.username
        }
      });
    } catch (error) {
      console.error('Scan and register error:', error);
      if (error.message === 'Already registered for this meal' ||
          error.message === 'Invalid menu or menu not available for today') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error registering meal' });
    }
  }
}

module.exports = MealRegistrationController;
