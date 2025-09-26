#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Restoring placeholders in app.json for security...');

// Read app.json
const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Restore placeholders
if (appJson.expo.web.config.firebase.apiKey && appJson.expo.web.config.firebase.apiKey !== 'PLACEHOLDER_FIREBASE_API_KEY') {
  appJson.expo.web.config.firebase.apiKey = 'PLACEHOLDER_FIREBASE_API_KEY';
  console.log('✅ Restored web config placeholder');
}

// Write back to app.json
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

console.log('🎉 Placeholders restored! Safe to commit to GitHub.');
