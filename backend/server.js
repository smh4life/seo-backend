import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import authRoutes from "./routes/auth.js";
import generateRoutes from "./routes/generate.js";
import usageRoutes from "./routes/usage.js";
import billingRoutes from "./routes/billing.js";
import distributorRoutes from "./routes/distributors.js";
import templateRoutes from "./routes/templates.js";
import adminRoutes from "./routes/admin.js";
import { connectMongo } from "./config/mongo.js";

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the backend directory
dotenv.config({ path: join(__dirname, ".env") });

// Check if API key is loaded
if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️  WARNING: OPENAI_API_KEY not found in .env file!");
} else {
  const keyPreview = process.env.OPENAI_API_KEY.trim().substring(0, 7) + "..." + process.env.OPENAI_API_KEY.trim().substring(process.env.OPENAI_API_KEY.trim().length - 4);
  console.log("✅ OpenAI API key loaded:", keyPreview);
}

const app = express();

// Trust proxy for accurate IP addresses (important for free usage tracking)
app.set('trust proxy', true);

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/generate", generateRoutes);
app.use("/usage", usageRoutes);
app.use("/billing", billingRoutes);
app.use("/distributors", distributorRoutes);
app.use("/templates", templateRoutes);
app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectMongo().catch(err => {
  console.error("❌ MongoDB connection error:", err.message);
  console.warn("⚠️  Server will continue but database features may not work");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
