// app/ChallengesScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHALLENGES = [
  { id: 1, title: 'Train 5 Days This Week', icon: '🔥', target: 5, type: 'sessions', reward: '50 XP' },
  { id: 2, title: 'Complete 10 Hours Training', icon: '⏱️', target: 600, type: 'minutes', reward: '100 XP' },
  { id: 3, title: 'Practice Weak Foot', icon: '⚽', target: 1, type: 'weakfoot', reward: '30 XP' },
  { id: 4, title: 'Watch a Pro Match', icon: '📺', target: 1, type: 'watch', reward: '20 XP' },
  { id: 5, title: 'Share Your Progress', icon: '📤', target: 1, type: 'share', reward: '25 XP' },
];

export default function ChallengesScreen() {
  const router = useRouter();
  const [challenges, setChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const sessions = await AsyncStorage.getItem('training_sessions');
      const completed = await AsyncStorage.getItem('completed_challenges');
      
      if (completed) {
        setCompletedChallenges(JSON.parse(completed));
      }

      if (sessions) {
        const parsed = JSON.parse(sessions);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const thisWeekSessions = parsed.filter(s => {
          try {
            const sessionDate = new Date(s.date);
            return !isNaN(sessionDate) && sessionDate >= weekAgo;
          } catch { return false; }
        });

        const totalMinutes = thisWeekSessions.reduce((sum, s) => sum + parseInt(s.duration || 0), 0);
        const uniqueDays = new Set(thisWeekSessions.map(s => s.date)).size;

        const updatedChallenges = CHALLENGES.map(challenge => {
          let progress = 0;
          
          if (challenge.type === 'sessions') {
            progress = uniqueDays;
          } else if (challenge.type === 'minutes') {
            progress = totalMinutes;
          }

          return {
            ...challenge,
            progress,
            completed: progress >= challenge.target
          };
        });

        setChallenges(updatedChallenges);
      } else {
        setChallenges(CHALLENGES.map(c => ({ ...c, progress: 0, completed: false })));
      }
    } catch (error) {
      console.error('Failed to load challenges:', error);
    }
  };

  const claimReward = async (challengeId) => {
    try {
      const updated = [...completedChallenges, challengeId];
      await AsyncStorage.setItem('completed_challenges', JSON.stringify(updated));
      setCompletedChallenges(updated);
      loadChallenges();
    } catch (error) {
      console.error('Failed to claim reward:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🎯 Weekly Challenges</Text>
        <Text style={styles.subtitle}>Complete challenges to earn rewards</Text>
      </View>

      <ScrollView style={styles.list}>
        {challenges.map(challenge => {
          const isClaimed = completedChallenges.includes(challenge.id);
          const canClaim = challenge.completed && !isClaimed;

          return (
            <View key={challenge.id} style={styles.challengeCard}>
              <Text style={styles.icon}>{challenge.icon}</Text>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(100, (challenge.progress / challenge.target) * 100)}%` }
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {challenge.progress}/{challenge.target}
                </Text>
              </View>
              <View style={styles.rewardSection}>
                <Text style={styles.reward}>{challenge.reward}</Text>
                {canClaim && (
                  <TouchableOpacity
                    style={styles.claimButton}
                    onPress={() => claimReward(challenge.id)}
                  >
                    <Text style={styles.claimText}>Claim</Text>
                  </TouchableOpacity>
                )}
                {isClaimed && (
                  <View style={styles.claimedBadge}>
                    <Text style={styles.claimedText}>✓</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 Challenges reset every Monday. Complete them before time runs out!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  header: { padding: 20, alignItems: 'center' },
  backButton: { color: '#1e88e5', fontSize: 16, fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffd700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#a8dadc', textAlign: 'center' },
  list: { flex: 1, padding: 20 },
  challengeCard: { backgroundColor: '#1b263b', borderRadius: 12, padding: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 32, marginRight: 15 },
  challengeInfo: { flex: 1 },
  challengeTitle: { fontSize: 16, color: '#f1faee', fontWeight: 'bold', marginBottom: 8 },
  progressBar: { height: 8, backgroundColor: '#0d1b2a', borderRadius: 4, overflow: 'hidden', marginBottom: 5 },
  progressFill: { height: '100%', backgroundColor: '#1e88e5', borderRadius: 4 },
  progressText: { fontSize: 12, color: '#a8dadc' },
  rewardSection: { alignItems: 'center' },
  reward: { fontSize: 14, color: '#ffd700', fontWeight: 'bold', marginBottom: 8 },
  claimButton: { backgroundColor: '#28a745', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6 },
  claimText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  claimedBadge: { backgroundColor: '#28a745', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  claimedText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  infoBox: { backgroundColor: '#1b263b', padding: 15, margin: 20, borderRadius: 8 },
  infoText: { color: '#a8dadc', fontSize: 14, textAlign: 'center' },
});
