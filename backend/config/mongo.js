import mongoose from "mongoose";

export async function connectMongo() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn("⚠️ MONGO_URI not set. Running without DB.");
    console.warn("   Registration/login will not work without MongoDB.");
    console.warn("   See MONGODB_SETUP.md for setup instructions.");
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 10s
    });
    console.log("🗄️ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.warn("   Registration/login will not work.");
    console.warn("   Check your MONGO_URI in .env file.");
  }
}
