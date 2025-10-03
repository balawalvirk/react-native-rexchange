#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Read app.json
const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Replace the Firebase API key with environment variable
if (process.env.FirebaseAPIKey) {
  appJson.expo.web.config.firebase.apiKey = process.env.FirebaseAPIKey;
  appJson.expo.extra.firebaseApiKey = process.env.FirebaseAPIKey;
}

// Write back to app.json
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

console.log('Environment variables replaced in app.json');
