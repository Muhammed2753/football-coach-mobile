// app/utils/vipSystem.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const VIP_KEY = 'football_coach_vip_status';
const VIP_EXPIRY_KEY = 'football_coach_vip_expiry';

/**
 * VIP Subscription Plans
 */
export const VIP_PLANS = {
  FREE: {
    name: 'Free Coach',
    price: 'FREE',
    duration: 'Forever',
    features: [
      '✅ Create up to 3 players',
      '✅ Basic player stats',
      '✅ Simple player cards',
      '✅ 2 team formations',
      '❌ No advanced analytics',
      '❌ No team comparison',
      '❌ Limited training drills',
    ],
    color: '#CD7F32',
  },
  MONTHLY: {
    name: 'Pro Coach',
    price: '$4.99',
    duration: '/month',
    features: [
      '✅ Create unlimited players',
      '✅ Advanced player statistics',
      '✅ Performance tracking',
      '✅ 8 team formations',
      '✅ Training drill library',
      '✅ Player comparison tool',
      '✅ Match analysis',
      '✅ Ad-free experience',
    ],
    color: '#FFD700',
  },
  YEARLY: {
    name: 'Elite Coach',
    price: '$24.99',
    duration: '/year (Save 30%)',
    features: [
      '✅ All Pro Coach features',
      '✅ Season planning tools',
      '✅ Team chemistry analysis',
      '✅ Injury tracking system',
      '✅ Custom formation builder',
      '✅ Export team reports',
      '✅ Multi-team management',
      '✅ Priority support',
    ],
    color: '#D4AF37',
  },
};

/**
 * Check if user is VIP - checks Firestore first, falls back to AsyncStorage
 */
export const isUserVIP = async () => {
  try {
    const userId = auth?.currentUser?.uid;

    if (userId && db) {
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists()) {
        const data = snap.data();
        if (!data.isVIP) return false;
        if (data.vipExpiry && new Date() > new Date(data.vipExpiry)) return false;
        // Cache result locally
        await AsyncStorage.setItem('isVIP', 'true');
        return true;
      }
    }

    // Fallback to local cache
    const cached = await AsyncStorage.getItem('isVIP');
    const expiry = await AsyncStorage.getItem(VIP_EXPIRY_KEY);
    if (cached !== 'true') return false;
    if (expiry && new Date() > new Date(expiry)) {
      await AsyncStorage.setItem('isVIP', 'false');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error checking VIP status:', error);
    // Last resort: use cache
    const cached = await AsyncStorage.getItem('isVIP');
    return cached === 'true';
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

    // Set both keys for compatibility
    await AsyncStorage.setItem('isVIP', 'true');
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
  
  if (isVIP) return true; // Unlimited for VIP
  
  return totalPlayers < 3; // Free: max 3 players
};

/**
 * Get max saved players
 */
export const getMaxSavedPlayers = async () => {
  const isVIP = await isUserVIP();
  return isVIP ? 999 : 3; // Free users get 3 players max
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
