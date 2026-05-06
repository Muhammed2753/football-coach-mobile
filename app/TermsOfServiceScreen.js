// app/TermsOfServiceScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function TermsOfServiceScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>â† Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Terms of Service</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.updated}>Effective Date: {new Date().toLocaleDateString()}</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.text}>
          By accessing and using Football Coach, you accept and agree to be bound by these Terms of Service.
        </Text>

        <Text style={styles.sectionTitle}>2. User Accounts</Text>
        <Text style={styles.text}>
          â€¢ You must provide accurate information
          {'\n'}â€¢ You are responsible for account security
          {'\n'}â€¢ One account per person
          {'\n'}â€¢ Accounts are non-transferable
        </Text>

        <Text style={styles.sectionTitle}>3. Acceptable Use</Text>
        <Text style={styles.text}>
          You agree NOT to:
          {'\n\n'}â€¢ Violate any laws or regulations
          {'\n'}â€¢ Harass or harm other users
          {'\n'}â€¢ Share inappropriate content
          {'\n'}â€¢ Attempt to hack or disrupt services
          {'\n'}â€¢ Use the app for commercial purposes without permission
        </Text>

        <Text style={styles.sectionTitle}>4. Subscription & Payments</Text>
        <Text style={styles.text}>
          â€¢ VIP subscriptions are billed monthly or annually
          {'\n'}â€¢ Prices are subject to change with notice
          {'\n'}â€¢ Refunds are handled per app store policies
          {'\n'}â€¢ Cancel anytime through your account settings
        </Text>

        <Text style={styles.sectionTitle}>5. Content Ownership</Text>
        <Text style={styles.text}>
          â€¢ You retain ownership of your training data
          {'\n'}â€¢ We own the app, design, and features
          {'\n'}â€¢ You grant us license to use your data to provide services
        </Text>

        <Text style={styles.sectionTitle}>6. Disclaimer</Text>
        <Text style={styles.text}>
          Football Coach provides training guidance but is NOT a substitute for professional coaching. We are not liable for injuries or outcomes from following our advice.
        </Text>

        <Text style={styles.sectionTitle}>7. Termination</Text>
        <Text style={styles.text}>
          We reserve the right to suspend or terminate accounts that violate these terms.
        </Text>

        <Text style={styles.sectionTitle}>8. Changes to Terms</Text>
        <Text style={styles.text}>
          We may update these terms. Continued use after changes constitutes acceptance.
        </Text>

        <Text style={styles.sectionTitle}>9. Contact</Text>
        <Text style={styles.text}>
          Questions? Contact us at:
          {'\n\n'}Email: support@footballcoach.app
          {'\n'}Website: www.footballcoach.app/terms
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Â© {new Date().getFullYear()} Football Coach. All rights reserved.
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
  footerText: { fontSize: 14, color: '#a8dadc', textAlign: 'center' },
});
