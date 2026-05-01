import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { footballQuotes } from '../assets/data/footballQuotes';

export default function SplashScreen() {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [progress, setProgress] = useState(0);
  const [quote, setQuote] = useState('');

  useEffect(() => {
    // Pick random quote
    const randomQuote = footballQuotes[Math.floor(Math.random() * footballQuotes.length)];
    setQuote(randomQuote);

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Check auth after loading
    const checkAuth = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        setTimeout(() => {
          if (user) {
            router.replace('/');
          } else {
            router.replace('/AuthScreen');
          }
        }, 2500);
      } catch (error) {
        console.error('Auth check failed on splash:', error);
        setTimeout(() => router.replace('/AuthScreen'), 2500);
      }
    };
    checkAuth();

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Image source={require('../assets/images/icon.png')} style={styles.logo} />
        <Text style={styles.title}>⚽ Football Coach</Text>
        <Text style={styles.subtitle}>Your Personal Training Assistant</Text>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffd700" />
          <Text style={styles.loadingText}>Loading {progress}%</Text>
        </View>

        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>"{quote}"</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a', justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center' },
  logo: { width: 150, height: 150, marginBottom: 24, borderRadius: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#ffd700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#a8dadc', marginBottom: 40 },
  loadingContainer: { alignItems: 'center', marginTop: 20 },
  loadingText: { color: '#ffd700', fontSize: 14, marginTop: 12, fontWeight: '600' },
  quoteContainer: { marginTop: 40, paddingHorizontal: 30, alignItems: 'center' },
  quoteText: { color: '#a8dadc', fontSize: 13, fontStyle: 'italic', textAlign: 'center', lineHeight: 20 },
});