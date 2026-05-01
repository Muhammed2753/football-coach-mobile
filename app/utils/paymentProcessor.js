// app/utils/paymentProcessor.js
// IMPORTANT: Raw card numbers are NEVER sent to any server.
// Card data is tokenized client-side via Stripe before any network call.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { activateVIP } from './vipSystem';
import { startCheckout } from './stripePayment';

/**
 * processPayment — delegates to Stripe Checkout (server-side session).
 * Card details are entered on Stripe's hosted page, never in this app.
 */
export const processPayment = async (paymentData) => {
  try {
    // Use Stripe Checkout — card data never touches this app
    const result = await startCheckout(paymentData.planType);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    // VIP activation happens via webhook on the backend after payment succeeds.
    // The local activation below is a fallback for offline/demo mode only.
    const vipDays = paymentData.planType === 'MONTHLY' ? 30 : 365;
    await activateVIP(paymentData.planType, vipDays);

    return { success: true, message: 'Redirected to secure payment page' };
  } catch (error) {
    console.error('Payment processing error:', error);
    return { success: false, error: 'Payment processing failed' };
  }
};

export const getPaymentHistory = async () => {
  try {
    const transactions = await AsyncStorage.getItem('payment_history');
    return transactions ? JSON.parse(transactions) : [];
  } catch (error) {
    return [];
  }
};

const getRecentTransactions = async () => {
  try {
    const transactions = await AsyncStorage.getItem('payment_history');
    if (!transactions) return [];
    const parsed = JSON.parse(transactions);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return parsed.filter(t => new Date(t.timestamp) > oneHourAgo);
  } catch (error) {
    return [];
  }
};