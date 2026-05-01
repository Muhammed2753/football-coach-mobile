import AsyncStorage from '@react-native-async-storage/async-storage';

export class GamificationSystem {
  static BADGES = {
    FIRST_TRAINING: { id: 'first_training', name: 'First Steps', icon: '🏃', description: 'Complete your first training session' },
    WEEK_STREAK: { id: 'week_streak', name: 'Dedicated', icon: '🔥', description: '7-day training streak' },
    MONTH_STREAK: { id: 'month_streak', name: 'Champion', icon: '👑', description: '30-day training streak' },
    SKILL_MASTER: { id: 'skill_master', name: 'Skill Master', icon: '⚽', description: 'Improve 3 skills to 80+' },
    POSITION_EXPERT: { id: 'position_expert', name: 'Position Expert', icon: '🎯', description: 'Master your preferred position' },
    SOCIAL_BUTTERFLY: { id: 'social_butterfly', name: 'Team Player', icon: '👥', description: 'Join your first team' }
  };

  static async getUserProgress() {
    try {
      const progress = await AsyncStorage.getItem('user_progress');
      return progress ? JSON.parse(progress) : {
        badges: [],
        currentStreak: 0,
        longestStreak: 0,
        lastTrainingDate: null,
        totalTrainingSessions: 0,
        points: 0,
        level: 1
      };
    } catch (error) {
      console.error('Error getting user progress:', error);
      return {};
    }
  }

  static async updateProgress(sessionData) {
    try {
      const progress = await this.getUserProgress();
      const today = new Date().toDateString();
      
      // Update streak
      if (progress.lastTrainingDate === today) {
        // Already trained today
        return progress;
      }
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (progress.lastTrainingDate === yesterday.toDateString()) {
        progress.currentStreak += 1;
      } else {
        progress.currentStreak = 1;
      }
      
      progress.longestStreak = Math.max(progress.longestStreak, progress.currentStreak);
      progress.lastTrainingDate = today;
      progress.totalTrainingSessions += 1;
      progress.points += sessionData.points || 10;
      progress.level = Math.floor(progress.points / 100) + 1;
      
      // Check for new badges
      await this.checkBadges(progress, sessionData);
      
      await AsyncStorage.setItem('user_progress', JSON.stringify(progress));
      return progress;
    } catch (error) {
      console.error('Error updating progress:', error);
      return {};
    }
  }

  static async checkBadges(progress, sessionData) {
    const newBadgeIds = [];

    const pushIfNew = (id) => {
      if (!progress.badges.includes(id)) newBadgeIds.push(id);
    };

    if (progress.totalTrainingSessions === 1) pushIfNew(this.BADGES.FIRST_TRAINING.id);
    if (progress.currentStreak >= 7) pushIfNew(this.BADGES.WEEK_STREAK.id);
    if (progress.currentStreak >= 30) pushIfNew(this.BADGES.MONTH_STREAK.id);

    // Add any new badges to the progress, avoiding duplicates
    progress.badges = Array.from(new Set([...progress.badges, ...newBadgeIds]));

    // Return detailed badge objects for UI/notifications
    const badgeDetails = newBadgeIds.map(id => {
      // find badge definition by id
      const entry = Object.values(this.BADGES).find(b => b.id === id);
      return entry || { id, name: id, icon: '🏅', description: '' };
    });

    // If there are new badges, optionally trigger a lightweight notification (console + AsyncStorage queue)
    if (badgeDetails.length > 0) {
      try {
        const queued = await AsyncStorage.getItem('badge_queue');
        const queue = queued ? JSON.parse(queued) : [];
        await AsyncStorage.setItem('badge_queue', JSON.stringify([...queue, ...badgeDetails]));
      } catch (e) {
        // non-fatal: log and continue
        console.warn('Failed to queue badge notifications:', e);
      }
    }

    return badgeDetails;
  }

  // Helper for testing / reset (not for production use)
  static async clearProgressForTesting() {
    try {
      await AsyncStorage.removeItem('user_progress');
      await AsyncStorage.removeItem('badge_queue');
      return true;
    } catch (e) {
      console.error('Failed to clear progress:', e);
      return false;
    }
  }

  static async getLeaderboard() {
    // In a real app, this would fetch from a server
    return [
      { id: '1', name: 'Anonymous Player', points: 1250, level: 13 },
      { id: '2', name: 'Anonymous Player', points: 980, level: 10 },
      { id: '3', name: 'Anonymous Player', points: 750, level: 8 },
      { id: '4', name: 'You', points: 0, level: 1 }
    ];
  }
}