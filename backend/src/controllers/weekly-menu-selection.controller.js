const WeeklyMenuSelection = require('../models/weekly-menu-selection.model');
const Menu = require('../models/menu.model');
const moment = require('moment');

class WeeklyMenuSelectionController {
  static async createWeeklySelection(req, res) {
    try {
      const { selections } = req.body;
      const userId = req.user.id;

      if (!Array.isArray(selections) || selections.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid selections format. Expected array of selections.'
        });
      }

      await WeeklyMenuSelection.createWeeklySelection(userId, selections);

      res.status(201).json({
        success: true,
        message: 'Weekly menu selections created successfully'
      });
    } catch (error) {
      if (error.message.includes('can only be made on Sundays')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      console.error('Error creating weekly menu selection:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating weekly menu selections'
      });
    }
  }

  static async getWeeklySelection(req, res) {
    try {
      const userId = req.user.id;
      const weekStart = req.query.weekStart || 
        moment().startOf('week').add(1, 'day').format('YYYY-MM-DD');

      const selections = await WeeklyMenuSelection.getWeeklySelection(
        userId,
        weekStart
      );

      res.json({
        success: true,
        data: selections
      });
    } catch (error) {
      console.error('Error fetching weekly selections:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching weekly selections'
      });
    }
  }

  static async getAvailableMenusForWeek(req, res) {
    try {
      const weekStart = moment().add(1, 'day').format('YYYY-MM-DD');
      const weekEnd = moment().add(7, 'days').format('YYYY-MM-DD');

      const menus = await Menu.getWeeklyMenu(weekStart, weekEnd);

      // Group menus by date and meal type for easier frontend handling
      const groupedMenus = menus.reduce((acc, menu) => {
        const date = menu.date;
        if (!acc[date]) {
          acc[date] = {};
        }
        acc[date][menu.meal_type] = menu;
        return acc;
      }, {});

      res.json({
        success: true,
        data: groupedMenus
      });
    } catch (error) {
      console.error('Error fetching available menus:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching available menus'
      });
    }
  }

  static async getUsersWithoutSelection(req, res) {
    try {
      // Verify admin role
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.'
        });
      }

      const users = await WeeklyMenuSelection.getUsersWithoutSelection();

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Error fetching users without selection:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching users without selection'
      });
    }
  }

  static async getSelectionStatistics(req, res) {
    try {
      // Verify admin role
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required.'
        });
      }

      const startDate = req.query.startDate || 
        moment().startOf('week').add(1, 'day').format('YYYY-MM-DD');
      const endDate = req.query.endDate || 
        moment().endOf('week').add(1, 'day').format('YYYY-MM-DD');

      const statistics = await WeeklyMenuSelection.getSelectionStatistics(
        startDate,
        endDate
      );

      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error fetching selection statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching selection statistics'
      });
    }
  }
}

module.exports = WeeklyMenuSelectionController;
