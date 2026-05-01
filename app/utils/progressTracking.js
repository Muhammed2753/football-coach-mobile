import AsyncStorage from '@react-native-async-storage/async-storage';

const PROGRESS_STORAGE_KEY = 'player_progress_data';
const ACHIEVEMENTS_STORAGE_KEY = 'player_achievements';

// Achievement system
export const ACHIEVEMENTS = {
  FIRST_TRAINING: {
    id: 'first_training',
    title: 'First Steps',
    description: 'Complete your first training session',
    icon: '🏃‍♂️',
    xp: 50
  },
  WEEK_STREAK: {
    id: 'week_streak',
    title: 'Dedicated Trainer',
    description: 'Train for 7 consecutive days',
    icon: '🔥',
    xp: 200
  },
  ATTRIBUTE_BOOST: {
    id: 'attribute_boost',
    title: 'Level Up!',
    description: 'Improve any attribute by 10 points',
    icon: '📈',
    xp: 100
  },
  GOALKEEPER_MASTER: {
    id: 'gk_master',
    title: 'Safe Hands',
    description: 'Reach 80+ in all goalkeeper attributes',
    icon: '🥅',
    xp: 500
  },
  STRIKER_MASTER: {
    id: 'st_master',
    title: 'Goal Machine',
    description: 'Reach 80+ finishing and positioning',
    icon: '⚽',
    xp: 500
  },
  OVERALL_80: {
    id: 'overall_80',
    title: 'Rising Star',
    description: 'Reach 80 overall rating',
    icon: '⭐',
    xp: 300
  },
  OVERALL_90: {
    id: 'overall_90',
    title: 'World Class',
    description: 'Reach 90 overall rating',
    icon: '🌟',
    xp: 1000
  }
};

// Progress tracking functions
export const saveProgressData = async (playerId, progressData) => {
  try {
    const existingData = await getProgressData(playerId) || {};
    const updatedData = {
      ...existingData,
      [playerId]: {
        ...existingData[playerId],
        ...progressData,
        lastUpdated: new Date().toISOString()
      }
    };
    await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updatedData));
    return updatedData[playerId];
  } catch (error) {
    console.error('Error saving progress:', error);
    return null;
  }
};

export const getProgressData = async (playerId) => {
  try {
    const data = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return playerId ? parsed[playerId] : parsed;
    }
    return null;
  } catch (error) {
    console.error('Error loading progress:', error);
    return null;
  }
};

export const calculateProgressStats = (initialStats, currentStats) => {
  const improvements = {};
  const totalImprovement = Object.keys(initialStats).reduce((total, key) => {
    const improvement = (currentStats[key] || 0) - (initialStats[key] || 0);
    improvements[key] = improvement;
    return total + Math.max(0, improvement);
  }, 0);

  const averageImprovement = totalImprovement / Object.keys(initialStats).length;
  
  return {
    improvements,
    totalImprovement,
    averageImprovement,
    progressPercentage: Math.min(100, (averageImprovement / 20) * 100) // 20 point improvement = 100%
  };
};

export const generateProgressChart = (progressHistory) => {
  if (!progressHistory || progressHistory.length === 0) return [];
  
  return progressHistory.map((entry, index) => ({
    week: index + 1,
    overall: entry.overall || 0,
    date: entry.date,
    improvements: entry.improvements || {}
  }));
};

// Achievement system
export const checkAchievements = async (playerId, currentStats, trainingHistory) => {
  try {
    const existingAchievements = await getPlayerAchievements(playerId);
    const newAchievements = [];
    
    // Check first training
    if (trainingHistory.length >= 1 && !existingAchievements.includes('first_training')) {
      newAchievements.push(ACHIEVEMENTS.FIRST_TRAINING);
    }
    
    // Check week streak
    const recentTraining = trainingHistory.filter(session => {
      const sessionDate = new Date(session.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate >= weekAgo;
    });
    
    if (recentTraining.length >= 7 && !existingAchievements.includes('week_streak')) {
      newAchievements.push(ACHIEVEMENTS.WEEK_STREAK);
    }
    
    // Check overall ratings
    const overall = calculateOverall(currentStats);
    if (overall >= 80 && !existingAchievements.includes('overall_80')) {
      newAchievements.push(ACHIEVEMENTS.OVERALL_80);
    }
    if (overall >= 90 && !existingAchievements.includes('overall_90')) {
      newAchievements.push(ACHIEVEMENTS.OVERALL_90);
    }
    
    // Check position-specific achievements
    if (currentStats.position === 'GK') {
      const gkStats = ['diving', 'handling', 'kicking', 'positioning', 'reflexes'];
      const allAbove80 = gkStats.every(stat => (currentStats[stat] || 0) >= 80);
      if (allAbove80 && !existingAchievements.includes('gk_master')) {
        newAchievements.push(ACHIEVEMENTS.GOALKEEPER_MASTER);
      }
    }
    
    if (currentStats.position === 'ST') {
      const finishing = currentStats.finishing || 0;
      const positioning = currentStats.positioning || 0;
      if (finishing >= 80 && positioning >= 80 && !existingAchievements.includes('st_master')) {
        newAchievements.push(ACHIEVEMENTS.STRIKER_MASTER);
      }
    }
    
    // Save new achievements
    if (newAchievements.length > 0) {
      await savePlayerAchievements(playerId, [...existingAchievements, ...newAchievements.map(a => a.id)]);
    }
    
    return newAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};

export const getPlayerAchievements = async (playerId) => {
  try {
    const data = await AsyncStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return parsed[playerId] || [];
    }
    return [];
  } catch (error) {
    console.error('Error loading achievements:', error);
    return [];
  }
};

export const savePlayerAchievements = async (playerId, achievements) => {
  try {
    const existingData = await AsyncStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    const parsed = existingData ? JSON.parse(existingData) : {};
    parsed[playerId] = achievements;
    await AsyncStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(parsed));
  } catch (error) {
    console.error('Error saving achievements:', error);
  }
};

const calculateOverall = (stats) => {
  const attributes = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];
  const total = attributes.reduce((sum, attr) => sum + (stats[attr] || 0), 0);
  return Math.round(total / attributes.length);
};

// Training streak tracking
export const updateTrainingStreak = async (playerId) => {
  try {
    const today = new Date().toDateString();
    const progressData = await getProgressData(playerId) || {};
    
    const lastTrainingDate = progressData.lastTrainingDate;
    const currentStreak = progressData.trainingStreak || 0;
    
    if (lastTrainingDate === today) {
      return currentStreak; // Already trained today
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    let newStreak;
    if (lastTrainingDate === yesterday.toDateString()) {
      newStreak = currentStreak + 1; // Continue streak
    } else {
      newStreak = 1; // Start new streak
    }
    
    await saveProgressData(playerId, {
      lastTrainingDate: today,
      trainingStreak: newStreak
    });
    
    return newStreak;
  } catch (error) {
    console.error('Error updating training streak:', error);
    return 0;
  }
};

// Performance analytics
export const generatePerformanceReport = (progressHistory, currentStats) => {
  if (!progressHistory || progressHistory.length < 2) {
    return {
      trend: 'insufficient_data',
      message: 'Need more training data to generate report'
    };
  }
  
  const recent = progressHistory.slice(-4); // Last 4 weeks
  const improvements = recent.map(week => week.averageImprovement || 0);
  const avgImprovement = improvements.reduce((a, b) => a + b, 0) / improvements.length;
  
  let trend, message;
  if (avgImprovement > 2) {
    trend = 'excellent';
    message = 'Outstanding progress! Keep up the excellent work!';
  } else if (avgImprovement > 1) {
    trend = 'good';
    message = 'Good steady improvement. Consider increasing training intensity.';
  } else if (avgImprovement > 0.5) {
    trend = 'moderate';
    message = 'Moderate progress. Focus on your weakest attributes.';
  } else {
    trend = 'slow';
    message = 'Progress is slow. Consider changing your training approach.';
  }
  
  return {
    trend,
    message,
    avgImprovement,
    weeklyData: recent
  };
};