import express from "express";
import { stripe } from "../utils/stripe.js";
import { STRIPE_PRICE_IDS } from "../config/plans.js";
import jwt from "jsonwebtoken";
import User from "../models/User.schema.js";
import { applyPlan } from "../controllers/planController.js";

const router = express.Router();

// Create Stripe Checkout Session
router.post("/checkout", async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured. Please set STRIPE_SECRET_KEY in .env" });
    }

    const { plan } = req.body;
    
    // Get user from token if available, otherwise use demo user
    let userId = "demo-user";
    let userEmail = "demo@myseogenerator.com";
    
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token && process.env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id || userId;
        userEmail = decoded.email || userEmail;
      } catch {
        // Invalid token, use demo user
      }
    }

    if (!plan) {
      return res.status(400).json({ error: "Plan required" });
    }

    // Validate plan name
    const validPlans = ["single", "batch", "pro"];
    if (!validPlans.includes(plan.toLowerCase())) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const planKey = plan.toLowerCase();
    const priceId = STRIPE_PRICE_IDS[planKey];
    
    console.log("🔍 Billing checkout request:");
    console.log("   Plan received:", plan);
    console.log("   Plan key:", planKey);
    console.log("   Price ID found:", priceId);
    console.log("   All Price IDs:", STRIPE_PRICE_IDS);
    
    if (!priceId || priceId.startsWith("price_xxxxx")) {
      console.error("❌ Price ID not configured for plan:", planKey);
      return res.status(500).json({ 
        error: "Stripe Price ID not configured. Please set STRIPE_PRICE_ID_" + plan.toUpperCase() + " in .env" 
      });
    }

    // Get or create Stripe customer
    let user = null;
    let customerId = null;
    
    // Try to get user from database if available
    try {
      user = await User.findById(userId);
      customerId = user?.stripeCustomerId;
    } catch (error) {
      // Database not connected, continue without user lookup
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId.toString()
        }
      });
      customerId = customer.id;
      
      // Save customer ID to user if database is available
      try {
        if (!user) {
          user = await User.findByIdAndUpdate(userId, { stripeCustomerId: customerId }, { new: true, upsert: true });
        } else {
          user.stripeCustomerId = customerId;
          await user.save();
        }
      } catch (error) {
        // Database not connected, skip saving
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: "subscription",
      success_url: `${process.env.FRONTEND_URL || "http://localhost:3001"}/dashboard/billing?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3001"}/dashboard/billing?canceled=true`,
      metadata: {
        userId: userId.toString(),
        plan: plan.toLowerCase()
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    res.status(500).json({ error: error.message || "Failed to create checkout session" });
  }
});

// Webhook endpoint for Stripe events
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  if (!stripe) {
    return res.status(500).send("Stripe not configured");
  }

  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("⚠️  STRIPE_WEBHOOK_SECRET not set in .env");
    return res.status(400).send("Webhook secret not configured");
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (userId && plan) {
          await applyPlan(userId, plan);
          
          // Update user with subscription info if available
          if (session.subscription) {
            await User.findByIdAndUpdate(userId, {
              stripeSubscriptionId: session.subscription,
              plan: plan
            });
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Find user by Stripe customer ID
        const user = await User.findOne({ stripeCustomerId: customerId });
        if (user) {
          // Determine plan from price ID
          const priceId = subscription.items.data[0]?.price?.id;
          let plan = "free";
          
          if (priceId === STRIPE_PRICE_IDS.single) plan = "single";
          else if (priceId === STRIPE_PRICE_IDS.batch) plan = "batch";
          else if (priceId === STRIPE_PRICE_IDS.pro) plan = "pro";

          await User.findByIdAndUpdate(user._id, {
            stripeSubscriptionId: subscription.id,
            plan: plan
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Find user and downgrade to free
        const user = await User.findOne({ stripeCustomerId: customerId });
        if (user) {
          await User.findByIdAndUpdate(user._id, {
            plan: "free",
            stripeSubscriptionId: null
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
});

export default router;
