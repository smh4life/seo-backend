#!/usr/bin/env node

/**
 * Direct .env verification - reads the file directly
 */

import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, ".env");

console.log("🔍 Direct .env file check\n");
console.log("File path:", envPath);
console.log("Exists:", existsSync(envPath) ? "✅ Yes" : "❌ No\n");

if (!existsSync(envPath)) {
  console.log("❌ .env file not found!");
  process.exit(1);
}

try {
  const content = readFileSync(envPath, "utf-8");
  console.log("\n📄 File contents:\n");
  console.log(content);
  
  console.log("\n📋 Parsed values:\n");
  const lines = content.split("\n");
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      const value = valueParts.join("=");
      if (key && value) {
        console.log(`${key}=${value.substring(0, 30)}${value.length > 30 ? "..." : ""}`);
      }
    }
  });
  
  // Check for required keys
  console.log("\n✅ Required keys check:\n");
  const hasSecret = content.includes("STRIPE_SECRET_KEY=");
  const hasSingle = content.includes("STRIPE_PRICE_ID_SINGLE=");
  const hasBatch = content.includes("STRIPE_PRICE_ID_BATCH=");
  const hasPro = content.includes("STRIPE_PRICE_ID_PRO=");
  const hasFrontend = content.includes("FRONTEND_URL=");
  
  console.log("STRIPE_SECRET_KEY:", hasSecret ? "✅" : "❌");
  console.log("STRIPE_PRICE_ID_SINGLE:", hasSingle ? "✅" : "❌");
  console.log("STRIPE_PRICE_ID_BATCH:", hasBatch ? "✅" : "❌");
  console.log("STRIPE_PRICE_ID_PRO:", hasPro ? "✅" : "❌");
  console.log("FRONTEND_URL:", hasFrontend ? "✅" : "❌");
  
} catch (error) {
  console.error("❌ Error reading file:", error.message);
}

