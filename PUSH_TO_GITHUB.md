# 🚀 Quick Deploy - Copy & Paste Commands

## ✅ Step 1 & 2: COMPLETE! Code Pushed to GitHub

Your code is now live at: **https://github.com/asafbruner/wine-journal**

```
✅ Repository: asafbruner/wine-journal
✅ Branch: main
✅ Files: 102 files (19,162 lines)
✅ Status: Ready to deploy!
```

## Step 3: Deploy to Vercel

### 🌐 Via Website (Easiest - 2 minutes):

1. **Go to:** https://vercel.com/new
2. **Import** your `wine-journal` repository
3. **Framework:** Next.js (auto-detected ✅)
4. **Add these environment variables:**

```env
# Required
DATABASE_URL=file:./prod.db
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=YOUR_RANDOM_SECRET_HERE

# Optional (for AI features)
OPENAI_API_KEY=sk-your-key-here
```

5. **Click Deploy** 🚀
6. **Done!** Visit your app at `https://your-app.vercel.app`

### 💻 Via CLI (Alternative):

```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel login
vercel --prod
```

## Generate NEXTAUTH_SECRET

### On Windows (Git Bash or WSL):
```bash
openssl rand -base64 32
```

### On Windows (PowerShell):
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

### Online:
Visit: https://generate-secret.vercel.app/32

---

## ✅ What's Included

Your deployment includes:
- ✅ Full Wine Journal application
- ✅ 46 passing tests
- ✅ 0 TypeScript errors
- ✅ 0 linting errors
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Production-ready code

## 📦 Optional Upgrades (After Deployment)

### Use Vercel Postgres (Recommended):
1. In Vercel Dashboard → Storage → Create Database
2. Select PostgreSQL
3. Connect to project
4. DATABASE_URL automatically added!

### Enable AI Features:
1. Get OpenAI API key: https://platform.openai.com/api-keys
2. Add `OPENAI_API_KEY` to Vercel environment variables
3. Redeploy

### Enable Image Hosting:
1. Sign up for Cloudinary: https://cloudinary.com
2. Add these env vars:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

### Enable OAuth Login:
**GitHub:**
- https://github.com/settings/developers
- Add `GITHUB_ID` and `GITHUB_SECRET`

**Google:**
- https://console.cloud.google.com
- Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

---

## 🆘 Need Help?

See `DEPLOYMENT_GUIDE.md` for detailed instructions!

**Your app is ready to deploy! 🎉**
