const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user.model');

class AuthController {
  static async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password, role } = req.body;

      // Check if username already exists
      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Check if email already exists
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      // Create user
      const user = await User.create({
        username,
        email,
        password,
        role: role || 'employee'
      });

      // Generate token
      const token = jwt.sign(
        { 
          id: user.id,
          username: user.username,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Remove sensitive data
      delete user.password;

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Error registering user' });
    }
  }

  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;

      // Find user
      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await User.verifyPassword(user, password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign(
        { 
          id: user.id,
          username: user.username,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Remove sensitive data
      delete user.password;

      res.json({
        message: 'Login successful',
        token,
        user
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error during login' });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Error fetching profile' });
    }
  }

  static async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, currentPassword, newPassword } = req.body;

      // Find user
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // If changing password, verify current password
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ message: 'Current password is required' });
        }

        const isValidPassword = await User.verifyPassword(user, currentPassword);
        if (!isValidPassword) {
          return res.status(401).json({ message: 'Current password is incorrect' });
        }
      }

      // Check username uniqueness if changing
      if (username && username !== user.username) {
        const existingUsername = await User.findByUsername(username);
        if (existingUsername) {
          return res.status(400).json({ message: 'Username already exists' });
        }
      }

      // Check email uniqueness if changing
      if (email && email !== user.email) {
        const existingEmail = await User.findByEmail(email);
        if (existingEmail) {
          return res.status(400).json({ message: 'Email already exists' });
        }
      }

      // Update user
      const success = await User.update(req.user.id, {
        username,
        email,
        password: newPassword
      });

      if (!success) {
        return res.status(400).json({ message: 'No changes made' });
      }

      // Get updated user
      const updatedUser = await User.findById(req.user.id);

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Error updating profile' });
    }
  }

  static async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;

      // Find user
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isValidPassword = await User.verifyPassword(user, currentPassword);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Update password
      const success = await User.update(req.user.id, { password: newPassword });

      if (!success) {
        return res.status(400).json({ message: 'Error changing password' });
      }

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Error changing password' });
    }
  }
}

module.exports = AuthController;
