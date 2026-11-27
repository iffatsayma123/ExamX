
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';

import RegisterScreen from './RegisterScreen';
import LoginScreen from './LoginScreen';
import HomeScreen from './HomeScreen';
import QuizInstructionsScreen from './QuizInstructionsScreen';
import QuizScreen from './QuizScreen';
import ResultsScreen from './ResultsScreen';
import ProfileScreen from './ProfileScreen';

import {
  getAuthToken,
  getAuthenticatedStudent,
  logoutStudent,
} from './api';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('loading');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [studentEmail, setStudentEmail] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Restore an existing authenticated session when the app starts.
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const token = await getAuthToken();

        if (!token) {
          if (isMounted) {
            setCurrentScreen('welcome');
          }
          return;
        }

        const response = await getAuthenticatedStudent();

        if (
          !response.user ||
          !response.user.id ||
          !response.user.email
        ) {
          throw new Error('Invalid student profile.');
        }

        if (isMounted) {
          setStudentId(response.user.id);
          setStudentEmail(response.user.email);
          setCurrentScreen('home');
        }
      } catch (error) {
        // Network errors should not automatically delete a valid token.
        // Invalid/expired tokens are cleared by authenticatedRequest().
        if (isMounted) {
          setStudentId(null);
          setStudentEmail('');
          setCurrentScreen('welcome');
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLoginSuccess = (student) => {
    if (!student || !student.id || !student.email) {
      return;
    }

    setStudentId(student.id);
    setStudentEmail(student.email);
    setCurrentScreen('home');
  };

  const handleStartQuiz = (subjectName) => {
    setSelectedSubject(subjectName);
    setCurrentScreen('instructions');
  };

  const handleBeginQuiz = () => {
    if (!selectedSubject) {
      return;
    }

    setCurrentScreen('quiz');
  };

  const handleViewResults = () => {
    setCurrentScreen('results');
  };

  const handleViewProfile = () => {
    setCurrentScreen('profile');
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logoutStudent();

      setStudentId(null);
      setStudentEmail('');
      setSelectedSubject(null);
      setCurrentScreen('welcome');
    } catch (error) {
      console.error('Logout failed:', error.message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (currentScreen === 'loading' || isLoggingOut) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />

        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

          <Text style={styles.loadingText}>
            {isLoggingOut
              ? 'Logging out...'
              : 'Checking your session...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'register') {
    return (
      <RegisterScreen
        onBack={() => setCurrentScreen('welcome')}
      />
    );
  }

  if (currentScreen === 'login') {
    return (
      <LoginScreen
        onBack={() => setCurrentScreen('welcome')}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  if (currentScreen === 'home') {
    return (
      <HomeScreen
        onStartQuiz={handleStartQuiz}
        onViewResults={handleViewResults}
        onViewProfile={handleViewProfile}
        onLogout={handleLogout}
      />
    );
  }

  if (currentScreen === 'instructions') {
    return (
      <QuizInstructionsScreen
        subject={selectedSubject}
        onStart={handleBeginQuiz}
        onBack={() => setCurrentScreen('home')}
      />
    );
  }

  if (currentScreen === 'quiz') {
    return (
      <QuizScreen
        subject={selectedSubject}
        studentId={studentId}
        onBack={() => setCurrentScreen('home')}
      />
    );
  }

  if (currentScreen === 'results') {
    return (
      <ResultsScreen
        onBack={() => setCurrentScreen('home')}
      />
    );
  }

  if (currentScreen === 'profile') {
    return (
      <ProfileScreen
        email={studentEmail}
        onBack={() => setCurrentScreen('home')}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>X</Text>
        </View>

        <Text style={styles.appName}>ExamX</Text>

        <Text style={styles.tagline}>
          Practice. Improve. Succeed.
        </Text>

        <Text style={styles.description}>
          Prepare for your exams with simple MCQ tests,
          instant results, and answer reviews.
        </Text>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setCurrentScreen('register')}
        >
          <Text style={styles.primaryButtonText}>
            Get Started
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setCurrentScreen('login')}
        >
          <Text style={styles.secondaryButtonText}>
            Log In
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Learn and grow with ExamX
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 18,
    fontSize: 16,
    color: '#64748B',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  logoLetter: {
    fontSize: 62,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563EB',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 25,
  },
  bottomSection: {
    paddingHorizontal: 28,
    paddingBottom: 35,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 17,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2563EB',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2563EB',
    fontSize: 17,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 25,
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
