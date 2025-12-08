import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMachine } from '../contexts/MachineProvider';
import { api } from '../services/api';
import { 
  Home, Activity, AlertTriangle, User, LogOut, MessageCircle,
  Sun, Wind, Battery, Zap, Phone, Award, Plus, Clock, Eye, Play, Square, Cog
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, Tooltip, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';

const UserDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showMachineControls, setShowMachineControls] = useState(false);
  const { logout, user } = useAuth();
  const { machines, loading, startMachine, stopMachine } = useMachine();
  const [dashboardData, setDashboardData] = useState({
    efficiency: 0,
    totalPower: 0,
    totalThroughput: 0,
    operationalStatus: 0,
    runningMachines: 0
  });
  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [breakdownData, setBreakdownData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
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
        const [overview, trends, breakdown, alertsData] = await Promise.all([
          api.getAnalyticsOverview(),
          api.getAnalyticsTrends(),
          api.getAnalyticsBreakdown(),
          api.getAnalyticsAlerts()
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
        
        setBreakdownData(breakdown.breakdown);
        setAlerts(alertsData.alerts.map((alert: any) => alert.message));
        
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };
    
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);
  const navigate = useNavigate();



  const subsidyInfo = [
    { type: 'AI Process Control', amount: '₹2,50,000 per circuit', subsidy: '35% energy savings' },
    { type: 'Predictive Maintenance', amount: '₹1,50,000 per system', subsidy: '40% downtime reduction' },
    { type: 'Digital Twin Analytics', amount: '₹3,00,000 per plant', subsidy: '25% efficiency gain' }
  ];

  const emergencyContacts = [
    { name: 'Mining Control Room', number: '1800-MINE-001' },
    { name: 'Equipment Support', number: '1800-EQUIP-24' },
    { name: 'Safety Emergency', number: '1800-SAFE-911' }
  ];

  const [priorityRequests, setPriorityRequests] = useState([
    { id: 1, facility: 'Crusher Unit 1', priority: 'High', reason: 'Maintenance required', status: 'Pending' },
    { id: 2, facility: 'Ball Mill 2', priority: 'Medium', reason: 'Efficiency optimization', status: 'Approved' }
  ]);

  const addPriorityRequest = (facility: string, priority: string, reason: string) => {
    const newRequest = {
      id: Date.now(),
      facility,
      priority,
      reason,
      status: 'Pending'
    };
    setPriorityRequests([newRequest, ...priorityRequests]);
    setShowRequestDialog(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div className="rounded-xl p-4 shadow-subtle border border-orange-200 bg-orange-50 dark:bg-orange-500/15">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Crusher Load</p>
              <p className="text-2xl font-bold text-orange-700">{dashboardData.totalPower.toFixed(1)} kW</p>
            </div>
            <Sun className="h-8 w-8 text-orange-600" />
          </div>
        </div>
  <div className="rounded-xl p-4 shadow-subtle border border-blue-200 bg-blue-50 dark:bg-blue-500/15">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Efficiency</p>
              <p className="text-2xl font-bold text-blue-700">{dashboardData.efficiency}%</p>
            </div>
            <Wind className="h-8 w-8 text-blue-600" />
          </div>
        </div>
  <div className="rounded-xl p-4 shadow-subtle border border-gray-300 bg-neutral-100 dark:bg-neutral-700">
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
        <div className="flex items-center space-x-4">
          <Battery className="h-8 w-8 text-gray-600" />
          <div className="flex-1">
            <div className="flex justify-between mb-2">
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
        <div className="space-y-3">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">{contact.name}</span>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-blue-600 font-mono">{contact.number}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsage = () => (
    <div className="space-y-6">
      {/* Usage Statistics */}
      <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Operator Performance Metrics</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">Energy Efficiency</span>
              <span className="font-bold text-gray-800">{dashboardData.efficiency}%</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-gray-600 to-gray-800 h-4 rounded-full transition-all duration-300"
                style={{ width: `${dashboardData.efficiency}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Utilization Breakdown */}
      <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-neutral-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Equipment Utilization Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={breakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {breakdownData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {machines.map((machine, index) => (
              <div key={machine.id} className="p-3 bg-white dark:bg-neutral-700 rounded-lg border border-gray-200 dark:border-neutral-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: breakdownData[index]?.color || '#gray' }} />
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{machine.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    machine.status === 'running' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    machine.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {machine.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Utilization:</span>
                    <span className="font-bold ml-1 text-gray-800 dark:text-gray-200">{breakdownData[index]?.value.toFixed(1) || 0}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Efficiency:</span>
                    <span className="font-bold ml-1 text-gray-800 dark:text-gray-200">{machine.efficiency}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Throughput:</span>
                    <span className="font-bold ml-1 text-gray-800 dark:text-gray-200">{machine.throughput} t/h</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Power:</span>
                    <span className="font-bold ml-1 text-gray-800 dark:text-gray-200">{machine.powerDraw} MW</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PM Subsidy Information */}
      <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Mining Optimization Programs</h3>
        <div className="space-y-4">
          {subsidyInfo.map((subsidy, index) => (
            <div key={index} className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-800">{subsidy.type}</h4>
                  <p className="text-green-600 font-medium">{subsidy.amount}</p>
                </div>
                <div className="text-right">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {subsidy.subsidy}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPriority = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Equipment Priority Requests</h3>
        <button
          onClick={() => setShowRequestDialog(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" />
          <span>Add Request</span>
        </button>
      </div>

      <div className="space-y-4">
        {priorityRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{request.facility}</h4>
                <p className="text-gray-600 text-sm mt-1">{request.reason}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
                  {request.priority}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {request.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Request Dialog */}
      {showRequestDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Priority Request</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              addPriorityRequest(
                formData.get('facility') as string,
                formData.get('priority') as string,
                formData.get('reason') as string
              );
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facility</label>
                  <select name="facility" className="w-full p-3 border border-gray-200 rounded-lg" required>
                    <option value="">Select Facility</option>
                    <option value="Crusher Unit">Crusher Unit</option>
                    <option value="Ball Mill">Ball Mill</option>
                    <option value="SAG Mill">SAG Mill</option>
                    <option value="Conveyor System">Conveyor System</option>
                    <option value="Screening Plant">Screening Plant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                  <select name="priority" className="w-full p-3 border border-gray-200 rounded-lg" required>
                    <option value="">Select Priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <textarea 
                    name="reason" 
                    className="w-full p-3 border border-gray-200 rounded-lg" 
                    rows={3}
                    placeholder="Explain the reason for this request"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRequestDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => {
    if (!analyticsData) return <div className="text-center py-8 text-gray-800 dark:text-gray-200">Loading analytics...</div>;
    if (analyticsData.error) return <div className="text-center py-8 text-red-600">Error loading analytics</div>;

    const energySourceData = [
      { name: 'Thermal', value: analyticsData.energySourceData.thermal },
      { name: 'Solar', value: analyticsData.energySourceData.solar }
    ];

    const alertData = Object.entries(analyticsData.alertCounts).map(([key, value]) => ({
      type: key,
      count: value
    }));

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
                  {energySourceData.map((entry, index) => (
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
                  {alertData.map((entry, index) => (
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

  const renderProfile = () => (
    <div className="space-y-6">
      {/* User Avatar */}
      <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold text-white">
            {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'OP'}
          </span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800">{user?.name || 'Operator'}</h3>
        <p className="text-gray-600">{user?.campus || 'Mining Plant'}</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
          <p className="text-2xl font-bold text-green-600">{dashboardData.efficiency}</p>
          <p className="text-gray-600 text-sm">Points</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
          <p className="text-2xl font-bold text-blue-600">#1</p>
          <p className="text-gray-600 text-sm">Rank</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
          <p className="text-2xl font-bold text-orange-600">{dashboardData.efficiency}%</p>
          <p className="text-gray-600 text-sm">Usage</p>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Achievement Badges</h3>
        <div className="grid grid-cols-2 gap-4">
          {['Efficiency Expert', 'Safety Champion', 'Process Optimizer', 'Team Leader'].map((badge: string, index: number) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <Award className="h-6 w-6 text-yellow-600" />
              <span className="font-medium text-gray-800">{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-50 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-800">Operator Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/chatbot')}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/digital-twin')}
                className="p-2 text-gray-600 hover:text-gray-800"
                title="Digital Twin"
              >
                <Eye className="h-5 w-5" />
              </button>
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
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {alerts.map((alert, index) => (
              <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-yellow-800">{alert}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex">
            {[
              { id: 'dashboard', label: 'Controls', icon: Home },
              { id: 'usage', label: 'Monitoring', icon: Activity },
              { id: 'priority', label: 'Alerts', icon: AlertTriangle },
              { id: 'profile', label: 'Profile', icon: User },
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
          {activeTab === 'priority' && renderPriority()}
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'analytics' && renderAnalytics()}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;