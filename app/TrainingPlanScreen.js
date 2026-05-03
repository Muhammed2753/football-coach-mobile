// app/TrainingPlanScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { createTrainingPlan, estimateWeeksToGoal, recommendIntensity } from './utils/training'
            transparent={false}
          >
            <ScrollView contentContainerStyle={styles.modalContainer}>
              <TouchableOpacity
                onPress={() => setShowPreview(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>âœ• Close</Text>
              </TouchableOpacity>

              <Text style={styles.planTitle}>{plan.name}</Text>
              <Text style={styles.planSubtitle}>12-Week Progression</Text>

              {/* Estimated Gains */}
              <Text style={styles.gainsTitle}>ðŸ“ˆ Estimated Gains</Text>
              {Object.entries(plan.estimatedGains).map(([attr, gains]) => (
                <View key={attr} style={styles.gainCard}>
                  <Text style={styles.gainAttr}>
                    {attr.replace(/([A-Z])/g, ' $1').trim()}
                  </Text>
                  <View style={styles.gainBar}>
                    <View
                      style={[
                        styles.gainProgress,
                        {
                          width: `${(gains.to / 99) * 100}%`,
                          backgroundColor: gains.gain > 5 ? '#4CAF50' : gains.gain > 2 ? '#FFC107' : '#FF9800',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.gainText}>
                    {gains.from} â†’ {gains.to} (+{gains.gain})
                  </Text>
                </View>
              ))}

              {/* Start Training Button */}
              <TouchableOpacity
                onPress={startTraining}
                style={styles.startButton}
              >
                <Text style={styles.startButtonText}>ðŸš€ Start Training</Text>
              </TouchableOpacity>
            </ScrollView>
          </Modal>
        )}
      </ScrollView>

      {/* âœ… Banner Ad - Sticks to bottom, hidden for VIP */}
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d1b2a',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#a8dadc',
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#a8dadc',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#1e88e5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  container: { padding: 20, backgroundColor: '#0d1b2a', paddingBottom: 40 },
  backButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#1b263b', borderRadius: 8, alignSelf: 'flex-start', marginBottom: 16 },
  backText: { color: '#f1faee', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f1faee', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#a8dadc', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#f1faee', marginTop: 20, marginBottom: 12 },
  intensityGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  intensityButton: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1b263b',
    backgroundColor: '#1b263b',
    marginBottom: 10,
  },
  intensityButtonActive: { borderColor: '#1e88e5', backgroundColor: '#1e88e5' },
  intensityText: { color: '#f1faee', fontSize: 14, fontWeight: '600' },
  intensityDesc: { color: '#a8dadc', fontSize: 12, marginTop: 4 },
  weaknessGrid: { marginBottom: 24 },
  weaknessCard: {
    backgroundColor: '#1b263b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#1b263b',
  },
  weaknessCardActive: { borderColor: '#FFD700', backgroundColor: '#1b263b' },
  weaknessHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  weaknessName: { color: '#f1faee', fontSize: 14, fontWeight: '600' },
  weaknessValue: { color: '#FF6B6B', fontSize: 14, fontWeight: 'bold' },
  weeksEstimate: { color: '#a8dadc', fontSize: 12, marginBottom: 6 },
  checkmark: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' },
  generateButton: { backgroundColor: '#1e88e5', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  generateButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalContainer: { padding: 20, backgroundColor: '#0d1b2a', paddingBottom: 40 },
  closeButton: { alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#1b263b', borderRadius: 8, marginBottom: 16 },
  closeText: { color: '#f1faee', fontSize: 14, fontWeight: '600' },
  planTitle: { fontSize: 28, fontWeight: 'bold', color: '#f1faee', marginBottom: 4 },
  planSubtitle: { fontSize: 16, color: '#a8dadc', marginBottom: 24 },
  gainsTitle: { fontSize: 18, fontWeight: '700', color: '#f1faee', marginBottom: 12 },
  gainCard: { backgroundColor: '#1b263b', borderRadius: 10, padding: 12, marginBottom: 10 },
  gainAttr: { color: '#f1faee', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  gainBar: { height: 8, backgroundColor: '#0d1b2a', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  gainProgress: { height: '100%', borderRadius: 4 },
  gainText: { color: '#a8dadc', fontSize: 12 },
  startButton: { backgroundColor: '#4CAF50', paddingVertical: 16, borderRadius: 10, alignItems: 'center', marginTop: 24 },
  startButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});