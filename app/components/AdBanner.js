import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// Your Banner Ad Unit ID
const BANNER_AD_UNIT_ID = 'ca-app-pub-3609023299103795/2652576503';

export default function AdBanner() {
  const [isVIP, setIsVIP] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkVIPStatus();
  }, []);

  const checkVIPStatus = async () => {
    try {
      const status = await AsyncStorage.getItem('isVIP');
      setIsVIP(status === 'true');
    } catch (error) {
      console.log('VIP check error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hide ads for VIP users or while checking status
  if (isVIP || loading) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        // 🧪 Test ads in development, real ads in production
        unitId={__DEV__ ? TestIds.BANNER : BANNER_AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdFailedToLoad={(error) => {
          console.log('Banner ad failed to load:', error.message);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#0d1b2a', // Matches your app theme
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1b263b',
  },
});