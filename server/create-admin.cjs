require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { User } = require('./models')

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')
    
    // Check for existing admin users
    const adminUsers = await User.find({ role: 'admin' })
    console.log('Existing admin users:', adminUsers.length)
    
    if (adminUsers.length > 0) {
      console.log('\nAdmin Login Details:')
      adminUsers.forEach((admin, index) => {
        console.log(`\nAdmin ${index + 1}:`)
        console.log(`Email: ${admin.email}`)
        console.log(`Name: ${admin.name}`)
        console.log(`ID: ${admin.id}`)
      })
    } else {
      console.log('No admin users found. Creating one...')
      
      // Hash the password
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash('admin123', saltRounds)
      
      // Get the next ID
      const lastUser = await User.findOne().sort({ id: -1 })
      const nextId = lastUser ? lastUser.id + 1 : 1
      
      // Create admin user with hashed password
      const admin = new User({
        id: nextId,
        name: 'Admin',
        email: 'admin@campus-utility.com',
        password: hashedPassword, // Use the hashed password
        role: 'admin',
        createdAt: new Date(),
        lastLoginAt: null,
      })
      
      await admin.save()
      console.log('\nAdmin user created successfully!')
      console.log('\nAdmin Login Details:')
      console.log('Email: admin@campus-utility.com')
      console.log('Password: admin123')
      console.log('Name: Admin')
      console.log('ID:', nextId)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

createAdmin()
