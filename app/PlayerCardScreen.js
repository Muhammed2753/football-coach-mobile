// app/PlayerCardScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getAllPlayers } from '';
// âœ… Import ad components
import AdBanner from '';
import { useInterstitialAd } from '';
// âœ… Import sharing libraries
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

export default function PlayerCardScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  
  // âœ… Ref for capturing the card image
  const cardRef = useRef(null);
  
  // âœ… Initialize interstitial ad hook
  const { show: showInterstitial } = useInterstitialAd();

  useEffect(() => {
    const loadPlayer = async () => {
      try {
        if (data) {
          const parsedPlayer = JSON.parse(data);
          setPlayer(parsedPlayer);
        } else {
          const players = await getAllPlayers();
          if (players.length > 0) {
            setPlayer(players[players.length - 1]);
          }
        }
      } catch (error) {
        console.error('Error loading player:', error);
        Alert.alert('Error', 'Could not load player data');
      } finally {
        setLoading(false);
      }
    };

    loadPlayer();
  }, [data]);

  // âœ… Helper: Show interstitial before navigation (30% chance)
  const navigateWithAd = (route, params) => {
    if (Math.random() > 0.7) {
      showInterstitial();
    }
    setTimeout(() => router.push({ pathname: route, params }), 500);
  };

  // âœ… Share Player Card Function
  const handleShareCard = async () => {
    if (sharing) return;
    setSharing(true);
    
    try {
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing Not Available', 'Install a sharing app (like Instagram, WhatsApp, etc.) to share this card.');
        setSharing(false);
        return;
      }

      // Capture the card as an image
      // Note: react-native-view-shot requires native build to work
      if (Platform.OS !== 'web') {
        const uri = await captureRef(cardRef, {
          format: 'jpg',
          quality: 0.9,
        });
        
        await Sharing.shareAsync(uri, {
          mimeType: 'image/jpeg',
          dialogTitle: `Share ${player.name}'s Football Coach Card!`,
          UTI: 'public.jpeg',
        });
      } else {
        // Fallback for web: share text + link
        const shareText = `Check out my Football Coach player card!\n\n${player.name} - ${player.overall} OVR\nPosition: ${player.positions?.[0] || 'CM'}\n\nCreated with Football Coach App ðŸ†âš½`;
        
        if (navigator.share) {
          await navigator.share({
            title: 'My Football Coach Card',
            text: shareText,
            url: window.location.href,
          });
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(shareText);
          Alert.alert('Copied!', 'Player card details copied to clipboard. Paste anywhere to share!');
        }
      }
      
    } catch (error) {
      console.error('Share failed:', error);
      if (error.message !== 'User canceled share') {
        Alert.alert('Error', 'Could not share card. Please try again.');
      }
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading player...</Text>
      </View>
    );
  }

  if (!player) {
    return (
      <View style={styles.center}>
        <Text style={styles.noPlayerTitle}>No Player Found</Text>
        <Text style={styles.noPlayerText}>Please create a profile first</Text>
        <TouchableOpacity onPress={() => router.push('/ProfileForm')} style={styles.createButton}>
          <Text style={styles.createButtonText}>ðŸ“ Create Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>â† Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    // âœ… Wrap in flex container for banner at bottom
    <View style={{ flex: 1, backgroundColor: '#0d1b2a' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>â† Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>âš½ Player Card</Text>

        {/* âœ… Add ref to the card container for screenshot capture */}
        <View ref={cardRef} style={styles.card}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.overall}>{player.overall || 75}</Text>
            <Text style={styles.position}>{player.positions?.[0] || 'CM'}</Text>
            <Text style={styles.nationality}>{player.nationality || 'INT'}</Text>
          </View>

          {/* Player Image and Name */}
          <View style={styles.playerInfo}>
            {player.image ? (
              <Image source={{ uri: player.image }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.placeholderAvatar]}>
                <Text style={styles.placeholderText}>âš½</Text>
              </View>
            )}
            <View style={styles.nameSection}>
              <Text style={styles.name}>{player.name || 'Anonymous'}</Text>
              <Text style={styles.club}>{player.club || 'Free Agent'}</Text>
            </View>
          </View>

          {/* FIFA-Style Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.round(((player.attrs?.acceleration || 0) + (player.attrs?.sprintSpeed || 0)) / 2)}</Text>
                <Text style={styles.statLabel}>PAC</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.round(((player.attrs?.finishing || 0) + (player.attrs?.shotPower || 0) + (player.attrs?.longShots || 0)) / 3)}</Text>
                <Text style={styles.statLabel}>SHO</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.round(((player.attrs?.shortPassing || 0) + (player.attrs?.longPassing || 0) + (player.attrs?.vision || 0)) / 3)}</Text>
                <Text style={styles.statLabel}>PAS</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.round(((player.attrs?.dribbling || 0) + (player.attrs?.ballControl || 0) + (player.attrs?.agility || 0)) / 3)}</Text>
                <Text style={styles.statLabel}>DRI</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.round(((player.attrs?.interceptions || 0) + (player.attrs?.standingTackle || 0) + (player.attrs?.marking || 0)) / 3)}</Text>
                <Text style={styles.statLabel}>DEF</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.round(((player.attrs?.stamina || 0) + (player.attrs?.strength || 0) + (player.attrs?.jumping || 0)) / 3)}</Text>
                <Text style={styles.statLabel}>PHY</Text>
              </View>
            </View>
          </View>

          {/* Additional Info */}
          <View style={styles.additionalInfo}>
            <Text style={styles.infoText}>Age: {player.age || 20}</Text>
            <Text style={styles.infoText}>Height: {player.height || 'N/A'}cm</Text>
            <Text style={styles.infoText}>Foot: {player.preferredFoot || 'Right'}</Text>
          </View>
        </View>

        {/* âœ… Share Button - Added Here */}
        <TouchableOpacity 
          onPress={handleShareCard}
          disabled={sharing}
          style={[styles.shareButton, sharing && styles.shareButtonDisabled]}
        >
          <Text style={styles.shareButtonText}>
            {sharing ? 'â³ Sharing...' : 'ðŸ“¤ Share Card'}
          </Text>
        </TouchableOpacity>

        {/* Action Buttons - CENTERED */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            onPress={() => navigateWithAd('/TrainingPlanScreen', { data: JSON.stringify(player) })} 
            style={styles.actionButton}
          >
            <Text style={styles.actionButtonText}>ðŸ“‹ Training Plan</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigateWithAd('/ProgressScreen', { playerData: JSON.stringify(player) })} 
            style={styles.actionButton}
          >
            <Text style={styles.actionButtonText}>ðŸ“Š Track Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push({ pathname: '/WeaknessScreen', params: { data: JSON.stringify(player) } })} 
            style={styles.actionButton}
          >
            <Text style={styles.actionButtonText}>ðŸŽ¯ View Weaknesses</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigateWithAd('/AICoachScreen', { playerData: JSON.stringify(player) })} 
            style={styles.actionButton}
          >
            <Text style={styles.actionButtonText}>ðŸ§  AI Coach</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/VIPChat')} 
            style={styles.actionButton}
          >
            <Text style={styles.actionButtonText}>ðŸ’¬ VIP Chat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* âœ… Banner Ad - Sticks to bottom, hidden for VIP */}
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d1b2a', padding: 20 },
  loadingText: { color: '#a8dadc', fontSize: 16 },
  container: { padding: 20, backgroundColor: '#0d1b2a', alignItems: 'center', paddingBottom: 40 },
  backButton: { alignSelf: 'flex-start', backgroundColor: '#1b263b', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginBottom: 16 },
  backButtonText: { color: '#f1faee', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f1faee', marginBottom: 20, textAlign: 'center' },
  card: { 
    width: '100%', 
    backgroundColor: '#1a2332', 
    borderRadius: 15, 
    padding: 20, 
    alignItems: 'center', 
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ffd700'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 15 },
  overall: { fontSize: 32, fontWeight: 'bold', color: '#ffd700', backgroundColor: '#2c3e50', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  position: { fontSize: 18, fontWeight: 'bold', color: '#ffd700', backgroundColor: '#2c3e50', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  nationality: { fontSize: 14, color: '#a8dadc', fontWeight: '600' },
  playerInfo: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginRight: 15, borderWidth: 3, borderColor: '#ffd700' },
  placeholderAvatar: { backgroundColor: '#2c3e50', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 24, color: '#ffd700' },
  nameSection: { flex: 1 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#f1faee', marginBottom: 5 },
  club: { fontSize: 14, color: '#a8dadc' },
  statsContainer: { width: '100%', marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  statItem: { alignItems: 'center', backgroundColor: '#2c3e50', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, minWidth: 50 },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#ffd700' },
  statLabel: { fontSize: 10, color: '#a8dadc', fontWeight: '600', marginTop: 2 },
  additionalInfo: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  infoText: { color: '#a8dadc', fontSize: 12, fontWeight: '500' },
  shareButton: { 
    backgroundColor: '#9c27b0', 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 16,
    width: '90%',
    alignSelf: 'center'
  },
  shareButtonDisabled: { opacity: 0.6 },
  shareButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  actionContainer: { width: '100%', alignItems: 'center' },
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
  noPlayerTitle: { fontSize: 20, fontWeight: 'bold', color: '#f1faee', marginBottom: 10 },
  noPlayerText: { fontSize: 16, color: '#a8dadc', textAlign: 'center', marginBottom: 20 },
  createButton: { backgroundColor: '#28a745', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, marginBottom: 10 },
  createButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});