import User from "../models/User.schema.js";
import { signToken } from "../utils/jwt.js";
import bcrypt from "bcryptjs";

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
