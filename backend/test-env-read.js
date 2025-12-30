#!/usr/bin/env node

/**
 * Test if .env file can be read and what it contains
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, ".env");

console.log("🔍 Testing .env file read...\n");
console.log("File path:", envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("❌ Error:", result.error.message);
  process.exit(1);
}

console.log("✅ .env file loaded successfully\n");

console.log("📋 Checking for Stripe variables:\n");

const keys = [
  "STRIPE_SECRET_KEY",
  "FRONTEND_URL",
  "STRIPE_PRICE_ID_SINGLE",
  "STRIPE_PRICE_ID_BATCH",
  "STRIPE_PRICE_ID_PRO"
];

keys.forEach(key => {
  const value = process.env[key];
  if (value) {
    const display = key.includes("SECRET") || key.includes("PRICE_ID")
      ? `${value.substring(0, 20)}...` 
      : value;
    console.log(`✅ ${key}: ${display}`);
  } else {
    console.log(`❌ ${key}: NOT FOUND`);
  }
});

console.log("\n💡 If any show 'NOT FOUND', check your .env file:");
console.log("   1. Make sure the file is named exactly '.env' (with the dot)");
console.log("   2. Make sure there are NO spaces around the = sign");
console.log("   3. Make sure there are NO quotes around values");
console.log("   4. Make sure each variable is on its own line");
console.log("\n📝 Your .env should look exactly like this:\n");
console.log("STRIPE_SECRET_KEY=sk_test_xxxxx");
console.log("FRONTEND_URL=http://localhost:3001");
console.log("STRIPE_PRICE_ID_SINGLE=price_1SjTv4Rxyl86VLbP8ATY4rol");
console.log("STRIPE_PRICE_ID_BATCH=price_1SjU1RRxyl86VLbPV14SmISV");
console.log("STRIPE_PRICE_ID_PRO=price_1SjU3NRxyl86VLbPCD8IHJJB");

