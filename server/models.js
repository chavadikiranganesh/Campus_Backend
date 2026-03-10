const mongoose = require('mongoose')

// User Schema
const userSchema = new mongoose.Schema({
  id: { type: Number, unique: true, sparse: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date, default: null },
})

// Study Materials Schema
const studyMaterialSchema = new mongoose.Schema({
  id: { type: Number, unique: true, sparse: true },
  title: String,
  category: String,
  course: String,
  semester: String,
  condition: String,
  type: String,
  price: String,
  owner: String,
  postedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now },
})

// Accommodation Schema
const accommodationSchema = new mongoose.Schema({
  id: { type: Number, unique: true, sparse: true },
  name: String,
  distance: String,
  rent: String,
  occupancy: String,
  facilities: [String],
  contact: String,
  photos: [String],
  createdAt: { type: Date, default: Date.now },
})

// Lost & Found Schema
const lostFoundSchema = new mongoose.Schema({
  id: { type: Number, unique: true, sparse: true },
  type: { type: String, enum: ['lost', 'found'] },
  title: String,
  description: String,
  location: String,
  contact: String,
  createdAt: { type: Date, default: Date.now },
  postedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
})

// Events Schema
const eventSchema = new mongoose.Schema({
  id: { type: Number, unique: true, sparse: true },
  title: String,
  date: String,
  time: String,
  venue: String,
  description: String,
  createdAt: { type: Date, default: Date.now },
})

// Study Groups Schema
const studyGroupSchema = new mongoose.Schema({
  id: { type: Number, unique: true, sparse: true },
  subject: String,
  description: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  meetingTime: String,
  location: String,
  createdAt: { type: Date, default: Date.now },
})

// Login Log Schema
const loginLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: String,
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['success', 'failed'] },
})

// Notifications Schema
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  message: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

// Create models
const User = mongoose.model('User', userSchema)
const StudyMaterial = mongoose.model('StudyMaterial', studyMaterialSchema)
const Accommodation = mongoose.model('Accommodation', accommodationSchema)
const LostFound = mongoose.model('LostFound', lostFoundSchema)
const Event = mongoose.model('Event', eventSchema)
const StudyGroup = mongoose.model('StudyGroup', studyGroupSchema)
const LoginLog = mongoose.model('LoginLog', loginLogSchema)
const Notification = mongoose.model('Notification', notificationSchema)

module.exports = {
  User,
  StudyMaterial,
  Accommodation,
  LostFound,
  Event,
  StudyGroup,
  LoginLog,
  Notification,
}
