// app/WeaknessScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
// ⚠️ Update path if your file is named playerDatabase.js
import { getAllPlayers } from './utils/playerDatabase';

const WeaknessScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [weaknesses, setWeaknesses] = useState([]);

  // Attribute definitions with thresholds for "weak" detection
  const ATTRIBUTES = [
    { key: 'pace', label: 'Pace', icon: '🏃', threshold: 60 },
    { key: 'shooting', label: 'Shooting', icon: '⚽', threshold: 60 },
    { key: 'passing', label: 'Passing', icon: '🎯', threshold: 60 },
    { key: 'dribbling', label: 'Dribbling', icon: '🎨', threshold: 60 },
    { key: 'defending', label: 'Defending', icon: '🛡️', threshold: 60 },
    { key: 'physical', label: 'Physical', icon: '💪', threshold: 60 },
  ];

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const data = await getAllPlayers();
      setPlayers(data || []);
    } catch (error) {
      console.error('Failed to load players:', error);
      Alert.alert('Error', 'Could not load player data');
    } finally {
      setLoading(false);
    }
  };

  // Analyze a player's attributes to find weaknesses
  const analyzeWeaknesses = (player) => {
    if (!player?.attrs) return [];
    
    const found = [];
    
    for (const attr of ATTRIBUTES) {
      const value = player.attrs[attr.key];
      if (value !== undefined && value < attr.threshold) {
        found.push({
          ...attr,
          value,
          improvement: attr.threshold - value,
          priority: value < 40 ? 'high' : value < 50 ? 'medium' : 'low',
        });
      }
    }
    
    // Sort by priority then by improvement needed
    return found.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.improvement - a.improvement;
    });
  };

  const handleSelectPlayer = (player) => {
    setSelectedPlayer(player);
    const foundWeaknesses = analyzeWeaknesses(player);
    setWeaknesses(foundWeaknesses);
  };

  const handleBack = () => {
    if (selectedPlayer) {
      setSelectedPlayer(null);
      setWeaknesses([]);
    } else {
      router.back();
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FFC107';
      case 'low': return '#4CAF50';
      default: return '#a8dadc';
    }
  };

  const getTrainingTip = (weakness) => {
    const tips = {
      pace: '🏃 Sprint intervals: 30s max effort, 90s rest x 8 rounds',
      shooting: '⚽ Wall finishing: 20 reps each corner, focus on placement',
      passing: '🎯 Target passing: Hit cones from 10 yards, both feet',
      dribbling: '🎨 Cone weaves: Light touches, change of pace every 3 touches',
      defending: '🛡️ Shadow defending: Mirror a partner\'s movements without contact',
      physical: '💪 Core circuit: Plank, squats, lunges - 3 rounds',
    };
    return tips[weakness.key] || 'Focus on consistent practice!';
  };

  // Loading state
  if (loading && !selectedPlayer) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ffd700" />
        <Text style={styles.loadingText}>Analyzing players...</Text>
      </View>
    );
  }

  // Weakness detail view
  if (selectedPlayer && weaknesses.length > 0) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🔍 {selectedPlayer.name}'s Weaknesses</Text>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📊 Analysis Summary</Text>
          <Text style={styles.summaryText}>
            Found {weaknesses.length} area{weaknesses.length !== 1 ? 's' : ''} for improvement
          </Text>
          <Text style={styles.summarySubtext}>
            Focus on HIGH priority items first for fastest progress
          </Text>
        </View>

        {/* Weakness List */}
        <Text style={styles.sectionTitle}>🎯 Areas to Improve</Text>
        {weaknesses.map((weak, index) => (
          <View key={index} style={styles.weaknessCard}>
            <View style={styles.weaknessHeader}>
              <Text style={styles.weaknessIcon}>{weak.icon}</Text>
              <View style={styles.weaknessInfo}>
                <Text style={styles.weaknessName}>{weak.label}</Text>
                <Text style={styles.weaknessValue}>
                  Current: {weak.value} → Target: {weak.threshold}
                </Text>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(weak.priority) }]}>
                <Text style={styles.priorityText}>{weak.priority.toUpperCase()}</Text>
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(weak.value / 99) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                +{weak.improvement} to reach target
              </Text>
            </View>
            
            <View style={styles.tipBox}>
              <Text style={styles.tipLabel}>💡 Quick Drill:</Text>
              <Text style={styles.tipText}>{getTrainingTip(weak)}</Text>
            </View>
          </View>
        ))}

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            Alert.alert(
              'Start Training Plan?',
              `Create a custom plan focusing on ${weaknesses[0]?.label.toLowerCase()}?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Create Plan', 
                  onPress: () => router.push({
                    pathname: '/TrainingPlanScreen',
                    params: { 
                      playerId: selectedPlayer.id,
                      focus: weaknesses[0]?.key,
                      weaknesses: JSON.stringify(weaknesses.map(w => w.key))
                    }
                  })
                }
              ]
            );
          }}
        >
          <Text style={styles.actionButtonText}>🚀 Create Training Plan</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Player selection view (no weaknesses found or no player selected)
  if (selectedPlayer && weaknesses.length === 0) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.center}>
        <Text style={styles.emptyIcon}>🎉</Text>
        <Text style={styles.emptyTitle}>All Stats Looking Great!</Text>
        <Text style={styles.emptyText}>
          {selectedPlayer.name} has no significant weaknesses. 
          Keep up the excellent work!
        </Text>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
          <Text style={styles.secondaryButtonText}>← View Another Player</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Main player list view
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔍 Find Weaknesses</Text>
        <Text style={styles.subtitle}>Select a player to analyze</Text>
      </View>

      {/* Player List */}
      {players.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No players found</Text>
          <Text style={styles.emptySubtext}>Create a player in Profile to get started</Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => router.push('/ProfileForm')}
          >
            <Text style={styles.createButtonText}>+ Create Player</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.playerGrid}>
          {players.map((player) => {
            const playerWeaknesses = analyzeWeaknesses(player);
            const highPriority = playerWeaknesses.filter(w => w.priority === 'high').length;
            
            return (
              <TouchableOpacity
                key={player.id}
                style={styles.playerCard}
                onPress={() => handleSelectPlayer(player)}
              >
                <View style={styles.playerHeader}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  {highPriority > 0 && (
                    <View style={styles.alertBadge}>
                      <Text style={styles.alertText}>⚠️ {highPriority}</Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.playerPosition}>{player.position || 'Position'}</Text>
                
                <View style={styles.statsRow}>
                  <Text style={styles.statLabel}>Overall</Text>
                  <Text style={styles.statValue}>{player.overall || 0}</Text>
                </View>
                
                {playerWeaknesses.length > 0 ? (
                  <Text style={styles.weaknessCount}>
                    {playerWeaknesses.length} area{playerWeaknesses.length !== 1 ? 's' : ''} to improve
                  </Text>
                ) : (
                  <Text style={styles.noWeaknesses}>✅ All stats balanced</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

export default WeaknessScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#0d1b2a' },
  loadingText: { color: '#a8dadc', fontSize: 16, marginTop: 12 },
  
  // Header
  header: { marginBottom: 24 },
  backButton: { padding: 8, alignSelf: 'flex-start', marginBottom: 12 },
  backText: { color: '#1e88e5', fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#ffd700', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#a8dadc' },
  
  // Summary Card
  summaryCard: { 
    backgroundColor: '#1b263b', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#1e88e5'
  },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', color: '#f1faee', marginBottom: 8 },
  summaryText: { fontSize: 14, color: '#a8dadc', marginBottom: 4 },
  summarySubtext: { fontSize: 12, color: '#6c757d', fontStyle: 'italic' },
  
  // Section Titles
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#f1faee', marginBottom: 16 },
  
  // Weakness Cards
  weaknessCard: { 
    backgroundColor: '#1b263b', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a3f5f'
  },
  weaknessHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  weaknessIcon: { fontSize: 24, marginRight: 12 },
  weaknessInfo: { flex: 1 },
  weaknessName: { fontSize: 16, fontWeight: 'bold', color: '#f1faee', marginBottom: 4 },
  weaknessValue: { fontSize: 13, color: '#a8dadc' },
  priorityBadge: { 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  priorityText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  
  // Progress Bar
  progressContainer: { marginBottom: 12 },
  progressTrack: { 
    height: 8, 
    backgroundColor: '#0d1b2a', 
    borderRadius: 4, 
    overflow: 'hidden',
    marginBottom: 6
  },
  progressFill: { height: '100%', backgroundColor: '#1e88e5', borderRadius: 4 },
  progressText: { fontSize: 12, color: '#a8dadc', textAlign: 'right' },
  
  // Tip Box
  tipBox: { 
    backgroundColor: '#0d1b2a', 
    padding: 12, 
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50'
  },
  tipLabel: { fontSize: 12, color: '#4CAF50', fontWeight: 'bold', marginBottom: 4 },
  tipText: { fontSize: 13, color: '#a8dadc', lineHeight: 18 },
  
  // Action Button
  actionButton: { 
    backgroundColor: '#4CAF50', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    marginTop: 8
  },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  // Empty States
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#f1faee', marginBottom: 8, textAlign: 'center' },
  emptyText: { fontSize: 14, color: '#a8dadc', textAlign: 'center', marginBottom: 24 },
  emptySubtext: { fontSize: 13, color: '#6c757d', textAlign: 'center', marginBottom: 20 },
  
  // Player Grid
  playerGrid: { gap: 12 },
  playerCard: { 
    backgroundColor: '#1b263b', 
    padding: 16, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a3f5f'
  },
  playerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  playerName: { fontSize: 16, fontWeight: 'bold', color: '#f1faee' },
  alertBadge: { 
    backgroundColor: '#FF6B6B', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 10 
  },
  alertText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  playerPosition: { fontSize: 13, color: '#a8dadc', marginBottom: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statLabel: { fontSize: 13, color: '#a8dadc' },
  statValue: { fontSize: 13, color: '#ffd700', fontWeight: 'bold' },
  weaknessCount: { fontSize: 12, color: '#FFC107' },
  noWeaknesses: { fontSize: 12, color: '#4CAF50' },
  
  // Buttons
  createButton: { 
    backgroundColor: '#28a745', 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 8 
  },
  createButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  secondaryButton: { 
    backgroundColor: '#1b263b', 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 8,
    marginTop: 16
  },
  secondaryButtonText: { color: '#1e88e5', fontSize: 14, fontWeight: 'bold' },
});