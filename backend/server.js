const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: [process.env.CORS_ORIGIN || 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// MongoDB connection with proper error handling
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/sih', {
      serverSelectionTimeoutMS: 30000, // 30s for Atlas
      socketTimeoutMS: 45000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Schemas
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

const operatorSignupSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  emp_id: { type: String, required: true, unique: true },
  mining_engg_approval: { type: String, enum: ['no', 'yes'], default: 'no' },
  created_at: { type: Date, default: Date.now },
  approved_at: Date,
  approved_by: String
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
const OperatorSignup = mongoose.model('OperatorSignup', operatorSignupSchema);
const Machine1Data = mongoose.model('Machine1Data', machineDataSchema);
const Machine2Data = mongoose.model('Machine2Data', machineDataSchema);
const Machine3Data = mongoose.model('Machine3Data', machineDataSchema);
const MLPrediction = mongoose.model('MLPrediction', mlPredictionSchema);
const Alert = mongoose.model('Alert', alertSchema);

// Helper functions
const getMachineModel = (machineId) => {
  const models = {
    'machine-01': Machine1Data,
    'machine-02': Machine2Data,
    'machine-03': Machine3Data
  };
  return models[machineId];
};

const hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

const verifyPassword = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};

const createJWTToken = (userData) => {
  return jwt.sign(
    {
      user_id: userData._id,
      username: userData.username,
      role: userData.role
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// Auth middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.user_id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Routes
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({ 
    status: 'ok',
    database: {
      status: dbStates[dbStatus],
      connected: dbStatus === 1,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/db/status', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected', 
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({
    connected: dbStatus === 1,
    status: dbStates[dbStatus],
    host: mongoose.connection.host || 'unknown',
    port: mongoose.connection.port || 'unknown',
    database: mongoose.connection.name || 'unknown',
    readyState: dbStatus
  });
});

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    const token = createJWTToken(user);
    
    res.json({
      token,
      user: {
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, role, name, email } = req.body;
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const user = new User({
      username,
      password_hash: hashPassword(password),
      role,
      name,
      email
    });

    await user.save();
    
    res.json({
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/operator-signup', async (req, res) => {
  try {
    const { username, password, emp_id } = req.body;
    
    const existingSignup = await OperatorSignup.findOne({ $or: [{ username }, { emp_id }] });
    if (existingSignup) {
      return res.status(400).json({ error: 'Username or Employee ID already exists' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const signup = new OperatorSignup({
      username,
      password_hash: hashPassword(password),
      emp_id
    });

    await signup.save();
    res.json({ message: 'Signup request submitted. Awaiting mining engineer approval.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/pending-signups', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'engineer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const pendingSignups = await OperatorSignup.find({ mining_engg_approval: 'no' })
      .select('-password_hash')
      .sort({ created_at: -1 });
    
    res.json({ signups: pendingSignups });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/approve-signup/:signupId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'engineer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const signup = await OperatorSignup.findById(req.params.signupId);
    if (!signup) {
      return res.status(404).json({ error: 'Signup request not found' });
    }

    signup.mining_engg_approval = 'yes';
    signup.approved_at = new Date();
    signup.approved_by = req.user.username;
    await signup.save();

    const user = new User({
      username: signup.username,
      password_hash: signup.password_hash,
      role: 'operator',
      name: signup.username,
      email: `${signup.username}@mining.com`
    });
    await user.save();

    res.json({ message: 'Operator approved and added to login system' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/reject-signup/:signupId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'engineer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await OperatorSignup.findByIdAndDelete(req.params.signupId);
    res.json({ message: 'Operator signup rejected and removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Machine routes
app.get('/api/machines/:machineId/data', async (req, res) => {
  try {
    const { machineId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    const Model = getMachineModel(machineId);
    if (!Model) {
      return res.status(400).json({ error: 'Invalid machine ID' });
    }

    const data = await Model.find().sort({ timestamp: -1 }).limit(limit);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/machines/:machineId/status', async (req, res) => {
  try {
    const { machineId } = req.params;
    
    const Model = getMachineModel(machineId);
    if (!Model) {
      return res.status(400).json({ error: 'Invalid machine ID' });
    }

    const latest = await Model.findOne().sort({ timestamp: -1 });
    if (!latest) {
      return res.status(404).json({ error: 'No data found for machine' });
    }

    res.json({
      machine_id: machineId,
      status: latest.machine_status,
      last_update: latest.timestamp,
      throughput: latest.flow_rate || 0,
      power_draw: (latest.predicted_power_W || 0) / 1000,
      efficiency: Math.min(100, (latest.flow_rate || 0) / 2),
      temperature: 25 + (latest.motor_current_A || 0),
      vibration: latest.vibration_level || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/machines/:machineId/control', authenticateToken, async (req, res) => {
  try {
    const { machineId } = req.params;
    const { action } = req.body;
    
    if (!['start', 'stop', 'maintenance'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const statusMap = { start: 'running', stop: 'stopped', maintenance: 'maintenance' };
    const newStatus = statusMap[action];

    const Model = getMachineModel(machineId);
    if (!Model) {
      return res.status(400).json({ error: 'Invalid machine ID' });
    }

    await Model.updateMany(
      { machine_id: machineId },
      { machine_status: newStatus, timestamp: new Date() }
    );

    res.json({ 
      message: `Machine ${machineId} ${action} successful`, 
      status: newStatus 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gemini AI routes
app.post('/api/gemini/voice', async (req, res) => {
  try {
    const { command, language, currentMode, availableModes } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `You are a mining equipment voice assistant. Analyze this voice command and determine the intended machine mode.

Voice Command: "${command}"
Language: ${language}
Current Mode: ${currentMode}
Available Modes: ${availableModes.join(', ')}

Mode Mappings:
- "crusher" or "crusher only" → crusher
- "mill" or "mill only" → mill
- "crusher and mill" or "both" → crusher+mill
- "all machines" or "everything" → full circuit

Respond with JSON only:
{
  "mode": "detected_mode_or_null",
  "confidence": 0.0-1.0,
  "explanation": "brief_explanation"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (parseError) {
      res.json({
        mode: null,
        confidence: 0.0,
        explanation: "Unable to parse response"
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, system } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const systemContext = system || "You are an expert AI Mining Assistant helping with crushing optimization, grinding efficiency, predictive maintenance, Digital Twin simulation, equipment monitoring, and AI-driven process control.";
    
    const conversation = messages.slice(-10).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    
    const prompt = `${systemContext}\n\nProvide concise, clear, and actionable answers.\n\nConversation:\n${conversation}\n\nASSISTANT:`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics routes
app.get('/api/analytics/overview', authenticateToken, async (req, res) => {
  try {
    const machines = ['machine-01', 'machine-02', 'machine-03'];
    const overview = [];
    let totalPower = 0;
    let totalFlow = 0;
    let avgEfficiency = 0;
    let runningMachines = 0;

    for (const machineId of machines) {
      const Model = getMachineModel(machineId);
      const latest = await Model.findOne().sort({ timestamp: -1 });
      
      if (latest) {
        const efficiency = Math.min(100, (latest.flow_rate || 0) / 2);
        totalPower += latest.predicted_power_W || 0;
        totalFlow += latest.flow_rate || 0;
        avgEfficiency += efficiency;
        if (latest.machine_status === 'running') runningMachines++;
        
        overview.push({
          machine_id: machineId,
          name: `Machine ${machineId.split('-')[1]}`,
          status: latest.machine_status,
          power_W: latest.predicted_power_W || 0,
          flow_rate: latest.flow_rate || 0,
          efficiency: efficiency,
          temperature: 25 + (latest.motor_current_A || 0),
          vibration: latest.vibration_level || 0,
          last_update: latest.timestamp
        });
      }
    }

    avgEfficiency = overview.length > 0 ? avgEfficiency / overview.length : 0;

    res.json({ 
      machines: overview, 
      total_machines: overview.length,
      summary: {
        total_power_kw: totalPower / 1000,
        total_throughput: totalFlow,
        avg_efficiency: Math.round(avgEfficiency),
        running_machines: runningMachines,
        operational_status: Math.round((runningMachines / machines.length) * 100)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/analytics/trends', authenticateToken, async (req, res) => {
  try {
    const machines = ['machine-01', 'machine-02', 'machine-03'];
    const trends = [];
    
    for (const machineId of machines) {
      const Model = getMachineModel(machineId);
      const data = await Model.find().sort({ timestamp: -1 }).limit(24);
      
      const hourlyData = data.reverse().map((item, index) => ({
        hour: index,
        power: (item.predicted_power_W || 0) / 1000,
        throughput: item.flow_rate || 0,
        efficiency: Math.min(100, (item.flow_rate || 0) / 2)
      }));
      
      trends.push({
        machine_id: machineId,
        name: `Machine ${machineId.split('-')[1]}`,
        hourly_data: hourlyData
      });
    }
    
    res.json({ trends });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/analytics/breakdown', authenticateToken, async (req, res) => {
  try {
    const machines = ['machine-01', 'machine-02', 'machine-03'];
    const breakdown = [];
    let totalUtilization = 0;
    
    for (const machineId of machines) {
      const Model = getMachineModel(machineId);
      const latest = await Model.findOne().sort({ timestamp: -1 });
      
      if (latest) {
        const utilization = latest.machine_status === 'running' ? 
          Math.min(100, (latest.flow_rate || 0) / 2) : 0;
        totalUtilization += utilization;
        
        breakdown.push({
          name: `Machine ${machineId.split('-')[1]}`,
          value: utilization,
          color: machineId === 'machine-01' ? '#f59e0b' : 
                 machineId === 'machine-02' ? '#3b82f6' : '#10b981'
        });
      }
    }
    
    res.json({ breakdown, total_utilization: totalUtilization });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/analytics/alerts', authenticateToken, async (req, res) => {
  try {
    const alerts = await Alert.find({ is_resolved: false })
      .sort({ created_at: -1 })
      .limit(10);
    
    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User logs route
app.get('/api/users/logs', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({}, {
      username: 1,
      name: 1,
      role: 1,
      email: 1,
      last_login: 1,
      created_at: 1,
      is_active: 1
    }).sort({ last_login: -1 });
    
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});