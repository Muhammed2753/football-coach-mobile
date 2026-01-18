import { Button, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function PaymentPlaceholder() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payments / VIP Checkout (Placeholder)</Text>
      <Text style={styles.text}>Implement an in-app purchase or external payment flow (Stripe, Paddle, Play/App Stores).</Text>
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0d1b2a', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#f1faee', marginBottom: 8 },
  text: { color: '#a8dadc', textAlign: 'center', marginBottom: 12 },
});
