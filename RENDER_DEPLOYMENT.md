# Render Deployment Guide for myseogenerator.com

## 🎯 Overview

This guide will walk you through deploying your application to Render and connecting it to `myseogenerator.com`.

Render can host both your frontend (Next.js) and backend (Node.js) services.

---

## 📋 STEP 1: Prepare Your Code

### 1.1 Check Your Repository

Make sure your code is in a Git repository (GitHub, GitLab, or Bitbucket):
- Render deploys from Git repositories
- If not already in Git, initialize it:
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  git remote add origin <your-repo-url>
  git push -u origin main
  ```

### 1.2 Create Render Configuration Files (Optional but Recommended)

**Backend: `backend/render.yaml`** (optional):
```yaml
services:
  - type: web
    name: myseogenerator-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

**Frontend: `frontend/render.yaml`** (optional):
```yaml
services:
  - type: web
    name: myseogenerator-frontend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

---

## 📋 STEP 2: Deploy Backend on Render

### 2.1 Create Backend Service

1. **Go to render.com** and sign in (or create account)

2. **Click "New +" → "Web Service"**

3. **Connect your repository**:
   - Connect GitHub/GitLab/Bitbucket
   - Select your repository

4. **Configure Backend Service**:
   - **Name**: `myseogenerator-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Choose your plan (Free tier available)

### 2.2 Add Environment Variables

In the Render dashboard, go to **Environment** tab and add:

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

# Frontend URL (for CORS) - Update after frontend is deployed
FRONTEND_URL=https://myseogenerator.com

# Port (Render sets this automatically, but include it)
PORT=10000
```

**Important Notes**:
- Use **PRODUCTION Stripe keys** (starts with `sk_live_`), not test keys
- `FRONTEND_URL` can be updated later after frontend is deployed
- Render automatically sets `PORT`, but include it just in case

### 2.3 Deploy Backend

1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Wait for deployment to complete (usually 2-5 minutes)
4. **Copy your backend URL** (e.g., `https://myseogenerator-backend.onrender.com`)

---

## 📋 STEP 3: Deploy Frontend on Render

### 3.1 Create Frontend Service

1. **Click "New +" → "Web Service"** again

2. **Connect the same repository**

3. **Configure Frontend Service**:
   - **Name**: `myseogenerator-frontend`
   - **Root Directory**: `frontend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Choose your plan

### 3.2 Add Environment Variables

In the Render dashboard, go to **Environment** tab and add:

```env
# Backend API URL (use the backend URL from Step 2.3)
NEXT_PUBLIC_API_URL=https://myseogenerator-backend.onrender.com

# Node Environment
NODE_ENV=production
```

**Important**: Replace `https://myseogenerator-backend.onrender.com` with your actual backend URL from Step 2.3.

### 3.3 Deploy Frontend

1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Wait for deployment to complete (usually 3-7 minutes for Next.js)
4. **Copy your frontend URL** (e.g., `https://myseogenerator-frontend.onrender.com`)

---

## 📋 STEP 4: Connect Your Domain (myseogenerator.com)

### 4.1 Add Custom Domain to Frontend Service

1. Go to your **frontend service** in Render dashboard
2. Click **"Settings"** tab
3. Scroll to **"Custom Domains"** section
4. Click **"Add Custom Domain"**
5. Enter: `myseogenerator.com`
6. Render will give you DNS records to add

### 4.2 Configure DNS at Your Domain Registrar

1. Go to where you bought `myseogenerator.com` (GoDaddy, Namecheap, etc.)
2. Find **DNS Settings** or **DNS Management**
3. Add the DNS records Render provided:
   - Usually a **CNAME record** pointing to Render's servers
   - Or an **A record** with Render's IP address

4. **Wait for DNS propagation** (can take a few minutes to 48 hours)

### 4.3 SSL Certificate

- Render automatically provisions SSL certificates via Let's Encrypt
- Once DNS propagates, HTTPS will be enabled automatically
- This usually takes 5-10 minutes after DNS is configured

---

## 📋 STEP 5: Update Backend for Production

### 5.1 Update FRONTEND_URL

1. Go to your **backend service** in Render dashboard
2. Click **"Environment"** tab
3. Update `FRONTEND_URL` to: `https://myseogenerator.com`
4. Click **"Save Changes"**
5. Render will automatically redeploy

### 5.2 Update Stripe Webhooks

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **"Add endpoint"** (or edit existing)
3. Set endpoint URL to: `https://myseogenerator-backend.onrender.com/billing/webhook`
   - Replace with your actual backend URL
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **"Add endpoint"**
6. **Copy the webhook signing secret** (starts with `whsec_`)
7. Update `STRIPE_WEBHOOK_SECRET` in Render backend environment variables

### 5.3 Update MongoDB Atlas

1. Go to **MongoDB Atlas** → **Network Access**
2. Add Render's IP addresses or allow from anywhere:
   - Click **"Add IP Address"**
   - For production, you can add `0.0.0.0/0` (allows from anywhere)
   - Or add specific Render IPs if you know them
3. Make sure your connection string is correct

---

## 📋 STEP 6: Update Frontend API URL (If Needed)

If you want to use your custom domain for the API:

1. You can set up a subdomain like `api.myseogenerator.com`
2. Or use the Render backend URL directly (simpler)

If using subdomain:
- Add `api.myseogenerator.com` as custom domain to backend service
- Update `NEXT_PUBLIC_API_URL` in frontend to `https://api.myseogenerator.com`

---

## 📋 STEP 7: Test Everything

Visit `https://myseogenerator.com` and test:

- [ ] Homepage loads correctly
- [ ] Favicon shows
- [ ] Registration works
- [ ] Login works
- [ ] Single generator works
- [ ] Batch generator works (if you have access)
- [ ] SEO-Pro works (if you have access)
- [ ] Stripe checkout works
- [ ] All pages load correctly
- [ ] HTTPS is working (green lock icon)

---

## 📋 STEP 8: Important Render Notes

### Free Tier Limitations

- **Spinning down**: Free services spin down after 15 minutes of inactivity
- **Cold starts**: First request after spin-down takes ~30 seconds
- **Upgrade**: Consider paid plan for production to avoid spin-downs

### Environment Variables

- All environment variables are set in Render dashboard
- Changes require a redeploy (automatic when you save)
- Never commit `.env` files to Git

### Automatic Deploys

- Render automatically deploys on every push to your main branch
- You can disable this in Settings → Auto-Deploy

### Logs

- View logs in Render dashboard → **Logs** tab
- Useful for debugging deployment issues

---

## 📋 Final Checklist

- [ ] Backend deployed and running on Render
- [ ] Frontend deployed and running on Render
- [ ] Custom domain connected (`myseogenerator.com`)
- [ ] SSL certificate active (HTTPS)
- [ ] All environment variables set correctly
- [ ] `FRONTEND_URL` updated to production domain
- [ ] `NEXT_PUBLIC_API_URL` points to backend
- [ ] Stripe webhooks configured
- [ ] MongoDB accessible from Render
- [ ] Favicon showing
- [ ] All features tested and working

---

## 🆘 Troubleshooting

### Backend not starting?

- Check **Logs** tab in Render dashboard
- Verify all environment variables are set
- Check `MONGODB_URI` is correct
- Ensure `PORT` is set (Render uses `10000` by default)

### Frontend build failing?

- Check **Logs** tab for build errors
- Verify `NEXT_PUBLIC_API_URL` is set
- Make sure all dependencies are in `package.json`

### CORS errors?

- Check `FRONTEND_URL` in backend matches your domain
- Ensure it's `https://myseogenerator.com` (not `http://`)

### Domain not working?

- Wait for DNS propagation (can take up to 48 hours)
- Check DNS records are correct in your registrar
- Verify domain is added in Render dashboard

### Stripe not working?

- Make sure you're using **LIVE keys** (not test)
- Check webhook URL is correct
- Verify webhook secret matches in Render

### Favicon not showing?

- Clear browser cache
- Check file exists at `/favicon_io/Picture.png`
- Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

---

## 📞 Need Help?

If you run into issues:
1. Check the **Logs** tab in Render dashboard
2. Verify all environment variables are set
3. Test the backend URL directly in browser
4. Check DNS propagation status

Let me know which step you're on or if you encounter any errors!

