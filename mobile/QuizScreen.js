
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  AppState,
  BackHandler,
  Platform,
} from 'react-native';

import { saveQuizAttempt } from './api';
import questionsBySubject from './questions';

const QUIZ_DURATION = 5 * 60;

export default function QuizScreen({ onBack, subject }) {
  const questions = questionsBySubject[subject] || [];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
  const [timeExpired, setTimeExpired] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const deadlineRef = useRef(
    Date.now() + QUIZ_DURATION * 1000
  );

  const finishedRef = useRef(false);
  const answersRef = useRef([]);
  const currentQuestionRef = useRef(0);
  const selectedAnswerRef = useRef(null);

  const pendingAttemptRef = useRef(null);
  const savingRef = useRef(false);
  const saveSucceededRef = useRef(false);
  const onBackRef = useRef(onBack);

  onBackRef.current = onBack;

  const question = questions[currentQuestion];

  // Save the completed quiz to MongoDB.
  // Retrying uses the same attempt ID to prevent duplicates.
  const submitPendingAttempt = async () => {
    const attempt = pendingAttemptRef.current;

    if (
      !attempt ||
      savingRef.current ||
      saveSucceededRef.current
    ) {
      return;
    }

    savingRef.current = true;

    setSaveStatus('Saving result to your account...');

    try {
      await saveQuizAttempt(attempt);

      saveSucceededRef.current = true;
      pendingAttemptRef.current = null;

      setSaveStatus('Result saved to your account');
    } catch (error) {
      console.error(
        'Could not save quiz result:',
        error
      );

      setSaveStatus(
        'Could not save result. Check your connection and tap Retry Save.'
      );
    } finally {
      savingRef.current = false;
    }
  };

  // Calculate and prepare a completed quiz attempt.
  const saveQuizResult = (finalAnswers, expired) => {
    const score = questions.reduce(
      (total, item, index) => {
        return (
          total +
          (finalAnswers[index] === item.correctAnswer
            ? 1
            : 0)
        );
      },
      0
    );

    const completedAt = new Date().toISOString();

    const result = {
      id:
        completedAt +
        '-' +
        Math.random().toString(36).slice(2),

      subject: subject || 'General Quiz',
      score,
      totalQuestions: questions.length,

      percentage: Math.round(
        (score / questions.length) * 100
      ),

      completedAt,
      timeExpired: expired,

      answers: questions.map((item, index) => ({
        question: item.question,
        options: item.options,
        correctAnswer: item.correctAnswer,
        selectedAnswer: finalAnswers[index] ?? null,
      })),
    };

    pendingAttemptRef.current = result;
    saveSucceededRef.current = false;

    void submitPendingAttempt();
  };

  // Warn before leaving an unsaved result.
  const confirmLeaveResult = (leaveAction) => {
    if (savingRef.current) {
      Alert.alert(
        'Saving Result',
        'Please wait for the save to finish.'
      );
      return;
    }

    if (
      pendingAttemptRef.current &&
      !saveSucceededRef.current
    ) {
      Alert.alert(
        'Result Not Saved',
        'Your result has not been saved to your account. Leaving now will discard this unsaved result. Try Retry Save first.',
        [
          {
            text: 'Stay',
            style: 'cancel',
          },
          {
            text: 'Leave Anyway',
            style: 'destructive',
            onPress: leaveAction,
          },
        ]
      );
      return;
    }

    leaveAction();
  };

  // Finish the quiz once.
  const finishQuiz = (expired = false) => {
    if (
      finishedRef.current ||
      questions.length === 0
    ) {
      return;
    }

    finishedRef.current = true;

    const finalAnswers = [...answersRef.current];

    if (selectedAnswerRef.current !== null) {
      finalAnswers[currentQuestionRef.current] =
        selectedAnswerRef.current;
    }

    answersRef.current = finalAnswers;

    setAnswers(finalAnswers);
    setTimeExpired(expired);
    setFinished(true);

    if (expired) {
      setTimeLeft(0);
    }

    saveQuizResult(finalAnswers, expired);
  };

  // Calculate remaining quiz time.
  const checkTime = () => {
    if (
      finishedRef.current ||
      questions.length === 0
    ) {
      return;
    }

    const remaining = Math.max(
      0,
      Math.ceil(
        (deadlineRef.current - Date.now()) / 1000
      )
    );

    setTimeLeft(remaining);

    if (remaining === 0) {
      finishQuiz(true);
    }
  };

  // Handle leaving an unfinished quiz.
  const handleExitQuiz = () => {
    if (
      finishedRef.current ||
      questions.length === 0
    ) {
      confirmLeaveResult(() => {
        onBackRef.current?.();
      });
      return;
    }

    if (Date.now() >= deadlineRef.current) {
      finishQuiz(true);
      return;
    }

    Alert.alert(
      'Leave Quiz?',
      'Your quiz is not finished. If you leave now, your current answers will be lost.',
      [
        {
          text: 'Stay in Quiz',
          style: 'cancel',
        },
        {
          text: 'Leave Quiz',
          style: 'destructive',
          onPress: () => {
            if (finishedRef.current) {
              return;
            }

            if (Date.now() >= deadlineRef.current) {
              finishQuiz(true);
              return;
            }

            onBackRef.current?.();
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Timer and foreground handling.
  useEffect(() => {
    const interval = setInterval(checkTime, 1000);

    const subscription = AppState.addEventListener(
      'change',
      (state) => {
        if (state === 'active') {
          checkTime();
        }
      }
    );

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  // Android hardware Back button.
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (finishedRef.current) {
          confirmLeaveResult(() => {
            onBackRef.current?.();
          });
        } else {
          handleExitQuiz();
        }

        return true;
      }
    );

    return () => subscription.remove();
  }, []);

  // Select an answer.
  const selectAnswer = (index) => {
    if (finishedRef.current) {
      return;
    }

    if (Date.now() >= deadlineRef.current) {
      finishQuiz(true);
      return;
    }

    selectedAnswerRef.current = index;
    setSelectedAnswer(index);

    const updatedAnswers = [...answersRef.current];

    updatedAnswers[currentQuestionRef.current] = index;

    answersRef.current = updatedAnswers;
    setAnswers(updatedAnswers);
  };

  // Navigate between questions.
  const goToQuestion = (questionIndex) => {
    if (finishedRef.current) {
      return;
    }

    if (Date.now() >= deadlineRef.current) {
      finishQuiz(true);
      return;
    }

    if (
      questionIndex < 0 ||
      questionIndex >= questions.length
    ) {
      return;
    }

    currentQuestionRef.current = questionIndex;

    const previousAnswer =
      answersRef.current[questionIndex] ?? null;

    selectedAnswerRef.current = previousAnswer;

    setCurrentQuestion(questionIndex);
    setSelectedAnswer(previousAnswer);
  };

  const handlePrevious = () => {
    goToQuestion(currentQuestionRef.current - 1);
  };

  // Confirm final submission.
  const confirmFinishQuiz = () => {
    Alert.alert(
      'Finish Quiz?',
      'Are you sure you want to submit your answers? You cannot change them after submission.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Submit Quiz',
          onPress: () => {
            if (finishedRef.current) {
              return;
            }

            if (Date.now() >= deadlineRef.current) {
              finishQuiz(true);
            } else {
              finishQuiz(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Next question or finish.
  const handleNext = () => {
    if (finishedRef.current) {
      return;
    }

    if (Date.now() >= deadlineRef.current) {
      finishQuiz(true);
      return;
    }

    if (selectedAnswerRef.current === null) {
      Alert.alert(
        'Select an Answer',
        'Please choose an option first.'
      );
      return;
    }

    if (
      currentQuestionRef.current ===
      questions.length - 1
    ) {
      const allAnswered = questions.every(
        (_, index) =>
          answersRef.current[index] !== undefined &&
          answersRef.current[index] !== null
      );

      if (!allAnswered) {
        Alert.alert(
          'Incomplete Quiz',
          'Please answer every question before submitting.'
        );
        return;
      }

      confirmFinishQuiz();
    } else {
      goToQuestion(currentQuestionRef.current + 1);
    }
  };

  // Display the final score.
  const calculateScore = () => {
    return questions.reduce(
      (score, item, index) => {
        return (
          score +
          (answers[index] === item.correctAnswer
            ? 1
            : 0)
        );
      },
      0
    );
  };

  // Restart the quiz.
  const restartQuiz = () => {
    confirmLeaveResult(() => {
      pendingAttemptRef.current = null;
      saveSucceededRef.current = false;
      finishedRef.current = false;

      answersRef.current = [];
      currentQuestionRef.current = 0;
      selectedAnswerRef.current = null;

      deadlineRef.current =
        Date.now() + QUIZ_DURATION * 1000;

      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setAnswers([]);
      setFinished(false);
      setTimeExpired(false);
      setTimeLeft(QUIZ_DURATION);
      setShowReview(false);
      setSaveStatus('');
    });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return (
      String(minutes).padStart(2, '0') +
      ':' +
      String(remainingSeconds).padStart(2, '0')
    );
  };

  // No questions available.
  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.title}>
            No Questions Available
          </Text>

          <Text style={styles.reviewSubtitle}>
            There are no questions available for{' '}
            {subject || 'this subject'} yet.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => onBackRef.current?.()}
          >
            <Text style={styles.buttonText}>
              Back to Home
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Answer Review Screen.
  if (finished && showReview) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowReview(false)}
          >
            <Text style={styles.backText}>
              ← Back to Results
            </Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            Answer Review
          </Text>

          <Text style={styles.reviewSubtitle}>
            Check your answers and learn from your mistakes.
          </Text>

          {questions.map((item, questionIndex) => {
            const studentAnswer = answers[questionIndex];

            const isUnanswered =
              studentAnswer === undefined ||
              studentAnswer === null;

            const isCorrect =
              !isUnanswered &&
              studentAnswer === item.correctAnswer;

            return (
              <View
                key={item.id || questionIndex}
                style={styles.reviewCard}
              >
                <Text style={styles.reviewQuestionNumber}>
                  Question {questionIndex + 1}
                </Text>

                <Text style={styles.reviewQuestion}>
                  {item.question}
                </Text>

                {item.options.map((option, optionIndex) => {
                  const isCorrectOption =
                    optionIndex === item.correctAnswer;

                  const isWrongSelection =
                    optionIndex === studentAnswer &&
                    !isCorrectOption;

                  return (
                    <View
                      key={optionIndex}
                      style={[
                        styles.reviewOption,
                        isCorrectOption &&
                          styles.correctOption,
                        isWrongSelection &&
                          styles.wrongOption,
                      ]}
                    >
                      <Text style={styles.reviewOptionText}>
                        {String.fromCharCode(
                          65 + optionIndex
                        )}. {option}
                      </Text>

                      {isCorrectOption && (
                        <Text style={styles.correctLabel}>
                          ✓ Correct
                        </Text>
                      )}

                      {isWrongSelection && (
                        <Text style={styles.wrongLabel}>
                          ✕ Your Answer
                        </Text>
                      )}

                      {isCorrectOption &&
                        studentAnswer === optionIndex && (
                          <Text style={styles.yourAnswerLabel}>
                            Your Answer
                          </Text>
                        )}
                    </View>
                  );
                })}

                <Text
                  style={[
                    styles.answerStatus,
                    isCorrect
                      ? styles.correctStatus
                      : styles.incorrectStatus,
                  ]}
                >
                  {isUnanswered
                    ? 'Not Answered'
                    : isCorrect
                    ? 'Correct Answer!'
                    : 'Incorrect Answer'}
                </Text>

                <Text style={styles.correctAnswerText}>
                  Correct Answer:{' '}
                  {String.fromCharCode(
                    65 + item.correctAnswer
                  )}. {item.options[item.correctAnswer]}
                </Text>
              </View>
            );
          })}

          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowReview(false)}
          >
            <Text style={styles.buttonText}>
              Back to Results
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Quiz Result Screen.
  if (finished) {
    const score = calculateScore();

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.resultContainer}
        >
          <Text style={styles.resultEmoji}>
            {timeExpired ? '⏰' : '🎉'}
          </Text>

          <Text style={styles.title}>
            {timeExpired
              ? "Time's Up!"
              : 'Quiz Completed!'}
          </Text>

          <Text style={styles.subtitle}>
            Your Final Score
          </Text>

          <Text style={styles.score}>
            {score} / {questions.length}
          </Text>

          <Text style={styles.percentage}>
            {Math.round(
              (score / questions.length) * 100
            )}%
          </Text>

          <Text style={styles.saveStatus}>
            {saveStatus}
          </Text>

          {saveStatus.startsWith('Could not save') && (
            <TouchableOpacity
              style={styles.button}
              onPress={submitPendingAttempt}
            >
              <Text style={styles.buttonText}>
                Retry Save
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowReview(true)}
          >
            <Text style={styles.buttonText}>
              Review Answers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={restartQuiz}
          >
            <Text style={styles.secondaryButtonText}>
              Try Again
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              confirmLeaveResult(() =>
                onBackRef.current?.()
              )
            }
          >
            <Text style={styles.secondaryButtonText}>
              Back to Home
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Active Quiz Screen.
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          onPress={handleExitQuiz}
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          {subject || 'ExamX'} Quiz
        </Text>

        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>
            ⏰ Time Remaining
          </Text>

          <Text
            style={[
              styles.timerText,
              timeLeft <= 30 && styles.timerWarning,
            ]}
          >
            {formatTime(timeLeft)}
          </Text>
        </View>

        <Text style={styles.progress}>
          Question {currentQuestion + 1} of {questions.length}
        </Text>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  ((currentQuestion + 1) /
                    questions.length) *
                  100
                }%`,
              },
            ]}
          />
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>
            {question.question}
          </Text>
        </View>

        {question.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              selectedAnswer === index &&
                styles.selectedOption,
            ]}
            onPress={() => selectAnswer(index)}
          >
            <Text
              style={[
                styles.optionText,
                selectedAnswer === index &&
                  styles.selectedOptionText,
              ]}
            >
              {String.fromCharCode(65 + index)}. {option}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={styles.navigationRow}>
          <TouchableOpacity
            style={[
              styles.navigationButton,
              styles.previousButton,
              currentQuestion === 0 &&
                styles.disabledButton,
            ]}
            onPress={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <Text
              style={[
                styles.previousButtonText,
                currentQuestion === 0 &&
                  styles.disabledButtonText,
              ]}
            >
              ← Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navigationButton,
              styles.nextButton,
            ]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestion === questions.length - 1
                ? 'Finish Quiz'
                : 'Next →'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FF',
  },

  content: {
    padding: 24,
    paddingTop: 30,
    paddingBottom: 40,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },

  backButton: {
    marginBottom: 20,
  },

  backText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
    textAlign: 'center',
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 18,
    color: '#64748B',
    marginBottom: 10,
  },

  timerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },

  timerLabel: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 6,
  },

  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563EB',
  },

  timerWarning: {
    color: '#DC2626',
  },

  progress: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 12,
    marginTop: 20,
  },

  progressBar: {
    height: 10,
    backgroundColor: '#DBEAFE',
    borderRadius: 10,
    marginBottom: 30,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 10,
  },

  questionCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 3,
  },

  questionText: {
    fontSize: 21,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 30,
  },

  option: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
  },

  selectedOption: {
    backgroundColor: '#DBEAFE',
    borderColor: '#2563EB',
  },

  optionText: {
    fontSize: 16,
    color: '#334155',
  },

  selectedOptionText: {
    color: '#1D4ED8',
    fontWeight: 'bold',
  },

  button: {
    backgroundColor: '#2563EB',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  navigationRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },

  navigationButton: {
    flex: 1,
    paddingVertical: 17,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  previousButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2563EB',
  },

  previousButtonText: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: 'bold',
  },

  nextButton: {
    backgroundColor: '#2563EB',
  },

  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  disabledButton: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },

  disabledButtonText: {
    color: '#94A3B8',
  },

  secondaryButton: {
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },

  resultContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  resultEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },

  score: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2563EB',
    marginVertical: 20,
  },

  percentage: {
    fontSize: 24,
    color: '#16A34A',
    fontWeight: 'bold',
    marginBottom: 20,
  },

  saveStatus: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 12,
  },

  reviewSubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 25,
  },

  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  reviewQuestionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 10,
  },

  reviewQuestion: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 18,
    lineHeight: 26,
  },

  reviewOption: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },

  correctOption: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },

  wrongOption: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
  },

  reviewOptionText: {
    fontSize: 15,
    color: '#334155',
  },

  correctLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#15803D',
    marginTop: 5,
  },

  wrongLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#DC2626',
    marginTop: 5,
  },

  yourAnswerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
    marginTop: 4,
  },

  answerStatus: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
  },

  correctStatus: {
    color: '#15803D',
  },

  incorrectStatus: {
    color: '#DC2626',
  },

  correctAnswerText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 21,
  },
});
