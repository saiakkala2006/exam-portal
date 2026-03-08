const express = require('express');
const router = express.Router();
const {
  createExam,
  getExams,
  getActiveExams,
  getExamById,
  updateExam,
  deleteExam,
  toggleExamStatus
} = require('../controllers/examController');
const { protect, admin, student } = require('../middleware/auth');

/**
 * Exam Routes
 */

// @route   POST /api/exams
// @desc    Create exam
// @access  Private/Admin
router.post('/', protect, admin, createExam);

// @route   GET /api/exams
// @desc    Get all exams
// @access  Private
router.get('/', protect, getExams);

// @route   GET /api/exams/active
// @desc    Get active exams (students)
// @access  Private/Student
router.get('/active', protect, student, getActiveExams);

// @route   GET /api/exams/:id
// @desc    Get exam by ID
// @access  Private
router.get('/:id', protect, getExamById);

// @route   PUT /api/exams/:id
// @desc    Update exam
// @access  Private/Admin
router.put('/:id', protect, admin, updateExam);

// @route   DELETE /api/exams/:id
// @desc    Delete exam
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteExam);

// @route   PATCH /api/exams/:id/toggle
// @desc    Toggle exam active status
// @access  Private/Admin
router.patch('/:id/toggle', protect, admin, toggleExamStatus);

module.exports = router;
