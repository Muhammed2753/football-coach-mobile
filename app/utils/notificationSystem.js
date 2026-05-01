// app/utils/notificationSystem.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_KEY = 'user_notifications';

export const createNotification = async (type, message) => {
  try {
    const notifications = await getNotifications();
    const newNotification = {
      id: Date.now(),
      type, // 'achievement', 'reminder', 'tip', 'milestone'
      message,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    const updated = [newNotification, ...notifications].slice(0, 50); // Keep last 50
    await AsyncStorage.setItem(NOTIFICATION_KEY, JSON.stringify(updated));
    return newNotification;
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

export const getNotifications = async () => {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

export const markAsRead = async (id) => {
  try {
    const notifications = await getNotifications();
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    await AsyncStorage.setItem(NOTIFICATION_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
};

export const getUnreadCount = async () => {
  const notifications = await getNotifications();
  return notifications.filter(n => !n.read).length;
};

// Daily training reminder
export const checkDailyReminder = async () => {
  try {
    const lastTraining = await AsyncStorage.getItem('last_training_date');
    const today = new Date().toISOString().split('T')[0];
    
    if (lastTraining !== today) {
      await createNotification('reminder', '⚽ Time to train! Even 15 minutes makes a difference.');
    }
  } catch (error) {
    console.error('Failed to check daily reminder:', error);
  }
};

// Achievement notifications
export const checkAchievements = async () => {
  try {
    const sessions = await AsyncStorage.getItem('training_sessions');
    if (!sessions) return;
    
    const parsed = JSON.parse(sessions);
    const totalSessions = parsed.length;
    
    // Milestone achievements
    if (totalSessions === 10) {
      await createNotification('achievement', '🏆 10 Sessions Complete! You\'re building consistency!');
    }
    if (totalSessions === 50) {
      await createNotification('achievement', '🔥 50 Sessions! You\'re a training machine!');
    }
    if (totalSessions === 100) {
      await createNotification('achievement', '⭐ 100 Sessions! Elite dedication!');
    }
  } catch (error) {
    console.error('Failed to check achievements:', error);
  }
};

// Daily tip
export const sendDailyTip = async () => {
  const tips = [
    '💡 Tip: Train your weak foot for 10 minutes today!',
    '💡 Tip: Watch a pro match and study one player\'s movement.',
    '💡 Tip: Hydrate! Drink 2L of water today.',
    '💡 Tip: Practice first touch against a wall for 5 minutes.',
    '💡 Tip: Visualize success before training.',
    '💡 Tip: Sleep 8+ hours for optimal recovery.',
    '💡 Tip: Set one specific goal for today\'s session.',
    '💡 Tip: Film yourself training and review it.',
    '💡 Tip: Stretch for 10 minutes before bed.',
    '💡 Tip: Challenge yourself with a new skill today.'
  ];
  
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  await createNotification('tip', randomTip);
};
