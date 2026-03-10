const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'store.json')

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function defaultData() {
  return {
    users: [
      {
        id: 1,
        name: 'Admin',
        email: 'admin@campus-utility.com',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date().toISOString(),
        lastLoginAt: null,
      },
    ],
    nextUserId: 2,
    studyMaterials: [
      { id: 1, title: 'Engineering Mathematics – 3rd Sem', category: 'Book', course: 'B.E. CSE', semester: '3', condition: 'Like New', type: 'For Sale', price: '₹350', owner: 'Final Year – CSE', postedByUserId: null },
      { id: 2, title: 'Digital Logic Design Lab Kit', category: 'Instrument', course: 'B.E. ECE', semester: '4', condition: 'Good', type: 'Donation', price: 'Free', owner: 'Alumni – 2024 Batch', postedByUserId: null },
      { id: 3, title: 'Scientific Calculator FX-991ES', category: 'Calculator', course: 'B.E. Mechanical', semester: '2', condition: 'Very Good', type: 'For Sale', price: '₹500', owner: '3rd Year – Mech', postedByUserId: null },
      { id: 4, title: 'Data Structures Notes (PDF + Printed)', category: 'Notes', course: 'B.E. CSE', semester: '4', condition: 'Handwritten + Printed', type: 'Donation', price: 'Free', owner: 'Final Year – CSE', postedByUserId: null },
    ],
    accommodations: [
      { id: 1, name: 'GreenView Boys PG', distance: '0.8 km from campus', rent: '₹7,500 / month', occupancy: '2 / 3 sharing', facilities: ['Wi‑Fi', '3 meals', 'Laundry', 'Study table'], contact: 'Mr. Kumar – +91 98765 43210', photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'] },
      { id: 2, name: 'Sunrise Ladies Hostel', distance: '1.2 km from campus', rent: '₹8,500 / month', occupancy: '2 sharing', facilities: ['Wi‑Fi', 'Breakfast & Dinner', '24x7 Security', 'Library room'], contact: 'Office – +91 91234 56780', photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'] },
      { id: 3, name: 'TechPark Student Homes', distance: '2.0 km from campus', rent: '₹6,800 / month', occupancy: '3 / 4 sharing', facilities: ['Wi‑Fi', 'Food court nearby', 'Gym access', 'Bus pickup'], contact: 'Reception – +91 90000 11223', photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400'] },
    ],
    lostFound: [
      { id: 1, type: 'lost', title: 'Blue water bottle', description: 'Lost near library.', location: 'Central Library', contact: 'rahul@college.edu', createdAt: '2025-02-15', postedByUserId: null },
      { id: 2, type: 'found', title: 'Keys with keychain', description: 'Found in canteen.', location: 'Main Canteen', contact: 'priya@college.edu', createdAt: '2025-02-14', postedByUserId: null },
      { id: 3, type: 'lost', title: 'Calculator FX-991ES', description: 'Lost in lab block.', location: 'ECE Lab Block', contact: 'amit@college.edu', createdAt: '2025-02-13', postedByUserId: null },
    ],
    nextLostFoundId: 4,
    events: [
      { id: 1, title: 'Tech Talk: Web Development', date: '2025-02-20', time: '4:00 PM', venue: 'Auditorium', description: 'Guest lecture on modern web stack.' },
      { id: 2, title: 'Placement Prep Workshop', date: '2025-02-22', time: '10:00 AM', venue: 'Room 101', description: 'Resume and interview tips.' },
      { id: 3, title: 'Cultural Fest', date: '2025-02-25', time: '9:00 AM', venue: 'Main Ground', description: 'Annual college cultural fest.' },
      { id: 4, title: 'Hackathon 2025', date: '2025-03-01', time: '8:00 AM', venue: 'CS Dept', description: '24-hour coding competition.' },
    ],
    nextEventId: 5,
    studyGroups: [
      { id: 1, subject: 'Data Structures', course: 'B.E. CSE', semester: '3', size: 4, contact: 'ds-group@college.edu', description: 'Weekly DS practice.', postedByUserId: null, members: [] },
      { id: 2, subject: 'Engineering Mathematics', course: 'B.E. All', semester: '2', size: 6, contact: 'math-group@college.edu', description: 'Problem solving.', postedByUserId: null, members: [] },
      { id: 3, subject: 'DBMS', course: 'B.E. CSE', semester: '4', size: 3, contact: 'dbms@college.edu', description: 'SQL and design.', postedByUserId: null, members: [] },
    ],
    nextStudyGroupId: 4,
    loginLog: [],
    notifications: [],
    resetTokens: {},
  }
}

function load() {
  ensureDir()
  if (!fs.existsSync(DATA_FILE)) {
    return defaultData()
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8')
    const data = JSON.parse(raw)
    if (!data.users || !Array.isArray(data.users)) return defaultData()
    if (!data.accommodations?.length) data.accommodations = defaultData().accommodations
    if (!data.accommodations[0].photos) {
      data.accommodations.forEach((a, i) => {
        a.photos = defaultData().accommodations[i]?.photos || []
      })
    }
    if (!data.studyGroups?.length) data.studyGroups = defaultData().studyGroups
    data.studyGroups.forEach((g) => {
      if (!Array.isArray(g.members)) g.members = []
    })
    return data
  } catch (e) {
    console.error('Store load error:', e.message)
    return defaultData()
  }
}

function save(data) {
  ensureDir()
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8')
  } catch (e) {
    console.error('Store save error:', e.message)
  }
}

module.exports = { load, save, defaultData, DATA_FILE }
