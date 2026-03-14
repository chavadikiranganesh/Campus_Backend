const mongoose = require('mongoose');
const { MedicalHelp } = require('./server/models');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-utility')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Clear all medical help data
    const result = await MedicalHelp.deleteMany({});
    console.log('Cleared', result.deletedCount, 'medical help records');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
