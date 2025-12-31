import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  password: String, // Hashed password
  plan: { type: String, default: "free" },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  isAdmin: { type: Boolean, default: false }, // Admin users bypass all plan restrictions
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
