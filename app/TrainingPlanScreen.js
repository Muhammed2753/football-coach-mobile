// app/TrainingPlanScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { createTrainingPlan, estimateWeeksToGoal, recommendIntensity } from './utils/TrainingEngine';

export default function TrainingPlanScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams();
  
  // Safety check - data might be undefined on first load
  if (!data) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d1b2a' }}>
        <Text style={{ color: '#f1faee', fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }
  
  const player = JSON.parse(data);
  const [intensity, setIntensity] = useState(recommendIntensity(player.age, player.overall));
  const [selectedWeaknesses, setSelectedWeaknesses] = useState([]);
  const [plan, setPlan] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Get weaknesses from player attributes - FILTERED BY POSITION
  const getWeaknesses = () => {
    const attrs = player.attrs;
    const pos = player.positions[0];
    
    // Position-specific attributes (same as WeaknessScreen)
    const positionKeys = {
      GK: ['diving', 'handling', 'kicking', 'positioning', 'reflexes', 'reactions'],
      CB: ['marking', 'standingTackle', 'slidingTackle', 'headingAccuracy', 'strength', 'aggression'],
      RB: ['sprintSpeed', 'acceleration', 'crossing', 'stamina', 'marking', 'dribbling'],
      LB: ['sprintSpeed', 'acceleration', 'crossing', 'stamina', 'marking', 'dribbling'],
      RWB: ['sprintSpeed', 'acceleration', 'crossing', 'stamina', 'dribbling', 'finishing'],
      LWB: ['sprintSpeed', 'acceleration', 'crossing', 'stamina', 'dribbling', 'finishing'],
      CDM: ['interceptions', 'standingTackle', 'shortPassing', 'stamina', 'strength', 'composure'],
      CM: ['shortPassing', 'longPassing', 'vision', 'stamina', 'dribbling', 'composure'],
      CAM: ['vision', 'dribbling', 'finishing', 'longShots', 'curve', 'composure'],
      LW: ['dribbling', 'acceleration', 'finishing', 'crossing', 'balance', 'agility'],
      RW: ['dribbling', 'acceleration', 'finishing', 'crossing', 'balance', 'agility'],
      ST: ['finishing', 'shotPower', 'headingAccuracy', 'strength', 'acceleration', 'composure'],
      Utility: Object.keys(attrs).slice(0, 6),
    };
    
    const keys = positionKeys[pos] || positionKeys.Utility;
    const weakList = keys
      .map(key => ({ key, value: attrs[key] || 0 }))
      .filter(item => item.value < 70)
      .sort((a, b) => a.value - b.value);
    return weakList;
  };

  const weaknesses = getWeaknesses();

  const toggleWeakness = (weakness) => {
    if (selectedWeaknesses.find(w => w.key === weakness.key)) {
      setSelectedWeaknesses(selectedWeaknesses.filter(w => w.key !== weakness.key));
    } else {
      setSelectedWeaknesses([...selectedWeaknesses, weakness]);
    }
  };

  const generatePlan = () => {
    const trainingPlan = createTrainingPlan(
      player.attrs,
      selectedWeaknesses.length > 0 ? selectedWeaknesses : weaknesses,
      intensity
    );
    setPlan(trainingPlan);
    setShowPreview(true);
  };

  const estimateWeeksForGoal = (currentValue) => {
    return estimateWeeksToGoal(currentValue, 90, intensity === 'light' ? 0.5 : intensity === 'moderate' ? 1 : intensity === 'intense' ? 1.5 : 2);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📋 Custom Training Plan</Text>
      <Text style={styles.subtitle}>for {player.name} ({player.positions[0]})</Text>

      {/* Intensity Selector */}
      <Text style={styles.sectionTitle}>Training Intensity</Text>
      <View style={styles.intensityGrid}>
        {['light', 'moderate', 'intense', 'extreme'].map(level => (
          <TouchableOpacity
            key={level}
            onPress={() => setIntensity(level)}
            style={[
              styles.intensityButton,
              intensity === level && styles.intensityButtonActive,
            ]}
          >
            <Text style={styles.intensityText}>{level.charAt(0).toUpperCase() + level.slice(1)}</Text>
            <Text style={styles.intensityDesc}>
              {level === 'light' ? '+0.5/wk' : level === 'moderate' ? '+1/wk' : level === 'intense' ? '+1.5/wk' : '+2/wk'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Weaknesses Selection */}
      <Text style={styles.sectionTitle}>Target Weaknesses (select up to 6)</Text>
      <View style={styles.weaknessGrid}>
        {weaknesses.map(weakness => {
          const isSelected = selectedWeaknesses.find(w => w.key === weakness.key);
          const weeksToGoal = estimateWeeksForGoal(weakness.value);
          return (
            <TouchableOpacity
              key={weakness.key}
              onPress={() => toggleWeakness(weakness)}
              style={[
                styles.weaknessCard,
                isSelected && styles.weaknessCardActive,
              ]}
            >
              <View style={styles.weaknessHeader}>
                <Text style={styles.weaknessName}>
                  {weakness.key.replace(/([A-Z])/g, ' $1').trim()}
                </Text>
                <Text style={styles.weaknessValue}>{weakness.value}/99</Text>
              </View>
              <Text style={styles.weeksEstimate}>
                ~{weeksToGoal} weeks to 90
              </Text>
              <Text style={styles.checkmark}>{isSelected ? '✓' : ''}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Generate Button */}
      <TouchableOpacity
        onPress={generatePlan}
        style={[styles.generateButton, selectedWeaknesses.length === 0 && styles.generateButtonDisabled]}
        disabled={selectedWeaknesses.length === 0}
      >
        <Text style={styles.generateButtonText}>
          📊 Generate {selectedWeaknesses.length > 0 ? selectedWeaknesses.length : 'a'} Week Plan
        </Text>
      </TouchableOpacity>

      {/* Plan Preview Modal */}
      {plan && (
        <Modal
          visible={showPreview}
          animationType="slide"
          transparent={false}
        >
          <ScrollView contentContainerStyle={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setShowPreview(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>✕ Close</Text>
            </TouchableOpacity>

            <Text style={styles.planTitle}>{plan.name}</Text>
            <Text style={styles.planSubtitle}>12-Week Progression</Text>

            {/* Estimated Gains */}
            <Text style={styles.gainsTitle}>📈 Estimated Gains</Text>
            {Object.entries(plan.estimatedGains).map(([attr, gains]) => (
              <View key={attr} style={styles.gainCard}>
                <Text style={styles.gainAttr}>
                  {attr.replace(/([A-Z])/g, ' $1').trim()}
                </Text>
                <View style={styles.gainBar}>
                  <View
                    style={[
                      styles.gainProgress,
                      {
                        width: `${(gains.to / 99) * 100}%`,
                        backgroundColor: gains.gain > 5 ? '#4CAF50' : gains.gain > 2 ? '#FFC107' : '#FF9800',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.gainText}>
                  {gains.from} → {gains.to} (+{gains.gain})
                </Text>
              </View>
            ))}

            {/* Weekly Schedule Preview */}
            <Text style={styles.scheduleTitle}>📅 First 4 Weeks</Text>
            {plan.schedule.slice(0, 4).map(week => (
              <View key={week.week} style={styles.weekCard}>
                <Text style={styles.weekNumber}>Week {week.week}</Text>
                <Text style={styles.focusAttr}>
                  Focus: {week.focus.key.replace(/([A-Z])/g, ' $1').trim()}
                </Text>
                <View>
                  {week.session.exercises.map((exercise, idx) => (
                    <Text key={idx} style={styles.exercise}>
                      • {exercise}
                    </Text>
                  ))}
                </View>
                <Text style={styles.sessionDuration}>
                  Duration: {week.session.duration} | {week.session.reps} sessions
                </Text>
              </View>
            ))}

            {/* Start Training Button */}
            <TouchableOpacity
              onPress={() => {
                // Save plan and navigate to progress tracking
                setShowPreview(false);
                router.push({
                  pathname: '/ProgressScreen',
                  params: { playerData: data, plan: JSON.stringify(plan) }
                });
              }}
              style={styles.startButton}
            >
              <Text style={styles.startButtonText}>🚀 Start Training</Text>
            </TouchableOpacity>
          </ScrollView>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#0d1b2a', paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f1faee', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#a8dadc', marginBottom: 24 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#f1faee', marginTop: 20, marginBottom: 12 },

  intensityGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  intensityButton: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1b263b',
    backgroundColor: '#1b263b',
    marginBottom: 10,
  },
  intensityButtonActive: { borderColor: '#1e88e5', backgroundColor: '#1e88e5' },
  intensityText: { color: '#f1faee', fontSize: 14, fontWeight: '600' },
  intensityDesc: { color: '#a8dadc', fontSize: 12, marginTop: 4 },

  weaknessGrid: { marginBottom: 24 },
  weaknessCard: {
    backgroundColor: '#1b263b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#1b263b',
  },
  weaknessCardActive: { borderColor: '#FFD700', backgroundColor: '#1b263b' },
  weaknessHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  weaknessName: { color: '#f1faee', fontSize: 14, fontWeight: '600' },
  weaknessValue: { color: '#FF6B6B', fontSize: 14, fontWeight: 'bold' },
  weeksEstimate: { color: '#a8dadc', fontSize: 12, marginBottom: 6 },
  checkmark: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' },

  generateButton: { backgroundColor: '#1e88e5', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  generateButtonDisabled: { opacity: 0.5 },
  generateButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  modalContainer: { padding: 20, backgroundColor: '#0d1b2a', paddingBottom: 40 },
  closeButton: { alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#1b263b', borderRadius: 8, marginBottom: 16 },
  closeText: { color: '#f1faee', fontSize: 14, fontWeight: '600' },

  planTitle: { fontSize: 28, fontWeight: 'bold', color: '#f1faee', marginBottom: 4 },
  planSubtitle: { fontSize: 16, color: '#a8dadc', marginBottom: 24 },

  gainsTitle: { fontSize: 18, fontWeight: '700', color: '#f1faee', marginBottom: 12 },
  gainCard: { backgroundColor: '#1b263b', borderRadius: 10, padding: 12, marginBottom: 10 },
  gainAttr: { color: '#f1faee', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  gainBar: { height: 8, backgroundColor: '#0d1b2a', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  gainProgress: { height: '100%', borderRadius: 4 },
  gainText: { color: '#a8dadc', fontSize: 12 },

  scheduleTitle: { fontSize: 18, fontWeight: '700', color: '#f1faee', marginTop: 24, marginBottom: 12 },
  weekCard: { backgroundColor: '#1b263b', borderRadius: 10, padding: 12, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#1e88e5' },
  weekNumber: { color: '#1e88e5', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  focusAttr: { color: '#FFD700', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  exercise: { color: '#a8dadc', fontSize: 12, marginBottom: 4 },
  sessionDuration: { color: '#a8dadc', fontSize: 12, marginTop: 8, fontStyle: 'italic' },

  startButton: { backgroundColor: '#4CAF50', paddingVertical: 16, borderRadius: 10, alignItems: 'center', marginTop: 24 },
  startButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
