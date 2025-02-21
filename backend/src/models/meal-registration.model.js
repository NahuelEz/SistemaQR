const pool = require('../config/database');
const moment = require('moment');

class MealRegistration {
  static async register(userId, menuId, mealType) {
    try {
      // Check if user has already registered for this meal type today
      const today = moment().format('YYYY-MM-DD');
      const [existingRegistrations] = await pool.execute(
        `SELECT mr.* 
         FROM meal_registrations mr
         JOIN menus m ON mr.menu_id = m.id
         WHERE mr.user_id = ? AND m.date = ? AND m.meal_type = ?`,
        [userId, today, mealType]
      );

      if (existingRegistrations.length > 0) {
        throw new Error('Already registered for this meal today');
      }

      const [result] = await pool.execute(
        `INSERT INTO meal_registrations (
          user_id,
          menu_id,
          meal_type,
          registration_time
        ) VALUES (?, ?, ?, NOW())`,
        [userId, menuId, mealType]
      );

      return {
        id: result.insertId,
        userId,
        menuId,
        mealType,
        registrationTime: new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  static async getDailyRegistrations(date) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          mr.*,
          u.username,
          m.main_dish,
          m.alternative_dish,
          ms.selected_dish,
          ms.special_requirements
         FROM meal_registrations mr
         JOIN users u ON mr.user_id = u.id
         JOIN menus m ON mr.menu_id = m.id
         LEFT JOIN menu_selections ms ON mr.menu_id = ms.menu_id AND mr.user_id = ms.user_id
         WHERE DATE(mr.registration_time) = ?
         ORDER BY mr.registration_time DESC`,
        [date]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getWeeklyRegistrations(startDate, endDate) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          mr.*,
          u.username,
          m.main_dish,
          m.alternative_dish,
          ms.selected_dish,
          ms.special_requirements
         FROM meal_registrations mr
         JOIN users u ON mr.user_id = u.id
         JOIN menus m ON mr.menu_id = m.id
         LEFT JOIN menu_selections ms ON mr.menu_id = ms.menu_id AND mr.user_id = ms.user_id
         WHERE DATE(mr.registration_time) BETWEEN ? AND ?
         ORDER BY mr.registration_time DESC`,
        [startDate, endDate]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getUserRegistrations(userId, startDate, endDate) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          mr.*,
          m.main_dish,
          m.alternative_dish,
          ms.selected_dish,
          ms.special_requirements
         FROM meal_registrations mr
         JOIN menus m ON mr.menu_id = m.id
         LEFT JOIN menu_selections ms ON mr.menu_id = ms.menu_id AND mr.user_id = ms.user_id
         WHERE mr.user_id = ? AND DATE(mr.registration_time) BETWEEN ? AND ?
         ORDER BY mr.registration_time DESC`,
        [userId, startDate, endDate]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getRegistrationStats(startDate, endDate) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          DATE(mr.registration_time) as date,
          mr.meal_type,
          COUNT(*) as total_registrations,
          COUNT(CASE WHEN ms.selected_dish = 'alternative' THEN 1 END) as alternative_selections,
          COUNT(CASE WHEN ms.special_requirements IS NOT NULL THEN 1 END) as special_requirements_count
         FROM meal_registrations mr
         LEFT JOIN menu_selections ms ON mr.menu_id = ms.menu_id AND mr.user_id = ms.user_id
         WHERE DATE(mr.registration_time) BETWEEN ? AND ?
         GROUP BY DATE(mr.registration_time), mr.meal_type
         ORDER BY date, mr.meal_type`,
        [startDate, endDate]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async verifyQRCode(qrCode) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, username, role FROM users WHERE qr_code = ?',
        [qrCode]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async scanAndRegister(userId, menuId, mealType) {
    try {
      // Start transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Check if menu exists and is for today
        const [menu] = await connection.execute(
          'SELECT * FROM menus WHERE id = ? AND date = CURDATE()',
          [menuId]
        );

        if (!menu[0]) {
          throw new Error('Invalid menu or menu not available for today');
        }

        // Check if already registered
        const [existingReg] = await connection.execute(
          `SELECT * FROM meal_registrations 
           WHERE user_id = ? AND menu_id = ? AND meal_type = ?`,
          [userId, menuId, mealType]
        );

        if (existingReg[0]) {
          throw new Error('Already registered for this meal');
        }

        // Create registration
        const [result] = await connection.execute(
          `INSERT INTO meal_registrations (
            user_id, 
            menu_id, 
            meal_type, 
            registration_time
          ) VALUES (?, ?, ?, NOW())`,
          [userId, menuId, mealType]
        );

        await connection.commit();
        return {
          id: result.insertId,
          userId,
          menuId,
          mealType,
          registrationTime: new Date()
        };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = MealRegistration;
