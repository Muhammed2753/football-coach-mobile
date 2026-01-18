// app/WeaknessScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function WeaknessScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams();
  
  if (!data) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d1b2a' }}>
        <Text style={{ color: '#f1faee', fontSize: 16 }}>Loading player data...</Text>
      </View>
    );
  }
  
  const player = JSON.parse(data);
  const pos = player.positions[0];
  const attrs = player.attrs;

  // Define position-specific key attributes
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
  const weaknesses = keys
    .map(key => ({ key, value: attrs[key] || 0 }))
    .filter(item => item.value < 50)
    .sort((a, b) => a.value - b.value);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🎯 Your Weaknesses as a {pos}</Text>

      {weaknesses.length > 0 ? (
        weaknesses.map(({ key, value }) => (
          <View key={key} style={styles.weakItem}>
            <Text style={styles.weakLabel}>{key.replace(/([A-Z])/g, ' $1').trim()}:</Text>
            <Text style={styles.weakValue}>{value}/99</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noWeak}>✅ No major weaknesses! Keep training to stay sharp.</Text>
      )}

      <Text style={[styles.title, { marginTop: 24 }]}>💡 How to Improve</Text>
      {player.tips.map((tip, i) => (
        <Text key={i} style={styles.tip}>• {tip}</Text>
      ))}

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Back to Card</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#0d1b2a' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#f1faee', marginBottom: 16 },
  noWeak: { color: '#a8dadc', fontSize: 16, fontStyle: 'italic' },
  weakItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1b263b' },
  weakLabel: { color: '#a8dadc', fontSize: 16 },
  weakValue: { color: '#ff6b6b', fontSize: 16, fontWeight: 'bold' },
  tip: { color: '#a8dadc', fontSize: 16, marginVertical: 6, lineHeight: 22 },
  back: { marginTop: 20, color: '#1e88e5', fontSize: 16, textDecorationLine: 'underline', textAlign: 'center' },
});