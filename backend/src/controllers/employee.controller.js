const User = require('../models/user.model');
const Menu = require('../models/menu.model');
const { validationResult } = require('express-validator');
const QRCode = require('qrcode');

class EmployeeController {
  static async listEmployees(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await User.list(parseInt(page), parseInt(limit));
      
      res.json({
        employees: result.users.filter(user => user.role === 'employee'),
        total: result.total,
        page: result.page,
        totalPages: result.totalPages
      });
    } catch (error) {
      console.error('List employees error:', error);
      res.status(500).json({ message: 'Error fetching employees' });
    }
  }

  static async getEmployee(req, res) {
    try {
      const { id } = req.params;
      const employee = await User.findById(id);

      if (!employee || employee.role !== 'employee') {
        return res.status(404).json({ message: 'Employee not found' });
      }

      res.json(employee);
    } catch (error) {
      console.error('Get employee error:', error);
      res.status(500).json({ message: 'Error fetching employee' });
    }
  }

  static async updateEmployee(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { username, email } = req.body;

      // Check if employee exists
      const employee = await User.findById(id);
      if (!employee || employee.role !== 'employee') {
        return res.status(404).json({ message: 'Employee not found' });
      }

      // Update employee
      const success = await User.update(id, {
        username,
        email,
        role: 'employee' // Ensure role remains as employee
      });

      if (!success) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      // Generate new QR code if username changed
      if (username && username !== employee.username) {
        const qrCode = await QRCode.toDataURL(username);
        await User.update(id, { 
          username, 
          email: employee.email, 
          role: 'employee',
          qr_code: qrCode 
        });
      }

      res.json({ message: 'Employee updated successfully' });
    } catch (error) {
      console.error('Update employee error:', error);
      res.status(500).json({ message: 'Error updating employee' });
    }
  }

  static async deleteEmployee(req, res) {
    try {
      const { id } = req.params;

      // Check if employee exists
      const employee = await User.findById(id);
      if (!employee || employee.role !== 'employee') {
        return res.status(404).json({ message: 'Employee not found' });
      }

      const success = await User.delete(id);
      if (!success) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
      console.error('Delete employee error:', error);
      res.status(500).json({ message: 'Error deleting employee' });
    }
  }

  static async getEmployeeQRCode(req, res) {
    try {
      const { id } = req.params;
      const employee = await User.findById(id);

      if (!employee || employee.role !== 'employee') {
        return res.status(404).json({ message: 'Employee not found' });
      }

      res.json({ qrCode: employee.qr_code });
    } catch (error) {
      console.error('Get QR code error:', error);
      res.status(500).json({ message: 'Error fetching QR code' });
    }
  }

  static async regenerateQRCode(req, res) {
    try {
      const { id } = req.params;
      const employee = await User.findById(id);

      if (!employee || employee.role !== 'employee') {
        return res.status(404).json({ message: 'Employee not found' });
      }

      const qrCode = await QRCode.toDataURL(employee.username);
      await User.update(id, {
        username: employee.username,
        email: employee.email,
        role: 'employee',
        qr_code: qrCode
      });

      res.json({ 
        message: 'QR code regenerated successfully',
        qrCode 
      });
    } catch (error) {
      console.error('Regenerate QR code error:', error);
      res.status(500).json({ message: 'Error regenerating QR code' });
    }
  }

  static async getEmployeeMenuSelections(req, res) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const employee = await User.findById(id);
      if (!employee || employee.role !== 'employee') {
        return res.status(404).json({ message: 'Employee not found' });
      }

      const selections = await Menu.getMenuSelections(id);
      res.json(selections);
    } catch (error) {
      console.error('Get menu selections error:', error);
      res.status(500).json({ message: 'Error fetching menu selections' });
    }
  }

  static async getEmployeeMealRegistrations(req, res) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const employee = await User.findById(id);
      if (!employee || employee.role !== 'employee') {
        return res.status(404).json({ message: 'Employee not found' });
      }

      const MealRegistration = require('../models/meal-registration.model');
      const registrations = await MealRegistration.getUserRegistrations(id, startDate, endDate);
      res.json(registrations);
    } catch (error) {
      console.error('Get meal registrations error:', error);
      res.status(500).json({ message: 'Error fetching meal registrations' });
    }
  }
}

module.exports = EmployeeController;
