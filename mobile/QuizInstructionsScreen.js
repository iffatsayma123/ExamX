
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import questionsBySubject from './questions';

const QUIZ_DURATION_MINUTES = 5;

export default function QuizInstructionsScreen({
  subject,
  onStart,
  onBack,
}) {
  const questions = questionsBySubject[subject] || [];
  const questionCount = questions.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
        >
          <Text style={styles.backText}>
            ← Back to Home
          </Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.headerIcon}>📋</Text>

          <Text style={styles.title}>
            {subject || 'ExamX'} Quiz
          </Text>

          <Text style={styles.subtitle}>
            Read the instructions before starting.
          </Text>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>
            Quiz Details
          </Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Total Questions
            </Text>

            <Text style={styles.detailValue}>
              {questionCount} MCQs
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Time Limit
            </Text>

            <Text style={styles.detailValue}>
              {QUIZ_DURATION_MINUTES} Minutes
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Marks per Question
            </Text>

            <Text style={styles.detailValue}>
              1 Mark
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Negative Marking
            </Text>

            <Text style={styles.detailValue}>
              None
            </Text>
          </View>
        </View>

        <View style={styles.instructionsCard}>
          <Text style={styles.cardTitle}>
            📝 Instructions
          </Text>

          <Text style={styles.instruction}>
            1. Each question has multiple options.
            Choose the correct answer.
          </Text>

          <Text style={styles.instruction}>
            2. Answer every question before submitting
            your quiz.
          </Text>

          <Text style={styles.instruction}>
            3. You can go back and change your
            answers before submitting.
          </Text>

          <Text style={styles.instruction}>
            4. The timer starts when you press
            Start Quiz.
          </Text>

          <Text style={styles.instruction}>
            5. Your quiz will automatically finish
            when the time runs out.
          </Text>

          <Text style={styles.instruction}>
            6. Leaving an unfinished quiz will
            discard your answers.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.startButton,
            questionCount === 0 && styles.disabledButton,
          ]}
          onPress={onStart}
          disabled={questionCount === 0}
        >
          <Text style={styles.startButtonText}>
            {questionCount === 0
              ? 'No Questions Available'
              : 'Start Quiz →'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Good luck with your practice!
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFF',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 25,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#1E3A8A',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 18,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 15,
    color: '#64748B',
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  instructionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  instruction: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 14,
  },
  startButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 20,
  },
});
