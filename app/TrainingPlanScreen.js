// app/TrainingPlanScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { createTrainingPlan, estimateWeeksToGoal, recommendIntensity } from '';
import { getAllPlayers } from '';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdBanner from '';

export default function TrainingPlanScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [intensity, setIntensity] = useState('moderate');
  const [selectedWeaknesses, setSelectedWeaknesses] = useState([]);
  const [plan, setPlan] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const { show: showInterstitial } = { show: () => false };

  useEffect(() => {
    const loadPlayer = async () => {
      try {
        if (data) {
          const parsedPlayer = JSON.parse(data);
          setPlayer(parsedPlayer);
          setIntensity(recommendIntensity(parsedPlayer.age, parsedPlayer.overall));
        } else {
          const players = await getAllPlayers();
          if (players.length > 0) {
            const latestPlayer = players[players.length - 1];
            setPlayer(latestPlayer);
            setIntensity(recommendIntensity(latestPlayer.age, latestPlayer.overall));
          } else {
            Alert.alert('No Player Found', 'Please create a profile first.', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          }
        }
      } catch (error) {
        console.error('Failed to load player:', error);
        Alert.alert('Error', 'Could not load your player data.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadPlayer();
  }, [data]);

  const getWeaknesses = () => {
    if (!player) return [];
    
    const attrs = player.attrs || player;
    const pos = player.positions?.[0] || player.preferredPosition || 'CM';
    
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
    return keys
      .map(key => ({ key, value: attrs[key] || 0 }))
      .filter(item => item.value < 70)
      .sort((a, b) => a.value - b.value);
  };

  const toggleWeakness = (weakness) => {
    if (selectedWeaknesses.find(w => w.key === weakness.key)) {
      setSelectedWeaknesses(selectedWeaknesses.filter(w => w.key !== weakness.key));
    } else {
      if (selectedWeaknesses.length < 6) {
        setSelectedWeaknesses([...selectedWeaknesses, weakness]);
      }
    }
  };

  const generatePlan = () => {
    const attrs = player.attrs || player;
    const trainingPlan = createTrainingPlan(
      attrs,
      selectedWeaknesses.length > 0 ? selectedWeaknesses : getWeaknesses().slice(0, 3),
      intensity
    );
    setPlan(trainingPlan);
    setShowPreview(true);
  };

  const estimateWeeksForGoal = (currentValue) => {
    return estimateWeeksToGoal(currentValue, 90, intensity === 'light' ? 0.5 : intensity === 'moderate' ? 1 : intensity === 'intense' ? 1.5 : 2);
  };

  const startTraining = async () => {
    try {
      // Save the training plan and player data for progress tracking
      await AsyncStorage.setItem('currentTrainingPlan', JSON.stringify(plan));
      await AsyncStorage.setItem('trainingPlayerData', JSON.stringify(player));
      
      setShowPreview(false);
      
      // âœ… Show interstitial before navigating to progress screen (30% chance)
      if (Math.random() > 0.7) {
        showInterstitial();
      }
      
      setTimeout(() => {
        router.push({
          pathname: '/ProgressScreen',
          params: { playerData: JSON.stringify(player), plan: JSON.stringify(plan) }
        });
      }, 500);
    } catch (error) {
      console.error('Error starting training:', error);
      Alert.alert('Error', 'Failed to start training plan');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading your player...</Text>
      </View>
    );
  }

  if (!player) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>â† Back</Text>
        </TouchableOpacity>
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>âš ï¸ Player Not Found</Text>
          <Text style={styles.errorText}>
            We couldn't load your player data.{'\n'}{'\n'}
            Please create a profile first, then try again.
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => router.push('/ProfileForm')}
          >
            <Text style={styles.retryButtonText}>âž• Create Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  const weaknesses = getWeaknesses();

  return (
    // âœ… Wrap in flex container for banner at bottom
    <View style={{ flex: 1, backgroundColor: '#0d1b2a' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>â† Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>ðŸ“‹ Custom Training Plan</Text>
        <Text style={styles.subtitle}>for {player.name} ({player.positions?.[0] || player.preferredPosition || 'CM'})</Text>

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
                <Text style={styles.checkmark}>{isSelected ? 'âœ“' : ''}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          onPress={generatePlan}
          style={styles.generateButton}
        >
          <Text style={styles.generateButtonText}>
            ðŸ“Š Generate Training Plan
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
                <Text style={styles.closeText}>âœ• Close</Text>
              </TouchableOpacity>

              <Text style={styles.planTitle}>{plan.name}</Text>
              <Text style={styles.planSubtitle}>12-Week Progression</Text>

              {/* Estimated Gains */}
              <Text style={styles.gainsTitle}>ðŸ“ˆ Estimated Gains</Text>
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
                    {gains.from} â†’ {gains.to} (+{gains.gain})
                  </Text>
                </View>
              ))}

              {/* Start Training Button */}
              <TouchableOpacity
                onPress={startTraining}
                style={styles.startButton}
              >
                <Text style={styles.startButtonText}>ðŸš€ Start Training</Text>
              </TouchableOpacity>
            </ScrollView>
          </Modal>
        )}
      </ScrollView>

      {/* âœ… Banner Ad - Sticks to bottom, hidden for VIP */}
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d1b2a',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#a8dadc',
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#a8dadc',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#1e88e5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  container: { padding: 20, backgroundColor: '#0d1b2a', paddingBottom: 40 },
  backButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#1b263b', borderRadius: 8, alignSelf: 'flex-start', marginBottom: 16 },
  backText: { color: '#f1faee', fontSize: 14, fontWeight: '600' },
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
  startButton: { backgroundColor: '#4CAF50', paddingVertical: 16, borderRadius: 10, alignItems: 'center', marginTop: 24 },
  startButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});