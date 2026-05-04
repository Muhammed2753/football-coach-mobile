// app/AuthScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, isFirebaseInitialized } from './utils/firebaseConfig';

const AuthScreen = () => {
  const router = useRouter();
  
  // State declarations
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auth handler
  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // TODO: Add your actual Firebase auth logic here
      Alert.alert('Success', isLogin ? 'Logged in successfully!' : 'Account created!');
      router.replace('/');
    } catch (error) {
      Alert.alert('Auth Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Loading state if Firebase isn't ready
  if (!isFirebaseInitialized) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ffd700" />
        <Text style={styles.loadingText}>Initializing Firebase...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* ✅ Emoji placeholder instead of broken image */}
      <Text style={styles.logo}>⚽</Text>
      
      <Text style={styles.title}>⚽ Football Coach</Text>
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
            <Text style={styles.eyeText}>{showPassword ? '👁️' : '🙈'}</Text>
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
            <Text style={styles.buttonText}>{isLogin ? '🔑 Login' : '📝 Sign Up'}</Text>
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
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  // ✅ Text styles for emoji logo
  logo: { 
    fontSize: 80, 
    marginBottom: 20, 
    alignSelf: 'center',
  },
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d1b2a' },
  loadingText: { color: '#a8dadc', marginTop: 12, fontSize: 16 },
});