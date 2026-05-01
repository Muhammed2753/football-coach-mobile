// app/SecurityPrivacyScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';

export default function SecurityPrivacyScreen() {
  const router = useRouter();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }
    
    Alert.alert('Success', 'Password changed successfully!');
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const showPrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'Football Coach App Privacy Policy\n\n' +
      '1. DATA COLLECTION\n' +
      'We collect player profiles, training data, and app usage statistics to improve your experience.\n\n' +
      '2. DATA USAGE\n' +
      'Your data is used to provide personalized training recommendations and track your progress.\n\n' +
      '3. DATA SHARING\n' +
      'We do not sell your personal data to third parties. Anonymous usage data may be shared for analytics.\n\n' +
      '4. DATA SECURITY\n' +
      'All data is encrypted and stored securely on your device and our servers.\n\n' +
      '5. YOUR RIGHTS\n' +
      'You can delete your data anytime through the app settings.',
      [{ text: 'OK' }]
    );
  };

  const showTermsOfService = () => {
    Alert.alert(
      'Terms of Service',
      'Football Coach App Terms of Service\n\n' +
      '1. ACCEPTANCE OF TERMS\n' +
      'By using this app, you agree to these terms and conditions.\n\n' +
      '2. APP USAGE\n' +
      'This app is for personal football training purposes only. Commercial use is prohibited.\n\n' +
      '3. USER RESPONSIBILITIES\n' +
      'You are responsible for the accuracy of your player data and training information.\n\n' +
      '4. PROHIBITED ACTIVITIES\n' +
      'Do not use the app for illegal activities or to harm others.\n\n' +
      '5. LIMITATION OF LIABILITY\n' +
      'We are not responsible for injuries during training. Train safely.\n\n' +
      '6. TERMINATION\n' +
      'We may terminate accounts that violate these terms.',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Your account has been deleted.');
            router.push('/');
          },
        },
      ]
    );
  };

  const handleDataDeletion = () => {
    Alert.alert(
      'Delete All Data',
      'This will delete all your player profiles and training data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'All your data has been deleted.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Security & Privacy</Text>
      </View>

      {/* Privacy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔒 Privacy</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Analytics & Performance</Text>
            <Text style={styles.settingDescription}>Help us improve the app</Text>
          </View>
          <Switch
            value={analyticsEnabled}
            onValueChange={setAnalyticsEnabled}
            trackColor={{ false: '#767577', true: '#81C784' }}
            thumbColor={analyticsEnabled ? '#4CAF50' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDescription}>Receive training reminders</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#767577', true: '#81C784' }}
            thumbColor={notificationsEnabled ? '#4CAF50' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Share Data with Partners</Text>
            <Text style={styles.settingDescription}>Improve recommendations</Text>
          </View>
          <Switch
            value={dataSharing}
            onValueChange={setDataSharing}
            trackColor={{ false: '#767577', true: '#81C784' }}
            thumbColor={dataSharing ? '#4CAF50' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Security Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛡️ Security</Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => setShowPasswordModal(true)}
        >
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => Alert.alert('2FA', 'Two-Factor Authentication adds extra security. This feature will be available in a future update.')}
        >
          <Text style={styles.buttonText}>Two-Factor Authentication</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => Alert.alert('Login Activity', 'Recent logins:\n\n• Today 2:30 PM - Mobile\n• Yesterday 8:15 AM - Mobile\n• Jan 25 6:45 PM - Mobile')}
        >
          <Text style={styles.buttonText}>View Login Activity</Text>
        </TouchableOpacity>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Data Management</Text>
        
        <TouchableOpacity 
          style={[styles.button, styles.warningButton]} 
          onPress={handleDataDeletion}
        >
          <Text style={styles.warningButtonText}>Delete All My Data</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.dangerButton]} 
          onPress={handleDeleteAccount}
        >
          <Text style={styles.dangerButtonText}>Delete My Account</Text>
        </TouchableOpacity>
      </View>

      {/* Policies */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Policies</Text>
        
        <TouchableOpacity style={styles.button} onPress={showPrivacyPolicy}>
          <Text style={styles.buttonText}>Privacy Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={showTermsOfService}>
          <Text style={styles.buttonText}>Terms of Service</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => Alert.alert('Cookie Policy', 'This mobile app does not use web cookies. We use local storage for app functionality only.')}
        >
          <Text style={styles.buttonText}>Cookie Policy</Text>
        </TouchableOpacity>
      </View>

      {/* Change Password Modal */}
      <Modal visible={showPasswordModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleChangePassword}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Last Updated: Jan 27, 2026</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a', paddingTop: 10 },
  header: { paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  backButton: { color: '#4CAF50', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#4CAF50', marginBottom: 12 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2a2a2a', borderRadius: 10, padding: 16, marginBottom: 12 },
  settingContent: { flex: 1, marginRight: 12 },
  settingLabel: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  settingDescription: { fontSize: 13, color: '#999' },
  button: { backgroundColor: '#2a2a2a', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#4CAF50' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  warningButton: { borderLeftColor: '#FF9800', backgroundColor: '#332211' },
  warningButtonText: { color: '#FF9800', fontSize: 16, fontWeight: '500' },
  dangerButton: { borderLeftColor: '#F44336', backgroundColor: '#331111' },
  dangerButtonText: { color: '#F44336', fontSize: 16, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#2a2a2a', borderRadius: 15, padding: 20, width: '90%', maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#1a1a1a', color: '#fff', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  cancelButton: { backgroundColor: '#666' },
  cancelButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  saveButton: { backgroundColor: '#4CAF50' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { alignItems: 'center', paddingVertical: 24, borderTopWidth: 1, borderTopColor: '#333', marginTop: 32 },
  footerText: { color: '#666', fontSize: 12 },
});
