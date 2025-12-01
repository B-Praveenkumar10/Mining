import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminProvider';
import { 
  Settings, BarChart3, AlertTriangle, Map, LogOut, MessageCircle, Users,
  Sun, Wind, Zap, CheckCircle, XCircle, Clock, TrendingUp, Eye
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
  const { logout } = useAuth();
  const { 
    energyMode, setEnergyMode, mlAutoMode, setMlAutoMode, 
    systemStatus, priorityRequests, regionalData, updateRequestStatus 
  } = useAdmin();
  const navigate = useNavigate();

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

      {/* Regional Leaderboard */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Circuit Performance Ranking</h3>
        <div className="space-y-3">
          {regionalData
            .sort((a, b) => b.usage - a.usage)
            .map((region, index) => (
              <div key={region.region} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-800">{region.region}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-bold text-blue-600">{region.usage}%</span>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">{region.trend}</span>
                  </div>
                </div>
              </div>
            ))}
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

  const renderPriorityManagement = () => (
    <div className="space-y-6">
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

  const renderMap = () => (
    <div className="space-y-6">
      {/* Interactive Rajasthan Map */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">ML Prediction Output</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-gray-800 mb-2">Next 10-Min Predictions</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Mill Speed:</span>
                  <span className="font-bold text-blue-600">18.2 RPM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Crusher RPM:</span>
                  <span className="font-bold text-blue-600">285 RPM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Power Draw:</span>
                  <span className="font-bold text-blue-600">4.2 MW</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-gray-800 mb-2">Equipment Life Predictions</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Liner Life:</span>
                  <span className="font-bold text-green-600">18 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bearing Life:</span>
                  <span className="font-bold text-green-600">45 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Next Downtime:</span>
                  <span className="font-bold text-orange-600">2.5 hours</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-gray-800 mb-2">Optimization Recommendations</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Throughput:</span>
                  <span className="font-bold text-purple-600">850 t/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Energy Saving:</span>
                  <span className="font-bold text-purple-600">12% potential</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Efficiency Gain:</span>
                  <span className="font-bold text-purple-600">+8.5%</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-gray-800 mb-2">Real-time Updates</h4>
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Data updates every 3 seconds</p>
                <p>• AI model last trained: 2 hours ago</p>
                <p>• Prediction accuracy: 94.2%</p>
                <p>• Next model update: 15 minutes</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Legend</h4>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-600">80%+ Efficiency</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full" />
              <span className="text-sm text-gray-600">70-79% Efficiency</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full" />
              <span className="text-sm text-gray-600">Below 70%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Region Details */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Prediction Details</h3>
        <div className="space-y-3">
          {regionalData.map((region) => (
            <div key={region.region} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-4 h-4 rounded-full ${
                  region.usage >= 80 ? 'bg-green-500' :
                  region.usage >= 70 ? 'bg-orange-500' : 'bg-red-500'
                }`} />
                <span className="font-medium text-primary">{region.region}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-lg font-bold text-blue-600">{region.usage}%</span>
                <span className="text-sm text-green-600">{region.trend}</span>
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
  <div className="bg-neutral-50 dark:bg-neutral-800 shadow-sm border-b border-gray-200 dark:border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-primary">Mining Engineer Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/user-logs')}
                className="p-2 text-secondary hover:text-primary"
                title="User Logs"
              >
                <Users className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/chatbot')}
                className="p-2 text-secondary hover:text-primary"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/digital-twin')}
                className="p-2 text-secondary hover:text-primary"
                title="Digital Twin"
              >
                <Eye className="h-5 w-5" />
              </button>
              <button
                onClick={logout}
                className="p-2 text-secondary hover:text-danger"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
  <div className="rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 mb-6 bg-gray-50 dark:bg-neutral-800">
          <div className="flex">
            {[
              { id: 'control', label: 'AI Control', icon: Settings },
              { id: 'analytics', label: 'Machine Data', icon: BarChart3 },
              { id: 'priority', label: 'Monitoring & Alerts', icon: AlertTriangle },
              { id: 'map', label: 'ML Predictions', icon: Map }
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;