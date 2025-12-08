const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/sih')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections:', collections.map(c => c.name));
    
    const OperatorSignup = mongoose.connection.collection('operatorsignups');
    const signups = await OperatorSignup.find({}).toArray();
    console.log('\nOperator Signups:', JSON.stringify(signups, null, 2));
    
    const Users = mongoose.connection.collection('users');
    const users = await Users.find({}).toArray();
    console.log('\nUsers:', JSON.stringify(users, null, 2));
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
