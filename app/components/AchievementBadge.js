import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AchievementBadge = ({ badge, size = 'medium' }) => {
  const sizeStyles = {
    small: { width: 40, height: 40, fontSize: 16 },
    medium: { width: 60, height: 60, fontSize: 20 },
    large: { width: 80, height: 80, fontSize: 24 }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      default: return '#4CAF50';
    }
  };

  return (
    <View style={[
      styles.badge, 
      { 
        width: sizeStyles[size].width, 
        height: sizeStyles[size].height,
        backgroundColor: getBadgeColor(badge.type),
        opacity: badge.unlocked ? 1 : 0.3
      }
    ]}>
      <Text style={[styles.badgeIcon, { fontSize: sizeStyles[size].fontSize }]}>
        {badge.icon}
      </Text>
      {badge.unlocked && (
        <View style={styles.unlockedIndicator}>
          <Text style={styles.checkmark}>âœ“</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  badgeIcon: {
    color: '#fff',
    fontWeight: 'bold',
  },
  unlockedIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default AchievementBadge;