import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEnergy } from '../contexts/EnergyProvider';
import { useUser } from '../contexts/UserProvider';
import { 
  Home, Activity, AlertTriangle, User, LogOut, MessageCircle, Trophy, Map,
  Sun, Wind, Battery, Zap, Phone, Award, Plus, Clock, Eye
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

const UserDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const { logout } = useAuth();
  const { energyData, renewablePercentage, alerts } = useEnergy();
  const { userData } = useUser();
  const navigate = useNavigate();

  const demandData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    demand: 20 + Math.sin(i * 0.3) * 10 + Math.random() * 5,
    renewable: 15 + Math.sin(i * 0.2) * 8 + Math.random() * 3
  }));

  const renewableBreakdown = [
    { name: 'Crusher Circuit', value: 45.2, color: '#f59e0b' },
    { name: 'Mill Circuit', value: 33.3, color: '#3b82f6' },
    { name: 'Conveyor System', value: 21.5, color: '#10b981' }
  ];

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
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Plant Status</h3>
            <p className="text-3xl font-bold">{renewablePercentage}%</p>
            <p className="text-gray-100">Operational Efficiency: {userData.points}%</p>
          </div>
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle cx="40" cy="40" r="30" stroke="rgba(255,255,255,0.3)" strokeWidth="6" fill="none" />
              <circle 
                cx="40" cy="40" r="30" 
                stroke="white" strokeWidth="6" fill="none"
                strokeDasharray={`${renewablePercentage * 1.88} 188`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sun className="h-6 w-6 text-yellow-300 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Energy Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-orange-100 rounded-xl p-4 shadow-sm border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Crusher Load</p>
              <p className="text-2xl font-bold text-orange-700">{energyData.solar.toFixed(1)}%</p>
            </div>
            <Sun className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-blue-100 rounded-xl p-4 shadow-sm border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Mill RPM</p>
              <p className="text-2xl font-bold text-blue-700">{energyData.wind.toFixed(0)} RPM</p>
            </div>
            <Wind className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-gray-200 rounded-xl p-4 shadow-sm border border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Feed Rate</p>
              <p className="text-2xl font-bold text-gray-700">{energyData.grid.toFixed(1)} t/h</p>
            </div>
            <Zap className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Battery Gauge */}
      <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Machine Status</h3>
        <div className="flex items-center space-x-4">
          <Battery className="h-8 w-8 text-gray-600" />
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <span>Efficiency: {energyData.battery.level}%</span>
              <span>Health: {energyData.battery.health.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gray-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${energyData.battery.level}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 24h Demand Graph */}
      <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Throughput Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={demandData}>
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
              <span className="font-bold text-gray-800">{userData.renewableUsage}%</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-gray-600 to-gray-800 h-4 rounded-full transition-all duration-300"
                style={{ width: `${userData.renewableUsage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Renewable Breakdown */}
      <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Equipment Utilization Breakdown</h3>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={renewableBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
              >
                {renewableBreakdown.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {renewableBreakdown.map((item, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <p className="text-lg font-bold">{item.value}%</p>
            </div>
          ))}
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

  const renderProfile = () => (
    <div className="space-y-6">
      {/* User Avatar */}
      <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold text-white">
            {userData.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800">{userData.name}</h3>
        <p className="text-gray-600">{userData.region}</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
          <p className="text-2xl font-bold text-green-600">{userData.points}</p>
          <p className="text-gray-600 text-sm">Points</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
          <p className="text-2xl font-bold text-blue-600">#{userData.rank}</p>
          <p className="text-gray-600 text-sm">Rank</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
          <p className="text-2xl font-bold text-orange-600">{userData.renewableUsage}%</p>
          <p className="text-gray-600 text-sm">Usage</p>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Achievement Badges</h3>
        <div className="grid grid-cols-2 gap-4">
          {userData.badges.map((badge, index) => (
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
              { id: 'profile', label: 'Profile', icon: User }
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
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;