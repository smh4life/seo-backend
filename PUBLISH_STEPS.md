# Step-by-Step Publishing Guide for myseogenerator.com

## 🎯 Overview

This guide will walk you through publishing your website to `myseogenerator.com`. You have two main options:

1. **Vercel (Easiest)** - Best for Next.js, free tier available
2. **VPS Server** - Full control, requires server management

---

## 📋 STEP 1: Choose Your Hosting

**Which do you prefer?**
- **Vercel** (Recommended) - Easiest, handles Next.js automatically
- **Railway** - Good for both frontend and backend
- **DigitalOcean/AWS** - Full control, more setup required

**For this guide, I'll assume Vercel for frontend + Railway for backend (easiest combo)**

---

## 📋 STEP 2: Prepare Environment Variables

### Backend Environment Variables (`.env` file)

You need these in your `backend/.env` file:

```env
# MongoDB
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT Secret (generate a random string)
JWT_SECRET=your_very_long_random_secret_key_here

# OpenAI API Key
OPENAI_API_KEY=sk-your_openai_key

# Stripe (PRODUCTION keys, not test!)
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PRICE_ID_SINGLE=price_your_single_price_id
STRIPE_PRICE_ID_BATCH=price_your_batch_price_id
STRIPE_PRICE_ID_PRO=price_your_pro_price_id
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Frontend URL (for CORS)
FRONTEND_URL=https://myseogenerator.com

# Port (usually set by hosting provider)
PORT=3000
```

### Frontend Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
# OR if backend is on same domain:
# NEXT_PUBLIC_API_URL=https://myseogenerator.com
```

---

## 📋 STEP 3: Deploy Backend (Railway)

1. **Sign up at railway.app** (or use existing account)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo" (or upload code)

3. **Configure Backend Service**
   - Set **Root Directory** to: `backend`
   - Railway will auto-detect Node.js

4. **Add Environment Variables**
   - Go to your service → Variables tab
   - Add ALL variables from Step 2 (backend section)
   - **Important**: Use PRODUCTION Stripe keys, not test keys!

5. **Deploy**
   - Railway will automatically build and deploy
   - Note your backend URL (e.g., `https://myseogenerator-backend.railway.app`)

6. **Get Backend URL**
   - Copy the URL Railway gives you
   - This is your `NEXT_PUBLIC_API_URL` for frontend

---

## 📋 STEP 4: Deploy Frontend (Vercel)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy Frontend**:
   ```bash
   cd frontend
   vercel
   ```
   - Follow the prompts
   - Use default settings
   - It will give you a preview URL (like `myseogenerator.vercel.app`)

4. **Add Environment Variables in Vercel Dashboard**:
   - Go to vercel.com → Your Project → Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL` = your Railway backend URL
   - Example: `https://myseogenerator-backend.railway.app`

5. **Redeploy** (to pick up env vars):
   ```bash
   vercel --prod
   ```

---

## 📋 STEP 5: Connect Your Domain (myseogenerator.com)

### In Vercel Dashboard:

1. Go to your project → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter: `myseogenerator.com`
4. Vercel will give you DNS records to add

### In Your Domain Registrar (where you bought myseogenerator.com):

1. Go to DNS settings
2. Add the DNS records Vercel provided:
   - Usually an **A record** or **CNAME record**
   - Point to Vercel's servers

3. **Wait for DNS propagation** (can take a few minutes to 48 hours)

---

## 📋 STEP 6: Update Backend for Production

1. **Update CORS in backend**:
   - Your `FRONTEND_URL` should be `https://myseogenerator.com`
   - Update this in Railway environment variables

2. **Update Stripe Webhooks**:
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://your-railway-backend-url.railway.app/billing/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.*`
   - Copy the new webhook secret
   - Update `STRIPE_WEBHOOK_SECRET` in Railway

3. **MongoDB Atlas**:
   - Go to MongoDB Atlas → Network Access
   - Add Railway's IP (or allow 0.0.0.0/0 for production)
   - Make sure your connection string works

---

## 📋 STEP 7: Test Everything

Visit `https://myseogenerator.com` and test:

- [ ] Homepage loads
- [ ] Favicon shows
- [ ] Registration works
- [ ] Login works
- [ ] Single generator works
- [ ] Batch generator works (if you have access)
- [ ] SEO-Pro works (if you have access)
- [ ] Stripe checkout works
- [ ] All pages load correctly

---

## 📋 STEP 8: Final Checklist

- [ ] Backend deployed and running on Railway
- [ ] Frontend deployed and running on Vercel
- [ ] Domain connected and working
- [ ] SSL certificate active (HTTPS)
- [ ] All environment variables set
- [ ] Stripe webhooks configured
- [ ] MongoDB accessible
- [ ] Favicon showing
- [ ] All features tested

---

## 🆘 Troubleshooting

**Favicon not showing?**
- Clear browser cache
- Check file exists at `/favicon_io/Picture.png`

**CORS errors?**
- Check `FRONTEND_URL` in backend matches your domain

**API not working?**
- Check `NEXT_PUBLIC_API_URL` in frontend points to backend
- Check backend is running on Railway

**Stripe not working?**
- Make sure you're using LIVE keys (not test)
- Check webhook URL is correct
- Check webhook secret matches

---

## 📞 Need Help?

Which step are you on? Let me know and I can help with:
- Setting up Railway
- Setting up Vercel
- Configuring DNS
- Testing deployment
- Fixing any errors

