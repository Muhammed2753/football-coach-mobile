// app/ProgressScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { logTrainingSession, calculateProgress, checkMilestones } from './utils/TrainingEngine';

export default function ProgressScreen() {
  const router = useRouter();
  const { playerData, plan } = useLocalSearchParams();
  
  // Safety check
  if (!playerData || !plan) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d1b2a' }}>
        <Text style={{ color: '#f1faee', fontSize: 16 }}>Loading progress data...</Text>
      </View>
    );
  }
  
  const player = JSON.parse(playerData);
  const trainingPlan = JSON.parse(plan);
  
  const [currentWeek, setCurrentWeek] = useState(1);
  const [completedSessions, setCompletedSessions] = useState({});
  const [progressData, setProgressData] = useState({});
  const [milestones, setMilestones] = useState([]);
  const [showWeeklyDetails, setShowWeeklyDetails] = useState(false);

  // Initialize progress tracking
  useEffect(() => {
    const initialProgress = {};
    Object.keys(player.attrs).forEach(attr => {
      initialProgress[attr] = {
        initial: player.attrs[attr],
        current: player.attrs[attr],
        logs: [],
      };
    });
    setProgressData(initialProgress);
  }, []);

  const completeSession = (week) => {
    const weekPlan = trainingPlan.schedule[week - 1];
    const intensity = trainingPlan.intensity === 'light' ? 0.5 : trainingPlan.intensity === 'moderate' ? 1 : trainingPlan.intensity === 'intense' ? 1.5 : 2;
    
    // Log the session
    const sessionLog = logTrainingSession(
      player.id || 'player',
      week,
      weekPlan.focus.key,
      intensity,
      true
    );

    // Update completed sessions
    setCompletedSessions({
      ...completedSessions,
      [week]: true,
    });

    // Update progress for focused attribute
    const updatedProgress = { ...progressData };
    const attr = weekPlan.focus.key;
    const oldValue = updatedProgress[attr].current;
    const newValue = calculateProgress(oldValue, 1, intensity);
    updatedProgress[attr].current = newValue;
    updatedProgress[attr].logs.push(sessionLog);
    
    // Also slightly improve nearby related attributes
    improveSupportingAttributes(updatedProgress, attr, intensity * 0.5);
    
    setProgressData(updatedProgress);

    // Check for milestones
    const newMilestones = checkMilestones(updatedProgress, progressData);
    if (newMilestones.length > 0) {
      setMilestones([...milestones, ...newMilestones]);
    }
  };

  const improveSupportingAttributes = (progress, focusAttr, intensity) => {
    // Improve related attributes slightly
    const relationships = {
      acceleration: ['sprintSpeed', 'agility'],
      sprintSpeed: ['acceleration', 'stamina'],
      finishing: ['shotPower', 'composure'],
      dribbling: ['ballControl', 'balance'],
      crossing: ['accuracy', 'vision'],
      marking: ['positioning', 'reactions'],
      strength: ['stamina', 'jumping'],
    };

    const related = relationships[focusAttr] || [];
    related.forEach(relAttr => {
      if (progress[relAttr]) {
        const oldVal = progress[relAttr].current;
        progress[relAttr].current = calculateProgress(oldVal, 1, intensity * 0.3);
      }
    });
  };

  const getOverallImprovement = () => {
    let totalImprovement = 0;
    Object.keys(progressData).forEach(attr => {
      totalImprovement += progressData[attr].current - progressData[attr].initial;
    });
    return totalImprovement;
  };

  const getCompletionPercentage = () => {
    const totalSessions = trainingPlan.schedule.length;
    const completed = Object.keys(completedSessions).length;
    return Math.round((completed / totalSessions) * 100);
  };

  const weekPlan = trainingPlan.schedule[currentWeek - 1];
  const isWeekCompleted = completedSessions[currentWeek];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🏋️ Training Progress</Text>
      <Text style={styles.subtitle}>{player.name} - Week {currentWeek}/12</Text>

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

      {/* Overall Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Improvement</Text>
          <Text style={styles.statValue}>{getOverallImprovement()}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Weeks Done</Text>
          <Text style={styles.statValue}>{Object.keys(completedSessions).length}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Milestones</Text>
          <Text style={styles.statValue}>{milestones.length}</Text>
        </View>
      </View>

      {/* Current Week Plan */}
      {weekPlan && (
        <View style={styles.weekSection}>
          <Text style={styles.weekTitle}>📅 This Week's Focus</Text>
          <View style={[styles.weekCard, isWeekCompleted && styles.weekCardCompleted]}>
            <Text style={styles.focusAttr}>
              {weekPlan.focus.key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
            </Text>
            <Text style={styles.focusLevel}>
              Current: {progressData[weekPlan.focus.key]?.current || weekPlan.focus.value}/99
            </Text>

            <Text style={styles.exercisesTitle}>Exercises:</Text>
            {weekPlan.session.exercises.map((exercise, idx) => (
              <Text key={idx} style={styles.exercise}>
                • {exercise}
              </Text>
            ))}

            <Text style={styles.sessionInfo}>
              {weekPlan.session.duration} | {weekPlan.session.reps} sessions
            </Text>

            <TouchableOpacity
              onPress={() => completeSession(currentWeek)}
              style={[
                styles.completeButton,
                isWeekCompleted && styles.completeButtonDone,
              ]}
            >
              <Text style={styles.completeButtonText}>
                {isWeekCompleted ? '✓ Week Complete!' : '✓ Mark as Complete'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Navigation */}
          <View style={styles.weekNavigation}>
            <TouchableOpacity
              onPress={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
              disabled={currentWeek === 1}
              style={[styles.navButton, currentWeek === 1 && styles.navButtonDisabled]}
            >
              <Text style={styles.navButtonText}>← Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowWeeklyDetails(!showWeeklyDetails)}
              style={styles.detailsButton}
            >
              <Text style={styles.detailsButtonText}>View All Weeks</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCurrentWeek(Math.min(12, currentWeek + 1))}
              disabled={currentWeek === 12}
              style={[styles.navButton, currentWeek === 12 && styles.navButtonDisabled]}
            >
              <Text style={styles.navButtonText}>Next →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Progress Summary */}
      <Text style={styles.summaryTitle}>📊 Attribute Progress</Text>
      {trainingPlan.focus.map(weakness => {
        const prog = progressData[weakness.key];
        if (!prog) return null;

        const improvement = prog.current - prog.initial;
        const improvementPercent = Math.round((improvement / 99) * 100);

        return (
          <View key={weakness.key} style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressAttr}>
                {weakness.key.replace(/([A-Z])/g, ' $1').trim()}
              </Text>
              <Text style={[styles.progressValue, improvement > 0 && styles.progressValuePositive]}>
                {prog.initial} → {prog.current} {improvement > 0 && `(+${improvement})`}
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

      {/* Milestones */}
      {milestones.length > 0 && (
        <View style={styles.milestonesSection}>
          <Text style={styles.milestonesTitle}>🎉 Milestones Achieved</Text>
          {milestones.map((milestone, idx) => (
            <View key={idx} style={styles.milestoneCard}>
              <Text style={styles.milestoneText}>
                {milestone.message}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* All Weeks Modal */}
      <Modal visible={showWeeklyDetails} animationType="slide" transparent={false}>
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <TouchableOpacity
            onPress={() => setShowWeeklyDetails(false)}
            style={styles.closeButton}
          >
            <Text style={styles.closeText}>✕ Close</Text>
          </TouchableOpacity>

          <Text style={styles.allWeeksTitle}>All 12 Weeks</Text>
          {trainingPlan.schedule.map((week, idx) => (
            <View
              key={idx}
              style={[
                styles.weekListCard,
                completedSessions[week.week] && styles.weekListCardDone,
              ]}
            >
              <View style={styles.weekListHeader}>
                <Text style={styles.weekListNumber}>Week {week.week}</Text>
                {completedSessions[week.week] && (
                  <Text style={styles.weekListDone}>✓ Done</Text>
                )}
              </View>
              <Text style={styles.weekListFocus}>
                Focus: {week.focus.key.replace(/([A-Z])/g, ' $1').trim()}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setCurrentWeek(week.week);
                  setShowWeeklyDetails(false);
                }}
                style={styles.selectWeekButton}
              >
                <Text style={styles.selectWeekText}>Select Week</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#0d1b2a', paddingBottom: 40 },
  backButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#1b263b', borderRadius: 8, alignSelf: 'flex-start', marginBottom: 16 },
  backText: { color: '#f1faee', fontSize: 14, fontWeight: '600' },

  title: { fontSize: 28, fontWeight: 'bold', color: '#f1faee', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#a8dadc', marginBottom: 20 },

  progressSection: { marginBottom: 24 },
  progressBar: { height: 12, backgroundColor: '#1b263b', borderRadius: 6, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 6 },
  progressText: { color: '#a8dadc', fontSize: 14, fontWeight: '600', textAlign: 'center' },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#1b263b', borderRadius: 10, padding: 12, marginHorizontal: 4, alignItems: 'center' },
  statLabel: { color: '#a8dadc', fontSize: 12, marginBottom: 6 },
  statValue: { color: '#1e88e5', fontSize: 24, fontWeight: 'bold' },

  weekSection: { marginBottom: 24 },
  weekTitle: { fontSize: 18, fontWeight: '700', color: '#f1faee', marginBottom: 12 },
  weekCard: { backgroundColor: '#1b263b', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#FFD700' },
  weekCardCompleted: { borderLeftColor: '#4CAF50', opacity: 0.8 },

  focusAttr: { fontSize: 18, fontWeight: '700', color: '#FFD700', marginBottom: 8 },
  focusLevel: { color: '#a8dadc', fontSize: 14, marginBottom: 12 },

  exercisesTitle: { fontSize: 14, fontWeight: '600', color: '#f1faee', marginBottom: 8 },
  exercise: { color: '#a8dadc', fontSize: 13, marginBottom: 4, marginLeft: 8 },
  sessionInfo: { color: '#a8dadc', fontSize: 12, marginTop: 12, fontStyle: 'italic' },

  completeButton: { marginTop: 16, paddingVertical: 12, backgroundColor: '#1e88e5', borderRadius: 8, alignItems: 'center' },
  completeButtonDone: { backgroundColor: '#4CAF50' },
  completeButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  weekNavigation: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  navButton: { flex: 1, paddingVertical: 10, marginHorizontal: 4, backgroundColor: '#1b263b', borderRadius: 8, alignItems: 'center' },
  navButtonDisabled: { opacity: 0.3 },
  navButtonText: { color: '#f1faee', fontSize: 14, fontWeight: '600' },
  detailsButton: { flex: 1, paddingVertical: 10, marginHorizontal: 4, backgroundColor: '#1e88e5', borderRadius: 8, alignItems: 'center' },
  detailsButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  summaryTitle: { fontSize: 18, fontWeight: '700', color: '#f1faee', marginTop: 24, marginBottom: 12 },
  progressCard: { backgroundColor: '#1b263b', borderRadius: 10, padding: 12, marginBottom: 10 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressAttr: { color: '#f1faee', fontSize: 14, fontWeight: '600' },
  progressValue: { color: '#a8dadc', fontSize: 14 },
  progressValuePositive: { color: '#4CAF50', fontWeight: 'bold' },

  milestonesSection: { marginTop: 24 },
  milestonesTitle: { fontSize: 18, fontWeight: '700', color: '#FFD700', marginBottom: 12 },
  milestoneCard: { backgroundColor: '#1b263b', borderRadius: 10, padding: 12, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#FFD700' },
  milestoneText: { color: '#f1faee', fontSize: 14, fontWeight: '600' },

  modalContainer: { padding: 20, backgroundColor: '#0d1b2a', paddingBottom: 40 },
  closeButton: { alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#1b263b', borderRadius: 8, marginBottom: 16 },
  closeText: { color: '#f1faee', fontSize: 14, fontWeight: '600' },

  allWeeksTitle: { fontSize: 24, fontWeight: 'bold', color: '#f1faee', marginBottom: 16 },
  weekListCard: { backgroundColor: '#1b263b', borderRadius: 10, padding: 12, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#a8dadc' },
  weekListCardDone: { borderLeftColor: '#4CAF50', opacity: 0.7 },
  weekListHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  weekListNumber: { fontSize: 16, fontWeight: '700', color: '#1e88e5' },
  weekListDone: { color: '#4CAF50', fontSize: 14, fontWeight: 'bold' },
  weekListFocus: { color: '#a8dadc', fontSize: 13, marginBottom: 8 },
  selectWeekButton: { paddingVertical: 8, backgroundColor: '#1e88e5', borderRadius: 6, alignItems: 'center' },
  selectWeekText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
