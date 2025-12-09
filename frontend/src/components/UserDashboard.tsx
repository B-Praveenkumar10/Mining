import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { 
  Home, Activity, LogOut,
  Sun, Wind, Battery, Zap, Phone
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, Tooltip, Legend } from 'recharts';

const UserDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { logout } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    efficiency: 0,
    totalPower: 0,
    totalThroughput: 0,
    operationalStatus: 0,
    runningMachines: 0
  });
  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  
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
        const combinedTrends = [];
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
            renewable: totalPower * 10 // Scale for visibility
          });
        }
        setTrendsData(combinedTrends);
        
        
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };
    
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Removed unused subsidyInfo constant

  const emergencyContacts = [
    { name: 'Control Room', role: 'Operations', phone: '+1 (555) 123-4567' },
    { name: 'Safety Officer', role: 'Emergency', phone: '+1 (555) 987-6543' },
    { name: 'Maintenance Lead', role: 'Technical', phone: '+1 (555) 456-7890' }
  ];

  const renderDashboard = () => (
  <div className="space-y-6">
      {/* Points Widget */}
      <div className="relative overflow-hidden rounded-xl p-6 bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 shadow-soft">
        <div className="absolute inset-0 pointer-events-none opacity-60 dark:opacity-40 bg-[radial-gradient(circle_at_75%_25%,rgba(56,130,246,0.15),transparent_60%)]" />
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-100 tracking-wide">Plant Status</h3>
            <p className="text-4xl font-bold text-brand-600 dark:text-brand-400">{dashboardData.operationalStatus}%</p>
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
              <p className="text-2xl font-bold text-orange-700">{dashboardData.totalPower.toFixed(1)} kW</p>
            </div>
            <Sun className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <div className="rounded-xl p-4 shadow-subtle border border-blue-200 bg-blue-50 dark:bg-blue-500/15 h-full">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Efficiency</p>
              <p className="text-2xl font-bold text-blue-700">{dashboardData.efficiency}%</p>
            </div>
            <Wind className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="rounded-xl p-4 shadow-subtle border border-gray-300 bg-neutral-100 dark:bg-neutral-700 h-full">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Feed Rate</p>
              <p className="text-2xl font-bold text-gray-700">{dashboardData.totalThroughput.toFixed(1)} t/h</p>
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
              <span>Efficiency: {dashboardData.efficiency}%</span>
              <span>Status: {dashboardData.operationalStatus}%</span>
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

      {/* 24h Demand Graph */}
      <div className="rounded-xl p-6 shadow-subtle border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Throughput Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendsData}>
            <XAxis dataKey="hour" />
            <YAxis />
            <Line type="monotone" dataKey="demand" stroke="#374151" strokeWidth={2} />
            <Line type="monotone" dataKey="renewable" stroke="#6b7280" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
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

  const renderUsage = () => (
    <div className="space-y-6">
      {/* Energy Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Energy Source Mix</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Solar', value: 45 },
                    { name: 'Wind', value: 30 },
                    { name: 'Grid', value: 25 }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[
                    { name: 'Solar', value: 45 },
                    { name: 'Wind', value: 30 },
                    { name: 'Grid', value: 25 }
                  ].map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#FDB813', '#00A86B', '#808080'][index % 3]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => {
    if (!analyticsData) return <div className="text-center py-8 text-gray-800 dark:text-gray-200">Loading analytics...</div>;
    if (analyticsData.error) return <div className="text-center py-8 text-red-600">Error loading analytics</div>;

    const energySourceData = [
      { name: 'Thermal', value: analyticsData.energySourceData.thermal },
      { name: 'Solar', value: analyticsData.energySourceData.solar },
      { name: 'Wind', value: analyticsData.energySourceData.wind },
      { name: 'Hydro', value: analyticsData.energySourceData.hydro }
    ];

    const alertData = [
      { type: 'Warning', count: analyticsData.alertData.warning },
      { type: 'Error', count: analyticsData.alertData.error },
      { type: 'Info', count: analyticsData.alertData.info }
    ];

    const downtimeData = [
      { type: 'Planned', hours: analyticsData.downtimeData.planned },
      { type: 'Unplanned', hours: analyticsData.downtimeData.unplanned }
    ];

    const COLORS = ['#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6'];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-6 shadow-lg border border-orange-200 dark:border-orange-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Energy Source Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={energySourceData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  {energySourceData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 shadow-lg border border-red-200 dark:border-red-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Alert Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={alertData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="count" label>
                  {alertData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 shadow-lg border border-blue-200 dark:border-blue-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Downtime Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={downtimeData}>
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 shadow-lg border border-green-200 dark:border-green-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Power & Efficiency Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analyticsData.powerEfficiencyTrend.slice(0, 12)}>
                <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="power" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="efficiency" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 shadow-lg border border-purple-200 dark:border-purple-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Energy Efficiency Curve</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analyticsData.throughputEnergyCurve.slice(0, 12)}>
                <XAxis dataKey="throughput" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="powerPerTon" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

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
        <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex">
            {[
              { id: 'dashboard', label: 'Controls', icon: Home },
              { id: 'usage', label: 'Monitoring', icon: Activity },
              { id: 'analytics', label: 'Analytics', icon: Activity }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-gray-600 text-gray-700 bg-gray-100'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'usage' && renderUsage()}
          {activeTab === 'analytics' && renderAnalytics()}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;