const mongoose = require('mongoose');
const { StudyMaterial } = require('./models');

async function checkAndFixData() {
  try {
    await mongoose.connect('mongodb+srv://admin:admin123@cluster0.cmmawfl.mongodb.net/?appName=Cluster0');
    console.log('Connected to MongoDB');
    
    // Check all materials
    const materials = await StudyMaterial.find({});
    console.log(`Total materials: ${materials.length}`);
    
    let needsMigration = 0;
    materials.forEach(m => {
      console.log(`ID: ${m.id}, Image: ${m.image}, ImageUrl: ${m.imageUrl ? 'EXISTS' : 'NONE'}`);
      if (m.imageUrl && !m.image) {
        needsMigration++;
      }
    });
    
    console.log(`\nMaterials needing migration: ${needsMigration}`);
    
    if (needsMigration > 0) {
      console.log('Running migration...');
      const result = await StudyMaterial.updateMany(
        { imageUrl: { $exists: true, $ne: null }, image: { $exists: false } },
        [
          {
            $set: {
              image: { $substr: ['$imageUrl', 9, -1] } // Remove '/uploads/' prefix
            }
          },
          {
            $unset: 'imageUrl'
          }
        ],
        { updatePipeline: true }
      );
      console.log(`Migration result: ${result.modifiedCount} documents updated`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkAndFixData();
