import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let app, auth, db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  const maskKey = (k = '') => (k ? `${k.slice(0,6)}...${k.slice(-4)}` : '<missing>');
  console.log('✅ Firebase initialized successfully');
  console.log('  • apiKey:', maskKey(firebaseConfig.apiKey));
  console.log('  • authDomain:', firebaseConfig.authDomain || '<missing>');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  // Fallback to offline mode
  app = null;
  auth = null;
  db = null;
}

const isFirebaseInitialized = !!app;

export { app, auth, db, isFirebaseInitialized, firebaseConfig };