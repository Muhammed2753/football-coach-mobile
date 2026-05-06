import AsyncStorage from '@react-native-async-storage/async-storage';

export class SocialSystem {
  static async createTeam(teamData) {
    try {
      const teams = await this.getUserTeams();
      const newTeam = {
        id: Date.now().toString(),
        name: teamData.name,
        description: teamData.description,
        createdBy: 'current_user',
        members: ['current_user'],
        createdAt: new Date().toISOString(),
        isPrivate: teamData.isPrivate || false,
        inviteCode: this.generateInviteCode()
      };
      
      teams.push(newTeam);
      await AsyncStorage.setItem('user_teams', JSON.stringify(teams));
      return newTeam;
    } catch (error) {
      console.error('Error creating team:', error);
      return null;
    }
  }

  static async joinTeam(inviteCode) {
    try {
      // In a real app, this would search server for team with invite code
      const mockTeam = {
        id: 'team_' + Date.now(),
        name: 'Sample Team',
        description: 'A great team to train with',
        members: ['current_user', 'other_player1', 'other_player2'],
        inviteCode: inviteCode
      };
      
      const teams = await this.getUserTeams();
      teams.push(mockTeam);
      await AsyncStorage.setItem('user_teams', JSON.stringify(teams));
      return mockTeam;
    } catch (error) {
      console.error('Error joining team:', error);
      return null;
    }
  }

  static async getUserTeams() {
    try {
      const teams = await AsyncStorage.getItem('user_teams');
      return teams ? JSON.parse(teams) : [];
    } catch (error) {
      console.error('Error getting user teams:', error);
      return [];
    }
  }

  static async shareTrainingPlan(planData, shareWith) {
    try {
      const sharedPlans = await AsyncStorage.getItem('shared_plans') || '[]';
      const plans = JSON.parse(sharedPlans);
      
      const sharedPlan = {
        id: Date.now().toString(),
        ...planData,
        sharedBy: 'current_user',
        sharedWith: shareWith,
        sharedAt: new Date().toISOString()
      };
      
      plans.push(sharedPlan);
      await AsyncStorage.setItem('shared_plans', JSON.stringify(plans));
      return sharedPlan;
    } catch (error) {
      console.error('Error sharing training plan:', error);
      return null;
    }
  }

  static async shareProgress(progressData, platform) {
    const shareText = `ðŸ† Football Progress Update!\n\n` +
      `âš½ Level: ${progressData.level}\n` +
      `ðŸ”¥ Current Streak: ${progressData.currentStreak} days\n` +
      `ðŸ… Badges Earned: ${progressData.badges.length}\n` +
      `ðŸ’ª Total Training Sessions: ${progressData.totalTrainingSessions}\n\n` +
      `#FootballTraining #ChampionsApp`;
    
    return {
      text: shareText,
      platform: platform,
      success: true
    };
  }

  static generateInviteCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  static async getCoachConnections() {
    try {
      const connections = await AsyncStorage.getItem('coach_connections');
      return connections ? JSON.parse(connections) : [];
    } catch (error) {
      console.error('Error getting coach connections:', error);
      return [];
    }
  }

  static async connectWithCoach(coachData) {
    try {
      const connections = await this.getCoachConnections();
      const newConnection = {
        id: Date.now().toString(),
        ...coachData,
        connectedAt: new Date().toISOString(),
        status: 'pending'
      };
      
      connections.push(newConnection);
      await AsyncStorage.setItem('coach_connections', JSON.stringify(connections));
      return newConnection;
    } catch (error) {
      console.error('Error connecting with coach:', error);
      return null;
    }
  }
}