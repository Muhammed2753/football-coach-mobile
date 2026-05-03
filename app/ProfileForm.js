// app/ProfileForm.js
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, Image, Modal, FlatList, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import PlayerCard from '../components/PlayerCard';
import { calculateOverall, getImprovementTips, recommendPosition, getMaxStatByAge } from './utils/database',
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
      });
    }
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

  const getAttributeSuggestion = (attrName) => {
    const numAge = parseInt(age) || 15;
    const maxStat = getMaxStatByAge(numAge);
    
    if (template !== 'Custom' && templates[template] && templates[template][attrName]) {
      return `Suggested: ${Math.min(maxStat, templates[template][attrName])}`;
    }
    return `Max for age ${numAge}: ${maxStat}`;
  };

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

  const handleChange = (key, value) => {
    const numAge = parseInt(age) || 15;
    const maxStat = getMaxStatByAge(numAge);
    const num = Math.min(maxStat, Math.max(0, Number(value) || 0));
    setAttrs({ ...attrs, [key]: num });
  };

  // âœ… FIX 2: Web-compatible DraggableSlider with proper drag handling
  const DraggableSlider = ({ attr, value, onValueChange, maxValue }) => {
    const maxStat = maxValue || getMaxStatByAge(parseInt(age) || 15);
    const [isDragging, setIsDragging] = useState(false);

    const calculateValueFromPosition = (event) => {
      // Handle both web (clientX) and native (locationX)
      const x = event.clientX || event.nativeEvent?.locationX;
      const slider = event.currentTarget;
      const rect = slider.getBoundingClientRect?.() || { left: 0, width: 200 };
      const relativeX = x - rect.left;
      const percentage = Math.max(0, Math.min(1, relativeX / rect.width));
      return Math.round(percentage * maxStat);
    };

    const handleStart = (event) => {
      setIsDragging(true);
      const newValue = calculateValueFromPosition(event);
      onValueChange(newValue);
      event.preventDefault?.();
    };

    const handleMove = (event) => {
      if (!isDragging) return;
      const newValue = calculateValueFromPosition(event);
      onValueChange(newValue);
      event.preventDefault?.();
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    // Add global event listeners for drag (web only)
    useEffect(() => {
      if (Platform.OS === 'web' && isDragging) {
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchmove', handleMove, { passive: false });
        window.addEventListener('touchend', handleEnd);
      }
      return () => {
        if (Platform.OS === 'web') {
          window.removeEventListener('mousemove', handleMove);
          window.removeEventListener('mouseup', handleEnd);
          window.removeEventListener('touchmove', handleMove);
          window.removeEventListener('touchend', handleEnd);
        }
      };
    }, [isDragging]);

    return (
      <View style={styles.sliderContainer}>
        <Text style={styles.attributeLineLabel}>
          {attr.charAt(0).toUpperCase() + attr.slice(1).replace(/([A-Z])/g, ' $1')}
        </Text>
        
        <View 
          style={styles.sliderTrack}
          onMouseDown={Platform.OS === 'web' ? handleStart : undefined}
          onTouchStart={handleStart}
        >
          <View style={[styles.sliderFill, { width: `${(value / maxStat) * 100}%` }]} />
          <View 
            style={[
              styles.sliderThumb, 
              { left: `${Math.max(0, Math.min(100, (value / maxStat) * 100))}%` }
            ]} 
          />
        </View>
        
        <TouchableOpacity 
          style={styles.valueInput}
          onPress={() => {
            // Simple input fallback for mobile/web
            const input = prompt?.(`Set ${attr} value (0-${maxStat}):`, value.toString());
            if (input !== null && input !== undefined) {
              const num = parseInt(input) || 0;
              onValueChange(Math.max(0, Math.min(maxStat, num)));
            } else {
              Alert.alert('Set Value', `Use the slider to set ${attr} between 0 and ${maxStat}.`);
            }
          }}
        >
          <Text style={styles.valueText}>{value}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const templates = {
    'Striker': { finishing: 85, shotPower: 82, acceleration: 78, sprintSpeed: 79, agility: 75, balance: 75, positioning: 80, reactions: 75 },
    'Winger': { acceleration: 85, sprintSpeed: 82, dribbling: 80, crossing: 75, shortPassing: 70, agility: 82, ballControl: 78 },
    'Midfielder': { shortPassing: 80, vision: 78, stamina: 80, ballControl: 75, marking: 65, interceptions: 65, longPassing: 75 },
    'Defender': { interceptions: 80, standingTackle: 82, marking: 80, headingAccuracy: 75, stamina: 75, strength: 75, aggression: 70 },
    'Goalkeeper': { reflexes: 85, handling: 82, positioning: 78, diving: 80, kicking: 70 },
    'Full Back': { acceleration: 78, stamina: 82, crossing: 75, standingTackle: 75, marking: 72, interceptions: 70 },
    'Defensive Mid': { interceptions: 78, stamina: 80, shortPassing: 75, marking: 75, standingTackle: 72, aggression: 68 },
    'Attacking Mid': { vision: 82, shortPassing: 80, longShots: 75, dribbling: 78, ballControl: 80, finishing: 70 },
    'Deep-Lying Playmaker': { vision: 85, longPassing: 82, shortPassing: 80, ballControl: 78, composure: 80, interceptions: 65 },
    'Box-to-Box': { stamina: 85, shortPassing: 75, longPassing: 72, standingTackle: 75, interceptions: 72, acceleration: 75, finishing: 68 },
  };

  // âœ… FIX 3: applyTemplate now clamps values to age-based max
  const applyTemplate = (templateName) => {
    const numAge = parseInt(age) || 15;
    const maxStat = getMaxStatByAge(numAge);
    
    const base = { ...attrs };
    Object.keys(base).forEach(key => base[key] = 0);
    
    const updates = templates[templateName] || {};
    
    // Apply template values BUT clamp to maxStat for age
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
      image,
      attrs,
      overall,
      positions,
      tips,
    };

    setCardData(data);

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
      ]);
    } else {
      Alert.alert('Error', 'Failed to save player');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Player Profile</Text>
      
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Profile Completion: {formProgress}%</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${formProgress}%` }]} />
        </View>
      </View>

      <View style={styles.imageSection}>
        <Text style={styles.label}>ðŸ‘¤ Add Your Face (Optional)</Text>
        <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
          {image ? (
            <Image source={{ uri: image }} style={styles.playerImage} />
          ) : (
            <Text style={styles.imageButtonText}>+ Choose Photo</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>âš¡ Quick Templates</Text>
      <View style={styles.templateGrid}>
        {['Custom', 'Striker', 'Winger', 'Midfielder', 'Defender', 'Goalkeeper', 'Full Back', 'Defensive Mid', 'Attacking Mid', 'Deep-Lying Playmaker', 'Box-to-Box'].map((temp) => (
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
        placeholder="Date of Birth (YYYY-MM-DD) - Optional"
        value={dateOfBirth}
        onChangeText={(text) => {
          setDateOfBirth(text);
          if (text) {
            setAge(calculateAgeFromDOB(text));
          }
        }}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Age (15-80)"
        value={age}
        onChangeText={(text) => {
          const numAge = parseInt(text) || 4;
          if (numAge >= 4 && numAge <= 56) {
            setAge(text);
          }
        }}
        keyboardType="numeric"
      />
      <TextInput style={styles.input} placeholder="Height (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" />
      
      <TouchableOpacity 
        style={styles.input} 
        onPress={() => setShowCountryPicker(true)}
      >
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
          <StarRating
            value={skillMoves}
            onChange={setSkillMoves}
            max={getMaxStarsByAge(age)}
          />
          <Text style={styles.suggestionText}>
            Max {getMaxStarsByAge(age)} for age {age}
          </Text>
        </View>
        <View style={styles.skillItem}>
          <Text style={styles.label}>Weak Foot</Text>
          <StarRating
            value={weakFoot}
            onChange={setWeakFoot}
            max={getMaxStarsByAge(age)}
          />
          <Text style={styles.suggestionText}>
            Max {getMaxStarsByAge(age)} for age {age}
          </Text>
        </View>
      </View>

      <View style={styles.conditionsSection}>
        <TouchableOpacity
          style={[styles.conditionButton, disability && styles.conditionActive]}
          onPress={() => setDisability(!disability)}
        >
          <Text style={[styles.conditionText, disability && styles.conditionTextActive]}>â™¿ Disability Support</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.conditionButton, mentalStress && styles.conditionActive]}
          onPress={() => setMentalStress(!mentalStress)}
        >
          <Text style={[styles.conditionText, mentalStress && styles.conditionTextActive]}>ðŸ§  Mental Health Support</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>âš½ Player Attributes</Text>
      
      <Text style={styles.categoryTitle}>ðŸƒ Pace</Text>
      {['acceleration', 'sprintSpeed'].map((attr) => (
        <DraggableSlider
          key={attr}
          attr={attr}
          value={attrs[attr]}
          onValueChange={(value) => setAttrs({ ...attrs, [attr]: value })}
        />
      ))}

      <Text style={styles.categoryTitle}>âš½ Shooting</Text>
      {['finishing', 'shotPower', 'longShots', 'volleys', 'penalties'].map((attr) => (
        <DraggableSlider
          key={attr}
          attr={attr}
          value={attrs[attr]}
          onValueChange={(value) => setAttrs({ ...attrs, [attr]: value })}
        />
      ))}

      <Text style={styles.categoryTitle}>ðŸŽ¯ Passing</Text>
      {['vision', 'crossing', 'shortPassing', 'longPassing', 'curve'].map((attr) => (
        <DraggableSlider
          key={attr}
          attr={attr}
          value={attrs[attr]}
          onValueChange={(value) => setAttrs({ ...attrs, [attr]: value })}
        />
      ))}

      <Text style={styles.categoryTitle}>ðŸŽ¨ Dribbling</Text>
      {['agility', 'balance', 'reactions', 'ballControl', 'dribbling', 'composure'].map((attr) => (
        <DraggableSlider
          key={attr}
          attr={attr}
          value={attrs[attr]}
          onValueChange={(value) => setAttrs({ ...attrs, [attr]: value })}
        />
      ))}

      <Text style={styles.categoryTitle}>ðŸ›¡ï¸ Defending</Text>
      {['interceptions', 'headingAccuracy', 'marking', 'standingTackle', 'slidingTackle'].map((attr) => (
        <DraggableSlider
          key={attr}
          attr={attr}
          value={attrs[attr]}
          onValueChange={(value) => setAttrs({ ...attrs, [attr]: value })}
        />
      ))}

      <Text style={styles.categoryTitle}>ðŸ’ª Physical</Text>
      {['jumping', 'stamina', 'strength', 'aggression'].map((attr) => (
        <DraggableSlider
          key={attr}
          attr={attr}
          value={attrs[attr]}
          onValueChange={(value) => setAttrs({ ...attrs, [attr]: value })}
        />
      ))}

      <Text style={styles.categoryTitle}>ðŸ¥… Goalkeeping</Text>
      {['diving', 'handling', 'kicking', 'positioning', 'reflexes'].map((attr) => (
        <DraggableSlider
          key={attr}
          attr={attr}
          value={attrs[attr]}
          onValueChange={(value) => setAttrs({ ...attrs, [attr]: value })}
        />
      ))}

      {cardData && (
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>ðŸŽ´ Live Preview</Text>
          <PlayerCard data={cardData} />
        </View>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>ðŸš€ Generate Player Card</Text>
      </TouchableOpacity>

      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                <Text style={styles.closeButton}>âœ•</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.searchInput}
              placeholder="Search country..."
              value={countrySearch}
              onChangeText={setCountrySearch}
              autoFocus
            />
            
            <FlatList
              data={COUNTRIES.filter(c => 
                c.toLowerCase().includes(countrySearch.toLowerCase())
              )}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => {
                    setNationality(item);
                    setShowCountryPicker(false);
                    setCountrySearch('');
                  }}
                >
                  <Text style={styles.countryText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia',
  'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia',
  'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'England', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
  'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast',
  'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius',
  'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea',
  'North Macedonia', 'Northern Ireland', 'Norway',
  'Oman',
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar',
  'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino',
  'Sao Tome and Principe', 'Saudi Arabia', 'Scotland', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore',
  'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain',
  'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia',
  'Turkey', 'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United States', 'Uruguay', 'Uzbekistan',
  'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Wales',
  'Yemen',
  'Zambia', 'Zimbabwe'
];

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f5f5f5' },
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
  sliderTrack: { height: 25, backgroundColor: '#ecf0f1', borderRadius: 12, marginVertical: 5, position: 'relative', justifyContent: 'center', width: '100%' },
  sliderFill: { height: '100%', backgroundColor: '#3498db', borderRadius: 12, position: 'absolute', left: 0, top: 0 },
  sliderThumb: { width: 20, height: 20, backgroundColor: '#2c3e50', borderRadius: 10, position: 'absolute', marginLeft: -10, top: 2.5, borderWidth: 2, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 },
  valueInput: { position: 'absolute', right: 5, top: '50%', marginTop: -10, backgroundColor: '#2c3e50', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, minWidth: 30, alignItems: 'center' },
  valueText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
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