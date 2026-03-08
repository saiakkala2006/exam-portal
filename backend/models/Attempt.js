const mongoose = require('mongoose');

/**
 * Violation Sub-Schema
 * Tracks anti-cheating violations during exam
 */
const violationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['tab_switch', 'window_blur', 'fullscreen_exit'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

/**
 * Answer Sub-Schema
 * Stores student's answers for each question
 */
const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  selectedAnswers: [{
    type: Number
  }]
});

/**
 * Attempt Schema
 * Records student's exam attempt with answers, violations, and score
 * One attempt per student per exam
 */
const attemptSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  answers: [answerSchema],
  violations: [violationSchema],
  violationCount: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: {
    type: Date
  },
  isSubmitted: {
    type: Boolean,
    default: false
  },
  autoSubmitted: {
    type: Boolean,
    default: false
  },
  autoSubmitReason: {
    type: String,
    enum: ['time_up', 'violations', null],
    default: null
  }
}, {
  timestamps: true
});

// Ensure one attempt per student per exam
attemptSchema.index({ studentId: 1, examId: 1 }, { unique: true });

module.exports = mongoose.model('Attempt', attemptSchema);
