// app/AICoachScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, Alert, Modal, TextInput 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AICoachSystem } from './utils/AICoachSystem';
        exercises: []
      }]);
      return;
    }
    
    if (selectedCategory === 'all') {
      const customWithCategory = customQuotes.map(cq => ({
        player: cq.name,
        quote: cq.text,
        category: 'custom',
        isCustom: true
      }));
      filtered = [...filtered, ...customWithCategory];
      console.log(`âž• Added ${customWithCategory.length} custom quotes`);
    }
    
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    const count = Math.min(5, shuffled.length);
    const selected = shuffled.slice(0, count);
    
    console.log(`âœ… Selected ${selected.length} quotes to display`);
    
    const translatedTips = selected.map((q, i) => ({
      id: `quote-${i}-${Date.now()}-${Math.random()}`,
      category: `${q.isCustom ? 'ðŸ“' : getCategoryIcon(q.category)} ${getCategoryLabel(q.category)}`,
      tip: `"${translateQuote(q.quote, selectedLanguage)}"\n\nâ€” ${q.player}`,
      exercises: []
    }));
    
    setTips(translatedTips);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      football: 'âš½', basketball: 'ðŸ€', tennis: 'ðŸŽ¾',
      boxing: 'ðŸ¥Š', athletics: 'ðŸƒ', gymnastics: 'ðŸ¤¸',
      coach: 'ðŸ‘”', business: 'ðŸ’¼', entertainment: 'ðŸŽ¬',
      leadership: 'ðŸ‘‘', wisdom: 'ðŸ“š', motivation: 'ðŸ”¥',
      productivity: 'âš¡', custom: 'ðŸ“'
    };
    return icons[category] || 'ðŸ’­';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      football: t.football, basketball: t.basketball, tennis: t.tennis,
      boxing: t.boxing, athletics: t.athletics, gymnastics: t.gymnastics,
      coach: t.coach, business: t.business, entertainment: t.entertainment,
      leadership: t.leadership, wisdom: t.wisdom, motivation: t.motivation,
      productivity: t.productivity, custom: t.customQuotes
    };
    return labels[category] || category;
  };

  const handleAddQuote = () => {
    if (!newQuoteName.trim() || !newQuoteText.trim()) {
      Alert.alert('Error', t.emptyFieldsError);
      return;
    }

    if (containsProfanity(newQuoteText) || containsProfanity(newQuoteName)) {
      Alert.alert('Error', t.profanityError);
      return;
    }

    const newQuote = {
      id: Date.now().toString(),
      name: newQuoteName.trim(),
      text: newQuoteText.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedQuotes = [...customQuotes, newQuote];
    saveCustomQuotes(updatedQuotes);
    
    setNewQuoteName('');
    setNewQuoteText('');
    setShowAddModal(false);
    
    Alert.alert('Success', t.successMessage);
    
    if (showMotivational && selectedCategory === 'all') {
      loadMotivationalQuotes();
    }
  };

  const handleGoBack = () => {
    try {
      router.back();
    } catch (error) {
      console.log('â¬…ï¸ Back not available, navigating to home');
      router.replace('/');
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ffd700" />
        <Text style={styles.loadingText}>{t.consultingAI}</Text>
      </View>
    );
  }

  // Error state
  if (error && tips.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>{t.errorTitle}</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>{t.tryAgain}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>{t.back}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    // âœ… Wrap in flex container for banner at bottom
    <View style={{ flex: 1, backgroundColor: '#0d1b2a' }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header with Back & Language */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backText}>â† {t.back}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.languageButton}
            onPress={() => setShowLanguagePicker(true)}
          >
            <Text style={styles.languageText}>
              {LANGUAGES.find(l => l.code === selectedLanguage)?.flag} {selectedLanguage.toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.title}>ðŸ§  {t.dailyWisdom}</Text>
        <Text style={styles.subtitle}>{t.inspirationFrom}</Text>

        {/* Category Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryChip,
                selectedCategory === cat.key && styles.categoryChipActive
              ]}
              onPress={() => {
                console.log('ðŸŽ¯ Category selected:', cat.key);
                setSelectedCategory(cat.key);
                if (showMotivational) {
                  loadMotivationalQuotes();
                }
              }}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === cat.key && styles.categoryChipTextActive
              ]}>
                {cat.icon} {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Add Quote Button */}
        <TouchableOpacity 
          style={styles.addQuoteButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addQuoteButtonText}>âœï¸ {t.addQuote}</Text>
        </TouchableOpacity>

        {showMotivational && (
          <View style={styles.motivationalHeader}>
            <Text style={styles.motivationalTitle}>ðŸŒŸ {t.dailyWisdom}</Text>
            <Text style={styles.motivationalSubtitle}>{t.inspirationFrom}</Text>
          </View>
        )}

        {/* Tips/Quotes Display */}
        {tips.length > 0 ? (
          tips.map((tip, idx) => (
            <View key={tip.id || idx} style={styles.tipCard}>
              <Text style={styles.tipCategory}>{tip.category}</Text>
              <Text style={styles.tipMessage}>{tip.tip}</Text>
              {tip.exercises?.length > 0 && (
                <View style={styles.exercises}>
                  {tip.exercises.map((ex, eidx) => (
                    <Text key={eidx} style={styles.exercise}>â€¢ {ex}</Text>
                  ))}
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t.noTipsYet}</Text>
            <Text style={styles.emptySubtext}>{t.createProfile}</Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => router.push('/ProfileForm')}
            >
              <Text style={styles.createButtonText}>{t.createPlayer}</Text>
            </TouchableOpacity>
          </View>
        )}

        {showMotivational && (
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={loadMotivationalQuotes}
          >
            <Text style={styles.refreshButtonText}>{t.refreshQuotes}</Text>
          </TouchableOpacity>
        )}

        {/* Language Picker Modal */}
        <Modal
          visible={showLanguagePicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowLanguagePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t.selectLanguage}</Text>
              {LANGUAGES.map(lang => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageItem,
                    selectedLanguage === lang.code && styles.languageItemActive
                  ]}
                  onPress={() => {
                    saveLanguage(lang.code);
                    setShowLanguagePicker(false);
                    if (showMotivational) loadMotivationalQuotes();
                  }}
                >
                  <Text style={styles.languageItemText}>
                    {lang.flag} {lang.name}
                  </Text>
                  {selectedLanguage === lang.code && <Text style={styles.checkmark}>âœ“</Text>}
                </TouchableOpacity>
              ))}
              <TouchableOpacity 
                style={styles.closeModalButton}
                onPress={() => setShowLanguagePicker(false)}
              >
                <Text style={styles.closeModalText}>{t.cancel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Add Quote Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t.addQuote}</Text>
              
              <Text style={styles.inputLabel}>{t.yourName}</Text>
              <TextInput
                style={styles.input}
                value={newQuoteName}
                onChangeText={setNewQuoteName}
                placeholder="e.g., Your Name"
                placeholderTextColor="#666"
              />
              
              <Text style={styles.inputLabel}>{t.yourQuote}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newQuoteText}
                onChangeText={setNewQuoteText}
                placeholder={t.yourQuote}
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelButtonText}>{t.cancel}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleAddQuote}
                >
                  <Text style={styles.submitButtonText}>{t.submit}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* âœ… Banner Ad - Sticks to bottom, hidden for VIP */}
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  content: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#0d1b2a' },
  loadingText: { color: '#a8dadc', marginTop: 16, fontSize: 16 },
  errorTitle: { fontSize: 20, fontWeight: 'bold', color: '#FF6B6B', marginBottom: 12 },
  errorText: { color: '#a8dadc', textAlign: 'center', marginBottom: 20, fontSize: 14 },
  retryButton: { backgroundColor: '#1e88e5', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, marginBottom: 12 },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  backButton: { paddingVertical: 10, paddingHorizontal: 20 },
  backButtonText: { color: '#a8dadc', fontSize: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backBtn: { padding: 8 },
  backText: { color: '#1e88e5', fontSize: 16, fontWeight: 'bold' },
  languageButton: { backgroundColor: '#1b263b', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  languageText: { color: '#ffd700', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#ffd700', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#a8dadc', marginBottom: 20 },
  categoryScroll: { marginBottom: 16 },
  categoryChip: { 
    backgroundColor: '#1b263b', 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20, 
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2a3f5f'
  },
  categoryChipActive: { backgroundColor: '#ffd700', borderColor: '#ffd700' },
  categoryChipText: { color: '#a8dadc', fontSize: 13, fontWeight: '600' },
  categoryChipTextActive: { color: '#0d1b2a' },
  addQuoteButton: { 
    backgroundColor: '#28a745', 
    padding: 14, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginBottom: 20 
  },
  addQuoteButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  motivationalHeader: { 
    backgroundColor: '#1b263b', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 20, 
    borderLeftWidth: 4, 
    borderLeftColor: '#ffd700' 
  },
  motivationalTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffd700', marginBottom: 4 },
  motivationalSubtitle: { fontSize: 14, color: '#a8dadc' },
  emptyState: { 
    alignItems: 'center', 
    padding: 30, 
    backgroundColor: '#1b263b', 
    borderRadius: 12, 
    marginBottom: 20 
  },
  emptyText: { color: '#f1faee', fontSize: 16, marginBottom: 8, textAlign: 'center' },
  emptySubtext: { color: '#a8dadc', fontSize: 14, textAlign: 'center', marginBottom: 16 },
  createButton: { backgroundColor: '#28a745', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  createButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  tipCard: { 
    backgroundColor: '#1b263b', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#ffd700'
  },
  tipCategory: { fontSize: 14, fontWeight: 'bold', color: '#ffd700', marginBottom: 8 },
  tipMessage: { fontSize: 15, color: '#f1faee', marginBottom: 8, lineHeight: 22, fontStyle: 'italic' },
  exercises: { marginLeft: 10, marginTop: 8 },
  exercise: { fontSize: 13, color: '#a8dadc', marginBottom: 4 },
  refreshButton: { 
    backgroundColor: '#6c5ce7', 
    padding: 14, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginTop: 10 
  },
  refreshButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    backgroundColor: '#1b263b', 
    borderRadius: 16, 
    padding: 24, 
    width: '85%', 
    maxHeight: '80%' 
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#ffd700', marginBottom: 20, textAlign: 'center' },
  inputLabel: { color: '#a8dadc', fontSize: 14, marginBottom: 8, fontWeight: '600' },
  input: { 
    backgroundColor: '#0d1b2a', 
    color: '#f1faee', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a3f5f',
    fontSize: 15
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  modalButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  cancelButton: { backgroundColor: '#6c757d' },
  cancelButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  submitButton: { backgroundColor: '#28a745' },
  submitButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  languageItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 14, 
    backgroundColor: '#0d1b2a', 
    borderRadius: 8, 
    marginBottom: 8 
  },
  languageItemActive: { backgroundColor: '#1e3a5f', borderWidth: 1, borderColor: '#ffd700' },
  languageItemText: { color: '#f1faee', fontSize: 15 },
  checkmark: { color: '#ffd700', fontSize: 20, fontWeight: 'bold' },
  closeModalButton: { 
    backgroundColor: '#6c757d', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginTop: 16 
  },
  closeModalText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});