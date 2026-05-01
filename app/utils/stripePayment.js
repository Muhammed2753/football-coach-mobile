// app/utils/stripePayment.js
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './firebaseConfig';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export const startCheckout = async (plan) => {
  try {
    const userId = auth?.currentUser?.uid;
    if (!userId) {
      return { success: false, error: 'You must be logged in to subscribe.' };
    }

    const response = await fetch(`${BACKEND_URL}/api/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, userId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to create checkout session.' };
    }

    // Open Stripe Checkout in the browser
    await Linking.openURL(data.url);
    return { success: true };
  } catch (error) {
    console.error('Checkout error:', error);
    return { success: false, error: 'Could not connect to payment server.' };
  }
};

export const getSubscriptionStatus = async () => {
  try {
    const isVIP = await AsyncStorage.getItem('isVIP');
    const plan = await AsyncStorage.getItem('vip_plan');
    const startDate = await AsyncStorage.getItem('vip_start_date');
    return {
      isActive: isVIP === 'true',
      plan: plan || null,
      startDate: startDate ? new Date(startDate) : null,
    };
  } catch {
    return { isActive: false, plan: null, startDate: null };
  }
};
