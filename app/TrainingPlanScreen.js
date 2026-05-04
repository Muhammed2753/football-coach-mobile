// app/TrainingPlanScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
// ⚠️ Update path if your file is named differently
import { createTrainingPlan, estimateWeeksToGoal, recommendIntensity } from './utils/TrainingEngine';
import AdBanner from './components/AdBanner';

const TrainingPlanScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // State declarations
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIntensity, setSelectedIntensity] = useState('moderate');
  const [selectedWeaknesses, setSelectedWeaknesses] = useState([]);
  const [plan, setPlan] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [weeksToGoal, setWeeksToGoal] = useState(12);

  // Weakness options
  const weaknessOptions = [
    { key: 'pace', label: 'Pace', current: params.pace || 65 },
    { key: 'shooting', label: 'Shooting', current: params.shooting || 60 },
    { key: 'passing', label: 'Passing', current: params.passing || 70 },
    { key: 'dribbling', label: 'Dribbling', current: params.dribbling || 68 },
    { key: 'defending', label: 'Defending', current: params.defending || 55 },
    { key: 'physical', label: 'Physical', current: params.physical || 62 },
  ];

  // Intensity options
  const intensityOptions = [
    { key: 'light', label: 'Light', desc: '2-3 sessions/week', color: '#4CAF50' },
    { key: 'moderate', label: 'Moderate', desc: '4-5 sessions/week', color: '#2196F3' },
    { key: 'intense', label: 'Intense', desc: '6-7 sessions/week', color: '#F44336' },
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      // Load player data if passed via params
      if (params.playerId) {
        // TODO: Fetch player data from database
        console.log('Loading player:', params.playerId);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const toggleWeakness = (key) => {
    setSelectedWeaknesses(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key) 
        : [...prev, key]
    );
  };

  const generatePlan = async () => {
    if (selectedWeaknesses.length === 0) {
      Alert.alert('Select Weaknesses', 'Please choose at least one area to improve.');
      return;
    }

    try {
      setLoading(true);
      
      const newPlan = await createTrainingPlan({
        weaknesses: selectedWeaknesses,
        intensity: selectedIntensity,
        goal: params.goal || 'overall_improvement',
      });
      
      const weeks = await estimateWeeksToGoal({
        weaknesses: selectedWeaknesses,
        intensity: selectedIntensity,
      });
      
      setPlan(newPlan);
      setWeeksToGoal(weeks);
      setShowPreview(true);
      
    } catch (err) {
      console.error('Plan generation failed:', err);
      Alert.alert('Error', 'Failed to generate training plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startTraining = () => {
    Alert.alert(
      'Start Training?',
      `Begin your ${weeksToGoal}-week ${selectedIntensity} intensity plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Now', 
          onPress: () => {
            router.push({
              pathname: '/TrainingSession',
              params: { planId: plan?.id, intensity: selectedIntensity }
            });
          }
        }
      ]
    );
  };

  const handleGoBack = () => {
    router.back();
  };

  // Loading state
  if (loading && !plan) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ffd700" />
        <Text style={styles.loadingText}>Creating your plan...</Text>
      </View>
    );
  }

  // Error state
  if (error && !plan) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadInitialData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0d1b2a' }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>📋 Training Plan</Text>
          <Text style={styles.subtitle}>Build your custom 12-week program</Text>
        </View>

        {/* Intensity Selection */}
        <Text style={styles.sectionTitle}>🎯 Training Intensity</Text>
        <View style={styles.intensityGrid}>
          {intensityOptions.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.intensityButton,
                selectedIntensity === opt.key && styles.intensityButtonActive,
                { borderColor: selectedIntensity === opt.key ? opt.color : '#1b263b' }
              ]}
              onPress={() => setSelectedIntensity(opt.key)}
            >
              <Text style={styles.intensityText}>{opt.label}</Text>
              <Text style={styles.intensityDesc}>{opt.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weakness Selection */}
        <Text style={styles.sectionTitle}>⚠️ Areas to Improve</Text>
        <View style={styles.weaknessGrid}>
          {weaknessOptions.map((weak) => (
            <TouchableOpacity
              key={weak.key}
              style={[
                styles.weaknessCard,
                selectedWeaknesses.includes(weak.key) && styles.weaknessCardActive
              ]}
              onPress={() => toggleWeakness(weak.key)}
            >
              <View style={styles.weaknessHeader}>
                <Text style={styles.weaknessName}>{weak.label}</Text>
                <Text style={styles.weaknessValue}>{weak.current}</Text>
              </View>
              <Text style={styles.weeksEstimate}>
                Est. improvement: {Math.round((99 - weak.current) * 0.3)} pts
              </Text>
              {selectedWeaknesses.includes(weak.key) && (
                <Text style={styles.checkmark}>✓ Selected</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Generate Button */}
        <TouchableOpacity 
          style={styles.generateButton}
          onPress={generatePlan}
          disabled={loading || selectedWeaknesses.length === 0}
        >
          <Text style={styles.generateButtonText}>
            {loading ? 'Generating...' : '🚀 Generate My Plan'}
          </Text>
        </TouchableOpacity>

        {/* Plan Preview Modal */}
        <Modal
          visible={showPreview}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowPreview(false)}
        >
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalContainer}>
              <TouchableOpacity
                onPress={() => setShowPreview(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>✕ Close</Text>
              </TouchableOpacity>

              <Text style={styles.planTitle}>{plan?.name || 'Your Training Plan'}</Text>
              <Text style={styles.planSubtitle}>{weeksToGoal}-Week Progression</Text>

              {/* Estimated Gains */}
              <Text style={styles.gainsTitle}>📈 Estimated Gains</Text>
              {plan?.estimatedGains && Object.entries(plan.estimatedGains).map(([attr, gains]) => (
                <View key={attr} style={styles.gainCard}>
                  <Text style={styles.gainAttr}>
                    {attr.charAt(0).toUpperCase() + attr.slice(1)}
                  </Text>
                  <View style={styles.gainBar}>
                    <View
                      style={[
                        styles.gainProgress,
                        {
                          width: `${Math.min(100, (gains.to / 99) * 100)}%`,
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

              {/* Start Training Button */}
              <TouchableOpacity
                onPress={startTraining}
                style={styles.startButton}
              >
                <Text style={styles.startButtonText}>🚀 Start Training</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      </ScrollView>

      {/* Banner Ad */}
      <AdBanner />
    </View>
  );
};

export default TrainingPlanScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d1b2a', padding: 20 },
  loadingText: { color: '#a8dadc', fontSize: 16, marginTop: 12 },
  errorTitle: { fontSize: 20, fontWeight: 'bold', color: '#FF6B6B', marginBottom: 16, textAlign: 'center' },
  errorText: { fontSize: 14, color: '#a8dadc', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  retryButton: { backgroundColor: '#1e88e5', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  
  // Header
  header: { marginBottom: 24 },
  backButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#1b263b', borderRadius: 8, alignSelf: 'flex-start', marginBottom: 16 },
  backText: { color: '#f1faee', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f1faee', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#a8dadc', marginBottom: 24 },
  
  // Sections
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#f1faee', marginTop: 20, marginBottom: 12 },
  
  // Intensity Grid
  intensityGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  intensityButton: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: '#1b263b',
    marginBottom: 10,
    alignItems: 'center',
  },
  intensityButtonActive: { borderColor: '#1e88e5', backgroundColor: '#1e3a5f' },
  intensityText: { color: '#f1faee', fontSize: 14, fontWeight: '600' },
  intensityDesc: { color: '#a8dadc', fontSize: 12, marginTop: 4, textAlign: 'center' },
  
  // Weakness Grid
  weaknessGrid: { marginBottom: 24 },
  weaknessCard: {
    backgroundColor: '#1b263b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  weaknessCardActive: { borderColor: '#FFD700', backgroundColor: '#1e3a5f' },
  weaknessHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  weaknessName: { color: '#f1faee', fontSize: 14, fontWeight: '600' },
  weaknessValue: { color: '#FF6B6B', fontSize: 14, fontWeight: 'bold' },
  weeksEstimate: { color: '#a8dadc', fontSize: 12, marginBottom: 6 },
  checkmark: { color: '#FFD700', fontSize: 12, fontWeight: 'bold' },
  
  // Generate Button
  generateButton: { backgroundColor: '#1e88e5', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  generateButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#0d1b2a', borderRadius: 16, padding: 20, width: '100%', maxWidth: 450, maxHeight: '90%' },
  closeButton: { alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#1b263b', borderRadius: 8, marginBottom: 16 },
  closeText: { color: '#f1faee', fontSize: 14, fontWeight: '600' },
  planTitle: { fontSize: 24, fontWeight: 'bold', color: '#f1faee', marginBottom: 4, textAlign: 'center' },
  planSubtitle: { fontSize: 16, color: '#a8dadc', marginBottom: 24, textAlign: 'center' },
  gainsTitle: { fontSize: 18, fontWeight: '700', color: '#f1faee', marginBottom: 12 },
  gainCard: { backgroundColor: '#1b263b', borderRadius: 10, padding: 12, marginBottom: 10 },
  gainAttr: { color: '#f1faee', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  gainBar: { height: 8, backgroundColor: '#0d1b2a', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  gainProgress: { height: '100%', borderRadius: 4 },
  gainText: { color: '#a8dadc', fontSize: 12 },
  startButton: { backgroundColor: '#4CAF50', paddingVertical: 16, borderRadius: 10, alignItems: 'center', marginTop: 24 },
  startButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});