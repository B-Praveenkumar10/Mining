const mongoose = require('mongoose');

const urls = [
  'mongodb+srv://Sih25210:Harini2004@cluster0.hiifees.mongodb.net/sih?retryWrites=true&w=majority',
  'mongodb+srv://Sih25210:Harini2004@cluster0.hiifees.mongodb.net/?retryWrites=true&w=majority',
];

async function testConnection(url, index) {
  console.log(`\nTesting connection ${index + 1}...`);
  try {
    await mongoose.connect(url, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ SUCCESS! Connected to Atlas');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    await mongoose.disconnect();
    return false;
  }
}

async function runTests() {
  for (let i = 0; i < urls.length; i++) {
    const success = await testConnection(urls[i], i);
    if (success) {
      console.log('\n✅ Use this connection string in .env:');
      console.log(`MONGODB_URL=${urls[i]}`);
      process.exit(0);
    }
  }
  console.log('\n❌ All connection attempts failed');
  console.log('\nCheck:');
  console.log('1. Atlas → Database Access → User "Sih25210" exists');
  console.log('2. Password is exactly "Harini2004"');
  console.log('3. Network Access → Your IP is whitelisted (or use 0.0.0.0/0)');
  process.exit(1);
}

runTests();
