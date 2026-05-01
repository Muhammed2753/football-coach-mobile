// app/index.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkDailyReminder, checkAchievements, getUnreadCount } from './utils/notificationSystem';

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isVIP, setIsVIP] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  // Refresh VIP status when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const refreshVIPStatus = async () => {
        try {
          const vipStatus = await AsyncStorage.getItem('isVIP');
          setIsVIP(vipStatus === 'true');
          
          // Check notifications
          await checkDailyReminder();
          await checkAchievements();
          const count = await getUnreadCount();
          setUnreadNotifications(count);
          
          // Calculate streak
          const sessions = await AsyncStorage.getItem('training_sessions');
          if (sessions) {
            const parsed = JSON.parse(sessions);
            const today = new Date();
            let currentStreak = 0;
            
            for (let i = 0; i < 30; i++) {
              const checkDate = new Date(today);
              checkDate.setDate(checkDate.getDate() - i);
              const dateStr = checkDate.toISOString().split('T')[0];
              
              const hasSession = parsed.some(s => s.date === dateStr);
              if (hasSession) {
                currentStreak++;
              } else if (i > 0) {
                break;
              }
            }
            setStreak(currentStreak);
          }
        } catch (error) {
          console.error('Error refreshing status:', error);
        }
      };
      refreshVIPStatus();
    }, [])
  );

  const checkAuth = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const vipStatus = await AsyncStorage.getItem('isVIP');
      const onboarded = await AsyncStorage.getItem('onboarding_completed');

      if (!userData) {
        router.replace('/AuthScreen');
        return;
      }

      setUser(JSON.parse(userData));
      setIsVIP(vipStatus === 'true');

      if (!onboarded) {
        router.replace('/OnboardingScreen');
        return;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.replace('/AuthScreen');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'isVIP']);
      setUser(null);
      setIsVIP(false);
      router.replace('/AuthScreen');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const handleSubscribe = () => {
    router.push('/VIPSubscription');
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>⚽ Football Coach</Text>
            <Text style={styles.subtitle}>
              Welcome back, {user?.name || 'Coach'}!
              {isVIP && ' ⭐ VIP'}
            </Text>
            {streak > 0 && (
              <Text style={styles.streakText}>🔥 {streak} day streak!</Text>
            )}
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.notificationButton} 
              onPress={() => router.push('/NotificationScreen')}
            >
              <Text style={styles.notificationIcon}>🔔</Text>
              {unreadNotifications > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadNotifications}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>🚪</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/ProfileForm')}
        >
          <Text style={styles.primaryButtonText}>✨ Start My Profile</Text>
        </TouchableOpacity>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>🌟 Premium Features</Text>

          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => router.push('/PositionQuiz')}
          >
            <Text style={styles.buttonIcon}>🎯</Text>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Find My Position</Text>
              <Text style={styles.buttonDesc}>Discover your ideal playing position</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => router.push('/DrillLibrary')}
          >
            <Text style={styles.buttonIcon}>⚽</Text>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Drill Library</Text>
              <Text style={styles.buttonDesc}>10 essential training drills</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => router.push('/ProgressTracker')}
          >
            <Text style={styles.buttonIcon}>📊</Text>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Progress Tracker</Text>
              <Text style={styles.buttonDesc}>Log and track your training</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => (isVIP ? router.push('/VIPChat') : handleSubscribe())}
          >
            <Text style={styles.buttonIcon}>💬</Text>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>VIP Coach Chat</Text>
              <Text style={styles.buttonDesc}>
                {isVIP ? 'Talk to expert coaches' : 'Upgrade to unlock'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => router.push('/LeaderboardScreen')}
          >
            <Text style={styles.buttonIcon}>🏆</Text>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Leaderboard</Text>
              <Text style={styles.buttonDesc}>Compete with other players</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => router.push('/ChallengesScreen')}
          >
            <Text style={styles.buttonIcon}>🎯</Text>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Weekly Challenges</Text>
              <Text style={styles.buttonDesc}>Complete challenges, earn rewards</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => router.push('/ProgressScreen')}
          >
            <Text style={styles.buttonIcon}>📈</Text>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Analytics Dashboard</Text>
              <Text style={styles.buttonDesc}>Monitor your improvement</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>⚙️ Settings & Support</Text>

          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => router.push('/HallOfFame')}
          >
            <Text style={styles.buttonIcon}>🏆</Text>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Hall of Fame</Text>
              <Text style={styles.buttonDesc}>View all your players</Text>
            </View>
          </TouchableOpacity>

          {!isVIP && (
            <TouchableOpacity
              style={[styles.settingButton, styles.vipSettingButton]}
              onPress={handleSubscribe}
            >
              <Text style={styles.buttonIcon}>⭐</Text>
              <View style={styles.buttonContent}>
                <Text style={styles.buttonTitle}>Upgrade to VIP</Text>
                <Text style={styles.buttonDesc}>Unlock premium features</Text>
              </View>
            </TouchableOpacity>
          )}

          {isVIP && (
            <View style={[styles.settingButton, styles.vipActiveButton]}>
              <Text style={styles.buttonIcon}>⭐</Text>
              <View style={styles.buttonContent}>
                <Text style={styles.buttonTitle}>VIP Active</Text>
                <Text style={styles.buttonDesc}>You have premium access!</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => router.push('/PerformanceGraphsScreen')}
          >
            <Text style={styles.buttonIcon}>📈</Text>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Performance Graphs</Text>
              <Text style={styles.buttonDesc}>Visual progress analytics</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => router.push('/AICoachScreen')}
          >
            <Text style={styles.buttonIcon}>🧠</Text>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>AI Coach</Text>
              <Text style={styles.buttonDesc}>Get personalized tips</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => router.push('/SettingsScreen')}
          >
            <Text style={styles.buttonIcon}>⚙️</Text>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Settings</Text>
              <Text style={styles.buttonDesc}>Preferences & data export</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => router.push('/AnalyticsFeedbackScreen')}
          >
            <Text style={styles.buttonIcon}>📈</Text>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>Analytics & Feedback</Text>
              <Text style={styles.buttonDesc}>Share your experience</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>🎯 Version 1.0.0</Text>
          <Text style={styles.infoText}>Made with ❤️ for young footballers worldwide</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  content: { alignItems: 'center', padding: 20, paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginBottom: 20 },
  headerButtons: { flexDirection: 'row', gap: 8 },
  notificationButton: { backgroundColor: '#1e88e5', padding: 10, borderRadius: 8, position: 'relative' },
  notificationIcon: { fontSize: 20 },
  badge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#dc3545', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  streakText: { fontSize: 14, color: '#FFD700', marginTop: 5, fontWeight: 'bold' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#f1faee', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#a8dadc', textAlign: 'center', marginTop: 10 },
  logoutButton: { backgroundColor: '#dc3545', padding: 10, borderRadius: 8 },
  logoutText: { color: '#fff', fontSize: 18 },
  primaryButton: { backgroundColor: '#1e88e5', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 10, width: '100%', marginBottom: 32, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  featuresSection: { width: '100%', marginBottom: 28 },
  settingsSection: { width: '100%', marginBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#a8dadc', marginBottom: 12 },
  featureButton: { backgroundColor: '#1a2332', borderLeftWidth: 4, borderLeftColor: '#1e88e5', borderRadius: 10, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  settingButton: { backgroundColor: '#1a2332', borderLeftWidth: 4, borderLeftColor: '#4CAF50', borderRadius: 10, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  vipSettingButton: { borderLeftColor: '#FFD700' },
  vipActiveButton: { borderLeftColor: '#FFD700', opacity: 0.7 },
  buttonIcon: { fontSize: 24, marginRight: 12 },
  buttonContent: { flex: 1 },
  buttonTitle: { fontSize: 15, fontWeight: '600', color: '#f1faee' },
  buttonDesc: { fontSize: 12, color: '#a8dadc', marginTop: 2 },
  infoBox: { backgroundColor: '#1a2332', borderRadius: 10, padding: 16, alignItems: 'center', width: '100%', marginBottom: 20 },
  infoText: { color: '#a8dadc', fontSize: 13, marginVertical: 2 },
});
