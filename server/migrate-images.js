const mongoose = require('mongoose');
const { StudyMaterial, LostFound } = require('./models');

// Update existing documents to use new image field format
async function migrateImageFields() {
  try {
    console.log('Starting image field migration...');
    
    // Update StudyMaterials
    const materials = await StudyMaterial.find({ imageUrl: { $exists: true } });
    console.log(`Found ${materials.length} materials with imageUrl field`);
    
    for (const material of materials) {
      if (material.imageUrl && material.imageUrl.startsWith('/uploads/')) {
        // Extract filename from full path
        const filename = material.imageUrl.replace('/uploads/', '');
        // Use updateOne to directly modify the document
        await StudyMaterial.updateOne(
          { _id: material._id },
          { 
            $set: { image: filename },
            $unset: { imageUrl: 1 }
          }
        );
        console.log(`Updated material ${material.id}: ${filename}`);
      }
    }
    
    // Update LostFound items
    const lostFoundItems = await LostFound.find({ imageUrl: { $exists: true } });
    console.log(`Found ${lostFoundItems.length} lost-found items with imageUrl field`);
    
    for (const item of lostFoundItems) {
      if (item.imageUrl && item.imageUrl.startsWith('/uploads/lostfound/')) {
        // Extract filename from full path
        const filename = item.imageUrl.replace('/uploads/lostfound/', '');
        // Use updateOne to directly modify the document
        await LostFound.updateOne(
          { _id: item._id },
          { 
            $set: { image: filename },
            $unset: { imageUrl: 1 }
          }
        );
        console.log(`Updated lost-found item ${item.id}: ${filename}`);
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
  }
}

// Run migration if called directly
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-utility')
    .then(() => {
      console.log('Connected to MongoDB');
      return migrateImageFields();
    })
    .then(() => {
      console.log('Migration finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateImageFields };
