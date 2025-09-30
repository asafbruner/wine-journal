# 🚀 Deployment Guide - Push to Git & Deploy to Vercel

## ✅ Current Status
- Git repository initialized
- All files committed
- Ready to push and deploy!

## Step 1: Create GitHub Repository

### Option A: Via GitHub Website (Recommended)
1. Go to https://github.com/new
2. Repository name: `wine-journal`
3. Description: "A beautiful wine tasting journal with AI-powered insights"
4. Visibility: Private (or Public)
5. **DON'T** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### Option B: Via GitHub CLI
```bash
gh repo create wine-journal --private --source=. --remote=origin
```

## Step 2: Push to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/wine-journal.git

# Or if you use SSH:
git remote add origin git@github.com:YOUR_USERNAME/wine-journal.git

# Push to GitHub
git push -u origin master
```

**If you see an error about 'master' vs 'main':**
```bash
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Via Vercel Website (Recommended)
1. Go to https://vercel.com/new
2. Sign in with GitHub
3. Import your `wine-journal` repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: ./
   - **Build Command**: `npx prisma generate && npm run build`
   - **Install Command**: `npm install`

5. **Add Environment Variables** (CRITICAL!):
   ```
   DATABASE_URL=file:./prod.db
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
   
   # Optional (for AI features):
   OPENAI_API_KEY=sk-...
   
   # Optional (for image hosting):
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Optional (for OAuth):
   GITHUB_ID=your-github-oauth-id
   GITHUB_SECRET=your-github-oauth-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # Optional (for email):
   EMAIL_SERVER_HOST=smtp.gmail.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=your-email@gmail.com
   EMAIL_SERVER_PASSWORD=your-app-password
   EMAIL_FROM=noreply@your-domain.com
   ```

6. Click **Deploy**
7. Wait 2-3 minutes for deployment
8. Get your URL: `https://wine-journal-xyz.vercel.app`

### Option B: Via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (your username)
# - Link to existing project? N
# - Project name: wine-journal
# - Directory: ./
# - Want to modify settings? N

# Add environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
# ... add all other env vars
```

## Step 4: Configure Production Database

For production, you'll need a real database instead of SQLite.

### Recommended: Vercel Postgres
```bash
# In Vercel Dashboard:
# 1. Go to Storage tab
# 2. Create Database → Postgres
# 3. Connect to your project
# 4. Vercel will automatically add DATABASE_URL
```

### Update prisma/schema.prisma:
```prisma
datasource db {
  provider = "postgresql"  // Change from sqlite
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Run migrations:
```bash
# In Vercel, migrations run automatically during build
# Or manually:
vercel env pull .env.production
npx prisma migrate deploy
```

## Step 5: Configure OAuth Providers (Optional)

### GitHub OAuth:
1. Go to https://github.com/settings/developers
2. New OAuth App
3. Application name: Wine Journal
4. Homepage URL: `https://your-app.vercel.app`
5. Authorization callback URL: `https://your-app.vercel.app/api/auth/callback/github`
6. Copy Client ID and Client Secret to Vercel env vars

### Google OAuth:
1. Go to https://console.cloud.google.com
2. Create project
3. Enable Google+ API
4. Create OAuth 2.0 Client ID
5. Authorized redirect URIs: `https://your-app.vercel.app/api/auth/callback/google`
6. Copy Client ID and Client Secret to Vercel env vars

## Step 6: Test Production Deployment

1. Visit your Vercel URL
2. Sign in (test OAuth or email)
3. Add a wine
4. Create a tasting note
5. Test AI features (if configured)
6. Export CSV
7. Check that everything works!

## Quick Commands Reference

```bash
# Push code changes
git add .
git commit -m "your commit message"
git push

# Deploy to production (if using CLI)
vercel --prod

# View logs
vercel logs

# Open in browser
vercel open
```

## Environment Variables Checklist

### Required:
- [x] `DATABASE_URL` - Database connection
- [x] `NEXTAUTH_URL` - Your app URL
- [x] `NEXTAUTH_SECRET` - Random secret (openssl rand -base64 32)

### Optional (AI Features):
- [ ] `OPENAI_API_KEY` - For AI summaries

### Optional (Images):
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`

### Optional (OAuth):
- [ ] `GITHUB_ID` & `GITHUB_SECRET`
- [ ] `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`

### Optional (Email):
- [ ] `EMAIL_SERVER_HOST`
- [ ] `EMAIL_SERVER_PORT`
- [ ] `EMAIL_SERVER_USER`
- [ ] `EMAIL_SERVER_PASSWORD`
- [ ] `EMAIL_FROM`

## Troubleshooting

### Build fails on Vercel?
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify environment variables are set

### Database errors?
- Verify DATABASE_URL is set
- Check Prisma schema matches database
- Run migrations: `npx prisma migrate deploy`

### OAuth not working?
- Verify callback URLs match exactly
- Check environment variables are set
- Ensure NEXTAUTH_URL is correct

### Images not uploading?
- Set up Cloudinary environment variables
- Or remove image upload feature temporarily

## Next Steps

1. ✅ Push to GitHub
2. ✅ Deploy to Vercel  
3. ✅ Configure environment variables
4. ✅ Set up production database
5. ✅ Configure OAuth (optional)
6. ✅ Test everything
7. 🎉 Share your app!

## Custom Domain (Optional)

1. In Vercel Dashboard → Settings → Domains
2. Add custom domain: `wine-journal.your-domain.com`
3. Update DNS records (Vercel provides instructions)
4. Update `NEXTAUTH_URL` environment variable

---

**Your app is ready for production! 🚀**
