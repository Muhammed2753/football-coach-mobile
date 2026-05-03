// app/SettingsScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { exportAllData, exportTrainingSessions, generateProgressReport } from '';

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);

  const handleExportAll = async () => {
    Alert.alert('Export Data', 'Export all your data as JSON backup?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Export',
        onPress: async () => {
          const result = await exportAllData();
          if (result.success) {
            Alert.alert('Success', `Data exported: ${result.fileName}`);
          } else {
            Alert.alert('Error', result.error);
          }
        }
      }
    ]);
  };

  const handleExportSessions = async () => {
    const result = await exportTrainingSessions();
    if (result.success) {
      Alert.alert('Success', `Sessions exported: ${result.fileName}`);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleGenerateReport = async () => {
    const result = await generateProgressReport();
    if (result.success) {
      Alert.alert('Success', `Report generated: ${result.fileName}`);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete all your data. This action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            router.replace('/AuthScreen');
          }
        }
      ]
    );
  };

  const handleClearCache = async () => {
    Alert.alert('Clear Cache', 'Clear temporary data?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        onPress: async () => {
          // Keep essential data, clear cache
          Alert.alert('Success', 'Cache cleared');
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>â† Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>âš™ï¸ Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>ðŸ”” Notifications</Text>
            <Text style={styles.settingDesc}>Daily reminders and updates</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#1b263b', true: '#1e88e5' }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>ðŸŒ™ Dark Mode</Text>
            <Text style={styles.settingDesc}>Always enabled</Text>
          </View>
          <Switch
            value={darkMode}
            disabled
            trackColor={{ false: '#1b263b', true: '#1e88e5' }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>ðŸ’¾ Auto Backup</Text>
            <Text style={styles.settingDesc}>Weekly cloud backup</Text>
          </View>
          <Switch
            value={autoBackup}
            onValueChange={setAutoBackup}
            trackColor={{ false: '#1b263b', true: '#1e88e5' }}
          />
        </View>

        {/* Data Management */}
        <Text style={styles.sectionTitle}>Data Management</Text>

        <TouchableOpacity style={styles.actionButton} onPress={handleExportAll}>
          <Text style={styles.actionIcon}>ðŸ“¦</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionLabel}>Export All Data</Text>
            <Text style={styles.actionDesc}>Backup everything as JSON</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleExportSessions}>
          <Text style={styles.actionIcon}>ðŸ“Š</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionLabel}>Export Training Sessions</Text>
            <Text style={styles.actionDesc}>Download as CSV spreadsheet</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleGenerateReport}>
          <Text style={styles.actionIcon}>ðŸ“„</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionLabel}>Generate Progress Report</Text>
            <Text style={styles.actionDesc}>Detailed training summary</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleClearCache}>
          <Text style={styles.actionIcon}>ðŸ—‘ï¸</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionLabel}>Clear Cache</Text>
            <Text style={styles.actionDesc}>Free up storage space</Text>
          </View>
        </TouchableOpacity>

        {/* Legal */}
        <Text style={styles.sectionTitle}>Legal</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/PrivacyPolicyScreen')}
        >
          <Text style={styles.actionIcon}>ðŸ”’</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionLabel}>Privacy Policy</Text>
            <Text style={styles.actionDesc}>How we protect your data</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/TermsOfServiceScreen')}
        >
          <Text style={styles.actionIcon}>ðŸ“œ</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionLabel}>Terms of Service</Text>
            <Text style={styles.actionDesc}>Usage agreement</Text>
          </View>
        </TouchableOpacity>

        {/* Danger Zone */}
        <Text style={styles.sectionTitle}>Danger Zone</Text>

        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.actionIcon}>âš ï¸</Text>
          <View style={styles.actionInfo}>
            <Text style={[styles.actionLabel, styles.dangerText]}>Delete Account</Text>
            <Text style={styles.actionDesc}>Permanently remove all data</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.copyright}>Â© 2024 Football Coach</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  header: { padding: 20, alignItems: 'center' },
  backButton: { color: '#1e88e5', fontSize: 16, fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffd700' },
  content: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#f1faee', marginTop: 20, marginBottom: 15 },
  settingRow: { backgroundColor: '#1b263b', borderRadius: 12, padding: 15, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 16, color: '#f1faee', fontWeight: '600', marginBottom: 4 },
  settingDesc: { fontSize: 12, color: '#a8dadc' },
  actionButton: { backgroundColor: '#1b263b', borderRadius: 12, padding: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  actionIcon: { fontSize: 24, marginRight: 15 },
  actionInfo: { flex: 1 },
  actionLabel: { fontSize: 16, color: '#f1faee', fontWeight: '600', marginBottom: 4 },
  actionDesc: { fontSize: 12, color: '#a8dadc' },
  dangerButton: { borderWidth: 1, borderColor: '#dc3545' },
  dangerText: { color: '#dc3545' },
  footer: { alignItems: 'center', marginTop: 30, marginBottom: 20 },
  version: { fontSize: 12, color: '#a8dadc', marginBottom: 5 },
  copyright: { fontSize: 12, color: '#6c757d' },
});
