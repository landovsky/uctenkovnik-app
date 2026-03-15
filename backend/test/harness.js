#!/usr/bin/env node

/**
 * Local test harness for DigitalOcean Functions.
 * Usage: node harness.js <function-name> [json-args]
 *
 * Examples:
 *   node harness.js exchange-rate '{"currency":"EUR"}'
 *   node harness.js generate-payment-description '{"restaurantName":"U Fleků","participantName":"Tomáš"}'
 *   node harness.js ocr-receipt '{"image":"<base64>"}'
 *   node harness.js parse-receipt @fixtures/sample-ocr-response.json
 */

const path = require('path');
const fs = require('fs');

const functionName = process.argv[2];
if (!functionName) {
  console.error('Usage: node harness.js <function-name> [json-args | @file.json]');
  console.error('');
  console.error('Available functions:');
  console.error('  ocr-receipt');
  console.error('  parse-receipt');
  console.error('  generate-payment-description');
  console.error('  exchange-rate');
  process.exit(1);
}

const functionDir = path.join(__dirname, '..', 'packages', 'split-bill', functionName);
if (!fs.existsSync(functionDir)) {
  console.error(`Function not found: ${functionName}`);
  console.error(`Expected directory: ${functionDir}`);
  process.exit(1);
}

// Load .env from backend root
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    const value = trimmed.slice(eqIdx + 1);
    process.env[key] = value;
  }
}

// Parse args
let args = {};
const rawArg = process.argv[3];
if (rawArg) {
  if (rawArg.startsWith('@')) {
    const filePath = path.resolve(process.cwd(), rawArg.slice(1));
    args = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } else {
    args = JSON.parse(rawArg);
  }
}

// Inject environment variables (like DigitalOcean Functions does)
const envKeys = [
  'GOOGLE_CREDENTIALS_B64',
  'GOOGLE_PROJECT_ID',
  'GOOGLE_LOCATION',
  'CORS_ORIGIN',
];
for (const key of envKeys) {
  if (process.env[key]) {
    args[key] = process.env[key];
  }
}

// Load and run the function
const fn = require(path.join(functionDir, 'index.js'));

(async () => {
  try {
    const result = await fn.main(args);
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Function threw:', err);
    process.exit(1);
  }
})();
