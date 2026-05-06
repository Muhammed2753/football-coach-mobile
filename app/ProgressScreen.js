// app/ProgressScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProgressScreen() {
  const router = useRouter();
  const { playerData, plan, data } = useLocalSearchParams();
  
  const [player, setPlayer] = useState(null);
  const [trainingPlan, setTrainingPlan] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [completedSessions, setCompletedSessions] = useState({});
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        let playerObj = null;
        let planObj = null;

        // Try to get data from params
        if (playerData && plan) {
          playerObj = JSON.parse(playerData);
          planObj = JSON.parse(plan);
        } else if (data) {
          playerObj = JSON.parse(data);
        } else {
          // Try to load from AsyncStorage
          const savedPlayer = await AsyncStorage.getItem('trainingPlayerData');
          const savedPlan = await AsyncStorage.getItem('currentTrainingPlan');
          
          if (savedPlayer) playerObj = JSON.parse(savedPlayer);
          if (savedPlan) planObj = JSON.parse(savedPlan);
        }

        if (playerObj) {
          setPlayer(playerObj);
          
          // Initialize progress data
          const attrs = playerObj.attrs || playerObj;
          const initialProgress = {};
          Object.keys(attrs).forEach(attr => {
            initialProgress[attr] = {
              initial: attrs[attr] || 0,
              current: attrs[attr] || 0,
              logs: [],
            };
          });
          setProgressData(initialProgress);
        }

        if (planObj) {
          setTrainingPlan(planObj);
        }

        // Load saved progress
        const savedProgress = await AsyncStorage.getItem('trainingProgress');
        if (savedProgress) {
          const progress = JSON.parse(savedProgress);
          setCompletedSessions(progress.completedSessions || {});
          setCurrentWeek(progress.currentWeek || 1);
          if (progress.progressData) {
            setProgressData(progress.progressData);
          }
        }

      } catch (error) {
        console.error('Error loading progress data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [playerData, plan, data]);

  const saveProgress = async () => {
    try {
      const progressToSave = {
        completedSessions,
        currentWeek,
        progressData,
        lastUpdated: new Date().toISOString()
      };
      await AsyncStorage.setItem('trainingProgress', JSON.stringify(progressToSave));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const completeSession = (week) => {
    if (!trainingPlan || !trainingPlan.schedule) return;

    const weekPlan = trainingPlan.schedule[week - 1];
    if (!weekPlan) return;

    // Mark session as completed
    const newCompletedSessions = {
      ...completedSessions,
      [week]: true,
    };
    setCompletedSessions(newCompletedSessions);

    // Update progress for focused attribute
    const updatedProgress = { ...progressData };
    const attr = weekPlan.focus.key;
    
    if (updatedProgress[attr]) {
      const oldValue = updatedProgress[attr].current;
      const improvement = trainingPlan.intensity === 'light' ? 0.5 : 
                         trainingPlan.intensity === 'moderate' ? 1 : 
                         trainingPlan.intensity === 'intense' ? 1.5 : 2;
      
      const newValue = Math.min(99, oldValue + improvement);
      updatedProgress[attr].current = newValue;
      updatedProgress[attr].logs.push({
        week,
        improvement,
        date: new Date().toISOString()
      });
    }

    setProgressData(updatedProgress);
    saveProgress();

    Alert.alert('Session Complete!', `Week ${week} training completed. Keep it up!`);
  };

  const getOverallImprovement = () => {
    let totalImprovement = 0;
    Object.keys(progressData).forEach(attr => {
      totalImprovement += progressData[attr].current - progressData[attr].initial;
    });
    return Math.round(totalImprovement * 10) / 10;
  };

  const getCompletionPercentage = () => {
    if (!trainingPlan || !trainingPlan.schedule) return 0;
    const totalSessions = trainingPlan.schedule.length;
    const completed = Object.keys(completedSessions).length;
    return Math.round((completed / totalSessions) * 100);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading progress...</Text>
      </View>
    );
  }

  if (!player) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>ðŸ“Š Track Progress</Text>
        <View style={styles.noDataCard}>
          <Text style={styles.noDataTitle}>No Training Plan</Text>
          <Text style={styles.noDataText}>Create a training plan to start tracking progress</Text>
          <TouchableOpacity 
            onPress={() => router.push('/TrainingPlanScreen')} 
            style={styles.createButton}
          >
            <Text style={styles.createButtonText}>ðŸ“‹ Create Training Plan</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>â† Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentWeekPlan = trainingPlan?.schedule?.[currentWeek - 1];
  const isWeekCompleted = completedSessions[currentWeek];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>â† Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>ðŸ“Š Training Progress</Text>
      <Text style={styles.subtitle}>{player.name} - Week {currentWeek}/12</Text>

      {/* Progress Overview */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Completion</Text>
          <Text style={styles.statValue}>{getCompletionPercentage()}%</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Improvement</Text>
          <Text style={styles.statValue}>+{getOverallImprovement()}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Week</Text>
          <Text style={styles.statValue}>{currentWeek}/12</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${getCompletionPercentage()}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>{getCompletionPercentage()}% Complete</Text>
      </View>

      {/* Current Week */}
      {currentWeekPlan && (
        <View style={styles.weekSection}>
          <Text style={styles.weekTitle}>ðŸ“… This Week's Focus</Text>
          <View style={[styles.weekCard, isWeekCompleted && styles.weekCardCompleted]}>
            <Text style={styles.focusAttr}>
              {currentWeekPlan.focus.key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
            </Text>
            <Text style={styles.focusLevel}>
              Current: {progressData[currentWeekPlan.focus.key]?.current || currentWeekPlan.focus.value}/99
            </Text>

            <Text style={styles.exercisesTitle}>This Week's Training:</Text>
            {currentWeekPlan.session.exercises.map((exercise, idx) => (
              <Text key={idx} style={styles.exercise}>
                â€¢ {exercise}
              </Text>
            ))}

            <TouchableOpacity
              onPress={() => completeSession(currentWeek)}
              style={[
                styles.completeButton,
                isWeekCompleted && styles.completeButtonDone,
              ]}
              disabled={isWeekCompleted}
            >
              <Text style={styles.completeButtonText}>
                {isWeekCompleted ? 'âœ“ Week Complete!' : 'âœ“ Complete This Week'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Week Navigation */}
          <View style={styles.weekNavigation}>
            <TouchableOpacity
              onPress={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
              disabled={currentWeek === 1}
              style={[styles.navButton, currentWeek === 1 && styles.navButtonDisabled]}
            >
              <Text style={styles.navButtonText}>â† Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCurrentWeek(Math.min(12, currentWeek + 1))}
              disabled={currentWeek === 12}
              style={[styles.navButton, currentWeek === 12 && styles.navButtonDisabled]}
            >
              <Text style={styles.navButtonText}>Next â†’</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Attribute Progress */}
      {trainingPlan && trainingPlan.focus && (
        <View style={styles.attributesSection}>
          <Text style={styles.attributesTitle}>ðŸ“ˆ Attribute Progress</Text>
          {trainingPlan.focus.map(weakness => {
            const prog = progressData[weakness.key];
            if (!prog) return null;

            const improvement = prog.current - prog.initial;
            return (
              <View key={weakness.key} style={styles.attributeCard}>
                <View style={styles.attributeHeader}>
                  <Text style={styles.attributeName}>
                    {weakness.key.replace(/([A-Z])/g, ' $1').trim()}
                  </Text>
                  <Text style={[styles.attributeValue, improvement > 0 && styles.attributeValuePositive]}>
                    {prog.initial} â†’ {prog.current} {improvement > 0 && `(+${improvement})`}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(prog.current / 99) * 100}%` }
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d1b2a' },
  loadingText: { color: '#a8dadc', fontSize: 16 },
  container: { padding: 20, backgroundColor: '#0d1b2a', paddingBottom: 40 },
  backButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#1b263b', borderRadius: 8, alignSelf: 'flex-start', marginBottom: 16 },
  backText: { color: '#f1faee', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f1faee', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#a8dadc', marginBottom: 20 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#1b263b', borderRadius: 10, padding: 12, marginHorizontal: 4, alignItems: 'center' },
  statLabel: { color: '#a8dadc', fontSize: 12, marginBottom: 6 },
  statValue: { color: '#1e88e5', fontSize: 20, fontWeight: 'bold' },
  progressSection: { marginBottom: 20 },
  progressBar: { height: 10, backgroundColor: '#1b263b', borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 5 },
  progressText: { color: '#a8dadc', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  weekSection: { marginBottom: 20 },
  weekTitle: { fontSize: 18, fontWeight: '700', color: '#f1faee', marginBottom: 12 },
  weekCard: { backgroundColor: '#1b263b', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#FFD700' },
  weekCardCompleted: { borderLeftColor: '#4CAF50', opacity: 0.8 },
  focusAttr: { fontSize: 18, fontWeight: '700', color: '#FFD700', marginBottom: 8 },
  focusLevel: { color: '#a8dadc', fontSize: 14, marginBottom: 12 },
  exercisesTitle: { fontSize: 14, fontWeight: '600', color: '#f1faee', marginBottom: 8 },
  exercise: { color: '#a8dadc', fontSize: 13, marginBottom: 4, marginLeft: 8 },
  completeButton: { marginTop: 16, paddingVertical: 12, backgroundColor: '#1e88e5', borderRadius: 8, alignItems: 'center' },
  completeButtonDone: { backgroundColor: '#4CAF50' },
  completeButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  weekNavigation: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  navButton: { flex: 1, paddingVertical: 10, marginHorizontal: 4, backgroundColor: '#1b263b', borderRadius: 8, alignItems: 'center' },
  navButtonDisabled: { opacity: 0.3 },
  navButtonText: { color: '#f1faee', fontSize: 14, fontWeight: '600' },
  attributesSection: { marginTop: 20 },
  attributesTitle: { fontSize: 18, fontWeight: '700', color: '#f1faee', marginBottom: 12 },
  attributeCard: { backgroundColor: '#1b263b', borderRadius: 10, padding: 12, marginBottom: 10 },
  attributeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  attributeName: { color: '#f1faee', fontSize: 14, fontWeight: '600' },
  attributeValue: { color: '#a8dadc', fontSize: 14 },
  attributeValuePositive: { color: '#4CAF50', fontWeight: 'bold' },
  noDataCard: { backgroundColor: '#1b263b', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 20 },
  noDataTitle: { fontSize: 18, fontWeight: 'bold', color: '#f1faee', marginBottom: 10 },
  noDataText: { fontSize: 14, color: '#a8dadc', textAlign: 'center', marginBottom: 16 },
  createButton: { backgroundColor: '#1e88e5', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  createButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});
