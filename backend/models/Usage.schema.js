import mongoose from "mongoose";

const UsageSchema = new mongoose.Schema({
  userId: String,
  month: Number,
  single: { type: Number, default: 0 },
  batch: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Usage", UsageSchema);
