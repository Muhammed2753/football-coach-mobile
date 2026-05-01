// Enhanced Analytics Engine
// Firebase disabled - using local storage only
export const logEvent = async () => {};
export const trackProgress = async () => {};
// Add any other exported functions here as no-ops
export class AnalyticsEngine {
  // Performance Tracking
  static async trackProgress(playerId, stats, date = new Date()) {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const key = `progress_${playerId}`;
      const raw = await AsyncStorage.getItem(key);
      const existing = JSON.parse(raw || '[]');
      existing.push({ playerId, stats, date: date.toISOString(), overall: this.calculateOverall(stats) });
      await AsyncStorage.setItem(key, JSON.stringify(existing));
    } catch (error) {
      console.error('Error tracking progress:', error);
    }
  }

  static async getProgressData(playerId, days = 30) {
    return [];
  }

  // AI-Powered Weakness Detection
  static analyzeWeaknesses(player) {
    const stats = {
      pace: Math.round(((player.acceleration || 0) + (player.sprintSpeed || 0)) / 2),
      shooting: Math.round(((player.finishing || 0) + (player.shotPower || 0) + (player.longShots || 0)) / 3),
      passing: Math.round(((player.shortPassing || 0) + (player.longPassing || 0) + (player.vision || 0)) / 3),
      dribbling: Math.round(((player.dribbling || 0) + (player.ballControl || 0) + (player.agility || 0)) / 3),
      defending: Math.round(((player.interceptions || 0) + (player.standingTackle || 0) + (player.marking || 0)) / 3),
      physical: Math.round(((player.stamina || 0) + (player.strength || 0) + (player.jumping || 0)) / 3)
    };

    const weaknesses = [];
    const position = player.preferredPosition || 'CM';
    const positionRequirements = this.getPositionRequirements(position);

    Object.entries(stats).forEach(([stat, value]) => {
      const required = positionRequirements[stat] || 70;
      if (value < required) {
        weaknesses.push({
          stat,
          current: value,
          required,
          gap: required - value,
          priority: this.calculatePriority(stat, required - value, position)
        });
      }
    });

    return weaknesses.sort((a, b) => b.priority - a.priority);
  }

  // Position-specific requirements
  static getPositionRequirements(position) {
    const requirements = {
      'GK': { physical: 75, defending: 80, pace: 50, shooting: 30, passing: 60, dribbling: 40 },
      'CB': { defending: 85, physical: 80, pace: 65, shooting: 40, passing: 70, dribbling: 50 },
      'LB': { defending: 75, pace: 80, physical: 70, shooting: 50, passing: 75, dribbling: 70 },
      'RB': { defending: 75, pace: 80, physical: 70, shooting: 50, passing: 75, dribbling: 70 },
      'CDM': { defending: 80, passing: 85, physical: 75, pace: 65, shooting: 60, dribbling: 70 },
      'CM': { passing: 80, dribbling: 75, physical: 70, pace: 70, shooting: 65, defending: 65 },
      'CAM': { passing: 85, dribbling: 85, shooting: 80, pace: 75, physical: 60, defending: 50 },
      'LM': { pace: 85, dribbling: 80, passing: 75, physical: 65, shooting: 70, defending: 60 },
      'RM': { pace: 85, dribbling: 80, passing: 75, physical: 65, shooting: 70, defending: 60 },
      'LW': { pace: 90, dribbling: 85, shooting: 80, passing: 70, physical: 60, defending: 40 },
      'RW': { pace: 90, dribbling: 85, shooting: 80, passing: 70, physical: 60, defending: 40 },
      'ST': { shooting: 90, pace: 85, physical: 80, dribbling: 75, passing: 65, defending: 30 }
    };
    return requirements[position] || requirements['CM'];
  }

  static calculatePriority(stat, gap, position) {
    const positionWeights = {
      'ST': { shooting: 3, pace: 2.5, physical: 2, dribbling: 1.5, passing: 1, defending: 0.5 },
      'CAM': { passing: 3, dribbling: 2.5, shooting: 2, pace: 1.5, physical: 1, defending: 0.5 },
      'CM': { passing: 2.5, dribbling: 2, physical: 2, pace: 1.5, defending: 1.5, shooting: 1 }
    };
    
    const weight = positionWeights[position]?.[stat] || 1;
    return gap * weight;
  }

  static calculateOverall(stats) {
    const values = Object.values(stats).filter(v => typeof v === 'number');
    return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
  }

  static calculateImprovements(currentStats, previousStats = {}) {
    const improvements = {};
    Object.entries(currentStats).forEach(([key, value]) => {
      const previous = previousStats[key] || value;
      improvements[key] = value - previous;
    });
    return improvements;
  }

  // Compare with professional players
  static async compareWithPros(player) {
    const proPlayers = await this.getProPlayersByPosition(player.preferredPosition);
    const playerStats = this.calculateMainStats(player);
    
    return {
      percentile: this.calculatePercentile(playerStats, proPlayers),
      similarPlayers: this.findSimilarPlayers(playerStats, proPlayers),
      targetStats: this.getTargetStats(proPlayers)
    };
  }

  static getProPlayersByPosition(position) {
    // Mock professional player data - in real app, this would come from API
    const proData = {
      'ST': [
        { name: 'Elite Striker', pace: 89, shooting: 94, passing: 78, dribbling: 87, defending: 35, physical: 85 },
        { name: 'World Class ST', pace: 92, shooting: 91, passing: 75, dribbling: 89, defending: 32, physical: 82 }
      ],
      'CM': [
        { name: 'Elite Midfielder', pace: 76, shooting: 72, passing: 91, dribbling: 86, defending: 78, physical: 81 },
        { name: 'World Class CM', pace: 78, shooting: 75, passing: 93, dribbling: 88, defending: 80, physical: 79 }
      ]
    };
    return proData[position] || proData['CM'];
  }

  static calculateMainStats(player) {
    return {
      pace: Math.round(((player.acceleration || 0) + (player.sprintSpeed || 0)) / 2),
      shooting: Math.round(((player.finishing || 0) + (player.shotPower || 0) + (player.longShots || 0)) / 3),
      passing: Math.round(((player.shortPassing || 0) + (player.longPassing || 0) + (player.vision || 0)) / 3),
      dribbling: Math.round(((player.dribbling || 0) + (player.ballControl || 0) + (player.agility || 0)) / 3),
      defending: Math.round(((player.interceptions || 0) + (player.standingTackle || 0) + (player.marking || 0)) / 3),
      physical: Math.round(((player.stamina || 0) + (player.strength || 0) + (player.jumping || 0)) / 3)
    };
  }

  static calculatePercentile(playerStats, proPlayers) {
    const percentiles = {};
    Object.entries(playerStats).forEach(([stat, value]) => {
      const proValues = proPlayers.map(p => p[stat]).sort((a, b) => a - b);
      const rank = proValues.filter(v => v <= value).length;
      percentiles[stat] = Math.round((rank / proValues.length) * 100);
    });
    return percentiles;
  }

  static findSimilarPlayers(playerStats, proPlayers) {
    return proPlayers.map(pro => {
      const similarity = this.calculateSimilarity(playerStats, pro);
      return { ...pro, similarity };
    }).sort((a, b) => b.similarity - a.similarity).slice(0, 3);
  }

  static calculateSimilarity(stats1, stats2) {
    const keys = Object.keys(stats1);
    const differences = keys.map(key => Math.abs(stats1[key] - stats2[key]));
    const avgDifference = differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
    return Math.max(0, 100 - avgDifference);
  }

  static getTargetStats(proPlayers) {
    const avgStats = {};
    const statKeys = Object.keys(proPlayers[0]).filter(key => key !== 'name' && key !== 'similarity');
    
    statKeys.forEach(stat => {
      const values = proPlayers.map(p => p[stat]);
      avgStats[stat] = Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
    });
    
    return avgStats;
  }
}