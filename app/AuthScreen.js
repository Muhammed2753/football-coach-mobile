import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, isFirebaseInitialized } from '../utils/firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

export default function AuthScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    // Basic validation
    if (!email.trim() || !password.trim() || (!isLogin && !name.trim())) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (!isFirebaseInitialized || !auth) {
      Alert.alert('Configuration Error', 'Firebase is not initialized. Please rebuild the app.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        await AsyncStorage.setItem('user', JSON.stringify({
          email: userCredential.user.email,
          name: userCredential.user.displayName || email.trim(),
        }));
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(userCredential.user, { displayName: name.trim() });
        await AsyncStorage.setItem('user', JSON.stringify({ email: email.trim(), name: name.trim() }));
      }
      router.replace('/');
    } catch (error) {
      console.error('[Auth Error]', error.code, error.message);
      
      const errorMessages = {
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/email-already-in-use': 'An account already exists with this email.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
        'auth/operation-not-allowed': 'Email/password authentication is not enabled in Firebase.',
        'auth/api-key-not-valid': 'Firebase configuration mismatch. Check your .env and rebuild.',
      };
      
      Alert.alert('Authentication Failed', errorMessages[error.code] || error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
        <Text style={styles.title}>âš½ Football Coach</Text>
        <Text style={styles.subtitle}>Your Personal Training Assistant</Text>

        <View style={styles.form}>
          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Password (min 6 characters)"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="current-password"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
            >
              <Text style={styles.eyeText}>{showPassword ? 'ðŸ‘ï¸' : 'ðŸ™ˆ'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{isLogin ? 'ðŸ”‘ Login' : 'ðŸ“ Sign Up'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsLogin(!isLogin)}
            disabled={loading}
          >
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </Text>
          </TouchableOpacity>
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#f1faee', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#a8dadc', textAlign: 'center', marginBottom: 40 },
  form: { gap: 16 },
  input: { backgroundColor: '#1b263b', color: '#f1faee', padding: 16, borderRadius: 8, fontSize: 16 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
  passwordInput: { flex: 1, paddingRight: 50 },
  eyeIcon: { position: 'absolute', right: 12, padding: 8 },
  eyeText: { fontSize: 20 },
  button: { backgroundColor: '#1e88e5', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { backgroundColor: '#5a7a9c' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  switchText: { color: '#a8dadc', textAlign: 'center', marginTop: 16, fontSize: 14 },
});