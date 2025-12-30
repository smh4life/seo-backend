#!/usr/bin/env node

/**
 * Pre-Deployment Checklist Script
 * Run this before deploying to production
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const checks = {
  backend: [],
  frontend: [],
  general: []
};

// Check backend .env
const backendEnvPath = join(__dirname, 'backend', '.env');
if (existsSync(backendEnvPath)) {
  const envContent = readFileSync(backendEnvPath, 'utf-8');
  
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'OPENAI_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_PRICE_ID_SINGLE',
    'STRIPE_PRICE_ID_BATCH',
    'STRIPE_PRICE_ID_PRO',
    'FRONTEND_URL'
  ];
  
  requiredVars.forEach(varName => {
    const hasVar = envContent.includes(`${varName}=`) && 
                   !envContent.match(new RegExp(`${varName}=\\s*$`)) &&
                   !envContent.match(new RegExp(`${varName}=your_`));
    
    checks.backend.push({
      name: varName,
      status: hasVar ? '✅' : '❌',
      message: hasVar ? 'Set' : 'Missing or placeholder'
    });
  });
  
  // Check if using test keys
  if (envContent.includes('STRIPE_SECRET_KEY=sk_test_')) {
    checks.backend.push({
      name: 'Stripe Keys',
      status: '⚠️',
      message: 'Using TEST keys - switch to LIVE keys for production!'
    });
  } else if (envContent.includes('STRIPE_SECRET_KEY=sk_live_')) {
    checks.backend.push({
      name: 'Stripe Keys',
      status: '✅',
      message: 'Using LIVE keys'
    });
  }
  
  // Check FRONTEND_URL
  if (envContent.includes('FRONTEND_URL=http://localhost')) {
    checks.backend.push({
      name: 'FRONTEND_URL',
      status: '⚠️',
      message: 'Still pointing to localhost - update to https://myseogenerator.com'
    });
  }
} else {
  checks.backend.push({
    name: '.env file',
    status: '❌',
    message: 'backend/.env file not found'
  });
}

// Check frontend .env.local
const frontendEnvPath = join(__dirname, 'frontend', '.env.local');
if (existsSync(frontendEnvPath)) {
  const envContent = readFileSync(frontendEnvPath, 'utf-8');
  
  if (envContent.includes('NEXT_PUBLIC_API_URL=http://localhost')) {
    checks.frontend.push({
      name: 'NEXT_PUBLIC_API_URL',
      status: '⚠️',
      message: 'Still pointing to localhost - update to production backend URL'
    });
  } else if (envContent.includes('NEXT_PUBLIC_API_URL=')) {
    checks.frontend.push({
      name: 'NEXT_PUBLIC_API_URL',
      status: '✅',
      message: 'Set (will be overridden by Vercel env vars)'
    });
  } else {
    checks.frontend.push({
      name: 'NEXT_PUBLIC_API_URL',
      status: '⚠️',
      message: 'Not set - will need to set in Vercel dashboard'
    });
  }
} else {
  checks.frontend.push({
    name: '.env.local',
    status: 'ℹ️',
    message: 'Not required - set env vars in Vercel dashboard instead'
  });
}

// Check favicon
const faviconPath = join(__dirname, 'frontend', 'public', 'favicon_io', 'Picture.png');
if (existsSync(faviconPath)) {
  checks.general.push({
    name: 'Favicon',
    status: '✅',
    message: 'Picture.png exists'
  });
} else {
  checks.general.push({
    name: 'Favicon',
    status: '❌',
    message: 'Picture.png not found in frontend/public/favicon_io/'
  });
}

// Check package.json files
const backendPkg = join(__dirname, 'backend', 'package.json');
const frontendPkg = join(__dirname, 'frontend', 'package.json');

if (existsSync(backendPkg)) {
  checks.general.push({
    name: 'Backend package.json',
    status: '✅',
    message: 'Exists'
  });
} else {
  checks.general.push({
    name: 'Backend package.json',
    status: '❌',
    message: 'Missing'
  });
}

if (existsSync(frontendPkg)) {
  checks.general.push({
    name: 'Frontend package.json',
    status: '✅',
    message: 'Exists'
  });
} else {
  checks.general.push({
    name: 'Frontend package.json',
    status: '❌',
    message: 'Missing'
  });
}

// Print results
console.log('\n📋 Pre-Deployment Checklist\n');
console.log('='.repeat(50));

console.log('\n🔧 Backend Environment Variables:');
checks.backend.forEach(check => {
  console.log(`  ${check.status} ${check.name}: ${check.message}`);
});

console.log('\n🎨 Frontend Environment Variables:');
checks.frontend.forEach(check => {
  console.log(`  ${check.status} ${check.name}: ${check.message}`);
});

console.log('\n📦 General Checks:');
checks.general.forEach(check => {
  console.log(`  ${check.status} ${check.name}: ${check.message}`);
});

// Summary
const allChecks = [...checks.backend, ...checks.frontend, ...checks.general];
const passed = allChecks.filter(c => c.status === '✅').length;
const failed = allChecks.filter(c => c.status === '❌').length;
const warnings = allChecks.filter(c => c.status === '⚠️').length;

console.log('\n' + '='.repeat(50));
console.log(`\n📊 Summary:`);
console.log(`  ✅ Passed: ${passed}`);
console.log(`  ⚠️  Warnings: ${warnings}`);
console.log(`  ❌ Failed: ${failed}`);

if (failed === 0 && warnings === 0) {
  console.log('\n🎉 All checks passed! Ready to deploy.\n');
} else if (failed === 0) {
  console.log('\n⚠️  Some warnings - review before deploying.\n');
} else {
  console.log('\n❌ Please fix the issues above before deploying.\n');
}

