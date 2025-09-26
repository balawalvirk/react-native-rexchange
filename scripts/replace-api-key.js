#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

console.log('🔧 Replacing Firebase API key in app.json...');

// Read app.json
const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Get the Firebase API key from environment variables
const firebaseApiKey = process.env.FirebaseAPIKey;

if (firebaseApiKey) {
  // Replace in web config
  if (appJson.expo.web.config.firebase.apiKey === 'PLACEHOLDER_FIREBASE_API_KEY') {
    appJson.expo.web.config.firebase.apiKey = firebaseApiKey;
    console.log('✅ Replaced web config API key');
  }
  
  // Replace in extra config
  if (appJson.expo.extra.firebaseApiKey === 'PLACEHOLDER_FIREBASE_API_KEY') {
    appJson.expo.extra.firebaseApiKey = firebaseApiKey;
    console.log('✅ Replaced extra config API key');
  }
  
  // Write back to app.json
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  
  console.log('🎉 Firebase API key replaced successfully!');
} else {
  console.log('❌ FirebaseAPIKey not found in .env file');
}
