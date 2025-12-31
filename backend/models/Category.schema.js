import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  path: { type: String, required: true }, // e.g., "Electronics/Audio/Headphones"
  keywords: [{ type: String }], // Keywords for matching: ["headphone", "earphone", "audio"]
  parentPath: { type: String, default: "" }, // Parent category path
  description: { type: String, default: "" } // Optional description
}, { timestamps: true });

// Index for faster lookups
CategorySchema.index({ userId: 1, path: 1 });

export default mongoose.model("Category", CategorySchema);

