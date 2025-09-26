// Firebase configuration for Rexchange CMS
import { env } from './config/env';

export const firebaseConfig = {
  apiKey: env.firebaseApiKey, // Use environment variable
  authDomain: "rexchange-bfb0a.firebaseapp.com",
  databaseURL: "https://rexchange-bfb0a-default-rtdb.firebaseio.com",
  projectId: "rexchange-bfb0a",
  storageBucket: "rexchange-bfb0a.appspot.com",
  messagingSenderId: "546177265088",
  appId: "1:546177265088:web:55db92a0a4ec1c956eec25",
  measurementId: "G-04X6EQYGCW"
};

// HomeJunction Slipstream API - Use PUBLIC token for client-side (mobile app)

export const HOME_JUNCTION_API_KEY = 's9-1359cee2-1f4e-44b2-af52-ba3f959a4998';
export const HOME_JUNCTION_PRODUCT = 'rexchange';
export const HOME_JUNCTION_SITE = 'wisemoverealestate.com';
export const ADMIN_KEY = "placeholder-admin-key";