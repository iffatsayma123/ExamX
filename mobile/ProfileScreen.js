
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import {
  getAuthenticatedStudent,
  getQuizAttempts,
} from './api';

export default function ProfileScreen({ email, onBack }) {
  const [student, setStudent] = useState(null);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [profileResponse, attemptsResponse] =
        await Promise.all([
          getAuthenticatedStudent(),
          getQuizAttempts(),
        ]);

      const user = profileResponse?.user;
      const results = attemptsResponse?.results;

      if (
        !user ||
        typeof user.id !== 'string' ||
        !user.id ||
        typeof user.email !== 'string' ||
        !user.email
      ) {
        throw new Error('Invalid student profile received.');
      }

      if (!Array.isArray(results)) {
        throw new Error('Invalid quiz history received.');
      }

      const validResults = results.filter((result) => {
        return (
          typeof result.score === 'number' &&
          Number.isFinite(result.score) &&
          typeof result.totalQuestions === 'number' &&
          Number.isFinite(result.totalQuestions) &&
          result.totalQuestions > 0 &&
          result.score >= 0 &&
          result.score <= result.totalQuestions
        );
      });

      const total = validResults.length;

      const totalPercentage = validResults.reduce(
        (sum, result) =>
          sum +
          (result.score / result.totalQuestions) * 100,
        0
      );

      const average =
        total > 0
          ? Math.round(totalPercentage / total)
          : 0;

      setStudent(user);
      setTotalQuizzes(total);
      setAverageScore(average);
      setError('');
    } catch (err) {
      console.error('Error loading profile:', err);

      setError(
        err.message ||
          'Could not load your profile. Please try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      // The component is mounted while this request runs.
      // Avoid updating state after navigation removes it.
      try {
        const [profileResponse, attemptsResponse] =
          await Promise.all([
            getAuthenticatedStudent(),
            getQuizAttempts(),
          ]);

        if (!active) {
          return;
        }

        const user = profileResponse?.user;
        const results = attemptsResponse?.results;

        if (
          !user ||
          typeof user.id !== 'string' ||
          !user.id ||
          typeof user.email !== 'string' ||
          !user.email
        ) {
          throw new Error('Invalid student profile received.');
        }

        if (!Array.isArray(results)) {
          throw new Error('Invalid quiz history received.');
        }

        const validResults = results.filter((result) => {
          return (
            typeof result.score === 'number' &&
            Number.isFinite(result.score) &&
            typeof result.totalQuestions === 'number' &&
            Number.isFinite(result.totalQuestions) &&
            result.totalQuestions > 0 &&
            result.score >= 0 &&
            result.score <= result.totalQuestions
          );
        });

        const total = validResults.length;

        const totalPercentage = validResults.reduce(
          (sum, result) =>
            sum +
            (result.score / result.totalQuestions) * 100,
          0
        );

        const average =
          total > 0
            ? Math.round(totalPercentage / total)
            : 0;

        setStudent(user);
        setTotalQuizzes(total);
        setAverageScore(average);
        setError('');
      } catch (err) {
        if (active) {
          console.error('Error loading profile:', err);

          setError(
            err.message ||
              'Could not load your profile. Please try again.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      active = false;
    };
  }, []);

  const displayName =
    typeof student?.fullName === 'string' &&
    student.fullName.trim()
      ? student.fullName.trim()
      : 'ExamX Student';

  const displayEmail = student?.email || email || 'Not available';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadProfile(true)}
            tintColor="#2563EB"
            colors={['#2563EB']}
          />
        }
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onBack && onBack()}
        >
          <Text style={styles.backText}>
            ← Back to Home
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>My Profile</Text>

        <Text style={styles.subtitle}>
          Your account information and practice progress.
        </Text>

        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>👤</Text>
          </View>

          {loading && !student ? (
            <>
              <ActivityIndicator
                size="small"
                color="#2563EB"
              />
              <Text style={styles.accountType}>
                Loading student profile...
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.studentTitle}>
                {displayName}
              </Text>

              <Text style={styles.accountType}>
                ExamX Student Account
              </Text>
            </>
          )}

          <View style={styles.divider} />

          <Text style={styles.infoLabel}>
            Email Address
          </Text>

          <Text style={styles.emailText}>
            {displayEmail}
          </Text>

          <Text style={styles.infoLabel}>
            Account Type
          </Text>

          <Text style={styles.infoValue}>
            Registered Student
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          My Practice Statistics
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color="#2563EB"
            />
            <Text style={styles.loadingText}>
              Loading your statistics...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.messageCard}>
            <Text style={styles.errorText}>
              {error}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadProfile()}
            >
              <Text style={styles.retryButtonText}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📝</Text>

              <Text style={styles.statNumber}>
                {totalQuizzes}
              </Text>

              <Text style={styles.statLabel}>
                Quizzes Completed
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📈</Text>

              <Text style={styles.statNumber}>
                {averageScore}%
              </Text>

              <Text style={styles.statLabel}>
                Average Score
              </Text>
            </View>
          </View>
        )}

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>
            About Your Profile
          </Text>

          <Text style={styles.noticeText}>
            Your ExamX account is connected to our
            secure backend. Completed quiz results are
            saved to MongoDB Atlas and linked to your
            student account. You can access your saved
            results after logging in again.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => onBack && onBack()}
        >
          <Text style={styles.homeButtonText}>
            Back to Home
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
  content: {
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 45,
  },
  backButton: {
    marginBottom: 25,
  },
  backText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 25,
    lineHeight: 22,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 30,
  },
  avatarCircle: {
    width: 85,
    height: 85,
    borderRadius: 43,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 42,
  },
  studentTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 6,
    textAlign: 'center',
  },
  accountType: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    width: '100%',
    marginVertical: 22,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    alignSelf: 'flex-start',
    marginBottom: 7,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 35,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 12,
  },
  messageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    lineHeight: 21,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  noticeCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 25,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  homeButton: {
    backgroundColor: '#2563EB',
    borderRadius: 13,
    paddingVertical: 17,
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
