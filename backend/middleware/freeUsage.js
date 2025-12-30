// Track free usage for unauthenticated users
// Simple in-memory store (in production, use Redis or database)
const freeUsageStore = new Map(); // IP -> count

const FREE_SINGLE_LIMIT = 5;

// Get client identifier (IP address)
function getClientId(req) {
  return req.ip || req.connection.remoteAddress || 'unknown';
}

// Check if user has free uses remaining
export function checkFreeUsage(feature) {
  return (req, res, next) => {
    // If user is authenticated, skip free usage check (they have a plan)
    if (req.user) {
      return next();
    }

    // For unauthenticated users, check free usage
    if (feature === 'single') {
      const clientId = getClientId(req);
      const currentCount = freeUsageStore.get(clientId) || 0;
      
      if (currentCount >= FREE_SINGLE_LIMIT) {
        return res.status(403).json({ 
          error: "Free limit reached",
          message: "You've used all 5 free generates. Please sign up for unlimited access.",
          remaining: 0,
          limit: FREE_SINGLE_LIMIT
        });
      }

      // Increment usage count
      freeUsageStore.set(clientId, currentCount + 1);
      
      // Add remaining count to response
      req.freeUsageRemaining = FREE_SINGLE_LIMIT - (currentCount + 1);
      return next();
    }

    // For batch and seo-pro, require authentication
    return res.status(401).json({ 
      error: "Authentication required",
      message: "Please sign up or log in to use this feature."
    });
  };
}

// Get remaining free uses (for frontend display)
export function getFreeUsageRemaining(req) {
  if (req.user) {
    return null; // Authenticated users don't have free usage limits
  }
  
  const clientId = getClientId(req);
  const currentCount = freeUsageStore.get(clientId) || 0;
  return Math.max(0, FREE_SINGLE_LIMIT - currentCount);
}

// Reset free usage (for testing or admin)
export function resetFreeUsage(clientId) {
  if (clientId) {
    freeUsageStore.delete(clientId);
  } else {
    freeUsageStore.clear();
  }
}

