const mongoose = require('mongoose');
require('dotenv').config();

// Use production MongoDB URL
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb+srv://sihteam:password123@sih-mining.xxxxx.mongodb.net/sih';

console.log('🌱 Seeding production database...');
console.log('📍 Connecting to:', MONGODB_URL.replace(/\/\/.*@/, '//***:***@'));

// Import seed script
require('./seed.js');