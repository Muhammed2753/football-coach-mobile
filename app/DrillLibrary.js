// app/DrillLibrary.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function DrillLibrary() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const drills = [
    {
      id: 1,
      name: "Cone Dribbling",
      category: "Dribbling",
      difficulty: "Beginner",
      duration: "10 min",
      description: "Set up 5-10 cones in a line. Dribble through them using both feet, focusing on close ball control.",
      benefits: ["Ball control", "Agility", "Coordination"],
      equipment: ["5-10 cones", "1 football"]
    },
    {
      id: 2,
      name: "Wall Passing",
      category: "Passing",
      difficulty: "Beginner",
      duration: "15 min",
      description: "Pass the ball against a wall and control the rebound. Alternate between left and right foot.",
      benefits: ["First touch", "Passing accuracy", "Weak foot"],
      equipment: ["Wall", "1 football"]
    },
    {
      id: 3,
      name: "Shooting Practice",
      category: "Shooting",
      difficulty: "Intermediate",
      duration: "20 min",
      description: "Place ball at edge of box. Take 10 shots with right foot, 10 with left. Aim for corners.",
      benefits: ["Shot power", "Accuracy", "Technique"],
      equipment: ["Goal", "5-10 footballs"]
    },
    {
      id: 4,
      name: "Ladder Drills",
      category: "Speed",
      difficulty: "Intermediate",
      duration: "10 min",
      description: "Run through agility ladder with various footwork patterns. 5 sets of each pattern.",
      benefits: ["Footwork", "Agility", "Coordination"],
      equipment: ["Agility ladder"]
    },
    {
      id: 5,
      name: "1v1 Defending",
      category: "Defending",
      difficulty: "Intermediate",
      duration: "15 min",
      description: "Practice defensive positioning and tackling with a partner. Take turns attacking and defending.",
      benefits: ["Tackling", "Positioning", "Reactions"],
      equipment: ["Partner", "1 football", "Cones"]
    },
    {
      id: 6,
      name: "Juggling Challenge",
      category: "Ball Control",
      difficulty: "Beginner",
      duration: "10 min",
      description: "Keep the ball in the air using feet, thighs, chest, and head. Try to beat your record.",
      benefits: ["Touch", "Balance", "Concentration"],
      equipment: ["1 football"]
    },
    {
      id: 7,
      name: "Sprint Intervals",
      category: "Speed",
      difficulty: "Advanced",
      duration: "20 min",
      description: "Sprint 40m at max speed, walk back. Repeat 10 times. Rest 2 minutes between sets.",
      benefits: ["Speed", "Stamina", "Explosiveness"],
      equipment: ["Cones for markers"]
    },
    {
      id: 8,
      name: "Crossing Practice",
      category: "Passing",
      difficulty: "Intermediate",
      duration: "15 min",
      description: "From wing position, deliver 20 crosses into the box. Vary height and pace.",
      benefits: ["Crossing", "Accuracy", "Vision"],
      equipment: ["Goal", "5-10 footballs", "Cones"]
    },
    {
      id: 9,
      name: "Goalkeeper Reflexes",
      category: "Goalkeeping",
      difficulty: "Intermediate",
      duration: "15 min",
      description: "Partner shoots from close range. React and save. 20 shots, alternating sides.",
      benefits: ["Reflexes", "Diving", "Positioning"],
      equipment: ["Goal", "Partner", "5-10 footballs"]
    },
    {
      id: 10,
      name: "Rondo (Keep Away)",
      category: "Passing",
      difficulty: "Advanced",
      duration: "15 min",
      description: "4v2 in small circle. Keep possession with quick passing. Switch defenders every 2 minutes.",
      benefits: ["Passing", "Movement", "Decision making"],
      equipment: ["6 players", "1 football", "Cones"]
    }
  ];

  const categories = ['All', 'Dribbling', 'Passing', 'Shooting', 'Speed', 'Defending', 'Ball Control', 'Goalkeeping'];

  const filteredDrills = selectedCategory === 'All' 
    ? drills 
    : drills.filter(d => d.category === selectedCategory);

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner': return '#28a745';
      case 'Intermediate': return '#ffc107';
      case 'Advanced': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>â† Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>âš½ Drill Library</Text>
        <Text style={styles.subtitle}>10 Essential Training Drills</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryButton, selectedCategory === cat && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.drillsContainer}>
        {filteredDrills.map(drill => (
          <View key={drill.id} style={styles.drillCard}>
            <View style={styles.drillHeader}>
              <Text style={styles.drillName}>{drill.name}</Text>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(drill.difficulty) }]}>
                <Text style={styles.difficultyText}>{drill.difficulty}</Text>
              </View>
            </View>

            <View style={styles.drillMeta}>
              <Text style={styles.metaText}>â±ï¸ {drill.duration}</Text>
              <Text style={styles.metaText}>ðŸ“‚ {drill.category}</Text>
            </View>

            <Text style={styles.drillDescription}>{drill.description}</Text>

            <View style={styles.benefitsSection}>
              <Text style={styles.benefitsTitle}>Benefits:</Text>
              <View style={styles.benefitsList}>
                {drill.benefits.map((benefit, i) => (
                  <View key={i} style={styles.benefitTag}>
                    <Text style={styles.benefitText}>âœ“ {benefit}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.equipmentSection}>
              <Text style={styles.equipmentTitle}>Equipment:</Text>
              <Text style={styles.equipmentText}>{drill.equipment.join(', ')}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  header: { padding: 20, alignItems: 'center' },
  backButton: { color: '#1e88e5', fontSize: 16, fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffd700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#a8dadc', textAlign: 'center' },
  categoryScroll: { paddingHorizontal: 20, marginVertical: 15 },
  categoryButton: { backgroundColor: '#1b263b', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginRight: 10 },
  categoryButtonActive: { backgroundColor: '#ffd700' },
  categoryText: { color: '#f1faee', fontSize: 14, fontWeight: '600' },
  categoryTextActive: { color: '#0d1b2a' },
  drillsContainer: { padding: 20 },
  drillCard: { backgroundColor: '#1b263b', borderRadius: 12, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#415a77' },
  drillHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  drillName: { fontSize: 20, fontWeight: 'bold', color: '#f1faee', flex: 1 },
  difficultyBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  difficultyText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  drillMeta: { flexDirection: 'row', marginBottom: 15 },
  metaText: { color: '#a8dadc', fontSize: 14, marginRight: 20 },
  drillDescription: { color: '#f1faee', fontSize: 15, lineHeight: 22, marginBottom: 15 },
  benefitsSection: { marginBottom: 15 },
  benefitsTitle: { color: '#ffd700', fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  benefitsList: { flexDirection: 'row', flexWrap: 'wrap' },
  benefitTag: { backgroundColor: '#0d1b2a', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginRight: 8, marginBottom: 8 },
  benefitText: { color: '#28a745', fontSize: 12, fontWeight: '600' },
  equipmentSection: {},
  equipmentTitle: { color: '#ffd700', fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  equipmentText: { color: '#a8dadc', fontSize: 13 },
});
