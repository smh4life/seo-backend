import User from "../models/User.schema.js";

export async function applyPlan(userId, plan) {
  await User.findByIdAndUpdate(userId, { plan });
}
