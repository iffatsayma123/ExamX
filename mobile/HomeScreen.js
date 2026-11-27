
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

const subjects = [
  { id: '1', name: 'English', icon: '📖' },
  { id: '2', name: 'Mathematics', icon: '🔢' },
  { id: '3', name: 'General Knowledge', icon: '🌍' },
  { id: '4', name: 'Computer Basics', icon: '💻' },
];

export default function HomeScreen({
  onStartQuiz,
  onLogout,
  onViewResults,
  onViewProfile,
}) {
  const handleSubjectPress = (subject) => {
    if (onStartQuiz) {
      onStartQuiz(subject.name);
    }
  };

  const getQuestionCount = (subjectName) => {
    const questions = questionsBySubject[subjectName];

    return Array.isArray(questions) ? questions.length : 0;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome to</Text>
            <Text style={styles.appName}>ExamX</Text>
          </View>

          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>X</Text>
          </View>
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>
            Ready to practice?
          </Text>

          <Text style={styles.bannerDescription}>
            Choose a subject, answer MCQs, and improve your skills.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Choose a Subject
        </Text>

        <Text style={styles.sectionSubtitle}>
          Select a subject to begin your practice.
        </Text>

        {subjects.map((subject) => {
          const questionCount = getQuestionCount(subject.name);

          return (
            <TouchableOpacity
              key={subject.id}
              style={styles.subjectCard}
              onPress={() => handleSubjectPress(subject)}
            >
              <View style={styles.subjectIcon}>
                <Text style={styles.subjectEmoji}>
                  {subject.icon}
                </Text>
              </View>

              <View style={styles.subjectInfo}>
                <Text style={styles.subjectName}>
                  {subject.name}
                </Text>

                <Text style={styles.questionCount}>
                  {questionCount} MCQ Questions
                </Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          );
        })}

        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (onViewResults) {
                onViewResults();
              }
            }}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>My Results</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (onViewProfile) {
                onViewProfile();
              }
            }}
          >
            <Text style={styles.actionIcon}>👤</Text>
            <Text style={styles.actionText}>My Profile</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={onLogout}
        >
          <Text style={styles.logoutText}>
            Log Out
          </Text>
        </TouchableOpacity>
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
    paddingTop: 35,
    paddingBottom: 35,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  greeting: {
    fontSize: 16,
    color: '#64748B',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  logoCircle: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
  },
  banner: {
    backgroundColor: '#2563EB',
    borderRadius: 18,
    padding: 24,
    marginBottom: 30,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bannerDescription: {
    color: '#DBEAFE',
    fontSize: 15,
    lineHeight: 23,
  },
  sectionTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 7,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  subjectEmoji: {
    fontSize: 25,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 5,
  },
  questionCount: {
    fontSize: 13,
    color: '#64748B',
  },
  arrow: {
    fontSize: 30,
    color: '#94A3B8',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 20,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 26,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  logoutButton: {
    marginTop: 25,
    alignItems: 'center',
    paddingVertical: 14,
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
});
