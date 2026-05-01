// app/VIPSubscription.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { startCheckout } from './utils/stripePayment';

export default function VIPSubscription() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('Monthly');

  const handleSubscribe = async (plan) => {
    setLoading(true);
    try {
      const result = await startCheckout(plan.toLowerCase());
      if (!result.success) {
        Alert.alert('Error', result.error || 'Something went wrong. Please try again.');
      }
      // On success, Stripe Checkout opens in browser.
      // VIP is activated by the webhook after payment completes.
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>⭐ VIP Premium</Text>
        <Text style={styles.subtitle}>Unlock the full potential</Text>
      </View>

      <View style={styles.benefitsSection}>
        <Text style={styles.sectionTitle}>🎯 VIP Benefits</Text>
        {[
          'Ad-Free Experience',
          'Unlimited Coach Chat',
          'Advanced Analytics Dashboard',
          'Personalized Weekly Training Plans (PDF Export)',
          'Priority Access to New Drills',
          '1-on-1 AI Coaching Feedback',
          'Exclusive Video Tips from World-Class Coaches',
          'Unlimited Player Saves'
        ].map((benefit, i) => (
          <View key={i} style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✅</Text>
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>

      <View style={styles.plansSection}>
        <Text style={styles.sectionTitle}>💰 Choose Your Plan</Text>

        <View style={styles.planCard}>
          <Text style={styles.planTitle}>Monthly VIP</Text>
          <Text style={styles.planPrice}>$4.99/month</Text>
          <Text style={styles.planDesc}>Perfect for trying out premium features</Text>
        </View>

        <View style={[styles.planCard, styles.popularPlan]}>
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>MOST POPULAR</Text>
          </View>
          <Text style={styles.planTitle}>Yearly VIP</Text>
          <Text style={styles.planPrice}>$39.99/year</Text>
          <Text style={styles.planSavings}>Save 33%!</Text>
          <Text style={styles.planDesc}>Best value for serious players</Text>
        </View>
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={[styles.subscribeButton, loading && styles.disabledButton]}
          onPress={() => handleSubscribe('Monthly')}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.subscribeText}>Subscribe Monthly - $4.99</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subscribeButton, styles.yearlyButton, loading && styles.disabledButton]}
          onPress={() => handleSubscribe('Yearly')}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.subscribeText}>Subscribe Yearly - $39.99 🔥 Save 33%</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  header: { padding: 20, alignItems: 'center' },
  backButton: { color: '#1e88e5', fontSize: 16, fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffd700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#a8dadc', textAlign: 'center' },
  benefitsSection: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#f1faee', marginBottom: 16 },
  benefitItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  benefitIcon: { fontSize: 20, marginRight: 12, width: 30 },
  benefitText: { fontSize: 16, color: '#a8dadc', flex: 1 },
  plansSection: { padding: 20 },
  planCard: { backgroundColor: '#1a2332', borderRadius: 12, padding: 20, marginBottom: 16, borderWidth: 2, borderColor: 'transparent' },
  popularPlan: { borderColor: '#1e88e5', position: 'relative' },
  popularBadge: { position: 'absolute', top: -10, right: 20, backgroundColor: '#1e88e5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  popularText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  planTitle: { fontSize: 20, fontWeight: 'bold', color: '#f1faee', marginBottom: 8 },
  planPrice: { fontSize: 24, fontWeight: 'bold', color: '#ffd700', marginBottom: 4 },
  planSavings: { fontSize: 14, color: '#28a745', fontWeight: '600', marginBottom: 8 },
  planDesc: { fontSize: 14, color: '#a8dadc' },
  buttonSection: { padding: 20 },
  subscribeButton: { backgroundColor: '#1e88e5', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  yearlyButton: { backgroundColor: '#28a745' },
  subscribeText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disabledButton: { opacity: 0.6 },
});