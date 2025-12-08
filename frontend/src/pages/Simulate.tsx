import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/*
  Simulate.tsx – Realistic Crusher Simulation
  Based on real sensor data:
  - Feeder Weight: ~4450-4550 kg
  - Crusher Rotor Speed: ~945-955 RPM
  - Motor Vibration: 3.6-4.9 mm/s
  - Motor Winding Temp: 55-65°C
  - Crusher Status: 1 (running)
*/

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// Sample data points from CSV for realistic simulation
const SAMPLE_DATA = [
  { weight: 4498.21, rpm: 951.35, vibration: 4.1, temp: 60.5 },
  { weight: 4552.05, rpm: 948.91, vibration: 4.8, temp: 64.1 },
  { weight: 4485.67, rpm: 955.02, vibration: 3.7, temp: 56.9 },
  { weight: 4503.11, rpm: 945.78, vibration: 4.5, temp: 62.8 },
  { weight: 4455.99, rpm: 952.12, vibration: 4.0, temp: 58.0 },
  { weight: 4522.40, rpm: 949.66, vibration: 3.9, temp: 61.3 },
  { weight: 4500.88, rpm: 954.20, vibration: 4.9, temp: 57.5 },
  { weight: 4509.33, rpm: 946.85, vibration: 4.3, temp: 63.5 },
  { weight: 4478.10, rpm: 950.15, vibration: 3.6, temp: 55.2 },
  { weight: 4530.77, rpm: 953.44, vibration: 4.6, temp: 61.9 },
];

// Rock shape variants
const SHAPES = [
  'polygon(10% 20%, 40% 10%, 80% 25%, 90% 60%, 55% 85%, 25% 75%)',
  'polygon(15% 35%, 35% 20%, 70% 30%, 85% 55%, 60% 80%, 30% 70%)',
  'polygon(12% 28%, 42% 18%, 78% 32%, 88% 58%, 58% 82%, 28% 72%)',
  'polygon(8% 40%, 30% 18%, 68% 22%, 92% 50%, 62% 86%, 22% 78%)'
];

interface RockData {
  id: number;
  width: number;
  height: number;
  tint: string;
  clipPath: string;
  yOffset: number;
  isBoulder: boolean;
}

interface SensorData {
  feederWeight: number;
  rotorSpeed: number;
  vibration: number;
  windingTemp: number;
  crusherStatus: boolean;
  timestamp: Date;
}

export default function Simulate() {
  const [sensorData, setSensorData] = useState<SensorData>({
    feederWeight: 4500,
    rotorSpeed: 950,
    vibration: 4.0,
    windingTemp: 60,
    crusherStatus: true,
    timestamp: new Date()
  });
  const [autoRandom, setAutoRandom] = useState(true);
  const [rocks, setRocks] = useState<RockData[]>([]);
  const [dataIndex, setDataIndex] = useState(0);
  const rockIdRef = useRef(0);
  const beltRef = useRef<HTMLDivElement>(null);
  const [beltContainerWidth, setBeltContainerWidth] = useState(800);

  // Derived values
  const speedFactor = clamp((sensorData.feederWeight - 4400) / 200, 0, 1);
  const rotorDuration = 60 / sensorData.rotorSpeed; // seconds per rotation
  const beltSpeed = 100 + speedFactor * 200;
  const beltWidth = 600; // Reduced for proper rendering
  const travelDuration = beltWidth / beltSpeed;

  // Spawn a rock - BIGGER and more visible like earlier
  const spawnRock = useCallback((isBoulder = false) => {
    const id = rockIdRef.current++;
    // Much bigger sizes for high visibility
    const baseW = isBoulder ? 50 + Math.random() * 30 : 28 + Math.random() * 20;
    const baseH = isBoulder ? 40 + Math.random() * 22 : 20 + Math.random() * 16;
    
    const colorVariant = Math.random();
    let tint: string;
    if (isBoulder) {
      // Dark gray/black boulders
      const g = 50 + Math.random() * 30;
      tint = `rgb(${g + 10}, ${g}, ${g - 5})`;
    } else if (colorVariant < 0.3) {
      // Iron ore - bright reddish brown
      tint = `rgb(${170 + Math.random() * 50}, ${95 + Math.random() * 40}, ${65 + Math.random() * 30})`;
    } else if (colorVariant < 0.55) {
      // Mixed ore - bright tan/beige
      tint = `rgb(${190 + Math.random() * 50}, ${170 + Math.random() * 40}, ${130 + Math.random() * 35})`;
    } else if (colorVariant < 0.75) {
      // Golden ore
      tint = `rgb(${200 + Math.random() * 45}, ${160 + Math.random() * 40}, ${80 + Math.random() * 30})`;
    } else {
      // Light gray ore
      const g = 160 + Math.random() * 60;
      tint = `rgb(${g + 10}, ${g + 5}, ${g})`;
    }
    
    const clipPath = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const yOffset = (Math.random() - 0.5) * 35;

    const rock: RockData = {
      id, width: baseW, height: baseH, tint, clipPath, yOffset, isBoulder
    };

    setRocks((prev) => [...prev, rock]);
  }, []);

  const removeRock = useCallback((id: number) => {
    setRocks((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Measure belt container width
  useEffect(() => {
    const updateWidth = () => {
      if (beltRef.current) {
        setBeltContainerWidth(beltRef.current.offsetWidth - 80); // Leave margin at end
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Auto-spawn rocks - controlled rate for professional look
  useEffect(() => {
    if (!sensorData.crusherStatus) return;
    const interval = Math.max(150, 300 - speedFactor * 100);
    const id = setInterval(() => {
      // Spawn 1-2 rocks at a time for cleaner look
      const count = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        setTimeout(() => spawnRock(false), i * 80);
      }
      // Occasional boulders
      if (Math.random() < 0.15 + speedFactor * 0.1) {
        setTimeout(() => spawnRock(true), 100 + Math.random() * 100);
      }
    }, interval);
    return () => clearInterval(id);
  }, [speedFactor, spawnRock, sensorData.crusherStatus]);

  // Simulate realistic sensor data changes (like reading from CSV every 500ms)
  useEffect(() => {
    if (!autoRandom) return;
    const id = setInterval(() => {
      // Get base values from sample data, cycling through
      const baseData = SAMPLE_DATA[dataIndex % SAMPLE_DATA.length];
      setDataIndex((i) => i + 1);
      
      // Add realistic jitter/noise to simulate live sensor readings
      const jitter = (base: number, amp: number) => 
        base + (Math.random() - 0.5) * amp + Math.sin(Date.now() * 0.001) * amp * 0.3;
      
      setSensorData({
        feederWeight: jitter(baseData.weight, 30),
        rotorSpeed: jitter(baseData.rpm, 5),
        vibration: jitter(baseData.vibration, 0.4),
        windingTemp: jitter(baseData.temp, 2),
        crusherStatus: true,
        timestamp: new Date()
      });
    }, 500);
    return () => clearInterval(id);
  }, [autoRandom, dataIndex]);

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Temperature color
  const getTempColor = (temp: number) => {
    if (temp > 63) return 'text-red-400';
    if (temp > 58) return 'text-amber-400';
    return 'text-green-400';
  };

  // Vibration color
  const getVibrationColor = (vib: number) => {
    if (vib > 4.5) return 'text-red-400';
    if (vib > 4.0) return 'text-amber-400';
    return 'text-green-400';
  };

  return (
    <div className="min-h-screen w-full bg-white text-neutral-800 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">Crusher Simulation</h1>
            <p className="text-neutral-500 text-sm">Real-time sensor data visualization • {formatTime(sensorData.timestamp)}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${sensorData.crusherStatus ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <span className={`w-2 h-2 rounded-full ${sensorData.crusherStatus ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {sensorData.crusherStatus ? 'RUNNING' : 'STOPPED'}
            </div>
            <Link to="/" className="inline-flex items-center gap-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm border border-blue-700 transition-colors">
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Sensor Data Cards - Top Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4">
            <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">Feeder Weight</div>
            <div className="text-2xl md:text-3xl font-bold text-amber-600 tabular-nums">
              {sensorData.feederWeight.toFixed(2)}
            </div>
            <div className="text-xs text-neutral-500">kg</div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4">
            <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">Rotor Speed</div>
            <div className="text-2xl md:text-3xl font-bold text-blue-600 tabular-nums">
              {sensorData.rotorSpeed.toFixed(2)}
            </div>
            <div className="text-xs text-neutral-500">RPM</div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4">
            <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">Motor Vibration</div>
            <div className={`text-2xl md:text-3xl font-bold tabular-nums ${getVibrationColor(sensorData.vibration)}`}>
              {sensorData.vibration.toFixed(2)}
            </div>
            <div className="text-xs text-neutral-500">mm/s</div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-4">
            <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">Winding Temp</div>
            <div className={`text-2xl md:text-3xl font-bold tabular-nums ${getTempColor(sensorData.windingTemp)}`}>
              {sensorData.windingTemp.toFixed(1)}
            </div>
            <div className="text-xs text-neutral-500">°C</div>
          </div>
        </div>

        {/* Auto toggle */}
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAutoRandom((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors border ${autoRandom ? 'bg-amber-500 border-amber-400' : 'bg-neutral-300 border-neutral-400'}`}
            aria-pressed={autoRandom}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${autoRandom ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className="text-sm text-neutral-600">Live Data Simulation</span>
        </div>

        {/* Simulation Stage */}
        <div className="relative rounded-2xl border border-neutral-300 bg-gradient-to-b from-neutral-100 to-neutral-200 overflow-hidden p-5">
          {/* Belt Assembly */}
          <div ref={beltRef} className="relative h-44 md:h-52 w-full overflow-hidden">
            {/* Belt body */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-20 md:h-24 bg-neutral-700 border-y-2 border-neutral-600 rounded" />

            {/* Animated belt stripes */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-20 md:h-24 overflow-hidden pointer-events-none rounded">
              <motion.div
                animate={{ x: [0, -120] }}
                transition={{ duration: Math.max(0.5, 2.5 - speedFactor * 2), repeat: Infinity, ease: 'linear' }}
                className="flex gap-8 w-[200%]"
              >
                {Array.from({ length: 50 }).map((_, i) => (
                  <div key={i} className="w-3 bg-amber-500/40 skew-x-[-20deg]" style={{ height: '96px' }} />
                ))}
              </motion.div>
            </div>

            {/* Crusher/Rotor assembly */}
            <div className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 flex items-center gap-3 z-20">
              {/* Housing */}
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-neutral-800 border-2 border-neutral-600 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] grid place-items-center">
                {/* Spinning rotor */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: rotorDuration, repeat: Infinity, ease: 'linear' }}
                  className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-neutral-500 to-neutral-700 border-2 border-neutral-400 shadow-lg"
                >
                  {/* Blades */}
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute left-1/2 top-1/2 h-1.5 w-10 md:w-12 -translate-y-1/2 origin-left bg-gradient-to-r from-amber-500 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.7)]"
                      style={{ transform: `rotate(${i * 60}deg)` }}
                    />
                  ))}
                  {/* Center hub */}
                  <div className="absolute inset-4 rounded-full bg-neutral-700 border-2 border-neutral-500 shadow-inner" />
                  {/* RPM indicator */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-amber-300">{Math.round(sensorData.rotorSpeed)}</span>
                  </div>
                </motion.div>
              </div>
              {/* Guard */}
              <div className="w-4 h-20 md:h-24 bg-neutral-700 border border-neutral-600 rounded shadow-md" />
            </div>

            {/* Discharge chute at end */}
            <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 flex items-center z-20">
              <div className="w-3 h-16 md:h-20 bg-neutral-600 border border-neutral-500 rounded-l shadow-md" />
              <div className="w-8 h-24 md:h-28 bg-gradient-to-b from-neutral-700 to-neutral-800 border border-neutral-600 rounded-r-lg shadow-lg flex items-center justify-center">
                <div className="w-5 h-16 md:h-20 bg-neutral-900 rounded border border-neutral-700" />
              </div>
            </div>
            {/* Flowing ore rocks - contained within belt */}
            <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
              {rocks.map((rock) => (
                <motion.div
                  key={rock.id}
                  initial={{ x: 160, opacity: 0 }}
                  animate={{ x: beltContainerWidth, opacity: 1 }}
                  transition={{ 
                    duration: travelDuration * (rock.isBoulder ? 1.2 : 1), 
                    ease: 'linear',
                    opacity: { duration: 0.3 }
                  }}
                  onAnimationComplete={() => removeRock(rock.id)}
                  className="absolute top-1/2"
                  style={{ transform: `translateY(calc(-50% + ${rock.yOffset}px))` }}
                >
                  <motion.div
                    animate={{ 
                      y: [0, -3 - sensorData.vibration * 0.4, 0], 
                      rotate: [-2 - sensorData.vibration * 0.3, 2 + sensorData.vibration * 0.3, -2 - sensorData.vibration * 0.3] 
                    }}
                    transition={{ duration: 0.35, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative"
                    style={{
                      width: rock.width,
                      height: rock.height,
                      background: `linear-gradient(135deg, ${rock.tint}, ${rock.isBoulder ? 'rgb(60,50,40)' : 'rgb(120,100,80)'})`,
                      clipPath: rock.clipPath,
                      border: '2px solid rgba(255,255,255,0.2)',
                      boxShadow: `
                        4px 4px 12px rgba(0,0,0,0.8),
                        inset 3px 3px 6px rgba(255,255,255,0.2),
                        inset -2px -2px 5px rgba(0,0,0,0.4)
                      `,
                      filter: 'brightness(1.15) contrast(1.05)'
                    }}
                  >
                    {/* Bright highlight on ore */}
                    <div 
                      className="absolute inset-0 opacity-50"
                      style={{
                        background: 'radial-gradient(ellipse 60% 40% at 25% 20%, rgba(255,255,255,0.6), transparent 55%)',
                        clipPath: rock.clipPath
                      }}
                    />
                    {/* Bottom shadow */}
                    <div 
                      className="absolute inset-0 opacity-30"
                      style={{
                        background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.5) 100%)',
                        clipPath: rock.clipPath
                      }}
                    />
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Dust/particles based on vibration */}
            <div className="absolute left-12 md:left-16 top-2 w-24 h-20 pointer-events-none z-40">
              {sensorData.vibration > 3.5 && Array.from({ length: Math.ceil(sensorData.vibration * 1.5) }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    opacity: [0, 0.5 * (sensorData.vibration / 5), 0],
                    y: [20, -20 - sensorData.vibration * 4],
                    x: [0, 15 + Math.random() * 20]
                  }}
                  transition={{ duration: 1 + i * 0.12, repeat: Infinity, delay: i * 0.15 }}
                  className="absolute w-2 h-2 rounded-full"
                  style={{ 
                    background: 'radial-gradient(circle, rgba(255,200,120,0.6), transparent 70%)', 
                    filter: 'blur(1px)',
                    left: Math.random() * 20,
                    top: Math.random() * 10
                  }}
                />
              ))}
            </div>

            {/* Belt rollers */}
            <div className="absolute inset-x-0 bottom-1 flex justify-between px-8 md:px-10 opacity-60 z-10">
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ rotate: 360 }}
                  transition={{ duration: Math.max(0.3, 1.5 - speedFactor), repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 rounded-full bg-neutral-600 border border-neutral-500 shadow-sm"
                />
              ))}
            </div>
          </div>

          {/* Bottom Stats Bar */}
          <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div className="rounded-lg border border-neutral-300 bg-white shadow-sm p-3">
              <div className="text-neutral-500 text-xs">Belt Speed</div>
              <div className="text-neutral-800 font-semibold">{beltSpeed.toFixed(0)} mm/s</div>
            </div>
            <div className="rounded-lg border border-neutral-300 bg-white shadow-sm p-3">
              <div className="text-neutral-500 text-xs">Throughput</div>
              <div className="text-neutral-800 font-semibold">{(sensorData.feederWeight * 0.8 / 1000).toFixed(2)} t/h</div>
            </div>
            <div className="rounded-lg border border-neutral-300 bg-white shadow-sm p-3">
              <div className="text-neutral-500 text-xs">Power Draw</div>
              <div className="text-neutral-800 font-semibold">{(sensorData.rotorSpeed * 0.45 + sensorData.windingTemp * 2).toFixed(0)} kW</div>
            </div>
            <div className="rounded-lg border border-neutral-300 bg-white shadow-sm p-3">
              <div className="text-neutral-500 text-xs">Efficiency</div>
              <div className="text-green-600 font-semibold">{(92 + Math.random() * 5).toFixed(1)}%</div>
            </div>
            <div className="rounded-lg border border-neutral-300 bg-white shadow-sm p-3 col-span-2 md:col-span-1">
              <div className="text-neutral-500 text-xs">Cycle Time</div>
              <div className="text-neutral-800 font-semibold">{(rotorDuration * 1000).toFixed(1)} ms/rot</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
