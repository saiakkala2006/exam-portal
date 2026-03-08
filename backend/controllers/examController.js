const Exam = require('../models/Exam');
const Attempt = require('../models/Attempt');

/**
 * @route   POST /api/exams
 * @desc    Create a new exam (Admin only)
 * @access  Private/Admin
 */
exports.createExam = async (req, res) => {
  try {
    const { title, duration, startTime, endTime, questions } = req.body;

    // Validate required fields
    if (!title || !duration || !startTime || !endTime || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Create exam
    const exam = await Exam.create({
      title,
      duration,
      startTime,
      endTime,
      questions,
      createdBy: req.user._id
    });

    res.status(201).json(exam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @route   GET /api/exams
 * @desc    Get all exams (Admin sees all, Students see active only)
 * @access  Private
 */
exports.getExams = async (req, res) => {
  try {
    let query = {};
    let selectFields = '';

    // Students only see active exams within time window
    if (req.user.role === 'student') {
      const now = new Date();
      query = {
        isActive: true,
        startTime: { $lte: now },
        endTime: { $gte: now }
      };
      selectFields = '-questions.correctAnswers'; // Don't send correct answers to students
    }

    const exams = await Exam.find(query)
      .select(selectFields)
      .sort({ startTime: -1 });

    res.json(exams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/exams/active
 * @desc    Get active exams for students
 * @access  Private/Student
 */
exports.getActiveExams = async (req, res) => {
  try {
    const now = new Date();

    const exams = await Exam.find({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now }
    }).select('-questions.correctAnswers');

    res.json(exams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/exams/:id
 * @desc    Get exam by ID with validation
 * @access  Private
 */
exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // For students, validate time window
    if (req.user.role === 'student') {
      const now = new Date();

      if (!exam.isActive) {
        return res.status(403).json({ message: 'Exam is not active' });
      }

      if (now < exam.startTime) {
        return res.status(403).json({ 
          message: 'Exam has not started yet',
          startTime: exam.startTime
        });
      }

      if (now > exam.endTime) {
        return res.status(403).json({ message: 'Exam has ended' });
      }

      // Check if student already attempted
      const existingAttempt = await Attempt.findOne({
        studentId: req.user._id,
        examId: exam._id
      });

      if (existingAttempt && existingAttempt.isSubmitted) {
        return res.status(403).json({ 
          message: 'You have already submitted this exam',
          attempt: existingAttempt
        });
      }

      // Shuffle questions and options for students
      const shuffledExam = JSON.parse(JSON.stringify(exam));
      shuffledExam.questions = shuffleArray(shuffledExam.questions);
      shuffledExam.questions.forEach(q => {
        q.options = shuffleArray(q.options);
        delete q.correctAnswers; // Never send correct answers to students
      });

      return res.json(shuffledExam);
    }

    // Admin gets full exam details
    res.json(exam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   PUT /api/exams/:id
 * @desc    Update exam (Admin only)
 * @access  Private/Admin
 */
exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedExam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @route   DELETE /api/exams/:id
 * @desc    Delete exam (Admin only)
 * @access  Private/Admin
 */
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    await exam.deleteOne();
    res.json({ message: 'Exam removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   PATCH /api/exams/:id/toggle
 * @desc    Toggle exam active status (Admin only)
 * @access  Private/Admin
 */
exports.toggleExamStatus = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    exam.isActive = !exam.isActive;
    await exam.save();

    res.json({ message: 'Exam status updated', exam });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Utility function to shuffle array
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
