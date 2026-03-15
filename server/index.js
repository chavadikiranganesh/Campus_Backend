require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const Razorpay = require("razorpay")
const { GoogleGenerativeAI } = require('@google/generative-ai')
const bcrypt = require('bcrypt')
const { upload, uploadLostFound, uploadAccommodation } = require('./upload')
const { User, Order, StudyMaterial, Accommodation, LostFound, Event, StudyGroup, LoginLog, Notification, MedicalHelp, Payment } = require('./models')
const { authenticate, checkOwnership, requireAdmin } = require('./middleware/auth')

// Razorpay Setup
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

// Gemini AI Setup
const hasGeminiKey = !!process.env.GEMINI_API_KEY

// File upload middleware is now handled by upload.js
console.log('Gemini API Key from env:', hasGeminiKey ? 'SET' : 'NOT SET')

let genAI = null
let geminiModel = null

if (hasGeminiKey) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  // Use a v2 flash model; 1.5 models return 404 for many new projects
  geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected')
  })
  .catch(err => console.log('MongoDB connection error:', err))

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}))

// Cloudinary images are served from CDN, no static folder needed

// Root route
app.get("/", (req, res) => {
  res.send("Campus Utility Backend is running 🚀");
})

// Create Payment Order API
app.post("/api/create-order", async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;

    // Check if Razorpay is available
    if (!razorpay) {
      return res.status(503).json({ 
        error: 'Payment service is currently unavailable',
        details: 'RAZORPAY_NOT_CONFIGURED'
      });
    }

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const options = {
      amount: amount, // Amount is already in paise from frontend
      currency: currency || "INR",
      receipt: receipt || `receipt_${Date.now()}`
    };

    console.log('Creating Razorpay order with options:', options);
    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created successfully:', order.id);
    
    res.json(order);

  } catch (error) {
    console.error('Create order error:', error);
    
    // Handle specific Razorpay errors
    if (error.statusCode === 401) {
      res.status(500).json({ 
        error: 'Payment gateway authentication failed. Please check Razorpay credentials.',
        details: 'RAZORPAY_AUTH_ERROR'
      });
    } else if (error.statusCode === 400) {
      res.status(400).json({ 
        error: 'Invalid request parameters',
        details: error.error?.description || 'Bad request'
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to create payment order',
        details: error.message || 'Internal server error'
      });
    }
  }
});

async function isAdmin(userId) {
  try {
    const user = await User.findOne({ id: Number(userId) })
    return user && user.role === 'admin'
  } catch (error) {
    return false
  }
}

// --- Auth ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {}
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' })
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(String(email))) {
      return res.status(400).json({ message: 'Please enter a valid email address.' })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ message: 'User with this email already exists.' })
    }

    // Get next user ID
    const lastUser = await User.findOne().sort({ id: -1 })
    const nextId = lastUser ? lastUser.id + 1 : 1

    // Hash password with bcrypt
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const user = new User({
      id: nextId,
      name,
      email,
      password: hashedPassword, // Store hashed password
      role: 'user',
      createdAt: new Date(),
      lastLoginAt: null,
    })
    await user.save()

    const { password: _, ...safeUser } = user.toObject()
    res.status(201).json(safeUser)
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'Registration failed' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    
    // Find user by email (not by password since it's now hashed)
    const user = await User.findOne({ email }).select('+password') // Explicitly include password field

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    // Check if password is hashed (60+ characters) or plain text
    let isMatch
    if (user.password && user.password.length >= 60) {
      // Password is already hashed, use bcrypt comparison
      isMatch = await bcrypt.compare(password, user.password)
    } else {
      // Password is plain text, compare directly and then hash it
      isMatch = password === user.password
      if (isMatch) {
        // Hash the plain text password for future security
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        await User.updateOne(
          { _id: user._id },
          { password: hashedPassword }
        )
      }
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    user.lastLoginAt = new Date()
    await user.save()

    // Log the login
    const loginLog = new LoginLog({
      userId: user._id,
      email: user.email,
      timestamp: new Date(),
      status: 'success',
    })
    await loginLog.save()

    const { password: _, ...safeUser } = user.toObject()
    res.json(safeUser)
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Login failed' })
  }
})

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {}
    const user = await User.findOne({ email })
    const token = Math.random().toString(36).slice(2) + Date.now()
    
    // Store reset token in a collection (you may want to create a ResetToken model)
    // For now, we'll use a simple approach with a document
    res.json({
      message: user
        ? 'If this email is registered, a reset link would be sent. Demo: use the link below.'
        : 'If this email is registered, a reset link would be sent.',
      demoResetLink: user ? `/reset-password?token=${token}` : null,
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ message: 'Request failed' })
  }
})

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body || {}
    if (!token || !password || password.length < 6) {
      return res.status(400).json({ message: 'Token and password (min 6 chars) required.' })
    }
    
    // For demo purposes, we'll just update the password
    // In production, implement proper token validation with expiration
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
      return res.status(400).json({ message: 'User not found.' })
    }
    
    user.password = password
    await user.save()
    
    res.json({ message: 'Password updated. You can log in now.' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ message: 'Password reset failed' })
  }
})

// --- Routes ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Campus Utility backend is running' })
})

// Study materials
app.get('/api/materials', async (req, res) => {
  try {
    const materials = await StudyMaterial.find()
    res.json(materials)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch materials' })
  }
})

app.post('/api/materials', upload.single('image'), async (req, res) => {
  try {
    const payload = req.body || {}
    const userId = payload.userId ? Number(payload.userId) : null
    
    // Validation - Check required fields
    const requiredFields = ['title', 'price', 'condition', 'owner']
    const missingFields = requiredFields.filter(field => !payload[field])
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields 
      })
    }
    
    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        message: 'Image is required',
        missingFields: ['image']
      })
    }
    
    // Get next ID
    const lastMaterial = await StudyMaterial.findOne().sort({ id: -1 })
    const nextId = lastMaterial ? lastMaterial.id + 1 : 1
    
    // Store the Cloudinary URL
    const imageUrl = req.file.path
    
    // Find user ObjectId if userId is provided
    let userObjectId = null
    if (userId) {
      const user = await User.findOne({ id: userId })
      userObjectId = user ? user._id : null
    }
    
    const newItem = new StudyMaterial({
      id: nextId,
      title: payload.title,
      category: payload.category || 'Book',
      course: payload.course || 'Unknown',
      semester: payload.semester || '1',
      condition: payload.condition,
      type: payload.type || 'For Sale',
      price: payload.price,
      owner: payload.owner,
      ownerContact: payload.ownerContact || '',
      image: imageUrl,
      description: payload.description || '',
      postedByUserId: userObjectId,
    })
    await newItem.save()

    // Broadcast notification about new study material (visible to all users)
    try {
      const notification = new Notification({
        userId: null,
        title: `New study material: ${newItem.title}`,
        message: `${newItem.course || 'Course'} · ${newItem.category || 'Material'} · ${newItem.price || ''}`,
        read: false,
      })
      await notification.save()
    } catch (e) {
      // Notification failure shouldn't block material creation
      console.error('Create material notification error:', e)
    }

    res.status(201).json(newItem)
  } catch (error) {
    console.error('Create material error:', error)
    res.status(500).json({ message: 'Failed to create material' })
  }
})

// Materials UPDATE
app.put('/api/materials/:id', upload.single('image'), authenticate, checkOwnership('StudyMaterial'), async (req, res) => {
  try {
    const material = req.item
    const payload = req.body || {}
    
    // Update fields
    if (payload.title) material.title = payload.title
    if (payload.category) material.category = payload.category
    if (payload.course) material.course = payload.course
    if (payload.semester) material.semester = payload.semester
    if (payload.condition) material.condition = payload.condition
    if (payload.type) material.type = payload.type
    if (payload.price) material.price = payload.price
    if (payload.owner) material.owner = payload.owner
    if (payload.ownerContact) material.ownerContact = payload.ownerContact
    if (payload.description) material.description = payload.description
    
    // Handle image update
    if (req.file) {
      material.image = req.file.path
    }
    
    await material.save()
    res.json(material)
  } catch (error) {
    console.error('Update material error:', error)
    res.status(500).json({ message: 'Failed to update material' })
  }
})

app.delete('/api/materials/:id', authenticate, checkOwnership('StudyMaterial'), async (req, res) => {
  try {
    await StudyMaterial.findOneAndDelete({ id: req.item.id })
    res.json({ message: 'Material deleted successfully' })
  } catch (error) {
    console.error('Delete material error:', error)
    res.status(500).json({ message: 'Failed to delete material' })
  }
})

// Lost & Found
app.get('/api/lost-found', async (req, res) => {
  try {
    const items = await LostFound.find()
    res.json(items)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch items' })
  }
})

app.post('/api/lost-found', uploadLostFound.single('image'), async (req, res) => {
  try {
    const payload = req.body || {}
    const userId = payload.userId ? Number(payload.userId) : null
    
    // Validation - Check required fields
    const requiredFields = ['title', 'location', 'contact']
    const missingFields = requiredFields.filter(field => !payload[field])
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields 
      })
    }
    
    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        message: 'Image is required',
        missingFields: ['image']
      })
    }
    
    // Get next ID
    const lastItem = await LostFound.findOne().sort({ id: -1 })
    const nextId = lastItem ? lastItem.id + 1 : 1
    
    // Store the Cloudinary URL
    const imageUrl = req.file.path
    
    // Find user ObjectId if userId is provided
    let userObjectId = null
    if (userId) {
      const user = await User.findOne({ id: userId })
      userObjectId = user ? user._id : null
    }
    
    const item = new LostFound({
      id: nextId,
      type: payload.type || 'found',
      title: payload.title,
      description: payload.description || '',
      location: payload.location,
      contact: payload.contact,
      image: imageUrl,
      createdAt: new Date(),
      postedByUserId: userObjectId,
    })
    await item.save()
    res.status(201).json(item)
  } catch (error) {
    console.error('Create lost-found error:', error)
    res.status(500).json({ message: 'Failed to create item' })
  }
})

// Lost & Found UPDATE
app.put('/api/lost-found/:id', uploadLostFound.single('image'), authenticate, checkOwnership('LostFound'), async (req, res) => {
  try {
    const item = req.item
    const payload = req.body || {}
    
    // Update fields
    if (payload.type) item.type = payload.type
    if (payload.title) item.title = payload.title
    if (payload.description) item.description = payload.description
    if (payload.location) item.location = payload.location
    if (payload.contact) item.contact = payload.contact
    
    // Handle image update
    if (req.file) {
      item.image = req.file.path
    }
    
    await item.save()
    res.json(item)
  } catch (error) {
    console.error('Update lost-found error:', error)
    res.status(500).json({ message: 'Failed to update item' })
  }
})

// Lost & Found DELETE
app.delete('/api/lost-found/:id', authenticate, checkOwnership('LostFound'), async (req, res) => {
  try {
    await LostFound.findOneAndDelete({ id: req.item.id })
    res.json({ message: 'Item deleted successfully' })
  } catch (error) {
    console.error('Delete lost-found error:', error)
    res.status(500).json({ message: 'Failed to delete item' })
  }
})

// Events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find()
    res.json(events)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events' })
  }
})

app.post('/api/events', async (req, res) => {
  try {
    const adminId = req.headers['x-user-id']
    if (!(await isAdmin(adminId))) return res.status(403).json({ message: 'Admin only' })
    
    const payload = req.body || {}
    
    // Get next ID
    const lastEvent = await Event.findOne().sort({ id: -1 })
    const nextId = lastEvent ? lastEvent.id + 1 : 1
    
    const event = new Event({
      id: nextId,
      title: payload.title || 'Untitled Event',
      date: payload.date || '',
      time: payload.time || '',
      venue: payload.venue || '',
      description: payload.description || '',
    })
    await event.save()
    
    // Create notification
    const notification = new Notification({
      userId: null,
      title: `New event: ${event.title}`,
      message: `${event.date}${event.time ? ` · ${event.time}` : ''}${event.venue ? ` · ${event.venue}` : ''}`,
      read: false,
    })
    await notification.save()
    
    res.status(201).json(event)
  } catch (error) {
    console.error('Create event error:', error)
    res.status(500).json({ message: 'Failed to create event' })
  }
})

app.delete('/api/events/:id', async (req, res) => {
  try {
    const adminId = req.headers['x-user-id']
    if (!(await isAdmin(adminId))) return res.status(403).json({ message: 'Admin only' })
    
    const id = Number(req.params.id)
    const event = await Event.findOneAndDelete({ id })
    if (!event) return res.status(404).json({ message: 'Event not found' })
    res.json(event)
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete event' })
  }
})

// Study groups
app.get('/api/study-groups', async (req, res) => {
  try {
    const groups = await StudyGroup.find().populate('members').populate('createdBy')
    res.json(groups)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch study groups' })
  }
})

app.post('/api/study-groups', async (req, res) => {
  try {
    const payload = req.body || {}
    const userId = payload.userId ? Number(payload.userId) : null
    
    // Get next ID
    const lastGroup = await StudyGroup.findOne().sort({ id: -1 })
    const nextId = lastGroup ? lastGroup.id + 1 : 1
    
    // Find user ObjectId if userId is provided
    let userObjectId = null
    if (userId) {
      const user = await User.findOne({ id: userId })
      userObjectId = user ? user._id : null
    }
    
    const group = new StudyGroup({
      id: nextId,
      subject: payload.subject || 'General',
      course: payload.course || '',
      semester: payload.semester || '',
      size: payload.size || 4,
      contact: payload.contact || '',
      description: payload.description || '',
      createdBy: userObjectId,
      members: [],
    })
    await group.save()
    res.status(201).json(group)
  } catch (error) {
    console.error('Create study group error:', error)
    res.status(500).json({ message: 'Failed to create study group' })
  }
})

// Study Groups UPDATE
app.put('/api/study-groups/:id', authenticate, checkOwnership('StudyGroup', 'createdBy'), async (req, res) => {
  try {
    const group = req.item
    const payload = req.body || {}
    
    // Update fields
    if (payload.subject) group.subject = payload.subject
    if (payload.course) group.course = payload.course
    if (payload.semester) group.semester = payload.semester
    if (payload.size) group.size = payload.size
    if (payload.contact) group.contact = payload.contact
    if (payload.description) group.description = payload.description
    
    await group.save()
    res.json(group)
  } catch (error) {
    console.error('Update study group error:', error)
    res.status(500).json({ message: 'Failed to update study group' })
  }
})

// Study Groups DELETE
app.delete('/api/study-groups/:id', authenticate, checkOwnership('StudyGroup', 'createdBy'), async (req, res) => {
  try {
    await StudyGroup.findOneAndDelete({ id: req.item.id })
    res.json({ message: 'Study group deleted successfully' })
  } catch (error) {
    console.error('Delete study group error:', error)
    res.status(500).json({ message: 'Failed to delete study group' })
  }
})

// Join a group
app.post('/api/study-groups/:id/join', async (req, res) => {
  try {
    const userId = Number(req.headers['x-user-id'])
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })
    
    const id = Number(req.params.id)
    const group = await StudyGroup.findOne({ id })
    if (!group) return res.status(404).json({ message: 'Group not found' })

    if (!Array.isArray(group.members)) group.members = []
    if (group.members.includes(userId)) return res.json(group)

    if (group.members.length >= Number(group.size || 0)) {
      return res.status(400).json({ message: 'Group is full' })
    }

    group.members.push(userId)
    await group.save()
    res.json(group)
  } catch (error) {
    res.status(500).json({ message: 'Failed to join group' })
  }
})

// Global search
app.get('/api/search', async (req, res) => {
  try {
    const q = (req.query.q || '').toLowerCase().trim()
    if (!q) {
      return res.json({ materials: [], accommodations: [], lostFound: [], events: [], studyGroups: [] })
    }
    
    const searchRegex = new RegExp(q, 'i')
    
    const materials = await StudyMaterial.find({
      $or: [
        { title: searchRegex },
        { course: searchRegex },
        { owner: searchRegex }
      ]
    })
    
    const acc = await Accommodation.find({
      $or: [
        { name: searchRegex },
        { facilities: searchRegex }
      ]
    })
    
    const lf = await LostFound.find({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex }
      ]
    })
    
    const ev = await Event.find({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { venue: searchRegex }
      ]
    })
    
    const sg = await StudyGroup.find({
      $or: [
        { subject: searchRegex },
        { course: searchRegex },
        { description: searchRegex }
      ]
    })
    
    res.json({ materials, accommodations: acc, lostFound: lf, events: ev, studyGroups: sg })
  } catch (error) {
    res.status(500).json({ message: 'Search failed' })
  }
})

// My listings (for profile) – requires X-User-Id header
app.get('/api/users/me/listings', async (req, res) => {
  try {
    const userId = Number(req.headers['x-user-id'])
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })
    
    // Find user by ID to get ObjectId
    const user = await User.findOne({ id: userId })
    if (!user) return res.status(404).json({ message: 'User not found' })
    
    const materials = await StudyMaterial.find({ postedByUserId: user._id })
    const lost = await LostFound.find({ postedByUserId: user._id })
    const groups = await StudyGroup.find({ createdBy: user._id })
    res.json({ materials, lostFound: lost, studyGroups: groups })
  } catch (error) {
    console.error('Fetch listings error:', error)
    res.status(500).json({ message: 'Failed to fetch listings' })
  }
})

// Notifications – X-User-Id for "my" notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const userId = req.headers['x-user-id']
    const query = userId 
      ? { $or: [{ userId: null }, { userId: { $exists: false } }] }
      : { userId: null }
    
    const list = await Notification.find(query).sort({ createdAt: -1 }).limit(50)
    res.json(list)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications' })
  }
})

app.post('/api/notifications', async (req, res) => {
  try {
    const payload = req.body || {}
    const notification = new Notification({
      userId: payload.userId ?? null,
      title: payload.title || 'Notification',
      message: payload.message || payload.body || '',
      read: false,
    })
    await notification.save()
    res.status(201).json(notification)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create notification' })
  }
})

// Admin – requires X-User-Id header and user must be admin
app.get('/api/admin/users', async (req, res) => {
  try {
    const adminId = req.headers['x-user-id']
    if (!(await isAdmin(adminId))) return res.status(403).json({ message: 'Admin only' })
    
    const list = await User.find({}, { password: 0 })
    res.json(list)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' })
  }
})

app.get('/api/admin/users/:id/activity', async (req, res) => {
  try {
    const adminId = req.headers['x-user-id']
    if (!(await isAdmin(adminId))) return res.status(403).json({ message: 'Admin only' })
    
    const id = Number(req.params.id)
    const user = await User.findOne({ id }, { password: 0 })
    if (!user) return res.status(404).json({ message: 'User not found' })
    
    const logins = await LoginLog.find({ userId: user._id })
    const materials = await StudyMaterial.find({ postedByUserId: user._id })
    const lost = await LostFound.find({ postedByUserId: user._id })
    const groups = await StudyGroup.find({ createdBy: user._id })
    
    res.json({
      user,
      logins,
      materials,
      lostFound: lost,
      studyGroups: groups,
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch activity' })
  }
})

app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const adminId = req.headers['x-user-id']
    if (!(await isAdmin(adminId))) return res.status(403).json({ message: 'Admin only' })
    
    const id = Number(req.params.id)
    if (id === Number(adminId)) return res.status(400).json({ message: 'Cannot delete yourself' })
    
    const user = await User.findOneAndDelete({ id })
    if (!user) return res.status(404).json({ message: 'User not found' })
    
    res.json({ message: 'User deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user' })
  }
})

// Accommodation
app.get('/api/accommodations', async (req, res) => {
  try {
    const accommodations = await Accommodation.find()
    res.json(accommodations)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch accommodations' })
  }
})

app.post('/api/accommodations', uploadAccommodation.array('images', 5), async (req, res) => {
  try {
    console.log('Request body:', req.body)
    console.log('Uploaded files:', req.files)
    
    const payload = req.body || {}
    const userId = payload.userId ? Number(payload.userId) : null
    
    // Get next ID
    const lastAccom = await Accommodation.findOne().sort({ id: -1 })
    const nextId = lastAccom ? lastAccom.id + 1 : 1
    
    // Handle uploaded images - get Cloudinary URLs
    let images = []
    if (req.files && req.files.length > 0) {
      console.log('Processing files:', req.files.length)
      images = req.files.map(file => {
        console.log('File path:', file.path)
        return file.path
      })
    }
    
    console.log('Final images array:', images)
    
    // Find user ObjectId if userId is provided
    let userObjectId = null
    if (userId) {
      const user = await User.findOne({ id: userId })
      userObjectId = user ? user._id : null
    }
    
    const newPlace = new Accommodation({
      id: nextId,
      name: payload.name || 'Untitled PG',
      distance: payload.distance || '0 km from campus',
      rent: payload.rent || '₹0 / month',
      occupancy: payload.occupancy || 'N/A',
      facilities: Array.isArray(payload.facilities) ? payload.facilities : [],
      contact: payload.contact || 'Not provided',
      images: images, // Store Cloudinary URLs
      postedByUserId: userObjectId,
    })
    await newPlace.save()

    // Broadcast notification about new accommodation/PG
    try {
      const notification = new Notification({
        userId: null,
        title: `New accommodation: ${newPlace.name}`,
        message: `${newPlace.rent || ''} · ${newPlace.distance || ''}`,
        read: false,
      })
      await notification.save()
    } catch (e) {
      console.error('Create accommodation notification error:', e)
    }

    res.status(201).json(newPlace)
  } catch (error) {
    console.error('Create accommodation error:', error)
    res.status(500).json({ message: 'Failed to create accommodation' })
  }
})

// Accommodation UPDATE
app.put('/api/accommodations/:id', uploadAccommodation.array('images', 5), authenticate, checkOwnership('Accommodation'), async (req, res) => {
  try {
    const accommodation = req.item
    const payload = req.body || {}
    
    // Update fields
    if (payload.name) accommodation.name = payload.name
    if (payload.distance) accommodation.distance = payload.distance
    if (payload.rent) accommodation.rent = payload.rent
    if (payload.occupancy) accommodation.occupancy = payload.occupancy
    if (payload.facilities) accommodation.facilities = Array.isArray(payload.facilities) ? payload.facilities : []
    if (payload.contact) accommodation.contact = payload.contact
    
    // Handle image update
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path)
      accommodation.images = newImages
    }
    
    await accommodation.save()
    res.json(accommodation)
  } catch (error) {
    console.error('Update accommodation error:', error)
    res.status(500).json({ message: 'Failed to update accommodation' })
  }
})

app.delete('/api/accommodations/:id', authenticate, checkOwnership('Accommodation'), async (req, res) => {
  try {
    await Accommodation.findOneAndDelete({ id: req.item.id })
    res.json({ message: 'Accommodation deleted successfully' })
  } catch (error) {
    console.error('Delete accommodation error:', error)
    res.status(500).json({ message: 'Failed to delete accommodation' })
  }
})

// Medical Help / Blood Donors
app.get('/api/medical-help', async (req, res) => {
  try {
    const { search, bloodGroup } = req.query
    let query = {}
    
    // Build filter conditions
    if (search) {
      query.fullName = { $regex: search, $options: 'i' }
    }
    
    if (bloodGroup && bloodGroup !== 'All') {
      query.bloodGroup = bloodGroup
    }
    
    const donors = await MedicalHelp.find(query)
    res.json(donors)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch medical help data' })
  }
})

app.post('/api/medical-help', async (req, res) => {
  try {
    const payload = req.body || {}
    const userId = req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : null
    
    // Get next ID
    const lastDonor = await MedicalHelp.findOne().sort({ id: -1 })
    const nextId = lastDonor ? lastDonor.id + 1 : 1
    
    const donor = new MedicalHelp({
      id: nextId,
      fullName: payload.fullName,
      department: payload.department,
      year: payload.year,
      bloodGroup: payload.bloodGroup,
      phoneNumber: payload.phoneNumber,
      lastDonationDate: payload.lastDonationDate || '',
      createdBy: userId,
    })
    await donor.save()
    res.status(201).json(donor)
  } catch (error) {
    console.error('Create medical help error:', error)
    res.status(500).json({ message: 'Failed to create medical help entry' })
  }
})

app.delete('/api/medical-help/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const donor = await MedicalHelp.findOneAndDelete({ id })
    if (!donor) return res.status(404).json({ message: 'Medical help entry not found.' })
    res.json(donor)
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete medical help entry' })
  }
})

// Payment Tracking Endpoints
app.post('/api/payments', async (req, res) => {
  try {
    const { paymentId, orderId, amount, status, userId, items, customerEmail, customerName } = req.body || {}
    
    // Get next payment ID
    const lastPayment = await Payment.findOne().sort({ id: -1 })
    const nextId = lastPayment ? lastPayment.id + 1 : 1
    
    const payment = new Payment({
      id: nextId,
      paymentId,
      orderId,
      amount,
      currency: 'INR',
      status: status || 'created',
      userId: userId || null,
      items: items || [],
      customerEmail,
      customerName,
    })
    await payment.save()
    
    res.status(201).json(payment)
  } catch (error) {
    console.error('Create payment error:', error)
    res.status(500).json({ message: 'Failed to create payment record' })
  }
})

app.patch('/api/payments/:paymentId/status', async (req, res) => {
  try {
    const { paymentId } = req.params
    const { status } = req.body || {}
    
    const payment = await Payment.findOneAndUpdate(
      { paymentId },
      { status, updatedAt: new Date() },
      { new: true }
    )
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' })
    }
    
    res.json(payment)
  } catch (error) {
    console.error('Update payment status error:', error)
    res.status(500).json({ message: 'Failed to update payment status' })
  }
})

app.get('/api/payments/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 })
    res.json(payments)
  } catch (error) {
    console.error('Get user payments error:', error)
    res.status(500).json({ message: 'Failed to fetch user payments' })
  }
})

// Order API endpoints
app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body
    
    // Generate unique order ID
    const orderId = Math.random().toString(36).substr(2, 9).toUpperCase()
    
    const order = new Order({
      id: orderId,
      userId: orderData.userId, // Use the userId from frontend (as string)
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      paymentMethod: orderData.paymentMethod,
      status: 'Processing',
      deliveryAddress: orderData.deliveryAddress,
      paymentId: orderData.paymentId,
      receipt: orderData.receipt
    })
    
    await order.save()
    res.status(201).json(order)
  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ message: 'Failed to create order' })
  }
})

app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId
    const orders = await Order.find({ userId }).sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    console.error('Get user orders error:', error)
    res.status(500).json({ message: 'Failed to fetch user orders' })
  }
})

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id })
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    res.json(order)
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({ message: 'Failed to fetch order' })
  }
})

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true }
    )
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    res.json(order)
  } catch (error) {
    console.error('Update order status error:', error)
    res.status(500).json({ message: 'Failed to update order status' })
  }
})

// Chatbot endpoint – same rule-based logic as front-end, but from backend
function getChatbotReply(messageRaw) {
  const message = (messageRaw || '').toLowerCase()

  if (!message.trim()) {
    return "Please type a question about study materials, accommodation, or how to use Campus Utility."
  }

  if (message.includes('login') || message.includes('sign in') || message.includes('register') || message.includes('account')) {
    return (
      'To use Campus Utility, first create an account or log in from the top-right corner. ' +
      'After logging in you can post study materials, manage your listings, and view your order history.'
    )
  }

  if (message.includes('book') || message.includes('material') || message.includes('notes') || message.includes('resources') || message.includes('marketplace')) {
    return (
      'To find study materials, go to the “Study Materials” section. ' +
      'You can filter by course, semester, and category (books, instruments, calculators). ' +
      'Listings show whether items are for sale or donation, along with condition and contact details.'
    )
  }

  if (message.includes('accommodation') || message.includes('hostel') || message.includes('pg') || message.includes('room')) {
    return (
      'To explore accommodation, open the “Accommodation” page. ' +
      'You will see verified PGs and hostels near campus with rent, facilities, distance, and owner contact information. ' +
      'Use filters (budget, distance, occupancy) to shortlist options.'
    )
  }

  if (message.includes('order') || message.includes('payment') || message.includes('buy') || message.includes('checkout')) {
    return (
      'When you purchase items, proceed to Checkout from your cart. ' +
      'You can pay using Razorpay or choose Cash on Delivery, and then track your orders from the profile / order history section.'
    )
  }

  if (message.includes('notification') || message.includes('alert')) {
    return 'Campus Utility can send notifications for new events or important updates. Open the Notifications section to review recent alerts.'
  }

  if (message.includes('medical') || message.includes('blood') || message.includes('emergency')) {
    return (
      'Use the Medical Help section to find registered blood donors and emergency contacts from your campus community. ' +
      'For serious situations, always also contact local emergency services immediately.'
    )
  }

  if (message.includes('what is campus utility') || message.includes('about project') || message.includes('about campus')) {
    return (
      'Campus Utility is a React-based student utility platform that promotes resource reuse and student support. ' +
      'It connects seniors and juniors for study material exchange, provides an accommodation assistance module, ' +
      'and integrates an AI chatbot to offer 24/7 guidance on using the platform.'
    )
  }

  if (message.includes('profile') || message.includes('my listings') || message.includes('history')) {
    return (
      'Open your Profile page to see your materials, lost & found posts, and study groups. ' +
      'From there you can edit or remove anything you have posted.'
    )
  }

  if (message.includes('how to use') || message.includes('help') || message.includes('guide')) {
    return (
      'You can navigate using the top menu. "Study Materials" lets you browse or post items. ' +
      '"Accommodation" helps you compare PG/hostel options. The chatbot answers FAQs and guides you step-by-step.'
    )
  }

  if (message.includes('technology') || message.includes('tech stack') || message.includes('built with')) {
    return (
      'Campus Utility is built with React and TypeScript on top of Vite for fast development. ' +
      'Tailwind CSS is used for a modern, responsive UI, and React Router manages client-side navigation between modules. ' +
      'This chatbot is implemented as a rule-based assistant inside the React front-end, with an optional backend endpoint.'
    )
  }

  return (
    "I'm a rule-based backend chatbot endpoint. I can help you with questions about study materials, accommodation, " +
    'or the architecture of this project. Try asking, for example: "How do I find books?" or "Explain the tech stack."'
  )
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body || {}

    const trimmed = typeof message === 'string' ? message.trim() : ''
    if (!trimmed) {
      return res.status(400).json({
        reply: "Please type a question about study materials, accommodation, or how to use Campus Utility."
      })
    }

    const fallbackReply = getChatbotReply(trimmed)

    if (!geminiModel) {
      // Gemini not configured – use rule-based chatbot
      return res.json({ reply: fallbackReply })
    }

    const systemPrompt = `
You are a Campus Utility Assistant for SVCE students.

This platform helps students with:
- Study materials (books, notes, calculators) - Students can buy, sell, or donate materials
- Accommodation (hostels, PGs, apartments) - Find housing near campus
- Lost and found items - Report lost items or found items
- Events (tech fest, workshops, cultural events) - Campus activities
- Study groups - Find or create study groups for different subjects
- Medical help (blood donors) - Emergency medical assistance

Current Available Data:
- Study Materials: Engineering textbooks, calculators, notes (₹0-₹800 range)
- Lost & Found: Lost phones, found ID cards, lost notebooks
- Events: Technical Symposium, Cultural Fest, Sports Meet
- Accommodations: SVCE Boys Hostel, Girls PG, Co-ed PG (₹4000-₹6000/month)
- Study Groups: Various subjects available
- Medical Help: Blood donors available

You have access to real-time data about campus resources. When students ask about:
- Study materials: Tell them about available books, prices, and how to access
- Accommodation: Mention specific hostels/PGs with prices and contact info
- Lost & Found: Guide them to report items or check found items
- Events: Inform about upcoming campus events
- Study groups: Help them find or create study groups
- Medical help: Provide emergency contact information

Be helpful, specific, and provide actionable guidance. If you don't have specific real-time data, guide them to the appropriate section of the platform.
`

    const fullPrompt = `${systemPrompt}\n\nUser: ${trimmed}\n\nAssistant:`

    const result = await geminiModel.generateContent(fullPrompt)
    const response = await result.response
    const text = typeof response.text === 'function' ? response.text() : String(response || '')
    const finalReply = text && text.trim().length > 0 ? text : fallbackReply

    res.json({
      reply: finalReply
    })
  } catch (error) {
    console.error('Gemini API Error:', error)
    const safeMessage = (req && req.body && typeof req.body.message === 'string')
      ? req.body.message
      : ''
    const backupReply = getChatbotReply(safeMessage)
    res.status(200).json({
      reply: backupReply
    })
  }
})

app.listen(PORT, () => {
  console.log(`Campus Utility backend running on http://localhost:${PORT}`)
})

