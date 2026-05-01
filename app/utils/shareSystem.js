// app/utils/shareSystem.js
import { Share } from 'react-native';

export const shareAchievement = async (achievement) => {
  try {
    const message = `🏆 ${achievement.title}\n\n${achievement.description}\n\n⚽ Football Coach App - Track your journey to greatness!`;
    
    await Share.share({
      message,
      title: 'My Football Achievement'
    });
  } catch (error) {
    console.error('Share failed:', error);
  }
};

export const shareProgress = async (stats) => {
  try {
    const message = `📊 My Training Progress:\n\n✅ ${stats.totalSessions} sessions completed\n⏱️ ${stats.totalHours}h ${stats.totalMinutes}m trained\n🔥 ${stats.streak} day streak\n\n⚽ Join me on Football Coach App!`;
    
    await Share.share({
      message,
      title: 'My Training Progress'
    });
  } catch (error) {
    console.error('Share failed:', error);
  }
};

export const sharePlayerCard = async (playerData) => {
  try {
    const position = Array.isArray(playerData.positions) && playerData.positions.length > 0
      ? playerData.positions[0]
      : (playerData.preferredPosition || 'N/A');
    const message = `⚽ ${playerData.name} - Overall ${playerData.overall}\n\n📍 Position: ${position}\n⭐ Rating: ${playerData.overall}/99\n\n🎯 Created with Football Coach App!`;
    
    await Share.share({
      message,
      title: 'My Player Card'
    });
  } catch (error) {
    console.error('Share failed:', error);
  }
};

export const inviteFriend = async () => {
  try {
    const message = `⚽ Join me on Football Coach!\n\nTrack your training, get AI coaching, and improve your game.\n\nSearch "Football Coach Mobile" on the App Store or Google Play!`;
    
    await Share.share({
      message,
      title: 'Join Football Coach'
    });
  } catch (error) {
    console.error('Share failed:', error);
  }
};
