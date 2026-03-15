const mongoose = require('mongoose');
const { StudyMaterial, LostFound } = require('./models');

async function checkData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/campus-utility');
    console.log('Connected to MongoDB');
    
    // Check StudyMaterials
    const materials = await StudyMaterial.find({});
    console.log('Total materials:', materials.length);
    materials.forEach(m => {
      console.log(`ID: ${m.id}, Image: ${m.image}, ImageUrl: ${m.imageUrl}`);
    });
    
    console.log('\n--- Lost & Found Items ---');
    // Check LostFound
    const lostFound = await LostFound.find({});
    console.log('Total lost-found items:', lostFound.length);
    lostFound.forEach(item => {
      console.log(`ID: ${item.id}, Image: ${item.image}, ImageUrl: ${item.imageUrl}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkData();
