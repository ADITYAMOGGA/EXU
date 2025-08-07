#!/usr/bin/env node

// Environment Variable Checker for Render Deployment
// Run this script to verify your environment variables are properly set

console.log('🔍 ChatterLite Environment Variables Check\n');

const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_URL', 
  'SUPABASE_ANON_KEY'
];

const optionalVars = [
  'DATABASE_URL',
  'NODE_ENV'
];

let allGood = true;

console.log('📋 Required Environment Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const display = value ? `${value.substring(0, 20)}...` : 'NOT SET';
  console.log(`${status} ${varName}: ${display}`);
  if (!value) allGood = false;
});

console.log('\n📋 Optional Environment Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '⚠️';
  const display = value ? (varName === 'DATABASE_URL' ? 'postgresql://***' : value) : 'NOT SET';
  console.log(`${status} ${varName}: ${display}`);
});

console.log('\n🔗 Supabase Configuration:');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (supabaseUrl) {
  console.log(`✅ Supabase URL format: ${supabaseUrl.includes('.supabase.co') ? 'Valid' : 'Invalid - should end with .supabase.co'}`);
} else {
  console.log('❌ Supabase URL not set');
}

if (supabaseKey) {
  console.log(`✅ Supabase key length: ${supabaseKey.length} characters`);
} else {
  console.log('❌ Supabase key not set');
}

console.log(`\n📊 Overall Status: ${allGood ? '✅ All required variables are set!' : '❌ Missing required variables'}`);

if (!allGood) {
  console.log('\n💡 To fix missing variables:');
  console.log('1. Go to your Render dashboard');
  console.log('2. Select your service');
  console.log('3. Go to Environment Variables');
  console.log('4. Add the missing variables listed above');
  console.log('5. Redeploy your service');
  console.log('\n📖 See RENDER_DEPLOYMENT.md for detailed instructions');
}

process.exit(allGood ? 0 : 1);