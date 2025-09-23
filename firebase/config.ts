// Import the functions you need from the SDKs you need
import 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const stagingConfig = {
  apiKey: 'AIzaSyDs7RuBJgNQd_XgJ-OXp2C8X4iJxbb_JMQ',
  authDomain: 'rexchange-bfb0a.firebaseapp.com',
  databaseURL: 'https://rexchange-bfb0a-default-rtdb.firebaseio.com',
  projectId: 'rexchange-bfb0a',
  storageBucket: 'rexchange-bfb0a.appspot.com',
  messagingSenderId: '1095278331470',
  appId: '1:1095278331470:web:039d4ff7cdb629f787e51f',
  measurementId: 'G-QE82SG7T4T',
};

export const productionConfig = {
  apiKey: 'AIzaSyBs3hByLOE-3EvmLXWC4Fu3b5aYvXbGn-I',
  authDomain: 'rexchange-bfb0a.firebaseapp.com',
  databaseURL: 'https://rexchange-bfb0a-default-rtdb.firebaseio.com',
  projectId: 'rexchange-bfb0a',
  storageBucket: 'rexchange-bfb0a.appspot.com',
  messagingSenderId: '546177265088',
  appId: '1:546177265088:web:55db92a0a4ec1c956eec25',
  measurementId: 'G-04X6EQYGCW',
};

const app = initializeApp(productionConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
// Initialize Firebase

export default app;
