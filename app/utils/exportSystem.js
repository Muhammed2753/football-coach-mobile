// app/utils/exportSystem.js
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const exportAllData = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const data = {};
    
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      data[key] = value;
    }

    const jsonData = JSON.stringify(data, null, 2);
    const fileName = `football_coach_backup_${new Date().toISOString().split('T')[0]}.json`;
    const fileUri = FileSystem.documentDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, jsonData);
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    }

    return { success: true, fileName };
  } catch (error) {
    console.error('Export failed:', error);
    return { success: false, error: error.message };
  }
};

export const exportTrainingSessions = async () => {
  try {
    const sessions = await AsyncStorage.getItem('training_sessions');
    if (!sessions) {
      return { success: false, error: 'No training data found' };
    }

    const parsed = JSON.parse(sessions);
    const csv = convertToCSV(parsed);
    const fileName = `training_sessions_${new Date().toISOString().split('T')[0]}.csv`;
    const fileUri = FileSystem.documentDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, csv);
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    }

    return { success: true, fileName };
  } catch (error) {
    console.error('Export failed:', error);
    return { success: false, error: error.message };
  }
};

const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(val => 
      typeof val === 'string' && val.includes(',') ? `"${val}"` : val
    ).join(',')
  );
  
  return [headers, ...rows].join('\n');
};

export const importData = async (fileUri) => {
  try {
    const content = await FileSystem.readAsStringAsync(fileUri);
    const data = JSON.parse(content);

    for (const [key, value] of Object.entries(data)) {
      await AsyncStorage.setItem(key, value);
    }

    return { success: true };
  } catch (error) {
    console.error('Import failed:', error);
    return { success: false, error: error.message };
  }
};

export const generateProgressReport = async () => {
  try {
    const sessions = await AsyncStorage.getItem('training_sessions');
    const user = await AsyncStorage.getItem('user');
    
    if (!sessions || !user) {
      return { success: false, error: 'Insufficient data' };
    }

    const parsed = JSON.parse(sessions);
    const userData = JSON.parse(user);
    
    const totalSessions = parsed.length;
    const totalMinutes = parsed.reduce((sum, s) => sum + parseInt(s.duration || 0), 0);
    const totalHours = Math.floor(totalMinutes / 60);
    
    const report = `
FOOTBALL COACH - PROGRESS REPORT
Generated: ${new Date().toLocaleString()}

PLAYER: ${userData.name}
EMAIL: ${userData.email}

TRAINING SUMMARY:
- Total Sessions: ${totalSessions}
- Total Training Time: ${totalHours}h ${totalMinutes % 60}m
- Average Session: ${totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0} minutes

RECENT ACTIVITY:
${parsed.slice(0, 10).map(s => `- ${s.date}: ${s.activity} (${s.duration}min)`).join('\n')}

Keep up the great work!
    `.trim();

    const fileName = `progress_report_${new Date().toISOString().split('T')[0]}.txt`;
    const fileUri = FileSystem.documentDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, report);
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    }

    return { success: true, fileName };
  } catch (error) {
    console.error('Report generation failed:', error);
    return { success: false, error: error.message };
  }
};
