# Vercel Deployment Setup Guide

## Issue: 500 Internal Server Error

You're getting 500 errors because the `DATABASE_URL` environment variable is not configured in your Vercel deployment.

## Fix: Configure Environment Variables in Vercel

### Step 1: Set Up Environment Variables

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your `wine-journal` project
3. Click on **Settings** in the top navigation
4. Click on **Environment Variables** in the left sidebar
5. Add the following variables:

#### Required Variables:

**DATABASE_URL**
- **Key**: `DATABASE_URL`
- **Value**: Your Neon database connection string
- **Environment**: Production, Preview, Development (check all three)
- **Format**: `postgresql://username:password@hostname/database?sslmode=require`

Example:
```
postgresql://neondb_owner:xxxxx@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

#### Optional Variables:

**ANTHROPIC_API_KEY** (for wine photo analysis)
- **Key**: `ANTHROPIC_API_KEY`
- **Value**: Your Anthropic API key (starts with `sk-ant-api03-`)
- **Environment**: Production, Preview, Development

### Step 2: Get Your Database URL

If you don't have a Neon database yet:

1. Go to https://console.neon.tech/
2. Sign up or log in
3. Create a new project
4. Go to your project dashboard
5. Find the connection string under "Connection Details"
6. Copy the connection string that looks like:
   ```
   postgresql://username:password@hostname/database?sslmode=require
   ```

### Step 3: Initialize Database Tables

After setting the environment variables:

1. Redeploy your application (Vercel will auto-deploy after env var changes)
2. Navigate to: `https://wine-journal.vercel.app/api/init-db`
3. This will create the necessary database tables

Or use curl:
```bash
curl -X POST https://wine-journal.vercel.app/api/init-db
```

### Step 4: Verify Everything Works

1. Go to https://wine-journal.vercel.app
2. Sign up for a new account
3. Try adding a wine
4. The errors should be gone!

## Current Error Improvements

I've updated the code to provide better error messages when DATABASE_URL is missing:

- **Before**: Generic "Internal Server Error" with no details
- **After**: Clear message: "Database is not configured. Please contact support."

This will help you identify configuration issues faster in the future.

## Environment Variable Checklist

- [ ] DATABASE_URL is set in Vercel
- [ ] DATABASE_URL is set for Production environment
- [ ] DATABASE_URL is set for Preview environment (optional)
- [ ] ANTHROPIC_API_KEY is set (if using wine photo analysis)
- [ ] Redeployed after adding environment variables
- [ ] Ran `/api/init-db` to create tables
- [ ] Tested sign up and wine creation

## Troubleshooting

### Still getting 500 errors after setting DATABASE_URL?

1. **Check the connection string format**:
   - Must start with `postgresql://`
   - Must include `?sslmode=require` at the end
   - No spaces or special characters that aren't URL-encoded

2. **Verify in Vercel**:
   - Go to Settings → Environment Variables
   - Click the eye icon to reveal the DATABASE_URL value
   - Make sure it's correctly formatted

3. **Redeploy**:
   - Go to Deployments tab
   - Click on the latest deployment
   - Click "Redeploy" button

4. **Check Vercel logs**:
   - Go to your deployment
   - Click "View Function Logs"
   - Look for "DATABASE_URL environment variable is not configured!" message

### Wine Analysis Not Working?

If wine photo analysis isn't working:

1. Set the `ANTHROPIC_API_KEY` environment variable
2. Get an API key from https://console.anthropic.com/
3. Redeploy after adding the key

## Testing Locally

To test locally with the same setup:

1. Create a `.env.local` file in your project root:
```env
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

2. Run the dev server:
```bash
npm run dev
```

3. Initialize the database:
```bash
curl -X POST http://localhost:5173/api/init-db
```

## Need Help?

If you continue to experience issues:

1. Check the Vercel function logs for detailed error messages
2. Verify your Neon database is active and accessible
3. Try connecting to your database using a PostgreSQL client to verify the connection string
4. Check that your Neon database hasn't been paused (free tier databases pause after inactivity)

