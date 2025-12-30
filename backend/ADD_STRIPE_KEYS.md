# Quick Stripe Setup

## ✅ What I Found in Your File

I found your Stripe Secret Key:
```
YOUR_STRIPE_SECRET_KEY_HERE
```

## 📝 Add to Your `backend/.env` File

Add these lines to your `backend/.env` file:

```env
# Stripe Configuration (from your stripe.txt file)
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY_HERE

# You still need to add these:
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Get from Stripe Dashboard → Webhooks (NOT the secret key!)
STRIPE_PRICE_ID_SINGLE=price_xxxxx  # Create product in Stripe Dashboard
STRIPE_PRICE_ID_BATCH=price_xxxxx   # Create product in Stripe Dashboard
STRIPE_PRICE_ID_PRO=price_xxxxx      # Create product in Stripe Dashboard
FRONTEND_URL=http://localhost:3001
```

## 🛒 Next Steps: Create Products in Stripe

1. Go to **Stripe Dashboard** → **Products**
2. Click **"Add product"** for each plan:

### Single Plan ($9/month)
- Name: `Single Plan`
- Description: `Unlimited Single SEO Generation`
- Pricing: `$9.00 USD` / `Monthly` (recurring)
- Click **Save**
- **Copy the Price ID** (starts with `price_`)

### Batch Plan ($19/month)
- Name: `Batch Plan`
- Description: `Single, Batch, and CSV Generation`
- Pricing: `$19.00 USD` / `Monthly` (recurring)
- Click **Save**
- **Copy the Price ID**

### Pro Plan ($39/month)
- Name: `Pro Plan`
- Description: `Everything including SEO-Pro and Templates`
- Pricing: `$39.00 USD` / `Monthly` (recurring)
- Click **Save**
- **Copy the Price ID**

## 🔔 Set Up Webhook (for Local Testing)

### Option 1: Stripe CLI (Recommended for Local)
1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe login`
3. Run: `stripe listen --forward-to localhost:3000/billing/webhook`
4. Copy the webhook secret it shows (starts with `whsec_`)
5. Add it to `.env` as `STRIPE_WEBHOOK_SECRET`

### Option 2: Stripe Dashboard (for Production)
1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Endpoint URL: `https://yourdomain.com/billing/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** (starts with `whsec_`)

## ✅ Test It

Once you've added all the values to `.env`:
1. Restart your backend server
2. Go to the billing page
3. Click a plan
4. You should be redirected to Stripe Checkout
5. Use test card: `4242 4242 4242 4242`

