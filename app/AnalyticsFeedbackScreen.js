import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Share, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AnalyticsFeedbackScreen() {
  const router = useRouter();
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [votes, setVotes] = useState({
    multiLanguage: 0,
    videoTutorials: 0,
    multiplayer: 0
  });
  const [userVotes, setUserVotes] = useState({
    multiLanguage: false,
    videoTutorials: false,
    multiplayer: false
  });

  const [realStats, setRealStats] = useState({ players: 0, hours: 0, plans: 0 });

  useEffect(() => {
    loadVotes();
    loadRealStats();
  }, []);

  const loadRealStats = async () => {
    try {
      const sessions = await AsyncStorage.getItem('training_sessions');
      const players = await AsyncStorage.getItem('football_coach_players');
      const parsed = sessions ? JSON.parse(sessions) : [];
      const totalMinutes = parsed.reduce((sum, s) => sum + parseInt(s.duration || 0), 0);
      const playerCount = players ? JSON.parse(players).length : 0;
      setRealStats({
        players: playerCount,
        hours: Math.round((totalMinutes / 60) * 10) / 10,
        plans: parsed.length,
      });
    } catch (e) {
      console.error('Failed to load stats:', e);
    }
  };

  const loadVotes = async () => {
    try {
      const storedVotes = await AsyncStorage.getItem('feature_votes');
      const storedUserVotes = await AsyncStorage.getItem('user_votes');
      
      if (storedVotes) {
        setVotes(JSON.parse(storedVotes));
      }
      if (storedUserVotes) {
        setUserVotes(JSON.parse(storedUserVotes));
      }
    } catch (error) {
      console.error('Failed to load votes:', error);
    }
  };

  const handleVote = async (feature) => {
    if (userVotes[feature]) {
      // Unvote
      const newVotes = { ...votes, [feature]: votes[feature] - 1 };
      const newUserVotes = { ...userVotes, [feature]: false };
      
      setVotes(newVotes);
      setUserVotes(newUserVotes);
      
      await AsyncStorage.setItem('feature_votes', JSON.stringify(newVotes));
      await AsyncStorage.setItem('user_votes', JSON.stringify(newUserVotes));
      
      Alert.alert('Vote Removed', 'Your vote has been removed');
    } else {
      // Vote
      const newVotes = { ...votes, [feature]: votes[feature] + 1 };
      const newUserVotes = { ...userVotes, [feature]: true };
      
      setVotes(newVotes);
      setUserVotes(newUserVotes);
      
      await AsyncStorage.setItem('feature_votes', JSON.stringify(newVotes));
      await AsyncStorage.setItem('user_votes', JSON.stringify(newUserVotes));
      
      Alert.alert('Vote Counted!', 'Thank you for your feedback');
    }
  };

  const resetVotes = async () => {
    Alert.alert(
      'Reset All Votes',
      'Are you sure you want to reset all votes to zero?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const resetVotes = { multiLanguage: 0, videoTutorials: 0, multiplayer: 0 };
            const resetUserVotes = { multiLanguage: false, videoTutorials: false, multiplayer: false };
            
            setVotes(resetVotes);
            setUserVotes(resetUserVotes);
            
            await AsyncStorage.setItem('feature_votes', JSON.stringify(resetVotes));
            await AsyncStorage.setItem('user_votes', JSON.stringify(resetUserVotes));
            
            Alert.alert('Success', 'All votes have been reset to zero');
          }
        }
      ]
    );
  };

  const handleSubmitFeedback = async () => {
    if (feedback.trim().length < 10) {
      Alert.alert('Error', 'Please provide at least 10 characters of feedback.');
      return;
    }

    if (rating === 0) {
      Alert.alert('Error', 'Please provide a rating.');
      return;
    }

    try {
      const subject = `Football Coach App Feedback - Rating: ${rating}/5`;
      const body = `
Feedback Report
===============

Rating: ${rating}/5 stars
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

User Feedback:
${feedback}

---
Sent from Football Coach Mobile App
      `;

      const emailUrl = `mailto:muhammedajayi14@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      await Linking.openURL(emailUrl);

      Alert.alert(
        'Thank You!',
        'Your feedback report will be sent to muhammedajayi14@gmail.com',
        [{ text: 'OK', onPress: () => { setFeedback(''); setRating(0); } }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to open email app. Please try again.');
    }
  };

  const handleShareApp = () => {
    Share.share({
      message: 'Check out Football Coach Mobile - The ultimate training app for young players! 🎯⚽\n\nContact: muhammedajayi14@gmail.com',
      title: 'Football Coach Mobile',
    }).catch((error) => console.log(error));
  };

  const sendDirectEmail = () => {
    const subject = 'Football Coach App - Direct Contact';
    const body = 'Hello,\n\nI would like to get in touch regarding the Football Coach Mobile app.\n\nBest regards';
    const emailUrl = `mailto:muhammedajayi14@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(emailUrl).catch(() => {
      Alert.alert('Error', 'Could not open email app');
    });
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Text style={[styles.star, rating >= star && styles.starFilled]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Analytics & Feedback</Text>
      </View>

      {/* Analytics Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Your Analytics</Text>

        <View style={styles.analyticsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Players Created</Text>
            <Text style={styles.statValue}>{realStats.players}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Training Hours</Text>
            <Text style={styles.statValue}>{realStats.hours}h</Text>
          </View>
        </View>

        <View style={styles.analyticsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Sessions Logged</Text>
            <Text style={styles.statValue}>{realStats.plans}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>App Rating</Text>
            <Text style={styles.statValue}>{rating > 0 ? `${rating}/5` : '—'}</Text>
          </View>
        </View>
      </View>

      {/* Feedback Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💬 Send Feedback Report</Text>
        <Text style={styles.emailInfo}>Reports sent to: muhammedajayi14@gmail.com</Text>

        <Text style={styles.label}>Rate Your Experience</Text>
        {renderStars()}

        <Text style={styles.label}>Tell Us What You Think</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Describe your experience, suggest features, or report issues..."
          placeholderTextColor="#666"
          multiline
          numberOfLines={6}
          value={feedback}
          onChangeText={setFeedback}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleSubmitFeedback}
        >
          <Text style={styles.buttonText}>📧 Send Feedback Report</Text>
        </TouchableOpacity>
      </View>

      {/* Feature Requests Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>💡 Feature Requests</Text>
          <TouchableOpacity onPress={resetVotes} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Reset Votes</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.featureButton, userVotes.multiLanguage && styles.featureButtonVoted]}
          onPress={() => handleVote('multiLanguage')}
        >
          <View>
            <Text style={styles.featureTitle}>⭐ Multi-Language Support</Text>
            <Text style={styles.featureCount}>👥 {votes.multiLanguage} votes</Text>
          </View>
          <Text style={[styles.voteButton, userVotes.multiLanguage && styles.voteButtonActive]}>
            {userVotes.multiLanguage ? '✓ Voted' : 'Vote'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.featureButton, userVotes.videoTutorials && styles.featureButtonVoted]}
          onPress={() => handleVote('videoTutorials')}
        >
          <View>
            <Text style={styles.featureTitle}>🎬 Video Tutorials</Text>
            <Text style={styles.featureCount}>👥 {votes.videoTutorials} votes</Text>
          </View>
          <Text style={[styles.voteButton, userVotes.videoTutorials && styles.voteButtonActive]}>
            {userVotes.videoTutorials ? '✓ Voted' : 'Vote'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.featureButton, userVotes.multiplayer && styles.featureButtonVoted]}
          onPress={() => handleVote('multiplayer')}
        >
          <View>
            <Text style={styles.featureTitle}>👥 Multiplayer Mode</Text>
            <Text style={styles.featureCount}>👥 {votes.multiplayer} votes</Text>
          </View>
          <Text style={[styles.voteButton, userVotes.multiplayer && styles.voteButtonActive]}>
            {userVotes.multiplayer ? '✓ Voted' : 'Vote'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Share App */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌟 Share App</Text>

        <TouchableOpacity style={styles.button} onPress={handleShareApp}>
          <Text style={styles.buttonText}>📱 Share App with Friends</Text>
        </TouchableOpacity>
      </View>

      {/* Contact Developer */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📞 Contact Developer</Text>

        <View style={styles.contactCard}>
          <Text style={styles.contactLabel}>Developer Email</Text>
          <TouchableOpacity onPress={sendDirectEmail}>
            <Text style={styles.contactValue}>muhammedajayi14@gmail.com</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={sendDirectEmail}>
          <Text style={styles.buttonText}>📧 Send Direct Email</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>All feedback reports are sent to muhammedajayi14@gmail.com</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingTop: 10,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resetButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emailInfo: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  analyticsCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  divider: {
    width: 1,
    backgroundColor: '#444',
    marginHorizontal: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    marginTop: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  starButton: {
    marginHorizontal: 8,
    paddingVertical: 8,
  },
  star: {
    fontSize: 32,
    color: '#666',
  },
  starFilled: {
    color: '#FFB300',
  },
  textarea: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#444',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#2a2a2a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  featureButton: {
    backgroundColor: '#2a2a2a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  featureButtonVoted: {
    borderLeftColor: '#2196F3',
    backgroundColor: '#1a3a4a',
  },
  featureTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureCount: {
    color: '#999',
    fontSize: 12,
  },
  voteButton: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    fontWeight: '600',
    fontSize: 12,
  },
  voteButtonActive: {
    backgroundColor: '#2196F3',
  },
  contactCard: {
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  contactLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 32,
  },
  footerText: {
    color: '#4CAF50',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
