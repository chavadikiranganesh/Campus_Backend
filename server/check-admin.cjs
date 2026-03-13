require('dotenv').config()
const mongoose = require('mongoose')
const { User } = require('./models')

async function checkAdmin() {
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
        console.log(`Password: ${admin.password}`)
        console.log(`Name: ${admin.name}`)
        console.log(`ID: ${admin.id}`)
      })
    } else {
      console.log('No admin users found. Creating one...')
      
      // Create admin user
      const lastUser = await User.findOne().sort({ id: -1 })
      const nextId = lastUser ? lastUser.id + 1 : 1
      
      const admin = new User({
        id: nextId,
        name: 'Admin User',
        email: 'admin@campus-utility.com',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date(),
        lastLoginAt: null,
      })
      
      await admin.save()
      console.log('\nAdmin user created successfully!')
      console.log('\nAdmin Login Details:')
      console.log('Email: admin@campus-utility.com')
      console.log('Password: admin123')
      console.log('Name: Admin User')
      console.log('ID:', nextId)
    }
    
    mongoose.connection.close()
  } catch (err) {
    console.error('Error:', err)
    mongoose.connection.close()
  }
}

checkAdmin()
