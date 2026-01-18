// app/ProfileForm.js
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, Image } from 'react-native';
import Slider from '@react-native-community/slider';
import * as ImagePicker from 'expo-image-picker';
import PlayerCard from './components/PlayerCard';
import { calculateOverall, getImprovementTips, recommendPosition, getMaxStatByAge } from './utils/ratingEngine';
import { savePlayer, getTotalPlayersCount } from './utils/playerDatabase';
import { canSaveMorePlayers } from './utils/vipSystem';
import { useRouter } from 'expo-router';

export default function ProfileForm() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('15');
  const [height, setHeight] = useState('');
  const [preferredFoot, setPreferredFoot] = useState('Right');
  const [nationality, setNationality] = useState('Nigeria');
  const [club, setClub] = useState('');
  const [jersey, setJersey] = useState('');
  const [skillMoves, setSkillMoves] = useState(2);
  const [weakFoot, setWeakFoot] = useState(4);
  const [disability, setDisability] = useState(false);
  const [mentalStress, setMentalStress] = useState(false);
  const [template, setTemplate] = useState('Custom');
  const [image, setImage] = useState(null);
  // 👶 Date of Birth state
const [dateOfBirth, setDateOfBirth] = useState('');

// 👉 Auto-calculate age from DOB
  const calculateAgeFromDOB = (dob) => {
    if (!dob) return '15';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 4 && age <= 56 ? age.toString() : '15';
  
  }; // 👈 Face photo state

  const [attrs, setAttrs] = useState({
    acceleration: 0, sprintSpeed: 0, finishing: 0, shotPower: 0,
    longShots: 0, volleys: 0, penalties: 0, vision: 0,
    crossing: 0, shortPassing: 0, longPassing: 0, curve: 0,
    agility: 0, balance: 0, reactions: 0, ballControl: 0,
    dribbling: 0, composure: 0, interceptions: 0, headingAccuracy: 0,
    marking: 0, standingTackle: 0, slidingTackle: 0, jumping: 0,
    stamina: 0, strength: 0, aggression: 0,
    diving: 0, handling: 0, kicking: 0, positioning: 0, reflexes: 0,
  });

  const [cardData, setCardData] = useState(null);

  // 👉 Request permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow access to photos to add your face!');
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square crop (like FUT cards)
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleChange = (key, value) => {
    const numAge = parseInt(age) || 15;
    const maxStat = getMaxStatByAge(numAge);
    const num = Math.min(maxStat, Math.max(1, Number(value) || 1));
    setAttrs({ ...attrs, [key]: num });
  };

  const templates = {
    'Striker': { finishing: 85, shotPower: 82, acceleration: 78, sprintSpeed: 79, agility: 75, balance: 75 },
    'Winger': { acceleration: 85, sprintSpeed: 82, dribbling: 80, crossing: 75, shortPassing: 70 },
    'Midfielder': { shortPassing: 80, vision: 78, stamina: 80, ballControl: 75, marking: 65, interceptions: 65 },
    'Defender': { interceptions: 80, standingTackle: 82, marking: 80, headingAccuracy: 75, stamina: 75, strength: 75 },
    'Goalkeeper': { reflexes: 85, handling: 82, positioning: 78, diving: 80, kicking: 70 },
  };

  const applyTemplate = (templateName) => {
    const base = { ...attrs };
    Object.keys(base).forEach(key => base[key] = 0);
    const updates = templates[templateName] || {};
    setAttrs({ ...base, ...updates });
    setTemplate(templateName);
  };

  const handleSubmit = async () => {
    const numAge = parseInt(age) || 15;
    if (numAge < 4 || numAge > 56) {
      alert('Please enter an age between 4 and 56.');
      return;
    }

    const opts = { disability, mentalStress };
    const overall = calculateOverall(attrs, numAge, opts);
    const positions = recommendPosition(attrs, numAge, preferredFoot);
    const tips = getImprovementTips(positions, attrs, opts);

    const data = {
      name: name || "Anonymous",
      age: numAge,
      height,
      preferredFoot,
      nationality,
      club,
      jersey,
      skillMoves,
      weakFoot,
      image, // 👈 Pass image to card
      attrs,
      overall,
      positions,
      tips,
    };

    setCardData(data);

    // Check player limit
    const totalPlayers = await getTotalPlayersCount();
    const canSave = await canSaveMorePlayers(totalPlayers);

    if (!canSave) {
      Alert.alert(
        'Player Limit Reached',
        'You can save up to 5 players on the FREE plan. Upgrade to VIP for unlimited saves!',
        [
          { text: 'Cancel', onPress: () => {} },
          {
            text: 'Upgrade to VIP',
            onPress: () => router.push('/VIPSubscription'),
            style: 'default',
          },
        ]
      );
      return;
    }

    // Save player to database
    const saveResult = await savePlayer(data);
    
    if (saveResult.success) {
      Alert.alert('Success!', 'Player saved to Hall of Fame!', [
        {
          text: 'View Card',
          onPress: () => {
            router.push({
              pathname: '/PlayerCardScreen',
              params: { data: JSON.stringify(data) }
            });
          }
        },
        {
          text: 'Create Training Plan',
          onPress: () => {
            router.push({
              pathname: '/TrainingPlanScreen',
              params: { data: JSON.stringify(data) }
            });
          }
        }
      ]);
    } else {
      Alert.alert('Error', 'Failed to save player');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Player Profile</Text>

      {/* 👤 Face Upload */}
      <View style={styles.imageSection}>
        <Text style={styles.label}>👤 Add Your Face (Optional)</Text>
        <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
          {image ? (
            <Image source={{ uri: image }} style={styles.playerImage} />
          ) : (
            <Text style={styles.imageButtonText}>+ Choose Photo</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Quick Templates */}
      <Text style={styles.label}>⚡ Quick Templates</Text>
      <View style={styles.templateGrid}>
        {['Custom', 'Striker', 'Winger', 'Midfielder', 'Defender', 'Goalkeeper'].map((temp) => (
          <TouchableOpacity
            key={temp}
            onPress={() => applyTemplate(temp)}
            style={[styles.templateButton, template === temp && styles.templateButtonActive]}
          >
            <Text style={[styles.templateText, template === temp && styles.templateTextActive]}>{temp}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Basic Info */}
      <TextInput style={styles.input} placeholder="Name (optional)" value={name} onChangeText={setName} />
      {/* 👶 Date of Birth */}
<TextInput
  style={styles.input}
  placeholder="Date of Birth (YYYY-MM-DD)"
  value={dateOfBirth}
  onChangeText={(text) => {
    setDateOfBirth(text);
    setAge(calculateAgeFromDOB(text)); // Auto-update age
  }}
  keyboardType="numeric"
/>

{/* 📏 Age (auto-calculated, read-only) */}
<TextInput
  style={[styles.input, styles.readOnly]}
  placeholder="Age (auto-calculated)"
  value={age}
  editable={false} // Prevent manual editing
/>
      <TextInput style={styles.input} placeholder="Height (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Nationality" value={nationality} onChangeText={setNationality} />
      <TextInput style={styles.input} placeholder="Club / Team" value={club} onChangeText={setClub} />
      <TextInput style={styles.input} placeholder="Jersey Number" value={jersey} onChangeText={setJersey} keyboardType="numeric" />

      {/* Preferred Foot */}
      <Text style={styles.label}>Preferred Foot</Text>
      <View style={styles.footOptions}>
        {['Right', 'Left', 'Both'].map((foot) => (
          <TouchableOpacity
            key={foot}
            style={[styles.footButton, preferredFoot === foot && styles.footButtonActive]}
            onPress={() => setPreferredFoot(foot)}
          >
            <Text style={styles.footButtonText}>{foot}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Skill Moves & Weak Foot */}
      <Text style={styles.label}>Skill Moves (1–5)</Text>
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((num) => (
          <TouchableOpacity key={num} onPress={() => setSkillMoves(num)}>
            <Text style={{ color: num <= skillMoves ? '#FFD700' : '#555', fontSize: 24 }}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Weak Foot (1–5)</Text>
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((num) => (
          <TouchableOpacity key={num} onPress={() => setWeakFoot(num)}>
            <Text style={{ color: num <= weakFoot ? '#FFD700' : '#555', fontSize: 24 }}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Toggles */}
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Disability / Special Needs</Text>
        <TouchableOpacity onPress={() => setDisability(!disability)} style={styles.toggleSwitch(disability)} />
      </View>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Mental Stress / Needs Support</Text>
        <TouchableOpacity onPress={() => setMentalStress(!mentalStress)} style={styles.toggleSwitch(mentalStress)} />
      </View>

      {/* Attributes with Sliders */}
      <Text style={[styles.label, { marginTop: 16 }]}>⚽ ATTRIBUTES (1–99) - DRAG SLIDERS</Text>
      <Text style={{ color: '#a8dadc', fontSize: 12, marginBottom: 8 }}>Drag to adjust, or use template above.</Text>
      
      {Object.keys(attrs).map((attr) => (
        <View key={attr} style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>{attr.replace(/([A-Z])/g, ' $1').trim()}</Text>
          <View style={styles.sliderRow}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={99}
              step={1}
              value={attrs[attr] || 0}
              onValueChange={(v) => handleChange(attr, v)}
              minimumTrackTintColor="#1e88e5"
              maximumTrackTintColor="#1b263b"
            />
            <Text style={styles.sliderValue}>{attrs[attr] || 0}</Text>
          </View>
        </View>
      ))}

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>🔍 Find My Position</Text>
      </TouchableOpacity>

      {/* Show Card */}
      {cardData && <PlayerCard data={cardData} onBack={() => setCardData(null)} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#0d1b2a' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f1faee', textAlign: 'center', marginVertical: 10 },
  
  // 👤 Face Upload Styles
  imageSection: { alignItems: 'center', marginVertical: 16 },
  imageButton: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: '#1b263b', 
    justifyContent: 'center', 
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#1e88e5'
  },
  playerImage: { width: '100%', height: '100%' },
  imageButtonText: { color: '#a8dadc', fontSize: 14 },

  input: { backgroundColor: '#1b263b', color: '#f1faee', padding: 12, marginVertical: 6, borderRadius: 6 },
  label: { color: '#a8dadc', marginVertical: 8, fontSize: 16, fontWeight: '600' },
  
  templateGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginVertical: 10 },
  templateButton: { 
    backgroundColor: '#1b263b', 
    paddingVertical: 10, 
    paddingHorizontal: 14, 
    borderRadius: 8,
    marginVertical: 4,
    width: '32%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1b263b'
  },
  templateButtonActive: { 
    backgroundColor: '#1e88e5', 
    borderColor: '#FFD700'
  },
  templateText: { color: '#a8dadc', fontSize: 13, fontWeight: '600' },
  templateTextActive: { color: '#fff', fontWeight: 'bold' },

  sliderContainer: { marginVertical: 10, backgroundColor: '#1b263b', padding: 10, borderRadius: 8 },
  sliderLabel: { color: '#a8dadc', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  slider: { flex: 1, height: 40, marginRight: 10 },
  sliderValue: { color: '#1e88e5', fontWeight: 'bold', fontSize: 16, minWidth: 30 },

  footOptions: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  footButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#1b263b', borderRadius: 6 },
  footButtonActive: { backgroundColor: '#1e88e5' },
  footButtonText: { color: '#f1faee', fontWeight: '600' },
  starRow: { flexDirection: 'row', marginVertical: 8, justifyContent: 'center' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  toggleLabel: { color: '#a8dadc', flex: 1 },
  toggleSwitch: (active) => ({
    width: 44, height: 24, borderRadius: 12, backgroundColor: active ? '#1e88e5' : '#1b263b', justifyContent: 'center', padding: 2,
  }),
  submitButton: { backgroundColor: '#1e88e5', paddingVertical: 14, borderRadius: 8, marginTop: 20, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});