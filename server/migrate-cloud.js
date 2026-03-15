const mongoose = require('mongoose');
const { StudyMaterial, LostFound } = require('./models');

async function migrateCloudDatabase() {
  try {
    console.log('Starting cloud database migration...');
    
    // Connect to MongoDB Atlas (same as server)
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@cluster0.cmmawfl.mongodb.net/?appName=Cluster0');
    console.log('Connected to MongoDB Atlas');
    
    // Update StudyMaterials
    const materialsResult = await StudyMaterial.updateMany(
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
    console.log(`Updated ${materialsResult.modifiedCount} study materials`);
    
    // Update LostFound items
    const lostFoundResult = await LostFound.updateMany(
      { imageUrl: { $exists: true, $ne: null }, image: { $exists: false } },
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
    console.log(`Updated ${lostFoundResult.modifiedCount} lost & found items`);
    
    console.log('Cloud database migration completed successfully!');
    
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateCloudDatabase();
}

module.exports = { migrateCloudDatabase };
