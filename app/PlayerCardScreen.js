// app/PlayerCardScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
// ⚠️ Update path if your file is named playerDatabase.js instead of database.js
import { getAllPlayers } from './utils/playerDatabase';

const PlayerCardScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const data = await getAllPlayers();
      setPlayers(data || []);
    } catch (error) {
      console.error('Failed to load players:', error);
      Alert.alert('Error', 'Could not load player cards');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (player) => {
    try {
      await Share.share({
        message: `Check out my player: ${player.name}!\n⚽ Overall: ${player.overall}\n🎯 Position: ${player.position}`,
        title: `${player.name} - Football Coach`,
      });
    } catch (error) {
      if (error.code !== 'ERR_CANCELED') {
        console.log('Share cancelled');
      }
    }
  };

  const handleEdit = (player) => {
    router.push({
      pathname: '/ProfileForm',
      params: { editId: player.id }
    });
  };

  const handleDelete = (player) => {
    Alert.alert(
      'Delete Player',
      `Are you sure you want to delete ${player.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement deletePlayer in your database utility
              // await deletePlayer(player.id);
              setPlayers(prev => prev.filter(p => p.id !== player.id));
              Alert.alert('Deleted', `${player.name} has been removed`);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete player');
            }
          }
        }
      ]
    );
  };

  const getRarityColor = (overall) => {
    if (overall >= 90) return '#FFD700'; // Legendary - Gold
    if (overall >= 85) return '#C0C0C0'; // Epic - Silver
    if (overall >= 80) return '#CD7F32'; // Rare - Bronze
    return '#A8DADC'; // Common - Blue
  };

  const getRarityLabel = (overall) => {
    if (overall >= 90) return 'LEGENDARY';
    if (overall >= 85) return 'EPIC';
    if (overall >= 80) return 'RARE';
    return 'COMMON';
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading players...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>⚽ Player Cards</Text>
        <Text style={styles.subtitle}>Tap a card to view details</Text>
      </View>

      {/* Player List */}
      {players.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎮</Text>
          <Text style={styles.emptyText}>No players yet</Text>
          <Text style={styles.emptySubtext}>Create your first player to get started</Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => router.push('/ProfileForm')}
          >
            <Text style={styles.createButtonText}>+ Create Player</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.grid}>
          {players.map((player) => (
            <TouchableOpacity
              key={player.id}
              style={[styles.card, { borderLeftColor: getRarityColor(player.overall) }]}
              onPress={() => setSelectedPlayer(player)}
              activeOpacity={0.8}
            >
              {/* Rarity Badge */}
              <View style={styles.rarityBadge}>
                <Text style={styles.rarityText}>{getRarityLabel(player.overall)}</Text>
              </View>

              {/* Player Info */}
              <View style={styles.cardContent}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerPosition}>{player.position || 'Position'}</Text>
                
                {/* Overall Rating */}
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingLabel}>Overall</Text>
                  <Text style={[styles.ratingValue, { color: getRarityColor(player.overall) }]}>
                    {player.overall || 0}
                  </Text>
                </View>

                {/* Stats Preview */}
                <View style={styles.statsPreview}>
                  <Text style={styles.stat}>⚡ Pace: {player.pace || '-'}</Text>
                  <Text style={styles.stat}>🎯 Shooting: {player.shooting || '-'}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleShare(player)}
                >
                  <Text style={styles.actionIcon}>📤</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleEdit(player)}
                >
                  <Text style={styles.actionIcon}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(player)}
                >
                  <Text style={styles.actionIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeModal}
              onPress={() => setSelectedPlayer(null)}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalName}>{selectedPlayer.name}</Text>
              <Text style={styles.modalPosition}>{selectedPlayer.position}</Text>
              <Text style={[styles.modalRating, { color: getRarityColor(selectedPlayer.overall) }]}>
                {selectedPlayer.overall} Overall
              </Text>
            </View>

            <View style={styles.modalStats}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Pace</Text>
                <Text style={styles.statValue}>{selectedPlayer.pace || '-'}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Shooting</Text>
                <Text style={styles.statValue}>{selectedPlayer.shooting || '-'}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Passing</Text>
                <Text style={styles.statValue}>{selectedPlayer.passing || '-'}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Dribbling</Text>
                <Text style={styles.statValue}>{selectedPlayer.dribbling || '-'}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Defending</Text>
                <Text style={styles.statValue}>{selectedPlayer.defending || '-'}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Physical</Text>
                <Text style={styles.statValue}>{selectedPlayer.physical || '-'}</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.shareButton]}
                onPress={() => handleShare(selectedPlayer)}
              >
                <Text style={styles.modalButtonText}>📤 Share</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.editButton]}
                onPress={() => {
                  setSelectedPlayer(null);
                  handleEdit(selectedPlayer);
                }}
              >
                <Text style={styles.modalButtonText}>✏️ Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default PlayerCardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d1b2a' },
  loadingText: { color: '#a8dadc', fontSize: 16 },
  
  // Header
  header: { marginBottom: 24, alignItems: 'center' },
  backButton: { alignSelf: 'flex-start', padding: 8 },
  backText: { color: '#1e88e5', fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffd700', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#a8dadc' },
  
  // Empty State
  emptyState: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#f1faee', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#a8dadc', textAlign: 'center', marginBottom: 24 },
  createButton: { backgroundColor: '#28a745', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  createButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  
  // Grid Layout
  grid: { gap: 16 },
  
  // Card
  card: { 
    backgroundColor: '#1b263b', 
    borderRadius: 12, 
    overflow: 'hidden',
    borderLeftWidth: 4,
  },
  rarityBadge: { 
    backgroundColor: '#0d1b2a', 
    paddingHorizontal: 12, 
    paddingVertical: 4,
    alignSelf: 'flex-start',
    borderBottomRightRadius: 8,
  },
  rarityText: { color: '#ffd700', fontSize: 10, fontWeight: 'bold' },
  
  cardContent: { padding: 16 },
  playerName: { fontSize: 18, fontWeight: 'bold', color: '#f1faee', marginBottom: 4 },
  playerPosition: { fontSize: 14, color: '#a8dadc', marginBottom: 12 },
  
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  ratingLabel: { color: '#a8dadc', fontSize: 12, marginRight: 8 },
  ratingValue: { fontSize: 24, fontWeight: 'bold' },
  
  statsPreview: { gap: 4 },
  stat: { fontSize: 12, color: '#a8dadc' },
  
  // Card Actions
  cardActions: { 
    flexDirection: 'row', 
    borderTopWidth: 1, 
    borderTopColor: '#2a3f5f',
    padding: 12,
    justifyContent: 'space-around'
  },
  actionButton: { padding: 8 },
  actionIcon: { fontSize: 18 },
  deleteButton: { opacity: 0.8 },
  
  // Modal
  modalOverlay: { 
    position: 'absolute', 
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 100,
  },
  modalContent: { 
    backgroundColor: '#1b263b', 
    borderRadius: 16, 
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  closeModal: { alignSelf: 'flex-end', padding: 8 },
  closeText: { color: '#a8dadc', fontSize: 24 },
  
  modalHeader: { alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#2a3f5f' },
  modalName: { fontSize: 24, fontWeight: 'bold', color: '#f1faee', marginBottom: 4 },
  modalPosition: { fontSize: 16, color: '#a8dadc', marginBottom: 8 },
  modalRating: { fontSize: 32, fontWeight: 'bold' },
  
  modalStats: { marginBottom: 24 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#2a3f5f' },
  statLabel: { color: '#a8dadc', fontSize: 14 },
  statValue: { color: '#f1faee', fontSize: 14, fontWeight: '600' },
  
  modalActions: { flexDirection: 'row', gap: 12 },
  modalButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  shareButton: { backgroundColor: '#1e88e5' },
  editButton: { backgroundColor: '#28a745' },
  modalButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});