#!/usr/bin/env node

/**
 * Quick script to check if .env file has Stripe keys
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync, existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, ".env");

console.log("🔍 Checking .env file...\n");
console.log("Location:", envPath);
console.log("Exists:", existsSync(envPath) ? "✅ Yes" : "❌ No\n");

if (!existsSync(envPath)) {
  console.log("❌ .env file not found!");
  console.log("   Create it in:", envPath);
  process.exit(1);
}

// Load .env
dotenv.config({ path: envPath });

// Check for Stripe keys
console.log("\n📋 Stripe Configuration:\n");

const secretKey = process.env.STRIPE_SECRET_KEY;
console.log("STRIPE_SECRET_KEY:", secretKey ? `✅ Set (${secretKey.substring(0, 20)}...)` : "❌ Missing");

const frontendUrl = process.env.FRONTEND_URL;
console.log("FRONTEND_URL:", frontendUrl ? `✅ Set (${frontendUrl})` : "❌ Missing");

const priceSingle = process.env.STRIPE_PRICE_ID_SINGLE;
console.log("STRIPE_PRICE_ID_SINGLE:", priceSingle ? `✅ Set (${priceSingle})` : "❌ Missing");

const priceBatch = process.env.STRIPE_PRICE_ID_BATCH;
console.log("STRIPE_PRICE_ID_BATCH:", priceBatch ? `✅ Set (${priceBatch})` : "❌ Missing");

const pricePro = process.env.STRIPE_PRICE_ID_PRO;
console.log("STRIPE_PRICE_ID_PRO:", pricePro ? `✅ Set (${pricePro})` : "❌ Missing");

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
console.log("STRIPE_WEBHOOK_SECRET:", webhookSecret ? `✅ Set (${webhookSecret.substring(0, 15)}...)` : "⚠️  Not set (optional for testing)");

// Try to read the file directly to see what's actually in it
console.log("\n📄 Contents of .env file (first 500 chars):\n");
try {
  const content = readFileSync(envPath, "utf-8");
  const lines = content.split("\n").filter(line => line.trim() && !line.trim().startsWith("#"));
  console.log("Non-comment lines found:", lines.length);
  lines.forEach((line, i) => {
    if (line.includes("STRIPE") || line.includes("FRONTEND")) {
      const key = line.split("=")[0];
      const value = line.split("=")[1]?.substring(0, 30) || "";
      console.log(`   ${i + 1}. ${key}=${value}...`);
    }
  });
} catch (error) {
  console.log("Could not read file:", error.message);
}

console.log("\n✨ Check complete!");

