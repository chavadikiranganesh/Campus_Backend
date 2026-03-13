require('dotenv').config();
const mongoose = require('mongoose');
const { StudyMaterial, LostFound, Event, Accommodation, StudyGroup, MedicalHelp } = require('./models');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Checking all collections...');
    
    const collections = [
      { name: 'StudyMaterial', model: StudyMaterial },
      { name: 'LostFound', model: LostFound },
      { name: 'Event', model: Event },
      { name: 'Accommodation', model: Accommodation },
      { name: 'StudyGroup', model: StudyGroup },
      { name: 'MedicalHelp', model: MedicalHelp }
    ];
    
    for (const { name, model } of collections) {
      const count = await model.countDocuments();
      console.log(`${name}: ${count} documents`);
    }
    
    mongoose.connection.close();
  })
  .catch(err => console.error('Error:', err));
