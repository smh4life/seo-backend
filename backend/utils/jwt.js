import jwt from "jsonwebtoken";

export function signToken(user) {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      plan: user.plan,
      isAdmin: user.isAdmin || false
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}
