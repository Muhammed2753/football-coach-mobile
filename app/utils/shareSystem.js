// app/utils/shareSystem.js
import { Share } from 'react-native';

export const shareAchievement = async (achievement) => {
  try {
    const message = `ðŸ† ${achievement.title}\n\n${achievement.description}\n\nâš½ Football Coach App - Track your journey to greatness!`;
    
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
    const message = `ðŸ“Š My Training Progress:\n\nâœ… ${stats.totalSessions} sessions completed\nâ±ï¸ ${stats.totalHours}h ${stats.totalMinutes}m trained\nðŸ”¥ ${stats.streak} day streak\n\nâš½ Join me on Football Coach App!`;
    
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
    const message = `âš½ ${playerData.name} - Overall ${playerData.overall}\n\nðŸ“ Position: ${position}\nâ­ Rating: ${playerData.overall}/99\n\nðŸŽ¯ Created with Football Coach App!`;
    
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
    const message = `âš½ Join me on Football Coach!\n\nTrack your training, get AI coaching, and improve your game.\n\nSearch "Football Coach Mobile" on the App Store or Google Play!`;
    
    await Share.share({
      message,
      title: 'Join Football Coach'
    });
  } catch (error) {
    console.error('Share failed:', error);
  }
};
