import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { examAPI } from '../services/api';
import './CreateExam.css';

/**
 * Create Exam Page Component
 * Allows admin to create new exams with questions
 */



const CreateExam = ({ user, logout }) => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Current question being added
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    type: 'mcq',
    options: ['', '', '', ''],
    correctAnswers: [],
    points: 1
  });

  const handleAddOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, '']
    });
  };

  const handleRemoveOption = (index) => {
    if (currentQuestion.options.length <= 2) {
      alert('A question must have at least 2 options');
      return;
    }

    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    const newCorrectAnswers = currentQuestion.correctAnswers
      .filter(ans => ans !== index)
      .map(ans => (ans > index ? ans - 1 : ans));

    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
      correctAnswers: newCorrectAnswers
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions
    });
  };

  const handleCorrectAnswerToggle = (index) => {
    if (currentQuestion.type === 'mcq') {
      // Single answer - replace
      setCurrentQuestion({
        ...currentQuestion,
        correctAnswers: [index]
      });
    } else {
      // Multiple answers - toggle
      const newCorrectAnswers = currentQuestion.correctAnswers.includes(index)
        ? currentQuestion.correctAnswers.filter(i => i !== index)
        : [...currentQuestion.correctAnswers, index];

      setCurrentQuestion({
        ...currentQuestion,
        correctAnswers: newCorrectAnswers
      });
    }
  };

  const handleAddQuestion = () => {
    // Validation
    if (!currentQuestion.text.trim()) {
      alert('Please enter question text');
      return;
    }

    if (currentQuestion.options.some(opt => !opt.trim())) {
      alert('All options must be filled');
      return;
    }

    if (currentQuestion.correctAnswers.length === 0) {
      alert('Please select at least one correct answer');
      return;
    }

    setQuestions([...questions, { ...currentQuestion }]);

    // Reset current question
    setCurrentQuestion({
      text: '',
      type: 'mcq',
      options: ['', '', '', ''],
      correctAnswers: [],
      points: 1
    });
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!title.trim() || !duration || !startTime || !endTime) {
      setError('Please fill all exam details');
      return;
    }

    if (questions.length === 0) {
      setError('Please add at least one question');
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setError('End time must be after start time');
      return;
    }

    setLoading(true);

    try {
      const examData = {
        title,
        duration: parseInt(duration),
        startTime,
        endTime,
        questions
      };

      await examAPI.createExam(examData);
      alert('Exam created successfully!');
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create exam');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-exam-page">
      <Navbar user={user} logout={logout} title="Create Exam" />

      <div className="container">
        <div className="page-header">
          <h2>Create New Exam</h2>
          <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
            Back to Dashboard
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Exam Details */}
          <div className="card">
            <h3>Exam Details</h3>

            <div className="form-group">
              <label>Exam Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Mathematics Final Exam"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Duration (minutes) *</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                  placeholder="e.g., 60"
                  required
                />
              </div>

              <div className="form-group">
                <label>Start Date & Time *</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date & Time *</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Add Question */}
          <div className="card">
            <h3>Add Question</h3>

            <div className="form-group">
              <label>Question Text *</label>
              <textarea
                value={currentQuestion.text}
                onChange={(e) =>
                  setCurrentQuestion({ ...currentQuestion, text: e.target.value })
                }
                rows="3"
                placeholder="Enter your question here..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Question Type *</label>
                <select
                  value={currentQuestion.type}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      type: e.target.value,
                      correctAnswers: []
                    })
                  }
                >
                  <option value="mcq">Multiple Choice (Single Answer)</option>
                  <option value="msq">Multiple Select (Multiple Answers)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Points *</label>
                <input
                  type="number"
                  value={currentQuestion.points}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      points: parseInt(e.target.value)
                    })
                  }
                  min="1"
                />
              </div>
            </div>

            <div className="options-section">
              <label>Options *</label>
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="option-input-row">
                  <input
                    type={currentQuestion.type === 'mcq' ? 'radio' : 'checkbox'}
                    checked={currentQuestion.correctAnswers.includes(index)}
                    onChange={() => handleCorrectAnswerToggle(index)}
                    title="Mark as correct answer"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="option-input"
                  />
                  {currentQuestion.options.length > 2 && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveOption(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddOption}
              >
                + Add Option
              </button>
              <p className="hint">
                {currentQuestion.type === 'mcq'
                  ? 'Select one correct answer'
                  : 'Select all correct answers'}
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddQuestion}
            >
              Add Question to Exam
            </button>
          </div>

          {/* Questions List */}
          {questions.length > 0 && (
            <div className="card">
              <h3>Questions ({questions.length})</h3>
              <div className="questions-list">
                {questions.map((q, index) => (
                  <div key={index} className="question-item">
                    <div className="question-header">
                      <h4>
                        Question {index + 1} ({q.type === 'mcq' ? 'Single' : 'Multiple'}) - {q.points} point(s)
                      </h4>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveQuestion(index)}
                      >
                        Remove
                      </button>
                    </div>
                    <p className="question-text">{q.text}</p>
                    <ul className="options-list">
                      {q.options.map((opt, i) => (
                        <li key={i} className={q.correctAnswers.includes(i) ? 'correct' : ''}>
                          {opt} {q.correctAnswers.includes(i) && '✓'}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="form-actions">
            <button type="submit" className="btn btn-success btn-large" disabled={loading}>
              {loading ? 'Creating Exam...' : 'Create Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExam;
