// app/VIPSubscription.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
// Update path if your payment file is named differently
import { startCheckout } from './utils/paymentProcessor';

const VIPSubscription = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSubscribe = async (planType) => {
    if (loading) return;
    
    setSelectedPlan(planType);
    setLoading(true);
    
    try {
      const planDetails = {
        Monthly: { amount: 499, planId: 'vip-monthly' }, // $4.99 in cents
        Yearly: { amount: 3999, planId: 'vip-yearly' },  // $39.99 in cents
      };
      
      const { amount, planId } = planDetails[planType];
      
      // TODO: Replace with actual Stripe/payment integration
      const result = await startCheckout({
        amount,
        plan: planId,
        userId: 'current-user-id', // Replace with actual user ID from auth
      });
      
      if (result.success) {
        Alert.alert(
          'Success! 🎉',
          `VIP ${planType} activated! Enjoy all premium features.`,
          [{ text: 'Awesome!', onPress: () => router.replace('/') }]
        );
      } else {
        Alert.alert('Payment Failed', result.error || 'Please try again.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>⚡ VIP Subscription</Text>
        <Text style={styles.subtitle}>Unlock premium coaching features</Text>
      </View>

      {/* Benefits List */}
      <View style={styles.benefitsSection}>
        <Text style={styles.sectionTitle}>✨ What You Get:</Text>
        
        <View style={styles.benefitItem}>
          <Text style={styles.benefitIcon}>🎯</Text>
          <Text style={styles.benefitText}>Unlimited AI coaching sessions</Text>
        </View>
        <View style={styles.benefitItem}>
          <Text style={styles.benefitIcon}>📊</Text>
          <Text style={styles.benefitText}>Advanced analytics & progress tracking</Text>
        </View>
        <View style={styles.benefitItem}>
          <Text style={styles.benefitIcon}>🏆</Text>
          <Text style={styles.benefitText}>Exclusive training plans & drills</Text>
        </View>
        <View style={styles.benefitItem}>
          <Text style={styles.benefitIcon}>💬</Text>
          <Text style={styles.benefitText}>Priority VIP chat support</Text>
        </View>
        <View style={styles.benefitItem}>
          <Text style={styles.benefitIcon}>🚫</Text>
          <Text style={styles.benefitText}>No ads - uninterrupted experience</Text>
        </View>
      </View>

      {/* Plan Cards */}
      <View style={styles.plansSection}>
        {/* Monthly Plan */}
        <View style={styles.planCard}>
          <Text style={styles.planTitle}>Monthly</Text>
          <Text style={styles.planPrice}>$4.99<span style={{fontSize: 14, color: '#a8dadc'}}>/month</span></Text>
          <Text style={styles.planDesc}>Billed monthly. Cancel anytime.</Text>
        </View>

        {/* Yearly Plan (Popular) */}
        <View style={[styles.planCard, styles.popularPlan]}>
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>MOST POPULAR</Text>
          </View>
          <Text style={styles.planTitle}>Yearly</Text>
          <Text style={styles.planPrice}>$39.99<span style={{fontSize: 14, color: '#a8dadc'}}>/year</span></Text>
          <Text style={styles.planSavings}>🔥 Save 33% vs monthly</Text>
          <Text style={styles.planDesc}>Best value! Billed annually.</Text>
        </View>
      </View>

      {/* Subscribe Buttons */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={[styles.subscribeButton, loading && styles.disabledButton]}
          onPress={() => handleSubscribe('Monthly')}
          disabled={loading}
        >
          {loading && selectedPlan === 'Monthly' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.subscribeText}>Subscribe Monthly - $4.99</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subscribeButton, styles.yearlyButton, loading && styles.disabledButton]}
          onPress={() => handleSubscribe('Yearly')}
          disabled={loading}
        >
          {loading && selectedPlan === 'Yearly' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.subscribeText}>Subscribe Yearly - $39.99 🔥 Save 33%</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.securityNote}>
          🔒 Secure payment via Stripe. Cancel anytime in Settings.
        </Text>
      </View>
    </ScrollView>
  );
};

export default VIPSubscription;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  content: { paddingBottom: 40 },
  header: { padding: 20, alignItems: 'center', backgroundColor: '#1a2332', borderBottomWidth: 2, borderBottomColor: '#ffd700' },
  backButton: { alignSelf: 'flex-start', padding: 8 },
  backButtonText: { color: '#1e88e5', fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffd700', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#a8dadc', textAlign: 'center' },
  benefitsSection: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#f1faee', marginBottom: 16 },
  benefitItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  benefitIcon: { fontSize: 20, marginRight: 12, width: 30 },
  benefitText: { fontSize: 16, color: '#a8dadc', flex: 1 },
  plansSection: { padding: 20 },
  planCard: { backgroundColor: '#1a2332', borderRadius: 12, padding: 20, marginBottom: 16, borderWidth: 2, borderColor: 'transparent', position: 'relative' },
  popularPlan: { borderColor: '#1e88e5' },
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
  securityNote: { color: '#6b7280', fontSize: 12, textAlign: 'center', marginTop: 10 },
});