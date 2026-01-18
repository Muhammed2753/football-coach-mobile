// app/components/PlayerCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Share, Alert } from 'react-native';

// 🌍 COUNTRY FLAGS GROUPED BY CONTINENT
const COUNTRY_FLAGS = {
  // AFRICA
  'Nigeria': '🇳🇬',
  'Ghana': '🇬🇭',
  'South Africa': '🇿🇦',
  'Egypt': '🇪🇬',
  'Morocco': '🇲🇦',
  'Cameroon': '🇨🇲',
  'Senegal': '🇸🇳',
  'Ivory Coast': '🇨🇮',
  'Algeria': '🇩🇿',
  'Tunisia': '🇹🇳',
  'Kenya': '🇰🇪',
  'Uganda': '🇺🇬',
  'Zimbabwe': '🇿🇼',
  'Mali': '🇲🇱',
  'Burkina Faso': '🇧🇫',
  'DR Congo': '🇨🇩',
  'Angola': '🇦🇴',
  'Tanzania': '🇹🇿',
  'Ethiopia': '🇪🇹',
  'Niger': '🇳🇪',

  // EUROPE
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'France': '🇫🇷',
  'Germany': '🇩🇪',
  'Spain': '🇪🇸',
  'Italy': '🇮🇹',
  'Portugal': '🇵🇹',
  'Netherlands': '🇳🇱',
  'Belgium': '🇧🇪',
  'Croatia': '🇭🇷',
  'Switzerland': '🇨🇭',
  'Denmark': '🇩🇰',
  'Sweden': '🇸🇪',
  'Norway': '🇳🇴',
  'Poland': '🇵🇱',
  'Ukraine': '🇺🇦',
  'Serbia': '🇷🇸',
  'Turkey': '🇹🇷',
  'Greece': '🇬🇷',
  'Austria': '🇦🇹',
  'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',

  // AMERICAS
  'United States': '🇺🇸',
  'Brazil': '🇧🇷',
  'Argentina': '🇦🇷',
  'Mexico': '🇲🇽',
  'Colombia': '🇨🇴',
  'Uruguay': '🇺🇾',
  'Chile': '🇨🇱',
  'Peru': '🇵🇪',
  'Ecuador': '🇪🇨',
  'Canada': '🇨🇦',
  'Costa Rica': '🇨🇷',
  'Jamaica': '🇯🇲',
  'Honduras': '🇭🇳',
  'Panama': '🇵🇦',
  'Bolivia': '🇧🇴',
  'Paraguay': '🇵🇾',
  'Venezuela': '🇻🇪',
  'Trinidad and Tobago': '🇹🇹',
  'El Salvador': '🇸🇻',
  'Guatemala': '🇬🇹',

  // ASIA
  'Japan': '🇯🇵',
  'South Korea': '🇰🇷',
  'China': '🇨🇳',
  'Saudi Arabia': '🇸🇦',
  'Iran': '🇮🇷',
  'Qatar': '🇶🇦',
  'UAE': '🇦🇪',
  'Iraq': '🇮🇶',
  'Jordan': '🇯🇴',
  'Lebanon': '🇱🇧',
  'Syria': '🇸🇾',
  'Oman': '🇴🇲',
  'Kuwait': '🇰🇼',
  'Bahrain': '🇧🇭',
  'Thailand': '🇹🇭',
  'Vietnam': '🇻🇳',
  'Indonesia': '🇮🇩',
  'Malaysia': '🇲🇾',
  'Singapore': '🇸🇬',
  'Philippines': '🇵🇭',

  // OCEANIA
  'Australia': '🇦🇺',
  'New Zealand': '🇳🇿',
  'Fiji': '🇫🇯',
  'Papua New Guinea': '🇵🇬',
  'Solomon Islands': '🇸🇧',
  'Vanuatu': '🇻🇺',
  'Samoa': '🇼🇸',
  'Tonga': '🇹🇴',
  'Kiribati': '🇰🇮',
  'Micronesia': '🇫🇲',
};

// Helper function to get flag
const getCountryFlag = (country) => {
  return COUNTRY_FLAGS[country] || '🌐'; // Default globe if not found
};

export default function PlayerCard({ data, onBack }) {
  // 🎴 ENHANCED RARITY SYSTEM
  const getCardRarity = (overall) => {
    if (overall >= 86) return { 
      rarity: 'ELITE', 
      bgColor: '#D4AF37', 
      textColor: '#000', 
      borderColor: '#B8860B',
      emoji: '💎' 
    };
    if (overall >= 75) return { 
      rarity: 'GOLD', 
      bgColor: '#FFD700', 
      textColor: '#000', 
      borderColor: '#DAA520',
      emoji: '⭐' 
    };
    if (overall >= 65) return { 
      rarity: 'SILVER', 
      bgColor: '#C0C0C0', 
      textColor: '#000', 
      borderColor: '#A9A9A9',
      emoji: '✨' 
    };
    return { 
      rarity: 'BRONZE', 
      bgColor: '#CD7F32', 
      textColor: '#fff', 
      borderColor: '#8B4513',
      emoji: '⚡' 
    };
  };

  const cardStyle = getCardRarity(data.overall);
  const primaryPos = data.positions && data.positions[0] ? data.positions[0] : 'Utility';
  const isGK = primaryPos === "GK";

  // Share card function
  const handleShare = async () => {
    try {
      const shareMessage = `Check out my Football Coach Card!\n\n👤 ${data.name || 'Anonymous'}\n⚽ Position: ${data.positions.join(' / ')}\n⭐ Overall: ${data.overall}\n🌍 ${data.nationality || 'Unknown'}\n🏟️ ${data.club || 'No Club'} #${data.jersey || '?'}\n📏 Age: ${data.age} • Height: ${data.height || '?'} cm\n\nI'm training to improve! Download Football Coach to create your card!`;
      
      await Share.share({
        message: shareMessage,
        title: `${data.name}'s Football Coach Card`,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share card');
    }
  };

  // 🔢 Helper functions for non-GK positions
  const getPAC = () => Math.round((data.attrs.acceleration + data.attrs.sprintSpeed) / 2);
  const getSHO = () => Math.round((
    data.attrs.finishing + data.attrs.shotPower + data.attrs.longShots + 
    data.attrs.volleys + data.attrs.penalties
  ) / 5);
  const getPAS = () => Math.round((data.attrs.vision + data.attrs.crossing + data.attrs.shortPassing + data.attrs.longPassing + data.attrs.curve) / 5);
  const getDRI = () => Math.round((data.attrs.agility + data.attrs.balance + data.attrs.reactions + data.attrs.ballControl + data.attrs.dribbling + data.attrs.composure) / 6);
  const getDEF = () => Math.round((data.attrs.interceptions + data.attrs.headingAccuracy + data.attrs.marking + data.attrs.standingTackle + data.attrs.slidingTackle) / 5);
  const getPHY = () => Math.round((data.attrs.jumping + data.attrs.stamina + data.attrs.strength + data.attrs.aggression) / 4);

  // 🌟 Star color logic
  const starColor = cardStyle.textColor === '#fff' ? '#FFD700' : '#DAA520';

  return (
    <View style={styles.cardContainer}>
      {/* Rarity Badge */}
      <View style={[styles.rarityBadge, { backgroundColor: cardStyle.bgColor }]}>
        <Text style={[styles.rarityText, { color: cardStyle.textColor }]}>
          {cardStyle.emoji} {cardStyle.rarity}
        </Text>
      </View>

      {/* Main Card */}
      <View style={[
        styles.card, 
        { 
          backgroundColor: cardStyle.bgColor,
          borderColor: cardStyle.borderColor,
          borderRadius: cardStyle.rarity === 'ELITE' ? 32 : 16,
          ...(cardStyle.rarity === 'ELITE' && {
            shadowColor: '#D4AF37',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.7,
            shadowRadius: 12,
          })
        }
      ]}>
        {/* Prime Indicator */}
        {data.age >= 18 && data.age <= 28 && (
          <View style={styles.primeBadge}>
            <Text style={styles.primeText}>🔥 PRIME</Text>
          </View>
        )}

        {/* 👤 Player Face */}
        <View style={styles.faceContainer}>
          {data.image ? (
            <Image source={{ uri: data.image }} style={styles.faceImage} />
          ) : (
            <Text style={[styles.noFace, { color: cardStyle.textColor }]}>?</Text>
          )}
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.rating, { color: cardStyle.textColor }]}>{data.overall}</Text>
          <View style={styles.namePos}>
            <Text style={[styles.name, { color: cardStyle.textColor }]}>
              {getCountryFlag(data.nationality)} {data.name || "Anonymous"}
            </Text>
            <Text style={[styles.detail, { color: cardStyle.textColor }]}>
              Age: {data.age} • Height: {data.height || '?'} cm
            </Text>
            <Text style={[styles.club, { color: cardStyle.textColor }]}>
              {data.club || "No Club"} • #{data.jersey || '?'}
            </Text>
            <Text style={[styles.position, { color: cardStyle.textColor }]}>
              {data.positions[0]}{data.positions.length > 1 ? ` / ${data.positions.slice(1).join(' / ')}` : ''}
            </Text>
          </View>
        </View>

        {/* Attributes */}
        <View style={styles.attrGrid}>
          {isGK ? (
            ['diving','handling','kicking','positioning','reflexes','reactions'].map(attr => (
              <View key={attr} style={styles.attrCol}>
                <Text style={[styles.attrLabel, { color: cardStyle.textColor }]}>{attr.substring(0, 3).toUpperCase()}</Text>
                <Text style={[styles.attrValue, { color: cardStyle.textColor }]}>{data.attrs[attr] || 0}</Text>
              </View>
            ))
          ) : (
            [
              { label: 'PAC', value: getPAC() },
              { label: 'SHO', value: getSHO() },
              { label: 'PAS', value: getPAS() },
              { label: 'DRI', value: getDRI() },
              { label: 'DEF', value: getDEF() },
              { label: 'PHY', value: getPHY() },
            ].map(({ label, value }) => (
              <View key={label} style={styles.attrCol}>
                <Text style={[styles.attrLabel, { color: cardStyle.textColor }]}>{label}</Text>
                <Text style={[styles.attrValue, { color: cardStyle.textColor }]}>{value || 0}</Text>
              </View>
            ))
          )}
        </View>

        {/* Skill Moves & Weak Foot */}
        <View style={[styles.footer, { borderTopColor: cardStyle.borderColor }]}>
          <View style={styles.footRow}>
            <Text style={[styles.footLabel, { color: cardStyle.textColor }]}>Skill Moves</Text>
            <Text style={[styles.footStars, { color: starColor }]}>
              {'★'.repeat(data.skillMoves)}{'☆'.repeat(5 - data.skillMoves)}
            </Text>
          </View>
          <View style={styles.footRow}>
            <Text style={[styles.footLabel, { color: cardStyle.textColor }]}>Weak Foot</Text>
            <Text style={[styles.footStars, { color: starColor }]}>
              {'★'.repeat(data.weakFoot)}{'☆'.repeat(5 - data.weakFoot)}
            </Text>
          </View>
        </View>
      </View>

      {/* Share and Back Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity 
          onPress={handleShare} 
          style={[styles.button, styles.shareButton]}
          accessibilityLabel="Share player card"
        >
          <Text style={styles.buttonText}>📤 Share Card</Text>
        </TouchableOpacity>
            // In PlayerCard.js
          <TouchableOpacity 
            onPress={() => router.push('/VIPChatScreen')}
            style={[styles.button, styles.vipButton]}
          >
          <Text style={styles.buttonText}>💬 VIP Coach Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={onBack} 
          style={[styles.button, styles.backButton]}
          accessibilityLabel="Go back to player form"
        >
          <Text style={styles.buttonText}>← Back to Form</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: { alignItems: 'center', padding: 16 },
  rarityBadge: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginBottom: 12 },
  rarityText: { fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  card: {
    width: '100%',
    padding: 16,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  primeBadge: { 
    alignSelf: 'flex-start', 
    backgroundColor: '#FF4500', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12,
    marginBottom: 8,
  },
  primeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  
  // 👤 Face Styles
  faceContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
    marginBottom: 16,
    backgroundColor: '#00000020',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ffffff80',
  },
  faceImage: { width: '100%', height: '100%' },
  noFace: { fontSize: 40, fontWeight: 'bold' },

  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  rating: { fontSize: 32, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  namePos: { alignItems: 'flex-end' },
  name: { fontSize: 18, fontWeight: 'bold' },
  detail: { fontSize: 14, opacity: 0.9, marginTop: 2 }, // 👈 Age & Height
  club: { fontSize: 14, opacity: 0.9, marginTop: 2 },
  position: { fontSize: 16, marginTop: 4 },
  attrGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginVertical: 16 },
  attrCol: { width: '30%', alignItems: 'center', marginBottom: 12 },
  attrLabel: { fontSize: 12, fontWeight: '600' },
  attrValue: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  footer: { borderTopWidth: 1, paddingTop: 12, marginTop: 8 },
  footRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  footLabel: { fontSize: 14 },
  footStars: { fontSize: 16 },
  buttonGroup: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    width: '100%',
    marginTop: 20,
  },
  button: { 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  shareButton: { backgroundColor: '#d32f2f' },
  backButton: { backgroundColor: '#1e88e5' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});