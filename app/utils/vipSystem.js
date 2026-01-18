// app/utils/vipSystem.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const VIP_KEY = 'football_coach_vip_status';
const VIP_EXPIRY_KEY = 'football_coach_vip_expiry';

/**
 * VIP Subscription Plans
 */
export const VIP_PLANS = {
  FREE: {
    name: 'Free Player',
    price: 'FREE',
    duration: 'Forever',
    features: [
      '✅ Create unlimited players',
      '✅ Save 5 players',
      '✅ Basic player card',
      '✅ Standard themes',
      '❌ No AI Coach',
      '❌ No comparison mode',
      '❌ No PDF export',
    ],
    color: '#CD7F32',
  },
  MONTHLY: {
    name: 'Pro Coach',
    price: '$4.99',
    duration: '/month',
    features: [
      '✅ Create unlimited players',
      '✅ Save UNLIMITED players',
      '✅ Premium player card designs',
      '✅ 5 custom themes',
      '✅ AI Coach recommendations',
      '✅ Side-by-side comparison',
      '✅ Export card to PDF',
      '✅ Ad-free experience',
      '✅ Priority support',
      '✅ Weekly training tips',
    ],
    color: '#FFD700',
  },
  YEARLY: {
    name: 'Elite Champion',
    price: '$39.99',
    duration: '/year (Save 33%)',
    features: [
      '✅ ALL Pro Coach features',
      '✅ 10 custom themes',
      '✅ AI Coach (unlimited)',
      '✅ Career timeline (5 years)',
      '✅ Advanced comparison (3 players)',
      '✅ Export as PNG/PDF',
      '✅ VIP badge on cards',
      '✅ Exclusive drills',
      '✅ Personal mentor access',
      '✅ Early access to new features',
    ],
    color: '#D4AF37',
  },
};

/**
 * Check if user is VIP
 */
export const isUserVIP = async () => {
  try {
    const vipStatus = await AsyncStorage.getItem(VIP_KEY);
    const expiry = await AsyncStorage.getItem(VIP_EXPIRY_KEY);
    
    if (!vipStatus || vipStatus === 'false') return false;
    
    if (expiry) {
      const expiryDate = new Date(expiry);
      if (new Date() > expiryDate) {
        // VIP expired
        await AsyncStorage.setItem(VIP_KEY, 'false');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error checking VIP status:', error);
    return false;
  }
};

/**
 * Get VIP tier
 */
export const getVIPTier = async () => {
  try {
    const tier = await AsyncStorage.getItem('vip_tier');
    return tier || 'FREE';
  } catch (error) {
    console.error('Error getting VIP tier:', error);
    return 'FREE';
  }
};

/**
 * Activate VIP subscription
 */
export const activateVIP = async (planType, days = 30) => {
  try {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    
    await AsyncStorage.setItem(VIP_KEY, 'true');
    await AsyncStorage.setItem(VIP_EXPIRY_KEY, expiryDate.toISOString());
    await AsyncStorage.setItem('vip_tier', planType);
    
    return { success: true, expiryDate };
  } catch (error) {
    console.error('Error activating VIP:', error);
    return { success: false };
  }
};

/**
 * Check player limit
 */
export const canSaveMorePlayers = async (totalPlayers) => {
  const isVIP = await isUserVIP();
  
  if (isVIP) return true; // Unlimited
  
  return totalPlayers < 5; // Free: max 5
};

/**
 * Get max saved players
 */
export const getMaxSavedPlayers = async () => {
  const isVIP = await isUserVIP();
  return isVIP ? 999 : 5;
};

/**
 * Cancel VIP
 */
export const cancelVIP = async () => {
  try {
    await AsyncStorage.setItem(VIP_KEY, 'false');
    await AsyncStorage.removeItem(VIP_EXPIRY_KEY);
    await AsyncStorage.removeItem('vip_tier');
    
    return { success: true };
  } catch (error) {
    console.error('Error canceling VIP:', error);
    return { success: false };
  }
};

/**
 * Get VIP expiry date
 */
export const getVIPExpiryDate = async () => {
  try {
    const expiry = await AsyncStorage.getItem(VIP_EXPIRY_KEY);
    return expiry ? new Date(expiry) : null;
  } catch (error) {
    console.error('Error getting expiry date:', error);
    return null;
  }
};
