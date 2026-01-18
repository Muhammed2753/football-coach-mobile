// app/HallOfFame.js
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getAllPlayers, deletePlayer, getTotalPlayersCount, filterPlayersByPosition, sortPlayersByRating } from './utils/playerDatabase';

export default function HallOfFame() {
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Load players when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadPlayers();
    }, [])
  );

  const loadPlayers = async () => {
    try {
      const allPlayers = await getAllPlayers();
      const count = await getTotalPlayersCount();
      
      setTotalCount(count);
      applyFilters(allPlayers, selectedFilter, sortBy);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const applyFilters = (playersList, filter, sort) => {
    let result = [...playersList];

    // Apply filter
    if (filter !== 'all') {
      result = result.filter(p => p.positions[0] === filter);
    }

    // Apply sort
    if (sort === 'rating') {
      result.sort((a, b) => b.overall - a.overall);
    } else if (sort === 'age') {
      result.sort((a, b) => a.age - b.age);
    } else {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredPlayers(result);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    applyFilters(players, filter, sortBy);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    applyFilters(players, selectedFilter, sort);
  };

  const handleDelete = (playerId, playerName) => {
    Alert.alert(
      'Delete Player?',
      `Are you sure you want to delete ${playerName}?`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            await deletePlayer(playerId);
            loadPlayers();
            Alert.alert('Success', 'Player deleted!');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleViewPlayer = (playerData) => {
    router.push({
      pathname: '/PlayerCardScreen',
      params: { data: JSON.stringify(playerData) }
    });
  };

  const getRarityColor = (overall) => {
    if (overall >= 86) return '#D4AF37';
    if (overall >= 75) return '#FFD700';
    if (overall >= 65) return '#C0C0C0';
    return '#CD7F32';
  };

  const PlayerItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.playerCard, { borderLeftColor: getRarityColor(item.overall), borderLeftWidth: 5 }]}
      onPress={() => handleViewPlayer(item)}
    >
      <View style={styles.playerHeader}>
        <View>
          <Text style={styles.playerName}>{item.name || 'Anonymous'}</Text>
          <Text style={styles.playerInfo}>
            {item.positions[0]} • Age {item.age}
          </Text>
        </View>
        <Text style={[styles.playerRating, { color: getRarityColor(item.overall) }]}>
          {item.overall}
        </Text>
      </View>

      <View style={styles.playerStats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Club</Text>
          <Text style={styles.statValue}>{item.club || 'N/A'}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Created</Text>
          <Text style={styles.statValue}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.viewBtn}
          onPress={() => handleViewPlayer(item)}
        >
          <Text style={styles.btnText}>👁 View</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id, item.name || 'Player')}
        >
          <Text style={styles.btnText}>🗑 Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Hall of Fame</Text>
        <Text style={styles.subtitle}>Total Players: {totalCount}</Text>
      </View>

      {/* Filter & Sort */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <TouchableOpacity
          style={[styles.filterBtn, selectedFilter === 'all' && styles.filterBtnActive]}
          onPress={() => handleFilterChange('all')}
        >
          <Text style={styles.filterText}>All</Text>
        </TouchableOpacity>
        {['GK', 'CB', 'RB', 'LB', 'CM', 'CAM', 'ST'].map(pos => (
          <TouchableOpacity
            key={pos}
            style={[styles.filterBtn, selectedFilter === pos && styles.filterBtnActive]}
            onPress={() => handleFilterChange(pos)}
          >
            <Text style={styles.filterText}>{pos}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[styles.sortBtn, sortBy === 'recent' && styles.sortBtnActive]}
          onPress={() => handleSortChange('recent')}
        >
          <Text style={styles.sortText}>📅 Recent</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortBtn, sortBy === 'rating' && styles.sortBtnActive]}
          onPress={() => handleSortChange('rating')}
        >
          <Text style={styles.sortText}>⭐ Rating</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortBtn, sortBy === 'age' && styles.sortBtnActive]}
          onPress={() => handleSortChange('age')}
        >
          <Text style={styles.sortText}>🎂 Age</Text>
        </TouchableOpacity>
      </View>

      {/* Players List */}
      {filteredPlayers.length > 0 ? (
        <FlatList
          data={filteredPlayers}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <PlayerItem item={item} />}
          scrollEnabled={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>📭 No players found</Text>
          <Text style={styles.emptySubtext}>Create your first player to get started!</Text>
          <TouchableOpacity 
            style={styles.createBtn}
            onPress={() => router.push('/ProfileForm')}
          >
            <Text style={styles.createBtnText}>➕ Create Player</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backBtn}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1b2a',
  },
  header: {
    padding: 20,
    backgroundColor: '#1e3a5f',
    borderBottomWidth: 2,
    borderBottomColor: '#1e88e5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f1faee',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#a8dadc',
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#162a42',
  },
  filterBtn: {
    backgroundColor: '#1b263b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#1b263b',
  },
  filterBtnActive: {
    backgroundColor: '#1e88e5',
    borderColor: '#FFD700',
  },
  filterText: {
    color: '#f1faee',
    fontSize: 14,
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  sortBtn: {
    flex: 1,
    backgroundColor: '#1b263b',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1b263b',
  },
  sortBtnActive: {
    backgroundColor: '#f57c00',
    borderColor: '#FFD700',
  },
  sortText: {
    color: '#f1faee',
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    padding: 12,
  },
  playerCard: {
    backgroundColor: '#1b263b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1faee',
  },
  playerInfo: {
    fontSize: 14,
    color: '#a8dadc',
    marginTop: 4,
  },
  playerRating: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  playerStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#a8dadc',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    color: '#f1faee',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewBtn: {
    flex: 1,
    backgroundColor: '#1e88e5',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#d32f2f',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 24,
    color: '#f1faee',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#a8dadc',
    marginBottom: 24,
    textAlign: 'center',
  },
  createBtn: {
    backgroundColor: '#1e88e5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  backBtn: {
    backgroundColor: '#1e88e5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
