// app/components/AdBanner.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// import { useVIPStatus } from '../utils/vipSystem'; // Uncomment when ready

const AdBanner = () => {
  // const { isVIP } = useVIPStatus();
  
  // Hide ads for VIP users (uncomment when VIP system is ready)
  // if (isVIP) return null;
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📢 Ad Banner</Text>
      {/* Replace with actual Google Mobile Ads component */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#1b263b',
    alignItems: 'center',
  },
  text: {
    color: '#a8dadc',
    fontSize: 12,
  },
});

export default AdBanner;