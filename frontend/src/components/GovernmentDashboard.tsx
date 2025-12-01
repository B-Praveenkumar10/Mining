
import { Pie } from 'recharts';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  FileText, 
  PieChart,
  Building2,
  Leaf,
  Zap,
  DollarSign
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';
import { Campus, KPI } from '../types';

const GovernmentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  
  const [kpis] = useState<KPI>({
    renewableUtilization: 78.5,
    gridDependency: 21.5,
    carbonSavings: 2847,
    costReduction: 45.2
  });

  const [campuses] = useState<Campus[]>([
    {
      id: '1',
      name: 'Main Campus',
      renewableUtilization: 85.2,
      gridDependency: 14.8,
      carbonSavings: 1250,
      energyData: {
        solar: 245,
        wind: 85,
        battery: { charge: 85, health: 92, cycles: 1247 },
        load: 180,
        grid: 0,
        timestamp: new Date()
      }
    },
    {
      id: '2',
      name: 'North Campus',
      renewableUtilization: 72.8,
      gridDependency: 27.2,
      carbonSavings: 890,
      energyData: {
        solar: 180,
        wind: 65,
        battery: { charge: 72, health: 88, cycles: 980 },
        load: 220,
        grid: 45,
        timestamp: new Date()
      }
    },
    {
      id: '3',
      name: 'South Campus',
      renewableUtilization: 67.3,
      gridDependency: 32.7,
      carbonSavings: 707,
      energyData: {
        solar: 165,
        wind: 45,
        battery: { charge: 68, health: 85, cycles: 1156 },
        load: 195,
        grid: 62,
        timestamp: new Date()
      }
    }
  ]);

  const demandSupplyData = [
    { time: '00:00', demand: 120, supply: 85 },
    { time: '04:00', demand: 95, supply: 45 },
    { time: '08:00', demand: 180, supply: 220 },
    { time: '12:00', demand: 220, supply: 285 },
    { time: '16:00', demand: 195, supply: 245 },
    { time: '20:00', demand: 165, supply: 125 },
    { time: '24:00', demand: 140, supply: 95 }
  ];

  const energySourceData = [
    { name: 'Solar', value: 65, color: '#f59e0b' },
    { name: 'Wind', value: 20, color: '#06b6d4' },
    { name: 'Battery', value: 10, color: '#10b981' },
    { name: 'Grid', value: 5, color: '#8b5cf6' }
  ];

  const handleExportCSV = () => {
    const csvData = campuses.map(campus => ({
      Campus: campus.name,
      'Renewable Utilization (%)': campus.renewableUtilization,
      'Grid Dependency (%)': campus.gridDependency,
      'Carbon Savings (kg CO₂)': campus.carbonSavings,
      'Solar (kWh)': campus.energyData.solar,
      'Wind (kWh)': campus.energyData.wind,
      'Battery Charge (%)': campus.energyData.battery.charge,
      'Load (kWh)': campus.energyData.load
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'energy-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    // In a real app, you'd use a library like jsPDF
    alert('PDF export functionality would be implemented here');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Government Analytics Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExportCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>Export PDF</span>
              </button>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {kpis.renewableUtilization}%
            </div>
            <div className="text-sm text-gray-600">Renewable Utilization</div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-red-500 rotate-180" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {kpis.gridDependency}%
            </div>
            <div className="text-sm text-gray-600">Grid Dependency</div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Leaf className="h-6 w-6 text-blue-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {kpis.carbonSavings.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">kg CO₂ Saved</div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-xl">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {kpis.costReduction}%
            </div>
            <div className="text-sm text-gray-600">Cost Reduction</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Demand vs Supply Chart */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Demand vs Supply (24h)</span>
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={demandSupplyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="demand" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Demand (kWh)"
                />
                <Line 
                  type="monotone" 
                  dataKey="supply" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Supply (kWh)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Energy Source Distribution */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Energy Source Distribution</span>
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={energySourceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {energySourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campus Comparison Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Campus Comparison</span>
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Campus</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Renewable %</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Grid Dependency</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Carbon Savings</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Solar (kWh)</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Battery %</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {campuses.map((campus) => (
                  <tr key={campus.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{campus.name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        campus.renewableUtilization > 80 
                          ? 'bg-green-100 text-green-800'
                          : campus.renewableUtilization > 70
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {campus.renewableUtilization.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{campus.gridDependency.toFixed(1)}%</td>
                    <td className="py-3 px-4 text-gray-600">{campus.carbonSavings} kg CO₂</td>
                    <td className="py-3 px-4 text-gray-600">{campus.energyData.solar.toFixed(0)}</td>
                    <td className="py-3 px-4 text-gray-600">{campus.energyData.battery.charge.toFixed(0)}%</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Optimal
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernmentDashboard;