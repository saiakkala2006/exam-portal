const Attempt = require('../models/Attempt');
const Exam = require('../models/Exam');

/**
 * @route   POST /api/attempts/start
 * @desc    Start exam attempt
 * @access  Private/Student
 */
exports.startAttempt = async (req, res) => {
  try {
    const { examId } = req.body;

    // Check if exam exists and is accessible
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const now = new Date();
    if (now < exam.startTime || now > exam.endTime || !exam.isActive) {
      return res.status(403).json({ message: 'Exam not available' });
    }

    // Check if attempt already exists
    let attempt = await Attempt.findOne({
      studentId: req.user._id,
      examId
    });

    if (attempt) {
      if (attempt.isSubmitted) {
        return res.status(400).json({ message: 'Exam already submitted' });
      }
      return res.json(attempt);
    }

    // Calculate total points
    const totalPoints = exam.questions.reduce((sum, q) => sum + (q.points || 1), 0);

    // Create new attempt
    attempt = await Attempt.create({
      studentId: req.user._id,
      examId,
      totalPoints
    });

    res.status(201).json(attempt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   POST /api/attempts/:id/submit
 * @desc    Submit exam attempt
 * @access  Private/Student
 */
exports.submitAttempt = async (req, res) => {
  try {
    const { answers, autoSubmitted, autoSubmitReason } = req.body;

    const attempt = await Attempt.findById(req.params.id);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    // Verify ownership
    if (attempt.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (attempt.isSubmitted) {
      return res.status(400).json({ message: 'Attempt already submitted' });
    }

    // Get exam to calculate score
    const exam = await Exam.findById(attempt.examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Calculate score
    let score = 0;
    const attemptAnswers = [];

    exam.questions.forEach(question => {
      const studentAnswer = answers.find(a => a.questionId === question._id.toString());
      
      if (studentAnswer) {
        attemptAnswers.push({
          questionId: question._id,
          selectedAnswers: studentAnswer.selectedAnswers || []
        });

        // Check if answer is correct
        const correctAnswers = question.correctAnswers.sort();
        const selectedAnswers = (studentAnswer.selectedAnswers || []).sort();

        const isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(selectedAnswers);

        if (isCorrect) {
          score += question.points || 1;
        }
      }
    });

    // Update attempt
    attempt.answers = attemptAnswers;
    attempt.score = score;
    attempt.isSubmitted = true;
    attempt.submittedAt = new Date();
    attempt.autoSubmitted = autoSubmitted || false;
    attempt.autoSubmitReason = autoSubmitReason || null;

    await attempt.save();

    res.json({
      message: 'Exam submitted successfully',
      attempt,
      score,
      totalPoints: attempt.totalPoints
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   POST /api/attempts/:id/violation
 * @desc    Record a violation
 * @access  Private/Student
 */
exports.recordViolation = async (req, res) => {
  try {
    const { type } = req.body;

    const attempt = await Attempt.findById(req.params.id);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    // Verify ownership
    if (attempt.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (attempt.isSubmitted) {
      return res.status(400).json({ message: 'Attempt already submitted' });
    }

    // Add violation
    attempt.violations.push({ type });
    attempt.violationCount = attempt.violations.length;

    await attempt.save();

    res.json({
      violationCount: attempt.violationCount,
      shouldAutoSubmit: attempt.violationCount >= 5
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/attempts/exam/:examId
 * @desc    Get all attempts for an exam (Admin only)
 * @access  Private/Admin
 */
exports.getExamAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({ examId: req.params.examId })
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });

    res.json(attempts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/attempts/student
 * @desc    Get current student's attempts
 * @access  Private/Student
 */
exports.getMyAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({ studentId: req.user._id })
      .populate('examId', 'title duration')
      .sort({ createdAt: -1 });

    res.json(attempts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/attempts/:id
 * @desc    Get attempt by ID
 * @access  Private
 */
exports.getAttemptById = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('examId');

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    // Students can only view their own attempts
    if (req.user.role === 'student' && attempt.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(attempt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
