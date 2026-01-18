import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Share } from 'react-native';
import { useRouter } from 'expo-router';

export default function AnalyticsFeedbackScreen() {
  const router = useRouter();
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);

  const handleSubmitFeedback = () => {
    if (feedback.trim().length < 10) {
      Alert.alert('Error', 'Please provide at least 10 characters of feedback.');
      return;
    }

    Alert.alert(
      'Thank You!',
      'Your feedback has been submitted successfully.',
      [{ text: 'OK', onPress: () => setFeedback('') }]
    );
  };

  const handleShareApp = () => {
    Share.share({
      message: 'Check out Football Coach Mobile - The ultimate training app for young players! 🎯⚽',
      title: 'Football Coach Mobile',
      url: 'https://footballcoach.app',
    }).catch((error) => console.log(error));
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
            <Text style={styles.statValue}>5</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Training Hours</Text>
            <Text style={styles.statValue}>24.5h</Text>
          </View>
        </View>

        <View style={styles.analyticsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Training Plans Created</Text>
            <Text style={styles.statValue}>8</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Average Rating</Text>
            <Text style={styles.statValue}>4.5/5</Text>
          </View>
        </View>
      </View>

      {/* Feedback Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💬 Send Us Feedback</Text>

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
          <Text style={styles.buttonText}>📤 Submit Feedback</Text>
        </TouchableOpacity>
      </View>

      {/* Bug Reports Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🐛 Bug Reports</Text>

        <TouchableOpacity style={styles.reportButton}>
          <Text style={styles.reportButtonText}>📧 Email Support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reportButton}>
          <Text style={styles.reportButtonText}>💬 Chat with Support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reportButton}>
          <Text style={styles.reportButtonText}>🔗 View Known Issues</Text>
        </TouchableOpacity>
      </View>

      {/* Feature Requests Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Feature Requests</Text>

        <TouchableOpacity style={styles.featureButton}>
          <View>
            <Text style={styles.featureTitle}>⭐ Multi-Language Support</Text>
            <Text style={styles.featureCount}>👥 234 votes</Text>
          </View>
          <Text style={styles.voteButton}>Vote</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.featureButton}>
          <View>
            <Text style={styles.featureTitle}>🎬 Video Tutorials</Text>
            <Text style={styles.featureCount}>👥 189 votes</Text>
          </View>
          <Text style={styles.voteButton}>Vote</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.featureButton}>
          <View>
            <Text style={styles.featureTitle}>👥 Multiplayer Mode</Text>
            <Text style={styles.featureCount}>👥 456 votes</Text>
          </View>
          <Text style={styles.voteButton}>Vote</Text>
        </TouchableOpacity>
      </View>

      {/* Share & Invite */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌟 Share & Invite</Text>

        <TouchableOpacity style={styles.button} onPress={handleShareApp}>
          <Text style={styles.buttonText}>📱 Share App with Friends</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>🎁 Invite & Earn Rewards</Text>
        </TouchableOpacity>
      </View>

      {/* Contact Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📞 Contact Us</Text>

        <View style={styles.contactCard}>
          <Text style={styles.contactLabel}>Email</Text>
          <Text style={styles.contactValue}>support@footballcoach.app</Text>
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.contactLabel}>Website</Text>
          <Text style={styles.contactValue}>www.footballcoach.app</Text>
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.contactLabel}>Social Media</Text>
          <Text style={styles.contactValue}>@footballcoachapp</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>We value your feedback!</Text>
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
  reportButton: {
    backgroundColor: '#2a2a2a',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
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
    color: '#2196F3',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 32,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
});
