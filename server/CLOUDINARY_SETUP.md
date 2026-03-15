# Cloudinary Setup Instructions

## Overview
Images are now uploaded to Cloudinary instead of local storage. This solves the issue of images being lost when Render restarts due to ephemeral storage.

## Changes Made

### 1. Dependencies Installed
```bash
npm install cloudinary multer-storage-cloudinary
```

### 2. New Files Created
- `server/cloudinary.js` - Cloudinary configuration
- `server/upload.js` - Multer middleware for Cloudinary storage

### 3. Updated Files
- `server/index.js` - Updated to use Cloudinary upload middleware
- `server/package.json` - Added new dependencies

## Environment Variables Required

Add these to your Render Dashboard → Environment Variables:

```
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key  
CLOUDINARY_SECRET=your_api_secret
```

## How to Get Cloudinary Credentials

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → Settings → API Keys
3. Copy your:
   - Cloud name
   - API Key  
   - API Secret

## Architecture

**Before:**
```
React → Node.js → Local Files (/uploads)
```

**After:**
```
React → Node.js → Cloudinary (CDN)
        ↓
    MongoDB Atlas (data only)
```

## Database Changes

The database now stores Cloudinary URLs instead of local filenames:

**Before:**
```json
{
  "image": "1773510373391-33951326-kiran1.jpg"
}
```

**After:**
```json
{
  "image": "https://res.cloudinary.com/demo/image/upload/v171234/apron.jpg"
}
```

## Frontend Changes Required

No changes needed! The frontend already displays images using the `image` field, which now contains the full Cloudinary URL.

## Benefits

✅ Images persist across deployments  
✅ Faster loading via CDN  
✅ Automatic image optimization  
✅ No more local storage issues  
✅ Scalable for production  

## Testing

1. Set up Cloudinary account
2. Add environment variables to Render
3. Deploy and test image uploads
4. Verify images display correctly in frontend
