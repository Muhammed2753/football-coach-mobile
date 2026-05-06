import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useVIPStatus() {
  const [isVIP, setIsVIP] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkVIP = async () => {
      try {
        const status = await AsyncStorage.getItem('isVIP');
        setIsVIP(status === 'true');
      } catch (e) {
        console.error('VIP check failed:', e);
      } finally {
        setLoading(false);
      }
    };
    checkVIP();
  }, []);

  return { isVIP, loading };
}