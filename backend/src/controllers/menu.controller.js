const { validationResult } = require('express-validator');
const Menu = require('../models/menu.model');
const moment = require('moment');

class MenuController {
  static async createMenu(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        date,
        mealType,
        mainDish,
        alternativeDish,
        dessert,
        specialDietOptions
      } = req.body;

      // Check if menu already exists for this date and meal type
      const menuExists = await Menu.checkMenuExists(date, mealType);
      if (menuExists) {
        return res.status(400).json({
          message: 'Menu already exists for this date and meal type'
        });
      }

      const menu = await Menu.create({
        date,
        mealType,
        mainDish,
        alternativeDish,
        dessert,
        specialDietOptions
      });

      res.status(201).json({
        message: 'Menu created successfully',
        menu
      });
    } catch (error) {
      console.error('Create menu error:', error);
      res.status(500).json({ message: 'Error creating menu' });
    }
  }

  static async updateMenu(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const {
        date,
        mealType,
        mainDish,
        alternativeDish,
        dessert,
        specialDietOptions
      } = req.body;

      // Check if menu exists
      const existingMenu = await Menu.findById(id);
      if (!existingMenu) {
        return res.status(404).json({ message: 'Menu not found' });
      }

      // Check if update would create a duplicate
      if (date !== existingMenu.date || mealType !== existingMenu.meal_type) {
        const menuExists = await Menu.checkMenuExists(date, mealType);
        if (menuExists) {
          return res.status(400).json({
            message: 'Menu already exists for this date and meal type'
          });
        }
      }

      const success = await Menu.update(id, {
        date,
        mealType,
        mainDish,
        alternativeDish,
        dessert,
        specialDietOptions
      });

      if (!success) {
        return res.status(400).json({ message: 'No changes made' });
      }

      const updatedMenu = await Menu.findById(id);

      res.json({
        message: 'Menu updated successfully',
        menu: updatedMenu
      });
    } catch (error) {
      console.error('Update menu error:', error);
      res.status(500).json({ message: 'Error updating menu' });
    }
  }

  static async deleteMenu(req, res) {
    try {
      const { id } = req.params;

      const success = await Menu.delete(id);
      if (!success) {
        return res.status(404).json({ message: 'Menu not found' });
      }

      res.json({ message: 'Menu deleted successfully' });
    } catch (error) {
      console.error('Delete menu error:', error);
      res.status(500).json({ message: 'Error deleting menu' });
    }
  }

  static async getWeeklyMenu(req, res) {
    try {
      const { startDate, endDate } = req.query;

      // Validate dates
      if (!moment(startDate, 'YYYY-MM-DD', true).isValid() ||
          !moment(endDate, 'YYYY-MM-DD', true).isValid()) {
        return res.status(400).json({ message: 'Invalid date format' });
      }

      const menus = await Menu.getWeeklyMenu(startDate, endDate);
      res.json(menus);
    } catch (error) {
      console.error('Get weekly menu error:', error);
      res.status(500).json({ message: 'Error fetching weekly menu' });
    }
  }

  static async getDailyMenu(req, res) {
    try {
      const { date } = req.query;

      // Validate date
      if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
        return res.status(400).json({ message: 'Invalid date format' });
      }

      const menus = await Menu.getDailyMenu(date);
      res.json(menus);
    } catch (error) {
      console.error('Get daily menu error:', error);
      res.status(500).json({ message: 'Error fetching daily menu' });
    }
  }

  static async createMenuSelection(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { menuId } = req.params;
      const { selectedDish, specialRequirements } = req.body;
      const userId = req.user.id;

      // Check if menu exists
      const menu = await Menu.findById(menuId);
      if (!menu) {
        return res.status(404).json({ message: 'Menu not found' });
      }

      // Validate selected dish
      if (selectedDish === 'alternative' && !menu.alternative_dish) {
        return res.status(400).json({ message: 'Alternative dish not available' });
      }

      const selection = await Menu.createMenuSelection(userId, menuId, {
        selectedDish,
        specialRequirements
      });

      res.status(201).json({
        message: 'Menu selection created successfully',
        selection
      });
    } catch (error) {
      console.error('Create menu selection error:', error);
      res.status(500).json({ message: 'Error creating menu selection' });
    }
  }

  static async getMenuSelections(req, res) {
    try {
      const { menuId } = req.params;

      // Check if menu exists
      const menu = await Menu.findById(menuId);
      if (!menu) {
        return res.status(404).json({ message: 'Menu not found' });
      }

      const selections = await Menu.getMenuSelections(menuId);
      res.json(selections);
    } catch (error) {
      console.error('Get menu selections error:', error);
      res.status(500).json({ message: 'Error fetching menu selections' });
    }
  }

  static async getUserMenuSelections(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const userId = req.params.userId || req.user.id;

      // Validate dates
      if (!moment(startDate, 'YYYY-MM-DD', true).isValid() ||
          !moment(endDate, 'YYYY-MM-DD', true).isValid()) {
        return res.status(400).json({ message: 'Invalid date format' });
      }

      const selections = await Menu.getUserMenuSelections(userId, startDate, endDate);
      res.json(selections);
    } catch (error) {
      console.error('Get user menu selections error:', error);
      res.status(500).json({ message: 'Error fetching user menu selections' });
    }
  }
}

module.exports = MenuController;
