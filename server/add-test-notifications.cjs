const { Notification } = require('./models');

async function addTestNotifications() {
  try {
    // Clear existing notifications
    await Notification.deleteMany({});
    
    // Add test notifications with different types
    const testNotifications = [
      {
        title: 'New study material: Calculus Notes',
        message: 'Advanced calculus notes are now available in marketplace',
        type: 'study_material',
        referenceId: 1,
        userId: null
      },
      {
        title: 'New accommodation: Vinayaka Ladies Hostel',
        message: 'New PG accommodation available near campus with great facilities',
        type: 'accommodation',
        referenceId: 1,
        userId: null
      },
      {
        title: 'New event: Hackathon 2026',
        message: 'Annual coding competition starting next week - Register now!',
        type: 'event',
        referenceId: 1,
        userId: null
      },
      {
        title: 'Lost item: Wallet',
        message: 'A blue wallet was found near the library',
        type: 'lost_found',
        referenceId: 1,
        userId: null
      },
      {
        title: 'New study group: Data Structures',
        message: 'Join our study group for better understanding of DS concepts',
        type: 'study_group',
        referenceId: 1,
        userId: null
      },
      {
        title: 'System maintenance',
        message: 'Campus Utility will be under maintenance tonight from 2-4 AM',
        type: 'general',
        referenceId: null,
        userId: null
      }
    ];

    await Notification.insertMany(testNotifications);
    console.log('Test notifications added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding test notifications:', error);
    process.exit(1);
  }
}

addTestNotifications();
