const mongoose = require('mongoose');
const { MedicalHelp } = require('./server/models');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-utility')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Check what's in the MedicalHelp collection
    const allRecords = await MedicalHelp.find({});
    console.log('Total records:', allRecords.length);
    console.log('Records:', JSON.stringify(allRecords, null, 2));
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
