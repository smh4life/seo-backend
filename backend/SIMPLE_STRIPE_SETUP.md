# Super Simple Stripe Setup - Step by Step

Don't worry! I'll walk you through this one step at a time. 🚀

## Step 1: Add Your Secret Key to .env File (2 minutes)

1. Open your `backend` folder
2. Open the `.env` file (if it doesn't exist, create it)
3. Add these two lines:

```
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY_HERE
FRONTEND_URL=http://localhost:3001
```

4. Save the file

✅ **Done with Step 1!**

---

## Step 2: Create Products in Stripe (5 minutes)

### Go to Stripe Dashboard:
1. Open: https://dashboard.stripe.com/test/products
2. Make sure you're in **Test mode** (toggle in top right should say "Test mode")

### Create First Product - Single Plan:

1. Click the big **"+ Add product"** button
2. Fill in:
   - **Name**: `Single Plan`
   - **Description**: `Unlimited Single SEO Generation` (optional)
3. Scroll down to **Pricing**
   - Click **"Add price"**
   - **Price**: Type `9.00`
   - **Billing period**: Select **"Monthly"** (recurring)
   - Click **"Save price"**
4. Click **"Save product"** at the bottom
5. **IMPORTANT**: Look for the **Price ID** - it looks like `price_1ABC123xyz...`
   - Copy that entire Price ID
   - Add to your `.env` file: `STRIPE_PRICE_ID_SINGLE=price_1ABC123xyz...` (paste your actual ID)

### Create Second Product - Batch Plan:

1. Click **"+ Add product"** again
2. Fill in:
   - **Name**: `Batch Plan`
   - **Description**: `Single, Batch, and CSV Generation`
3. **Pricing**:
   - Click **"Add price"**
   - **Price**: `19.00`
   - **Billing period**: **"Monthly"** (recurring)
   - Click **"Save price"**
4. Click **"Save product"**
5. Copy the **Price ID** and add to `.env`: `STRIPE_PRICE_ID_BATCH=price_xxxxx`

### Create Third Product - Pro Plan:

1. Click **"+ Add product"** again
2. Fill in:
   - **Name**: `Pro Plan`
   - **Description**: `Everything including SEO-Pro and Templates`
3. **Pricing**:
   - Click **"Add price"**
   - **Price**: `39.00`
   - **Billing period**: **"Monthly"** (recurring)
   - Click **"Save price"**
4. Click **"Save product"**
5. Copy the **Price ID** and add to `.env`: `STRIPE_PRICE_ID_PRO=price_xxxxx`

✅ **Done with Step 2!** Your `.env` should now have all 3 Price IDs.

---

## Step 3: Set Up Webhook (For Local Testing - 3 minutes)

### Option A: Using Stripe CLI (Easiest)

1. **Install Stripe CLI**:
   - Mac: `brew install stripe/stripe-cli/stripe`
   - Or download: https://stripe.com/docs/stripe-cli
   
2. **Open a new terminal window** (keep your server running in another terminal)

3. **Login to Stripe**:
   ```bash
   stripe login
   ```
   - This will open your browser to authorize

4. **Forward webhooks**:
   ```bash
   stripe listen --forward-to localhost:3000/billing/webhook
   ```

5. **Copy the webhook secret**:
   - You'll see output like: `Ready! Your webhook signing secret is whsec_xxxxx`
   - Copy that `whsec_xxxxx` part
   - Add to your `.env` file: `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

6. **Keep this terminal running** while you test!

✅ **Done with Step 3!**

---

## Step 4: Test It! (2 minutes)

1. **Restart your backend server** (so it picks up the new .env values)

2. **Go to your billing page**: http://localhost:3001/dashboard/billing

3. **Click a plan** (like "Single")

4. **You should see Stripe Checkout page**

5. **Use test card**:
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date (like `12/25`)
   - CVC: Any 3 digits (like `123`)
   - ZIP: Any 5 digits (like `12345`)

6. **Click "Subscribe"**

7. **You should be redirected back** to your billing page with a success message!

✅ **Done! Billing is working!**

---

## Your Final .env File Should Look Like:

```env
STRIPE_SECRET_KEY=sk_test_51Sc9jdRxyl86VLbPHrB6O8UFYNFsxZnZLx76KzzkqBJqX3VAabfr6uQrZpEqdNFfTKPIN4ZJNX2u1pAYwIJIavXB00A0nFCxwr
FRONTEND_URL=http://localhost:3001
STRIPE_PRICE_ID_SINGLE=price_1ABC123xyz...  (your actual Price ID)
STRIPE_PRICE_ID_BATCH=price_1DEF456abc...   (your actual Price ID)
STRIPE_PRICE_ID_PRO=price_1GHI789def...      (your actual Price ID)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx            (from Stripe CLI)
```

---

## Need Help?

If you get stuck on any step, just tell me which step and I'll help you through it!

**Most common issues:**
- Can't find Price ID? → Look in the product details, it's usually right after you save
- Webhook not working? → Make sure Stripe CLI is running and your backend is on port 3000
- Checkout not loading? → Make sure all Price IDs are correct in .env

