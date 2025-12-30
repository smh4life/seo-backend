import { PLANS } from "../config/plans.js";

export function requirePlan(feature) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Not authenticated" });

    // Admins bypass all plan restrictions
    if (user.isAdmin === true) {
      return next();
    }

    const plan = PLANS[user.plan];
    if (!plan) return res.status(403).json({ error: "Invalid plan" });

    // For SEO-Pro, check if user has "pro" plan
    if (feature === "pro" || feature === "seoPro") {
      if (user.plan !== "pro") {
        return res.status(403).json({ error: "Pro plan required" });
      }
      return next();
    }

    if (plan[feature] === 0) {
      return res.status(403).json({ error: "Upgrade required" });
    }

    next();
  };
}
