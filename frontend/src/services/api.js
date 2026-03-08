import axios from 'axios';

const API_URL = '/api';

/**
 * API Service
 * Handles all HTTP requests to the backend
 */

// Set auth token for all requests
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Initialize auth token from localStorage
const userInfo = localStorage.getItem('userInfo');
if (userInfo) {
  const { token } = JSON.parse(userInfo);
  setAuthToken(token);
}

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
    localStorage.setItem('userInfo', JSON.stringify(data));
    setAuthToken(data.token);
    return data;
  },

  register: async (name, email, password, role = 'student') => {
    const { data } = await axios.post(`${API_URL}/auth/register`, { name, email, password, role });
    localStorage.setItem('userInfo', JSON.stringify(data));
    setAuthToken(data.token);
    return data;
  },

  logout: () => {
    localStorage.removeItem('userInfo');
    setAuthToken(null);
  },

  getAllUsers: async () => {
    const { data } = await axios.get(`${API_URL}/auth/users`);
    return data;
  },

  resetUserPassword: async (userId, newPassword) => {
    const { data } = await axios.put(`${API_URL}/auth/reset-password/${userId}`, { newPassword });
    return data;
  }
};

// Exam API
export const examAPI = {
  getActiveExams: async () => {
    const { data } = await axios.get(`${API_URL}/exams/active`);
    return data;
  },

  getAllExams: async () => {
    const { data } = await axios.get(`${API_URL}/exams`);
    return data;
  },

  getExamById: async (id) => {
    const { data } = await axios.get(`${API_URL}/exams/${id}`);
    return data;
  },

  createExam: async (examData) => {
    const { data } = await axios.post(`${API_URL}/exams`, examData);
    return data;
  },

  updateExam: async (id, examData) => {
    const { data } = await axios.put(`${API_URL}/exams/${id}`, examData);
    return data;
  },

  deleteExam: async (id) => {
    const { data } = await axios.delete(`${API_URL}/exams/${id}`);
    return data;
  },

  toggleExamStatus: async (id) => {
    const { data } = await axios.patch(`${API_URL}/exams/${id}/toggle`);
    return data;
  }
};

// Attempt API
export const attemptAPI = {
  startAttempt: async (examId) => {
    const { data } = await axios.post(`${API_URL}/attempts/start`, { examId });
    return data;
  },

  submitAttempt: async (attemptId, answers, autoSubmitted = false, autoSubmitReason = null) => {
    const { data } = await axios.post(`${API_URL}/attempts/${attemptId}/submit`, {
      answers,
      autoSubmitted,
      autoSubmitReason
    });
    return data;
  },

  recordViolation: async (attemptId, type) => {
    const { data } = await axios.post(`${API_URL}/attempts/${attemptId}/violation`, { type });
    return data;
  },

  getMyAttempts: async () => {
    const { data } = await axios.get(`${API_URL}/attempts/student`);
    return data;
  },

  getExamAttempts: async (examId) => {
    const { data } = await axios.get(`${API_URL}/attempts/exam/${examId}`);
    return data;
  },

  getAttemptById: async (attemptId) => {
    const { data } = await axios.get(`${API_URL}/attempts/${attemptId}`);
    return data;
  }
};

export default { authAPI, examAPI, attemptAPI };
