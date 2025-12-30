# Updating Existing Render Services for MySEOGenerator v2

Since you already have Render running with your original MySEOGenerator, here's how to update it:

## 🎯 Two Options

### Option 1: Update Existing Services (Recommended if you want to replace the old version)

1. **Update Backend Service**:
   - Go to your existing backend service in Render dashboard
   - Go to **Settings** → **Build & Deploy**
   - Update **Root Directory** to: `backend` (if not already set)
   - Update **Build Command** to: `npm install`
   - Update **Start Command** to: `npm start`
   - Connect to your new repository (or update the existing one)

2. **Update Environment Variables**:
   - Go to **Environment** tab
   - Update/add any new environment variables needed
   - Make sure all variables from Step 2 of the main guide are present

3. **Update Frontend Service**:
   - Go to your existing frontend service
   - Update **Root Directory** to: `frontend`
   - Update **Build Command** to: `npm install && npm run build`
   - Update **Start Command** to: `npm start`
   - Update **Environment Variables**:
     - Update `NEXT_PUBLIC_API_URL` to point to your backend service

4. **Manual Deploy**:
   - Click **Manual Deploy** → **Deploy latest commit**
   - Or push to your connected branch to trigger auto-deploy

### Option 2: Create New Services (Recommended if you want to keep old version running)

Follow the main `RENDER_DEPLOYMENT.md` guide to create new services:
- Name them: `myseogenerator-v2-backend` and `myseogenerator-v2-frontend`
- This keeps your old version running while you test the new one

---

## 📋 Quick Update Checklist

### Backend Service:
- [ ] Root Directory: `backend`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Environment Variables updated:
  - [ ] `MONGODB_URI`
  - [ ] `JWT_SECRET`
  - [ ] `OPENAI_API_KEY`
  - [ ] `STRIPE_SECRET_KEY` (LIVE key)
  - [ ] `STRIPE_PRICE_ID_SINGLE`
  - [ ] `STRIPE_PRICE_ID_BATCH`
  - [ ] `STRIPE_PRICE_ID_PRO`
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `FRONTEND_URL` (your domain)
  - [ ] `PORT` (usually 10000, Render sets this)

### Frontend Service:
- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] Environment Variables:
  - [ ] `NEXT_PUBLIC_API_URL` (your backend URL)
  - [ ] `NODE_ENV` = `production`

---

## 🔄 If Updating Existing Services

1. **Connect New Repository** (if using a different repo):
   - Settings → **Connect GitHub** (or GitLab/Bitbucket)
   - Select your new repository
   - Select the branch (usually `main`)

2. **Update Build Settings**:
   - Make sure Root Directory, Build Command, and Start Command are correct
   - Save changes

3. **Update Environment Variables**:
   - Add any new variables
   - Update existing ones if needed
   - **Important**: Make sure you're using PRODUCTION Stripe keys, not test keys

4. **Deploy**:
   - Click **Manual Deploy** → **Deploy latest commit**
   - Or push to your repository to trigger auto-deploy

---

## ⚠️ Important Notes

- **Stripe Webhooks**: If you're updating, make sure to update your Stripe webhook URL to point to your backend service
- **Domain**: If you're using the same domain, it should automatically work with the updated services
- **Database**: Make sure your MongoDB connection string is correct
- **Test First**: Consider creating new services first to test, then switch the domain over

---

## 🆘 Need Help?

Which option do you want to use?
1. Update existing services
2. Create new services

Let me know and I'll guide you through the specific steps!

