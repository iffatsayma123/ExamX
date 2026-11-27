
import React, {
  useState,
  useEffect,
  useCallback,
} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { getQuizAttempts } from './api';
import questionsBySubject from './questions';

const SUBJECTS = [
  'All',
  ...Object.keys(questionsBySubject),
];

export default function ResultsScreen({ onBack }) {
  const [results, setResults] = useState([]);
  const [selectedSubject, setSelectedSubject] =
    useState('All');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadResults = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getQuizAttempts();

      if (!Array.isArray(response.results)) {
        throw new Error(
          'Invalid quiz history received from server.'
        );
      }

      const sortedResults = [...response.results].sort(
        (a, b) =>
          new Date(b.completedAt).getTime() -
          new Date(a.completedAt).getTime()
      );

      setResults(sortedResults);
    } catch (err) {
      console.error(
        'Failed to load quiz history:',
        err
      );

      setError(
        err.message ||
          'Unable to load quiz history.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const filteredResults =
    selectedSubject === 'All'
      ? results
      : results.filter(
          (result) =>
            result.subject === selectedSubject
        );

  const totalAttempts = filteredResults.length;

  const averagePercentage =
    totalAttempts > 0
      ? Math.round(
          filteredResults.reduce(
            (total, result) =>
              total + result.percentage,
            0
          ) / totalAttempts
        )
      : 0;

  const bestPercentage =
    totalAttempts > 0
      ? Math.max(
          ...filteredResults.map(
            (result) => result.percentage
          )
        )
      : 0;

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return 'Unknown date';
    }

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) {
      return '#16A34A';
    }

    if (percentage >= 50) {
      return '#D97706';
    }

    return '#DC2626';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
        >
          <Text style={styles.backText}>
            ← Back to Home
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          Quiz Result History
        </Text>

        <Text style={styles.subtitle}>
          Track your progress across completed quizzes.
        </Text>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator
              size="large"
              color="#2563EB"
            />

            <Text style={styles.infoText}>
              Loading your quiz history...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.messageCard}>
            <Text style={styles.errorTitle}>
              Unable to Load Results
            </Text>

            <Text style={styles.errorText}>
              {error}
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={loadResults}
            >
              <Text style={styles.buttonText}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              Filter by Subject
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
              contentContainerStyle={
                styles.filterContainer
              }
            >
              {SUBJECTS.map((subject) => {
                const isSelected =
                  selectedSubject === subject;

                return (
                  <TouchableOpacity
                    key={subject}
                    style={[
                      styles.filterButton,
                      isSelected &&
                        styles.selectedFilter,
                    ]}
                    onPress={() =>
                      setSelectedSubject(subject)
                    }
                  >
                    <Text
                      style={[
                        styles.filterText,
                        isSelected &&
                          styles.selectedFilterText,
                      ]}
                    >
                      {subject}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.summaryContainer}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>
                  {totalAttempts}
                </Text>

                <Text style={styles.summaryLabel}>
                  Attempts
                </Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>
                  {averagePercentage}%
                </Text>

                <Text style={styles.summaryLabel}>
                  Average
                </Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>
                  {bestPercentage}%
                </Text>

                <Text style={styles.summaryLabel}>
                  Best
                </Text>
              </View>
            </View>

            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>
                Completed Quizzes
              </Text>

              <TouchableOpacity
                onPress={loadResults}
              >
                <Text style={styles.refreshText}>
                  Refresh
                </Text>
              </TouchableOpacity>
            </View>

            {filteredResults.length === 0 ? (
              <View style={styles.messageCard}>
                <Text style={styles.emptyEmoji}>
                  📋
                </Text>

                <Text style={styles.emptyTitle}>
                  No Quiz Results Yet
                </Text>

                <Text style={styles.emptyText}>
                  {selectedSubject === 'All'
                    ? 'Complete a quiz to see your results here.'
                    : `No completed quizzes found for ${selectedSubject}.`}
                </Text>
              </View>
            ) : (
              filteredResults.map(
                (result, index) => (
                  <View
                    key={
                      result.id ||
                      `attempt-${index}`
                    }
                    style={styles.resultCard}
                  >
                    <View
                      style={styles.resultHeader}
                    >
                      <View
                        style={styles.subjectContainer}
                      >
                        <Text
                          style={styles.subjectText}
                        >
                          {result.subject}
                        </Text>

                        <Text
                          style={styles.dateText}
                        >
                          {formatDate(
                            result.completedAt
                          )}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.percentageText,
                          {
                            color: getScoreColor(
                              result.percentage
                            ),
                          },
                        ]}
                      >
                        {result.percentage}%
                      </Text>
                    </View>

                    <View
                      style={styles.resultDivider}
                    />

                    <View
                      style={styles.scoreRow}
                    >
                      <Text
                        style={styles.scoreLabel}
                      >
                        Score
                      </Text>

                      <Text
                        style={styles.scoreValue}
                      >
                        {result.score} /{' '}
                        {result.totalQuestions}
                      </Text>
                    </View>

                    <View
                      style={styles.scoreRow}
                    >
                      <Text
                        style={styles.scoreLabel}
                      >
                        Completion
                      </Text>

                      <Text
                        style={
                          result.timeExpired
                            ? styles.expiredText
                            : styles.completedText
                        }
                      >
                        {result.timeExpired
                          ? '⏰ Time Expired'
                          : '✓ Completed'}
                      </Text>
                    </View>
                  </View>
                )
              )
            )}
          </>
        )}
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
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 28,
  },

  centerContainer: {
    paddingVertical: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoText: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 16,
    textAlign: 'center',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 14,
  },

  filterScroll: {
    marginBottom: 24,
  },

  filterContainer: {
    gap: 10,
    paddingRight: 8,
  },

  filterButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },

  selectedFilter: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },

  filterText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },

  selectedFilterText: {
    color: '#FFFFFF',
  },

  summaryContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },

  summaryValue: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 6,
  },

  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },

  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  refreshText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 14,
  },

  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  subjectContainer: {
    flex: 1,
    paddingRight: 12,
  },

  subjectText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 6,
  },

  dateText: {
    fontSize: 12,
    color: '#64748B',
  },

  percentageText: {
    fontSize: 23,
    fontWeight: 'bold',
  },

  resultDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },

  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  scoreLabel: {
    fontSize: 14,
    color: '#64748B',
  },

  scoreValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
  },

  expiredText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },

  completedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
  },

  messageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },

  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 10,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    textAlign: 'center',
  },

  errorTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 12,
    textAlign: 'center',
  },

  errorText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },

  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
