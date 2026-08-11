const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sendWelcomeEmail } = require('../utils/emailService');

const generateToken = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  const options = {};
  // If JWT_EXPIRES_IN is set, use it. Otherwise token never expires (lifetime).
  if (process.env.JWT_EXPIRES_IN) {
    options.expiresIn = process.env.JWT_EXPIRES_IN;
  }
  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

// Register buyer or seller
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, storeName, storeDescription } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Only allow buyer or seller registration
    const allowedRoles = ['buyer', 'seller'];
    const userRole = allowedRoles.includes(role) ? role : 'buyer';

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      phone,
      storeName: userRole === 'seller' ? storeName : null,
      storeDescription: userRole === 'seller' ? storeDescription : null,
    });

    const token = generateToken(user);

    // Send Welcome Email asynchronously
    sendWelcomeEmail(user).catch(err => console.error('Failed to send welcome email:', err));

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful!',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin Login
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ where: { email, role: 'superadmin' } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or insufficient privileges.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or insufficient privileges.',
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Admin login successful!',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: { user: req.user.toJSON() },
    });
  } catch (error) {
    next(error);
  }
};
