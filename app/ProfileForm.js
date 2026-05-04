// app/ProfileForm.js
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, Image, Modal, FlatList, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import PlayerCard from './components/PlayerCard';
import { 
  calculateOverall, 
  getImprovementTips, 
  recommendPosition, 
  getMaxStatByAge,
  savePlayer,
  getTotalPlayersCount,
  canSaveMorePlayers
} from './utils/playerDatabase';

// Simple StarRating component
const StarRating = ({ value, onChange, max = 5 }) => {
  return (
    <View style={styles.starContainer}>
      {[...Array(max)].map((_, i) => (
        <TouchableOpacity 
          key={i} 
          style={styles.starButton}
          onPress={() => onChange(i + 1)}
        >
          <Text style={[styles.star, i < value ? styles.starActive : styles.starInactive]}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const ProfileForm = () => {
  const router = useRouter();
  
  // State declarations
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [age, setAge] = useState('15');
  const [height, setHeight] = useState('');
  const [nationality, setNationality] = useState('');
  const [club, setClub] = useState('');
  const [jersey, setJersey] = useState('');
  const [preferredFoot, setPreferredFoot] = useState('Right');
  const [skillMoves, setSkillMoves] = useState(3);
  const [weakFoot, setWeakFoot] = useState(3);
  const [image, setImage] = useState(null);
  const [disability, setDisability] = useState(false);
  const [mentalStress, setMentalStress] = useState(false);
  const [template, setTemplate] = useState('Custom');
  const [formProgress, setFormProgress] = useState(0);
  const [cardData, setCardData] = useState(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  
  const [attrs, setAttrs] = useState({
    acceleration: 0, sprintSpeed: 0, finishing: 0, shotPower: 0, longShots: 0,
    volleys: 0, penalties: 0, vision: 0, crossing: 0, shortPassing: 0,
    longPassing: 0, curve: 0, agility: 0, balance: 0, reactions: 0,
    ballControl: 0, dribbling: 0, composure: 0, interceptions: 0,
    headingAccuracy: 0, marking: 0, standingTackle: 0, slidingTackle: 0,
    jumping: 0, stamina: 0, strength: 0, aggression: 0, diving: 0,
    handling: 0, kicking: 0, positioning: 0, reflexes: 0,
  });

  const calculateAgeFromDOB = (dob) => {
    if (!dob) return '15';
    const birthDate = new Date(dob);
    const today = new Date();
    let ageYears = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) ageYears--;
    return Math.max(4, Math.min(56, ageYears)).toString();
  };

  const getMaxStarsByAge = (ageStr) => {
    const numAge = parseInt(ageStr) || 15;
    if (numAge < 12) return 3;
    if (numAge < 16) return 4;
    return 5;
  };

  useEffect(() => {
    const numAge = parseInt(age) || 15;
    const opts = { disability, mentalStress };
    const overall = calculateOverall(attrs, numAge, opts);
    const positions = recommendPosition(attrs, numAge, preferredFoot);
    const tips = getImprovementTips(positions, attrs, opts);
    
    setCardData(prev => prev ? {
      ...prev,
      age: numAge,
      height,
      preferredFoot,
      nationality,
      club,
      jersey,
      skillMoves,
      weakFoot,
      image,
      attrs,
      overall,
      positions,
      tips,
    } : null);
  }, [name, age, height, preferredFoot, nationality, club, jersey, skillMoves, weakFoot, image, attrs, disability, mentalStress]);

  useEffect(() => {
    const fields = [name, age, height, nationality, club];
    const attributeCount = Object.values(attrs).filter(val => val > 0).length;
    const basicProgress = fields.filter(field => field && field.toString().trim()).length / fields.length;
    const attrProgress = attributeCount / Object.keys(attrs).length;
    setFormProgress(Math.round((basicProgress * 0.3 + attrProgress * 0.7) * 100));
  }, [name, age, height, nationality, club, attrs]);

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
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const templates = {
    'Striker': { finishing: 85, shotPower: 82, acceleration: 78, sprintSpeed: 79 },
    'Winger': { acceleration: 85, sprintSpeed: 82, dribbling: 80, crossing: 75 },
    'Midfielder': { shortPassing: 80, vision: 78, stamina: 80, ballControl: 75 },
    'Defender': { interceptions: 80, standingTackle: 82, marking: 80, headingAccuracy: 75 },
    'Goalkeeper': { reflexes: 85, handling: 82, positioning: 78, diving: 80 },
  };

  const applyTemplate = (templateName) => {
    const numAge = parseInt(age) || 15;
    const maxStat = getMaxStatByAge(numAge);
    
    const base = { ...attrs };
    Object.keys(base).forEach(key => base[key] = 0);
    
    const updates = templates[templateName] || {};
    const clampedUpdates = {};
    Object.keys(updates).forEach(key => {
      clampedUpdates[key] = Math.min(maxStat, updates[key]);
    });
    
    setAttrs({ ...base, ...clampedUpdates });
    setTemplate(templateName);
  };

  const handleSubmit = async () => {
    const numAge = parseInt(age) || 15;
    if (numAge < 4 || numAge > 56) {
      Alert.alert('Invalid Age', 'Please enter an age between 4 and 56.');
      return;
    }

    const opts = { disability, mentalStress };
    const overall = calculateOverall(attrs, numAge, opts);
    const positions = recommendPosition(attrs, numAge, preferredFoot);
    const tips = getImprovementTips(positions, attrs, opts);

    const data = {
      id: Date.now().toString(),
      name: name || "Anonymous",
      age: numAge,
      height,
      preferredFoot,
      nationality,
      club,
      jersey,
      skillMoves,
      weakFoot,
      image,
      attrs,
      overall,
      positions,
      tips,
      createdAt: new Date().toISOString(),
    };

    setCardData(data);

    try {
      const totalPlayers = await getTotalPlayersCount();
      const canSave = await canSaveMorePlayers(totalPlayers);

      if (!canSave) {
        Alert.alert(
          'Player Limit Reached',
          'You can save up to 5 players on the FREE plan. Upgrade to VIP for unlimited saves!',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade to VIP', onPress: () => router.push('/VIPSubscription') },
          ]
        );
        return;
      }

      const saveResult = await savePlayer(data);
      
      if (saveResult?.success) {
        Alert.alert('Success!', 'Player saved to Hall of Fame!', [
          {
            text: 'View Card',
            onPress: () => router.push({ pathname: '/PlayerCardScreen', params: { playerId: data.id } })
          },
        ]);
      } else {
        Alert.alert('Error', saveResult?.error || 'Failed to save player');
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const DraggableSlider = ({ attr, value, onValueChange }) => {
    const maxStat = getMaxStatByAge(parseInt(age) || 15);

    return (
      <View style={styles.sliderContainer}>
        <Text style={styles.attributeLineLabel}>
          {attr.charAt(0).toUpperCase() + attr.slice(1).replace(/([A-Z])/g, ' $1')}
        </Text>
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${(value / maxStat) * 100}%` }]} />
        </View>
        <View style={styles.sliderControls}>
          <TouchableOpacity onPress={() => onValueChange(Math.max(0, value - 1))}>
            <Text style={styles.sliderButton}>-</Text>
          </TouchableOpacity>
          <Text style={styles.valueText}>{value}</Text>
          <TouchableOpacity onPress={() => onValueChange(Math.min(maxStat, value + 1))}>
            <Text style={styles.sliderButton}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Player Profile</Text>
      
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Profile Completion: {formProgress}%</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${formProgress}%` }]} />
        </View>
      </View>

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

      <TextInput style={styles.input} placeholder="Name (optional)" value={name} onChangeText={setName} />
      <TextInput
        style={styles.input}
        placeholder="Date of Birth (YYYY-MM-DD)"
        value={dateOfBirth}
        onChangeText={(text) => { setDateOfBirth(text); if (text) setAge(calculateAgeFromDOB(text)); }}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Age (4-56)"
        value={age}
        onChangeText={(text) => { const n = parseInt(text)||4; if (n>=4 && n<=56) setAge(text); }}
        keyboardType="numeric"
      />
      <TextInput style={styles.input} placeholder="Height (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" />
      
      <TouchableOpacity style={styles.input} onPress={() => setShowCountryPicker(true)}>
        <Text style={nationality ? styles.selectedCountry : styles.placeholderText}>
          {nationality || 'Select Nationality'}
        </Text>
      </TouchableOpacity>

      <TextInput style={styles.input} placeholder="Club / Team" value={club} onChangeText={setClub} />
      <TextInput style={styles.input} placeholder="Jersey Number" value={jersey} onChangeText={setJersey} keyboardType="numeric" />

      <Text style={styles.label}>Preferred Foot</Text>
      <View style={styles.footOptions}>
        {['Right', 'Left', 'Both'].map((foot) => (
          <TouchableOpacity
            key={foot}
            style={[styles.footButton, preferredFoot === foot && styles.footButtonActive]}
            onPress={() => setPreferredFoot(foot)}
          >
            <Text style={[styles.footText, preferredFoot === foot && styles.footTextActive]}>{foot}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.skillRow}>
        <View style={styles.skillItem}>
          <Text style={styles.label}>Skill Moves</Text>
          <StarRating value={skillMoves} onChange={setSkillMoves} max={getMaxStarsByAge(age)} />
          <Text style={styles.suggestionText}>Max {getMaxStarsByAge(age)} for age {age}</Text>
        </View>
        <View style={styles.skillItem}>
          <Text style={styles.label}>Weak Foot</Text>
          <StarRating value={weakFoot} onChange={setWeakFoot} max={getMaxStarsByAge(age)} />
          <Text style={styles.suggestionText}>Max {getMaxStarsByAge(age)} for age {age}</Text>
        </View>
      </View>

      <View style={styles.conditionsSection}>
        <TouchableOpacity style={[styles.conditionButton, disability && styles.conditionActive]} onPress={() => setDisability(!disability)}>
          <Text style={[styles.conditionText, disability && styles.conditionTextActive]}>♿ Disability Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.conditionButton, mentalStress && styles.conditionActive]} onPress={() => setMentalStress(!mentalStress)}>
          <Text style={[styles.conditionText, mentalStress && styles.conditionTextActive]}>🧠 Mental Health Support</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>⚽ Player Attributes</Text>
      
      <Text style={styles.categoryTitle}>🏃 Pace</Text>
      <DraggableSlider attr="acceleration" value={attrs.acceleration} onValueChange={(value) => setAttrs({ ...attrs, acceleration: value })} />
      <DraggableSlider attr="sprintSpeed" value={attrs.sprintSpeed} onValueChange={(value) => setAttrs({ ...attrs, sprintSpeed: value })} />

      <Text style={styles.categoryTitle}>⚽ Shooting</Text>
      <DraggableSlider attr="finishing" value={attrs.finishing} onValueChange={(value) => setAttrs({ ...attrs, finishing: value })} />
      <DraggableSlider attr="shotPower" value={attrs.shotPower} onValueChange={(value) => setAttrs({ ...attrs, shotPower: value })} />
      <DraggableSlider attr="longShots" value={attrs.longShots} onValueChange={(value) => setAttrs({ ...attrs, longShots: value })} />
      <DraggableSlider attr="volleys" value={attrs.volleys} onValueChange={(value) => setAttrs({ ...attrs, volleys: value })} />
      <DraggableSlider attr="penalties" value={attrs.penalties} onValueChange={(value) => setAttrs({ ...attrs, penalties: value })} />

      <Text style={styles.categoryTitle}>🎯 Passing</Text>
      <DraggableSlider attr="vision" value={attrs.vision} onValueChange={(value) => setAttrs({ ...attrs, vision: value })} />
      <DraggableSlider attr="crossing" value={attrs.crossing} onValueChange={(value) => setAttrs({ ...attrs, crossing: value })} />
      <DraggableSlider attr="shortPassing" value={attrs.shortPassing} onValueChange={(value) => setAttrs({ ...attrs, shortPassing: value })} />
      <DraggableSlider attr="longPassing" value={attrs.longPassing} onValueChange={(value) => setAttrs({ ...attrs, longPassing: value })} />
      <DraggableSlider attr="curve" value={attrs.curve} onValueChange={(value) => setAttrs({ ...attrs, curve: value })} />

      <Text style={styles.categoryTitle}>🎨 Dribbling</Text>
      <DraggableSlider attr="agility" value={attrs.agility} onValueChange={(value) => setAttrs({ ...attrs, agility: value })} />
      <DraggableSlider attr="balance" value={attrs.balance} onValueChange={(value) => setAttrs({ ...attrs, balance: value })} />
      <DraggableSlider attr="reactions" value={attrs.reactions} onValueChange={(value) => setAttrs({ ...attrs, reactions: value })} />
      <DraggableSlider attr="ballControl" value={attrs.ballControl} onValueChange={(value) => setAttrs({ ...attrs, ballControl: value })} />
      <DraggableSlider attr="dribbling" value={attrs.dribbling} onValueChange={(value) => setAttrs({ ...attrs, dribbling: value })} />
      <DraggableSlider attr="composure" value={attrs.composure} onValueChange={(value) => setAttrs({ ...attrs, composure: value })} />

      <Text style={styles.categoryTitle}>🛡️ Defending</Text>
      <DraggableSlider attr="interceptions" value={attrs.interceptions} onValueChange={(value) => setAttrs({ ...attrs, interceptions: value })} />
      <DraggableSlider attr="headingAccuracy" value={attrs.headingAccuracy} onValueChange={(value) => setAttrs({ ...attrs, headingAccuracy: value })} />
      <DraggableSlider attr="marking" value={attrs.marking} onValueChange={(value) => setAttrs({ ...attrs, marking: value })} />
      <DraggableSlider attr="standingTackle" value={attrs.standingTackle} onValueChange={(value) => setAttrs({ ...attrs, standingTackle: value })} />
      <DraggableSlider attr="slidingTackle" value={attrs.slidingTackle} onValueChange={(value) => setAttrs({ ...attrs, slidingTackle: value })} />

      <Text style={styles.categoryTitle}>💪 Physical</Text>
      <DraggableSlider attr="jumping" value={attrs.jumping} onValueChange={(value) => setAttrs({ ...attrs, jumping: value })} />
      <DraggableSlider attr="stamina" value={attrs.stamina} onValueChange={(value) => setAttrs({ ...attrs, stamina: value })} />
      <DraggableSlider attr="strength" value={attrs.strength} onValueChange={(value) => setAttrs({ ...attrs, strength: value })} />
      <DraggableSlider attr="aggression" value={attrs.aggression} onValueChange={(value) => setAttrs({ ...attrs, aggression: value })} />

      <Text style={styles.categoryTitle}>🥅 Goalkeeping</Text>
      <DraggableSlider attr="diving" value={attrs.diving} onValueChange={(value) => setAttrs({ ...attrs, diving: value })} />
      <DraggableSlider attr="handling" value={attrs.handling} onValueChange={(value) => setAttrs({ ...attrs, handling: value })} />
      <DraggableSlider attr="kicking" value={attrs.kicking} onValueChange={(value) => setAttrs({ ...attrs, kicking: value })} />
      <DraggableSlider attr="positioning" value={attrs.positioning} onValueChange={(value) => setAttrs({ ...attrs, positioning: value })} />
      <DraggableSlider attr="reflexes" value={attrs.reflexes} onValueChange={(value) => setAttrs({ ...attrs, reflexes: value })} />

      {cardData && (
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>🎴 Live Preview</Text>
          <PlayerCard data={cardData} />
        </View>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>🚀 Generate Player Card</Text>
      </TouchableOpacity>

      <Modal visible={showCountryPicker} animationType="slide" transparent onRequestClose={() => setShowCountryPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}><Text style={styles.closeButton}>✕</Text></TouchableOpacity>
            </View>
            <TextInput style={styles.searchInput} placeholder="Search country..." value={countrySearch} onChangeText={setCountrySearch} autoFocus />
            <FlatList
              data={COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()))}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.countryItem} onPress={() => { setNationality(item); setShowCountryPicker(false); setCountrySearch(''); }}>
                  <Text style={styles.countryText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default ProfileForm;

const COUNTRIES = ['Afghanistan','Albania','Algeria','Argentina','Australia','Austria','Belgium','Brazil','Canada','China','Denmark','Egypt','England','France','Germany','India','Italy','Japan','Mexico','Netherlands','Nigeria','Norway','Poland','Portugal','Russia','Saudi Arabia','Scotland','South Africa','South Korea','Spain','Sweden','Switzerland','Turkey','Ukraine','United States','Wales'];

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f5f5f5', flexGrow: 1 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#2c3e50' },
  progressContainer: { marginBottom: 20 },
  progressText: { textAlign: 'center', marginBottom: 8, color: '#34495e', fontWeight: '600' },
  progressBar: { height: 8, backgroundColor: '#ecf0f1', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#27ae60', borderRadius: 4 },
  imageSection: { alignItems: 'center', marginBottom: 20 },
  imageButton: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#3498db', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  playerImage: { width: 100, height: 100, borderRadius: 50 },
  imageButtonText: { color: 'white', fontWeight: 'bold' },
  templateGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  templateButton: { backgroundColor: '#ecf0f1', padding: 10, margin: 5, borderRadius: 8, minWidth: 80, alignItems: 'center' },
  templateButtonActive: { backgroundColor: '#3498db' },
  templateText: { color: '#2c3e50', fontWeight: 'bold' },
  templateTextActive: { color: 'white' },
  input: { backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#2c3e50' },
  footOptions: { flexDirection: 'row', marginBottom: 20 },
  footButton: { backgroundColor: '#ecf0f1', padding: 10, margin: 5, borderRadius: 8, flex: 1, alignItems: 'center' },
  footButtonActive: { backgroundColor: '#27ae60' },
  footText: { color: '#2c3e50', fontWeight: 'bold' },
  footTextActive: { color: 'white' },
  skillRow: { flexDirection: 'row', marginBottom: 20 },
  skillItem: { flex: 1, marginHorizontal: 5 },
  conditionsSection: { marginBottom: 20 },
  conditionButton: { backgroundColor: '#ecf0f1', padding: 15, marginBottom: 10, borderRadius: 8, alignItems: 'center' },
  conditionActive: { backgroundColor: '#e74c3c' },
  conditionText: { color: '#2c3e50', fontWeight: 'bold' },
  conditionTextActive: { color: 'white' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 15, color: '#2c3e50' },
  categoryTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 10, color: '#34495e' },
  suggestionText: { fontSize: 10, color: '#3498db', marginBottom: 5, fontStyle: 'italic' },
  starContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  starButton: { padding: 2 },
  star: { fontSize: 20, marginHorizontal: 2 },
  starActive: { color: '#FFD700' },
  starInactive: { color: '#ddd' },
  sliderContainer: { marginBottom: 15, paddingHorizontal: 5 },
  sliderTrack: { height: 8, backgroundColor: '#ecf0f1', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  sliderFill: { height: '100%', backgroundColor: '#3498db', borderRadius: 4 },
  sliderControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  sliderButton: { fontSize: 20, color: '#3498db', paddingHorizontal: 15, fontWeight: 'bold' },
  valueText: { fontSize: 16, color: '#2c3e50', fontWeight: 'bold', marginHorizontal: 15, minWidth: 30, textAlign: 'center' },
  attributeLineLabel: { fontSize: 14, color: '#2c3e50', fontWeight: '500', marginBottom: 5 },
  previewSection: { marginTop: 20, alignItems: 'center' },
  submitButton: { backgroundColor: '#27ae60', padding: 20, borderRadius: 10, alignItems: 'center', marginTop: 30, marginBottom: 20 },
  submitText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', paddingBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50' },
  closeButton: { fontSize: 28, color: '#7f8c8d', fontWeight: 'bold' },
  searchInput: { backgroundColor: '#f5f5f5', padding: 15, margin: 15, borderRadius: 10, fontSize: 16 },
  countryItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  countryText: { fontSize: 16, color: '#2c3e50' },
  selectedCountry: { color: '#2c3e50', fontSize: 16 },
  placeholderText: { color: '#999', fontSize: 16 },
});