import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { 
  LogOut,
  Sun, Wind, Battery, Zap, Phone
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const UserDashboard: React.FC = () => {
  const [activeTab] = useState('dashboard');
  const { logout } = useAuth();
  // Enable dummy simulation regardless of backend availability
  const [simulateDummy] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    efficiency: 0,
    totalPower: 0,
    totalThroughput: 0,
    operationalStatus: 0,
    runningMachines: 0
  });
  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  // Formatting helpers
  const fmtPct = (n: number, d: number = 1) => `${n.toFixed(d)}%`;
  const fmtKW = (n: number, d: number = 1) => `${n.toFixed(d)} kW`;
  const fmtTH = (n: number, d: number = 1) => `${n.toFixed(d)} t/h`;
  
  useEffect(() => {
    if (activeTab === 'analytics') {
      const fetchAnalytics = async () => {
        try {
          console.log('Fetching analytics data...');
          const data = await api.getAdvancedAnalytics();
          console.log('Analytics data received:', data);
          setAnalyticsData(data);
        } catch (error) {
          console.error('Failed to fetch advanced analytics:', error);
          setAnalyticsData({ error: true });
        }
      };
      fetchAnalytics();
    }
  }, [activeTab]);
  
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        if (!simulateDummy) {
          const [overview, trends] = await Promise.all([
            api.getAnalyticsOverview(),
            api.getAnalyticsTrends(),
          ]);
          setDashboardData({
            efficiency: overview.summary.avg_efficiency,
            totalPower: overview.summary.total_power_kw,
            totalThroughput: overview.summary.total_throughput,
            operationalStatus: overview.summary.operational_status,
            runningMachines: overview.summary.running_machines
          });
          // Combine all machine trends for chart
          const combinedTrends:any[] = [];
          for (let i = 0; i < 24; i++) {
            let totalPower = 0;
            let totalThroughput = 0;
            trends.trends.forEach((machine: any) => {
              if (machine.hourly_data[i]) {
                totalPower += machine.hourly_data[i].power;
                totalThroughput += machine.hourly_data[i].throughput;
              }
            });
            combinedTrends.push({
              hour: i,
              demand: totalThroughput,
              renewable: totalPower * 10
            });
          }
          setTrendsData(combinedTrends);
        } else {
          // Dummy initial data
          setDashboardData({
            efficiency: 87,
            totalPower: 320,
            totalThroughput: 1850,
            operationalStatus: 92,
            runningMachines: 3
          });
          const combinedTrends = Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            demand: 1500 + Math.round(Math.sin(i / 3) * 200) + Math.round(Math.random() * 100),
            renewable: 2000 + Math.round(Math.cos(i / 4) * 150) + Math.round(Math.random() * 80)
          }));
          setTrendsData(combinedTrends);
          setAnalyticsData({
            energySourceData: { solar: 35, wind: 25, thermal: 30, hydro: 10 },
            alertData: { warning: 7, error: 2, info: 14 },
            downtimeData: { planned: 6, unplanned: 3 },
            powerEfficiencyTrend: Array.from({ length: 24 }, (_, i) => ({
              timestamp: i,
              power: 300 + Math.round(Math.sin(i / 2) * 40),
              efficiency: 80 + Math.round(Math.cos(i / 3) * 10)
            })),
            throughputEnergyCurve: Array.from({ length: 24 }, (_, i) => ({
              throughput: 1400 + i * 20,
              powerPerTon: 0.20 + Math.abs(Math.sin(i / 6)) * 0.1
            }))
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [simulateDummy]);

  // Live dummy fluctuations for production-like feel
  useEffect(() => {
    if (!simulateDummy) return;
    const tick = setInterval(() => {
      setDashboardData(prev => ({
        efficiency: Math.max(70, Math.min(98, prev.efficiency + (Math.random() - 0.5) * 1.5)),
        totalPower: Math.max(250, Math.min(450, prev.totalPower + (Math.random() - 0.5) * 10)),
        totalThroughput: Math.max(1300, Math.min(2200, prev.totalThroughput + (Math.random() - 0.5) * 30)),
        operationalStatus: Math.max(60, Math.min(100, prev.operationalStatus + (Math.random() - 0.5) * 1)),
        runningMachines: Math.round(Math.max(2, Math.min(3, 2.8 + (Math.random() - 0.5) * 0.3)))
      }));
      setTrendsData(prev => prev.map(p => ({
        ...p,
        demand: Math.max(1000, Math.min(2500, p.demand + (Math.random() - 0.5) * 40)),
        renewable: Math.max(1500, Math.min(2800, p.renewable + (Math.random() - 0.5) * 30))
      })));
      setAnalyticsData((prev: any) => prev ? {
        ...prev,
        alertData: {
          warning: Math.max(0, prev.alertData.warning + (Math.random() < 0.2 ? 1 : 0)),
          error: Math.max(0, prev.alertData.error + (Math.random() < 0.1 ? 1 : 0)),
          info: Math.max(0, prev.alertData.info + (Math.random() < 0.3 ? 1 : 0)),
        },
      } : prev);
    }, 1000);
    return () => clearInterval(tick);
  }, [simulateDummy]);

  // Removed unused subsidyInfo constant

  const emergencyContacts = [
    { name: 'Control Room', role: 'Operations', phone: '+1 (555) 123-4567' },
    { name: 'Safety Officer', role: 'Emergency', phone: '+1 (555) 987-6543' },
    { name: 'Maintenance Lead', role: 'Technical', phone: '+1 (555) 456-7890' }
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-xl p-5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm">
          <div className="text-xs text-neutral-500">Operational Status</div>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-3xl font-bold text-brand-700 dark:text-brand-300">{fmtPct(dashboardData.operationalStatus)}</div>
            <div className="text-xs text-neutral-500">{dashboardData.runningMachines}/3 running</div>
          </div>
        </div>
        <div className="rounded-xl p-5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm">
          <div className="text-xs text-neutral-500">Average Efficiency</div>
          <div className="mt-2 text-3xl font-bold text-blue-700 dark:text-blue-300">{fmtPct(dashboardData.efficiency)}</div>
        </div>
        <div className="rounded-xl p-5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm">
          <div className="text-xs text-neutral-500">Total Power</div>
          <div className="mt-2 text-3xl font-bold text-orange-700 dark:text-orange-300">{fmtKW(dashboardData.totalPower)}</div>
        </div>
        <div className="rounded-xl p-5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm">
          <div className="text-xs text-neutral-500">Throughput</div>
          <div className="mt-2 text-3xl font-bold text-neutral-800 dark:text-neutral-100">{fmtTH(dashboardData.totalThroughput)}</div>
        </div>
      </div>
      {/* Points Widget */}
      <div className="relative overflow-hidden rounded-xl p-6 bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 shadow-soft">
        <div className="absolute inset-0 pointer-events-none opacity-60 dark:opacity-40 bg-[radial-gradient(circle_at_75%_25%,rgba(56,130,246,0.15),transparent_60%)]" />
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-100 tracking-wide">Plant Status</h3>
            <p className="text-4xl font-bold text-brand-600 dark:text-brand-400">{fmtPct(dashboardData.operationalStatus)}</p>
            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Plant Operational Status: {dashboardData.runningMachines}/3 machines running</p>
          </div>
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" aria-label="Renewable Percentage Gauge">
              <circle cx="48" cy="48" r="36" stroke="rgba(0,0,0,0.08)" className="dark:stroke-[rgba(255,255,255,0.12)]" strokeWidth="6" fill="none" />
              <circle 
                cx="48" cy="48" r="36"
                stroke="url(#statusGradient)" strokeWidth="6" fill="none"
                strokeLinecap="round"
                strokeDasharray={`${dashboardData.operationalStatus * 2.26} 226`}
              />
              <defs>
                <linearGradient id="statusGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/80 dark:bg-neutral-800/70 backdrop-blur shadow-inner ring-1 ring-neutral-200 dark:ring-neutral-700">
                <Sun className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl p-4 shadow-subtle border border-orange-200 bg-orange-50 dark:bg-orange-500/15 h-full">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Crusher Load</p>
              <p className="text-2xl font-bold text-orange-700">{fmtKW(dashboardData.totalPower)}</p>
            </div>
            <Sun className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <div className="rounded-xl p-4 shadow-subtle border border-blue-200 bg-blue-50 dark:bg-blue-500/15 h-full">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Efficiency</p>
              <p className="text-2xl font-bold text-blue-700">{fmtPct(dashboardData.efficiency)}</p>
            </div>
            <Wind className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="rounded-xl p-4 shadow-subtle border border-gray-300 bg-neutral-100 dark:bg-neutral-700 h-full">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Feed Rate</p>
              <p className="text-2xl font-bold text-gray-700">{fmtTH(dashboardData.totalThroughput)}</p>
            </div>
            <Zap className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Battery Gauge */}
      <div className="rounded-xl p-6 shadow-subtle border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Machine Status</h3>
        <div className="flex items-center gap-4">
          <Battery className="h-8 w-8 text-gray-600" />
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <span>Efficiency: {fmtPct(dashboardData.efficiency)}</span>
              <span>Status: {fmtPct(dashboardData.operationalStatus)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gray-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${dashboardData.efficiency}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trends & Downtime */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl p-6 shadow-subtle border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">24h Throughput & Power Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendsData}>
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="demand" name="Throughput (t/h)" stroke="#374151" strokeWidth={2} />
              <Line type="monotone" dataKey="renewable" name="Power (scaled)" stroke="#6b7280" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl p-6 shadow-subtle border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Efficiency Gauge</h3>
          <div className="flex items-center gap-4">
            <Battery className="h-8 w-8 text-gray-600" />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span>Efficiency</span>
                <span className="font-semibold">{fmtPct(dashboardData.efficiency)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-600 h-3 rounded-full transition-all duration-300" style={{ width: `${dashboardData.efficiency}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts & Energy Mix (from analytics when available) */}
      {analyticsData && !analyticsData.error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-semibold mb-4">Energy Source Mix</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[
                    { name: 'Solar', value: analyticsData.energySourceData?.solar ?? 0 },
                    { name: 'Wind', value: analyticsData.energySourceData?.wind ?? 0 },
                    { name: 'Thermal', value: analyticsData.energySourceData?.thermal ?? 0 },
                    { name: 'Hydro', value: analyticsData.energySourceData?.hydro ?? 0 },
                  ]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" label>
                    {['#FDB813', '#00A86B', '#ef4444', '#3b82f6'].map((c, i) => (
                      <Cell key={`cell-${i}`} fill={c} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-semibold mb-4">Alert Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[
                    { type: 'Warning', count: analyticsData.alertData?.warning ?? 0 },
                    { type: 'Error', count: analyticsData.alertData?.error ?? 0 },
                    { type: 'Info', count: analyticsData.alertData?.info ?? 0 },
                  ]} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="count" label>
                    {['#f59e0b', '#ef4444', '#3b82f6'].map((c, i) => (
                      <Cell key={`cell-${i}`} fill={c} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Schedule */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
        <h3 className="text-lg font-semibold mb-4">Upcoming Maintenance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: 'Lubrication Check', due: 'Today', priority: 'High' },
            { title: 'Vibration Analysis', due: 'Tomorrow', priority: 'Medium' },
            { title: 'Wear Inspection', due: 'Dec 12', priority: 'High' },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-lg border bg-gray-50 dark:bg-neutral-700 border-gray-200 dark:border-neutral-600">
              <div className="font-medium">{item.title}</div>
              <div className="text-xs text-neutral-500">Due: {item.due}</div>
              <div className="mt-2 text-xs">
                <span className={`px-2 py-1 rounded bg-${item.priority === 'High' ? 'red' : 'yellow'}-100 text-${item.priority === 'High' ? 'red' : 'yellow'}-700 dark:bg-${item.priority === 'High' ? 'red' : 'yellow'}-900/30 dark:text-${item.priority === 'High' ? 'red' : 'yellow'}-300`}>{item.priority}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Emergency Contacts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex flex-col gap-1 h-full">
              <span className="font-medium">{contact.name}</span>
              <span className="text-xs text-gray-500">{contact.role}</span>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-blue-600 font-mono">{contact.phone}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Monitoring and Analytics tabs removed

  // Analytics rendering removed

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-50 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-800">Operator Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:text-red-600"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        {/* Removed Controls header section as requested */}

        {/* Tab Content */}
        <div>
          {renderDashboard()}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;