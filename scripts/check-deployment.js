#!/usr/bin/env node

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load environment variables
config({ path: join(rootDir, '.env') });

console.log('🔍 Checking deployment configuration...\n');

// Check required environment variables
const requiredVars = [
    'VITE_BETTER_AUTH_SECRET',
    'VITE_BETTER_AUTH_URL',
    'VITE_GOOGLE_CLIENT_ID',
    'VITE_GOOGLE_CLIENT_SECRET',
    'DATABASE_URL',
];

const optionalVars = [
    'BETTER_AUTH_SECRET',
    'BETTER_AUTH_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NODE_ENV',
];

let hasErrors = false;

console.log('📋 Required Environment Variables:');
requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`✅ ${varName}: Set (${varName.includes('SECRET') ? '***' : value})`);
    } else {
        console.log(`❌ ${varName}: Missing`);
        hasErrors = true;
    }
});

console.log('\n📋 Optional Environment Variables:');
optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`✅ ${varName}: Set (${varName.includes('SECRET') ? '***' : value})`);
    } else {
        console.log(`⚠️  ${varName}: Not set`);
    }
});

// Check if .env file exists
console.log('\n📁 Configuration Files:');
const envPath = join(rootDir, '.env');
if (fs.existsSync(envPath)) {
    console.log('✅ .env file exists');
} else {
    console.log('❌ .env file missing');
    hasErrors = true;
}

// Check OAuth redirect URLs
console.log('\n🔗 OAuth Configuration:');
const authUrl = process.env.VITE_BETTER_AUTH_URL || process.env.BETTER_AUTH_URL;
if (authUrl) {
    console.log(`📍 Base URL: ${authUrl}`);
    console.log(`📍 Google Callback URL: ${authUrl}/api/auth/callback/google`);
    console.log(`📍 GitHub Callback URL: ${authUrl}/api/auth/callback/github`);
    console.log('\n⚠️  Make sure these URLs are added to your OAuth providers:');
    console.log('   - Google: https://console.cloud.google.com/');
    console.log('   - GitHub: https://github.com/settings/developers');
} else {
    console.log('❌ No auth URL configured');
    hasErrors = true;
}

// Summary
console.log('\n📊 Summary:');
if (hasErrors) {
    console.log('❌ Configuration has errors. Please fix them before deploying.');
    process.exit(1);
} else {
    console.log('✅ Configuration looks good!');
    console.log('\n🚀 Next steps:');
    console.log('1. Run `npm run build` to build the application');
    console.log('2. Run `NODE_ENV=production npm start` to start the server');
    console.log('3. Visit your debug endpoint to verify: ' + authUrl + '/api/auth/debug?secret=' + (process.env.VITE_BETTER_AUTH_SECRET || 'YOUR_SECRET'));
}