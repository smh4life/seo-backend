import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mongoose from "mongoose";
import User from "../models/User.schema.js";

// Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, "..", ".env");
dotenv.config({ path: envPath });

async function setAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("❌ MONGODB_URI not found in .env");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Get email from command line argument
    const email = process.argv[2];
    if (!email) {
      console.error("❌ Please provide an email address");
      console.log("Usage: node scripts/setAdmin.js your-email@example.com");
      process.exit(1);
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`❌ User with email "${email}" not found`);
      process.exit(1);
    }

    // Set as admin
    user.isAdmin = true;
    await user.save();

    console.log(`✅ User "${email}" is now an admin`);
    console.log("   They now have full access to all features without plan restrictions.");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

setAdmin();

