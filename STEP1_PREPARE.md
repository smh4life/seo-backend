# Step 1: Prepare Your Code for Render

## ✅ Checklist

### 1. Git Repository Setup

**Do you have your code in a Git repository (GitHub, GitLab, or Bitbucket)?**

If **YES**, skip to step 2.

If **NO**, follow these steps:

1. **Initialize Git** (if not already done):
   ```bash
   git init
   ```

2. **Create a `.gitignore` file** (already created for you in the root directory)

3. **Add all files**:
   ```bash
   git add .
   ```

4. **Make your first commit**:
   ```bash
   git commit -m "Initial commit - ready for Render deployment"
   ```

5. **Create a repository on GitHub/GitLab/Bitbucket**:
   - Go to GitHub.com (or GitLab/Bitbucket)
   - Click "New Repository"
   - Name it: `myseogenerator-v2` (or whatever you prefer)
   - **Don't** initialize with README (you already have code)
   - Click "Create Repository"

6. **Connect your local repo to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/myseogenerator-v2.git
   git branch -M main
   git push -u origin main
   ```
   (Replace `YOUR_USERNAME` with your GitHub username)

---

### 2. Verify Your Code Structure

Your project should have this structure:
```
myseogenerator-v2/
├── backend/
│   ├── package.json
│   ├── server.js
│   └── ... (all your backend files)
├── frontend/
│   ├── package.json
│   └── ... (all your frontend files)
└── .gitignore
```

✅ **Already correct!**

---

### 3. Render Configuration Files (Optional but Helpful)

I've created optional `render.yaml` files for you:
- `backend/render.yaml` - Backend service configuration
- `frontend/render.yaml` - Frontend service configuration

These files help Render auto-configure your services, but you can also configure everything manually in the Render dashboard.

✅ **Files created!**

---

### 4. Environment Variables Checklist

Before deploying, make sure you have these ready:

**Backend Environment Variables:**
- [ ] `MONGODB_URI` - Your MongoDB Atlas connection string
- [ ] `JWT_SECRET` - A random secret key for JWT tokens
- [ ] `OPENAI_API_KEY` - Your OpenAI API key
- [ ] `STRIPE_SECRET_KEY` - Your Stripe LIVE secret key (starts with `sk_live_`)
- [ ] `STRIPE_PRICE_ID_SINGLE` - Stripe price ID for Single plan
- [ ] `STRIPE_PRICE_ID_BATCH` - Stripe price ID for Batch plan
- [ ] `STRIPE_PRICE_ID_PRO` - Stripe price ID for Pro plan
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret (you'll get this after setting up webhook)
- [ ] `FRONTEND_URL` - Will be `https://myseogenerator.com` (update after domain is connected)
- [ ] `PORT` - Render sets this automatically (defaults to 10000)

**Frontend Environment Variables:**
- [ ] `NEXT_PUBLIC_API_URL` - Your backend URL (e.g., `https://myseogenerator-backend.onrender.com`)
- [ ] `NODE_ENV` - Set to `production`

---

### 5. Important Notes

⚠️ **Never commit `.env` files to Git!**
- The `.gitignore` file I created will prevent this
- Environment variables will be set in Render dashboard

⚠️ **Use PRODUCTION Stripe keys, not test keys!**
- Test keys start with `sk_test_`
- Production keys start with `sk_live_`

---

## ✅ Step 1 Complete!

Once you've:
1. ✅ Verified your code is in a Git repository
2. ✅ Confirmed your project structure
3. ✅ Have all your environment variables ready

**You're ready for Step 2: Deploy Backend on Render!**

---

## Next Steps

When you're ready, we'll:
1. Create the backend service on Render
2. Add all environment variables
3. Deploy the backend
4. Get your backend URL

Let me know when you're ready to proceed to Step 2!

