# Quick Stripe Setup Guide

## ✅ What You Have

You have:
- **SK_test** (Secret Key) - `sk_test_51Sc9jdRxyl86VLbPHrB6O8UFYNFsxZnZLx76KzzkqBJqX3VAabfr6uQrZpEqdNFfTKPIN4ZJNX2u1pAYwIJIavXB00A0nFCxwr`
- **PK_test** (Publishable Key) - Not needed for our setup (we use server-side checkout)

## 📝 Step 1: Add Secret Key to .env

Add this to your `backend/.env` file:

```env
STRIPE_SECRET_KEY=sk_test_51Sc9jdRxyl86VLbPHrB6O8UFYNFsxZnZLx76KzzkqBJqX3VAabfr6uQrZpEqdNFfTKPIN4ZJNX2u1pAYwIJIavXB00A0nFCxwr
FRONTEND_URL=http://localhost:3001
```

## 🧪 Step 2: Test Your Key

Run this to verify your key works:

```bash
cd backend
node test-stripe-keys.js
```

This will:
- ✅ Test if your secret key is valid
- 📦 Show you any existing products
- 🔔 Show you any existing webhooks

## 🛒 Step 3: Create Products in Stripe (You Need This!)

You need to create 3 products to get Price IDs:

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/test/products
2. **Click "Add product"** for each:

### Product 1: Single Plan
- **Name**: `Single Plan`
- **Description**: `Unlimited Single SEO Generation`
- **Pricing Model**: Standard pricing
- **Price**: `$9.00`
- **Billing period**: Monthly (recurring)
- Click **Save product**
- **Copy the Price ID** (looks like `price_1ABC123...`)

### Product 2: Batch Plan
- **Name**: `Batch Plan`
- **Description**: `Single, Batch, and CSV Generation`
- **Price**: `$19.00` / Monthly (recurring)
- **Copy the Price ID**

### Product 3: Pro Plan
- **Name**: `Pro Plan`
- **Description**: `Everything including SEO-Pro and Templates`
- **Price**: `$39.00` / Monthly (recurring)
- **Copy the Price ID**

### Add Price IDs to .env

After creating products, add to `backend/.env`:

```env
STRIPE_PRICE_ID_SINGLE=price_xxxxx  # Replace with your actual Price ID
STRIPE_PRICE_ID_BATCH=price_xxxxx   # Replace with your actual Price ID
STRIPE_PRICE_ID_PRO=price_xxxxx      # Replace with your actual Price ID
```

## 🔔 Step 4: Set Up Webhook (For Local Testing)

### Option A: Stripe CLI (Easiest for Local)

1. **Install Stripe CLI**: https://stripe.com/docs/stripe-cli
2. **Login**: 
   ```bash
   stripe login
   ```
3. **Forward webhooks**:
   ```bash
   stripe listen --forward-to localhost:3000/billing/webhook
   ```
4. **Copy the webhook secret** it shows (starts with `whsec_`)
5. **Add to .env**:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # The secret from Stripe CLI
   ```

### Option B: Stripe Dashboard (For Production)

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. **Endpoint URL**: `https://yourdomain.com/billing/webhook`
4. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. **Copy the Signing secret** (starts with `whsec_`)
7. Add to `.env` as `STRIPE_WEBHOOK_SECRET`

## ✅ Step 5: Verify Everything

Run the test script again:

```bash
node test-stripe-keys.js
```

It should show:
- ✅ Secret Key is valid
- 📦 Your 3 products with Price IDs
- 🔔 Webhook configured (if you set it up)

## 🚀 Step 6: Test Billing

1. **Start your backend**: `npm run dev` (or `npm start`)
2. **Start your frontend**: `npm run dev`
3. **Go to**: http://localhost:3001/dashboard/billing
4. **Click a plan** - should redirect to Stripe Checkout
5. **Use test card**: `4242 4242 4242 4242` (any future date, any CVC)

## 📋 Summary Checklist

- [ ] Added `STRIPE_SECRET_KEY` to `.env`
- [ ] Created 3 products in Stripe Dashboard
- [ ] Added `STRIPE_PRICE_ID_SINGLE` to `.env`
- [ ] Added `STRIPE_PRICE_ID_BATCH` to `.env`
- [ ] Added `STRIPE_PRICE_ID_PRO` to `.env`
- [ ] Set up webhook (Stripe CLI or Dashboard)
- [ ] Added `STRIPE_WEBHOOK_SECRET` to `.env`
- [ ] Tested with `node test-stripe-keys.js`
- [ ] Tested checkout flow in browser

## ❓ Common Questions

**Q: Are these real keys?**
A: Yes! `sk_test_` keys are real Stripe test keys. They work with test cards only. For production, you'll need `sk_live_` keys.

**Q: Do I need the PK_test (Publishable Key)?**
A: No, not for our setup. We use server-side checkout, so only the Secret Key is needed.

**Q: What if I don't have products yet?**
A: You MUST create them in Stripe Dashboard. The Price IDs are required for checkout to work.

**Q: Can I skip the webhook for now?**
A: You can test checkout without it, but subscriptions won't update automatically. The webhook is needed for production.

