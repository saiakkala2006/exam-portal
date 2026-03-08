# Online Examination System

A full-stack web application for conducting online exams with anti-cheating monitoring, built with React, Node.js, Express, and MongoDB.

## 📋 Features

### 👨‍🎓 Student Features
- **Authentication**: Secure login with JWT and bcrypt password hashing
- **Time-bound Exam Access**: Exams available only within start/end time window
- **Fullscreen Mode**: Automatic fullscreen when exam starts
- **Timer**: Live countdown with auto-submit when time expires
- **Question Navigation**: Navigate between questions with Next/Previous
- **Question Types**: 
  - Multiple Choice Questions (MCQ) - Single answer
  - Multiple Select Questions (MSQ) - Multiple answers
- **Anti-Cheating Monitoring**:
  - Tab switch detection
  - Window blur detection
  - Fullscreen exit detection
  - Warning popups on violations
  - Auto-submit after 5 violations
- **Security Restrictions**:
  - Disabled right-click
  - Disabled copy/paste
  - Disabled text selection
- **Results**: View detailed exam results with score and violations

### 👨‍💼 Admin Features
- **Admin Authentication**: Separate admin login
- **Exam Management**:
  - Create exams with title, duration, start/end times
  - Add MCQ and MSQ questions with multiple options
  - Mark correct answers
  - Set points per question
  - Activate/Deactivate exams
  - Delete exams
- **Monitoring Dashboard**:
  - View all student attempts
  - See violations count
  - Check scores and timestamps
  - Track submission type (manual/auto)

## 🧱 Tech Stack

- **Frontend**: React 18 (Functional Components & Hooks)
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcryptjs
- **Styling**: Custom CSS (No UI libraries)

## 📁 Project Structure

```
exam-portal/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── examController.js     # Exam CRUD operations
│   │   └── attemptController.js  # Exam attempts & submissions
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── models/
│   │   ├── User.js               # User schema (Student/Admin)
│   │   ├── Exam.js               # Exam & Question schemas
│   │   └── Attempt.js            # Exam attempt & violations
│   ├── routes/
│   │   ├── auth.js               # Auth routes
│   │   ├── exams.js              # Exam routes
│   │   └── attempts.js           # Attempt routes
│   ├── .env                      # Environment variables
│   ├── server.js                 # Express server
│   └── package.json              # Backend dependencies
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js         # Navigation bar
    │   │   ├── Modal.js          # Reusable modal
    │   │   └── PrivateRoute.js   # Route protection
    │   ├── pages/
    │   │   ├── Login.js          # Login/Register page
    │   │   ├── StudentDashboard.js    # Student dashboard
    │   │   ├── ExamPage.js       # Exam taking interface
    │   │   ├── Results.js        # Results page
    │   │   ├── AdminDashboard.js # Admin dashboard
    │   │   └── CreateExam.js     # Create exam page
    │   ├── services/
    │   │   └── api.js            # API service layer
    │   ├── App.js                # Main app component
    │   ├── index.js              # React entry point
    │   └── *.css                 # Component styles
    └── package.json              # Frontend dependencies
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/exam-portal
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Start backend server:
```bash
npm start
```

Or with nodemon for development:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start React development server:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## 🎯 Usage Guide

### For Admins

1. **Register/Login**:
   - Go to login page
   - Register with role "Admin"
   - Or login with existing admin credentials

2. **Create Exam**:
   - Click "Create New Exam" button
   - Fill in exam details (title, duration, start/end times)
   - Add questions with options
   - Mark correct answers
   - Submit to create

3. **Manage Exams**:
   - View all exams on admin dashboard
   - Toggle exam status (Active/Inactive)
   - Delete exams
   - View student attempts and results

### For Students

1. **Register/Login**:
   - Go to login page
   - Register with role "Student"
   - Or login with existing student credentials

2. **Take Exam**:
   - View available exams on dashboard
   - Click "Start Exam" when ready
   - Exam enters fullscreen mode
   - Answer questions and navigate using Next/Previous
   - Submit when done or wait for auto-submit

3. **View Results**:
   - Check exam history on dashboard
   - View detailed results with score and violations

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Protected Routes**: Role-based access control
- **Input Validation**: Server-side validation
- **Anti-Cheating**: Real-time violation monitoring

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (student/admin),
  timestamps: true
}
```

### Exam Model
```javascript
{
  title: String,
  duration: Number (minutes),
  startTime: Date,
  endTime: Date,
  isActive: Boolean,
  createdBy: ObjectId (User),
  questions: [{
    text: String,
    type: String (mcq/msq),
    options: [String],
    correctAnswers: [Number],
    points: Number
  }],
  timestamps: true
}
```

### Attempt Model
```javascript
{
  studentId: ObjectId (User),
  examId: ObjectId (Exam),
  answers: [{
    questionId: ObjectId,
    selectedAnswers: [Number]
  }],
  violations: [{
    type: String,
    timestamp: Date
  }],
  violationCount: Number,
  score: Number,
  totalPoints: Number,
  startedAt: Date,
  submittedAt: Date,
  isSubmitted: Boolean,
  autoSubmitted: Boolean,
  autoSubmitReason: String,
  timestamps: true
}
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Exams
- `GET /api/exams` - Get all exams
- `GET /api/exams/active` - Get active exams (Student)
- `GET /api/exams/:id` - Get exam by ID
- `POST /api/exams` - Create exam (Admin)
- `PUT /api/exams/:id` - Update exam (Admin)
- `DELETE /api/exams/:id` - Delete exam (Admin)
- `PATCH /api/exams/:id/toggle` - Toggle exam status (Admin)

### Attempts
- `POST /api/attempts/start` - Start exam attempt (Student)
- `POST /api/attempts/:id/submit` - Submit exam (Student)
- `POST /api/attempts/:id/violation` - Record violation (Student)
- `GET /api/attempts/student` - Get student's attempts (Student)
- `GET /api/attempts/exam/:examId` - Get all attempts for exam (Admin)
- `GET /api/attempts/:id` - Get attempt by ID

## 🎨 Features Implemented

✅ JWT-based authentication  
✅ Role-based access control  
✅ Time-bound exam access  
✅ Fullscreen exam mode  
✅ Live timer with auto-submit  
✅ MCQ and MSQ question types  
✅ Question randomization  
✅ Option shuffling  
✅ Anti-cheating monitoring  
✅ Violation tracking and warnings  
✅ Auto-submit on violations/timeout  
✅ Disabled right-click, copy-paste  
✅ Server-side timer enforcement  
✅ Admin exam management  
✅ Results and analytics  
✅ Clean, responsive UI  

## 🙏 Notes

- Questions and options are randomized for each student
- Timer is enforced server-side based on attempt start time
- Violations are tracked in real-time
- Exam auto-submits after 5 violations or when timer ends
- All routes are protected with JWT authentication
- Admin and student routes are separated by role

## 📝 Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/exam-portal
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
```

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check connection string in `.env`
- For MongoDB Atlas, whitelist your IP

**Port Already in Use:**
- Change PORT in backend `.env`
- Update proxy in frontend `package.json`

**CORS Issues:**
- Ensure backend has CORS enabled
- Check proxy setting in frontend

## 📄 License

This project is open source and available for educational purposes.

---

**Built with ❤️ using React, Node.js, Express, and MongoDB**
