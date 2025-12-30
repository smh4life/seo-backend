import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load .env if not already loaded
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, "..", ".env");

console.log("🔍 Loading .env from:", envPath);
const result = dotenv.config({ path: envPath, override: true });
if (result.error) {
  console.error("❌ Error loading .env:", result.error.message);
} else {
  console.log("✅ .env file loaded");
  // Check if variables exist in the parsed result
  if (result.parsed) {
    console.log("   Variables found in file:", Object.keys(result.parsed).filter(k => k.includes("STRIPE") || k.includes("FRONTEND")));
  }
  console.log("   STRIPE_PRICE_ID_SINGLE from process.env:", process.env.STRIPE_PRICE_ID_SINGLE || "NOT FOUND");
  console.log("   STRIPE_PRICE_ID_BATCH from process.env:", process.env.STRIPE_PRICE_ID_BATCH || "NOT FOUND");
  console.log("   STRIPE_PRICE_ID_PRO from process.env:", process.env.STRIPE_PRICE_ID_PRO || "NOT FOUND");
}

export const PLANS = {
  free: {
    single: 5,
    batch: 0
  },
  single: {
    single: Infinity,
    batch: 0
  },
  batch: {
    single: Infinity,
    batch: Infinity
  },
  pro: {
    single: Infinity,
    batch: Infinity
  }
};

// Map plan names to Stripe Price IDs
// You'll need to replace these with your actual Stripe Price IDs
const singlePrice = process.env.STRIPE_PRICE_ID_SINGLE || "price_xxxxx";
const batchPrice = process.env.STRIPE_PRICE_ID_BATCH || "price_xxxxx";
const proPrice = process.env.STRIPE_PRICE_ID_PRO || "price_xxxxx";

// Debug logging
console.log("🔍 Stripe Price IDs loaded:");
console.log("   SINGLE:", singlePrice);
console.log("   BATCH:", batchPrice);
console.log("   PRO:", proPrice);

export const STRIPE_PRICE_IDS = {
  single: singlePrice, // $9/mo
  batch: batchPrice, // $19/mo
  pro: proPrice // $39/mo
};
