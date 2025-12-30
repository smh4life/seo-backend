# Stripe Billing Setup Guide

## 🔐 Security Note
**NEVER share your Stripe keys in chat or commit them to git.** Add them to your `.env` file locally.

## Required Stripe Information

You need the following from your Stripe Dashboard:

### 1. Stripe Secret Key
- Go to: **Stripe Dashboard → Developers → API keys**
- Copy your **Secret key** (starts with `sk_`)
- For testing, use the **Test mode** key
- For production, use the **Live mode** key

### 2. Stripe Price IDs
You need to create 3 products in Stripe (or use existing ones):

1. **Single Plan** - $9/month
   - Create a product named "Single Plan"
   - Set price to $9/month (recurring)
   - Copy the **Price ID** (starts with `price_`)

2. **Batch Plan** - $19/month
   - Create a product named "Batch Plan"
   - Set price to $19/month (recurring)
   - Copy the **Price ID**

3. **Pro Plan** - $39/month
   - Create a product named "Pro Plan"
   - Set price to $39/month (recurring)
   - Copy the **Price ID**

### 3. Stripe Webhook Secret
- Go to: **Stripe Dashboard → Developers → Webhooks**
- Click **"Add endpoint"**
- Set endpoint URL to: `https://yourdomain.com/billing/webhook`
  - For local testing: Use Stripe CLI (see below) or ngrok
- Select these events to listen to:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Copy the **Signing secret** (starts with `whsec_`)

## Local Testing with Stripe CLI

For local development, use Stripe CLI to forward webhooks:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/billing/webhook`
4. Copy the webhook signing secret it provides (starts with `whsec_`)
5. Use that secret in your `.env` file

## Environment Variables

Add these to your `backend/.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxx  # Your Stripe Secret Key
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Your Webhook Signing Secret

# Stripe Price IDs (from your Stripe Dashboard)
STRIPE_PRICE_ID_SINGLE=price_xxxxx  # Single Plan ($9/mo)
STRIPE_PRICE_ID_BATCH=price_xxxxx   # Batch Plan ($19/mo)
STRIPE_PRICE_ID_PRO=price_xxxxx      # Pro Plan ($39/mo)

# Frontend URL (for redirects after checkout)
FRONTEND_URL=http://localhost:3001  # Change to your production URL when deploying
```

## Installation

Make sure Stripe package is installed:

```bash
cd backend
npm install stripe
```

## Testing

1. Start your backend server
2. Make sure all environment variables are set
3. Try clicking a plan on the billing page
4. You should be redirected to Stripe Checkout
5. Use Stripe test card: `4242 4242 4242 4242` (any future date, any CVC)

## Production Checklist

- [ ] Switch to **Live mode** keys in Stripe Dashboard
- [ ] Update `STRIPE_SECRET_KEY` to live key
- [ ] Update `FRONTEND_URL` to your production domain
- [ ] Set up webhook endpoint in Stripe Dashboard pointing to your production URL
- [ ] Update `STRIPE_WEBHOOK_SECRET` with production webhook secret
- [ ] Test a real subscription flow

## Troubleshooting

**"Stripe Price ID not configured" error:**
- Make sure you've set `STRIPE_PRICE_ID_SINGLE`, `STRIPE_PRICE_ID_BATCH`, and `STRIPE_PRICE_ID_PRO` in `.env`

**Webhook not working:**
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check that webhook endpoint URL is accessible
- For local testing, use Stripe CLI

**Checkout redirects but fails:**
- Check that `FRONTEND_URL` is correct
- Verify Stripe Secret Key is valid
- Check browser console for errors

