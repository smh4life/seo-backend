#!/usr/bin/env node

/**
 * Interactive Stripe Setup Helper
 * 
 * This script helps you set up your Stripe configuration step by step.
 * Run: node setup-stripe.js
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

const envPath = join(__dirname, ".env");

console.log("🎯 Stripe Setup Helper\n");
console.log("This will help you configure your Stripe billing.\n");

// Check if .env exists
let envContent = "";
if (existsSync(envPath)) {
  envContent = readFileSync(envPath, "utf-8");
  console.log("✅ Found existing .env file\n");
} else {
  console.log("📝 Creating new .env file\n");
}

// Step 1: Secret Key
console.log("Step 1: Stripe Secret Key");
const hasSecretKey = envContent.includes("STRIPE_SECRET_KEY=");
if (hasSecretKey) {
  console.log("✅ STRIPE_SECRET_KEY already set in .env");
} else {
  const addKey = await question("Add your Stripe Secret Key? (y/n): ");
  if (addKey.toLowerCase() === "y") {
    const key = await question("Enter your Stripe Secret Key (sk_test_...): ");
    if (key.trim()) {
      envContent += `\nSTRIPE_SECRET_KEY=${key.trim()}\n`;
      console.log("✅ Secret key added!\n");
    }
  }
}

// Step 2: Frontend URL
console.log("\nStep 2: Frontend URL");
const hasFrontendUrl = envContent.includes("FRONTEND_URL=");
if (hasFrontendUrl) {
  console.log("✅ FRONTEND_URL already set in .env");
} else {
  const url = await question("Enter your frontend URL (default: http://localhost:3001): ");
  envContent += `\nFRONTEND_URL=${url.trim() || "http://localhost:3001"}\n`;
  console.log("✅ Frontend URL added!\n");
}

// Step 3: Price IDs
console.log("\nStep 3: Stripe Price IDs");
console.log("You need to create 3 products in Stripe Dashboard first.");
console.log("Go to: https://dashboard.stripe.com/test/products\n");

const plans = [
  { name: "SINGLE", price: "$9/month", envKey: "STRIPE_PRICE_ID_SINGLE" },
  { name: "BATCH", price: "$19/month", envKey: "STRIPE_PRICE_ID_BATCH" },
  { name: "PRO", price: "$39/month", envKey: "STRIPE_PRICE_ID_PRO" }
];

for (const plan of plans) {
  const hasPriceId = envContent.includes(`${plan.envKey}=`);
  if (hasPriceId) {
    console.log(`✅ ${plan.name} Price ID already set`);
  } else {
    console.log(`\n${plan.name} Plan (${plan.price}):`);
    const priceId = await question(`Enter Price ID for ${plan.name} (or press Enter to skip): `);
    if (priceId.trim() && priceId.startsWith("price_")) {
      envContent += `\n${plan.envKey}=${priceId.trim()}\n`;
      console.log(`✅ ${plan.name} Price ID added!`);
    } else if (priceId.trim()) {
      console.log("⚠️  Price ID should start with 'price_' - skipping");
    }
  }
}

// Step 4: Webhook Secret
console.log("\n\nStep 4: Webhook Secret");
const hasWebhook = envContent.includes("STRIPE_WEBHOOK_SECRET=");
if (hasWebhook) {
  console.log("✅ STRIPE_WEBHOOK_SECRET already set in .env");
} else {
  console.log("For local testing, run: stripe listen --forward-to localhost:3000/billing/webhook");
  const webhookSecret = await question("Enter webhook secret (whsec_...) or press Enter to skip: ");
  if (webhookSecret.trim() && webhookSecret.startsWith("whsec_")) {
    envContent += `\nSTRIPE_WEBHOOK_SECRET=${webhookSecret.trim()}\n`;
    console.log("✅ Webhook secret added!");
  } else if (webhookSecret.trim()) {
    console.log("⚠️  Webhook secret should start with 'whsec_' - skipping");
  }
}

// Save .env file
writeFileSync(envPath, envContent.trim() + "\n", "utf-8");

console.log("\n✅ .env file updated!");
console.log("\n📋 Summary:");
console.log("   - Secret Key:", envContent.includes("STRIPE_SECRET_KEY=") ? "✅ Set" : "❌ Missing");
console.log("   - Frontend URL:", envContent.includes("FRONTEND_URL=") ? "✅ Set" : "❌ Missing");
console.log("   - Single Price ID:", envContent.includes("STRIPE_PRICE_ID_SINGLE=") ? "✅ Set" : "❌ Missing");
console.log("   - Batch Price ID:", envContent.includes("STRIPE_PRICE_ID_BATCH=") ? "✅ Set" : "❌ Missing");
console.log("   - Pro Price ID:", envContent.includes("STRIPE_PRICE_ID_PRO=") ? "✅ Set" : "❌ Missing");
console.log("   - Webhook Secret:", envContent.includes("STRIPE_WEBHOOK_SECRET=") ? "✅ Set" : "❌ Missing");

console.log("\n💡 Next steps:");
if (!envContent.includes("STRIPE_PRICE_ID_SINGLE=")) {
  console.log("   1. Create products in Stripe Dashboard");
  console.log("   2. Run this script again to add Price IDs");
}
if (!envContent.includes("STRIPE_WEBHOOK_SECRET=")) {
  console.log("   3. Set up webhook using Stripe CLI");
  console.log("   4. Run this script again to add webhook secret");
}

console.log("\n📖 See SIMPLE_STRIPE_SETUP.md for detailed instructions\n");

rl.close();

