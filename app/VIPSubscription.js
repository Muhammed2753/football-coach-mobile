// app/VIPSubscription.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { startCheckout } from './utils/payment'#fff" /> : <Text style={styles.subscribeText}>Subscribe Monthly - $4.99</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subscribeButton, styles.yearlyButton, loading && styles.disabledButton]}
          onPress={() => handleSubscribe('Yearly')}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.subscribeText}>Subscribe Yearly - $39.99 ðŸ”¥ Save 33%</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  header: { padding: 20, alignItems: 'center' },
  backButton: { color: '#1e88e5', fontSize: 16, fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ffd700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#a8dadc', textAlign: 'center' },
  benefitsSection: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#f1faee', marginBottom: 16 },
  benefitItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  benefitIcon: { fontSize: 20, marginRight: 12, width: 30 },
  benefitText: { fontSize: 16, color: '#a8dadc', flex: 1 },
  plansSection: { padding: 20 },
  planCard: { backgroundColor: '#1a2332', borderRadius: 12, padding: 20, marginBottom: 16, borderWidth: 2, borderColor: 'transparent' },
  popularPlan: { borderColor: '#1e88e5', position: 'relative' },
  popularBadge: { position: 'absolute', top: -10, right: 20, backgroundColor: '#1e88e5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  popularText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  planTitle: { fontSize: 20, fontWeight: 'bold', color: '#f1faee', marginBottom: 8 },
  planPrice: { fontSize: 24, fontWeight: 'bold', color: '#ffd700', marginBottom: 4 },
  planSavings: { fontSize: 14, color: '#28a745', fontWeight: '600', marginBottom: 8 },
  planDesc: { fontSize: 14, color: '#a8dadc' },
  buttonSection: { padding: 20 },
  subscribeButton: { backgroundColor: '#1e88e5', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  yearlyButton: { backgroundColor: '#28a745' },
  subscribeText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disabledButton: { opacity: 0.6 },
});