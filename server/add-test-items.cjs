const mongoose = require('mongoose');
require('dotenv').config();

// Import the models
const { LostFound, StudyGroup, Accommodation } = require('./models');

async function addTestItemsForUser11() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // User 11's ObjectId
    const userObjectId = '69b684eefc74753c10fef6d2';

    // 1. Create a Lost & Found item for user 11
    const lastLostFound = await LostFound.findOne().sort({ id: -1 });
    const nextLostFoundId = lastLostFound ? lastLostFound.id + 1 : 1;

    const lostFoundItem = new LostFound({
      id: nextLostFoundId,
      type: 'lost',
      title: 'Lost Wallet - User 11',
      description: 'Black leather wallet with ID cards',
      location: 'Library',
      contact: 'test@example.com',
      image: 'https://via.placeholder.com/150',
      postedByUserId: userObjectId,
    });

    await lostFoundItem.save();
    console.log('Lost & Found item created successfully');

    // 2. Create a Study Group for user 11
    const lastStudyGroup = await StudyGroup.findOne().sort({ id: -1 });
    const nextStudyGroupId = lastStudyGroup ? lastStudyGroup.id + 1 : 1;

    const studyGroup = new StudyGroup({
      id: nextStudyGroupId,
      subject: 'Mathematics',
      course: 'MATH101',
      semester: '1',
      size: 4,
      contact: 'test@example.com',
      description: 'Study group for calculus',
      createdBy: userObjectId,
      members: [],
    });

    await studyGroup.save();
    console.log('Study group created successfully');

    // 3. Create an Accommodation for user 11
    const lastAccommodation = await Accommodation.findOne().sort({ id: -1 });
    const nextAccommodationId = lastAccommodation ? lastAccommodation.id + 1 : 1;

    const accommodation = new Accommodation({
      id: nextAccommodationId,
      name: 'Test PG for User 11',
      distance: '2 km from campus',
      rent: '₹5000 / month',
      occupancy: '2 sharing',
      facilities: ['WiFi', 'Food', 'Laundry'],
      contact: 'test@example.com',
      images: ['https://via.placeholder.com/150'],
      postedByUserId: userObjectId,
    });

    await accommodation.save();
    console.log('Accommodation created successfully');

    // Verify all items were created with proper user relationships
    const lostFoundWithUser = await LostFound.findOne({ id: nextLostFoundId }).populate('postedByUserId');
    const studyGroupWithUser = await StudyGroup.findOne({ id: nextStudyGroupId }).populate('createdBy');
    const accommodationWithUser = await Accommodation.findOne({ id: nextAccommodationId }).populate('postedByUserId');

    console.log('\n=== Verification ===');
    console.log('Lost & Found with user:', lostFoundWithUser.postedByUserId?.id);
    console.log('Study Group with user:', studyGroupWithUser.createdBy?.id);
    console.log('Accommodation with user:', accommodationWithUser.postedByUserId?.id);

    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating test items:', error);
    mongoose.connection.close();
  }
}

addTestItemsForUser11();
