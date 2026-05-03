import { initializeApp } from 'firebase/app';
import { getAuth } from './utils/firebaseConfig', error);
}
// ... inside app/utils/firebaseConfig.js

// Add this line to define the variable
const isFirebaseInitialized = !!app;

// Update the export to include it
export { app, auth, db, isFirebaseInitialized };