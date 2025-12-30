import User from "../models/User.schema.js";

// Get usage stats (admin only)
export async function getUsage(req, res) {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    // For now, return a simple response
    // You can expand this to return actual usage statistics
    res.json({ 
      message: "Usage statistics",
      userId: req.user.id,
      note: "Usage tracking can be implemented here"
    });
  } catch (error) {
    console.error("Get usage error:", error);
    res.status(500).json({ error: "Failed to fetch usage" });
  }
}

// Set a user as admin (only admins can do this)
export async function setUserAdmin(req, res) {
  try {
    // Only admins can set other users as admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { email, isAdmin } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isAdmin = isAdmin === true;
    await user.save();

    res.json({ 
      message: `User ${email} ${isAdmin ? 'is now' : 'is no longer'} an admin`,
      user: {
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error("Set admin error:", error);
    res.status(500).json({ error: "Failed to update admin status" });
  }
}

// Get all users (admin only)
export async function getAllUsers(req, res) {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const users = await User.find({}).select("-password");
    res.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}
