# 🚀 SABI Diary - Deployment Guide

## Quick Deploy to Netlify (Recommended)

### Option 1: Netlify Drop (Easiest - No Git Required)

1. **Go to Netlify Drop**: https://app.netlify.com/drop
2. **Drag and drop** your entire project folder
3. **Done!** Your site will be live in seconds

### Option 2: Deploy via GitHub (Best for Updates)

#### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `sabi-diary`
3. Keep it **private** (your diary is personal!)
4. Don't initialize with README (we already have files)

#### Step 2: Push Your Code to GitHub

Open PowerShell in your project folder and run:

```powershell
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - SABI Diary with scrapbook design"

# Add your GitHub repository (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/sabi-diary.git

# Push to GitHub
git branch -M main
git push -u origin main
```

#### Step 3: Deploy on Netlify

1. Go to https://app.netlify.com/
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize Netlify
4. Select your `sabi-diary` repository
5. Settings:
   - **Build command**: Leave empty (static site)
   - **Publish directory**: `.` (root)
6. Click **"Deploy site"**

✅ Done! Your site will be live at `https://random-name.netlify.app`

---

## 🔧 Configure Supabase for Production

After deployment, you need to update Supabase settings:

### Step 1: Update Supabase Allowed URLs

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Add your Netlify URL to:
   - **Site URL**: `https://your-site-name.netlify.app`
   - **Redirect URLs**: `https://your-site-name.netlify.app/**`

### Step 2: Update Supabase Config (Optional - Environment Variables)

If you want to hide your Supabase keys:

1. In Netlify Dashboard → **Site settings** → **Environment variables**
2. Add:
   - `SUPABASE_URL` = your Supabase URL
   - `SUPABASE_ANON_KEY` = your Supabase anon key

3. Update `js/supabase-config.js` to use environment variables (advanced)

---

## 🌐 Custom Domain (Optional)

### Connect Your Own Domain

1. Buy a domain (from Namecheap, GoDaddy, etc.)
2. In Netlify Dashboard → **Domain settings** → **Add custom domain**
3. Follow the DNS configuration instructions
4. Netlify will automatically provision SSL certificate

---

## 📱 Testing Your Deployment

After deployment, test:

1. ✅ Homepage loads (`index.html`)
2. ✅ Login page works (`diary.html`)
3. ✅ Photo sticker displays correctly
4. ✅ Email/Password fields work
5. ✅ "Open Diary" button appears after filling fields
6. ✅ Supabase authentication works
7. ✅ Memory pages load
8. ✅ Mobile responsive (390×844)

---

## 🔄 How to Update Your Site

### If using Netlify Drop:
- Just drag and drop the updated folder again

### If using GitHub + Netlify:
```powershell
# Make your changes, then:
git add .
git commit -m "Update: description of changes"
git push
```
Netlify will automatically deploy the updates!

---

## 🆘 Troubleshooting

### Issue: Supabase authentication not working
- Check Supabase allowed URLs include your Netlify domain
- Verify `js/supabase-config.js` has correct credentials

### Issue: Images not loading
- Check image paths are relative (e.g., `assets/images/photos/login.jpeg`)
- Verify files exist in the deployed folder

### Issue: 404 errors
- Check `netlify.toml` is in the root folder
- Verify all HTML files are in the root or properly linked

---

## 📊 Current Deployment Status

- **Hosting**: Not yet deployed
- **Domain**: Will be assigned by Netlify
- **SSL**: Automatic (HTTPS)
- **CDN**: Global (Netlify)
- **Cost**: FREE (Netlify Starter plan)

---

## 🎉 Next Steps

1. Deploy to Netlify using one of the methods above
2. Test your live site
3. Share your diary URL with your friend (if viewer access)
4. Enjoy your beautiful romantic diary! 💝

---

**Need help?** Check Netlify docs: https://docs.netlify.com/
