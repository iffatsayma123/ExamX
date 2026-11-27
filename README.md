# ExamX — Smart MCQ Practice & Performance Tracking Application

**A Full-Stack Mobile Application for Interactive Exam Preparation**

[![React Native](https://img.shields.io/badge/React_Native-Mobile_Application-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-Framework-000020?logo=expo)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=nodedotjs)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-REST_API-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)](https://www.mongodb.com/)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript)
![Project Status](https://img.shields.io/badge/Status-Prototype_Completed-success)

---

## 1. Project Overview

**ExamX** is a full-stack, mobile-based Multiple Choice Question (MCQ) practice application developed as a university software development project.

The application is designed to provide students with a convenient and interactive platform for practicing examination questions, evaluating their knowledge, and monitoring their academic performance.

Traditional MCQ practice methods often lack instant evaluation, structured performance records, and convenient access to previous attempts. ExamX addresses these limitations by combining an interactive mobile interface with a secure backend and cloud-based database.

The system allows students to register, log in, participate in timed MCQ quizzes, receive immediate results, review their answers, and track previous quiz performance.

ExamX uses **React Native with Expo** for the mobile application, **Node.js and Express.js** for backend services, and **MongoDB Atlas** for cloud-based data storage.

### Project Highlights

- Mobile-first examination practice platform
- Full-stack JavaScript development
- Secure student authentication
- Timed MCQ examinations
- Automatic result calculation
- Detailed answer review
- Cloud-based quiz history
- Student-specific performance tracking
- RESTful API integration
- Functional prototype tested on a physical mobile device

---

## 2. Problem Statement

Students often prepare for examinations using printed question banks, handwritten notes, and online resources that do not provide a unified mechanism for evaluating performance.

Several challenges arise from these traditional methods:

1. **Limited performance tracking:** Students may struggle to measure improvement across multiple practice sessions.
2. **Manual result calculation:** Evaluating answers manually is time-consuming and can introduce mistakes.
3. **Lack of structured history:** Previous examination attempts are often not stored systematically.
4. **Difficulty identifying mistakes:** Students may not have a convenient way to revisit incorrect answers.
5. **Fragmented learning experience:** Practice questions, results, and performance records may exist across separate resources.

ExamX aims to address these challenges through a centralized mobile application that integrates examination practice, automated evaluation, and historical performance monitoring.

---

## 3. Project Objectives

### Primary Objective

To design and develop a functional mobile MCQ practice application that enables students to prepare for examinations, evaluate their performance, and maintain personal quiz records.

### Specific Objectives

- Develop a user-friendly mobile interface using React Native.
- Implement student registration and login.
- Secure API access using JSON Web Tokens.
- Create an interactive MCQ examination interface.
- Introduce a countdown timer for quiz sessions.
- Automatically calculate scores after quiz completion.
- Display correct and incorrect answers for review.
- Store quiz attempts in a cloud database.
- Retrieve individual student examination history.
- Present student-specific performance statistics.
- Integrate mobile and backend components through REST APIs.
- Test the complete application workflow on a mobile device.

---

## 4. Core Features

### 4.1 Student Registration

New students can create an account using the registration interface.

The registration process communicates with the backend, which validates the submitted information and creates the student account.

### 4.2 Secure Student Login

Registered students can log in using their account credentials.

The backend authenticates the student and issues a JSON Web Token (JWT) that is used for subsequent authenticated API requests.

### 4.3 Student Dashboard

The home screen serves as the main entry point of the application.

It provides access to the available quiz workflow and student-related information.

### 4.4 Quiz Instructions

Before starting a quiz, students can view the examination instructions.

This screen helps students understand the quiz process before beginning their practice session.

### 4.5 Interactive MCQ Examination

The application provides an interactive interface for answering multiple-choice questions.

Key capabilities include:

- Displaying questions and answer options
- Selecting answers
- Navigating through the quiz
- Managing quiz progress
- Monitoring remaining examination time
- Submitting the completed quiz

### 4.6 Countdown Timer

A countdown timer is integrated into the quiz interface to simulate a time-constrained examination environment.

This encourages students to practice time management while answering questions.

### 4.7 Automatic Result Calculation

After quiz submission, the application evaluates the student's responses and calculates the result.

Students receive immediate feedback on their performance without requiring manual evaluation.

### 4.8 Answer Review

Students can review their submitted answers and compare them with the correct answers.

This functionality helps identify mistakes and supports learning through feedback.

### 4.9 Quiz History

Completed quiz attempts can be saved to MongoDB Atlas through the backend API.

Authenticated students can retrieve their previous attempts, allowing them to revisit earlier performance records.

### 4.10 Performance Statistics

ExamX provides student-specific performance information based on stored quiz attempts.

This allows students to monitor their quiz activity and review their results over time.

### 4.11 Student Profile

The profile screen displays student account information and relevant personal statistics retrieved through authenticated backend requests.

### 4.12 Logout

Students can log out of the application, ending their locally authenticated session.

---

## 5. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Mobile frontend | React Native | Cross-platform mobile interface |
| Development framework | Expo | Mobile development and testing |
| Programming language | JavaScript | Frontend and backend logic |
| Backend runtime | Node.js | Server-side JavaScript execution |
| Web framework | Express.js | REST API development |
| Database | MongoDB Atlas | Cloud-based data storage |
| Data modeling | Mongoose | MongoDB schemas and models |
| Authentication | JWT | Authenticated API access |
| Mobile token storage | Expo SecureStore | Secure local token storage |
| Package management | npm | Dependency installation |
| Version control | Git | Source code version management |
| Source hosting | GitHub | Repository hosting and collaboration |

---

## 6. System Architecture

ExamX follows a client-server architecture with three main layers:

1. **Presentation Layer:** React Native mobile application.
2. **Application Layer:** Node.js and Express.js backend.
3. **Data Layer:** MongoDB Atlas database.

### Architecture Diagram

```text
                 ┌───────────────────────────┐
                 │       STUDENT / USER      │
                 └─────────────┬─────────────┘
                               │
                               ▼
                 ┌───────────────────────────┐
                 │   REACT NATIVE MOBILE APP │
                 │                           │
                 │  • Registration / Login   │
                 │  • Home Dashboard         │
                 │  • Quiz Interface         │
                 │  • Result & Review        │
                 │  • Profile & Statistics   │
                 └─────────────┬─────────────┘
                               │
                         HTTP / JSON
                               │
                               ▼
                 ┌───────────────────────────┐
                 │   NODE.JS + EXPRESS API   │
                 │                           │
                 │  • Authentication         │
                 │  • JWT Verification       │
                 │  • Quiz Attempt Handling  │
                 │  • User Data Retrieval    │
                 └─────────────┬─────────────┘
                               │
                           Mongoose
                               │
                               ▼
                 ┌───────────────────────────┐
                 │       MONGODB ATLAS       │
                 │                           │
                 │  • Student Accounts       │
                 │  • Quiz Attempts          │
                 │  • Performance Records    │
                 └───────────────────────────┘
```

### Communication Flow

1. A student performs an action through the mobile application.
2. The mobile application sends an HTTP request to the backend.
3. Protected requests include a JWT for authentication.
4. The backend validates the request and performs the necessary operation.
5. MongoDB Atlas stores or retrieves the required data.
6. The backend returns a JSON response.
7. The mobile application displays the resulting information.

---

## 7. Project Directory Structure

```text
ExamX/
│
├── backend/
│   │
│   ├── models/
│   │   ├── User.js
│   │   └── QuizAttempt.js
│   │
│   ├── index.js
│   ├── package.json
│   ├── package-lock.json
│   └── .gitignore
│
├── mobile/
│   │
│   ├── assets/
│   │   ├── icon.png
│   │   ├── splash-icon.png
│   │   └── ...
│   │
│   ├── App.js
│   ├── index.js
│   ├── api.js
│   ├── questions.js
│   │
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── HomeScreen.js
│   ├── QuizInstructionsScreen.js
│   ├── QuizScreen.js
│   ├── ResultsScreen.js
│   ├── ProfileScreen.js
│   │
│   ├── app.json
│   ├── package.json
│   ├── package-lock.json
│   └── .gitignore
│
├── .gitignore
└── README.md
```

### Important Files

| File | Responsibility |
|---|---|
| `backend/index.js` | Express server, API endpoints, authentication and backend logic |
| `backend/models/User.js` | Student account data model |
| `backend/models/QuizAttempt.js` | Quiz attempt data model |
| `mobile/App.js` | Main application and screen flow |
| `mobile/api.js` | Backend communication and authentication-related API operations |
| `mobile/questions.js` | Quiz question data |
| `mobile/LoginScreen.js` | Student login interface |
| `mobile/RegisterScreen.js` | Student registration interface |
| `mobile/HomeScreen.js` | Main dashboard |
| `mobile/QuizInstructionsScreen.js` | Pre-quiz instructions |
| `mobile/QuizScreen.js` | Interactive MCQ quiz |
| `mobile/ResultsScreen.js` | Quiz results and answer review |
| `mobile/ProfileScreen.js` | Student profile and statistics |

---

## 8. Database Design

ExamX uses MongoDB Atlas as its cloud database and Mongoose for defining and managing application data models.

### User Model

The `User` model represents registered student accounts and stores the information needed to identify and authenticate students.

### QuizAttempt Model

The `QuizAttempt` model represents completed quiz sessions and supports the application's quiz history and performance tracking functionality.

### Data Relationships

```text
          STUDENT ACCOUNT
                 │
                 │ One student
                 │
                 ▼
          QUIZ ATTEMPTS
                 │
                 ├── Attempt 1
                 ├── Attempt 2
                 ├── Attempt 3
                 └── ...
```

Each stored quiz attempt is associated with its respective student account, enabling user-specific retrieval of quiz history and statistics.

---

## 9. REST API Overview

The backend exposes RESTful endpoints used by the mobile application.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Check backend availability |
| POST | `/api/register` | Register a student account |
| POST | `/api/login` | Authenticate a student |
| GET | `/api/auth/me` | Retrieve the authenticated student |
| POST | `/api/quiz-attempts` | Save a completed quiz attempt |
| GET | `/api/quiz-attempts` | Retrieve the student's quiz history |

### Authentication Flow

```text
Student enters credentials
           │
           ▼
Mobile sends login request
           │
           ▼
Backend verifies credentials
           │
           ▼
Backend generates JWT
           │
           ▼
Mobile stores authentication token
           │
           ▼
Authenticated API requests
           │
           ▼
Backend verifies JWT
           │
           ▼
Authorized data access
```

Protected API endpoints use the authenticated student's identity to access the appropriate records.

---

## 10. Installation and Setup

### 10.1 Prerequisites

Before running ExamX, ensure the following tools are available:

- Node.js and npm
- Git
- A MongoDB Atlas database
- Expo Go on a compatible smartphone
- A computer and mobile device with network access

### 10.2 Clone the Repository

```bash
git clone https://github.com/iffatsayma123/ExamX.git
cd ExamX
```

### 10.3 Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` folder.

Add the following configuration:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_128_character_hexadecimal_secret
PORT=5000
```

Generate a secure 64-byte hexadecimal JWT secret using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the generated value into `JWT_SECRET`.

**Never publish your actual MongoDB connection string or JWT secret.**

Start the backend:

```bash
node index.js
```

The backend should connect to MongoDB Atlas and begin listening on the configured port.

### 10.4 Mobile Application Setup

Open another terminal and navigate to the mobile folder from the repository root:

```bash
cd mobile
```

Install the required dependencies:

```bash
npm install
```

### 10.5 Configure the Backend API Address

Open:

`mobile/api.js`

Locate the `API_BASE_URL` configuration.

Set it to an address reachable from your smartphone:

```javascript
const API_BASE_URL = 'http://YOUR_COMPUTER_LAN_IP:5000';
```

For example, if your computer's local IP address is `192.168.1.10`, use:

```javascript
const API_BASE_URL = 'http://192.168.1.10:5000';
```

The IP address above is only an example.

To find your computer's local IP address on Windows, run:

```powershell
ipconfig
```

Look for the IPv4 address of your active network adapter.

**Important:** The backend must be running, and your smartphone must be able to reach the computer hosting it. Expo's tunnel mode does not automatically expose your local Express backend.

### 10.6 Run the Mobile Application

From the `mobile` directory:

```bash
npx expo start --tunnel
```

Then:

1. Install Expo Go on your smartphone.
2. Start the Expo development server.
3. Open the application using the Expo Go connection method.
4. Ensure the backend is running.
5. Register or log in to begin using ExamX.

---

## 11. Application Workflow

The student journey follows these stages:

```text
          LAUNCH APPLICATION
                  │
                  ▼
           LOGIN / REGISTER
                  │
                  ▼
            HOME DASHBOARD
                  │
                  ▼
           QUIZ INSTRUCTIONS
                  │
                  ▼
              START QUIZ
                  │
                  ▼
            ANSWER QUESTIONS
                  │
                  ▼
             SUBMIT QUIZ
                  │
                  ▼
            RESULT DISPLAY
                  │
                  ▼
             ANSWER REVIEW
                  │
                  ▼
          SAVE QUIZ ATTEMPT
                  │
                  ▼
        HISTORY & STATISTICS
```

Students can also access their profile and log out of the application.

---

## 12. Security Implementation

Security is an important part of the ExamX backend and authentication workflow.

### JWT Authentication

The application uses JSON Web Tokens to authenticate students when accessing protected backend endpoints.

### Password Protection

The backend implements password hashing for account credentials rather than relying on plain-text password storage.

### Protected API Endpoints

Authenticated endpoints validate the supplied JWT before returning student-specific information.

### Student Data Isolation

Quiz history and student-specific data are accessed using the authenticated user's identity.

### Environment Variables

Sensitive backend configuration values are stored in a local `.env` file rather than hardcoded into publicly committed source files.

### Mobile Token Storage

The mobile application uses Expo SecureStore for local authentication token storage.

### GitHub Repository Protection

The `.gitignore` configuration excludes sensitive and unnecessary files, including:

- `.env` files
- `node_modules`
- Local Git metadata
- Temporary development files
- Build artifacts

The application is a university prototype. Additional security reviews, production infrastructure, and operational controls would be required before deploying it as a public service.

---

## 13. Testing and Validation

The prototype was tested through its primary student workflows using a physical mobile device.

### Functional Testing

| Test Case | Expected Result | Status |
|---|---|---|
| Student registration | New student account created | Completed |
| Student login | Valid credentials authenticate successfully | Completed |
| Authenticated session | Protected application access works | Completed |
| Quiz instructions | Instructions displayed before starting | Completed |
| Quiz interaction | Student can select and submit answers | Completed |
| Quiz timer | Countdown operates during the quiz | Completed |
| Result calculation | Score displayed after completion | Completed |
| Answer review | Student can review submitted answers | Completed |
| Quiz history | Completed attempts saved and retrieved | Completed |
| Performance statistics | Student-specific results displayed | Completed |
| Student profile | Account information displayed | Completed |
| Logout | Student session ends | Completed |

These results describe functional prototype testing and do not represent a comprehensive production security or performance audit.

---

## 14. Current Limitations

ExamX was developed as a university prototype, so its current implementation has several limitations.

### Local Backend Hosting

The backend currently runs in a local development environment rather than on a publicly deployed production server.

### Network Dependency

The mobile application requires access to the backend for authentication and cloud-based quiz history.

### Local API Configuration

The mobile API address is configured for the development network and may need to be updated when running on another computer or network.

### Limited Question Management

The current quiz questions are maintained within the mobile application's question data file rather than through a complete administrative content management system.

### No Offline Quiz Backup

Automatic offline backup and later synchronization of unsaved quiz attempts are not included in the current prototype.

### Prototype Deployment

The application is primarily intended for development, demonstration, and academic evaluation rather than public app-store distribution.

---

## 15. Future Enhancements

Possible improvements for future versions include:

- **Dynamic Question Bank:** Manage questions through the backend database.
- **Subject-Based Quizzes:** Organize questions by subject, topic, and difficulty.
- **Administrative Dashboard:** Allow authorized administrators to manage quiz content.
- **Advanced Analytics:** Provide performance trends and detailed learning insights.
- **Personalized Recommendations:** Recommend practice topics based on previous results.
- **Question Randomization:** Generate different question sets for each attempt.
- **Offline Support:** Enable local quiz attempt storage and synchronization.
- **Cloud Deployment:** Deploy the backend to a publicly accessible server.
- **Push Notifications:** Notify students about practice schedules and reminders.
- **Enhanced UI/UX:** Improve accessibility, navigation, and visual presentation.
- **Automated Testing:** Add unit, integration, and end-to-end tests.
- **Production Security:** Introduce deployment-grade monitoring, rate limiting, and other operational safeguards.

These are proposed improvements and are not part of the completed university prototype.

---

## 16. Learning Outcomes

Developing ExamX provided practical experience in:

- Mobile application development using React Native
- Expo-based development and device testing
- JavaScript programming across frontend and backend
- RESTful API design and integration
- Node.js and Express.js server development
- MongoDB Atlas database integration
- Mongoose data modeling
- JWT-based authentication
- Managing asynchronous API communication
- Handling user-specific application data
- Git version control and GitHub repository management
- Full-stack debugging and application testing

The project demonstrates the integration of multiple technologies into a functional mobile application.

---

## 17. Project Information

| Field | Details |
|---|---|
| Project Name | ExamX |
| Project Category | Educational Mobile Application |
| Project Type | University Software Development Prototype |
| Platform | React Native / Expo |
| Programming Language | JavaScript |
| Backend | Node.js / Express.js |
| Database | MongoDB Atlas |
| Developer | Umme Iffat Sayma |
| GitHub Username | [iffatsayma123](https://github.com/iffatsayma123) |
| Repository | [ExamX](https://github.com/iffatsayma123/ExamX) |
| Development Status | Core prototype completed |

---

## 18. Project Status

**ExamX University Prototype — Core Implementation Completed**

The primary features have been implemented and functionally tested, including:

- Student registration and authentication
- Timed MCQ practice
- Automatic result calculation
- Answer review
- MongoDB-backed quiz attempt history
- Student performance statistics
- Profile management and logout

The project source code is maintained in this GitHub repository.

---

## 19. Acknowledgements

This project was developed as part of university-level practical learning in mobile application development, backend programming, database integration, and full-stack software engineering.

The project uses open-source technologies and development tools, including React Native, Expo, Node.js, Express.js, MongoDB, and Git.

---

## 20. Developer

**Umme Iffat Sayma**

Computer Science and Engineering Student

East Delta University, Chattogram, Bangladesh

GitHub: [github.com/iffatsayma123](https://github.com/iffatsayma123)

---

**ExamX — Practice, Evaluate, Improve.**
