# 🚀 Campus Utility Deployment Guide

## Step 1: Deploy Backend (Required First)

### Option A: Render.com (Recommended - Free)
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Branch:** `main`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
6. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NODE_ENV`: `production`
7. Deploy! 🎉

### Option B: Railway.app
1. Go to [railway.app](https://railway.app)
2. Import from GitHub
3. Set root directory to `server`
4. Add MongoDB environment variable
5. Deploy

## Step 2: Get Backend URL
After backend deployment, you'll get a URL like:
```
https://campus-utility-api.onrender.com
```

## Step 3: Deploy Frontend to Netlify

### Option A: Netlify Drop (Easiest)
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your `dist` folder
3. Set environment variable:
   - `VITE_API_URL`: `https://your-backend-url.com`

### Option B: Netlify CLI (Better)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd dist
netlify deploy --prod --dir .
```

## Step 4: Update Production Config

### In Netlify Dashboard:
1. Go to Site settings → Environment variables
2. Add: `VITE_API_URL=https://your-backend-url.onrender.com`

### Update Razorpay (if needed):
- Login to Razorpay dashboard
- Update authorized domains to include your Netlify URL

## 🔧 Critical Files to Check

### Backend (server/):
- ✅ `package.json` - Has dependencies
- ✅ `index.js` - Main server file
- ✅ `models.js` - Database schemas
- ❓ `.env` - Add MongoDB URI

### Frontend (dist/):
- ✅ Built React app
- ✅ Static assets
- ❓ Environment variables

## 🚨 Common Issues & Solutions

### Issue: API calls failing
**Solution:** Ensure `VITE_API_URL` is set correctly in Netlify

### Issue: Database connection
**Solution:** Add `MONGODB_URI` to backend environment variables

### Issue: Razorpay payments
**Solution:** Update authorized domains in Razorpay dashboard

## 📋 Pre-Deployment Checklist

- [ ] Backend deployed and working
- [ ] Frontend built (`npm run build`)
- [ ] Environment variables set
- [ ] MongoDB connection tested
- [ ] API endpoints accessible
- [ ] Razorpay configured

## 🎯 Quick Commands

```bash
# Build frontend
npm run build

# Test backend locally
cd server && node index.js

# Deploy to Netlify (CLI)
cd dist && netlify deploy --prod
```

## 🆘 Need Help?

1. **Backend Issues:** Check Render/Railway logs
2. **Frontend Issues:** Check Netlify Function logs
3. **Database Issues:** Verify MongoDB URI
4. **Payment Issues:** Check Razorpay settings

---

**Remember:** Backend must be deployed FIRST before frontend! 🚀
