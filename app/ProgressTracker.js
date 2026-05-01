// app/ProgressTracker.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProgressTracker() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSession, setNewSession] = useState({
    date: new Date().toISOString().split('T')[0],
    activity: '',
    duration: '',
    notes: ''
  });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const stored = await AsyncStorage.getItem('training_sessions');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSessions(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setSessions([]);
    }
  };

  const saveSessions = async (updatedSessions) => {
    try {
      await AsyncStorage.setItem('training_sessions', JSON.stringify(updatedSessions));
      setSessions(updatedSessions);
    } catch (error) {
      console.error('Failed to save sessions:', error);
    }
  };

  const addSession = () => {
    if (!newSession.activity || !newSession.duration) {
      Alert.alert('Missing Info', 'Please fill in activity and duration');
      return;
    }

    const session = {
      id: Date.now(),
      ...newSession,
      timestamp: new Date().toISOString()
    };

    const updated = [session, ...sessions];
    saveSessions(updated);
    
    setNewSession({
      date: new Date().toISOString().split('T')[0],
      activity: '',
      duration: '',
      notes: ''
    });
    setShowAddForm(false);
    Alert.alert('Success!', 'Training session logged');
  };

  const deleteSession = (id) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = sessions.filter(s => s.id !== id);
            saveSessions(updated);
          }
        }
      ]
    );
  };

  const stats = React.useMemo(() => {
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + parseInt(s.duration || 0), 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const thisWeek = sessions.filter(s => {
      try {
        const sessionDate = new Date(s.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return sessionDate >= weekAgo;
      } catch {
        return false;
      }
    }).length;

    // additional analytics
    const avgDuration = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
    const longest = sessions.reduce((max, s) => Math.max(max, parseInt(s.duration || 0)), 0);

    // calculate current daily streak (consecutive days with at least one session)
    let streak = 0;
    try {
      const uniqueDates = [...new Set(
        sessions.map(s => new Date(s.date).toISOString().split('T')[0])
      )].sort((a, b) => b.localeCompare(a)); // newest first, deduplicated
      let current = new Date().toISOString().split('T')[0];
      for (let d of uniqueDates) {
        if (d === current) {
          streak++;
          const prev = new Date(current);
          prev.setDate(prev.getDate() - 1);
          current = prev.toISOString().split('T')[0];
        } else if (d < current) {
          break;
        }
      }
    } catch {}

    return { totalSessions, totalHours, totalMinutes: totalMinutes % 60, thisWeek, avgDuration, longest, streak };
  }, [sessions]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📊 Progress Tracker</Text>
        <Text style={styles.subtitle}>Track your training journey</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalSessions}</Text>
          <Text style={styles.statLabel}>Total Sessions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalHours}h {stats.totalMinutes}m</Text>
          <Text style={styles.statLabel}>Total Time</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.thisWeek}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.avgDuration}m</Text>
          <Text style={styles.statLabel}>Avg / Session</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.longest}m</Text>
          <Text style={styles.statLabel}>Longest</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.streak}</Text>
          <Text style={styles.statLabel}>Streak (days)</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.analyticsButton}
        onPress={() => router.push('/PerformanceGraphsScreen')}
      >
        <Text style={styles.analyticsButtonText}>📈 View Analytics</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddForm(!showAddForm)}
      >
        <Text style={styles.addButtonText}>
          {showAddForm ? '✕ Cancel' : '+ Log Training Session'}
        </Text>
      </TouchableOpacity>

      {showAddForm && (
        <View style={styles.addForm}>
          <TextInput
            style={styles.input}
            placeholder="Date (YYYY-MM-DD)"
            placeholderTextColor="#666"
            value={newSession.date}
            onChangeText={(text) => setNewSession({...newSession, date: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Activity (e.g., Dribbling drills)"
            placeholderTextColor="#666"
            value={newSession.activity}
            onChangeText={(text) => setNewSession({...newSession, activity: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Duration (minutes)"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={newSession.duration}
            onChangeText={(text) => setNewSession({...newSession, duration: text})}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Notes (optional)"
            placeholderTextColor="#666"
            multiline
            numberOfLines={3}
            value={newSession.notes}
            onChangeText={(text) => setNewSession({...newSession, notes: text})}
          />
          <TouchableOpacity style={styles.saveButton} onPress={addSession}>
            <Text style={styles.saveButtonText}>Save Session</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.sessionsContainer}>
        <Text style={styles.sectionTitle}>Training History</Text>
        {sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No training sessions logged yet</Text>
            <Text style={styles.emptySubtext}>Start tracking your progress today!</Text>
          </View>
        ) : (
          sessions.map(session => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionDate}>{session.date}</Text>
                <TouchableOpacity onPress={() => deleteSession(session.id)}>
                  <Text style={styles.deleteButton}>🗑️</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sessionActivity}>{session.activity}</Text>
              <Text style={styles.sessionDuration}>⏱️ {session.duration} minutes</Text>
              {session.notes && (
                <Text style={styles.sessionNotes}>{session.notes}</Text>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  header: { padding: 20, alignItems: 'center' },
  backButton: { color: '#1e88e5', fontSize: 16, fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffd700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#a8dadc', textAlign: 'center' },
  statsContainer: { flexDirection: 'row', padding: 20, justifyContent: 'space-between' },
  statCard: { backgroundColor: '#1b263b', borderRadius: 12, padding: 15, flex: 1, marginHorizontal: 5, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#ffd700', marginBottom: 5 },
  statLabel: { fontSize: 12, color: '#a8dadc', textAlign: 'center' },
  addButton: { backgroundColor: '#28a745', marginHorizontal: 20, padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  addForm: { backgroundColor: '#1b263b', marginHorizontal: 20, padding: 20, borderRadius: 12, marginBottom: 20 },
  input: { backgroundColor: '#0d1b2a', color: '#f1faee', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  textArea: { height: 80, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#ffd700', padding: 15, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: '#0d1b2a', fontSize: 16, fontWeight: 'bold' },
  sessionsContainer: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#f1faee', marginBottom: 15 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, color: '#a8dadc', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#6c757d' },
  sessionCard: { backgroundColor: '#1b263b', borderRadius: 12, padding: 15, marginBottom: 15 },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sessionDate: { fontSize: 14, color: '#ffd700', fontWeight: 'bold' },
  deleteButton: { fontSize: 20 },
  sessionActivity: { fontSize: 18, color: '#f1faee', fontWeight: 'bold', marginBottom: 8 },
  sessionDuration: { fontSize: 14, color: '#a8dadc', marginBottom: 5 },
  sessionNotes: { fontSize: 14, color: '#a8dadc', fontStyle: 'italic', marginTop: 8 },
  analyticsButton: { backgroundColor: '#1e88e5', marginHorizontal: 20, padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  analyticsButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
