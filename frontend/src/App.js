import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import pages
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import ExamPage from './pages/ExamPage';
import AdminDashboard from './pages/AdminDashboard';
import CreateExam from './pages/CreateExam';
import Results from './pages/Results';


// Import components
import PrivateRoute from './components/PrivateRoute';
import { ThemeProvider } from './context/ThemeContext';

/**
 * Main App Component
 * Handles routing and authentication state
 */
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />} />
          
          {/* Student Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute user={user} allowedRoles={['student']}>
              <StudentDashboard user={user} logout={logout} />
            </PrivateRoute>
          } />
          <Route path="/exam/:id" element={
            <PrivateRoute user={user} allowedRoles={['student']}>
              <ExamPage user={user} />
            </PrivateRoute>
          } />
          <Route path="/results/:attemptId" element={
            <PrivateRoute user={user} allowedRoles={['student']}>
              <Results user={user} logout={logout} />
            </PrivateRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <PrivateRoute user={user} allowedRoles={['admin']}>
              <AdminDashboard user={user} logout={logout} />
            </PrivateRoute>
          } />
          <Route path="/admin/create-exam" element={
            <PrivateRoute user={user} allowedRoles={['admin']}>
              <CreateExam user={user} logout={logout} />
            </PrivateRoute>
          } />
          <Route path="/admin/exam/:id/attempts" element={
            <PrivateRoute user={user} allowedRoles={['admin']}>
              <Results user={user} logout={logout} isAdmin={true} />
            </PrivateRoute>
          } />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
