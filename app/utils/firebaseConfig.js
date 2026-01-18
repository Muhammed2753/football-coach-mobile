// app/utils/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// 👇 PASTE YOUR REAL CONFIG HERE
const firebaseConfig = {
  apiKey: "AIzaSyAhrMqVZF-Lp2BClJhuy35YZdjyA04G3O4",
  authDomain: "football-coach-chat.firebaseapp.com",
  projectId: "football-coach-chat",
  storageBucket: "football-coach-chat.firebasestorage.app",
  messagingSenderId: "209404760071",
  appId: "1:209404760071:web:d54f1da1cd76350a029aa2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 👇 Connect to local emulator ONLY in development
if (__DEV__) {
  connectFirestoreEmulator(db, 'localhost', 8080);
}

export { db };