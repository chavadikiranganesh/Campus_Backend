const mongoose = require('mongoose');
require('dotenv').config();

// Import the StudyMaterial model
const { StudyMaterial } = require('./models');

async function addTestItem() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the next ID
    const lastMaterial = await StudyMaterial.findOne().sort({ id: -1 });
    const nextId = lastMaterial ? lastMaterial.id + 1 : 1;

    // Create a test item for user 11
    const testItem = new StudyMaterial({
      id: nextId,
      title: 'Test Book for User 11',
      category: 'Book',
      course: 'CS101',
      semester: '1',
      condition: 'Good',
      type: 'For Sale',
      price: '100',
      owner: 'Test User 11',
      ownerContact: 'test@example.com',
      image: 'https://via.placeholder.com/150',
      description: 'This is a test book owned by user 11',
      postedByUserId: '69b684eefc74753c10fef6d2', // User 11's ObjectId
    });

    await testItem.save();
    console.log('Test item created successfully:', testItem);

    // Verify the item was created
    const createdItem = await StudyMaterial.findOne({ id: nextId }).populate('postedByUserId');
    console.log('Created item with populated user:', createdItem);

    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating test item:', error);
    mongoose.connection.close();
  }
}

addTestItem();
