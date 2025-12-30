#!/usr/bin/env node

/**
 * Test Stripe Keys Script
 * 
 * This script tests if your Stripe keys are valid.
 * Run: node test-stripe-keys.js
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

console.log("🔍 Testing Stripe Keys...\n");

if (!secretKey) {
  console.error("❌ No Stripe Secret Key found");
  process.exit(1);
}

console.log("📋 Secret Key:", secretKey.substring(0, 20) + "...");
console.log("   Format:", secretKey.startsWith("sk_test_") ? "✅ Test Key" : secretKey.startsWith("sk_live_") ? "✅ Live Key" : "⚠️  Unknown format");

const stripe = new Stripe(secretKey, {
  apiVersion: "2023-10-16"
});

// Test the key by making a simple API call
console.log("\n🧪 Testing API connection...");

try {
  // Try to list products (this will verify the key works)
  const products = await stripe.products.list({ limit: 1 });
  console.log("✅ Secret Key is VALID and working!");
  console.log(`   Connected to Stripe API successfully`);
  
  // Check if they have any products
  const allProducts = await stripe.products.list({ limit: 10 });
  console.log(`\n📦 Products in your Stripe account: ${allProducts.data.length}`);
  
  if (allProducts.data.length === 0) {
    console.log("\n⚠️  You don't have any products yet!");
    console.log("   → Go to Stripe Dashboard → Products → Add product");
    console.log("   → Create 3 products: Single ($9/mo), Batch ($19/mo), Pro ($39/mo)");
  } else {
    console.log("\n📋 Your products:");
    for (const product of allProducts.data) {
      const prices = await stripe.prices.list({ product: product.id, limit: 1 });
      const price = prices.data[0];
      if (price) {
        const amount = price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : "N/A";
        const interval = price.recurring?.interval || "one-time";
        console.log(`   • ${product.name}: ${price.id} (${amount}/${interval})`);
      } else {
        console.log(`   • ${product.name}: No price set`);
      }
    }
  }
  
  // Check webhooks
  console.log("\n🔔 Checking webhooks...");
  const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
  console.log(`   Webhook endpoints: ${webhooks.data.length}`);
  
  if (webhooks.data.length === 0) {
    console.log("\n⚠️  No webhooks configured!");
    console.log("   For local testing:");
    console.log("   1. Install Stripe CLI: https://stripe.com/docs/stripe-cli");
    console.log("   2. Run: stripe listen --forward-to localhost:3000/billing/webhook");
    console.log("   3. Copy the 'whsec_...' secret it shows");
    console.log("   4. Add to .env as STRIPE_WEBHOOK_SECRET");
  } else {
    console.log("\n📋 Your webhook endpoints:");
    for (const webhook of webhooks.data) {
      console.log(`   • ${webhook.url}`);
      console.log(`     Secret: ${webhook.secret ? webhook.secret.substring(0, 15) + "..." : "Not shown"}`);
    }
  }
  
} catch (error) {
  console.error("\n❌ Error testing Stripe key:");
  console.error("   " + error.message);
  
  if (error.type === "StripeAuthenticationError") {
    console.error("\n💡 This means your secret key is invalid or incorrect.");
    console.error("   → Check that you copied the full key");
    console.error("   → Make sure it starts with 'sk_test_' or 'sk_live_'");
  }
  
  process.exit(1);
}

console.log("\n✨ Test complete!");

