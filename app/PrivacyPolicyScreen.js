// app/PrivacyPolicyScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.updated}>Last Updated: {new Date().toLocaleDateString()}</Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.text}>
          We collect information you provide directly to us, including:
          {'\n\n'}• Account information (name, email)
          {'\n'}• Training data (sessions, progress)
          {'\n'}• Player profiles and statistics
          {'\n'}• Usage data and preferences
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.text}>
          We use your information to:
          {'\n\n'}• Provide and improve our services
          {'\n'}• Personalize your experience
          {'\n'}• Send notifications and updates
          {'\n'}• Analyze app performance
          {'\n'}• Ensure security and prevent fraud
        </Text>

        <Text style={styles.sectionTitle}>3. Data Storage</Text>
        <Text style={styles.text}>
          Your data is stored locally on your device and optionally synced to secure cloud servers. We use industry-standard encryption to protect your information.
        </Text>

        <Text style={styles.sectionTitle}>4. Data Sharing</Text>
        <Text style={styles.text}>
          We do NOT sell your personal information. We may share data only:
          {'\n\n'}• With your explicit consent
          {'\n'}• To comply with legal obligations
          {'\n'}• To protect our rights and safety
        </Text>

        <Text style={styles.sectionTitle}>5. Your Rights</Text>
        <Text style={styles.text}>
          You have the right to:
          {'\n\n'}• Access your data
          {'\n'}• Delete your account
          {'\n'}• Export your data
          {'\n'}• Opt-out of communications
        </Text>

        <Text style={styles.sectionTitle}>6. Children's Privacy</Text>
        <Text style={styles.text}>
          Our app is designed for users aged 4+. For users under 13, parental consent is required. We do not knowingly collect data from children without parental permission.
        </Text>

        <Text style={styles.sectionTitle}>7. Contact Us</Text>
        <Text style={styles.text}>
          For privacy concerns, contact us at:
          {'\n\n'}Email: privacy@footballcoach.app
          {'\n'}Website: www.footballcoach.app/privacy
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using Football Coach, you agree to this Privacy Policy.
          </Text>
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
  updated: { fontSize: 12, color: '#a8dadc', marginBottom: 20, fontStyle: 'italic' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#f1faee', marginTop: 20, marginBottom: 10 },
  text: { fontSize: 14, color: '#a8dadc', lineHeight: 22 },
  footer: { backgroundColor: '#1b263b', padding: 20, borderRadius: 12, marginTop: 30, marginBottom: 20 },
  footerText: { fontSize: 14, color: '#a8dadc', textAlign: 'center', fontStyle: 'italic' },
});
