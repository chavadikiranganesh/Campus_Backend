# Render Environment Variables Setup

## Required Environment Variables for Render Dashboard

Add these exact values to your Render Dashboard → Environment Variables:

### Cloudinary Configuration
```
CLOUDINARY_NAME=dsjj7tnvx
CLOUDINARY_KEY=743786878184576
CLOUDINARY_SECRET=YZXaS7kIOw_HgWpYeuz7-D3ixwM
```

### Database
```
MONGODB_URI=your_mongodb_atlas_connection_string
```

### Other Services (if already configured)
```
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
GEMINI_API_KEY=your_gemini_api_key
```

### Server Configuration
```
PORT=5000
NODE_ENV=production
```

## Steps to Add Environment Variables in Render:

1. Go to your Render Dashboard
2. Select your service
3. Go to "Environment" tab
4. Add each variable as a "Key-Value" pair
5. Click "Save Changes"
6. Trigger a new deployment

## Important Notes:

- ✅ Cloudinary credentials are pre-filled above
- ✅ Copy these exactly as shown (no extra spaces)
- ✅ Make sure MongoDB URI is your Atlas connection string
- ✅ After deployment, test image uploads to verify Cloudinary integration

Your images will now be stored permanently in Cloudinary and won't be lost during deployments!
