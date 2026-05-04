import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView, Share } from 'react-native';
// ️ Note: Change to './utils/playerDatabase' if your file is named that instead
import { getAllPlayers, updatePlayer } from '../utils/playerDatabase';

const PlayerCard = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      const data = await getAllPlayers();
      setPlayers(data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load players');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    try {
      await updatePlayer(id, { lastUpdated: new Date().toISOString() });
      Alert.alert('Success', 'Player updated!');
      loadPlayers();
    } catch (error) {
      Alert.alert('Error', 'Failed to update player');
    }
  };

  const handleShare = async (player) => {
    try {
      await Share.share({
        message: `Check out my player: ${player.name} (Overall: ${player.overall})`,
      });
    } catch (error) {
      console.log('Share cancelled');
    }
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
      <Text style={styles.title}>⚽ Player Cards</Text>
      
      {players.length === 0 ? (
        <Text style={styles.emptyText}>No players found. Create one in the Profile screen.</Text>
      ) : (
        players.map((player) => (
          <View key={player.id} style={styles.card}>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.playerInfo}>Position: {player.position || 'N/A'}</Text>
            <Text style={styles.playerInfo}>Overall: {player.overall || 0}</Text>
            
            <View style={styles.actions}>
              <TouchableOpacity style={styles.button} onPress={() => handleShare(player)}>
                <Text style={styles.buttonText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.updateButton]} 
                onPress={() => handleUpdate(player.id)}
              >
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default PlayerCard;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  content: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d1b2a' },
  loadingText: { color: '#a8dadc', fontSize: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#ffd700', marginBottom: 20, textAlign: 'center' },
  emptyText: { color: '#a8dadc', textAlign: 'center', fontSize: 16, marginTop: 40 },
  card: { backgroundColor: '#1b263b', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#2a3f5f' },
  playerName: { fontSize: 20, fontWeight: 'bold', color: '#f1faee', marginBottom: 8 },
  playerInfo: { fontSize: 14, color: '#a8dadc', marginBottom: 4 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  button: { backgroundColor: '#1e88e5', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  updateButton: { backgroundColor: '#4CAF50' },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});