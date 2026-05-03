// app/NotificationScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getNotifications, markAsRead } from '';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotificationScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      Alert.alert('Error', 'Could not load notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationPress = async (notification) => {
    console.log('ðŸ”” Notification pressed:', notification);
    
    // Prevent double-taps
    if (isLoading) return;
    
    try {
      // Mark as read FIRST (before navigation)
      await markAsRead(notification.id);
      console.log('âœ… Marked as read:', notification.id);

      // Navigate based on type â€” WITHOUT passing complex data
      switch (notification.type) {
        case 'reminder':
        case 'tip':
          console.log('ðŸ”„ Navigating to TrainingPlanScreen...');
          // Just navigate â€” let TrainingPlanScreen load its own data
          router.push('/TrainingPlanScreen');
          break;
          
        case 'achievement':
        case 'milestone':
          console.log('ðŸ”„ Navigating to ProgressScreen...');
          router.push('/ProgressScreen');
          break;
          
        default:
          console.log('ðŸ”„ Navigating to home...');
          router.push('/');
      }
    } catch (error) {
      console.error('âŒ Failed handling notification:', error);
      Alert.alert(
        'Navigation Error',
        'Could not open the requested screen. Please try again.',
        [{ text: 'OK' }]
      );
    }
    // NOTE: Don't call loadNotifications() here â€” it causes re-render during navigation
    // The screen will refresh automatically when you come back
  };

  const getIcon = (type) => {
    switch (type) {
      case 'achievement': return 'ðŸ†';
      case 'reminder': return 'âš½';
      case 'tip': return 'ðŸ’¡';
      case 'milestone': return 'â­';
      default: return 'ðŸ“¢';
    }
  };

  if (isLoading && notifications.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>ðŸ”” Notifications</Text>
        </View>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={isLoading}>
          <Text style={[styles.backButton, isLoading && styles.disabled]}>â† Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ðŸ”” Notifications</Text>
      </View>

      <ScrollView style={styles.list}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>We'll notify you about achievements and reminders</Text>
          </View>
        ) : (
          notifications.map(notification => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard, 
                !notification.read && styles.unread,
                isLoading && styles.disabledCard
              ]}
              onPress={() => handleNotificationPress(notification)}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.icon}>{getIcon(notification.type)}</Text>
              <View style={styles.content}>
                <Text style={styles.message}>{notification.message}</Text>
                <Text style={styles.time}>
                  {new Date(notification.timestamp).toLocaleDateString()} â€¢ {new Date(notification.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
              </View>
              {!notification.read && <View style={styles.dot} />}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  header: { padding: 20, alignItems: 'center' },
  backButton: { color: '#1e88e5', fontSize: 16, fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: 10 },
  disabled: { opacity: 0.5 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffd700', marginBottom: 8 },
  list: { flex: 1, padding: 20 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#a8dadc', fontSize: 16 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, color: '#a8dadc', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#6c757d', textAlign: 'center' },
  notificationCard: { 
    backgroundColor: '#1b263b', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 12, 
    flexDirection: 'row', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  disabledCard: { opacity: 0.6 },
  unread: { borderLeftWidth: 4, borderLeftColor: '#1e88e5', borderColor: '#1e88e5' },
  icon: { fontSize: 32, marginRight: 15 },
  content: { flex: 1 },
  message: { fontSize: 16, color: '#f1faee', marginBottom: 5 },
  time: { fontSize: 12, color: '#a8dadc' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1e88e5', marginLeft: 10 },
});