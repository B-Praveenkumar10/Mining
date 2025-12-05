const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/sih')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas (same as server.js)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['operator', 'engineer'], required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  last_login: Date,
  is_active: { type: Boolean, default: true }
});

const machineDataSchema = new mongoose.Schema({
  machine_id: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  rock_size_mm: Number,
  weight_kg: Number,
  moisture_pct: Number,
  flow_rate: Number,
  motor_current_A: Number,
  motor_voltage_V: Number,
  belt_speed_pwm: Number,
  vibration_level: Number,
  predicted_power_W: Number,
  machine_status: { type: String, enum: ['running', 'stopped', 'maintenance'], default: 'running' }
});

const mlPredictionSchema = new mongoose.Schema({
  machine_id: String,
  timestamp: { type: Date, default: Date.now },
  prediction_type: { type: String, enum: ['power', 'efficiency', 'maintenance', 'throughput'] },
  predicted_value: Number,
  confidence_score: Number,
  model_version: { type: String, default: 'v1.0' }
});

const alertSchema = new mongoose.Schema({
  machine_id: String,
  message: String,
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  created_by: String,
  created_at: { type: Date, default: Date.now },
  is_resolved: { type: Boolean, default: false }
});

// Models
const User = mongoose.model('User', userSchema);
const Machine1Data = mongoose.model('Machine1Data', machineDataSchema);
const Machine2Data = mongoose.model('Machine2Data', machineDataSchema);
const Machine3Data = mongoose.model('Machine3Data', machineDataSchema);
const MLPrediction = mongoose.model('MLPrediction', mlPredictionSchema);
const Alert = mongoose.model('Alert', alertSchema);

const hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

const seedUsers = async () => {
  await User.deleteMany({});
  
  const users = [
    {
      username: 'operator1',
      password_hash: hashPassword('password123'),
      role: 'operator',
      name: 'Praveen Kumar',
      email: 'operator1@mining.com'
    },
    {
      username: 'engineer1',
      password_hash: hashPassword('password123'),
      role: 'engineer',
      name: 'Dr. Rajesh Sharma',
      email: 'engineer1@mining.com'
    }
  ];
  
  await User.insertMany(users);
  console.log('Users seeded');
};

const seedMachineData = async () => {
  const machines = [
    { id: 'machine-01', Model: Machine1Data },
    { id: 'machine-02', Model: Machine2Data },
    { id: 'machine-03', Model: Machine3Data }
  ];

  for (const machine of machines) {
    await machine.Model.deleteMany({});
    
    const dummyData = [];
    for (let i = 0; i < 5; i++) {
      dummyData.push({
        machine_id: machine.id,
        timestamp: new Date(Date.now() - i * 3600000), // 1 hour intervals
        rock_size_mm: Math.random() * 40 + 10,
        weight_kg: Math.random() * 400 + 100,
        moisture_pct: Math.random() * 6 + 2,
        flow_rate: Math.random() * 150 + 50,
        motor_current_A: Math.random() * 40 + 10,
        motor_voltage_V: Math.random() * 40 + 380,
        belt_speed_pwm: Math.floor(Math.random() * 50) + 50,
        vibration_level: Math.random() * 4 + 1,
        predicted_power_W: Math.random() * 4000 + 1000,
        machine_status: i < 3 ? 'running' : 'stopped'
      });
    }
    
    await machine.Model.insertMany(dummyData);
    console.log(`${machine.id} data seeded`);
  }
};

const seedMLPredictions = async () => {
  await MLPrediction.deleteMany({});
  
  const machines = ['machine-01', 'machine-02', 'machine-03'];
  const predictionTypes = ['power', 'efficiency', 'maintenance', 'throughput'];
  
  const predictions = [];
  for (const machineId of machines) {
    for (const predType of predictionTypes) {
      predictions.push({
        machine_id: machineId,
        prediction_type: predType,
        predicted_value: Math.random() * 50 + 50,
        confidence_score: Math.random() * 0.25 + 0.7
      });
    }
  }
  
  await MLPrediction.insertMany(predictions);
  console.log('ML predictions seeded');
};

const seedAlerts = async () => {
  await Alert.deleteMany({});
  
  const alerts = [
    {
      machine_id: 'machine-01',
      message: 'High vibration detected',
      severity: 'high',
      created_by: 'system'
    },
    {
      machine_id: 'machine-02',
      message: 'Temperature threshold exceeded',
      severity: 'medium',
      created_by: 'system'
    },
    {
      machine_id: 'machine-03',
      message: 'Maintenance required',
      severity: 'low',
      created_by: 'system'
    }
  ];
  
  await Alert.insertMany(alerts);
  console.log('Alerts seeded');
};

const seedAll = async () => {
  try {
    console.log('Starting database seeding...');
    await seedUsers();
    await seedMachineData();
    await seedMLPredictions();
    await seedAlerts();
    console.log('Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedAll();