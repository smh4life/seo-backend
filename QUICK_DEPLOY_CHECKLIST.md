# Quick Deployment Checklist for myseogenerator.com

## ✅ Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Backend `.env` file has all required variables
- [ ] Frontend environment variables configured
- [ ] MongoDB connection string is production-ready
- [ ] Stripe keys are production keys (not test keys)
- [ ] JWT_SECRET is a strong, random string

### 2. Code Updates for Production
- [ ] Update `NEXT_PUBLIC_API_URL` to production backend URL
- [ ] Update `FRONTEND_URL` in backend `.env` to `https://myseogenerator.com`
- [ ] Update CORS settings if needed
- [ ] Test all features locally one more time

### 3. Build & Test
```bash
# Frontend
cd frontend
npm run build
npm start  # Test production build locally

# Backend
cd backend
npm start  # Test backend locally
```

## 🚀 Deployment Steps

### Option A: Vercel (Easiest for Next.js)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy Frontend**:
   ```bash
   cd frontend
   vercel
   ```
   - Follow prompts
   - Add environment variables in Vercel dashboard:
     - `NEXT_PUBLIC_API_URL=https://your-backend-url.com`

3. **Connect Domain**:
   - Vercel Dashboard → Your Project → Settings → Domains
   - Add `myseogenerator.com`
   - Follow DNS instructions

4. **Deploy Backend** (separate hosting needed):
   - Use Railway, Render, or DigitalOcean
   - Set all environment variables
   - Note the backend URL

### Option B: Traditional VPS (Full Control)

1. **Server Setup** (Ubuntu):
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Install Nginx
   sudo apt install nginx
   ```

2. **Deploy Code**:
   ```bash
   # Clone your repo
   git clone <your-repo>
   cd myseogenerator-v2

   # Backend
   cd backend
   npm install
   # Copy .env file
   pm2 start server.js --name backend
   pm2 save

   # Frontend
   cd ../frontend
   npm install
   npm run build
   pm2 start npm --name frontend -- start
   pm2 save
   ```

3. **Nginx Configuration**:
   Create `/etc/nginx/sites-available/myseogenerator.com`:
   ```nginx
   server {
       listen 80;
       server_name myseogenerator.com www.myseogenerator.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
       }
   }
   ```

4. **Enable Site & SSL**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/myseogenerator.com /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx

   # SSL Certificate
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d myseogenerator.com -d www.myseogenerator.com
   ```

## 🔧 Post-Deployment

1. **Test Everything**:
   - [ ] Visit https://myseogenerator.com
   - [ ] Test registration
   - [ ] Test login
   - [ ] Test single generator
   - [ ] Test batch generator (if you have access)
   - [ ] Test SEO-Pro (if you have access)
   - [ ] Test Stripe checkout
   - [ ] Check favicon is showing

2. **Update Stripe Webhooks**:
   - Go to Stripe Dashboard → Webhooks
   - Update webhook URL to: `https://your-backend-url.com/billing/webhook`
   - Update webhook secret in backend `.env`

3. **MongoDB Atlas**:
   - Add your server IP to MongoDB Atlas Network Access
   - Or set to allow from anywhere (0.0.0.0/0) for production

## 📝 Important URLs to Update

After deployment, update these in your backend `.env`:
- `FRONTEND_URL=https://myseogenerator.com`
- Update Stripe webhook URL in Stripe dashboard

In your frontend environment variables:
- `NEXT_PUBLIC_API_URL=https://your-backend-url.com`

## 🆘 Troubleshooting

- **Favicon not showing**: Clear browser cache
- **CORS errors**: Check `FRONTEND_URL` in backend `.env`
- **API not working**: Check `NEXT_PUBLIC_API_URL` in frontend
- **Stripe not working**: Check webhook URL and secret

## Need Help?

Which hosting provider are you planning to use? I can provide specific instructions for:
- Vercel
- Railway
- DigitalOcean
- AWS
- Heroku
- Other

