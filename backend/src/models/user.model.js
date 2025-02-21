const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');

class User {
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create({ username, email, password, role = 'employee' }) {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Generate QR code
      const qrCode = await QRCode.toDataURL(username);

      const [result] = await pool.execute(
        'INSERT INTO users (username, email, password, role, qr_code) VALUES (?, ?, ?, ?, ?)',
        [username, email, hashedPassword, role, qrCode]
      );

      return {
        id: result.insertId,
        username,
        email,
        role,
        qrCode
      };
    } catch (error) {
      throw error;
    }
  }

  static async update(id, { username, email, password, role }) {
    try {
      let updates = [];
      let values = [];

      if (username) {
        updates.push('username = ?');
        values.push(username);
      }

      if (email) {
        updates.push('email = ?');
        values.push(email);
      }

      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        updates.push('password = ?');
        values.push(hashedPassword);
      }

      if (role) {
        updates.push('role = ?');
        values.push(role);
      }

      if (updates.length === 0) {
        return false;
      }

      values.push(id);

      const [result] = await pool.execute(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async list(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const [rows] = await pool.execute(
        `SELECT id, username, email, role, created_at 
         FROM users 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      const [countResult] = await pool.execute(
        'SELECT COUNT(*) as total FROM users'
      );

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      return {
        users: rows,
        page,
        totalPages,
        total
      };
    } catch (error) {
      throw error;
    }
  }

  static async verifyPassword(user, password) {
    try {
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      throw error;
    }
  }

  static async regenerateQRCode(id) {
    try {
      const [user] = await pool.execute(
        'SELECT username FROM users WHERE id = ?',
        [id]
      );

      if (!user[0]) {
        throw new Error('User not found');
      }

      const qrCode = await QRCode.toDataURL(user[0].username);

      await pool.execute(
        'UPDATE users SET qr_code = ? WHERE id = ?',
        [qrCode, id]
      );

      return qrCode;
    } catch (error) {
      throw error;
    }
  }

  static async getQRCode(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT qr_code FROM users WHERE id = ?',
        [id]
      );

      if (!rows[0]) {
        throw new Error('User not found');
      }

      return rows[0].qr_code;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
