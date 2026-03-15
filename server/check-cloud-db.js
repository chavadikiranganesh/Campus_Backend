const mongoose = require('mongoose');
const { StudyMaterial } = require('./models');

async function checkCloudDatabase() {
  try {
    await mongoose.connect('mongodb+srv://admin:admin123@cluster0.cmmawfl.mongodb.net/?appName=Cluster0');
    console.log('Connected to MongoDB Atlas');
    
    // Check all materials with full details
    const materials = await StudyMaterial.find({});
    console.log(`Total materials: ${materials.length}`);
    
    materials.forEach(m => {
      console.log(`\n--- Material ID: ${m.id} ---`);
      console.log(`Title: ${m.title}`);
      console.log(`Image field: ${m.image}`);
      console.log(`ImageUrl field: ${m.imageUrl}`);
      console.log(`Full object:`, JSON.stringify(m.toObject(), null, 2));
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkCloudDatabase();
