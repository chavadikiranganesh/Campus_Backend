require('dotenv').config()
const mongoose = require('mongoose')
const { User, StudyMaterial, Accommodation, LostFound, Event, StudyGroup, LoginLog, Notification, MedicalHelp } = require('./models')

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => console.error('MongoDB connection error:', err))

async function seedDatabase() {
  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing data...')
    await StudyMaterial.deleteMany({})
    await Accommodation.deleteMany({})
    await LostFound.deleteMany({})
    await Event.deleteMany({})
    await StudyGroup.deleteMany({})
    await Notification.deleteMany({})
    await LoginLog.deleteMany({})
    await MedicalHelp.deleteMany({})

    // Get existing users to reference
    const users = await User.find()
    if (users.length === 0) {
      console.log('No users found. Please create some users first.')
      return
    }

    console.log(`Found ${users.length} users for seeding`)

    // Sample Study Materials
    const studyMaterials = [
      {
        id: 1,
        title: "Engineering Mathematics Volume 1",
        category: "Book",
        course: "CSE",
        semester: "1",
        condition: "Good",
        type: "For Sale",
        price: "₹250",
        owner: "John Doe",
        ownerContact: "9876543210",
        imageUrl: "",
        description: "Mathematics textbook for first year CSE students. Minor highlighting but in good condition."
      },
      {
        id: 2,
        title: "Scientific Calculator Casio FX-991EX",
        category: "Calculator",
        course: "General",
        semester: "All",
        condition: "Excellent",
        type: "For Sale",
        price: "₹800",
        owner: "Jane Smith",
        ownerContact: "9876543211",
        imageUrl: "",
        description: "Advanced scientific calculator, barely used. Comes with original box and manual."
      },
      {
        id: 3,
        title: "Data Structures Notes",
        category: "Notes",
        course: "CSE",
        semester: "3",
        condition: "Good",
        type: "Donation",
        price: "Free",
        owner: "Mike Johnson",
        ownerContact: "9876543212",
        imageUrl: "",
        description: "Comprehensive handwritten notes for Data Structures. Covers all topics with diagrams."
      }
    ]

    // Sample Accommodations
    const accommodations = [
      {
        id: 1,
        name: "SVCE Boys Hostel Block A",
        distance: "0.5 km from campus",
        rent: "₹4000 / month",
        occupancy: "2 per room",
        facilities: ["WiFi", "Mess", "Laundry", "24/7 Security", "Study Room"],
        contact: "9876543213",
        photos: []
      },
      {
        id: 2,
        name: "Girls PG - Shanti Nilaya",
        distance: "1.2 km from campus",
        rent: "₹5500 / month",
        occupancy: "3 per room",
        facilities: ["WiFi", "Homely Food", "Washing Machine", "Security", "Power Backup"],
        contact: "9876543214",
        photos: []
      },
      {
        id: 3,
        name: "Co-ed PG - Student Paradise",
        distance: "2.0 km from campus",
        rent: "₹6000 / month",
        occupancy: "1 per room",
        facilities: ["WiFi", "Attached Bathroom", "Kitchen", "Parking", "Gym"],
        contact: "9876543215",
        photos: []
      }
    ]

    // Sample Lost & Found
    const lostFoundItems = [
      {
        id: 1,
        type: "lost",
        title: "Lost iPhone 12",
        description: "Black iPhone 12 lost near library on March 10th. Has a blue case. Important data inside.",
        location: "Near Library",
        contact: "9876543216"
      },
      {
        id: 2,
        type: "found",
        title: "Found Student ID Card",
        description: "Found student ID card belonging to Rahul Kumar from CSE department. Can be collected from security office.",
        location: "Cafeteria",
        contact: "9876543217"
      },
      {
        id: 3,
        type: "lost",
        title: "Lost Engineering Notebook",
        description: "Lost blue engineering notebook with circuits notes. Contains important assignment work.",
        location: "Lab Building",
        contact: "9876543218"
      }
    ]

    // Sample Events
    const events = [
      {
        id: 1,
        title: "Technical Symposium - TechFest 2024",
        date: "2024-03-25",
        time: "9:00 AM",
        venue: "Main Auditorium",
        description: "Annual technical symposium with workshops, competitions, and guest lectures from industry experts."
      },
      {
        id: 2,
        title: "Cultural Festival - Spring Fest",
        date: "2024-04-10",
        time: "10:00 AM",
        venue: "College Ground",
        description: "Three-day cultural festival with music, dance, drama, and various cultural competitions."
      },
      {
        id: 3,
        title: "Placement Drive - TCS Recruitment",
        date: "2024-03-20",
        time: "8:30 AM",
        venue: "Placement Cell",
        description: "On-campus recruitment drive by TCS for final year students. Multiple positions available."
      }
    ]

    // Sample Study Groups
    const studyGroups = [
      {
        id: 1,
        subject: "Data Structures & Algorithms",
        description: "Weekly study group to practice DSA problems and prepare for interviews",
        course: "CSE",
        semester: "3",
        size: 4,
        contact: "9876543219",
        postedByUserId: users[0]?._id,
        members: []
      },
      {
        id: 2,
        subject: "Engineering Mathematics",
        description: "Math problem solving group for first year students",
        course: "All Branches",
        semester: "1",
        size: 6,
        contact: "9876543220",
        postedByUserId: users[1]?._id,
        members: []
      },
      {
        id: 3,
        subject: "Database Management Systems",
        description: "Group project and assignment help for DBMS course",
        course: "CSE",
        semester: "4",
        size: 3,
        contact: "9876543221",
        postedByUserId: users[0]?._id,
        members: []
      }
    ]

    // Sample Medical Help / Blood Donors
    const medicalHelp = [
      {
        id: 1,
        name: "Rahul Sharma",
        bloodGroup: "O+",
        contact: "9876543222",
        location: "SVCE Hostel Block A",
        availability: "Available 24/7",
        lastDonated: "3 months ago",
        emergencyContact: "9876543223",
        conditions: ["Healthy", "No medications"]
      },
      {
        id: 2,
        name: "Priya Patel",
        bloodGroup: "B+",
        contact: "9876543224",
        location: "Girls PG Shanti Nilaya",
        availability: "Available after 6 PM",
        lastDonated: "2 months ago",
        emergencyContact: "9876543225",
        conditions: ["Healthy", "Regular donor"]
      },
      {
        id: 3,
        name: "Amit Kumar",
        bloodGroup: "A+",
        contact: "9876543226",
        location: "Co-ed PG Student Paradise",
        availability: "Available weekends",
        lastDonated: "1 month ago",
        emergencyContact: "9876543227",
        conditions: ["Healthy", "First-time donor"]
      }
    ]

    // Sample Notifications
    const notifications = [
      {
        title: "New Study Material Posted",
        message: "Engineering Mathematics Volume 1 is now available for sale",
        read: false
      },
      {
        title: "Upcoming Event Reminder",
        message: "TechFest 2024 starts next week. Register now!",
        read: false
      },
      {
        title: "Lost Item Alert",
        message: "iPhone 12 lost near library. Please contact if found.",
        read: false
      }
    ]

    // Insert sample data
    console.log('Inserting study materials...')
    await StudyMaterial.insertMany(studyMaterials)

    console.log('Inserting accommodations...')
    await Accommodation.insertMany(accommodations)

    console.log('Inserting lost & found items...')
    await LostFound.insertMany(lostFoundItems)

    console.log('Inserting events...')
    await Event.insertMany(events)

    console.log('Inserting study groups...')
    await StudyGroup.insertMany(studyGroups)

    console.log('Inserting medical help data...')
    await MedicalHelp.insertMany(medicalHelp)

    console.log('Inserting notifications...')
    await Notification.insertMany(notifications)

    console.log('Database seeded successfully! 🎉')
    console.log('\nSummary:')
    console.log(`- ${studyMaterials.length} study materials`)
    console.log(`- ${accommodations.length} accommodations`)
    console.log(`- ${lostFoundItems.length} lost & found items`)
    console.log(`- ${events.length} events`)
    console.log(`- ${studyGroups.length} study groups`)
    console.log(`- ${medicalHelp.length} medical help donors`)
    console.log(`- ${notifications.length} notifications`)

  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    mongoose.connection.close()
  }
}

// Run the seeding function
seedDatabase()
