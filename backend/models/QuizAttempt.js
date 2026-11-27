
const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      maxlength: 2000,
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: (options) =>
          options.length >= 2 &&
          options.length <= 6 &&
          options.every(
            (option) =>
              typeof option === 'string' &&
              option.length <= 1000
          ),
        message: 'Invalid answer options.',
      },
    },

    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },

    selectedAnswer: {
      type: Number,
      default: null,
      min: 0,
      max: 5,
    },
  },
  {
    _id: false,
  }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
      index: true,
    },

    attemptId: {
      type: String,
      required: true,
      maxlength: 150,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    score: {
      type: Number,
      required: true,
      min: 0,
    },

    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },

    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    completedAt: {
      type: Date,
      required: true,
    },

    timeExpired: {
      type: Boolean,
      required: true,
      default: false,
    },

    answers: {
      type: [answerSchema],
      required: true,
      validate: {
        validator: (answers) =>
          answers.length >= 1 &&
          answers.length <= 100,
        message: 'Invalid quiz answers.',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the same student's attempt from being saved twice.
quizAttemptSchema.index(
  {
    userId: 1,
    attemptId: 1,
  },
  {
    unique: true,
  }
);

// Efficiently retrieve a student's newest results.
quizAttemptSchema.index({
  userId: 1,
  completedAt: -1,
});

module.exports = mongoose.model(
  'QuizAttempt',
  quizAttemptSchema
);
