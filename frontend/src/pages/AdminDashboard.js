import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { examAPI, authAPI } from '../services/api';
import jsPDF from 'jspdf';
import Modal from '../components/Modal';
import './AdminDashboard.css';

/**
 * Admin Dashboard Component
 * Allows admin to manage exams
 */
const AdminDashboard = ({ user, logout }) => {
  const [exams, setExams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('exams'); // 'exams' or 'users'
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadExams();
    loadUsers();
  }, []);

  const loadExams = async () => {
    try {
      const data = await examAPI.getAllExams();
      setExams(data);
    } catch (err) {
      setError('Failed to load exams');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await authAPI.getAllUsers();
      console.log('Users loaded:', data);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
      console.error('Error details:', err.response?.data);
    }
  };

  const handleToggleStatus = async (examId) => {
    try {
      await examAPI.toggleExamStatus(examId);
      loadExams();
    } catch (err) {
      alert('Failed to update exam status');
      console.error(err);
    }
  };

  const handleDelete = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) {
      return;
    }

    try {
      await examAPI.deleteExam(examId);
      loadExams();
    } catch (err) {
      alert('Failed to delete exam');
      console.error(err);
    }
  };

  const viewAttempts = (examId) => {
    navigate(`/admin/exam/${examId}/attempts`);
  };

  const openResetPasswordModal = (userToReset) => {
    console.log('Opening reset modal for user:', userToReset);
    setSelectedUser(userToReset);
    setNewPassword('');
    setResetSuccess(null);
    setShowResetModal(true);
    console.log('showResetModal set to true');
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      const result = await authAPI.resetUserPassword(selectedUser._id, newPassword);
      setResetSuccess(result);
      // Keep modal open to show the temporary password
    } catch (err) {
      alert('Failed to reset password');
      console.error(err);
    }
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setSelectedUser(null);
    setNewPassword('');
    setResetSuccess(null);
  };

  const downloadExamPDF = (exam) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const lineHeight = 7;
      let yPos = margin;

      // Helper function to add new page if needed
      const checkPageBreak = (requiredSpace) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      // Helper function to wrap text
      const addWrappedText = (text, x, y, maxWidth, fontSize = 10) => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text || '', maxWidth);
        lines.forEach((line, index) => {
          checkPageBreak(lineHeight);
          doc.text(line, x, y + (index * lineHeight));
        });
        return lines.length * lineHeight;
      };

      // Title
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text(exam.title || 'Exam', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Exam Details
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Duration: ${exam.duration || 0} minutes`, margin, yPos);
      yPos += lineHeight;
      doc.text(`Total Questions: ${exam.questions?.length || 0}`, margin, yPos);
      yPos += lineHeight;
      doc.text(`Start Time: ${new Date(exam.startTime).toLocaleString()}`, margin, yPos);
      yPos += lineHeight;
      doc.text(`End Time: ${new Date(exam.endTime).toLocaleString()}`, margin, yPos);
      yPos += lineHeight + 5;

      // Separator line
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      // Questions
      if (exam.questions && Array.isArray(exam.questions)) {
        exam.questions.forEach((question, index) => {
          checkPageBreak(50);

          // Question Number and Text
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          const questionType = question.type ? question.type.toUpperCase() : 'MCQ';
          const questionPoints = question.points || 0;
          const questionHeader = `Question ${index + 1} (${questionPoints} points) - ${questionType}`;
          doc.text(questionHeader, margin, yPos);
          yPos += lineHeight + 2;

          // Question Text
          doc.setFontSize(11);
          doc.setFont(undefined, 'normal');
          const questionTextHeight = addWrappedText(question.text || '', margin, yPos, pageWidth - 2 * margin, 11);
          yPos += questionTextHeight + 3;

          // Options
          doc.setFontSize(10);
          const options = question.options || [];
          const correctAnswers = question.correctAnswers || [];
          
          options.forEach((option, optIndex) => {
            checkPageBreak(lineHeight + 2);
            const isCorrect = correctAnswers.includes(optIndex);
            
            if (isCorrect) {
              doc.setFont(undefined, 'bold');
              doc.setTextColor(0, 128, 0); // Green color for correct answers
            } else {
              doc.setFont(undefined, 'normal');
              doc.setTextColor(0, 0, 0); // Black color
            }
            
            const optionText = `   ${String.fromCharCode(65 + optIndex)}. ${option}${isCorrect ? ' [CORRECT ANSWER]' : ''}`;
            const optionHeight = addWrappedText(optionText, margin, yPos, pageWidth - 2 * margin, 10);
            yPos += optionHeight + 2;
          });

          // Reset text color
          doc.setTextColor(0, 0, 0);

          // Correct Answer Summary
          doc.setFontSize(10);
          doc.setFont(undefined, 'bold');
          const correctAnswersText = correctAnswers
            .map(idx => String.fromCharCode(65 + idx))
            .join(', ');
          doc.text(`Correct Answer(s): ${correctAnswersText || 'N/A'}`, margin, yPos);
          yPos += lineHeight + 8;

          // Separator line between questions
          if (index < exam.questions.length - 1) {
            checkPageBreak(5);
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 8;
          }
        });
      }

      // Save the PDF
      const fileName = `${(exam.title || 'Exam').replace(/[^a-z0-9]/gi, '_')}_Questions_Answers.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <Navbar user={user} logout={logout} title="Admin Dashboard" />

      <div className="container">
        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'exams' ? 'active' : ''}`}
            onClick={() => setActiveTab('exams')}
          >
            Manage Exams
          </button>
          <button
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Manage Users
          </button>
        </div>

        {/* Exams Tab */}
        {activeTab === 'exams' && (
          <>
            <div className="dashboard-header">
              <h2>Manage Exams</h2>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/admin/create-exam')}
              >
                + Create New Exam
              </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {exams.length === 0 ? (
              <div className="card">
                <p>No exams created yet. Create your first exam to get started!</p>
              </div>
            ) : (
              <div className="exams-list">
                {exams.map((exam) => (
                  <div key={exam._id} className="exam-item">
                    <div className="exam-item-header">
                      <h3>{exam.title}</h3>
                      <span className={`status-badge ${exam.isActive ? 'active' : 'inactive'}`}>
                        {exam.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="exam-item-details">
                      <div className="detail-row">
                        <span className="label">Duration:</span>
                        <span>{exam.duration} minutes</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Questions:</span>
                        <span>{exam.questions.length}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Start Time:</span>
                        <span>{new Date(exam.startTime).toLocaleString()}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">End Time:</span>
                        <span>{new Date(exam.endTime).toLocaleString()}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Created:</span>
                        <span>{new Date(exam.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="exam-item-actions">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => viewAttempts(exam._id)}
                      >
                        View Attempts
                      </button>
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => downloadExamPDF(exam)}
                      >
                        Download PDF
                      </button>
                      <button
                        className={`btn btn-sm ${exam.isActive ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleToggleStatus(exam._id)}
                      >
                        {exam.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(exam._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
            <div className="dashboard-header">
              <h2>Manage Users</h2>
            </div>

            {users.length === 0 ? (
              <div className="card">
                <p>No users found.</p>
              </div>
            ) : (
              <div className="users-list">
                <div className="users-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userItem) => (
                        <tr key={userItem._id}>
                          <td>{userItem.name}</td>
                          <td>{userItem.email}</td>
                          <td>
                            <span className={`role-badge ${userItem.role}`}>
                              {userItem.role}
                            </span>
                          </td>
                          <td>{new Date(userItem.createdAt).toLocaleDateString()}</td>
                          <td>
                            {userItem.role === 'student' && (
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() => openResetPasswordModal(userItem)}
                              >
                                Reset Password
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <Modal show={true} onClose={closeResetModal}>
          <h2>Reset Password</h2>
          <p><strong>User:</strong> {selectedUser?.name} ({selectedUser?.email})</p>
          
          {!resetSuccess ? (
            <>
              <div className="form-group">
                <label>New Temporary Password</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  className="form-control"
                />
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={closeResetModal}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleResetPassword}>
                  Reset Password
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="alert alert-success">
                <p>✅ Password reset successfully!</p>
                <p><strong>User Email:</strong> {resetSuccess.email}</p>
                <p><strong>Temporary Password:</strong> <code>{resetSuccess.temporaryPassword}</code></p>
                <p className="note">⚠️ Please share this password securely with the student. They can use it to log in.</p>
              </div>
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={closeResetModal}>
                  Close
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
};

export default AdminDashboard;
