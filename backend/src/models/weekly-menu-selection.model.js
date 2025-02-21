const pool = require('../config/database');
const moment = require('moment');

class WeeklyMenuSelection {
  static async createWeeklySelection(userId, selections) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Validate it's Sunday
      const today = moment();
      if (today.day() !== 0) {
        throw new Error('Weekly menu selections can only be made on Sundays');
      }

      // Get start and end of the week
      const weekStart = moment().add(1, 'day').startOf('day'); // Starting from tomorrow
      const weekEnd = moment().add(7, 'days').endOf('day');

      // Delete existing selections for the week if any
      await connection.execute(
        `DELETE FROM menu_selections 
         WHERE user_id = ? 
         AND menu_id IN (
           SELECT id FROM menus 
           WHERE date BETWEEN ? AND ?
         )`,
        [userId, weekStart.format('YYYY-MM-DD'), weekEnd.format('YYYY-MM-DD')]
      );

      // Insert new selections
      for (const selection of selections) {
        const {
          menuId,
          selectedDish,
          specialRequirements
        } = selection;

        // Validate menu exists and is within the week
        const [menuExists] = await connection.execute(
          'SELECT date FROM menus WHERE id = ? AND date BETWEEN ? AND ?',
          [menuId, weekStart.format('YYYY-MM-DD'), weekEnd.format('YYYY-MM-DD')]
        );

        if (!menuExists.length) {
          throw new Error(`Invalid menu selection for menu ID: ${menuId}`);
        }

        await connection.execute(
          `INSERT INTO menu_selections (
            user_id,
            menu_id,
            selected_dish,
            special_requirements,
            selection_date
          ) VALUES (?, ?, ?, ?, NOW())`,
          [userId, menuId, selectedDish, specialRequirements || null]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getWeeklySelection(userId, weekStart) {
    try {
      const weekEnd = moment(weekStart).add(6, 'days').format('YYYY-MM-DD');
      
      const [rows] = await pool.execute(
        `SELECT 
          ms.*,
          m.date,
          m.meal_type,
          m.main_dish,
          m.alternative_dish,
          m.dessert,
          m.special_diet_options
         FROM menu_selections ms
         JOIN menus m ON ms.menu_id = m.id
         WHERE ms.user_id = ? 
         AND m.date BETWEEN ? AND ?
         ORDER BY m.date, m.meal_type`,
        [userId, weekStart, weekEnd]
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

  static async getUsersWithoutSelection() {
    try {
      const nextWeekStart = moment().add(1, 'day').format('YYYY-MM-DD');
      const nextWeekEnd = moment().add(7, 'days').format('YYYY-MM-DD');

      const [rows] = await pool.execute(
        `SELECT DISTINCT u.id, u.username, u.email
         FROM users u
         WHERE u.role = 'employee'
         AND NOT EXISTS (
           SELECT 1 FROM menu_selections ms
           JOIN menus m ON ms.menu_id = m.id
           WHERE ms.user_id = u.id
           AND m.date BETWEEN ? AND ?
         )`,
        [nextWeekStart, nextWeekEnd]
      );

      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getSelectionStatistics(startDate, endDate) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          m.date,
          m.meal_type,
          COUNT(ms.id) as total_selections,
          SUM(CASE WHEN ms.selected_dish = 'main' THEN 1 ELSE 0 END) as main_dish_count,
          SUM(CASE WHEN ms.selected_dish = 'alternative' THEN 1 ELSE 0 END) as alternative_dish_count,
          COUNT(DISTINCT ms.user_id) as unique_users
         FROM menus m
         LEFT JOIN menu_selections ms ON m.id = ms.menu_id
         WHERE m.date BETWEEN ? AND ?
         GROUP BY m.date, m.meal_type
         ORDER BY m.date, m.meal_type`,
        [startDate, endDate]
      );

      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = WeeklyMenuSelection;
