import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { examAPI, attemptAPI } from '../services/api';
import './StudentDashboard.css';

/**
 * Student Dashboard Component
 * Displays available exams and past attempts
 */
const StudentDashboard = ({ user, logout }) => {
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [examsData, attemptsData] = await Promise.all([
        examAPI.getActiveExams(),
        attemptAPI.getMyAttempts()
      ]);
      setExams(examsData);
      setAttempts(attemptsData);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  const viewResults = (attemptId) => {
    navigate(`/results/${attemptId}`);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="student-dashboard">
      <Navbar user={user} logout={logout} title="Student Dashboard" />

      <div className="container">
        {error && <div className="alert alert-error">{error}</div>}

        {/* Available Exams */}
        <section className="dashboard-section">
          <h2>Available Exams</h2>
          {exams.length === 0 ? (
            <div className="card">
              <p>No exams available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-2">
              {exams.map((exam) => {
                const attempted = attempts.find(a => a.examId && a.examId._id === exam._id);
                return (
                  <div key={exam._id} className="exam-card">
                    <h3>{exam.title}</h3>
                    <div className="exam-info">
                      <p><strong>Duration:</strong> {exam.duration} minutes</p>
                      <p><strong>Questions:</strong> {exam.questions.length}</p>
                      <p><strong>Start Time:</strong> {new Date(exam.startTime).toLocaleString()}</p>
                      <p><strong>End Time:</strong> {new Date(exam.endTime).toLocaleString()}</p>
                    </div>
                    {attempted && attempted.isSubmitted ? (
                      <button
                        className="btn btn-secondary btn-block"
                        onClick={() => viewResults(attempted._id)}
                      >
                        View Results
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary btn-block"
                        onClick={() => startExam(exam._id)}
                      >
                        {attempted ? 'Resume Exam' : 'Start Exam'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Past Attempts */}
        <section className="dashboard-section">
          <h2>My Exam History</h2>
          {attempts.length === 0 ? (
            <div className="card">
              <p>No exam attempts yet.</p>
            </div>
          ) : (
            <div className="card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Exam</th>
                    <th>Score</th>
                    <th>Violations</th>
                    <th>Status</th>
                    <th>Submitted At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt) => (
                    <tr key={attempt._id}>
                      <td>{attempt.examId?.title || 'N/A'}</td>
                      <td>
                        {attempt.isSubmitted
                          ? `${attempt.score}/${attempt.totalPoints}`
                          : 'In Progress'}
                      </td>
                      <td>
                        <span className={attempt.violationCount >= 3 ? 'text-danger' : ''}>
                          {attempt.violationCount}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${attempt.isSubmitted ? 'submitted' : 'in-progress'}`}>
                          {attempt.isSubmitted ? 'Submitted' : 'In Progress'}
                        </span>
                      </td>
                      <td>
                        {attempt.submittedAt
                          ? new Date(attempt.submittedAt).toLocaleString()
                          : '-'}
                      </td>
                      <td>
                        {attempt.isSubmitted && (
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => viewResults(attempt._id)}
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;
