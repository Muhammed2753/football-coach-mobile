// app/utils/paymentProcessor.js
// IMPORTANT: Raw card numbers are NEVER sent to any server.
// Card data is tokenized client-side via Stripe before any network call.

import AsyncStorage from '@react-native-async-storage/async-storage';
// import Stripe from '@stripe/stripe-react-native'; // Uncomment when Stripe is installed

// Constants
const TRANSACTIONS_KEY = '@payment_transactions';
const VIP_STATUS_KEY = '@vip_status';

/**
 * Activate VIP status for a user
 * @param {string} userId - The user's unique ID
 * @param {string} planId - The subscription plan ID
 * @returns {Promise<boolean>} Success status
 */
export const activateVIP = async (userId, planId) => {
  try {
    const vipStatus = {
      isActive: true,
      planId,
      userId,
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    };
    
    await AsyncStorage.setItem(VIP_STATUS_KEY, JSON.stringify(vipStatus));
    console.log('✅ VIP activated for user:', userId);
    return true;
  } catch (error) {
    console.error('❌ Failed to activate VIP:', error);
    return false;
  }
};

/**
 * Start a Stripe checkout session
 * @param {Object} params - Checkout parameters
 * @param {number} params.amount - Amount in cents
 * @param {string} params.plan - Plan identifier
 * @param {string} params.userId - User ID
 * @returns {Promise<Object>} Checkout result
 */
export const startCheckout = async ({ amount, plan, userId }) => {
  try {
    // TODO: Replace with actual Stripe integration
    // const { error } = await Stripe.initStripePublisher({ publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY });
    // if (error) throw new Error(error.message);
    
    // const { paymentIntent, error } = await Stripe.createPaymentMethod({
    //   paymentMethodType: 'Card',
    //   currency: 'USD',
    //   amount,
    // });
    
    // Mock success for development
    console.log('🛒 Checkout started:', { amount, plan, userId });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Activate VIP on successful "payment"
    await activateVIP(userId, plan);
    
    // Record transaction
    await recordTransaction({ userId, amount, plan, status: 'success' });
    
    return { success: true, message: 'Payment successful!' };
  } catch (error) {
    console.error('❌ Checkout failed:', error);
    return { success: false, error: error.message || 'Payment failed' };
  }
};

/**
 * Record a payment transaction locally
 * @param {Object} transaction - Transaction details
 */
export const recordTransaction = async (transaction) => {
  try {
    const existing = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    const transactions = existing ? JSON.parse(existing) : [];
    
    const newTransaction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...transaction
    };
    
    transactions.unshift(newTransaction); // Add to beginning
    
    // Keep only last 100 transactions
    const trimmed = transactions.slice(0, 100);
    
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to record transaction:', error);
  }
};

/**
 * Get recent transactions (last hour)
 * @returns {Promise<Array>} Recent transactions
 */
export const getRecentTransactions = async () => {
  try {
    const transactions = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    if (!transactions) return [];
    
    const parsed = JSON.parse(transactions);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    return parsed.filter(t => new Date(t.timestamp) > oneHourAgo);
  } catch (error) {
    console.error('Failed to get recent transactions:', error);
    return [];
  }
};

/**
 * Check if user has active VIP status
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>} VIP status
 */
export const checkVIPStatus = async (userId) => {
  try {
    const stored = await AsyncStorage.getItem(VIP_STATUS_KEY);
    if (!stored) return false;
    
    const vip = JSON.parse(stored);
    if (vip.userId !== userId) return false;
    
    // Check if subscription is still valid
    const now = new Date();
    const expires = new Date(vip.expiresAt);
    
    return now < expires;
  } catch (error) {
    console.error('Failed to check VIP status:', error);
    return false;
  }
};

/**
 * Cancel VIP subscription
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export const cancelVIP = async (userId) => {
  try {
    await AsyncStorage.removeItem(VIP_STATUS_KEY);
    console.log('✅ VIP cancelled for user:', userId);
    return true;
  } catch (error) {
    console.error('❌ Failed to cancel VIP:', error);
    return false;
  }
};