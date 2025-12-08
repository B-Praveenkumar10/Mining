import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';

/*
  Graph.tsx – Dynamic Motor & Crusher Analytics Dashboard
  
  Real-time simulation based on industrial research data for:
  - Conveyor belt motor current consumption
  - Energy optimization in mineral processing
  
  Research References:
  - IEC 60034-30-1: Efficiency classes for motors
  - Mining industry standards for conveyor systems
  - Variable Frequency Drive (VFD) optimization studies
*/

interface DataPoint {
  weight: number;
  current: number;
  theoreticalCurrent: number;
  powerFactor: number;
  efficiency: number;
}

interface OptimizationPoint {
  weight: number;
  speed: number;
  currentVariable: number;
  currentOptimized: number;
  savingsPercent: number;
  savingsKWh: number;
}

interface LiveMetrics {
  currentWeight: number;
  currentRPM: number;
  currentDraw: number;
  optimizedCurrent: number;
  savings: number;
  timestamp: Date;
}

// Custom tooltip for Graph 1
const CustomTooltip1 = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-neutral-200 rounded-lg shadow-xl p-4 min-w-[200px]">
        <p className="font-semibold text-neutral-800 border-b border-neutral-200 pb-2 mb-2">
          Roller Weight: {label} kg
        </p>
        <div className="space-y-1.5 text-sm">
          <p className="flex justify-between">
            <span className="text-neutral-600">Current Draw:</span>
            <span className="font-medium text-blue-600">{data.current} A</span>
          </p>
          <p className="flex justify-between">
            <span className="text-neutral-600">Theoretical:</span>
            <span className="font-medium text-neutral-700">{data.theoreticalCurrent} A</span>
          </p>
          <p className="flex justify-between">
            <span className="text-neutral-600">Power Factor:</span>
            <span className="font-medium text-emerald-600">{data.powerFactor}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-neutral-600">Motor Efficiency:</span>
            <span className="font-medium text-amber-600">{data.efficiency}%</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Custom tooltip for Graph 2
const CustomTooltip2 = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-neutral-200 rounded-lg shadow-xl p-4 min-w-[220px]">
        <p className="font-semibold text-neutral-800 border-b border-neutral-200 pb-2 mb-2">
          Roller Weight: {label} kg
        </p>
        <div className="space-y-1.5 text-sm">
          <p className="flex justify-between">
            <span className="text-neutral-600">Motor Speed:</span>
            <span className="font-medium text-purple-600">{data.speed} RPM</span>
          </p>
          <p className="flex justify-between">
            <span className="text-neutral-600">Variable Speed:</span>
            <span className="font-medium text-rose-600">{data.currentVariable} A</span>
          </p>
          <p className="flex justify-between">
            <span className="text-neutral-600">Optimized (VFD):</span>
            <span className="font-medium text-emerald-600">{data.currentOptimized} A</span>
          </p>
          <div className="border-t border-neutral-200 mt-2 pt-2">
            <p className="flex justify-between text-emerald-700 font-medium">
              <span>Energy Savings:</span>
              <span>{data.savingsPercent}%</span>
            </p>
            <p className="flex justify-between text-emerald-600">
              <span>Power Saved:</span>
              <span>{data.savingsKWh} kW</span>
            </p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function Graph() {
  const [isLive, setIsLive] = useState(true);
  const [weightCurrentData, setWeightCurrentData] = useState<DataPoint[]>([]);
  const [speedOptimizationData, setSpeedOptimizationData] = useState<OptimizationPoint[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
    currentWeight: 125,
    currentRPM: 950,
    currentDraw: 16.25,
    optimizedCurrent: 14.17,
    savings: 12.8,
    timestamp: new Date()
  });
  const [highlightIndex, setHighlightIndex] = useState(7); // Index for current weight position

  // Generate data for Graph 1 with dynamic noise
  const generateWeightCurrentData = useCallback(() => {
    const data: DataPoint[] = [];
    for (let weight = 50; weight <= 200; weight += 10) {
      const current = 10 + (weight / 20);
      // Dynamic noise that changes over time
      const noise = (Math.sin(Date.now() / 1000 + weight) * 0.3) + (Math.random() - 0.5) * 0.2;
      
      data.push({
        weight,
        current: parseFloat((current + noise).toFixed(2)),
        theoreticalCurrent: parseFloat(current.toFixed(2)),
        powerFactor: parseFloat((0.85 + (weight / 2000) + Math.random() * 0.01).toFixed(3)),
        efficiency: parseFloat((92 - (weight / 500) + (Math.random() - 0.5) * 0.5).toFixed(1)),
      });
    }
    return data;
  }, []);

  // Generate data for Graph 2 with dynamic values
  const generateSpeedOptimizationData = useCallback(() => {
    const data: OptimizationPoint[] = [];
    for (let weight = 50; weight <= 200; weight += 10) {
      const speed = 800 + ((weight - 50) / 150) * 600;
      // Add dynamic variations
      const speedNoise = Math.sin(Date.now() / 800 + weight) * 20;
      const actualSpeed = speed + speedNoise;
      
      const currentVariableSpeed = 10 + (weight / 25) + (actualSpeed / 300);
      const currentOptimized = 10 + (weight / 30);
      const noise = (Math.random() - 0.5) * 0.3;
      
      const savingsPercent = ((currentVariableSpeed - currentOptimized) / currentVariableSpeed) * 100;
      const savingsKWh = (currentVariableSpeed - currentOptimized) * 0.415;
      
      data.push({
        weight,
        speed: Math.round(actualSpeed),
        currentVariable: parseFloat((currentVariableSpeed + noise).toFixed(2)),
        currentOptimized: parseFloat((currentOptimized + noise * 0.5).toFixed(2)),
        savingsPercent: parseFloat(savingsPercent.toFixed(1)),
        savingsKWh: parseFloat(savingsKWh.toFixed(2)),
      });
    }
    return data;
  }, []);

  // Update live metrics with realistic jitter
  const updateLiveMetrics = useCallback(() => {
    const baseWeight = 100 + Math.sin(Date.now() / 3000) * 50 + Math.random() * 20;
    const weight = Math.max(50, Math.min(200, baseWeight));
    const speed = 800 + ((weight - 50) / 150) * 600 + (Math.random() - 0.5) * 30;
    const current = 10 + (weight / 20) + (Math.random() - 0.5) * 0.5;
    const optimized = 10 + (weight / 30) + (Math.random() - 0.5) * 0.3;
    const savings = ((current - optimized) / current) * 100;
    
    // Calculate highlight index (which data point is closest to current weight)
    const index = Math.round((weight - 50) / 10);
    setHighlightIndex(Math.max(0, Math.min(15, index)));
    
    setLiveMetrics({
      currentWeight: parseFloat(weight.toFixed(1)),
      currentRPM: Math.round(speed),
      currentDraw: parseFloat(current.toFixed(2)),
      optimizedCurrent: parseFloat(optimized.toFixed(2)),
      savings: parseFloat(savings.toFixed(1)),
      timestamp: new Date()
    });
  }, []);

  // Initialize and update data
  useEffect(() => {
    setWeightCurrentData(generateWeightCurrentData());
    setSpeedOptimizationData(generateSpeedOptimizationData());
  }, [generateWeightCurrentData, generateSpeedOptimizationData]);

  // Live update interval
  useEffect(() => {
    if (!isLive) return;
    
    const dataInterval = setInterval(() => {
      setWeightCurrentData(generateWeightCurrentData());
      setSpeedOptimizationData(generateSpeedOptimizationData());
    }, 500); // Update graphs every 500ms
    
    const metricsInterval = setInterval(() => {
      updateLiveMetrics();
    }, 200); // Update metrics every 200ms
    
    return () => {
      clearInterval(dataInterval);
      clearInterval(metricsInterval);
    };
  }, [isLive, generateWeightCurrentData, generateSpeedOptimizationData, updateLiveMetrics]);

  // Calculate summary statistics
  const totalSavings = {
    avgSavings: speedOptimizationData.length > 0 
      ? (speedOptimizationData.reduce((sum, d) => sum + d.savingsPercent, 0) / speedOptimizationData.length).toFixed(1)
      : '0',
    maxSavings: speedOptimizationData.length > 0 
      ? Math.max(...speedOptimizationData.map(d => d.savingsPercent)).toFixed(1)
      : '0',
    totalKWh: speedOptimizationData.length > 0 
      ? speedOptimizationData.reduce((sum, d) => sum + d.savingsKWh, 0).toFixed(1)
      : '0'
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 tracking-tight">
              Motor Performance Analytics
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Real-time analysis • {formatTime(liveMetrics.timestamp)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Live Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLive(!isLive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isLive ? 'bg-emerald-500' : 'bg-neutral-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isLive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm text-neutral-600 flex items-center gap-1.5">
                {isLive && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
                Live Data
              </span>
            </div>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-sm font-medium shadow-sm transition-all hover:shadow-md"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Live Metrics Bar */}
        <div className="mb-6 p-4 bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-xl shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
              <span className="text-white font-medium">Live Sensor Data</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-neutral-400">Weight:</span>
                <span className="ml-2 text-amber-400 font-bold tabular-nums">{liveMetrics.currentWeight} kg</span>
              </div>
              <div>
                <span className="text-neutral-400">Speed:</span>
                <span className="ml-2 text-blue-400 font-bold tabular-nums">{liveMetrics.currentRPM} RPM</span>
              </div>
              <div>
                <span className="text-neutral-400">Current:</span>
                <span className="ml-2 text-rose-400 font-bold tabular-nums">{liveMetrics.currentDraw} A</span>
              </div>
              <div>
                <span className="text-neutral-400">Optimized:</span>
                <span className="ml-2 text-emerald-400 font-bold tabular-nums">{liveMetrics.optimizedCurrent} A</span>
              </div>
              <div>
                <span className="text-neutral-400">Savings:</span>
                <span className="ml-2 text-green-400 font-bold tabular-nums">{liveMetrics.savings}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-50" />
            <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">Current Weight</div>
            <div className="text-2xl font-bold text-blue-600 tabular-nums">{liveMetrics.currentWeight} kg</div>
            <div className="text-xs text-neutral-400 mt-1">Roller Load</div>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-100 rounded-bl-full opacity-50" />
            <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">Motor Speed</div>
            <div className="text-2xl font-bold text-amber-600 tabular-nums">{liveMetrics.currentRPM} RPM</div>
            <div className="text-xs text-neutral-400 mt-1">Variable Speed</div>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-100 rounded-bl-full opacity-50" />
            <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">Energy Savings</div>
            <div className="text-2xl font-bold text-emerald-600 tabular-nums">{liveMetrics.savings}%</div>
            <div className="text-xs text-neutral-400 mt-1">With VFD Control</div>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-100 rounded-bl-full opacity-50" />
            <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">Total Saved</div>
            <div className="text-2xl font-bold text-purple-600 tabular-nums">{totalSavings.totalKWh} kW</div>
            <div className="text-xs text-neutral-400 mt-1">Cumulative</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graph 1: Effect of Roller Weight on Current Consumption */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-800">
                  Effect of Roller Weight on Current
                </h2>
                <p className="text-sm text-neutral-500 mt-0.5">
                  Fixed Speed: 900 RPM • I = 10 + (W/20)
                </p>
              </div>
              {isLive && (
                <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                  LIVE
                </div>
              )}
            </div>
            <div className="p-4 md:p-6">
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart
                  data={weightCurrentData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="theoreticalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="weight" 
                    label={{ value: 'Roller Weight (kg)', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12, fontWeight: 500 } }}
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={{ stroke: '#d1d5db' }}
                  />
                  <YAxis 
                    label={{ value: 'Current (A)', angle: -90, position: 'insideLeft', offset: 10, style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12, fontWeight: 500 } }}
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={{ stroke: '#d1d5db' }}
                    domain={[8, 22]}
                  />
                  <Tooltip content={<CustomTooltip1 />} />
                  <Legend verticalAlign="top" height={36} />
                  <ReferenceLine 
                    x={weightCurrentData[highlightIndex]?.weight} 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    strokeDasharray="5 5" 
                    label={{ value: 'Current', fill: '#f59e0b', fontSize: 10, position: 'top' }} 
                  />
                  <Area
                    type="monotone"
                    dataKey="theoreticalCurrent"
                    name="Theoretical"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    fill="url(#theoreticalGradient)"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="current"
                    name="Measured Current"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#currentGradient)"
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                    activeDot={{ r: 7, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              
              {/* Dynamic Insight */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start gap-3">
                  <span className="text-xl">📊</span>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800">Real-time Analysis</h4>
                    <p className="text-xs text-blue-700 mt-1">
                      At {liveMetrics.currentWeight} kg load, motor draws <strong>{liveMetrics.currentDraw} A</strong>.
                      Theoretical: {(10 + liveMetrics.currentWeight / 20).toFixed(2)} A.
                      Deviation: {Math.abs(liveMetrics.currentDraw - (10 + liveMetrics.currentWeight / 20)).toFixed(2)} A
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Graph 2: Power Savings with Smart Motor Speed Control */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-800">
                  Power Savings with VFD Control
                </h2>
                <p className="text-sm text-neutral-500 mt-0.5">
                  Variable (800-1400 RPM) vs Optimized
                </p>
              </div>
              {isLive && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
                  LIVE
                </div>
              )}
            </div>
            <div className="p-4 md:p-6">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart
                  data={speedOptimizationData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="weight" 
                    label={{ value: 'Roller Weight (kg)', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12, fontWeight: 500 } }}
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={{ stroke: '#d1d5db' }}
                  />
                  <YAxis 
                    label={{ value: 'Current Usage (A)', angle: -90, position: 'insideLeft', offset: 10, style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12, fontWeight: 500 } }}
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={{ stroke: '#d1d5db' }}
                    domain={[10, 22]}
                  />
                  <Tooltip content={<CustomTooltip2 />} />
                  <Legend verticalAlign="top" height={36} />
                  <ReferenceLine 
                    x={speedOptimizationData[highlightIndex]?.weight} 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    strokeDasharray="5 5" 
                  />
                  <Line
                    type="monotone"
                    dataKey="currentVariable"
                    name="Increased Speed"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }}
                    activeDot={{ r: 7, fill: '#dc2626', stroke: '#fff', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="currentOptimized"
                    name="Optimized Speed (VFD)"
                    stroke="#10b981"
                    strokeWidth={3}
                    strokeDasharray="8 4"
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                    activeDot={{ r: 7, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              
              {/* Dynamic Savings Display */}
              <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-800">Energy Optimization</h4>
                    <p className="text-xs text-emerald-700 mt-1">
                      Current savings: <strong className="text-emerald-800">{liveMetrics.savings}%</strong> 
                      ({(liveMetrics.currentDraw - liveMetrics.optimizedCurrent).toFixed(2)} A reduction).
                      VFD control saves up to <strong>{totalSavings.maxSavings}%</strong> at peak loads.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Research Notes */}
        <div className="mt-6 bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-neutral-800 mb-4">📚 Formulas & Methodology</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-neutral-700 mb-2">Graph 1 Formula</h4>
              <div className="bg-blue-50 rounded-lg p-4 font-mono text-xs">
                <p className="text-blue-800">I(A) = 10 + (Weight / 20)</p>
                <p className="text-blue-600 mt-2">Fixed Speed: 900 RPM</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-neutral-700 mb-2">Graph 2 Formulas</h4>
              <div className="bg-emerald-50 rounded-lg p-4 font-mono text-xs space-y-1">
                <p className="text-rose-700">Variable: I = 10 + (W/25) + (S/300)</p>
                <p className="text-emerald-700">Optimized: I = 10 + (W/30)</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-neutral-700 mb-2">Industry Standards</h4>
              <ul className="text-neutral-600 text-xs space-y-1">
                <li>• IEC 60034-30-1: Motor efficiency</li>
                <li>• IS 12615: Energy efficient motors</li>
                <li>• VFD optimization research</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-neutral-400">
          Data updates every 500ms when live mode is enabled • Based on industrial research and IEC motor standards
        </div>
      </div>
    </div>
  );
}
