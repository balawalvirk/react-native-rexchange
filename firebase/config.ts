// Import the functions you need from the SDKs you need
import 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// Firebase API key
const FIREBASE_API_KEY = "AIzaSyBB0Qv0kNZx0SawGXWoSGQAY8Q7FRyvYUY";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const stagingConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: 'rexchange-bfb0a.firebaseapp.com',
  databaseURL: 'https://rexchange-bfb0a-default-rtdb.firebaseio.com',
  projectId: 'rexchange-bfb0a',
  storageBucket: 'rexchange-bfb0a.appspot.com',
  messagingSenderId: '1095278331470',
  appId: '1:1095278331470:web:039d4ff7cdb629f787e51f',
  measurementId: 'G-QE82SG7T4T',
};

export const productionConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: 'rexchange-bfb0a.firebaseapp.com',
  databaseURL: 'https://rexchange-bfb0a-default-rtdb.firebaseio.com',
  projectId: 'rexchange-bfb0a',
  storageBucket: 'rexchange-bfb0a.appspot.com',
  messagingSenderId: '546177265088',
  appId: '1:546177265088:web:55db92a0a4ec1c956eec25',
  measurementId: 'G-04X6EQYGCW',
};

// Initialize Firebase app only if it doesn't exist
const app = getApps().length === 0 ? initializeApp(productionConfig) : getApp();

// Initialize Auth with React Native persistence
let auth;
try {
  // Always try to initialize with React Native persistence first
  console.log('🔧 Initializing Firebase Auth with React Native persistence...');
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
  console.log('✅ Firebase Auth initialized with persistence');
} catch (error) {
  // If initialization fails (auth already exists), get the existing instance
  console.log('⚠️ Auth already initialized, getting existing instance:', error.message);
  auth = getAuth(app);
  console.log('📱 Using existing auth instance');
}

export { auth };
export default app;
