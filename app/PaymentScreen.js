// app/PaymentScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { startCheckout } from '';

export default function PaymentScreen() {
  const router = useRouter();
  const { planType, planName, price, duration } = useLocalSearchParams();
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const result = await startCheckout(planType);
      if (!result.success) {
        Alert.alert('Error', result.error || 'Could not start checkout. Please try again.');
      }
      // On success, Stripe Checkout opens in browser.
      // VIP is activated by the backend webhook after payment completes.
    } catch (error) {
      Alert.alert('Error', 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ðŸ’³ Secure Payment</Text>
        <Text style={styles.subtitle}>Complete your {planName} subscription</Text>
        <View style={styles.orderSummary}>
          <Text style={styles.orderText}>Plan: {planName}</Text>
          <Text style={styles.orderText}>Duration: {duration}</Text>
          <Text style={styles.orderPrice}>Total: {price}</Text>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.securityInfo}>
          <Text style={styles.securityTitle}>ðŸ”’ Secure Checkout via Stripe</Text>
          <Text style={styles.securityText}>â€¢ Card details are entered on Stripe's secure page</Text>
          <Text style={styles.securityText}>â€¢ We never see or store your card number</Text>
          <Text style={styles.securityText}>â€¢ 256-bit SSL encryption</Text>
          <Text style={styles.securityText}>â€¢ PCI DSS Level 1 compliant</Text>
        </View>

        <TouchableOpacity
          style={[styles.payButton, processing && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={processing}
        >
          {processing
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.payButtonText}>Pay {price} via Stripe</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  header: { padding: 24, backgroundColor: '#1e3a5f', borderBottomWidth: 3, borderBottomColor: '#FFD700' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFD700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#a8dadc', marginBottom: 16 },
  orderSummary: { backgroundColor: '#1b263b', padding: 16, borderRadius: 8 },
  orderText: { color: '#f1faee', fontSize: 14, marginBottom: 4 },
  orderPrice: { color: '#FFD700', fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  form: { padding: 20 },
  securityInfo: { backgroundColor: '#1b5e20', padding: 16, borderRadius: 8, marginBottom: 24 },
  securityTitle: { color: '#a5d6a7', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  securityText: { color: '#a5d6a7', fontSize: 14, marginBottom: 4 },
  payButton: { backgroundColor: '#4CAF50', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  payButtonDisabled: { backgroundColor: '#666' },
  payButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cancelButton: { backgroundColor: '#1e88e5', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  cancelButtonText: { color: '#fff', fontSize: 16 },
});