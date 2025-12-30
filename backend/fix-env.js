#!/usr/bin/env node

/**
 * Fix .env file - ensures proper formatting
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, ".env");

console.log("🔧 Fixing .env file...\n");

// The correct content
const correctContent = `STRIPE_SECRET_KEY=sk_test_51Sc9jdRxyl86VLbPHrB6O8UFYNFsxZnZLx76KzzkqBJqX3VAabfr6uQrZpEqdNFfTKPIN4ZJNX2u1pAYwIJIavXB00A0nFCxwr
FRONTEND_URL=http://localhost:3001
STRIPE_PRICE_ID_SINGLE=price_1SjTv4Rxyl86VLbP8ATY4rol
STRIPE_PRICE_ID_BATCH=price_1SjU1RRxyl86VLbPV14SmISV
STRIPE_PRICE_ID_PRO=price_1SjU3NRxyl86VLbPCD8IHJJB
`;

try {
  // Write the correct content
  writeFileSync(envPath, correctContent.trim() + "\n", "utf-8");
  console.log("✅ .env file has been fixed!");
  console.log("\n📋 Contents:");
  console.log(correctContent);
  console.log("\n💡 Now restart your backend server:");
  console.log("   1. Press Ctrl+C to stop the server");
  console.log("   2. Run: npm run dev");
} catch (error) {
  console.error("❌ Error writing .env file:", error.message);
  console.log("\n💡 Please manually create/update backend/.env with:");
  console.log(correctContent);
}

