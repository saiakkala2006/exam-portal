const mongoose = require('mongoose');

/**
 * Question Sub-Schema
 * Embedded in Exam model
 * Types: mcq (single answer), msq (multiple answers)
 */
const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['mcq', 'msq'],
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswers: [{
    type: Number,
    required: true
  }],
  points: {
    type: Number,
    default: 1
  }
});

/**
 * Exam Schema
 * Contains exam details and embedded questions
 * Active flag enables/disables exam
 */
const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add exam title'],
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'Please add duration in minutes']
  },
  startTime: {
    type: Date,
    required: [true, 'Please add start time']
  },
  endTime: {
    type: Date,
    required: [true, 'Please add end time']
  },
  questions: [questionSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Validate end time is after start time
examSchema.pre('save', function(next) {
  if (this.endTime <= this.startTime) {
    next(new Error('End time must be after start time'));
  }
  next();
});

module.exports = mongoose.model('Exam', examSchema);
