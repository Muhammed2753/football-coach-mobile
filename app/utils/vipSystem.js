// app/utils/vipSystem.js
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import from firebaseConfig in the SAME folder (no nested ./utils/)
import { auth, db, isFirebaseInitialized } from './firebaseConfig';
// import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'; // Uncomment when ready

// Constants
const VIP_STATUS_KEY = '@vip_system_status';
const VIP_FEATURES = {
  aiCoaching: 'ai_coaching',
  analytics: 'advanced_analytics',
  customPlans: 'custom_training_plans',
  prioritySupport: 'priority_support',
  noAds: 'ad_free',
};

/**
 * Check if user has active VIP status
 * @param {string} userId - User ID to check
 * @returns {Promise<Object>} VIP status with features
 */
export const checkVIPStatus = async (userId) => {
  try {
    // First check local storage (fast)
    const stored = await AsyncStorage.getItem(`${VIP_STATUS_KEY}_${userId}`);
    
    if (stored) {
      const vip = JSON.parse(stored);
      const now = new Date();
      const expiry = vip.expiryDate ? new Date(vip.expiryDate) : null;
      
      // If still valid, return cached status
      if (expiry && now < expiry) {
        return {
          isActive: true,
          features: vip.features || Object.values(VIP_FEATURES),
          plan: vip.plan || 'vip-standard',
          expiryDate: expiry,
          isLocal: true,
        };
      }
    }
    
    // If Firebase is ready, check cloud status (more accurate)
    if (isFirebaseInitialized && db && userId) {
      // TODO: Uncomment when Firestore is configured
      // const vipRef = doc(db, 'users', userId, 'subscriptions', 'vip');
      // const vipSnap = await getDoc(vipRef);
      // if (vipSnap.exists()) {
      //   const cloudVip = vipSnap.data();
      //   // Cache to local storage for faster future checks
      //   await AsyncStorage.setItem(`${VIP_STATUS_KEY}_${userId}`, JSON.stringify(cloudVip));
      //   return { ...cloudVip, isLocal: false };
      // }
    }
    
    // No active VIP found
    return {
      isActive: false,
      features: [],
      plan: null,
      expiryDate: null,
      isLocal: false,
    };
    
  } catch (error) {
    console.error('Failed to check VIP status:', error);
    return {
      isActive: false,
      features: [],
      plan: null,
      expiryDate: null,
      error: error.message,
    };
  }
};

/**
 * Activate VIP subscription for a user
 * @param {string} userId - User ID
 * @param {string} planId - Plan identifier (e.g., 'vip-monthly')
 * @param {number} durationDays - Subscription duration (default: 30)
 * @returns {Promise<boolean>} Success status
 */
export const activateVIP = async (userId, planId, durationDays = 30) => {
  try {
    const now = new Date();
    const expiryDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
    
    const vipStatus = {
      userId,
      plan: planId,
      isActive: true,
      features: Object.values(VIP_FEATURES),
      startDate: now.toISOString(),
      expiryDate: expiryDate.toISOString(),
      activatedAt: now.toISOString(),
      source: 'local', // Change to 'stripe' or 'firebase' when integrated
    };
    
    // Save to local storage
    await AsyncStorage.setItem(`${VIP_STATUS_KEY}_${userId}`, JSON.stringify(vipStatus));
    
    // TODO: Sync to Firebase when ready
    // if (isFirebaseInitialized && db) {
    //   const vipRef = doc(db, 'users', userId, 'subscriptions', 'vip');
    //   await setDoc(vipRef, vipStatus);
    // }
    
    console.log('✅ VIP activated:', { userId, plan: planId, expiry: expiryDate });
    return true;
    
  } catch (error) {
    console.error('❌ Failed to activate VIP:', error);
    return false;
  }
};

/**
 * Cancel VIP subscription for a user
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export const cancelVIP = async (userId) => {
  try {
    // Remove from local storage
    await AsyncStorage.removeItem(`${VIP_STATUS_KEY}_${userId}`);
    
    // TODO: Cancel in Firebase/Stripe when ready
    // if (isFirebaseInitialized && db) {
    //   const vipRef = doc(db, 'users', userId, 'subscriptions', 'vip');
    //   await updateDoc(vipRef, { isActive: false, cancelledAt: new Date().toISOString() });
    // }
    
    console.log('✅ VIP cancelled for user:', userId);
    return true;
    
  } catch (error) {
    console.error('❌ Failed to cancel VIP:', error);
    return false;
  }
};

/**
 * Check if user has access to a specific VIP feature
 * @param {string} userId - User ID
 * @param {string} featureKey - Feature identifier from VIP_FEATURES
 * @returns {Promise<boolean>} Has access
 */
export const hasVIPFeature = async (userId, featureKey) => {
  try {
    const vip = await checkVIPStatus(userId);
    if (!vip.isActive) return false;
    
    // If no specific features listed, assume all access
    if (!vip.features || vip.features.length === 0) return true;
    
    return vip.features.includes(featureKey);
    
  } catch (error) {
    console.error('Failed to check VIP feature:', error);
    return false;
  }
};

/**
 * Get list of available VIP features
 * @returns {Object} Feature catalog
 */
export const getVIPFeatures = () => {
  return { ...VIP_FEATURES };
};

/**
 * Refresh VIP status from cloud (if available)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated VIP status
 */
export const refreshVIPStatus = async (userId) => {
  try {
    // Clear local cache first
    await AsyncStorage.removeItem(`${VIP_STATUS_KEY}_${userId}`);
    
    // Re-check status (will fetch from cloud if Firebase is ready)
    return await checkVIPStatus(userId);
    
  } catch (error) {
    console.error('Failed to refresh VIP status:', error);
    return await checkVIPStatus(userId); // Fallback to local
  }
};

/**
 * Hook-style helper for React components (optional utility)
 * Usage: const { isVIP, features } = useVIPStatus(userId);
 */
export const useVIPStatus = (userId) => {
  // This is a placeholder - in real app, use a custom React hook
  // For now, just return a function to check status
  return {
    check: async () => await checkVIPStatus(userId),
    refresh: async () => await refreshVIPStatus(userId),
    hasFeature: async (feature) => await hasVIPFeature(userId, feature),
  };
};