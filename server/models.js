const mongoose = require('mongoose')

// User Schema
const userSchema = new mongoose.Schema({
  id: { type: Number, unique: true, sparse: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { 
    type: String, 
    required: true,
    minlength: 60, // bcrypt hashes are typically 60 characters long
    select: false // Don't include password in queries by default
  },
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date, default: null },
})

// Order Schema
const orderSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  userId: { type: String, required: true }, // Changed from ObjectId to String
  items: [{
    title: { type: String, required: true },
    price: { type: Number, required: true },
    owner: { type: String, required: true }
  }],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, required: true, enum: ['cod', 'razorpay'] },
  status: { type: String, default: 'Processing', enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'] },
  createdAt: { type: Date, default: Date.now },
  deliveryAddress: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  paymentId: { type: String }, // For Razorpay payments
  receipt: { type: String }
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
  ownerContact: String,
  image: String,
  description: String,
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
  images: [String],
  postedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
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
  image: String,
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

// Medical Help/Blood Donors Schema
const medicalHelpSchema = new mongoose.Schema({
  id: { type: Number, unique: true, sparse: true },
  fullName: { type: String, required: true },
  department: { type: String, required: true },
  year: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  lastDonationDate: { type: String },
  createdBy: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
})

// Payment Schema
const paymentSchema = new mongoose.Schema({
  id: { type: Number, unique: true, sparse: true },
  paymentId: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, required: true, enum: ['created', 'paid', 'failed', 'refunded'] },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    id: Number,
    title: String,
    price: Number,
    quantity: Number,
    category: String,
    course: String,
    owner: String
  }],
  customerEmail: String,
  customerName: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Create models
const User = mongoose.model('User', userSchema)
const Order = mongoose.model('Order', orderSchema)
const StudyMaterial = mongoose.model('StudyMaterial', studyMaterialSchema)
const Accommodation = mongoose.model('Accommodation', accommodationSchema)
const LostFound = mongoose.model('LostFound', lostFoundSchema)
const Event = mongoose.model('Event', eventSchema)
const StudyGroup = mongoose.model('StudyGroup', studyGroupSchema)
const LoginLog = mongoose.model('LoginLog', loginLogSchema)
const Notification = mongoose.model('Notification', notificationSchema)
const MedicalHelp = mongoose.model('MedicalHelp', medicalHelpSchema)
const Payment = mongoose.model('Payment', paymentSchema)

module.exports = {
  User,
  Order,
  StudyMaterial,
  Accommodation,
  LostFound,
  Event,
  StudyGroup,
  LoginLog,
  Notification,
  MedicalHelp,
  Payment,
}
