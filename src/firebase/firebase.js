import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const hasFirebaseEnv =
  Boolean(firebaseConfig.apiKey) &&
  Boolean(firebaseConfig.authDomain) &&
  Boolean(firebaseConfig.projectId) &&
  Boolean(firebaseConfig.appId);

export const isFirebaseConfigured = hasFirebaseEnv;

const canInitFirebase = hasFirebaseEnv || process.env.NODE_ENV === 'test';

const effectiveConfig = hasFirebaseEnv
  ? firebaseConfig
  : {
      // Safe dummy values for test env only
      apiKey: 'test',
      authDomain: 'test.firebaseapp.com',
      projectId: 'test',
      storageBucket: 'test.appspot.com',
      messagingSenderId: 'test',
      appId: 'test',
    };

if (!hasFirebaseEnv && process.env.NODE_ENV !== 'test') {
  // eslint-disable-next-line no-console
  console.warn(
    'Firebase is not configured. Create a .env file with REACT_APP_FIREBASE_* values (see .env.example).'
  );
}

const app = canInitFirebase ? initializeApp(effectiveConfig) : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

// Export config and function to create secondary app for user creation
export { firebaseConfig };

// Create a secondary Firebase app instance for creating users without affecting current session
export const createSecondaryApp = () => {
  if (!hasFirebaseEnv) return null;
  
  // Check if secondary app already exists and delete it
  const existingApps = getApps();
  const existingSecondary = existingApps.find(app => app.name === 'secondary');
  if (existingSecondary) {
    deleteApp(existingSecondary);
  }
  
  return initializeApp(firebaseConfig, 'secondary');
};
