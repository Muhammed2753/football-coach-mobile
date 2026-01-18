// app/PlayerCardScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PlayerCard from './components/PlayerCard';

export default function PlayerCardScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams();
  
  if (!data) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d1b2a' }}>
        <Text style={{ color: '#f1faee', fontSize: 16 }}>Loading player card...</Text>
      </View>
    );
  }
  
  const player = JSON.parse(data);
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🎴 Your Player Card</Text>
      
      {/* Display the PlayerCard component */}
      <PlayerCard data={player} onBack={() => router.back()} />
      
      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.nextButton]}
          onPress={() => {
            router.push({
              pathname: '/TrainingPlanScreen',
              params: { data: JSON.stringify(player) }
            });
          }}
        >
          <Text style={styles.buttonText}>📋 Create Training Plan</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.weakButton]}
          onPress={() => {
            router.push({
              pathname: '/WeaknessScreen',
              params: { data: JSON.stringify(player) }
            });
          }}
        >
          <Text style={styles.buttonText}>🎯 View Weaknesses</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.backButton]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>◀️ Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0d1b2a',
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1faee',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 12,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    backgroundColor: '#1e88e5',
  },
  weakButton: {
    backgroundColor: '#f57c00',
  },
  backButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
