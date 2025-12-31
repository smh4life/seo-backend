import User from "../models/User.schema.js";
import { signToken } from "../utils/jwt.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Register new user
export async function register(req, res) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name: name || email.split("@")[0]
    });

    // Generate token
    const token = signToken(user);

    // Don't send password back
    const userResponse = { ...user.toObject() };
    delete userResponse.password;

    res.json({ token, user: userResponse });
  } catch (error) {
    console.error("Registration error:", error);
    
    // Provide more specific error messages
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    if (error.message?.includes("connect") || error.message?.includes("buffering") || error.message?.includes("timeout")) {
      return res.status(500).json({ error: "Database not connected. Please set up MongoDB. See MONGODB_SETUP.md for instructions." });
    }
    
    res.status(500).json({ error: error.message || "Registration failed" });
  }
}

// Login user
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if user has a password (for existing users without password)
    if (!user.password) {
      // Legacy user without password - allow login for now, but should set password
      const token = signToken(user);
      const userResponse = { ...user.toObject() };
      delete userResponse.password;
      return res.json({ token, user: userResponse });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate token
    const token = signToken(user);

    // Don't send password back
    const userResponse = { ...user.toObject() };
    delete userResponse.password;

    res.json({ token, user: userResponse });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
}

// Forgot password - generate reset token
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists for security
      return res.json({ message: "If that email exists, a reset link has been sent" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Token expires in 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // In production, send email here with reset link
    // For now, return token in response (remove in production)
    res.json({ 
      message: "Reset token generated",
      resetToken, // Remove this in production - only for testing
      resetUrl: `/reset-password?token=${resetToken}`
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
}

// Reset password - validate token and update password
export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "Token and password required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
}
