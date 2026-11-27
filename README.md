# ExamX — MCQ Practice Application

A full-stack mobile application designed to help students prepare for examinations through interactive multiple-choice quizzes, performance tracking, and personalized quiz history.

## Overview

ExamX is a university project developed using React Native, Expo, Node.js, Express.js, and MongoDB Atlas.

The application provides a simple and interactive environment where students can create accounts, practice MCQ questions, review their answers, and monitor their performance.

## Key Features

- **User Authentication:** Student registration and secure login using JWT.
- **Interactive MCQ Quizzes:** Multiple-choice questions with a countdown timer.
- **Automatic Scoring:** Instant quiz results after submission.
- **Answer Review:** Review correct and incorrect answers.
- **Quiz History:** Save and retrieve previous quiz attempts.
- **Performance Statistics:** Track quiz performance and progress.
- **Student Profile:** View account information and personal statistics.
- **Secure Logout:** End authenticated sessions.

## Technology Stack

| Component | Technology |
|---|---|
| Mobile Application | React Native, Expo, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Authentication | JSON Web Tokens (JWT) |
| API | REST API |

## Project Structure

```text
ExamX/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── QuizAttempt.js
│   ├── index.js
│   ├── package.json
│   └── .gitignore
│
├── mobile/
│   ├── App.js
│   ├── api.js
│   ├── questions.js
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── HomeScreen.js
│   ├── QuizInstructionsScreen.js
│   ├── QuizScreen.js
│   ├── ResultsScreen.js
│   ├── ProfileScreen.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## Installation and Setup

### Prerequisites

- Node.js and npm
- MongoDB Atlas database
- Expo Go application on a compatible mobile device
- Git

### Backend Setup

Clone the repository:

```bash
git clone https://github.com/iffatsayma123/ExamX.git
cd ExamX/backend
npm install
```

Create a `.env` file inside the `backend` directory and configure the required environment variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
PORT=5000
```

Use a securely generated 128-character hexadecimal value for `JWT_SECRET`.

Start the backend:

```bash
node index.js
```

### Mobile Application Setup

Open another terminal:

```bash
cd ExamX/mobile
npm install
```

Update `API_BASE_URL` in `mobile/api.js` with the backend server's reachable local network address.

Start Expo:

```bash
npx expo start --tunnel
```

Open the application using Expo Go on your mobile device.

## Application Workflow

1. Register or log in to a student account.
2. Access the home dashboard.
3. Read the quiz instructions.
4. Start a timed MCQ quiz.
5. Submit answers and receive results.
6. Review correct and incorrect answers.
7. View quiz history and performance statistics.
8. Access the student profile and log out.

## Security

- JWT-based authentication
- Protected user-specific API endpoints
- Environment variables for sensitive backend credentials
- Secure local token storage on the mobile application
- User-specific quiz history and statistics

**Important:** Never commit `.env` files, database credentials, or authentication secrets to the repository.

## Project Information

**Project Name:** ExamX  
**Project Type:** University Mobile Application Prototype  
**Developer:** Umme Iffat Sayma  
**GitHub:** [iffatsayma123](https://github.com/iffatsayma123)

## Project Status

The core university prototype has been implemented and tested, including authentication, MCQ quizzes, scoring, answer review, quiz history, performance statistics, and student profiles.
