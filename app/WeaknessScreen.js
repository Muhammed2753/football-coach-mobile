// app/WeaknessScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getAllPlayers } from './utils/playerDatabase';

export default function WeaknessScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlayer = async () => {
      try {
        // Try to get player from params first
        if (data) {
          setPlayer(JSON.parse(data));
        } else {
          // Fallback to latest player from database
          const players = await getAllPlayers();
          if (players.length > 0) {
            setPlayer(players[players.length - 1]);
          } else {
            alert('No player found. Create a profile first.');
            router.replace('/ProfileForm');
          }
        }
      } catch (err) {
        console.error(err);
        alert('Error loading player');
        router.replace('/ProfileForm');
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
    
    // Position-specific attributes
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

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Loading weaknesses...</Text>
      </View>
    );
  }

  if (!player) return null;

  const weaknesses = getWeaknesses();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🎯 Your Weaknesses</Text>
      <Text style={styles.subtitle}>{player.name} - {player.positions?.[0] || 'CM'}</Text>

      {weaknesses.length > 0 ? (
        <View style={styles.weaknessList}>
          {weaknesses.map((weakness, index) => (
            <View key={weakness.key} style={styles.weaknessCard}>
              <View style={styles.weaknessHeader}>
                <Text style={styles.weaknessRank}>#{index + 1}</Text>
                <Text style={styles.weaknessName}>
                  {weakness.key.replace(/([A-Z])/g, ' $1').trim()}
                </Text>
                <Text style={styles.weaknessValue}>{weakness.value}/99</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${(weakness.value / 99) * 100}%`,
                      backgroundColor: weakness.value < 40 ? '#d32f2f' : weakness.value < 60 ? '#ff9800' : '#ffc107'
                    }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.noWeaknesses}>
          <Text style={styles.noWeaknessesText}>🎉 No Major Weaknesses!</Text>
          <Text style={styles.noWeaknessesSubtext}>All your key attributes are above 70!</Text>
        </View>
      )}

      <TouchableOpacity 
        onPress={() => router.push({ pathname: '/TrainingPlanScreen', params: { data: JSON.stringify(player) } })} 
        style={styles.trainingButton}
      >
        <Text style={styles.trainingButtonText}>📋 Create Training Plan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d1b2a' },
  text: { color: '#fff', fontSize: 16 },
  container: { padding: 20, backgroundColor: '#0d1b2a', paddingBottom: 40 },
  backButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#1b263b', borderRadius: 8, alignSelf: 'flex-start', marginBottom: 16 },
  backText: { color: '#f1faee', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f1faee', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#a8dadc', marginBottom: 24, textAlign: 'center' },
  weaknessList: { marginBottom: 24 },
  weaknessCard: { backgroundColor: '#1b263b', borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#d32f2f' },
  weaknessHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  weaknessRank: { fontSize: 18, fontWeight: 'bold', color: '#d32f2f', marginRight: 12, minWidth: 30 },
  weaknessName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#f1faee' },
  weaknessValue: { fontSize: 16, fontWeight: 'bold', color: '#d32f2f' },
  progressBar: { height: 8, backgroundColor: '#0d1b2a', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  noWeaknesses: { backgroundColor: '#1b263b', borderRadius: 12, padding: 24, alignItems: 'center', marginBottom: 24, borderLeftWidth: 4, borderLeftColor: '#4CAF50' },
  noWeaknessesText: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50', marginBottom: 8 },
  noWeaknessesSubtext: { fontSize: 14, color: '#a8dadc', textAlign: 'center' },
  trainingButton: { backgroundColor: '#1e88e5', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  trainingButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
