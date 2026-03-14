# Project Structure

This document outlines the folder and file structure of the Exam Portal project.

```
exam portal/
│
├── README.md                          # Project documentation
├── SETUP.md                           # Setup instructions
│
├── backend/                           # Backend server (Node.js/Express)
│   ├── package.json                   # Backend dependencies
│   ├── server.js                      # Main server entry point
│   │
│   ├── config/
│   │   └── db.js                      # Database configuration
│   │
│   ├── controllers/
│   │   ├── attemptController.js       # Exam attempt logic
│   │   ├── authController.js          # Authentication logic
│   │   └── examController.js          # Exam management logic
│   │
│   ├── middleware/
│   │   └── auth.js                    # Authentication middleware
│   │
│   ├── models/
│   │   ├── Attempt.js                 # Attempt data model
│   │   ├── Exam.js                    # Exam data model
│   │   └── User.js                    # User data model
│   │
│   └── routes/
│       ├── attempts.js                # Attempt routes
│       ├── auth.js                    # Authentication routes
│       └── exams.js                   # Exam routes
│
└── frontend/                          # Frontend application (React)
    ├── package.json                   # Frontend dependencies
    │
    ├── public/
    │   └── index.html                 # Main HTML template
    │
    └── src/
        ├── App.css                    # Main app styles
        ├── App.js                     # Main app component
        ├── index.css                  # Global styles
        ├── index.js                   # React entry point
        │
        ├── components/
        │   ├── Modal.css              # Modal component styles
        │   ├── Modal.js               # Modal component
        │   ├── Navbar.css             # Navbar component styles
        │   ├── Navbar.js              # Navbar component
        │   └── PrivateRoute.js        # Protected route component
        │
        ├── pages/
        │   ├── AdminDashboard.css     # Admin dashboard styles
        │   ├── AdminDashboard.js      # Admin dashboard page
        │   ├── CreateExam.css         # Create exam page styles
        │   ├── CreateExam.js          # Create exam page
        │   ├── ExamPage.css           # Exam taking page styles
        │   ├── ExamPage.js            # Exam taking page
        │   ├── Login.css              # Login page styles
        │   ├── Login.js               # Login page
        │   ├── Results.css            # Results page styles
        │   ├── Results.js             # Results page
        │   ├── StudentDashboard.css   # Student dashboard styles
        │   └── StudentDashboard.js    # Student dashboard page
        │
        └── services/
            └── api.js                 # API service for backend calls
```

## Directory Descriptions

### Backend (`/backend`)
- **config/**: Database and configuration files
- **controllers/**: Business logic for handling requests
- **middleware/**: Custom middleware functions (authentication, etc.)
- **models/**: Database schema definitions
- **routes/**: API endpoint definitions

### Frontend (`/frontend`)
- **public/**: Static files and HTML template
- **src/components/**: Reusable React components
- **src/pages/**: Page-level React components
- **src/services/**: API integration and external services


