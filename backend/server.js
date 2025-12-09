const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
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
// Use separate, configurable models for chat and voice.
// Defaults to gemini-flash-latest (explicitly listed in available models).
const GEMINI_TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-flash-latest';
const GEMINI_VOICE_MODEL = process.env.GEMINI_VOICE_MODEL || 'gemini-flash-latest';

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

  const model = genAI.getGenerativeModel({ model: GEMINI_VOICE_MODEL });
    
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
    const reqStart = Date.now();
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const { messages, system } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      console.error('[gemini.chat:error]', JSON.stringify({
        requestId,
        stage: 'env_check',
        error: 'GEMINI_API_KEY is not set'
      }));
      return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
    }

  const model = genAI.getGenerativeModel({ model: GEMINI_TEXT_MODEL });
    
    const systemContext = system || `You are an expert AI Mining Assistant for the "Mining Optimizer" platform. You have full knowledge of the application's features:
    
    1. **Dashboard**: Real-time monitoring of machines (Crusher, Mill), KPIs (Throughput, Power, Efficiency), and alerts.
    2. **Simulation**: A digital twin environment to simulate ore processing, adjust parameters (feed rate, hardness), and visualize outcomes.
    3. **Crusher 3D**: A 3D visualization of the crusher equipment for training and inspection.
    4. **Analytics**: Detailed charts and trends for power consumption, efficiency, and maintenance predictions.
    5. **Pricing Calculator**: An AWS-style calculator to estimate costs for cloud resources, sensors, and AI services (INR currency).
    6. **Reports**: downloadable PDF/CSV reports of operational data.
    
    Your goal is to help operators and engineers optimize comminution (crushing/grinding) processes.
    
    **Guidelines:**
    - Answer ONLY the user's question directly.
    - Do NOT prefix your response with "ASSISTANT:" or "AI:".
    - Be concise, professional, and actionable.
    - If asked about app navigation, guide them to the specific page (e.g., "Go to the Simulation page...").`;
    
    const conversation = messages.slice(-10).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    // Log request payload shape (redact long content)
    console.log('[gemini.chat:start]', JSON.stringify({
      requestId,
      messageCount: Array.isArray(messages) ? messages.length : 0,
      lastUserMessageLen: (() => {
        const last = Array.isArray(messages) ? messages[messages.length - 1] : null;
        return last && last.role === 'user' && typeof last.content === 'string' ? last.content.length : 0;
      })(),
      systemContextLen: systemContext.length
    }));
    
    const prompt = `${systemContext}\n\nConversation:\n${conversation}\n\nAnswer:`;
    
    let text;
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      text = response.text();
      
      // Clean up response if it includes prefixes
      text = text.replace(/^(ASSISTANT:|AI:|Answer:)\s*/i, '').trim();
    } catch (apiErr) {
      const durationMs = Date.now() - reqStart;
      console.error('[gemini.chat:api_error]', JSON.stringify({
        requestId,
        durationMs,
        error: apiErr?.message || String(apiErr)
      }));
      throw apiErr;
    }

    const durationMs = Date.now() - reqStart;
    console.log('[gemini.chat:success]', JSON.stringify({
      requestId,
      durationMs,
      responseLen: typeof text === 'string' ? text.length : 0
    }));

    res.json({ text });
  } catch (error) {
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    console.error('[gemini.chat:failure]', JSON.stringify({
      requestId,
      error: error?.message || String(error)
    }));
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

// Advanced Analytics route (CSV-based)
app.get('/api/analytics/advanced', async (req, res) => {
  try {
    const csvPath = path.join(__dirname, 'crusher_analytics.csv');
    
    // Generate sample data if CSV not found
    if (!fs.existsSync(csvPath)) {
      const powerEfficiencyTrend = Array.from({ length: 20 }, (_, i) => ({
        timestamp: `${8 + Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`,
        power: 2000 + Math.random() * 500,
        efficiency: 75 + Math.random() * 20
      }));
      
      const throughputEnergyCurve = Array.from({ length: 20 }, (_, i) => ({
        throughput: 50 + Math.random() * 30,
        powerPerTon: 0.4 + Math.random() * 0.2
      }));
      
      const temperatureData = Array.from({ length: 20 }, (_, i) => ({
        timestamp: `${8 + Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`,
        temperature: 55 + Math.random() * 20
      }));
      
      return res.json({
        powerEfficiencyTrend,
        throughputEnergyCurve,
        temperatureData,
        alertCounts: { High: 5, Medium: 8, Low: 12 },
        energySourceData: { thermal: 1200, solar: 800 },
        downtimeData: { planned: 25, unplanned: 8 }
      });
    }
    
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvData.split('\n').slice(0, 51);
    const headers = lines[0].split(',').map(h => h.trim());
    
    const data = [];
    for (let i = 1; i < lines.length && i < 51; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',');
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || '';
        });
        data.push(row);
      }
    }
    
    const powerEfficiencyTrend = data.slice(0, 20).map((row, i) => ({
      timestamp: row['Timestamp']?.substring(11, 16) || `${8 + Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`,
      power: parseFloat(row['P_Total (kW)'] || row['P_Primary (kW)']) || 2000,
      efficiency: parseFloat(row['Power per Ton (kWh/Ton)']) || 80
    }));
    
    const throughputEnergyCurve = data.slice(0, 20).map(row => ({
      throughput: parseFloat(row['Throughput (Tons/Hr)']) || 60,
      powerPerTon: parseFloat(row['Power per Ton (kWh/Ton)']) || 0.45
    }));
    
    const temperatureData = data.slice(0, 20).map((row, i) => ({
      timestamp: row['Timestamp']?.substring(11, 16) || `${8 + Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`,
      temperature: parseFloat(row['T_Primary (°C)']) || 65
    }));
    
    const alertCounts = {};
    data.forEach(row => {
      const alertType = row['Alert Type'];
      if (alertType && alertType !== 'None' && alertType !== '') {
        alertCounts[alertType] = (alertCounts[alertType] || 0) + 1;
      }
    });
    if (Object.keys(alertCounts).length === 0) {
      alertCounts['High'] = 5;
      alertCounts['Medium'] = 8;
      alertCounts['Low'] = 12;
    }
    
    const energySourceData = {
      thermal: data.reduce((sum, row) => sum + (parseFloat(row['%E_Thermal']) || 60), 0) || 1200,
      solar: data.reduce((sum, row) => sum + (parseFloat(row['%E_Solar']) || 40), 0) || 800
    };
    
    const downtimeData = {
      planned: data.reduce((sum, row) => sum + (parseFloat(row['Planned Downtime (Hrs)']) || 0), 0) || 25,
      unplanned: data.reduce((sum, row) => sum + (parseFloat(row['Unplanned Downtime (Hrs)']) || 0), 0) || 8
    };
    
    res.json({
      powerEfficiencyTrend,
      throughputEnergyCurve,
      temperatureData,
      alertCounts,
      energySourceData,
      downtimeData
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Crusher temperature analytics
app.get('/api/analytics/temperature', async (req, res) => {
  try {
    const machines = ['machine-01', 'machine-02', 'machine-03'];
    const temperatureData = [];
    
    for (const machineId of machines) {
      const Model = getMachineModel(machineId);
      const data = await Model.find().sort({ timestamp: -1 }).limit(50);
      
      data.forEach(item => {
        temperatureData.push({
          timestamp: item.timestamp,
          temperature: 25 + (item.motor_current_A || 0),
          machine: machineId,
          status: item.machine_status
        });
      });
    }
    
    res.json({ temperatureData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// PDF Report Generation Endpoint
// =====================================================
const PDFDocument = require('pdfkit');

// Helper function to parse CSV data for reports
function parseCSVForReport(csvContent, startDate, endDate) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const allData = [];
  const filteredData = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || '';
    });
    
    allData.push(row);
    
    // Filter by date range if provided
    if (startDate && endDate && row['Timestamp']) {
      const rowDate = new Date(row['Timestamp']);
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Set end date to end of day
      end.setHours(23, 59, 59, 999);
      
      if (rowDate >= start && rowDate <= end) {
        filteredData.push(row);
      }
    }
  }
  
  // If no data matches the date filter, return all data
  // This ensures report generation always works
  if (filteredData.length === 0 && allData.length > 0) {
    console.log(`[REPORT] No data in range ${startDate} to ${endDate}, using all ${allData.length} records`);
    return allData;
  }
  
  return filteredData.length > 0 ? filteredData : allData;
}

// Calculate analytics summary from data
function calculateAnalyticsSummary(data) {
  if (!data.length) return null;
  
  const runningData = data.filter(d => d['Status'] === 'Running');
  const idleData = data.filter(d => d['Status'] === 'Idle');
  const maintenanceData = data.filter(d => d['Status'] === 'Maintenance');
  
  const totalThroughput = runningData.reduce((sum, d) => sum + parseFloat(d['Throughput (Tons/Hr)'] || 0), 0);
  const avgThroughput = runningData.length ? totalThroughput / runningData.length : 0;
  
  const totalPrimaryPower = runningData.reduce((sum, d) => sum + parseFloat(d['P_Primary (kW)'] || 0), 0);
  const avgPrimaryPower = runningData.length ? totalPrimaryPower / runningData.length : 0;
  
  const totalSecondaryPower = runningData.reduce((sum, d) => sum + parseFloat(d['P_Secondary (kW)'] || 0), 0);
  const avgSecondaryPower = runningData.length ? totalSecondaryPower / runningData.length : 0;
  
  const avgTemperature = runningData.length 
    ? runningData.reduce((sum, d) => sum + parseFloat(d['T_Primary (°C)'] || 0), 0) / runningData.length 
    : 0;
  
  const avgSolar = data.reduce((sum, d) => sum + parseFloat(d['%E_Solar'] || 0), 0) / data.length;
  const avgThermal = data.reduce((sum, d) => sum + parseFloat(d['%E_Thermal'] || 0), 0) / data.length;
  
  const plannedDowntime = data.reduce((sum, d) => sum + parseFloat(d['Planned Downtime (Hrs)'] || 0), 0);
  const unplannedDowntime = data.reduce((sum, d) => sum + parseFloat(d['Unplanned Downtime (Hrs)'] || 0), 0);
  
  const alerts = data.filter(d => d['Alert Type'] && d['Alert Type'] !== 'None');
  const alertBreakdown = {};
  alerts.forEach(a => {
    const type = a['Alert Type'];
    alertBreakdown[type] = (alertBreakdown[type] || 0) + 1;
  });
  
  // Calculate efficiency (throughput per kW)
  const avgEfficiency = avgPrimaryPower > 0 ? (avgThroughput / (avgPrimaryPower + avgSecondaryPower)) * 100 : 0;
  
  // Uptime percentage
  const uptimePercent = data.length ? ((runningData.length + idleData.length) / data.length) * 100 : 0;
  
  return {
    totalRecords: data.length,
    runningRecords: runningData.length,
    idleRecords: idleData.length,
    maintenanceRecords: maintenanceData.length,
    avgThroughput: avgThroughput.toFixed(2),
    maxThroughput: Math.max(...runningData.map(d => parseFloat(d['Throughput (Tons/Hr)'] || 0))).toFixed(2),
    minThroughput: Math.min(...runningData.filter(d => parseFloat(d['Throughput (Tons/Hr)']) > 0).map(d => parseFloat(d['Throughput (Tons/Hr)'] || 0))).toFixed(2),
    avgPrimaryPower: avgPrimaryPower.toFixed(2),
    avgSecondaryPower: avgSecondaryPower.toFixed(2),
    totalPowerConsumption: (totalPrimaryPower + totalSecondaryPower).toFixed(2),
    avgTemperature: avgTemperature.toFixed(1),
    maxTemperature: Math.max(...runningData.map(d => parseFloat(d['T_Primary (°C)'] || 0))).toFixed(1),
    avgSolarEnergy: avgSolar.toFixed(1),
    avgThermalEnergy: avgThermal.toFixed(1),
    plannedDowntime: plannedDowntime.toFixed(1),
    unplannedDowntime: unplannedDowntime.toFixed(1),
    totalDowntime: (plannedDowntime + unplannedDowntime).toFixed(1),
    alertCount: alerts.length,
    alertBreakdown,
    avgEfficiency: avgEfficiency.toFixed(2),
    uptimePercent: uptimePercent.toFixed(1)
  };
}

// Generate PDF Report
app.post('/api/reports/generate', async (req, res) => {
  try {
    const { startDate, endDate, reportType = 'comprehensive' } = req.body;
    
    console.log(`[REPORT] Generating ${reportType} report from ${startDate || 'beginning'} to ${endDate || 'now'}`);
    
    // Read CSV data - check both backend folder and parent folder
    let csvPath = path.join(__dirname, 'crusher_analytics.csv');
    if (!fs.existsSync(csvPath)) {
      csvPath = path.join(__dirname, '..', 'crusher_analytics.csv');
    }
    
    let analyticsData = [];
    
    if (fs.existsSync(csvPath)) {
      console.log(`[REPORT] Reading CSV from: ${csvPath}`);
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      analyticsData = parseCSVForReport(csvContent, startDate, endDate);
      console.log(`[REPORT] Loaded ${analyticsData.length} records`);
    } else {
      console.error(`[REPORT] CSV file not found at ${csvPath}`);
    }
    
    if (!analyticsData.length) {
      return res.status(404).json({ error: 'No data available for the specified date range' });
    }
    
    const summary = calculateAnalyticsSummary(analyticsData);
    
    // Create PDF document
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      info: {
        Title: 'Mining Optimizer Analytics Report',
        Author: 'Mining Optimizer System',
        Subject: 'Crusher Performance Analytics',
        Keywords: 'mining, crusher, analytics, report'
      }
    });
    
    // Set response headers for PDF download
    const filename = `mining_report_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // ========== COVER PAGE ==========
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#1a365d');
    
    doc.fillColor('#ffffff')
       .fontSize(36)
       .font('Helvetica-Bold')
       .text('MINING OPTIMIZER', 50, 200, { align: 'center' });
    
    doc.fontSize(24)
       .font('Helvetica')
       .text('Analytics Report', 50, 250, { align: 'center' });
    
    doc.fontSize(14)
       .text('Crusher Performance & Energy Analysis', 50, 300, { align: 'center' });
    
    // Date range
    const dateRangeText = startDate && endDate 
      ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
      : `All Available Data (${analyticsData.length} records)`;
    
    doc.fontSize(12)
       .text(dateRangeText, 50, 350, { align: 'center' });
    
    doc.fontSize(10)
       .text(`Generated on: ${new Date().toLocaleString()}`, 50, 700, { align: 'center' });
    
    // ========== EXECUTIVE SUMMARY ==========
    doc.addPage();
    doc.fillColor('#1a365d')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('Executive Summary', 50, 50);
    
    doc.moveTo(50, 80).lineTo(545, 80).stroke('#e2e8f0');
    
    doc.fillColor('#333333')
       .fontSize(11)
       .font('Helvetica');
    
    let yPos = 100;
    
    // Key Metrics Box
    doc.rect(50, yPos, 495, 120).fill('#f7fafc').stroke('#e2e8f0');
    
    doc.fillColor('#1a365d')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Key Performance Indicators', 60, yPos + 10);
    
    doc.fillColor('#333333').fontSize(10).font('Helvetica');
    
    const kpiData = [
      ['Average Throughput', `${summary.avgThroughput} Tons/Hr`],
      ['Average Efficiency', `${summary.avgEfficiency}%`],
      ['System Uptime', `${summary.uptimePercent}%`],
      ['Total Power Consumed', `${summary.totalPowerConsumption} kW`],
      ['Solar Energy Usage', `${summary.avgSolarEnergy}%`],
      ['Total Alerts', `${summary.alertCount}`]
    ];
    
    let col1X = 70, col2X = 300;
    let kpiY = yPos + 35;
    
    kpiData.forEach((kpi, i) => {
      const xPos = i % 2 === 0 ? col1X : col2X;
      if (i > 0 && i % 2 === 0) kpiY += 25;
      doc.font('Helvetica').text(kpi[0] + ':', xPos, kpiY);
      doc.font('Helvetica-Bold').text(kpi[1], xPos + 120, kpiY);
    });
    
    yPos += 140;
    
    // Operational Status Summary
    doc.fillColor('#1a365d')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Operational Status Distribution', 50, yPos);
    
    yPos += 25;
    doc.fillColor('#333333').fontSize(10).font('Helvetica');
    
    doc.text(`• Running: ${summary.runningRecords} records (${((summary.runningRecords/summary.totalRecords)*100).toFixed(1)}%)`, 60, yPos);
    yPos += 18;
    doc.text(`• Idle: ${summary.idleRecords} records (${((summary.idleRecords/summary.totalRecords)*100).toFixed(1)}%)`, 60, yPos);
    yPos += 18;
    doc.text(`• Maintenance: ${summary.maintenanceRecords} records (${((summary.maintenanceRecords/summary.totalRecords)*100).toFixed(1)}%)`, 60, yPos);
    
    // ========== PRODUCTION ANALYSIS ==========
    doc.addPage();
    doc.fillColor('#1a365d')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('Production Analysis', 50, 50);
    
    doc.moveTo(50, 80).lineTo(545, 80).stroke('#e2e8f0');
    
    yPos = 100;
    
    // Throughput Section
    doc.fillColor('#2d3748')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Throughput Performance', 50, yPos);
    
    yPos += 25;
    doc.fillColor('#333333').fontSize(10).font('Helvetica');
    
    const throughputTable = [
      ['Metric', 'Value', 'Unit'],
      ['Average Throughput', summary.avgThroughput, 'Tons/Hr'],
      ['Maximum Throughput', summary.maxThroughput, 'Tons/Hr'],
      ['Minimum Throughput', summary.minThroughput, 'Tons/Hr'],
    ];
    
    // Draw table
    throughputTable.forEach((row, i) => {
      const bgColor = i === 0 ? '#edf2f7' : (i % 2 === 0 ? '#f7fafc' : '#ffffff');
      doc.rect(50, yPos, 300, 22).fill(bgColor);
      doc.fillColor(i === 0 ? '#1a365d' : '#333333')
         .font(i === 0 ? 'Helvetica-Bold' : 'Helvetica')
         .text(row[0], 60, yPos + 6)
         .text(row[1], 200, yPos + 6)
         .text(row[2], 280, yPos + 6);
      yPos += 22;
    });
    
    yPos += 30;
    
    // Temperature Section
    doc.fillColor('#2d3748')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Temperature Monitoring', 50, yPos);
    
    yPos += 25;
    doc.fillColor('#333333').fontSize(10).font('Helvetica');
    doc.text(`Average Operating Temperature: ${summary.avgTemperature}°C`, 60, yPos);
    yPos += 18;
    doc.text(`Maximum Temperature Recorded: ${summary.maxTemperature}°C`, 60, yPos);
    yPos += 18;
    
    const tempStatus = parseFloat(summary.maxTemperature) > 75 ? '⚠️ Warning: High temperature detected' : '✓ Temperature within normal range';
    doc.fillColor(parseFloat(summary.maxTemperature) > 75 ? '#c53030' : '#276749')
       .text(tempStatus, 60, yPos);
    
    // ========== ENERGY ANALYSIS ==========
    yPos += 50;
    doc.fillColor('#1a365d')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text('Energy Analysis', 50, yPos);
    
    doc.moveTo(50, yPos + 25).lineTo(545, yPos + 25).stroke('#e2e8f0');
    yPos += 40;
    
    // Power Consumption
    doc.fillColor('#2d3748')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Power Consumption', 50, yPos);
    
    yPos += 25;
    doc.fillColor('#333333').fontSize(10).font('Helvetica');
    
    doc.text(`Primary Crusher Average: ${summary.avgPrimaryPower} kW`, 60, yPos);
    yPos += 18;
    doc.text(`Secondary Crusher Average: ${summary.avgSecondaryPower} kW`, 60, yPos);
    yPos += 18;
    doc.text(`Total Power Consumption: ${summary.totalPowerConsumption} kW`, 60, yPos);
    
    yPos += 35;
    
    // Energy Sources
    doc.fillColor('#2d3748')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Energy Source Distribution', 50, yPos);
    
    yPos += 25;
    
    // Energy source bars
    const solarWidth = (parseFloat(summary.avgSolarEnergy) / 100) * 200;
    const thermalWidth = (parseFloat(summary.avgThermalEnergy) / 100) * 200;
    
    doc.fillColor('#333333').fontSize(10).font('Helvetica');
    doc.text('Solar Energy:', 60, yPos);
    doc.rect(150, yPos, 200, 15).fill('#e2e8f0');
    doc.rect(150, yPos, solarWidth, 15).fill('#48bb78');
    doc.fillColor('#333333').text(`${summary.avgSolarEnergy}%`, 360, yPos);
    
    yPos += 25;
    doc.text('Thermal Energy:', 60, yPos);
    doc.rect(150, yPos, 200, 15).fill('#e2e8f0');
    doc.rect(150, yPos, thermalWidth, 15).fill('#ed8936');
    doc.fillColor('#333333').text(`${summary.avgThermalEnergy}%`, 360, yPos);
    
    // ========== DOWNTIME ANALYSIS ==========
    doc.addPage();
    doc.fillColor('#1a365d')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('Downtime & Maintenance Analysis', 50, 50);
    
    doc.moveTo(50, 80).lineTo(545, 80).stroke('#e2e8f0');
    
    yPos = 100;
    
    // Downtime Summary
    doc.fillColor('#2d3748')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Downtime Summary', 50, yPos);
    
    yPos += 25;
    doc.fillColor('#333333').fontSize(10).font('Helvetica');
    
    doc.text(`Planned Downtime: ${summary.plannedDowntime} hours`, 60, yPos);
    yPos += 18;
    doc.text(`Unplanned Downtime: ${summary.unplannedDowntime} hours`, 60, yPos);
    yPos += 18;
    doc.font('Helvetica-Bold').text(`Total Downtime: ${summary.totalDowntime} hours`, 60, yPos);
    
    yPos += 40;
    
    // Alert Analysis
    doc.fillColor('#2d3748')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Alert Analysis', 50, yPos);
    
    yPos += 25;
    doc.fillColor('#333333').fontSize(10).font('Helvetica');
    
    doc.text(`Total Alerts: ${summary.alertCount}`, 60, yPos);
    yPos += 25;
    
    if (Object.keys(summary.alertBreakdown).length > 0) {
      doc.font('Helvetica-Bold').text('Alert Breakdown:', 60, yPos);
      yPos += 20;
      doc.font('Helvetica');
      
      Object.entries(summary.alertBreakdown).forEach(([alertType, count]) => {
        doc.text(`• ${alertType}: ${count} occurrence(s)`, 70, yPos);
        yPos += 18;
      });
    } else {
      doc.fillColor('#276749').text('✓ No alerts recorded during this period', 60, yPos);
    }
    
    // ========== DATA SAMPLE ==========
    yPos += 40;
    doc.fillColor('#1a365d')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text('Sample Data Records', 50, yPos);
    
    doc.moveTo(50, yPos + 25).lineTo(545, yPos + 25).stroke('#e2e8f0');
    yPos += 40;
    
    // Show first 10 records as sample
    const sampleData = analyticsData.slice(0, 10);
    doc.fontSize(8).font('Helvetica');
    
    // Table header
    doc.rect(50, yPos, 495, 18).fill('#edf2f7');
    doc.fillColor('#1a365d').font('Helvetica-Bold');
    doc.text('Timestamp', 55, yPos + 5);
    doc.text('Throughput', 140, yPos + 5);
    doc.text('P_Primary', 210, yPos + 5);
    doc.text('P_Secondary', 280, yPos + 5);
    doc.text('Temp', 355, yPos + 5);
    doc.text('Status', 400, yPos + 5);
    doc.text('Alert', 460, yPos + 5);
    yPos += 18;
    
    // Table rows
    doc.font('Helvetica').fillColor('#333333');
    sampleData.forEach((row, i) => {
      const bgColor = i % 2 === 0 ? '#ffffff' : '#f7fafc';
      doc.rect(50, yPos, 495, 16).fill(bgColor);
      doc.fillColor('#333333');
      doc.text(row['Timestamp']?.substring(0, 16) || '-', 55, yPos + 4);
      doc.text(row['Throughput (Tons/Hr)'] || '-', 140, yPos + 4);
      doc.text(row['P_Primary (kW)'] || '-', 210, yPos + 4);
      doc.text(row['P_Secondary (kW)'] || '-', 280, yPos + 4);
      doc.text(row['T_Primary (°C)'] || '-', 355, yPos + 4);
      doc.text(row['Status'] || '-', 400, yPos + 4);
      doc.text((row['Alert Type'] || 'None').substring(0, 12), 460, yPos + 4);
      yPos += 16;
    });
    
    // ========== RECOMMENDATIONS ==========
    doc.addPage();
    doc.fillColor('#1a365d')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('Recommendations', 50, 50);
    
    doc.moveTo(50, 80).lineTo(545, 80).stroke('#e2e8f0');
    
    yPos = 100;
    doc.fillColor('#333333').fontSize(11).font('Helvetica');
    
    const recommendations = [];
    
    // Generate recommendations based on data
    if (parseFloat(summary.avgEfficiency) < 2) {
      recommendations.push('Consider optimizing crusher settings to improve throughput-to-power ratio.');
    }
    if (parseFloat(summary.unplannedDowntime) > 5) {
      recommendations.push('High unplanned downtime detected. Implement predictive maintenance strategies.');
    }
    if (parseFloat(summary.maxTemperature) > 72) {
      recommendations.push('Monitor temperature closely. Consider improving cooling systems.');
    }
    if (parseFloat(summary.avgSolarEnergy) < 30) {
      recommendations.push('Increase solar energy utilization to reduce operational costs.');
    }
    if (summary.alertCount > 5) {
      recommendations.push('Review and address recurring alerts to prevent potential failures.');
    }
    if (parseFloat(summary.uptimePercent) < 80) {
      recommendations.push('System uptime is below optimal. Review maintenance schedules.');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('System is operating within optimal parameters.');
      recommendations.push('Continue current maintenance schedules.');
      recommendations.push('Monitor for any emerging patterns in the data.');
    }
    
    recommendations.forEach((rec, i) => {
      doc.circle(60, yPos + 5, 3).fill('#3182ce');
      doc.fillColor('#333333').text(rec, 75, yPos, { width: 470 });
      yPos += 30;
    });
    
    // Add footer to last page (streaming mode doesn't support switchToPage)
    doc.fillColor('#718096')
       .fontSize(8)
       .text(
         `Mining Optimizer Report | Generated: ${new Date().toLocaleString()} | ${analyticsData.length} records analyzed`,
         50, 
         doc.page.height - 30,
         { align: 'center', width: doc.page.width - 100 }
       );
    
    // Finalize PDF
    doc.end();
    
    console.log(`[REPORT] PDF generated successfully with ${analyticsData.length} records`);
    
  } catch (error) {
    console.error('[REPORT] Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate report', details: error.message });
  }
});

// Get report data summary (for chatbot to reference)
app.get('/api/reports/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Check both backend folder and parent folder for CSV
    let csvPath = path.join(__dirname, 'crusher_analytics.csv');
    if (!fs.existsSync(csvPath)) {
      csvPath = path.join(__dirname, '..', 'crusher_analytics.csv');
    }
    
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: 'No analytics data available' });
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const analyticsData = parseCSVForReport(csvContent, startDate, endDate);
    
    if (!analyticsData.length) {
      return res.status(404).json({ error: 'No data available for the specified date range' });
    }
    
    const summary = calculateAnalyticsSummary(analyticsData);
    res.json({ summary, recordCount: analyticsData.length });
    
  } catch (error) {
    console.error('[REPORT] Error getting summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});