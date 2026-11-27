
require('dotenv').config();

const dns = require('node:dns');
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const QuizAttempt = require('./models/QuizAttempt');

const scryptAsync = promisify(crypto.scrypt);

// Preserve the working MongoDB Atlas DNS configuration.
dns.setServers(['9.9.9.9']);

const app = express();

app.use(cors());

// Quiz attempts include question and answer snapshots.
// Keep the request size bounded.
app.use(express.json({ limit: '128kb' }));

const JWT_EXPIRATION = '24h';

app.get('/', (req, res) => {
  res.json({
    message: 'ExamX backend is running successfully!',
  });
});

app.get('/health', (req, res) => {
  res.json({
    server: 'running',
    database:
      mongoose.connection.readyState === 1
        ? 'connected'
        : 'disconnected',
  });
});

// Hash a password using a unique random salt.
async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derivedKey = await scryptAsync(password, salt, 64);

  return `scrypt:${salt.toString('hex')}:${derivedKey.toString('hex')}`;
}

// Verify a password against its stored hash.
async function verifyPassword(password, storedHash) {
  if (typeof storedHash !== 'string') {
    return false;
  }

  const parts = storedHash.split(':');

  if (parts.length !== 3 || parts[0] !== 'scrypt') {
    return false;
  }

  const saltHex = parts[1];
  const hashHex = parts[2];

  if (
    !/^[0-9a-f]{32}$/i.test(saltHex) ||
    !/^[0-9a-f]{128}$/i.test(hashHex)
  ) {
    return false;
  }

  const salt = Buffer.from(saltHex, 'hex');
  const storedKey = Buffer.from(hashHex, 'hex');

  const derivedKey = await scryptAsync(password, salt, 64);

  return crypto.timingSafeEqual(storedKey, derivedKey);
}

// Create a signed authentication token.
function createAuthToken(user) {
  return jwt.sign(
    {},
    process.env.JWT_SECRET,
    {
      algorithm: 'HS256',
      subject: user._id.toString(),
      issuer: 'examx-backend',
      audience: 'examx-mobile',
      expiresIn: JWT_EXPIRATION,
    }
  );
}

// Verify a JWT and identify the authenticated student.
async function requireAuth(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (
      typeof authorization !== 'string' ||
      !/^Bearer \S+$/i.test(authorization)
    ) {
      return res.status(401).json({
        message: 'Authentication required. Please log in.',
      });
    }

    const token = authorization.replace(/^Bearer /i, '');

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET,
      {
        algorithms: ['HS256'],
        issuer: 'examx-backend',
        audience: 'examx-mobile',
      }
    );

    if (
      !payload.sub ||
      !mongoose.isValidObjectId(payload.sub)
    ) {
      return res.status(401).json({
        message: 'Invalid authentication token.',
      });
    }

    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({
        message: 'This account is no longer available.',
      });
    }

    req.authUser = user;

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Your session has expired. Please log in again.',
      });
    }

    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'NotBeforeError'
    ) {
      return res.status(401).json({
        message: 'Invalid authentication token.',
      });
    }

    console.error('Authentication failed:', error.message);

    return res.status(500).json({
      message: 'Unable to verify authentication.',
    });
  }
}

// Register a new student.
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body || {};

    if (
      typeof fullName !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      return res.status(400).json({
        message: 'Please provide valid registration information.',
      });
    }

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      return res.status(400).json({
        message: 'Please fill in all fields.',
      });
    }

    if (cleanName.length > 100 || cleanEmail.length > 254) {
      return res.status(400).json({
        message: 'Name or email is too long.',
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        message: 'Please enter a valid email address.',
      });
    }

    if (
      password.length < 8 ||
      Buffer.byteLength(password, 'utf8') > 1024
    ) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters and not excessively long.',
      });
    }

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'An account with this email already exists.',
      });
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      fullName: cleanName,
      email: cleanEmail,
      passwordHash,
    });

    return res.status(201).json({
      message: 'Account created successfully!',
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'An account with this email already exists.',
      });
    }

    console.error('Registration failed:', error.message);

    return res.status(500).json({
      message: 'Unable to create account. Please try again.',
    });
  }
});

// Verify credentials and issue a signed authentication token.
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: 'Please enter your email and password.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (
      cleanEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
      Buffer.byteLength(password, 'utf8') > 1024
    ) {
      return res.status(400).json({
        message: 'Please provide valid login information.',
      });
    }

    const user = await User.findOne({
      email: cleanEmail,
    }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    const isValidPassword = await verifyPassword(
      password,
      user.passwordHash
    );

    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    const token = createAuthToken(user);

    return res.status(200).json({
      message: 'Login successful!',
      token,
      tokenType: 'Bearer',
      expiresIn: 86400,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login failed:', error.message);

    return res.status(500).json({
      message: 'Unable to log in. Please try again.',
    });
  }
});

// Return the currently authenticated student's profile.
app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = req.authUser;

  return res.status(200).json({
    user: {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
    },
  });
});

// Validate a submitted quiz attempt.
// The mobile app currently supplies question snapshots and answer keys,
// so this checks consistency rather than independently proving correctness.
function validateQuizAttempt(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return 'Invalid quiz attempt data.';
  }

  const {
    id,
    subject,
    score,
    totalQuestions,
    percentage,
    completedAt,
    timeExpired,
    answers,
  } = data;

  if (
    typeof id !== 'string' ||
    !id.trim() ||
    id.length > 150
  ) {
    return 'Invalid quiz attempt ID.';
  }

  if (
    typeof subject !== 'string' ||
    !subject.trim() ||
    subject.length > 100
  ) {
    return 'Invalid quiz subject.';
  }

  if (
    !Array.isArray(answers) ||
    answers.length < 1 ||
    answers.length > 100
  ) {
    return 'Invalid quiz answers.';
  }

  if (
    !Number.isInteger(totalQuestions) ||
    totalQuestions !== answers.length
  ) {
    return 'Invalid total question count.';
  }

  if (
    !Number.isInteger(score) ||
    score < 0 ||
    score > totalQuestions
  ) {
    return 'Invalid quiz score.';
  }

  if (
    !Number.isInteger(percentage) ||
    percentage < 0 ||
    percentage > 100
  ) {
    return 'Invalid quiz percentage.';
  }

  if (typeof timeExpired !== 'boolean') {
    return 'Invalid quiz completion status.';
  }

  if (
    typeof completedAt !== 'string' ||
    !Number.isFinite(Date.parse(completedAt))
  ) {
    return 'Invalid quiz completion date.';
  }

  const completionTime = new Date(completedAt).getTime();

  if (
    completionTime > Date.now() + 5 * 60 * 1000 ||
    completionTime < Date.now() - 365 * 24 * 60 * 60 * 1000
  ) {
    return 'Quiz completion date is outside the allowed range.';
  }

  let calculatedScore = 0;

  for (const answer of answers) {
    if (
      !answer ||
      typeof answer !== 'object' ||
      Array.isArray(answer)
    ) {
      return 'Invalid question answer.';
    }

    const {
      question,
      options,
      correctAnswer,
      selectedAnswer,
    } = answer;

    if (
      typeof question !== 'string' ||
      !question.trim() ||
      question.length > 2000
    ) {
      return 'Invalid question text.';
    }

    if (
      !Array.isArray(options) ||
      options.length < 2 ||
      options.length > 6 ||
      options.some(
        (option) =>
          typeof option !== 'string' ||
          !option.trim() ||
          option.length > 1000
      )
    ) {
      return 'Invalid question options.';
    }

    if (
      !Number.isInteger(correctAnswer) ||
      correctAnswer < 0 ||
      correctAnswer >= options.length
    ) {
      return 'Invalid correct answer.';
    }

    if (
      selectedAnswer !== null &&
      (
        !Number.isInteger(selectedAnswer) ||
        selectedAnswer < 0 ||
        selectedAnswer >= options.length
      )
    ) {
      return 'Invalid selected answer.';
    }

    if (selectedAnswer === correctAnswer) {
      calculatedScore += 1;
    }
  }

  if (calculatedScore !== score) {
    return 'Quiz score does not match submitted answers.';
  }

  const calculatedPercentage = Math.round(
    (calculatedScore / totalQuestions) * 100
  );

  if (calculatedPercentage !== percentage) {
    return 'Quiz percentage does not match submitted answers.';
  }

  return null;
}

// Save an authenticated student's completed quiz.
app.post('/api/quiz-attempts', requireAuth, async (req, res) => {
  try {
    const validationError = validateQuizAttempt(req.body);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const {
      id,
      subject,
      score,
      totalQuestions,
      percentage,
      completedAt,
      timeExpired,
      answers,
    } = req.body;

    const userId = req.authUser._id;

    // Upsert prevents duplicate records when the same attempt
    // is submitted again after a network retry.
    const attempt = await QuizAttempt.findOneAndUpdate(
      {
        userId,
        attemptId: id,
      },
      {
        $setOnInsert: {
          userId,
          attemptId: id,
          subject: subject.trim(),
          score,
          totalQuestions,
          percentage,
          completedAt: new Date(completedAt),
          timeExpired,
          answers,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      message: 'Quiz result saved successfully!',
      attempt: {
        id: attempt.attemptId,
        subject: attempt.subject,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        percentage: attempt.percentage,
        completedAt: attempt.completedAt,
        timeExpired: attempt.timeExpired,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      // A concurrent duplicate submission may race the upsert.
      const existing = await QuizAttempt.findOne({
        userId: req.authUser._id,
        attemptId: req.body?.id,
      });

      if (existing) {
        return res.status(200).json({
          message: 'Quiz result already saved.',
          attempt: {
            id: existing.attemptId,
            subject: existing.subject,
            score: existing.score,
            totalQuestions: existing.totalQuestions,
            percentage: existing.percentage,
            completedAt: existing.completedAt,
            timeExpired: existing.timeExpired,
          },
        });
      }
    }

    console.error('Saving quiz attempt failed:', error.message);

    return res.status(500).json({
      message: 'Unable to save quiz result. Please try again.',
    });
  }
});

// Retrieve only the authenticated student's quiz history.
app.get('/api/quiz-attempts', requireAuth, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      userId: req.authUser._id,
    })
      .sort({
        completedAt: -1,
        _id: -1,
      })
      .limit(100)
      .lean();

    const results = attempts.map((attempt) => ({
      id: attempt.attemptId,
      subject: attempt.subject,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentage: attempt.percentage,
      completedAt: attempt.completedAt,
      timeExpired: attempt.timeExpired,
      answers: attempt.answers,
    }));

    return res.status(200).json({
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('Loading quiz attempts failed:', error.message);

    return res.status(500).json({
      message: 'Unable to load quiz results. Please try again.',
    });
  }
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  if (!process.env.MONGODB_URI) {
    console.error(
      'MongoDB connection is missing. Check your .env file.'
    );
    process.exit(1);
  }

  if (
    !process.env.JWT_SECRET ||
    !/^[0-9a-f]{128}$/i.test(process.env.JWT_SECRET)
  ) {
    console.error(
      'JWT_SECRET is missing or invalid. Configure a 128-character hexadecimal secret in .env.'
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    await User.init();
    await QuizAttempt.init();

    console.log('MongoDB connected successfully!');

    app.listen(PORT, () => {
      console.log(`ExamX backend is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed.');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

startServer();
