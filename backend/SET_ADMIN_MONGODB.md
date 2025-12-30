# Easy Way to Set Yourself as Admin

## Option 1: Using MongoDB Compass (Easiest)

1. Open **MongoDB Compass**
2. Connect to your database (using your existing connection string)
3. Navigate to your database (usually `myseogenerator` or similar)
4. Find the **`users`** collection
5. Find your user document (search for your email: `your-smh4life@gmail.com`)
6. Click on the document to edit it
7. Add this field: `"isAdmin": true`
8. Click **Update**

That's it! Now log out and log back in to your account.

## Option 2: Using MongoDB Shell (Command Line)

If you have MongoDB shell installed, run:

```bash
mongosh "your-mongodb-connection-string"
```

Then run this command (replace `your-smh4life@gmail.com` with your email):

```javascript
db.users.updateOne(
  { email: "your-smh4life@gmail.com" },
  { $set: { isAdmin: true } }
)
```

## Option 3: Using MongoDB Atlas Web Interface

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click on your cluster
3. Click **Browse Collections**
4. Select your database
5. Find the **`users`** collection
6. Find your user document (search for your email)
7. Click **Edit Document**
8. Add: `"isAdmin": true`
9. Click **Update**

## After Setting Admin Status

1. **Log out** of your account on the website
2. **Log back in** with your credentials
3. You now have full admin access to everything!

---

**Note:** You don't need a special MongoDB username/password - you just need to update your user document in the database to have `isAdmin: true`. The MongoDB connection you already have is fine.

