# MongoDB Integration - Quick Start

## What's New?

Your Campus Utility backend has been upgraded to use **MongoDB** instead of JSON file storage! 

## Files Added/Modified

✅ **New Files:**
- `db.js` - MongoDB connection configuration
- `models.js` - Mongoose schemas for all data collections
- `.env` - Environment variables (already configured for local MongoDB)
- `.env.example` - Template for environment variables
- `.gitignore` - Updated to exclude .env and node_modules
- `MONGODB_SETUP.md` - Detailed setup and troubleshooting guide

✅ **Modified Files:**
- `index.js` - Updated to use MongoDB instead of JSON storage
- `package.json` - Added mongoose and dotenv dependencies

## Quick Start (3 Steps)

### 1. Install MongoDB
**Windows:**
- Download from: https://www.mongodb.com/try/download/community
- Install and run (default: localhost:27017)

**Or use MongoDB Atlas (Cloud - Free):**
- Sign up at: https://www.mongodb.com/cloud/atlas
- Create a cluster and get connection string
- Update `.env` file with your connection string

### 2. Start Backend
```bash
cd server
npm run dev
```

You should see:
```
MongoDB connected successfully
Campus Utility backend running on http://localhost:5000
```

### 3. Test It Out
```bash
# Health check
curl http://localhost:5000/api/health
```

## Key Benefits

✨ **Benefits of MongoDB over JSON:**
- ✅ Scalability - Handle millions of records efficiently
- ✅ Real-time - Instant data persistence
- ✅ Query Power - Advanced filtering and searching
- ✅ Transactions - Multi-document ACID transactions
- ✅ Backup - Built-in cloud backup with Atlas
- ✅ No File I/O - Faster than disk-based JSON

## Connection String Options

### Local MongoDB
```
mongodb://localhost:27017/campus-utility
```

### MongoDB Atlas (Cloud)
```
mongodb+srv://username:password@cluster.mongodb.net/campus-utility
```

Update in `.env` file as needed.

## Default Admin Account

- **Email:** admin@campus-utility.com
- **Password:** admin123

⚠️ **Important:** Change this in production!

## API Compatibility

✅ **All existing API endpoints work exactly the same!**

No changes needed in your frontend code. The API interface remains identical.

## Troubleshooting

**"MongoDB connection error"**
- Is MongoDB running? (Windows Services or terminal)
- Wrong connection string? Check `.env` file
- Firewall blocking port 27017?

**"Port 5000 already in use"**
- Change PORT in `.env` to another port
- Or kill process: `lsof -ti:5000 | xargs kill -9` (Mac/Linux)

**Need help?**
See `MONGODB_SETUP.md` for detailed troubleshooting and configuration.

## Next Steps

1. 🗄️ Verify MongoDB is running
2. ▶️ Start server: `npm run dev`
3. 🧪 Test endpoints: Use Postman or curl
4. 🔧 For production: Use MongoDB Atlas connection string
5. 🔐 Implement JWT tokens and password hashing (optional but recommended)

---

**Questions?** Refer to `MONGODB_SETUP.md` for comprehensive documentation.
