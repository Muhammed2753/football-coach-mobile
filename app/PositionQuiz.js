// app/PositionQuiz.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
// ✅ Import interstitial ad hook (create this file if missing)
import { useInterstitialAd } from './hooks/useInterstitialAd';

const PositionQuiz = () => {
  const router = useRouter();
  
  // State declarations (missing in your version)
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Initialize ad hook
  const { showInterstitial, isAdReady } = useInterstitialAd();

  // Quiz questions
  const questions = [
    {
      id: 1,
      question: "What do you enjoy most on the pitch?",
      options: [
        { text: "Scoring goals", points: { striker: 3, winger: 1 } },
        { text: "Creating chances for teammates", points: { midfielder: 3, attackingMid: 2 } },
        { text: "Stopping opponents", points: { defender: 3, defensiveMid: 2 } },
        { text: "Making crucial saves", points: { goalkeeper: 3 } }
      ]
    },
    {
      id: 2,
      question: "How would you describe your speed?",
      options: [
        { text: "Lightning fast", points: { winger: 3, striker: 2, fullBack: 2 } },
        { text: "Quick enough", points: { midfielder: 2, attackingMid: 2 } },
        { text: "Average pace", points: { defender: 2, defensiveMid: 2 } },
        { text: "Speed isn't my strength", points: { goalkeeper: 2, defender: 1 } }
      ]
    },
    {
      id: 3,
      question: "What's your best physical attribute?",
      options: [
        { text: "Agility and balance", points: { winger: 3, attackingMid: 2 } },
        { text: "Strength and power", points: { defender: 3, striker: 2 } },
        { text: "Stamina and endurance", points: { boxToBox: 3, fullBack: 2 } },
        { text: "Reflexes and reactions", points: { goalkeeper: 3, winger: 1 } }
      ]
    },
    {
      id: 4,
      question: "How do you prefer to pass?",
      options: [
        { text: "Short, quick passes", points: { midfielder: 3, attackingMid: 2 } },
        { text: "Long, accurate passes", points: { deepLying: 3, defensiveMid: 2 } },
        { text: "Crosses from the wing", points: { winger: 3, fullBack: 2 } },
        { text: "I prefer shooting", points: { striker: 3 } }
      ]
    },
    {
      id: 5,
      question: "What's your defensive style?",
      options: [
        { text: "Aggressive tackling", points: { defender: 3, defensiveMid: 2 } },
        { text: "Intercepting passes", points: { defensiveMid: 3, deepLying: 2 } },
        { text: "Tracking back when needed", points: { boxToBox: 3, midfielder: 2 } },
        { text: "I focus on attacking", points: { striker: 2, winger: 2, attackingMid: 1 } }
      ]
    },
    {
      id: 6,
      question: "Where do you feel most comfortable?",
      options: [
        { text: "In the penalty box", points: { striker: 3, goalkeeper: 2 } },
        { text: "On the wings", points: { winger: 3, fullBack: 2 } },
        { text: "Center of the pitch", points: { midfielder: 3, boxToBox: 2, deepLying: 2 } },
        { text: "In my own half", points: { defender: 3, defensiveMid: 2 } }
      ]
    },
    {
      id: 7,
      question: "What's your playing style?",
      options: [
        { text: "Direct and explosive", points: { striker: 3, winger: 2 } },
        { text: "Creative and technical", points: { attackingMid: 3, deepLying: 2 } },
        { text: "Disciplined and tactical", points: { defensiveMid: 3, defender: 2 } },
        { text: "All-action, everywhere", points: { boxToBox: 3, fullBack: 2 } }
      ]
    },
    {
      id: 8,
      question: "How do you handle pressure?",
      options: [
        { text: "I thrive under pressure", points: { striker: 2, goalkeeper: 3 } },
        { text: "I stay calm and composed", points: { deepLying: 3, defender: 2 } },
        { text: "I work harder", points: { boxToBox: 3, defensiveMid: 2 } },
        { text: "I create magic moments", points: { attackingMid: 3, winger: 2 } }
      ]
    }
  ];

  const positions = {
    striker: "Striker",
    winger: "Winger",
    midfielder: "Midfielder",
    defender: "Defender",
    goalkeeper: "Goalkeeper",
    fullBack: "Full Back",
    defensiveMid: "Defensive Midfielder",
    attackingMid: "Attacking Midfielder",
    deepLying: "Deep-Lying Playmaker",
    boxToBox: "Box-to-Box Midfielder"
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setIsCalculating(false);
  };

  const handleAnswer = (option) => {
    if (isCalculating) return;
    
    const newAnswers = { ...answers };
    
    Object.keys(option.points).forEach(position => {
      newAnswers[position] = (newAnswers[position] || 0) + option.points[position];
    });

    if (currentQuestion < questions.length - 1) {
      setAnswers(newAnswers);
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCalculating(true);
      showResults(newAnswers);
    }
  };

  const showResults = (finalAnswers) => {
    setTimeout(() => {
      try {
        const entries = Object.entries(finalAnswers || {});
        
        if (!entries || entries.length === 0) {
          Alert.alert('⚠️ No Result', 'Could not determine a position.', [
            { text: 'Retake Quiz', onPress: resetQuiz }
          ]);
          setIsCalculating(false);
          return;
        }

        const sorted = entries.sort((a, b) => b[1] - a[1]).slice(0, 3);
        const getPositionName = (key) => positions[key] || key.replace(/([A-Z])/g, ' $1').trim();
        
        const results = sorted.map(([key, score], index) => {
          const name = getPositionName(key);
          const emoji = ['🥇', '🥈', '🥉'][index];
          return `${emoji} ${name} (${score} pts)`;
        });

        while (results.length < 3) results.push('—');

        Alert.alert(
          '🎯 Your Ideal Positions!',
          results.join('\n') + '\n\nThese positions match your playing style best!',
          [
            {
              text: 'Create Player Card',
              onPress: () => {
                // Show interstitial before navigating (30% chance)
                if (Math.random() > 0.7 && isAdReady) {
                  showInterstitial();
                }
                
                setTimeout(() => {
                  try {
                    router.push('/ProfileForm');
                  } catch (err) {
                    console.error('❌ Navigation failed:', err);
                    Alert.alert('Error', 'Profile form not found.');
                  }
                }, 600);
              },
              style: 'default'
            },
            {
              text: 'Retake Quiz',
              onPress: resetQuiz,
              style: 'cancel'
            }
          ],
          { cancelable: false, onDismiss: () => setIsCalculating(false) }
        );
      } catch (error) {
        console.error('💥 showResults error:', error);
        Alert.alert('Error', 'Something went wrong. Please try again.', [
          { text: 'Retake Quiz', onPress: resetQuiz }
        ]);
        setIsCalculating(false);
      }
    }, 100);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={isCalculating}>
          <Text style={[styles.backButton, isCalculating && styles.disabled]}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🎯 Find My Position</Text>
        <Text style={styles.subtitle}>Discover your ideal playing position</Text>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Question {currentQuestion + 1} of {questions.length}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.question}>{questions[currentQuestion]?.question}</Text>
        
        {questions[currentQuestion]?.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.optionButton, isCalculating && styles.optionDisabled]}
            onPress={() => handleAnswer(option)}
            disabled={isCalculating}
            activeOpacity={0.7}
          >
            <Text style={styles.optionText}>{option.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default PositionQuiz;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  header: { padding: 20, alignItems: 'center' },
  backButton: { color: '#1e88e5', fontSize: 16, fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: 10 },
  disabled: { opacity: 0.5 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffd700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#a8dadc', textAlign: 'center' },
  progressContainer: { padding: 20 },
  progressText: { color: '#f1faee', fontSize: 14, marginBottom: 8, textAlign: 'center' },
  progressBar: { height: 8, backgroundColor: '#1b263b', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#ffd700', borderRadius: 4 },
  questionContainer: { padding: 20 },
  question: { fontSize: 22, fontWeight: 'bold', color: '#f1faee', marginBottom: 30, textAlign: 'center' },
  optionButton: { 
    backgroundColor: '#1b263b', 
    padding: 20, 
    borderRadius: 12, 
    marginBottom: 15, 
    borderWidth: 2, 
    borderColor: '#415a77' 
  },
  optionDisabled: { opacity: 0.6 },
  optionText: { fontSize: 16, color: '#f1faee', textAlign: 'center', fontWeight: '600' },
});