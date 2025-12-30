# Update Existing Render Services to v2

## Step-by-Step Guide to Replace Old Version with v2

---

## 📋 STEP 1: Check Your Repository

First, let's see if your v2 code is in a Git repository:

**In your terminal, run:**
```bash
git status
```

**If you see "not a git repository":**
- Your code isn't in Git yet
- We'll need to set that up first

**If you see file changes or "On branch main":**
- You're already in a Git repository
- We can proceed

**Let me know what you see!**

---

## 📋 STEP 2: Update Backend Service on Render

1. **Go to render.com** and sign in

2. **Find your existing backend service** (probably named something like `myseogenerator-backend`)

3. **Update the Repository** (if using a different repo):
   - Click on your backend service
   - Go to **Settings** tab
   - Scroll to **"Source"** section
   - Click **"Connect GitHub"** (or GitLab/Bitbucket)
   - Select your repository with v2 code
   - Select branch (usually `main` or `master`)

4. **Update Build Settings**:
   - Still in **Settings** tab
   - Scroll to **"Build & Deploy"** section
   - Update these fields:
     - **Root Directory**: `backend`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
   - Click **"Save Changes"**

5. **Update Environment Variables**:
   - Go to **Environment** tab
   - Check/Update these variables:
     - `MONGODB_URI` - Your MongoDB connection string
     - `JWT_SECRET` - Your JWT secret
     - `OPENAI_API_KEY` - Your OpenAI key
     - `STRIPE_SECRET_KEY` - **Make sure this is LIVE key** (starts with `sk_live_`)
     - `STRIPE_PRICE_ID_SINGLE` - Your Single plan price ID
     - `STRIPE_PRICE_ID_BATCH` - Your Batch plan price ID
     - `STRIPE_PRICE_ID_PRO` - Your Pro plan price ID
     - `STRIPE_WEBHOOK_SECRET` - Your webhook secret
     - `FRONTEND_URL` - Should be `https://myseogenerator.com`
     - `PORT` - Usually `10000` (Render sets this automatically)

6. **Deploy**:
   - Go to **Manual Deploy** tab
   - Click **"Deploy latest commit"**
   - Or push to your repository to trigger auto-deploy

---

## 📋 STEP 3: Update Frontend Service on Render

1. **Find your existing frontend service** (probably named something like `myseogenerator-frontend`)

2. **Update the Repository** (if using a different repo):
   - Click on your frontend service
   - Go to **Settings** tab
   - Scroll to **"Source"** section
   - Click **"Connect GitHub"** (or GitLab/Bitbucket)
   - Select your repository with v2 code (same repo as backend)
   - Select branch (usually `main` or `master`)

3. **Update Build Settings**:
   - Still in **Settings** tab
   - Scroll to **"Build & Deploy"** section
   - Update these fields:
     - **Root Directory**: `frontend`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
   - Click **"Save Changes"**

4. **Update Environment Variables**:
   - Go to **Environment** tab
   - Update/Add:
     - `NEXT_PUBLIC_API_URL` - Should be your backend URL (e.g., `https://myseogenerator-backend.onrender.com`)
     - `NODE_ENV` - Set to `production`

5. **Deploy**:
   - Go to **Manual Deploy** tab
   - Click **"Deploy latest commit"**
   - Or push to your repository to trigger auto-deploy

---

## 📋 STEP 4: Verify Domain Connection

1. **Check Custom Domain**:
   - Go to your frontend service
   - Click **Settings** tab
   - Scroll to **"Custom Domains"** section
   - Verify `myseogenerator.com` is listed
   - If not, add it:
     - Click **"Add Custom Domain"**
     - Enter: `myseogenerator.com`
     - Follow DNS instructions if needed

2. **SSL Certificate**:
   - Render automatically provisions SSL
   - Should show as "Active" after a few minutes

---

## 📋 STEP 5: Update Stripe Webhooks

1. **Go to Stripe Dashboard** → **Developers** → **Webhooks**

2. **Find your existing webhook** or create a new one:
   - Endpoint URL: `https://your-backend-url.onrender.com/billing/webhook`
   - Replace `your-backend-url` with your actual backend service URL

3. **Select Events**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

4. **Copy the Webhook Secret** (starts with `whsec_`)

5. **Update in Render**:
   - Go to backend service → **Environment** tab
   - Update `STRIPE_WEBHOOK_SECRET` with the new secret

---

## 📋 STEP 6: Test Everything

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

## ⚠️ Important Notes

- **Backup**: Your old version will be replaced. If you want to keep it, create new services instead.
- **Stripe Keys**: Make sure you're using **LIVE keys** (starts with `sk_live_`), not test keys
- **Database**: Your MongoDB should work the same (users, subscriptions, etc. will remain)
- **Downtime**: There may be a few minutes of downtime during deployment

---

## 🆘 Troubleshooting

**Build fails?**
- Check the **Logs** tab in Render
- Verify Root Directory is correct (`backend` or `frontend`)
- Check that all dependencies are in `package.json`

**Domain not working?**
- Check DNS settings at your domain registrar
- Wait a few minutes for DNS propagation

**API errors?**
- Check `NEXT_PUBLIC_API_URL` in frontend matches backend URL
- Check `FRONTEND_URL` in backend matches your domain

---

## ✅ Ready to Start?

Let me know:
1. What you see when you run `git status` (to check repository)
2. If you're ready to update the backend service first

Then we'll go through each step together!

