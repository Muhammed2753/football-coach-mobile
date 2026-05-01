import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView, Share } from 'react-native';
import { getAllPlayers, updatePlayer } from '../utils/playerDatabase';
import { useRouter } from 'expo-router';

const getStatColor = (value) => {
  if (value >= 91) return '#daa520';
  if (value >= 76) return '#ffd700';
  if (value >= 66) return '#c0c0c0';
  return '#cd7f32';
};

const getCardBackgroundColor = (value) => {
  if (value >= 91) return '#2d2416'; // Dark gold
  if (value >= 76) return '#2d2816'; // Dark yellow
  if (value >= 66) return '#252829'; // Dark silver
  return '#2d1f1a'; // Dark bronze
};

function InteractiveStarRating({ value, onChange }) {
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleStarPress = (starIndex) => {
    setCurrentValue(starIndex);
    onChange(starIndex);
  };

  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <View key={star} style={styles.starBox}>
          <TouchableOpacity
            onPress={() => handleStarPress(star)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.starButton}
          >
            <Text style={[styles.star, currentValue >= star && styles.starActive]}>
              ★
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
export default function PlayerCard({ data }) {
  const router = useRouter();
  const [player, setPlayer] = useState(null);
  const [skillMoves, setSkillMoves] = useState(2);
  const [weakFoot, setWeakFoot] = useState(3);

  useEffect(() => {
    if (data) {
      setPlayer(data);
      setSkillMoves(data.skillMoves || 2);
      setWeakFoot(data.weakFoot || 3);
      return;
    }

    const loadLatestPlayer = async () => {
      try {
        const players = await getAllPlayers();
        if (players.length > 0) {
          const latestPlayer = players[players.length - 1];
          setPlayer(latestPlayer);
          setSkillMoves(latestPlayer.skillMoves || 2);
          setWeakFoot(latestPlayer.weakFoot || 3);
        }
      } catch (error) {
        console.error('Error loading player:', error);
      }
    };
    loadLatestPlayer();
  }, [data]);

  const updatePlayerAttribute = async (attribute, value) => {
    if (player?.id) {
      try {
        await updatePlayer(player.id, { [attribute]: value });
      } catch (error) {
        console.error('Error updating player:', error);
      }
    }
  };

  const handleSkillMovesChange = (value) => {
    setSkillMoves(value);
    if (!data) updatePlayerAttribute('skillMoves', value);
  };

  const handleWeakFootChange = (value) => {
    setWeakFoot(value);
    if (!data) updatePlayerAttribute('weakFoot', value);
  };

  const sharePlayerCard = async () => {
    try {
      const cardData = {
        name: player.name,
        overall: player.overall || 75,
        position: player.preferredPosition || player.positions?.[0] || 'CM',
        age: player.age || 20,
        club: player.club || 'Free Agent'
      };
      await Share.share({
        message: `🎴 Check out my Football Coach player card!\n\n⚽ ${cardData.name}\n🏆 Overall: ${cardData.overall}\n📍 Position: ${cardData.position}\n🎂 Age: ${cardData.age}\n🏟️ Club: ${cardData.club}\n\nDownload Football Coach Mobile to create your own!`,
        title: 'My Player Card'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share card');
    }
  };

  if (!player) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Your Player Card</Text>
        <View style={styles.noPlayerCard}>
          <Text style={styles.noPlayerTitle}>No Player Found</Text>
          <Text style={styles.noPlayerText}>Please create a profile first</Text>
          <TouchableOpacity onPress={() => router.push('/ProfileForm')} style={styles.createProfileButton}>
            <Text style={styles.createProfileButtonText}>📝 Create Profile</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const overall = player.overall || 75;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Your Player Card</Text>

      <View style={[styles.card, { 
        borderColor: getStatColor(overall),
        backgroundColor: getCardBackgroundColor(overall)
      }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.overall, { 
            backgroundColor: getStatColor(overall), 
            color: overall >= 66 ? '#000' : '#fff' 
          }]}>
            {overall}
          </Text>
          <Text style={styles.position}>{player.preferredPosition || player.positions?.[0] || 'CM'}</Text>
          <Text style={styles.nationality}>{player.nationality || 'INT'}</Text>
        </View>

        <View style={styles.playerInfo}>
          <Image
            source={{ uri: player.image || 'https://via.placeholder.com/120' }}
            style={styles.avatar}
          />
          <View style={styles.nameSection}>
            <Text style={styles.name}>{player.name}</Text>
            <Text style={styles.club}>{player.club || 'Free Agent'}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              {(() => {
                const pac = Math.round(((player.attrs?.acceleration || 0) + (player.attrs?.sprintSpeed || 0)) / 2) || 0;
                return <Text style={[styles.statValue, { color: getStatColor(pac) }]}>{pac}</Text>;
              })()}
              <Text style={styles.statLabel}>PAC</Text>
            </View>
            <View style={styles.statItem}>
              {(() => {
                const sho = Math.round(((player.attrs?.finishing || 0) + (player.attrs?.shotPower || 0) + (player.attrs?.longShots || 0)) / 3) || 0;
                return <Text style={[styles.statValue, { color: getStatColor(sho) }]}>{sho}</Text>;
              })()}
              <Text style={styles.statLabel}>SHO</Text>
            </View>
            <View style={styles.statItem}>
              {(() => {
                const pas = Math.round(((player.attrs?.shortPassing || 0) + (player.attrs?.longPassing || 0) + (player.attrs?.vision || 0)) / 3) || 0;
                return <Text style={[styles.statValue, { color: getStatColor(pas) }]}>{pas}</Text>;
              })()}
              <Text style={styles.statLabel}>PAS</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              {(() => {
                const dri = Math.round(((player.attrs?.dribbling || 0) + (player.attrs?.ballControl || 0) + (player.attrs?.agility || 0)) / 3) || 0;
                return <Text style={[styles.statValue, { color: getStatColor(dri) }]}>{dri}</Text>;
              })()}
              <Text style={styles.statLabel}>DRI</Text>
            </View>
            <View style={styles.statItem}>
              {(() => {
                const def = Math.round(((player.attrs?.interceptions || 0) + (player.attrs?.standingTackle || 0) + (player.attrs?.marking || 0)) / 3) || 0;
                return <Text style={[styles.statValue, { color: getStatColor(def) }]}>{def}</Text>;
              })()}
              <Text style={styles.statLabel}>DEF</Text>
            </View>
            <View style={styles.statItem}>
              {(() => {
                const phy = Math.round(((player.attrs?.stamina || 0) + (player.attrs?.strength || 0) + (player.attrs?.jumping || 0)) / 3) || 0;
                return <Text style={[styles.statValue, { color: getStatColor(phy) }]}>{phy}</Text>;
              })()}
              <Text style={styles.statLabel}>PHY</Text>
            </View>
          </View>
        </View>

        <View style={styles.additionalInfo}>
          <Text style={styles.infoText}>Age: {player.age || 20}</Text>
          <Text style={styles.infoText}>Height: {player.height || 'N/A'}cm</Text>
          <Text style={styles.infoText}>Foot: {player.preferredFoot || 'Right'}</Text>
        </View>

        <View style={styles.skillsInfo}>
          <View style={styles.skillItem}>
            <Text style={styles.skillLabel}>Skill Moves</Text>
            <InteractiveStarRating value={skillMoves} onChange={handleSkillMovesChange} />
            <Text style={styles.skillValue}>{skillMoves}/5</Text>
          </View>
          <View style={styles.skillItem}>
            <Text style={styles.skillLabel}>Weak Foot</Text>
            <InteractiveStarRating value={weakFoot} onChange={handleWeakFootChange} />
            <Text style={styles.skillValue}>{weakFoot}/5</Text>
          </View>
        </View>
      </View>

      {!data && (
        <>
          <TouchableOpacity onPress={sharePlayerCard} style={styles.shareButton}>
            <Text style={styles.shareButtonText}>📤 Share My Card</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/VIPChat')} style={styles.chatButton}>
            <Text style={styles.chatButtonText}>💬 VIP Coach Chat</Text>
          </TouchableOpacity>

          <View style={styles.actionContainer}>
            <TouchableOpacity onPress={() => router.push('/TrainingPlanScreen')} style={styles.actionButton}>
              <Text style={styles.actionButtonText}>📋 Create Training Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/WeaknessScreen')} style={styles.actionButton}>
              <Text style={styles.actionButtonText}>🎯 View Weaknesses</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/ProgressScreen')} style={styles.actionButton}>
              <Text style={styles.actionButtonText}>📊 Track Progress</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back to Home</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0d1b2a', alignItems: 'center' },
  scrollContainer: { padding: 20, backgroundColor: '#0d1b2a', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#f1faee', textAlign: 'center', marginBottom: 20 },
  card: { 
    width: '95%', 
    borderRadius: 15, 
    padding: 25, 
    alignItems: 'center', 
    marginBottom: 20,
    borderWidth: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15
  },
  overall: {
    fontSize: 32,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  position: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffd700',
    backgroundColor: '#2c3e50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  nationality: {
    fontSize: 14,
    color: '#a8dadc',
    fontWeight: '600'
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20
  },
  avatar: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    marginRight: 15,
    borderWidth: 3,
    borderColor: '#ffd700'
  },
  nameSection: { flex: 1 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#f1faee', marginBottom: 5 },
  club: { fontSize: 16, color: '#a8dadc' },
  statsContainer: { width: '100%', marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  statItem: {
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 50
  },
  statValue: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#a8dadc', fontWeight: '600', marginTop: 2 },
  additionalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 15
  },
  infoText: { color: '#a8dadc', fontSize: 14, fontWeight: '500' },
  skillsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginTop: 10,
  },
  skillItem: {
    flex: 1,
    maxWidth: '48%',
    alignItems: 'center',
    paddingHorizontal: 4, 
    justifyContent: 'center',
  },
  skillLabel: {
    color: '#a8dadc',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    width: '100%',
  },
  skillValue: {
    color: '#a8dadc',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
    width: '100%',
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },
  starBox: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 1,
  },
  star: {
    fontSize: 12,
    lineHeight: 24,
    textAlignVertical: 'center',
    color: '#777',
  },
  starActive: {
    color: '#ffd700',
  },
  shareButton: { 
    backgroundColor: '#28a745', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 10, 
    width: '90%' 
  },
  shareButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  chatButton: { 
    backgroundColor: '#d32f2f', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 10, 
    width: '90%' 
  },
  chatButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  actionContainer: { 
    width: '100%', 
    alignItems: 'center',
    marginBottom: 20 
  },
  actionButton: { 
    backgroundColor: '#1e88e5', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 10, 
    width: '90%' 
  },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  backButton: { 
    backgroundColor: '#666', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    width: '90%' 
  },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  noPlayerCard: {
    width: '95%',
    backgroundColor: '#1a2332',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ffd700'
  },
  noPlayerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1faee',
    marginBottom: 10
  },
  noPlayerText: {
    fontSize: 16,
    color: '#a8dadc',
    textAlign: 'center',
    marginBottom: 20
  },
  createProfileButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%'
  },
  createProfileButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
});