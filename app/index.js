import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>⚽ Football Coach</Text>
        <Text style={styles.subtitle}>Find your perfect position & grow as a player</Text>

        {/* Main Button */}
        <Link href="/ProfileForm" style={styles.primaryButton}>
          ✨ Start My Profile
        </Link>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Features</Text>

          <Link href="/VIPChat" style={styles.featureButton}>
            <Text style={styles.buttonIcon}>💬</Text>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>VIP Chat</Text>
              <Text style={styles.buttonDesc}>Get coaching from experts</Text>
            </View>
          </Link>

          <Link href="/ProgressScreen" style={styles.featureButton}>
            <Text style={styles.buttonIcon}>📊</Text>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Track Progress</Text>
              <Text style={styles.buttonDesc}>Monitor your improvement</Text>
            </View>
          </Link>
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings & Support</Text>

          <Link href="/HallOfFame" style={styles.featureButton}>
            <Text style={styles.buttonIcon}>🏆</Text>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Hall of Fame</Text>
              <Text style={styles.buttonDesc}>View all your players</Text>
            </View>
          </Link>

          <Link href="/VIPSubscription" style={[styles.settingButton, styles.vipSettingButton]}>
            <Text style={styles.buttonIcon}>⭐</Text>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Upgrade to VIP</Text>
              <Text style={styles.buttonDesc}>Unlock premium features</Text>
            </View>
          </Link>

          <Link href="/SecurityPrivacyScreen" style={styles.settingButton}>
            <Text style={styles.buttonIcon}>🔒</Text>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Security & Privacy</Text>
              <Text style={styles.buttonDesc}>Manage your account</Text>
            </View>
          </Link>

          <Link href="/AnalyticsFeedbackScreen" style={styles.settingButton}>
            <Text style={styles.buttonIcon}>📈</Text>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Analytics & Feedback</Text>
              <Text style={styles.buttonDesc}>Share your experience</Text>
            </View>
          </Link>
        </View>

        {/* Info Footer */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>🎯 Version 1.0.0</Text>
          <Text style={styles.infoText}>Made with ❤️ for young footballers</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1b2a',
  },
  content: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f1faee',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#a8dadc',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#1e88e5',
    color: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    width: '100%',
    marginBottom: 32,
  },
  featuresSection: {
    width: '100%',
    marginBottom: 28,
  },
  settingsSection: {
    width: '100%',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a8dadc',
    marginBottom: 12,
  },
  featureButton: {
    backgroundColor: '#1a2332',
    borderLeftWidth: 4,
    borderLeftColor: '#1e88e5',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingButton: {
    backgroundColor: '#1a2332',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  buttonContent: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f1faee',
  },
  buttonDesc: {
    fontSize: 12,
    color: '#a8dadc',
    marginTop: 2,
  },
  infoBox: {
    backgroundColor: '#1a2332',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  infoText: {
    color: '#a8dadc',
    fontSize: 13,
    marginVertical: 2,
  },
});