// app/LeaderboardScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LeaderboardScreen() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState([]);
  const [filter, setFilter] = useState('sessions'); // sessions, hours, streak

  useEffect(() => {
    loadLeaderboard();
  }, [filter]);

  const loadLeaderboard = async () => {
    try {
      const sessions = await AsyncStorage.getItem('training_sessions');
      const user = await AsyncStorage.getItem('user');

      const parsed = sessions ? JSON.parse(sessions) : [];
      const userData = user ? JSON.parse(user) : { name: 'You' };

      const totalSessions = parsed.length;
      const totalMinutes = parsed.reduce((sum, s) => sum + parseInt(s.duration || 0), 0);
      const totalHours = Math.floor(totalMinutes / 60);

      // Deduplicated streak calculation
      let streak = 0;
      const uniqueDates = [...new Set(parsed.map(s => s.date))].sort((a, b) => b.localeCompare(a));
      let current = new Date().toISOString().split('T')[0];
      for (const d of uniqueDates) {
        if (d === current) {
          streak++;
          const prev = new Date(current);
          prev.setDate(prev.getDate() - 1);
          current = prev.toISOString().split('T')[0];
        } else if (d < current) break;
      }

      const mockData = [
        { name: userData.name || 'You', sessions: totalSessions, hours: totalHours, streak, isCurrentUser: true },
        { name: 'Ahmed K.', sessions: 87, hours: 145, streak: 12 },
        { name: 'Sarah M.', sessions: 76, hours: 128, streak: 8 },
        { name: 'David O.', sessions: 65, hours: 110, streak: 15 },
        { name: 'Emma L.', sessions: 54, hours: 92, streak: 6 },
      ];

      setLeaderboard(mockData.sort((a, b) => b[filter] - a[filter]));
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  const getMedal = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🏆 Leaderboard</Text>
        <Text style={styles.subtitle}>Compete with other players</Text>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'sessions' && styles.activeFilter]}
          onPress={() => setFilter('sessions')}
        >
          <Text style={[styles.filterText, filter === 'sessions' && styles.activeFilterText]}>
            Sessions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'hours' && styles.activeFilter]}
          onPress={() => setFilter('hours')}
        >
          <Text style={[styles.filterText, filter === 'hours' && styles.activeFilterText]}>
            Hours
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'streak' && styles.activeFilter]}
          onPress={() => setFilter('streak')}
        >
          <Text style={[styles.filterText, filter === 'streak' && styles.activeFilterText]}>
            Streak
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {leaderboard.map((player, index) => (
          <View
            key={index}
            style={[styles.playerCard, player.isCurrentUser && styles.currentUserCard]}
          >
            <Text style={styles.rank}>{getMedal(index)}</Text>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>
                {player.name} {player.isCurrentUser && '(You)'}
              </Text>
              <Text style={styles.playerStats}>
                {filter === 'sessions' && `${player.sessions} sessions`}
                {filter === 'hours' && `${player.hours} hours`}
                {filter === 'streak' && `${player.streak} day streak`}
              </Text>
            </View>
            <Text style={styles.score}>{player[filter]}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 Keep training to climb the ranks! Leaderboard updates daily.
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
  filterContainer: { flexDirection: 'row', padding: 20, gap: 10 },
  filterButton: { flex: 1, backgroundColor: '#1b263b', padding: 12, borderRadius: 8, alignItems: 'center' },
  activeFilter: { backgroundColor: '#1e88e5' },
  filterText: { color: '#a8dadc', fontSize: 14, fontWeight: '600' },
  activeFilterText: { color: '#fff' },
  list: { flex: 1, paddingHorizontal: 20 },
  playerCard: { backgroundColor: '#1b263b', borderRadius: 12, padding: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  currentUserCard: { borderWidth: 2, borderColor: '#1e88e5' },
  rank: { fontSize: 24, fontWeight: 'bold', marginRight: 15, minWidth: 40 },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 16, color: '#f1faee', fontWeight: 'bold', marginBottom: 4 },
  playerStats: { fontSize: 12, color: '#a8dadc' },
  score: { fontSize: 20, fontWeight: 'bold', color: '#ffd700' },
  infoBox: { backgroundColor: '#1b263b', padding: 15, margin: 20, borderRadius: 8 },
  infoText: { color: '#a8dadc', fontSize: 14, textAlign: 'center' },
});
