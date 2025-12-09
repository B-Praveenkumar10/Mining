import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Activity, 
  Zap, 
  Gauge, 
  Thermometer, 
  Droplets, 
  Wind, 
  AlertTriangle, 
  CheckCircle2,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

// Types
interface SimulationStats {
  rpm: number;
  current: number;
  power: number;
  throughput: number;
  temp: number;
  vibration: number;
  chamberFill: number;
  moisture: number;
  humidity: number;
  wearScore: number;
  efficiency: number;
  status: 'Optimal' | 'Warning' | 'Critical';
}

const CrusherSimulation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    cone: THREE.Mesh;
    oreParticles: THREE.Mesh[];
    dustSystem: THREE.Points;
  } | null>(null);

  // Simulation State
  const [isRunning, setIsRunning] = useState(true);
  const [stats, setStats] = useState<SimulationStats>({
    rpm: 250,
    current: 145,
    power: 320,
    throughput: 1850,
    temp: 72,
    vibration: 2.8,
    chamberFill: 68,
    moisture: 4.2,
    humidity: 38,
    wearScore: 82,
    efficiency: 94,
    status: 'Optimal'
  });

  // Historical data for charts
  const [powerHistory, setPowerHistory] = useState<{ time: string; value: number }[]>([]);

  // Refs for animation loop to access latest state without re-renders
  const statsRef = useRef(stats);
  const isRunningRef = useRef(isRunning);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  // Initialize 3D Scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Slate-900
    scene.fog = new THREE.FogExp2(0x0f172a, 0.02);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(8, 6, 8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent going below ground

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404060, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.bias = -0.0001;
    scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 0.8, 20);
    blueLight.position.set(-5, 5, -5);
    scene.add(blueLight);

    const orangeLight = new THREE.PointLight(0xf97316, 0.6, 20);
    orangeLight.position.set(5, 2, 5);
    scene.add(orangeLight);

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid
    const gridHelper = new THREE.GridHelper(40, 40, 0x334155, 0x1e293b);
    gridHelper.position.y = -1.99;
    scene.add(gridHelper);

    // Crusher Group
    const crusherGroup = new THREE.Group();
    scene.add(crusherGroup);

    // Shell (Outer)
    const shellGeometry = new THREE.CylinderGeometry(3.5, 2.5, 5, 32, 1, true);
    const shellMaterial = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.6,
      roughness: 0.4,
      side: THREE.DoubleSide
    });
    const shell = new THREE.Mesh(shellGeometry, shellMaterial);
    shell.position.y = 1.5;
    shell.castShadow = true;
    shell.receiveShadow = true;
    crusherGroup.add(shell);

    // Top Rim
    const rimGeometry = new THREE.TorusGeometry(3.5, 0.2, 16, 64);
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Safety yellow/orange
      metalness: 0.7,
      roughness: 0.3
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 4;
    crusherGroup.add(rim);

    // Mantle (Inner Cone)
    const coneGeometry = new THREE.ConeGeometry(1.8, 4.5, 64);
    const coneMaterial = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Rusted metal
      metalness: 0.5,
      roughness: 0.7,
    });
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.position.y = 1.5;
    cone.castShadow = true;
    cone.receiveShadow = true;
    crusherGroup.add(cone);

    // Base Structure
    const baseGeometry = new THREE.BoxGeometry(6, 1, 6);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.4,
      roughness: 0.6
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -1.5;
    base.receiveShadow = true;
    crusherGroup.add(base);

    // Ore Particles
    const oreParticles: THREE.Mesh[] = [];
    const oreColors = [0x5d4037, 0x795548, 0x8d6e63, 0x4e342e];
    const oreGeometry = new THREE.DodecahedronGeometry(0.2); // Reused geometry

    for (let i = 0; i < 100; i++) {
      const oreMaterial = new THREE.MeshStandardMaterial({
        color: oreColors[Math.floor(Math.random() * oreColors.length)],
        roughness: 0.9,
        metalness: 0.1
      });
      const ore = new THREE.Mesh(oreGeometry, oreMaterial);
      
      // Initial random position
      resetOrePosition(ore);
      
      ore.castShadow = true;
      ore.receiveShadow = true;
      scene.add(ore);
      oreParticles.push(ore);
    }

    // Dust System
    const dustGeometry = new THREE.BufferGeometry();
    const dustCount = 1000;
    const dustPositions = new Float32Array(dustCount * 3);
    
    for(let i = 0; i < dustCount * 3; i++) {
      dustPositions[i] = (Math.random() - 0.5) * 8;
    }
    
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    
    const dustMaterial = new THREE.PointsMaterial({
      color: 0xa8a29e,
      size: 0.05,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true
    });
    
    const dustSystem = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustSystem);

    sceneRef.current = { scene, camera, renderer, controls, cone, oreParticles, dustSystem };

    // Animation Loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      if (sceneRef.current) {
        const { controls, cone, oreParticles, dustSystem } = sceneRef.current;
        controls.update();

        if (isRunningRef.current) {
          const time = Date.now() * 0.001;
          const rpm = statsRef.current.rpm;
          const speedMultiplier = rpm / 250; // Normalize speed

          // Gyratory motion
          cone.position.x = Math.sin(time * 5 * speedMultiplier) * 0.15;
          cone.position.z = Math.cos(time * 5 * speedMultiplier) * 0.15;
          cone.rotation.y -= 0.05 * speedMultiplier;

          // Ore Physics Simulation
          oreParticles.forEach((ore) => {
            ore.position.y -= 0.05 * speedMultiplier;
            ore.rotation.x += 0.02;
            ore.rotation.z += 0.02;

            // Spiral inward
            const angle = Math.atan2(ore.position.z, ore.position.x);
            const radius = Math.sqrt(ore.position.x**2 + ore.position.z**2);
            
            if (radius > 1.5 && ore.position.y < 4) {
              ore.position.x -= Math.cos(angle) * 0.01;
              ore.position.z -= Math.sin(angle) * 0.01;
            }

            // Reset if falls through
            if (ore.position.y < -1) {
              resetOrePosition(ore);
            }
          });

          // Dust Animation
          const positions = dustSystem.geometry.attributes.position.array as Float32Array;
          for(let i = 1; i < positions.length; i+=3) {
            positions[i] += 0.01; // Rise up
            if (positions[i] > 5) positions[i] = -2;
          }
          dustSystem.geometry.attributes.position.needsUpdate = true;
          dustSystem.rotation.y += 0.001;
        }

        renderer.render(scene, camera);
      }
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (containerRef.current && sceneRef.current) {
        const { camera, renderer } = sceneRef.current;
        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && sceneRef.current) {
        containerRef.current.removeChild(sceneRef.current.renderer.domElement);
        sceneRef.current.renderer.dispose();
      }
    };
  }, []);

  // Data Simulation Interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRunning) return;

      setStats(prev => {
        const newPower = Math.max(200, Math.min(450, prev.power + (Math.random() - 0.5) * 20));
        
        // Update history
        setPowerHistory(h => {
          const newHistory = [...h, { time: new Date().toLocaleTimeString(), value: newPower }];
          if (newHistory.length > 20) newHistory.shift();
          return newHistory;
        });

        return {
          ...prev,
          rpm: Math.max(200, Math.min(300, prev.rpm + (Math.random() - 0.5) * 5)),
          current: Math.max(100, Math.min(200, prev.current + (Math.random() - 0.5) * 2)),
          power: newPower,
          throughput: Math.max(1500, Math.min(2200, prev.throughput + (Math.random() - 0.5) * 50)),
          temp: Math.max(60, Math.min(95, prev.temp + (Math.random() - 0.5) * 1)),
          vibration: Math.max(1, Math.min(5, prev.vibration + (Math.random() - 0.5) * 0.2)),
          chamberFill: Math.max(40, Math.min(90, prev.chamberFill + (Math.random() - 0.5) * 2)),
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  function resetOrePosition(ore: THREE.Mesh) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 2 + Math.random();
    ore.position.set(
      Math.cos(angle) * radius,
      5 + Math.random() * 3,
      Math.sin(angle) * radius
    );
    (ore.userData as any).velocity = new THREE.Vector3(0, -0.05 - Math.random() * 0.05, 0);
  }

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden font-sans text-slate-100">
      {/* 3D Viewport */}
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Overlay UI */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col p-6">
        
        {/* Header */}
        <header className="flex justify-between items-start pointer-events-auto">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <Activity className="text-blue-500" />
              Gyratory Crusher Digital Twin
            </h1>
            <p className="text-slate-400 text-sm mt-1">Real-time physics simulation & telemetry</p>
          </div>
          
          <div className="flex gap-3">
            <Badge tone={stats.status === 'Optimal' ? 'success' : 'warning'} className="text-sm px-3 py-1">
              {stats.status.toUpperCase()}
            </Badge>
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg border border-slate-700 transition-colors"
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button 
              className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg border border-slate-700 transition-colors"
              onClick={() => {
                setStats(s => ({ ...s, rpm: 250, power: 320, temp: 72 }));
              }}
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-12 gap-6 mt-6 pointer-events-none">
          
          {/* Left Sidebar - Key Metrics */}
          <div className="col-span-3 space-y-4 pointer-events-auto">
            <Card className="bg-slate-900/80 backdrop-blur-md border-slate-800">
              <div className="space-y-6">
                <MetricRow 
                  icon={<Gauge size={18} className="text-emerald-400" />}
                  label="Rotation Speed"
                  value={stats.rpm.toFixed(0)}
                  unit="RPM"
                  trend="+1.2%"
                />
                <MetricRow 
                  icon={<Zap size={18} className="text-yellow-400" />}
                  label="Power Draw"
                  value={stats.power.toFixed(0)}
                  unit="kW"
                  trend="-0.5%"
                />
                <MetricRow 
                  icon={<Activity size={18} className="text-blue-400" />}
                  label="Throughput"
                  value={stats.throughput.toFixed(0)}
                  unit="t/h"
                />
                <MetricRow 
                  icon={<Thermometer size={18} className="text-orange-400" />}
                  label="Oil Temp"
                  value={stats.temp.toFixed(1)}
                  unit="°C"
                  warning={stats.temp > 90}
                />
              </div>
            </Card>

            <Card className="bg-slate-900/80 backdrop-blur-md border-slate-800 p-4">
              <h3 className="text-sm font-semibold text-slate-400 mb-4">Power Consumption Trend</h3>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={powerHistory}>
                    <defs>
                      <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorPower)" 
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Center - Spacer for 3D View */}
          <div className="col-span-6"></div>

          {/* Right Sidebar - Detailed Stats */}
          <div className="col-span-3 space-y-4 pointer-events-auto">
            <Card className="bg-slate-900/80 backdrop-blur-md border-slate-800">
              <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                <Settings size={16} /> Operational Status
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Chamber Fill Level</span>
                    <span className="text-white font-mono">{stats.chamberFill.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        stats.chamberFill > 85 ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${stats.chamberFill}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Liner Wear</span>
                    <span className="text-white font-mono">{stats.wearScore}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${stats.wearScore}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-800/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                      <Droplets size={14} /> Moisture
                    </div>
                    <div className="text-lg font-semibold text-white">{stats.moisture.toFixed(1)}%</div>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                      <Wind size={14} /> Vibration
                    </div>
                    <div className="text-lg font-semibold text-white">{stats.vibration.toFixed(1)}</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900/80 backdrop-blur-md border-slate-800 p-4">
              <h3 className="text-sm font-semibold text-slate-400 mb-3">System Alerts</h3>
              <div className="space-y-2">
                <AlertItem type="success" message="Hydraulic pressure nominal" />
                <AlertItem type="info" message="Auto-lubrication cycle active" />
                {stats.temp > 85 && (
                  <AlertItem type="warning" message="High oil temperature detected" />
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const MetricRow = ({ icon, label, value, unit, trend, warning }: any) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${warning ? 'bg-red-500/20' : 'bg-slate-800'}`}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-slate-400">{label}</div>
        <div className={`text-lg font-bold font-mono ${warning ? 'text-red-400' : 'text-white'}`}>
          {value} <span className="text-sm text-slate-500 font-normal">{unit}</span>
        </div>
      </div>
    </div>
    {trend && (
      <div className={`text-xs ${trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
        {trend}
      </div>
    )}
  </div>
);

const AlertItem = ({ type, message }: { type: 'success' | 'warning' | 'info', message: string }) => {
  const colors = {
    success: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    warning: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    info: 'text-blue-400 bg-blue-400/10 border-blue-400/20'
  };
  
  const icons = {
    success: <CheckCircle2 size={14} />,
    warning: <AlertTriangle size={14} />,
    info: <Activity size={14} />
  };

  return (
    <div className={`flex items-center gap-2 p-2 rounded border text-xs ${colors[type]}`}>
      {icons[type]}
      <span>{message}</span>
    </div>
  );
};

export default CrusherSimulation;
