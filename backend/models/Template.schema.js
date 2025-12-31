import mongoose from "mongoose";

const TemplateSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ["blog", "product"] },
  rules: { type: Object, default: {} }
}, { timestamps: true });

export default mongoose.model("Template", TemplateSchema);

