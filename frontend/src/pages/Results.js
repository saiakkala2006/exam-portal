import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { attemptAPI, examAPI } from '../services/api';
import './Results.css';

/**
 * Results Page Component
 * Shows exam results for students and attempt details for admins
 */
const Results = ({ user, logout, isAdmin }) => {
  const { attemptId, id } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin && id) {
      loadExamAttempts();
    } else if (attemptId) {
      loadAttempt();
    }
  }, [attemptId, id, isAdmin]);

  const loadAttempt = async () => {
    try {
      const data = await attemptAPI.getAttemptById(attemptId);
      setAttempt(data);
    } catch (err) {
      setError('Failed to load results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadExamAttempts = async () => {
    try {
      const data = await attemptAPI.getExamAttempts(id);
      setAttempts(data);
    } catch (err) {
      setError('Failed to load attempts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPercentage = (score, total) => {
    return ((score / total) * 100).toFixed(1);
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  if (loading) {
    return <div className="loading">Loading results...</div>;
  }

  if (error) {
    return (
      <div>
        <Navbar user={user} logout={logout} title="Results" />
        <div className="container">
          <div className="alert alert-error">{error}</div>
        </div>
      </div>
    );
  }

  // Admin view - all attempts for an exam
  if (isAdmin && attempts.length > 0) {
    return (
      <div className="results-page">
        <Navbar user={user} logout={logout} title="Exam Attempts" />
        <div className="container">
          <div className="results-header">
            <h2>All Attempts</h2>
            <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
              Back to Dashboard
            </button>
          </div>

          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Violations</th>
                  <th>Started At</th>
                  <th>Submitted At</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((att) => {
                  const percentage = getPercentage(att.score, att.totalPoints);
                  return (
                    <tr key={att._id}>
                      <td>{att.studentId?.name || 'N/A'}</td>
                      <td>{att.studentId?.email || 'N/A'}</td>
                      <td>{att.score}/{att.totalPoints}</td>
                      <td>{percentage}%</td>
                      <td>
                        <span className={`grade-badge grade-${getGrade(percentage)}`}>
                          {getGrade(percentage)}
                        </span>
                      </td>
                      <td>
                        <span className={att.violationCount >= 3 ? 'text-danger' : ''}>
                          {att.violationCount}
                        </span>
                      </td>
                      <td>{new Date(att.startedAt).toLocaleString()}</td>
                      <td>
                        {att.submittedAt
                          ? new Date(att.submittedAt).toLocaleString()
                          : '-'}
                      </td>
                      <td>
                        {att.autoSubmitted ? (
                          <span className="auto-submit-badge">
                            Auto ({att.autoSubmitReason})
                          </span>
                        ) : (
                          'Manual'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Student view - single attempt
  if (!attempt) {
    return (
      <div>
        <Navbar user={user} logout={logout} title="Results" />
        <div className="container">
          <div className="alert alert-error">No results found</div>
        </div>
      </div>
    );
  }

  const percentage = getPercentage(attempt.score, attempt.totalPoints);
  const grade = getGrade(percentage);

  return (
    <div className="results-page">
      <Navbar user={user} logout={logout} title="Exam Results" />

      <div className="container">
        <div className="results-header">
          <h2>Your Results</h2>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>

        <div className="results-card">
          <div className="results-summary">
            <div className="score-circle">
              <div className="score-value">{percentage}%</div>
              <div className="score-label">Score</div>
            </div>

            <div className="results-details">
              <div className="detail-item">
                <span className="detail-label">Grade:</span>
                <span className={`grade-badge grade-${grade}`}>{grade}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Points:</span>
                <span className="detail-value">{attempt.score} / {attempt.totalPoints}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Violations:</span>
                <span className={`detail-value ${attempt.violationCount >= 3 ? 'text-danger' : ''}`}>
                  {attempt.violationCount}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Submitted:</span>
                <span className="detail-value">
                  {new Date(attempt.submittedAt).toLocaleString()}
                </span>
              </div>
              {attempt.autoSubmitted && (
                <div className="detail-item">
                  <span className="detail-label">Submission Type:</span>
                  <span className="auto-submit-badge">
                    Auto-submitted ({attempt.autoSubmitReason})
                  </span>
                </div>
              )}
            </div>
          </div>

          {attempt.violations && attempt.violations.length > 0 && (
            <div className="violations-section">
              <h3>Violations Log</h3>
              <div className="violations-list">
                {attempt.violations.map((violation, index) => (
                  <div key={index} className="violation-item">
                    <span className="violation-type">
                      {violation.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="violation-time">
                      {new Date(violation.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3>Performance Summary</h3>
          <div className="performance-bar">
            <div
              className="performance-fill"
              style={{ width: `${percentage}%` }}
            >
              {percentage}%
            </div>
          </div>
          <p className="performance-text">
            {percentage >= 80
              ? 'Excellent performance! 🎉'
              : percentage >= 60
              ? 'Good job! Keep it up! 👍'
              : percentage >= 40
              ? 'You can do better. Keep practicing! 📚'
              : 'Need improvement. Study harder! 💪'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Results;
