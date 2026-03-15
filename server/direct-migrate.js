const mongoose = require('mongoose');
const { StudyMaterial, LostFound } = require('./models');

async function directMigration() {
  try {
    await mongoose.connect('mongodb://localhost:27017/campus-utility');
    console.log('Connected to MongoDB');
    
    // Update StudyMaterials directly
    const materialsResult = await StudyMaterial.updateMany(
      { imageUrl: { $exists: true, $ne: null } },
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
    console.log('Updated materials:', materialsResult.modifiedCount);
    
    // Update LostFound items directly
    const lostFoundResult = await LostFound.updateMany(
      { imageUrl: { $exists: true, $ne: null } },
      [
        {
          $set: {
            image: { $substr: ['$imageUrl', 18, -1] } // Remove '/uploads/lostfound/' prefix
          }
        },
        {
          $unset: 'imageUrl'
        }
      ],
      { updatePipeline: true }
    );
    console.log('Updated lost-found items:', lostFoundResult.modifiedCount);
    
    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    process.exit(0);
  }
}

directMigration();
