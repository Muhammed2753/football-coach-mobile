import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function PositionAnalysisScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams();
  const [player, setPlayer] = useState(null);
  const [positionScores, setPositionScores] = useState({});

  useEffect(() => {
    if (data) {
      try {
        const playerData = JSON.parse(data);
        const attrs = playerData.attrs || playerData;
        setPlayer(playerData);
        calculatePositionScores(attrs);
      } catch (e) {
        console.error('Failed to parse player data:', e);
      }
    }
  }, [data]);

  const calculatePositionScores = (attrs) => {
    const p = attrs || {};
    setPositionScores({
      'GK': calculateGKScore(p),
      'CB': calculateCBScore(p),
      'LB': calculateLBScore(p),
      'RB': calculateRBScore(p),
      'CDM': calculateCDMScore(p),
      'CM': calculateCMScore(p),
      'CAM': calculateCAMScore(p),
      'LM': calculateLMScore(p),
      'RM': calculateRMScore(p),
      'LW': calculateLWScore(p),
      'RW': calculateRWScore(p),
      'ST': calculateSTScore(p),
    });
  };

  const calculateGKScore = (p) => Math.round(((p.reflexes || 50) + (p.diving || 50) + (p.handling || 50) + (p.positioning || 50)) / 4);
  const calculateCBScore = (p) => Math.round(((p.marking || 50) + (p.standingTackle || 50) + (p.strength || 50) + (p.jumping || 50)) / 4);
  const calculateLBScore = (p) => Math.round(((p.acceleration || 50) + (p.stamina || 50) + (p.crossing || 50) + (p.standingTackle || 50)) / 4);
  const calculateRBScore = (p) => Math.round(((p.acceleration || 50) + (p.stamina || 50) + (p.crossing || 50) + (p.standingTackle || 50)) / 4);
  const calculateCDMScore = (p) => Math.round(((p.interceptions || 50) + (p.shortPassing || 50) + (p.standingTackle || 50) + (p.strength || 50)) / 4);
  const calculateCMScore = (p) => Math.round(((p.shortPassing || 50) + (p.longPassing || 50) + (p.ballControl || 50) + (p.stamina || 50)) / 4);
  const calculateCAMScore = (p) => Math.round(((p.shortPassing || 50) + (p.longShots || 50) + (p.vision || 50) + (p.dribbling || 50)) / 4);
  const calculateLMScore = (p) => Math.round(((p.crossing || 50) + (p.acceleration || 50) + (p.stamina || 50) + (p.dribbling || 50)) / 4);
  const calculateRMScore = (p) => Math.round(((p.crossing || 50) + (p.acceleration || 50) + (p.stamina || 50) + (p.dribbling || 50)) / 4);
  const calculateLWScore = (p) => Math.round(((p.acceleration || 50) + (p.dribbling || 50) + (p.crossing || 50) + (p.finishing || 50)) / 4);
  const calculateRWScore = (p) => Math.round(((p.acceleration || 50) + (p.dribbling || 50) + (p.crossing || 50) + (p.finishing || 50)) / 4);
  const calculateSTScore = (p) => Math.round(((p.finishing || 50) + (p.shotPower || 50) + (p.positioning || 50) + (p.strength || 50)) / 4);

  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 70) return '#8BC34A';
    if (score >= 60) return '#FFC107';
    if (score >= 50) return '#FF9800';
    return '#F44336';
  };

  const getRecommendation = () => {
    const sortedPositions = Object.entries(positionScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    return sortedPositions;
  };

  if (!player) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Position Analysis</Text>
        <Text style={styles.noData}>No player data available</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const recommendations = getRecommendation();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Position Analysis</Text>
      <Text style={styles.playerName}>{player.name}</Text>

      <View style={styles.recommendationCard}>
        <Text style={styles.cardTitle}>🎯 Best Positions</Text>
        {recommendations.map(([position, score], index) => (
          <View key={position} style={styles.recommendationItem}>
            <Text style={styles.positionRank}>#{index + 1}</Text>
            <Text style={styles.positionName}>{position}</Text>
            <Text style={[styles.positionScore, { color: getScoreColor(score) }]}>
              {score}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.allPositionsCard}>
        <Text style={styles.cardTitle}>📊 All Positions</Text>
        <View style={styles.positionsGrid}>
          {Object.entries(positionScores).map(([position, score]) => (
            <View key={position} style={styles.positionItem}>
              <Text style={styles.positionLabel}>{position}</Text>
              <Text style={[styles.scoreText, { color: getScoreColor(score) }]}>
                {score}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back to Player Card</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#f1faee', textAlign: 'center', marginBottom: 10 },
  playerName: { fontSize: 18, color: '#a8dadc', textAlign: 'center', marginBottom: 20 },
  recommendationCard: {
    backgroundColor: '#1a2332',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ffd700'
  },
  allPositionsCard: {
    backgroundColor: '#1a2332',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#f1faee', marginBottom: 15 },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2c3e50'
  },
  positionRank: { fontSize: 16, fontWeight: 'bold', color: '#ffd700', width: 30 },
  positionName: { flex: 1, fontSize: 16, color: '#f1faee', fontWeight: '600' },
  positionScore: { fontSize: 18, fontWeight: 'bold' },
  positionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  positionItem: {
    width: '30%',
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10
  },
  positionLabel: { fontSize: 12, color: '#a8dadc', fontWeight: '600' },
  scoreText: { fontSize: 16, fontWeight: 'bold', marginTop: 5 },
  backButton: { backgroundColor: '#666', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  noData: { color: '#a8dadc', fontSize: 16, textAlign: 'center', marginBottom: 20 }
});