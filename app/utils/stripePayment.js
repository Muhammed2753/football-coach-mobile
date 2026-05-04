// app/utils/stripePayment.js
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import Stripe from '@stripe/stripe-react-native'; // Uncomment when Stripe is installed

// Constants
const VIP_STATUS_KEY = '@vip_stripe_status';
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

/**
 * Check if user has active VIP status via Stripe subscription
 * @param {string} userId - User ID to check
 * @returns {Promise<Object>} VIP status object
 */
export const checkVIPStatus = async (userId) => {
  try {
    const stored = await AsyncStorage.getItem(`${VIP_STATUS_KEY}_${userId}`);
    if (!stored) {
      return { isActive: false, plan: null, startDate: null };
    }
    
    const parsed = JSON.parse(stored);
    const now = new Date();
    const expiry = parsed.expiryDate ? new Date(parsed.expiryDate) : null;
    
    // Check if subscription is still valid
    if (expiry && now < expiry) {
      return {
        isActive: true,
        plan: parsed.plan || null,
        startDate: parsed.startDate ? new Date(parsed.startDate) : null,
        expiryDate: expiry,
      };
    }
    
    // Subscription expired - clean up
    await AsyncStorage.removeItem(`${VIP_STATUS_KEY}_${userId}`);
    return { isActive: false, plan: null, startDate: null };
    
  } catch (error) {
    console.error('Failed to check VIP status:', error);
    return { isActive: false, plan: null, startDate: null };
  }
};

/**
 * Start a Stripe checkout session
 * @param {Object} params - Checkout parameters
 * @param {number} params.amount - Amount in cents (e.g., 499 = $4.99)
 * @param {string} params.plan - Plan identifier (e.g., 'vip-monthly')
 * @param {string} params.userId - User ID
 * @returns {Promise<Object>} Checkout result
 */
export const startStripeCheckout = async ({ amount, plan, userId }) => {
  try {
    // TODO: Replace with actual Stripe integration when ready
    // For now, this is a mock implementation for development
    
    // 1. Initialize Stripe (uncomment when @stripe/stripe-react-native is installed)
    // const { error: initError } = await Stripe.initStripe({
    //   publishableKey: STRIPE_PUBLISHABLE_KEY,
    // });
    // if (initError) throw new Error(initError.message);

    // 2. Create payment method (mock for dev)
    console.log('🛒 Stripe checkout started:', { amount, plan, userId });
    
    // Simulate network delay for realistic UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 3. Mock successful payment
    const paymentResult = {
      success: true,
      paymentIntentId: `pi_mock_${Date.now()}`,
      amount,
      currency: 'usd',
    };

    // 4. Activate VIP on successful payment
    await activateVIPSubscription(userId, plan);
    
    // 5. Record transaction
    await recordStripeTransaction({
      userId,
      amount,
      plan,
      status: 'succeeded',
      paymentIntentId: paymentResult.paymentIntentId,
    });
    
    return {
      success: true,
      message: 'Payment successful! VIP features unlocked.',
      data: paymentResult,
    };
    
  } catch (error) {
    console.error('❌ Stripe checkout failed:', error);
    return {
      success: false,
      error: error.message || 'Payment failed. Please try again.',
    };
  }
};

/**
 * Activate VIP subscription locally after successful Stripe payment
 * @param {string} userId - User ID
 * @param {string} plan - Plan identifier
 * @param {number} durationDays - Subscription duration (default: 30)
 */
export const activateVIPSubscription = async (userId, plan, durationDays = 30) => {
  try {
    const now = new Date();
    const expiryDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
    
    const vipStatus = {
      userId,
      plan,
      isActive: true,
      startDate: now.toISOString(),
      expiryDate: expiryDate.toISOString(),
      activatedAt: now.toISOString(),
    };
    
    await AsyncStorage.setItem(`${VIP_STATUS_KEY}_${userId}`, JSON.stringify(vipStatus));
    console.log('✅ VIP subscription activated:', { userId, plan, expiryDate });
    
  } catch (error) {
    console.error('❌ Failed to activate VIP subscription:', error);
    throw error;
  }
};

/**
 * Record a Stripe transaction locally
 * @param {Object} transaction - Transaction details
 */
export const recordStripeTransaction = async (transaction) => {
  try {
    const TRANSACTIONS_KEY = `@stripe_transactions_${transaction.userId}`;
    const existing = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    const transactions = existing ? JSON.parse(existing) : [];
    
    const newTransaction = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...transaction
    };
    
    transactions.unshift(newTransaction);
    const trimmed = transactions.slice(0, 50); // Keep last 50
    
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(trimmed));
    
  } catch (error) {
    console.error('Failed to record Stripe transaction:', error);
  }
};

/**
 * Cancel VIP subscription (local cleanup + Stripe API call placeholder)
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export const cancelVIPSubscription = async (userId) => {
  try {
    // TODO: Add actual Stripe subscription cancellation API call here
    // const { error } = await Stripe.cancelSubscription({ subscriptionId: ... });
    
    // Local cleanup
    await AsyncStorage.removeItem(`${VIP_STATUS_KEY}_${userId}`);
    console.log('✅ VIP subscription cancelled for user:', userId);
    return true;
    
  } catch (error) {
    console.error('❌ Failed to cancel VIP subscription:', error);
    return false;
  }
};

/**
 * Open Stripe customer portal for managing subscriptions
 * @param {string} userId - User ID
 */
export const openCustomerPortal = async (userId) => {
  try {
    // TODO: Replace with actual Stripe Customer Portal URL from your backend
    const portalUrl = `https://billing.stripe.com/p/session/test_${userId}`;
    
    const supported = await Linking.canOpenURL(portalUrl);
    if (supported) {
      await Linking.openURL(portalUrl);
    } else {
      Alert.alert('Error', 'Cannot open subscription management page');
    }
  } catch (error) {
    console.error('Failed to open customer portal:', error);
  }
};

/**
 * Restore purchases (for App Store / Play Store compatibility)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Restore result
 */
export const restorePurchases = async (userId) => {
  try {
    // Check local storage first
    const vipStatus = await checkVIPStatus(userId);
    if (vipStatus.isActive) {
      return { success: true, message: 'VIP already active', data: vipStatus };
    }
    
    // TODO: Add actual Stripe/StoreKit restore logic here
    // For now, return not found
    return { success: false, message: 'No active subscription found' };
    
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    return { success: false, error: error.message };
  }
};