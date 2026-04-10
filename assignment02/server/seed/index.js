require('dotenv').config();
const { initDb } = require('../config/db');
const runSeed = require('./seedData');

const seedDatabase = async () => {
  try {
    await initDb();

    console.log('Seeding database...');
    const counts = await runSeed();

    console.log('\n=== Seed completed successfully! ===');
    console.log(`Created: ${counts.users} users, ${counts.titles} titles, ${counts.reviews} reviews, ${counts.watchlistItems} watchlist items`);
    console.log('\nTest accounts:');
    console.log('Admin: admin@animehub.com / password123');
    console.log('User: user@animehub.com / password123');
    console.log('User: reviewer@animehub.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
