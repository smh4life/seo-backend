# MongoDB Setup Guide

## Quick Setup Options

### Option 1: MongoDB Atlas (Free Cloud Database - Recommended)

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a free cluster (M0 - Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
6. Replace `<password>` with your database password
7. Add to your `backend/.env` file:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/myseogenerator?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB

1. Install MongoDB locally: https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Add to your `backend/.env` file:
   ```
   MONGO_URI=mongodb://localhost:27017/myseogenerator
   ```

### Option 3: Skip MongoDB for Now (Temporary)

If you don't want to set up MongoDB right now, the registration won't work, but you can still use the app for other features.

## After Adding MONGO_URI

1. Restart your backend server
2. You should see: `🗄️ MongoDB connected`
3. Registration and login will work!

