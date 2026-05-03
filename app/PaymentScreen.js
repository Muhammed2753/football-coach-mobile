// app/PaymentScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { startCheckout } from './utils/payment'#fff" />
            : <Text style={styles.payButtonText}>Pay {price} via Stripe</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  header: { padding: 24, backgroundColor: '#1e3a5f', borderBottomWidth: 3, borderBottomColor: '#FFD700' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFD700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#a8dadc', marginBottom: 16 },
  orderSummary: { backgroundColor: '#1b263b', padding: 16, borderRadius: 8 },
  orderText: { color: '#f1faee', fontSize: 14, marginBottom: 4 },
  orderPrice: { color: '#FFD700', fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  form: { padding: 20 },
  securityInfo: { backgroundColor: '#1b5e20', padding: 16, borderRadius: 8, marginBottom: 24 },
  securityTitle: { color: '#a5d6a7', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  securityText: { color: '#a5d6a7', fontSize: 14, marginBottom: 4 },
  payButton: { backgroundColor: '#4CAF50', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  payButtonDisabled: { backgroundColor: '#666' },
  payButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cancelButton: { backgroundColor: '#1e88e5', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  cancelButtonText: { color: '#fff', fontSize: 16 },
});