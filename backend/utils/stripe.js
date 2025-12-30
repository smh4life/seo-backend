import Stripe from "stripe";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load .env if not already loaded
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  console.warn("⚠️  WARNING: STRIPE_SECRET_KEY not found in .env file!");
  console.warn("   Billing features will not work without a Stripe secret key.");
}

export const stripe = secretKey 
  ? new Stripe(secretKey, {
      apiVersion: "2023-10-16"
    })
  : null;
