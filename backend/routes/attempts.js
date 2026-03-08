const express = require('express');
const router = express.Router();
const {
  startAttempt,
  submitAttempt,
  recordViolation,
  getExamAttempts,
  getMyAttempts,
  getAttemptById
} = require('../controllers/attemptController');
const { protect, admin, student } = require('../middleware/auth');

/**
 * Attempt Routes
 */

// @route   POST /api/attempts/start
// @desc    Start exam attempt
// @access  Private/Student
router.post('/start', protect, student, startAttempt);

// @route   POST /api/attempts/:id/submit
// @desc    Submit exam attempt
// @access  Private/Student
router.post('/:id/submit', protect, student, submitAttempt);

// @route   POST /api/attempts/:id/violation
// @desc    Record violation
// @access  Private/Student
router.post('/:id/violation', protect, student, recordViolation);

// @route   GET /api/attempts/exam/:examId
// @desc    Get all attempts for an exam
// @access  Private/Admin
router.get('/exam/:examId', protect, admin, getExamAttempts);

// @route   GET /api/attempts/student
// @desc    Get student's own attempts
// @access  Private/Student
router.get('/student', protect, student, getMyAttempts);

// @route   GET /api/attempts/:id
// @desc    Get attempt by ID
// @access  Private
router.get('/:id', protect, getAttemptById);

module.exports = router;
