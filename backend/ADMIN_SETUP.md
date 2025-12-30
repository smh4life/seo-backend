# Admin Access Setup

This guide explains how to set yourself (or another user) as an admin to access all features without plan restrictions.

## Quick Setup

### Step 1: Register Your Account

1. Go to the registration page (`/register`)
2. Create an account with your email and password
3. Note your email address

### Step 2: Set Yourself as Admin

Run this command from the `backend` directory:

```bash
cd backend
node scripts/setAdmin.js your-email@example.com
```

Replace `your-email@example.com` with the email you used to register.

### Step 3: Log Out and Log Back In

1. Log out of your account
2. Log back in with your credentials
3. You now have full admin access to all features!

## What Admin Access Gives You

- ✅ **Unlimited Single Generator** - No restrictions
- ✅ **Unlimited Batch Generator** - Full access
- ✅ **SEO-Pro Generator** - Full access with all features
- ✅ **All Templates & Distributors** - Complete access
- ✅ **No Payment Required** - Bypass all plan restrictions

## Setting Other Users as Admin

You can set other users as admin using the same script:

```bash
node scripts/setAdmin.js their-email@example.com
```

## Admin API Endpoints

Once you're an admin, you can also use these API endpoints (requires admin authentication):

- `GET /admin/users` - View all users
- `POST /admin/set-admin` - Set a user as admin (requires admin token)

Example:
```javascript
// Set a user as admin via API
fetch('http://localhost:3000/admin/set-admin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    isAdmin: true
  })
});
```

## Troubleshooting

**"User not found" error:**
- Make sure the user has registered first
- Check that you're using the exact email address (case-sensitive)

**"MONGODB_URI not found" error:**
- Make sure your `.env` file in the `backend` directory has `MONGODB_URI` set

**Still seeing plan restrictions:**
- Log out and log back in to refresh your JWT token
- The token needs to be regenerated to include the `isAdmin` flag

