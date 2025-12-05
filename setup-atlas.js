const mongoose = require('mongoose');
require('dotenv').config();

// Replace YOUR_PASSWORD with your actual Atlas password
const ATLAS_URL = 'mongodb+srv://Sih25210:Harini%402004@cluster0.hiifees.mongodb.net/sih?retryWrites=true&w=majority';

console.log('🔗 Connecting to MongoDB Atlas...');
console.log('📍 Cluster: cluster0.hiifees.mongodb.net');

async function setupAtlas() {
  try {
    // Connect with longer timeout for Atlas
    await mongoose.connect(ATLAS_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to Atlas successfully!');
    
    // Import and run seed script
    console.log('🌱 Starting database seeding...');
    require('./seed.js');
    
  } catch (error) {
    console.error('❌ Atlas connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Replace YOUR_PASSWORD with your actual Atlas password');
    console.log('2. Check if your IP is whitelisted in Atlas Network Access');
    console.log('3. Verify database user permissions');
    process.exit(1);
  }
}

setupAtlas();