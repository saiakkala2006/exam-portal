const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, getAllUsers, resetUserPassword } = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');

/**
 * Authentication Routes
 */

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, getMe);

// @route   GET /api/auth/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/users', protect, admin, getAllUsers);

// @route   PUT /api/auth/reset-password/:userId
// @desc    Reset user password (Admin only)
// @access  Private/Admin
router.put('/reset-password/:userId', protect, admin, resetUserPassword);

module.exports = router;
