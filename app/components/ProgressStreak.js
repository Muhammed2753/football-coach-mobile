import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProgressStreak = ({ streak, maxStreak = 30 }) => {
  const getStreakColor = (days) => {
    if (days >= 30) return '#FFD700'; // Gold
    if (days >= 14) return '#C0C0C0'; // Silver
    if (days >= 7) return '#CD7F32';  // Bronze
    return '#4CAF50'; // Green
  };

  const getStreakEmoji = (days) => {
    if (days >= 30) return '🔥';
    if (days >= 14) return '⚡';
    if (days >= 7) return '💪';
    return '🌟';
  };

  return (
    <View style={styles.container}>
      <View style={styles.streakHeader}>
        <Text style={styles.streakEmoji}>{getStreakEmoji(streak)}</Text>
        <Text style={[styles.streakNumber, { color: getStreakColor(streak) }]}>
          {streak}
        </Text>
        <Text style={styles.streakLabel}>Day Streak</Text>
      </View>
      
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${Math.min((streak / maxStreak) * 100, 100)}%`,
              backgroundColor: getStreakColor(streak)
            }
          ]} 
        />
      </View>
      
      <Text style={styles.progressText}>
        {streak < maxStreak ? `${maxStreak - streak} days to next milestone` : 'Max streak achieved!'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a2332',
    borderRadius: 12,
    padding: 15,
    margin: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#457b9d',
  },
  streakHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  streakEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  streakLabel: {
    color: '#a8dadc',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#2c3e50',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: '#a8dadc',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ProgressStreak;