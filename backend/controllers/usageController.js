import Usage from "../models/Usage.schema.js";

export async function getUsage(req, res) {
  try {
    if (!req.user) {
      return res.json({ single: 0, batch: 0 });
    }
    
    // Get current month usage
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    
    const usage = await Usage.findOne({ 
      userId: req.user.id,
      month: month
    });
    
    if (!usage) {
      return res.json({ single: 0, batch: 0 });
    }
    
    res.json({ single: usage.single || 0, batch: usage.batch || 0 });
  } catch (error) {
    console.error("Get usage error:", error);
    res.json({ single: 0, batch: 0 });
  }
}

export function incrementUsage() {
  return;
}
