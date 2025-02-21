const pool = require('../config/database');

class Menu {
  static async create(menuData) {
    try {
      const {
        date,
        mealType,
        mainDish,
        alternativeDish,
        dessert,
        specialDietOptions
      } = menuData;

      const [result] = await pool.execute(
        `INSERT INTO menus (
          date,
          meal_type,
          main_dish,
          alternative_dish,
          dessert,
          special_diet_options
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          date,
          mealType,
          mainDish,
          alternativeDish || null,
          dessert || null,
          specialDietOptions ? JSON.stringify(specialDietOptions) : null
        ]
      );

      return {
        id: result.insertId,
        ...menuData
      };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, menuData) {
    try {
      const {
        date,
        mealType,
        mainDish,
        alternativeDish,
        dessert,
        specialDietOptions
      } = menuData;

      const [result] = await pool.execute(
        `UPDATE menus SET
          date = ?,
          meal_type = ?,
          main_dish = ?,
          alternative_dish = ?,
          dessert = ?,
          special_diet_options = ?
        WHERE id = ?`,
        [
          date,
          mealType,
          mainDish,
          alternativeDish || null,
          dessert || null,
          specialDietOptions ? JSON.stringify(specialDietOptions) : null,
          id
        ]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM menus WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM menus WHERE id = ?',
        [id]
      );
      
      if (rows[0] && rows[0].special_diet_options) {
        rows[0].special_diet_options = JSON.parse(rows[0].special_diet_options);
      }
      
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getWeeklyMenu(startDate, endDate) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM menus WHERE date BETWEEN ? AND ? ORDER BY date, meal_type',
        [startDate, endDate]
      );

      return rows.map(row => ({
        ...row,
        special_diet_options: row.special_diet_options ? 
          JSON.parse(row.special_diet_options) : null
      }));
    } catch (error) {
      throw error;
    }
  }

  static async getDailyMenu(date) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM menus WHERE date = ? ORDER BY meal_type',
        [date]
      );

      return rows.map(row => ({
        ...row,
        special_diet_options: row.special_diet_options ? 
          JSON.parse(row.special_diet_options) : null
      }));
    } catch (error) {
      throw error;
    }
  }

  static async createMenuSelection(userId, menuId, selectionData) {
    try {
      const { selectedDish, specialRequirements } = selectionData;

      const [result] = await pool.execute(
        `INSERT INTO menu_selections (
          user_id,
          menu_id,
          selected_dish,
          special_requirements
        ) VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          selected_dish = VALUES(selected_dish),
          special_requirements = VALUES(special_requirements)`,
        [userId, menuId, selectedDish, specialRequirements || null]
      );

      return {
        id: result.insertId,
        userId,
        menuId,
        ...selectionData
      };
    } catch (error) {
      throw error;
    }
  }

  static async getMenuSelections(menuId) {
    try {
      const [rows] = await pool.execute(
        `SELECT ms.*, u.username
         FROM menu_selections ms
         JOIN users u ON ms.user_id = u.id
         WHERE ms.menu_id = ?`,
        [menuId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getUserMenuSelections(userId, startDate, endDate) {
    try {
      const [rows] = await pool.execute(
        `SELECT ms.*, m.*
         FROM menu_selections ms
         JOIN menus m ON ms.menu_id = m.id
         WHERE ms.user_id = ? AND m.date BETWEEN ? AND ?
         ORDER BY m.date, m.meal_type`,
        [userId, startDate, endDate]
      );

      return rows.map(row => ({
        ...row,
        special_diet_options: row.special_diet_options ? 
          JSON.parse(row.special_diet_options) : null
      }));
    } catch (error) {
      throw error;
    }
  }

  static async checkMenuExists(date, mealType) {
    try {
      const [rows] = await pool.execute(
        'SELECT id FROM menus WHERE date = ? AND meal_type = ?',
        [date, mealType]
      );
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Menu;
