// app/VideoCallScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function VideoCallScreen() {
  const router = useRouter();
  const [isCalling, setIsCalling] = useState(false);

  const startVideoCall = async () => {
    setIsCalling(true);
    try {
      // In production, you'd generate a Twilio token from your backend
      // For now, we'll simulate a call
      alert('ðŸ“ž Connecting to coach... (In production, this would start a real video call!)');
      setTimeout(() => {
        setIsCalling(false);
        alert('âœ… Call connected!');
      }, 2000);
    } catch (error) {
      alert('âŒ Failed to start call');
      setIsCalling(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ðŸŽ¥ VIP Video Call</Text>
      <Text style={styles.subtitle}>Connect with your coach face-to-face!</Text>
      
      <TouchableOpacity 
        style={[styles.callButton, isCalling && styles.disabledButton]} 
        onPress={startVideoCall}
        disabled={isCalling}
      >
        <Text style={styles.callButtonText}>
          {isCalling ? 'Connecting...' : 'Start Video Call'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>â† Back to Chat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0d1b2a', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f1faee', textAlign: 'center' },
  subtitle: { color: '#a8dadc', textAlign: 'center', marginVertical: 16, fontSize: 16 },
  callButton: { 
    backgroundColor: '#d32f2f', 
    padding: 20, 
    borderRadius: 12, 
    alignItems: 'center',
    marginVertical: 20
  },
  disabledButton: { opacity: 0.7 },
  callButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  backButton: { 
    padding: 12, 
    backgroundColor: '#1e88e5', 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  backText: { color: '#fff', fontSize: 16 }
});