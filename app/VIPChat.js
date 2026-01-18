import { Button, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function VIPChat() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>VIP Chat (Placeholder)</Text>
      <Text style={styles.text}>This is a placeholder screen for VIP live chat.
      Integrate a real-time chat (e.g., Firebase, Socket.io) for production.</Text>
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0d1b2a', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: '#f1faee', marginBottom: 8 },
  text: { color: '#a8dadc', textAlign: 'center', marginBottom: 12 },
});
