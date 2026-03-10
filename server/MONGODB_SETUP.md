# MongoDB Setup Guide for Campus Utility

## Prerequisites

- Node.js (v14+)
- MongoDB (local installation or MongoDB Atlas cloud account)

## Installation Steps

### 1. MongoDB Installation

#### Option A: Local MongoDB (Windows)
1. Download MongoDB Community Edition from: https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. MongoDB will typically run on `localhost:27017`

#### Option B: MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)

### 2. Environment Configuration

Create a `.env` file in the `server/` directory (copy from `.env.example`):

```env
MONGODB_URI=mongodb://localhost:27017/campus-utility
PORT=5000
NODE_ENV=development
```

For MongoDB Atlas, replace with your connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campus-utility
PORT=5000
NODE_ENV=development
```

### 3. Start the Server

```bash
cd server
npm install  # Already done - just in case
npm run dev  # For development with nodemon
# or
npm start    # For production
```

The server will:
- Connect to MongoDB
- Create collections automatically if they don't exist
- Start listening on port 5000

## Database Schema

### Collections Created:

1. **Users** - Authentication and user profiles
   - id, name, email, password, role, createdAt, lastLoginAt

2. **StudyMaterials** - Study materials listings
   - id, title, category, course, semester, condition, type, price, owner, postedByUserId

3. **Accommodations** - PG/Hostel listings
   - id, name, distance, rent, occupancy, facilities, contact, photos

4. **LostFound** - Lost and found items
   - id, type (lost/found), title, description, location, contact, createdAt, postedByUserId

5. **Events** - Campus events
   - id, title, date, time, venue, description, createdAt

6. **StudyGroups** - Study group listings
   - id, subject, course, semester, description, members, createdBy, createdAt

7. **LoginLogs** - User login history
   - userId, email, timestamp, status

8. **Notifications** - System notifications
   - userId, title, message, read, createdAt

## API Endpoints

All existing API endpoints work the same way:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password

### Study Materials
- `GET /api/materials` - Get all materials
- `POST /api/materials` - Create new material
- `DELETE /api/materials/:id` - Delete material

### Lost & Found
- `GET /api/lost-found` - Get all items
- `POST /api/lost-found` - Create new item

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)

### Study Groups
- `GET /api/study-groups` - Get all groups
- `POST /api/study-groups` - Create new group
- `POST /api/study-groups/:id/join` - Join a group

### Accommodations
- `GET /api/accommodations` - Get all accommodations
- `POST /api/accommodations` - Create accommodation
- `DELETE /api/accommodations/:id` - Delete accommodation

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/users/:id/activity` - Get user activity (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Create notification

### Search
- `GET /api/search?q=query` - Global search

## Default Admin Account

After first run, a default admin account is created:
- **Email**: admin@campus-utility.com
- **Password**: admin123

⚠️ Change this password in production!

## Troubleshooting

### MongoDB Connection Error
- Verify MongoDB is running: `mongosh` (or `mongo` for older versions)
- Check connection string in `.env`
- Ensure firewall allows MongoDB port (27017)

### Port Already in Use
- Change PORT in `.env` to a different port (e.g., 5001)
- Or kill the process using port 5000

### Data Not Persisting
- Check MongoDB is actually running
- Verify `.env` MONGODB_URI is correct
- Check MongoDB logs for connection errors

## Migration from JSON Storage

The old JSON-based store.js is no longer used. Data is now stored in MongoDB. If you need to migrate old data:

1. Export data from store.json
2. Import into MongoDB collections using MongoDB Compass or mongoimport

## Next Steps

1. **Frontend**: Update API base URL if needed in `src/api.ts`
2. **Production**: Use MongoDB Atlas connection string
3. **Security**: Add password hashing with bcrypt
4. **Auth**: Implement JWT tokens for better security
5. **Validation**: Add request validation middleware

## References

- MongoDB Documentation: https://docs.mongodb.com
- Mongoose Documentation: https://mongoosejs.com
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
