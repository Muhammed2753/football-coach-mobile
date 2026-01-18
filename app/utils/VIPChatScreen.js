// app/VIPChatScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { db } from '../utils/firebaseConfig';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useRouter } from 'expo-router';

export default function VIPChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔥 Listen for real-time messages
  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
    }, (error) => {
      Alert.alert('Error', 'Failed to load chat: ' + error.message);
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        sender: 'Player',
        timestamp: new Date(),
      });
      setNewMessage('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
    setLoading(false);
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.sender === 'Player' ? styles.playerMessage : styles.coachMessage
    ]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💬 VIP Coach Chat</Text>
      
      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        inverted
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask your coach anything..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, loading && styles.disabledButton]}
          onPress={sendMessage}
          disabled={loading}
        >
          <TouchableOpacity 
              style={styles.videoButton} 
              onPress={() => router.push('/VideoCallScreen')}
          >
            <Text style={styles.videoButtonText}>🎥 Start Video Call</Text>
          </TouchableOpacity>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>← Back to Card</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0d1b2a' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#f1faee', textAlign: 'center', marginBottom: 16 },
  messagesContainer: { paddingVertical: 16 },
  messageBubble: { 
    maxWidth: '80%', 
    padding: 12, 
    borderRadius: 12, 
    marginVertical: 4,
    alignSelf: 'flex-start'
  },
  playerMessage: { 
    backgroundColor: '#1e88e5', 
    alignSelf: 'flex-end' 
  },
  coachMessage: { 
    backgroundColor: '#4361ee' 
  },
  messageText: { color: '#fff', fontSize: 16 },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    marginBottom: 16 
  },
  videoButton: { 
  backgroundColor: '#d32f2f', 
  padding: 12, 
  borderRadius: 8, 
  alignItems: 'center',
  marginTop: 16
},
videoButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  input: { 
    flex: 1, 
    backgroundColor: '#1b263b', 
    color: '#f1faee', 
    padding: 12, 
    borderRadius: 8, 
    maxHeight: 100 
  },
  sendButton: { 
    backgroundColor: '#d32f2f', 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderRadius: 8, 
    marginLeft: 8 
  },
  disabledButton: { opacity: 0.5 },
  sendButtonText: { color: '#fff', fontWeight: '600' },
  backButton: { 
    padding: 12, 
    backgroundColor: '#1e88e5', 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  backText: { color: '#fff', fontSize: 16 }
});