#!/usr/bin/env node

/**
 * Stripe Setup Verification Script
 * 
 * This script helps verify your Stripe configuration.
 * Run: node verify-stripe.js
 */

import Stripe from "stripe";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env
dotenv.config({ path: join(__dirname, ".env") });

const secretKey = process.env.STRIPE_SECRET_KEY;

console.log("🔍 Verifying Stripe Setup...\n");

if (!secretKey) {
  console.error("❌ STRIPE_SECRET_KEY not found in .env");
  console.log("\n💡 Add this to your backend/.env file:");
  console.log("STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY_HERE\n");
  console.log("Get your key from: https://dashboard.stripe.com/apikeys\n");
  process.exit(1);
}

if (!secretKey.startsWith("sk_")) {
  console.error("❌ Invalid Stripe Secret Key format (should start with 'sk_')");
  process.exit(1);
}

console.log("✅ Stripe Secret Key found:", secretKey.substring(0, 20) + "...");

const stripe = new Stripe(secretKey, {
  apiVersion: "2023-10-16"
});

// Check Price IDs
const priceIds = {
  single: process.env.STRIPE_PRICE_ID_SINGLE,
  batch: process.env.STRIPE_PRICE_ID_BATCH,
  pro: process.env.STRIPE_PRICE_ID_PRO
};

console.log("\n📦 Checking Price IDs...");

for (const [plan, priceId] of Object.entries(priceIds)) {
  if (!priceId || priceId.startsWith("price_xxxxx")) {
    console.log(`⚠️  STRIPE_PRICE_ID_${plan.toUpperCase()} not set`);
    console.log(`   → Create "${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan" product in Stripe Dashboard`);
  } else {
    // Verify price exists
    stripe.prices.retrieve(priceId)
      .then(price => {
        console.log(`✅ ${plan.toUpperCase()}: ${priceId}`);
        console.log(`   Product: ${price.product} | Amount: $${(price.unit_amount / 100).toFixed(2)}/${price.recurring?.interval || 'one-time'}`);
      })
      .catch(err => {
        console.log(`❌ ${plan.toUpperCase()}: ${priceId} - Invalid or not found`);
        console.log(`   Error: ${err.message}`);
      });
  }
}

// Check Webhook Secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
console.log("\n🔔 Checking Webhook Secret...");
if (!webhookSecret || webhookSecret.startsWith("whsec_xxxxx")) {
  console.log("⚠️  STRIPE_WEBHOOK_SECRET not set");
  console.log("   → For local: Run 'stripe listen --forward-to localhost:3000/billing/webhook'");
  console.log("   → For production: Set up webhook in Stripe Dashboard");
} else {
  console.log("✅ Webhook Secret found:", webhookSecret.substring(0, 15) + "...");
}

// Check Frontend URL
const frontendUrl = process.env.FRONTEND_URL;
console.log("\n🌐 Frontend URL...");
if (!frontendUrl) {
  console.log("⚠️  FRONTEND_URL not set (defaults to http://localhost:3001)");
} else {
  console.log("✅ Frontend URL:", frontendUrl);
}

console.log("\n✨ Setup complete! Check the warnings above for any missing configuration.");
console.log("\n📖 See ADD_STRIPE_KEYS.md for detailed setup instructions.");

