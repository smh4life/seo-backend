# Deployment Guide for MySEOGenerator

This guide will help you deploy your application to myseogenerator.com

## Prerequisites

1. **Domain**: You already have `myseogenerator.com`
2. **Hosting Provider**: You'll need a hosting service (Vercel, Netlify, AWS, DigitalOcean, etc.)
3. **Environment Variables**: All your `.env` files need to be configured on the server

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)

Vercel is the easiest option for Next.js applications.

#### Steps:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Deploy Frontend**:
   ```bash
   cd frontend
   vercel
   ```
   - Follow the prompts
   - When asked for project settings, use defaults
   - Add your environment variables in Vercel dashboard

3. **Deploy Backend**:
   - You'll need a separate hosting for the backend (Node.js)
   - Options: Railway, Render, DigitalOcean, AWS, Heroku
   - Or use Vercel Serverless Functions (requires code changes)

4. **Connect Domain**:
   - In Vercel dashboard → Settings → Domains
   - Add `myseogenerator.com`
   - Follow DNS configuration instructions

### Option 2: Traditional VPS (DigitalOcean, AWS EC2, etc.)

#### Steps:

1. **Set up Server**:
   - Create a VPS instance (Ubuntu 20.04+ recommended)
   - Install Node.js, npm, PM2, Nginx

2. **Clone Repository**:
   ```bash
   git clone <your-repo-url>
   cd myseogenerator-v2
   ```

3. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Copy .env file and configure
   pm2 start server.js --name myseogenerator-backend
   pm2 save
   ```

4. **Frontend Build & Setup**:
   ```bash
   cd frontend
   npm install
   npm run build
   pm2 start npm --name myseogenerator-frontend -- start
   pm2 save
   ```

5. **Nginx Configuration**:
   Create `/etc/nginx/sites-available/myseogenerator.com`:
   ```nginx
   server {
       listen 80;
       server_name myseogenerator.com www.myseogenerator.com;

       # Frontend (Next.js)
       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Enable Site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/myseogenerator.com /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

7. **SSL Certificate (Let's Encrypt)**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d myseogenerator.com -d www.myseogenerator.com
   ```

### Option 3: Railway (Easy Backend + Frontend)

Railway can host both frontend and backend.

1. **Sign up at railway.app**
2. **Create New Project**
3. **Add Backend Service**:
   - Connect GitHub repo
   - Set root directory to `backend`
   - Add environment variables
   - Deploy

4. **Add Frontend Service**:
   - Add another service
   - Set root directory to `frontend`
   - Add environment variables (including `NEXT_PUBLIC_API_URL`)
   - Deploy

5. **Custom Domain**:
   - In Railway dashboard → Settings → Domains
   - Add `myseogenerator.com`

## Environment Variables Needed

### Frontend (.env.local or Vercel Environment Variables):
```env
NEXT_PUBLIC_API_URL=https://api.myseogenerator.com
# Or if backend is on same domain:
# NEXT_PUBLIC_API_URL=https://myseogenerator.com
```

### Backend (.env):
```env
# MongoDB
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PRICE_ID_SINGLE=your_single_price_id
STRIPE_PRICE_ID_BATCH=your_batch_price_id
STRIPE_PRICE_ID_PRO=your_pro_price_id
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Frontend URL (for CORS)
FRONTEND_URL=https://myseogenerator.com

# Port (usually set by hosting provider)
PORT=3000
```

## Important Notes

1. **CORS**: Update `FRONTEND_URL` in backend `.env` to your production domain
2. **Stripe Webhooks**: Update webhook URL in Stripe dashboard to your production backend URL
3. **MongoDB**: Make sure your MongoDB Atlas allows connections from your server IP
4. **API URLs**: Update `NEXT_PUBLIC_API_URL` in frontend to point to your backend
5. **HTTPS**: Always use HTTPS in production (required for Stripe)

## Testing After Deployment

1. Visit `https://myseogenerator.com`
2. Test registration/login
3. Test single generator
4. Test batch generator (if you have access)
5. Test SEO-Pro generator (if you have access)
6. Test Stripe checkout flow

## Monitoring

- Use PM2 for process management: `pm2 monit`
- Set up error tracking (Sentry, LogRocket, etc.)
- Monitor server resources

## Quick Checklist

- [ ] Backend deployed and running
- [ ] Frontend built and deployed
- [ ] Environment variables configured
- [ ] Domain connected
- [ ] SSL certificate installed
- [ ] MongoDB accessible from server
- [ ] Stripe webhooks configured
- [ ] CORS settings updated
- [ ] Favicon working
- [ ] All features tested

## Need Help?

If you need help with a specific hosting provider, let me know which one you're using and I can provide more detailed instructions.

