// app/OnboardingScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const slides = [
  {
    icon: '⚽',
    title: 'Welcome to Football Coach',
    description: 'Your personal AI coach for football development. Track progress, get expert advice, and improve your game!'
  },
  {
    icon: '📊',
    title: 'Track Your Progress',
    description: 'Log training sessions, monitor your stats, and build winning streaks. Every session counts!'
  },
  {
    icon: '💬',
    title: 'AI Coach Chat',
    description: 'Get personalized advice 24/7. Ask about drills, tactics, nutrition, or mental preparation.'
  },
  {
    icon: '🏆',
    title: 'Achieve Greatness',
    description: 'Earn achievements, unlock features, and become the player you dream of being. Let\'s start!'
  }
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('onboarding_completed', 'true');
    router.replace('/');
  };

  const slide = slides[currentSlide];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.icon}>{slide.icon}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentSlide && styles.activeDot]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextText}>
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a', padding: 20 },
  skipButton: { alignSelf: 'flex-end', padding: 10 },
  skipText: { color: '#a8dadc', fontSize: 16 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  icon: { fontSize: 100, marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f1faee', textAlign: 'center', marginBottom: 20 },
  description: { fontSize: 16, color: '#a8dadc', textAlign: 'center', lineHeight: 24 },
  footer: { paddingBottom: 40 },
  pagination: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1b263b', marginHorizontal: 5 },
  activeDot: { backgroundColor: '#1e88e5', width: 30 },
  nextButton: { backgroundColor: '#1e88e5', padding: 18, borderRadius: 12, alignItems: 'center' },
  nextText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
