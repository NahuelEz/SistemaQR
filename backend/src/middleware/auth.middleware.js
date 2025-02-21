const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};

const isEmployee = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'employee') {
    return res.status(403).json({ message: 'Employee access required' });
  }

  next();
};

const isAdminOrEmployee = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'employee') {
    return res.status(403).json({ message: 'Invalid role' });
  }

  next();
};

const isResourceOwner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Allow admins to access any resource
  if (req.user.role === 'admin') {
    return next();
  }

  // Check if the user is accessing their own resource
  const resourceId = parseInt(req.params.id);
  if (req.user.id !== resourceId) {
    return res.status(403).json({ message: 'Access denied' });
  }

  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isEmployee,
  isAdminOrEmployee,
  isResourceOwner
};
