# Quick Setup Guide

## Prerequisites
- Node.js installed
- MongoDB installed (or MongoDB Atlas account)

## Setup Steps

### 1. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file with:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/exam-portal
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
```

Start backend:
```bash
npm start
```

### 2. Frontend Setup
Open new terminal:
```bash
cd frontend
npm install
npm start
```

## Default Credentials

Create accounts through the registration page:
- **Admin**: Register with role "Admin"
- **Student**: Register with role "Student"

## Testing Flow

1. **Admin**:
   - Register as admin
   - Create an exam
   - Set start/end times (use current time for testing)
   - Add questions with correct answers
   - Mark exam as Active

2. **Student**:
   - Register as student
   - View available exams
   - Start exam (enters fullscreen)
   - Try switching tabs (violation warning)
   - Answer questions
   - Submit or wait for auto-submit

3. **View Results**:
   - Students can view their scores
   - Admins can view all attempts

## Important Notes

- MongoDB must be running before starting backend
- Frontend runs on port 3000
- Backend runs on port 5000
- Exams only appear if within start/end time window
- Violations are tracked in real-time
- 5 violations = auto-submit

## Common Issues

**Backend won't start:**
- Check if MongoDB is running
- Verify .env file exists and is correct

**Frontend shows connection error:**
- Ensure backend is running on port 5000
- Check proxy setting in frontend package.json

**Exam not appearing:**
- Check exam start/end times
- Ensure exam is marked as Active
- Verify you're logged in as student

## Quick Test Data

For testing, use these exam times:
- **Start Time**: Current date/time
- **End Time**: 2 hours from now
- **Duration**: 30 minutes

This ensures the exam is immediately available!
