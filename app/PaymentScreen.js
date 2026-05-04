// app/PaymentScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { startCheckout } from './utils/stripePayment';

const PaymentScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      const result = await startCheckout({
        amount: params.amount,
        plan: params.plan,
        playerId: params.playerId,
      });
      
      if (result.success) {
        Alert.alert('Success', 'Payment completed! Your VIP features are now active.', [
          { text: 'OK', onPress: () => router.replace('/ProfileForm') }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💳 Complete Payment</Text>
        <Text style={styles.subtitle}>Secure checkout for VIP access</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.orderSummary}>
          <Text style={styles.orderText}>Plan: {params.plan || 'VIP Monthly'}</Text>
          <Text style={styles.orderText}>Player: {params.playerName || 'Your Player'}</Text>
          <Text style={styles.orderPrice}>Total: ${params.amount || '4.99'}/month</Text>
        </View>

        <View style={styles.securityInfo}>
          <Text style={styles.securityTitle}>🔒 Secure Payment</Text>
          <Text style={styles.securityText}>• All transactions are encrypted</Text>
          <Text style={styles.securityText}>• No card details stored on our servers</Text>
          <Text style={styles.securityText}>• Cancel anytime from Settings</Text>
        </View>

        {loading ? (
          <View style={{ alignItems: 'center', padding: 20 }}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={{ color: '#a8dadc', marginTop: 12 }}>Processing payment...</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.payButton}
              onPress={handlePayment}
              disabled={loading}
            >
              <Text style={styles.payButtonText}>Pay ${params.amount || '4.99'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default PaymentScreen;

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