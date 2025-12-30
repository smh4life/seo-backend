import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                // requests per IP per window
  standardHeaders: true,
  legacyHeaders: false
});
