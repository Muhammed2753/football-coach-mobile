// app/utils/adManager.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check if user is VIP (no ads for VIP users)
export const shouldShowAds = async () => {
  try {
    const isVIP = await AsyncStorage.getItem('isVIP');
    return isVIP !== 'true';
  } catch (error) {
    return true; // Show ads if check fails
  }
};

// Ad unit IDs (replace with your actual IDs)
// Read AdMob IDs from environment (Expo will expose EXPO_PUBLIC_* to the client)
const ENV = process.env || {};
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : false;

const TEST_IDS = {
  APP: 'ca-app-pub-3940256099942544~3347511713',
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED: 'ca-app-pub-3940256099942544/5224354917',
};

const PROD_DEFAULTS = {
  APP: ENV.EXPO_PUBLIC_ADMOB_APP_ID || 'ca-app-pub-REPLACE_WITH_YOUR_ADMOB_APP_ID',
  BANNER: ENV.EXPO_PUBLIC_ADMOB_BANNER_ID || 'ca-app-pub-REPLACE_WITH_YOUR_ADMOB_ID/REPLACE_BANNER_ID',
  INTERSTITIAL: ENV.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID || 'ca-app-pub-REPLACE_WITH_YOUR_ADMOB_ID/REPLACE_INTERSTITIAL_ID',
  REWARDED: ENV.EXPO_PUBLIC_ADMOB_REWARDED_ID || 'ca-app-pub-REPLACE_WITH_YOUR_ADMOB_ID/REPLACE_REWARDED_ID',
};

if (!isDev) {
  // Warn in console during development if production IDs are not configured for a production build
  if (PROD_DEFAULTS.BANNER.includes('REPLACE_WITH_YOUR_ADMOB')) {
    console.warn('AdMob production IDs not set. Set EXPO_PUBLIC_ADMOB_* variables for production builds.');
  }
}

export const AD_UNITS = {
  APP_ID: isDev ? TEST_IDS.APP : PROD_DEFAULTS.APP,
  BANNER: isDev ? TEST_IDS.BANNER : PROD_DEFAULTS.BANNER,
  INTERSTITIAL: isDev ? TEST_IDS.INTERSTITIAL : PROD_DEFAULTS.INTERSTITIAL,
  REWARDED: isDev ? TEST_IDS.REWARDED : PROD_DEFAULTS.REWARDED,
};

// Track ad impressions
let adImpressions = 0;
let lastInterstitialTime = 0;

export const incrementAdImpressions = () => {
  adImpressions++;
};

export const getAdImpressions = () => adImpressions;

// Show interstitial ad with frequency control
export const shouldShowInterstitial = () => {
  const now = Date.now();
  const timeSinceLastAd = now - lastInterstitialTime;
  const minTimeBetweenAds = 3 * 60 * 1000; // 3 minutes

  if (timeSinceLastAd > minTimeBetweenAds) {
    lastInterstitialTime = now;
    return true;
  }
  return false;
};

// Ad placement strategy
export const AD_PLACEMENTS = {
  HOME_SCREEN: 'banner',
  AFTER_PROFILE_CREATE: 'interstitial',
  AFTER_3_SESSIONS: 'interstitial',
  UNLOCK_FEATURE: 'rewarded',
  DRILL_LIBRARY: 'banner',
  PROGRESS_SCREEN: 'banner',
};
