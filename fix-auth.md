# 🔧 Fix Authentication "Failed to Fetch" Error

## 🚨 Quick Fix Steps:

### 1. Start Backend Server Locally
```bash
# Open terminal and run:
cd server
npm start
```

### 2. Update API Base for Development
If running locally, update `src/api.ts`:
```typescript
export const API_BASE = 'http://localhost:5000'
```

### 3. Check Server Status
Visit: http://localhost:5000
Should see: "Campus Utility Backend is running 🚀"

### 4. Test Authentication Endpoints
```bash
# Test register endpoint
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456"}'

# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

## 🔍 Troubleshooting Steps:

### Step 1: Check Backend Logs
```bash
cd server
npm start
# Look for:
# - "MongoDB connected"
# - "Server running on port 5000"
# - Any error messages
```

### Step 2: Verify Environment Variables
Create `.env` file in server directory:
```env
MONGODB_URI=mongodb://localhost:27017/campus-utility
PORT=5000
GEMINI_API_KEY=your_gemini_key_here
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### Step 3: Check MongoDB Connection
```bash
# Make sure MongoDB is running
mongosh
# or
net start MongoDB
```

### Step 4: Clear Browser Cache
- Open browser DevTools (F12)
- Go to Application tab
- Clear Local Storage
- Clear Cookies
- Refresh page

### Step 5: Check Network Tab
- Open browser DevTools
- Go to Network tab
- Try to login/register
- Look for failed requests
- Check error messages

## 🚀 Alternative Solutions:

### Option 1: Use Production Backend
If backend is deployed, ensure:
1. Backend URL is correct in `src/api.ts`
2. Backend is running on Render/Heroku
3. No firewall blocking requests

### Option 2: Local Development Setup
```bash
# Terminal 1 - Start Backend
cd server
npm start

# Terminal 2 - Start Frontend
cd ..
npm run dev
```

### Option 3: Check CORS Issues
If CORS errors occur, update server CORS:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

## 🐛 Common Error Messages:

### "Failed to fetch"
- Backend server not running
- Wrong API URL
- Network connectivity issues
- CORS configuration

### "Network error"
- Server not responding
- Wrong port number
- Firewall blocking

### "404 Not Found"
- Wrong endpoint URL
- Server routing issues

### "500 Internal Server Error"
- Database connection issues
- Server code errors
- Missing environment variables

## ✅ Success Indicators:

### Backend Working:
- ✅ "Campus Utility Backend is running 🚀" at root
- ✅ MongoDB connection successful
- ✅ No server errors in console

### Frontend Working:
- ✅ Can register new user
- ✅ Can login with credentials
- ✅ Redirect to dashboard after login
- ✅ User data stored in localStorage

## 🆘 If Still Not Working:

1. Check backend console for errors
2. Verify MongoDB is running
3. Check environment variables
4. Try different browser
5. Disable browser extensions
6. Check antivirus/firewall settings
7. Restart both frontend and backend
