import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examAPI, attemptAPI } from '../services/api';
import Modal from '../components/Modal';
import './ExamPage.css';

/**
 * Exam Page Component
 * Handles exam taking with anti-cheating monitoring
 */
const ExamPage = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [violations, setViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load exam and start attempt
  useEffect(() => {
    loadExam();
  }, [id]);

  // Enter fullscreen on mount
  useEffect(() => {
    enterFullscreen();
    return () => {
      exitFullscreen();
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (exam && attempt && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAutoSubmit('time_up');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [exam, attempt, timeLeft]);

  // Anti-cheating monitoring
  useEffect(() => {
    // Detect tab/window visibility change
    const handleVisibilityChange = () => {
      if (document.hidden && attempt && !attempt.isSubmitted) {
        recordViolation('tab_switch');
      }
    };

    // Detect window blur
    const handleBlur = () => {
      if (attempt && !attempt.isSubmitted) {
        recordViolation('window_blur');
      }
    };

    // Detect fullscreen exit
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = document.fullscreenElement !== null;
      setIsFullscreen(isCurrentlyFullscreen);

      if (!isCurrentlyFullscreen && attempt && !attempt.isSubmitted) {
        recordViolation('fullscreen_exit');
      }
    };

    // Disable right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // Disable copy
    const handleCopy = (e) => {
      e.preventDefault();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
    };
  }, [attempt]);

  const loadExam = async () => {
    try {
      const examData = await examAPI.getExamById(id);
      setExam(examData);

      // Start or resume attempt
      const attemptData = await attemptAPI.startAttempt(id);
      setAttempt(attemptData);

      // Calculate time left
      const startTime = new Date(attemptData.startedAt).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const duration = examData.duration * 60;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      setViolations(attemptData.violationCount);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load exam');
    } finally {
      setLoading(false);
    }
  };

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => console.log(err));
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.log(err));
    }
  };

  const recordViolation = async (type) => {
    if (!attempt || attempt.isSubmitted) return;

    try {
      const result = await attemptAPI.recordViolation(attempt._id, type);
      setViolations(result.violationCount);

      // Show warning
      setWarningMessage(`Warning! ${type.replace('_', ' ')} detected. Violations: ${result.violationCount}/5`);
      setShowWarning(true);

      // Auto-submit if limit reached
      if (result.shouldAutoSubmit) {
        handleAutoSubmit('violations');
      }
    } catch (err) {
      console.error('Failed to record violation:', err);
    }
  };

  const handleAnswer = (questionId, optionIndex) => {
    const question = exam.questions[currentQuestion];

    if (question.type === 'mcq') {
      // Single answer
      setAnswers({
        ...answers,
        [questionId]: [optionIndex]
      });
    } else {
      // Multiple answers
      const currentAnswers = answers[questionId] || [];
      const newAnswers = currentAnswers.includes(optionIndex)
        ? currentAnswers.filter(i => i !== optionIndex)
        : [...currentAnswers, optionIndex];

      setAnswers({
        ...answers,
        [questionId]: newAnswers
      });
    }
  };

  const handleNext = () => {
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!window.confirm('Are you sure you want to submit the exam?')) {
      return;
    }

    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedAnswers]) => ({
        questionId,
        selectedAnswers
      }));

      const result = await attemptAPI.submitAttempt(attempt._id, formattedAnswers);
      navigate(`/results/${attempt._id}`);
    } catch (err) {
      setError('Failed to submit exam');
      console.error(err);
    }
  };

  const handleAutoSubmit = async (reason) => {
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedAnswers]) => ({
        questionId,
        selectedAnswers
      }));

      await attemptAPI.submitAttempt(attempt._id, formattedAnswers, true, reason);
      alert(`Exam auto-submitted due to: ${reason.replace('_', ' ')}`);
      navigate(`/results/${attempt._id}`);
    } catch (err) {
      console.error('Failed to auto-submit:', err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="loading">Loading exam...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-error">{error}</div>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!exam || !attempt) {
    return <div className="loading">Loading...</div>;
  }

  const question = exam.questions[currentQuestion];
  const selectedAnswers = answers[question._id] || [];

  return (
    <div className="exam-page no-select">
      {/* Warning Modal */}
      <Modal
        show={showWarning}
        onClose={() => setShowWarning(false)}
        title="⚠️ Warning"
        actions={
          <button className="btn btn-danger" onClick={() => setShowWarning(false)}>
            Understood
          </button>
        }
      >
        <p>{warningMessage}</p>
      </Modal>

      {/* Exam Header */}
      <div className="exam-header">
        <h2>{exam.title}</h2>
        <div className="exam-meta">
          <div className="timer">
            <span className={timeLeft < 300 ? 'timer-warning' : ''}>
              ⏰ {formatTime(timeLeft)}
            </span>
          </div>
          <div className="violations">
            <span className={violations >= 3 ? 'text-danger' : ''}>
              ⚠️ Violations: {violations}/5
            </span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="exam-content">
        <div className="question-header">
          <h3>Question {currentQuestion + 1} of {exam.questions.length}</h3>
          <span className="question-type">
            {question.type === 'mcq' ? 'Single Answer' : 'Multiple Answers'}
          </span>
        </div>

        <div className="question-text">
          {question.text}
        </div>

        <div className="options">
          {question.options.map((option, index) => (
            <div
              key={index}
              className={`option ${selectedAnswers.includes(index) ? 'selected' : ''}`}
              onClick={() => handleAnswer(question._id, index)}
            >
              <input
                type={question.type === 'mcq' ? 'radio' : 'checkbox'}
                checked={selectedAnswers.includes(index)}
                onChange={() => {}}
              />
              <label>{option}</label>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="navigation">
          <button
            className="btn btn-secondary"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </button>

          <div className="question-indicators">
            {exam.questions.map((_, index) => (
              <span
                key={index}
                className={`indicator ${index === currentQuestion ? 'active' : ''} ${
                  answers[exam.questions[index]._id] ? 'answered' : ''
                }`}
                onClick={() => setCurrentQuestion(index)}
              >
                {index + 1}
              </span>
            ))}
          </div>

          {currentQuestion < exam.questions.length - 1 ? (
            <button className="btn btn-primary" onClick={handleNext}>
              Next →
            </button>
          ) : (
            <button className="btn btn-success" onClick={handleSubmit}>
              Submit Exam
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
