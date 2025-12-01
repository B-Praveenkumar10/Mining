import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminProvider';
import { 
  Settings, BarChart3, AlertTriangle, Map, LogOut, MessageCircle, Trophy, Users,
  Sun, Wind, Battery, Zap, CheckCircle, XCircle, Clock, TrendingUp, Eye
} from 'lucide-react';
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

  const handleEnergyModeChange = (mode: string) => {
    const modeMap: { [key: string]: string } = {
      'solar': 'Solar Only',
      'wind': 'Wind Only', 
      'solar+wind': 'Solar+Wind',
      'solar+wind+grid': 'All Sources',
      'grid': 'Grid Only'
    };
    setEnergyMode(modeMap[mode] || mode);
  };

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
      {/* Energy Mode Selector */}
      <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">AI Control System</h3>
        <div className="flex flex-wrap gap-3 mb-4">
          {energyModes.map((mode) => (
            <button
              key={mode}
              onClick={() => setEnergyMode(mode)}
              className={`px-4 py-2 rounded-full border transition-all ${
                energyMode === mode
                  ? 'bg-gray-700 text-white border-gray-700'
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
        
        {/* ML Auto Mode */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg border border-gray-300">
          <div>
            <h4 className="font-semibold text-gray-800">AI Auto-Tuning</h4>
            <p className="text-sm text-gray-600">Dynamic parameter adjustment every few seconds</p>
          </div>
          <button
            onClick={() => setMlAutoMode(!mlAutoMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              mlAutoMode ? 'bg-gray-700' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                mlAutoMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>



      {/* System Status */}
      <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">System Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(systemStatus).map(([system, status]) => (
            <div key={system} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-medium text-gray-800">{system}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hardware Sync */}
      <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Hardware Synchronization</h3>
        <div className="space-y-4">
          <button
            onClick={handleHardwareSync}
            disabled={isSyncing}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            {isSyncing ? 'Syncing...' : 'Sync Hardware'}
          </button>
          {isSyncing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{syncProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${syncProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Regional Bar Chart */}
      <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Machine Data Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={regionalData}>
            <XAxis dataKey="region" />
            <YAxis />
            <Bar dataKey="usage" fill="#6b7280" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-100 rounded-xl p-6 shadow-sm border border-gray-300 text-center">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Mill Motor Power</h4>
          <p className="text-3xl font-bold text-gray-700">2.4 MW</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-6 shadow-sm border border-gray-300 text-center">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Crusher Load</h4>
          <p className="text-3xl font-bold text-gray-700">85.2%</p>
          <p className="text-sm text-gray-500">Optimal Range</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-6 shadow-sm border border-gray-300 text-center">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Energy/Ton</h4>
          <p className="text-3xl font-bold text-gray-700">18.5 kWh</p>
          <p className="text-sm text-gray-500">Current</p>
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
      <h3 className="text-lg font-semibold">Equipment Priority Management</h3>
      <div className="space-y-4">
        {priorityRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-semibold text-gray-800">{request.facility}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.priority === 'Critical' ? 'bg-purple-100 text-purple-800' :
                    request.priority === 'High' ? 'bg-red-100 text-red-800' :
                    request.priority === 'Medium' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {request.priority}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{request.reason}</p>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {new Date(request.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-col space-y-2 ml-4">
                {request.status === 'Pending' ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateRequestStatus(request.id, 'Approved')}
                      className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => updateRequestStatus(request.id, 'Rejected')}
                      className="flex items-center space-x-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                ) : (
                  <span className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    request.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {request.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
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
                <span className="font-medium text-gray-800">{region.region}</span>
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-50 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-800">Mining Engineer Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/user-logs')}
                className="p-2 text-gray-600 hover:text-gray-800"
                title="User Logs"
              >
                <Users className="h-5 w-5" />
              </button>
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
        {/* Tab Navigation */}
        <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 mb-6">
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