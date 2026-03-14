require('dotenv').config({ path: '../.env' })
const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const Razorpay = require("razorpay")
const OpenAI = require('openai')
const { User, StudyMaterial, Accommodation, LostFound, Event, StudyGroup, LoginLog, Notification, MedicalHelp, Payment } = require('./models')

// Razorpay Setup
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

// OpenAI Setup
console.log('OpenAI API Key from env:', process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err))

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: "*"
}));
app.use(express.json())

// Root route
app.get("/", (req, res) => {
  res.send("Campus Utility Backend is running 🚀");
})

// Create Payment Order API
app.post("/api/create-order", async (req, res) => {
  try {

    const options = {
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: "receipt_order"
    };

    const order = await razorpay.orders.create(options);

    res.json(order);

  } catch (error) {
    res.status(500).send(error);
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

    const user = new User({
      id: nextId,
      name,
      email,
      password,
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
    const user = await User.findOne({ email, password })

    if (!user) {
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

app.post('/api/materials', async (req, res) => {
  try {
    const payload = req.body || {}
    const userId = payload.userId ? Number(payload.userId) : null
    
    // Get next ID
    const lastMaterial = await StudyMaterial.findOne().sort({ id: -1 })
    const nextId = lastMaterial ? lastMaterial.id + 1 : 1
    
    const newItem = new StudyMaterial({
      id: nextId,
      title: payload.title || 'Untitled',
      category: payload.category || 'Book',
      course: payload.course || 'Unknown',
      semester: payload.semester || '1',
      condition: payload.condition || 'Good',
      type: payload.type || 'For Sale',
      price: payload.price || '₹0',
      owner: payload.owner || 'Anonymous',
      ownerContact: payload.ownerContact || '',
      imageUrl: payload.imageUrl || '',
      description: payload.description || '',
      
    })
    await newItem.save()
    res.status(201).json(newItem)
  } catch (error) {
    console.error('Create material error:', error)
    res.status(500).json({ message: 'Failed to create material' })
  }
})

app.delete('/api/materials/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const item = await StudyMaterial.findOneAndDelete({ id })
    if (!item) return res.status(404).json({ message: 'Material not found.' })
    res.json(item)
  } catch (error) {
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

app.post('/api/lost-found', async (req, res) => {
  try {
    const payload = req.body || {}
    const userId = payload.userId ? Number(payload.userId) : null
    
    // Get next ID
    const lastItem = await LostFound.findOne().sort({ id: -1 })
    const nextId = lastItem ? lastItem.id + 1 : 1
    
    const item = new LostFound({
      id: nextId,
      type: payload.type || 'found',
      title: payload.title || 'Untitled',
      description: payload.description || '',
      location: payload.location || '',
      contact: payload.contact || '',
      createdAt: new Date(),
      postedByUserId: userId,
    })
    await item.save()
    res.status(201).json(item)
  } catch (error) {
    console.error('Create lost-found error:', error)
    res.status(500).json({ message: 'Failed to create item' })
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
    
    const group = new StudyGroup({
      id: nextId,
      subject: payload.subject || 'General',
      course: payload.course || '',
      semester: payload.semester || '',
      size: payload.size || 4,
      contact: payload.contact || '',
      description: payload.description || '',
      postedByUserId: userId,
      members: [],
    })
    await group.save()
    res.status(201).json(group)
  } catch (error) {
    console.error('Create study group error:', error)
    res.status(500).json({ message: 'Failed to create study group' })
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
    
    const materials = await StudyMaterial.find({ postedByUserId: userId })
    const lost = await LostFound.find({ postedByUserId: userId })
    const groups = await StudyGroup.find({ postedByUserId: userId })
    res.json({ materials, lostFound: lost, studyGroups: groups })
  } catch (error) {
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
    const materials = await StudyMaterial.find({ postedByUserId: id })
    const lost = await LostFound.find({ postedByUserId: id })
    const groups = await StudyGroup.find({ postedByUserId: id })
    
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

app.post('/api/accommodations', async (req, res) => {
  try {
    const payload = req.body || {}
    const photos = Array.isArray(payload.photos) ? payload.photos : (payload.photos ? [].concat(payload.photos) : [])
    
    // Get next ID
    const lastAccom = await Accommodation.findOne().sort({ id: -1 })
    const nextId = lastAccom ? lastAccom.id + 1 : 1
    
    const newPlace = new Accommodation({
      id: nextId,
      name: payload.name || 'Untitled PG',
      distance: payload.distance || '0 km from campus',
      rent: payload.rent || '₹0 / month',
      occupancy: payload.occupancy || 'N/A',
      facilities: Array.isArray(payload.facilities) ? payload.facilities : [],
      contact: payload.contact || 'Not provided',
      photos: photos.filter(Boolean),
    })
    await newPlace.save()
    res.status(201).json(newPlace)
  } catch (error) {
    console.error('Create accommodation error:', error)
    res.status(500).json({ message: 'Failed to create accommodation' })
  }
})

app.delete('/api/accommodations/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const place = await Accommodation.findOneAndDelete({ id })
    if (!place) return res.status(404).json({ message: 'Accommodation not found.' })
    res.json(place)
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete accommodation' })
  }
})

// Medical Help / Blood Donors
app.get('/api/medical-help', async (req, res) => {
  try {
    const donors = await MedicalHelp.find()
    res.json(donors)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch medical help data' })
  }
})

app.post('/api/medical-help', async (req, res) => {
  try {
    const payload = req.body || {}
    
    // Get next ID
    const lastDonor = await MedicalHelp.findOne().sort({ id: -1 })
    const nextId = lastDonor ? lastDonor.id + 1 : 1
    
    const donor = new MedicalHelp({
      id: nextId,
      name: payload.fullName || payload.name || 'Anonymous',
      bloodGroup: payload.bloodGroup || 'O+',
      contact: payload.phoneNumber || payload.contact || '',
      location: `${payload.department} - ${payload.year} Year`,
      availability: 'Available',
      lastDonated: payload.lastDonationDate || '',
      emergencyContact: payload.phoneNumber || payload.contact || '',
      conditions: [],
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

// Chatbot endpoint – same rule-based logic as front-end, but from backend
function getChatbotReply(messageRaw) {
  const message = (messageRaw || '').toLowerCase()

  if (!message.trim()) {
    return "Please type a question about study materials, accommodation, or how to use Campus Utility."
  }

  if (message.includes('book') || message.includes('material') || message.includes('notes')) {
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

  if (message.includes('what is campus utility') || message.includes('about project') || message.includes('about campus')) {
    return (
      'Campus Utility is a React-based student utility platform that promotes resource reuse and student support. ' +
      'It connects seniors and juniors for study material exchange, provides an accommodation assistance module, ' +
      'and integrates an AI chatbot to offer 24/7 guidance on using the platform.'
    )
  }

  if (message.includes('how to use') || message.includes('help')) {
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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a Campus Utility Assistant for SVCE students.

This platform helps students with:
- Study materials (books, notes, calculators)
- Accommodation (hostels, PGs)
- Lost and found items
- Events (tech fest, workshops)
- Study groups
- Medical help (blood donors)

Guide students on how to use the platform and help them find what they need.
Be helpful, concise, and specific to campus life.
`
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    res.json({
      reply: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({
      reply: "Assistant is currently unavailable. Please try again later."
    });
  }
})

app.listen(PORT, () => {
  console.log(`Campus Utility backend running on http://localhost:${PORT}`)
})

