import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMachine } from '../contexts/MachineProvider';
import { api } from '../services/api';
import { 
  Settings, BarChart3, AlertTriangle, Brain, LogOut, MessageCircle, Users,
  Sun, Wind, Zap, CheckCircle, XCircle, Clock, Eye, Monitor
} from 'lucide-react';
import { Panel } from './ui/Panel';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';


const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('control');
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showMachineStatus] = useState(false);
  const { user } = useAuth();
  const { machines, loading } = useMachine();
  const [energyMode, setEnergyMode] = useState('AI Auto Mode');
  const [mlAutoMode, setMlAutoMode] = useState(true);
  const [systemStatus, setSystemStatus] = useState({
    'Crusher': true,
    'Mill': true,
    'Conveyor': true,
    'AI System': true
  });
  const [priorityRequests, setPriorityRequests] = useState<any[]>([]);
  const [regionalData, setRegionalData] = useState<any[]>([]);
  const [pendingSignups, setPendingSignups] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  
  useEffect(() => {
    if (activeTab === 'advanced') {
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
    const fetchAdminData = async () => {
      try {
        const [overview, alerts, signups] = await Promise.all([
          api.getAnalyticsOverview(),
          api.getAnalyticsAlerts(),
          api.getPendingSignups()
        ]);
        
        if (overview.machines.length > 0) {
          const machineData = overview.machines.map((machine: any) => ({
            region: machine.name,
            usage: Math.round(machine.efficiency),
            trend: machine.efficiency > 80 ? '+5%' : machine.efficiency > 70 ? '+2%' : '-3%'
          }));
          setRegionalData(machineData);
          
          // Update system status based on machine status
          const newSystemStatus = {
            'Crusher': overview.machines.find((m: any) => m.machine_id === 'machine-01')?.status === 'running',
            'Mill': overview.machines.find((m: any) => m.machine_id === 'machine-02')?.status === 'running',
            'Conveyor': overview.machines.find((m: any) => m.machine_id === 'machine-03')?.status === 'running',
            'AI System': overview.summary.running_machines > 0
          };
          setSystemStatus(newSystemStatus);
          
          // Convert alerts to priority requests
          const requests = alerts.alerts.slice(0, 5).map((alert: any, index: number) => ({
            id: alert._id || index,
            facility: `Machine ${alert.machine_id?.split('-')[1] || '1'}`,
            priority: alert.severity === 'critical' ? 'Critical' : 
                     alert.severity === 'high' ? 'High' : 
                     alert.severity === 'medium' ? 'Medium' : 'Low',
            reason: alert.message,
            status: 'Pending',
            timestamp: alert.created_at
          }));
          setPriorityRequests(requests);
        }
        
        if (signups?.signups) {
          setPendingSignups(signups.signups);
        }
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      }
    };
    
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const updateRequestStatus = (id: number, status: string) => {
    setPriorityRequests(prev => 
      prev.map((req: any) => req.id === id ? { ...req, status } : req)
    );
  };

  const energyModes = ['Crusher Only', 'Mill Only', 'Crusher+Mill', 'Full Circuit', 'AI Auto Mode'];

  // removed legacy handler replaced by direct setEnergyMode usage

  const handleHardwareSync = async () => {
    setIsSyncing(true);
    setSyncProgress(0);
    
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSyncing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 1000);
  };

  const renderControl = () => (
    <div className="space-y-6">
      <Panel title="AI Control System" actions={
        <Badge tone={mlAutoMode ? 'success' : 'neutral'} soft>
          {mlAutoMode ? 'Auto-Tuning: On' : 'Auto-Tuning: Off'}
        </Badge>
      }>
        <div className="flex flex-wrap gap-2 mb-5">
          {energyModes.map(mode => (
            <Button
              key={mode}
              size="sm"
              variant={energyMode === mode ? 'primary' : 'outline'}
              onClick={() => setEnergyMode(mode)}
            >
              {mode}
            </Button>
          ))}
          <Button
            size="sm"
            variant={mlAutoMode ? 'secondary' : 'ghost'}
            onClick={() => setMlAutoMode(!mlAutoMode)}
          >
            {mlAutoMode ? 'Disable Auto' : 'Enable Auto'}
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(systemStatus).map(([system, status]) => (
            <div key={system} className="flex items-center gap-2 p-3 rounded-md bg-neutral-50 dark:bg-neutral-800">
              <span className={`h-2.5 w-2.5 rounded-full ${status ? 'bg-success' : 'bg-danger'}`} />
              <span className="text-xs font-medium">{system}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Hardware Synchronization" actions={
        <Button size="sm" onClick={handleHardwareSync} disabled={isSyncing} variant="primary">
          {isSyncing ? 'Syncing...' : 'Sync Hardware'}
        </Button>
      }>
        {isSyncing && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400">
              <span>Progress</span>
              <span>{syncProgress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
              <div
                className="h-full bg-brand-600 dark:bg-brand-500 transition-all duration-1000"
                style={{ width: `${syncProgress}%` }}
              />
            </div>
          </div>
        )}
        {!isSyncing && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Initiate hardware sync to refresh live sensor mapping.</p>
        )}
      </Panel>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Regional Bar Chart */}
      <div className="rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
        <h3 className="text-lg font-semibold mb-4 text-primary">Machine Data Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={regionalData} className="chart-surface">
            <XAxis dataKey="region" tick={{ fill: 'var(--chart-axis)', fontSize: 12 }} axisLine={{ stroke: 'var(--chart-axis)' }} tickLine={{ stroke: 'var(--chart-axis)' }} />
            <YAxis tick={{ fill: 'var(--chart-axis)', fontSize: 12 }} axisLine={{ stroke: 'var(--chart-axis)' }} tickLine={{ stroke: 'var(--chart-axis)' }} />
            <Bar dataKey="usage" fill="var(--chart-bar)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-100 rounded-xl p-6 shadow-sm border border-gray-300 text-center">
          <h4 className="text-sm font-medium text-secondary mb-2">Mill Motor Power</h4>
          <p className="text-3xl font-bold text-primary">2.4 MW</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-6 shadow-sm border border-gray-300 text-center">
          <h4 className="text-sm font-medium text-secondary mb-2">Crusher Load</h4>
          <p className="text-3xl font-bold text-primary">85.2%</p>
          <p className="text-sm text-tertiary">Optimal Range</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-6 shadow-sm border border-gray-300 text-center">
          <h4 className="text-sm font-medium text-secondary mb-2">Energy/Ton</h4>
          <p className="text-3xl font-bold text-primary">18.5 kWh</p>
          <p className="text-sm text-tertiary">Current</p>
        </div>
      </div>



      {/* Usage Trends */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Energy Efficiency Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Crusher</p>
                <p className="text-2xl font-bold text-orange-600">+12%</p>
              </div>
              <Sun className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mill</p>
                <p className="text-2xl font-bold text-blue-600">+8%</p>
              </div>
              <Wind className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Energy</p>
                <p className="text-2xl font-bold text-red-600">-15%</p>
              </div>
              <Zap className="h-8 w-8 text-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleApproveSignup = async (signupId: string) => {
    try {
      await api.approveSignup(signupId);
      setPendingSignups(prev => prev.filter(s => s._id !== signupId));
      alert('Operator approved successfully!');
    } catch (error: any) {
      alert('Failed to approve: ' + error.message);
    }
  };

  const handleRejectSignup = async (signupId: string) => {
    try {
      await api.rejectSignup(signupId);
      setPendingSignups(prev => prev.filter(s => s._id !== signupId));
      alert('Operator signup rejected!');
    } catch (error: any) {
      alert('Failed to reject: ' + error.message);
    }
  };

  const renderPriorityManagement = () => (
    <div className="space-y-6">
      {pendingSignups.length > 0 && (
        <Panel title="Pending Operator Approvals">
          <div className="space-y-4">
            {pendingSignups.map(signup => (
              <div key={signup._id} className="flex items-start justify-between rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold">{signup.username}</h4>
                    <Badge tone="warning" soft>Pending Approval</Badge>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">Employee ID: {signup.emp_id}</p>
                  <div className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(signup.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button size="sm" variant="primary" onClick={() => handleApproveSignup(signup._id)} iconLeft={<CheckCircle className="h-4 w-4" />}>Approve</Button>
                  <Button size="sm" variant="danger" onClick={() => handleRejectSignup(signup._id)} iconLeft={<XCircle className="h-4 w-4" />}>Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
      <Panel title="Equipment Priority Management">
        <div className="space-y-4">
          {priorityRequests.map(request => (
            <div key={request.id} className="flex items-start justify-between rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold">{request.facility}</h4>
                  <Badge tone={
                    request.priority === 'Critical' ? 'accent' :
                    request.priority === 'High' ? 'danger' :
                    request.priority === 'Medium' ? 'warning' : 'success'
                  } soft>
                    {request.priority}
                  </Badge>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">{request.reason}</p>
                <div className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(request.timestamp).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                {request.status === 'Pending' ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="primary" onClick={() => updateRequestStatus(request.id, 'Approved')} iconLeft={<CheckCircle className="h-4 w-4" />}>Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => updateRequestStatus(request.id, 'Rejected')} iconLeft={<XCircle className="h-4 w-4" />}>Reject</Button>
                  </div>
                ) : (
                  <Badge tone={request.status === 'Approved' ? 'success' : 'danger'}>{request.status}</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );

  const renderAdvancedAnalytics = () => {
    if (!analyticsData) return <div className="text-center py-8 text-primary">Loading analytics...</div>;
    if (analyticsData.error) return <div className="text-center py-8 text-red-600">Error loading analytics</div>;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 shadow-lg border border-blue-200 dark:border-blue-700">
            <h3 className="text-lg font-semibold mb-4 text-primary">Power & Efficiency Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.powerEfficiencyTrend.slice(0, 12)} className="chart-surface">
                <XAxis dataKey="timestamp" tick={{ fill: 'var(--chart-axis)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'var(--chart-axis)', fontSize: 12 }} />
                <Bar dataKey="power" fill="#3b82f6" name="Power (kW)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="efficiency" fill="#10b981" name="Efficiency (%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-6 shadow-lg border border-orange-200 dark:border-orange-700">
            <h3 className="text-lg font-semibold mb-4 text-primary">Throughput-Energy Curve</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.throughputEnergyCurve.slice(0, 12)} className="chart-surface">
                <XAxis dataKey="throughput" tick={{ fill: 'var(--chart-axis)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'var(--chart-axis)', fontSize: 12 }} />
                <Bar dataKey="powerPerTon" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 shadow-lg border border-red-200 dark:border-red-700">
          <h3 className="text-lg font-semibold mb-4 text-primary">Crusher Temperature Monitoring</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.temperatureData.slice(0, 20)} className="chart-surface">
              <XAxis dataKey="timestamp" tick={{ fill: 'var(--chart-axis)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'var(--chart-axis)', fontSize: 12 }} />
              <Bar dataKey="temperature" fill="#ef4444" name="Temperature (°C)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded">
            <p className="text-sm text-amber-800 dark:text-amber-200">⚠️ Threshold: 70°C - Monitor temperature to prevent overheating</p>
          </div>
        </div>
      </div>
    );
  };

  const renderMap = () => (
    <div className="space-y-6">
      {/* Interactive Rajasthan Map */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
        <h3 className="text-lg font-semibold mb-4 text-primary">ML Prediction Output</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Next 10-Min Predictions</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Mill Speed:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">18.2 RPM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Crusher RPM:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">285 RPM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Power Draw:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">4.2 MW</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-200 dark:border-green-700">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Equipment Life Predictions</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Liner Life:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">18 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Bearing Life:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">45 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Next Downtime:</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">2.5 hours</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Optimization Recommendations</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Throughput:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">850 t/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Energy Saving:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">12% potential</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency Gain:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">+8.5%</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg border border-yellow-200 dark:border-yellow-700">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Real-time Updates</h4>
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>• Data updates every 3 seconds</p>
                <p>• AI model last trained: 2 hours ago</p>
                <p>• Prediction accuracy: 94.2%</p>
                <p>• Next model update: 15 minutes</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Legend</h4>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-600 dark:text-gray-400">80%+ Efficiency</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full" />
              <span className="text-sm text-gray-600 dark:text-gray-400">70-79% Efficiency</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Below 70%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Region Details */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
        <h3 className="text-lg font-semibold mb-4 text-primary">Prediction Details</h3>
        <div className="space-y-3">
          {regionalData.map((region) => (
            <div key={region.region} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-4 h-4 rounded-full ${
                  region.usage >= 80 ? 'bg-green-500' :
                  region.usage >= 70 ? 'bg-orange-500' : 'bg-red-500'
                }`} />
                <span className="font-medium text-primary">{region.region}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{region.usage}%</span>
                <span className="text-sm text-green-600 dark:text-green-400">{region.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
  <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
      {/* Header */}
  

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {/* Machine Status Side Panel - Toggleable */}
        {showMachineStatus && (
          <div className="w-80 bg-white shadow-lg border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center">
              <Monitor className="h-4 w-4 mr-2" />
              Live Machine Records
            </h3>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-xs text-gray-600 mt-2">Loading...</p>
              </div>
            ) : (
            <div className="space-y-3">
              {machines.map((machine) => (
                <div key={machine.id} className="p-3 bg-gray-50 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{machine.name}</span>
                    <div className={`w-2 h-2 rounded-full ${
                      machine.status === 'running' ? 'bg-green-500' :
                      machine.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                  </div>
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-gray-500">Throughput:</span>
                      <span className="font-medium ml-1">{machine.throughput} t/h</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Power:</span>
                      <span className="font-medium ml-1">{machine.powerDraw} MW</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Efficiency:</span>
                      <span className="font-medium ml-1">{machine.efficiency}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Temperature:</span>
                      <span className="font-medium ml-1">{machine.temperature}°C</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Vibration:</span>
                      <span className="font-medium ml-1">{machine.vibration} mm/s</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Op. Hours:</span>
                      <span className="font-medium ml-1">{machine.operatingHours}h</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Maint:</span>
                      <span className="font-medium ml-1">{machine.lastMaintenance}</span>
                    </div>
                    <div className="pt-1 border-t border-gray-200">
                      <span className="text-gray-500">Status:</span>
                      <span className={`font-medium ml-1 capitalize ${
                        machine.status === 'running' ? 'text-green-600' :
                        machine.status === 'maintenance' ? 'text-yellow-600' : 'text-red-600'
                      }`}>{machine.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1">
        {/* Tab Navigation */}
  <div className="rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 mb-6 bg-gray-50 dark:bg-neutral-800">
          <div className="flex">
            {[
              { id: 'control', label: 'AI Control', icon: Settings },
              { id: 'analytics', label: 'Machine Data', icon: BarChart3 },
              { id: 'priority', label: 'Monitoring & Alerts', icon: AlertTriangle },
              { id: 'map', label: 'ML Predictions', icon: Brain },
              { id: 'advanced', label: 'Analytics', icon: Monitor }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-neutral-600 text-primary bg-neutral-100 dark:bg-neutral-700'
                    : 'border-transparent text-secondary hover:text-primary'
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
          {activeTab === 'control' && renderControl()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'priority' && renderPriorityManagement()}
          {activeTab === 'map' && renderMap()}
          {activeTab === 'advanced' && renderAdvancedAnalytics()}
        </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;