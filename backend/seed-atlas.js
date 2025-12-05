require('dotenv').config();
const mongoose = require('mongoose');

console.log('🌱 Seeding Atlas Database...');

// Import the existing seed script
require('./seed.js');