import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Bell, 
  Settings, 
  Mail, 
  Save,
  ArrowLeft,
  Sliders,
  FileText,
  Clock
} from 'lucide-react';

interface SettingsProfileProps {
  onBack: () => void;
}

const SettingsProfile: React.FC<SettingsProfileProps> = ({ onBack }) => {
  const { user, logout } = useAuth();
  
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    campus: user?.campus || '',
    phone: '+1 (555) 123-4567'
  });

  const [alertSettings, setAlertSettings] = useState({
    batteryAlerts: true,
    systemAlerts: true,
    maintenanceAlerts: true,
    emailNotifications: true,
    pushNotifications: true,
    alertThreshold: 85
  });

  const [loadPreferences, setLoadPreferences] = useState({
    priorityLabs: true,
    priorityHostels: true,
    priorityOffices: false,
    autoOptimization: true,
    batteryReserve: 20
  });

  const [reportSettings, setReportSettings] = useState({
    autoEmail: true,
    frequency: 'weekly',
    recipients: 'admin@campus.edu, facility@campus.edu',
    includeGraphs: true,
    includeAlerts: true
  });

  const handleSave = () => {
    // In a real app, this would save to backend
    alert('Settings saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Settings & Profile</h1>
                <p className="text-gray-600">Manage your preferences and account settings</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
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

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Profile Information */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile Information</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Campus</label>
              <input
                type="text"
                value={profile.campus}
                onChange={(e) => setProfile({ ...profile, campus: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Alert Settings */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Alert Settings</span>
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">Battery Alerts</h3>
                <p className="text-sm text-gray-600">Get notified about battery status changes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertSettings.batteryAlerts}
                  onChange={(e) => setAlertSettings({ ...alertSettings, batteryAlerts: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">System Alerts</h3>
                <p className="text-sm text-gray-600">Receive system status and performance alerts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertSettings.systemAlerts}
                  onChange={(e) => setAlertSettings({ ...alertSettings, systemAlerts: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">Email Notifications</h3>
                <p className="text-sm text-gray-600">Send alerts to your email address</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertSettings.emailNotifications}
                  onChange={(e) => setAlertSettings({ ...alertSettings, emailNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alert Threshold: {alertSettings.alertThreshold}%
              </label>
              <input
                type="range"
                min="70"
                max="95"
                value={alertSettings.alertThreshold}
                onChange={(e) => setAlertSettings({ ...alertSettings, alertThreshold: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Load Preferences */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
            <Sliders className="h-5 w-5" />
            <span>Load Management Preferences</span>
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">Prioritize Research Labs</h3>
                <p className="text-sm text-gray-600">Always maintain power to research facilities</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={loadPreferences.priorityLabs}
                  onChange={(e) => setLoadPreferences({ ...loadPreferences, priorityLabs: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">Auto Optimization</h3>
                <p className="text-sm text-gray-600">Automatically optimize energy distribution</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={loadPreferences.autoOptimization}
                  onChange={(e) => setLoadPreferences({ ...loadPreferences, autoOptimization: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Battery Reserve: {loadPreferences.batteryReserve}%
              </label>
              <input
                type="range"
                min="10"
                max="50"
                value={loadPreferences.batteryReserve}
                onChange={(e) => setLoadPreferences({ ...loadPreferences, batteryReserve: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Report Auto-emailing */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Report Auto-emailing</span>
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800">Enable Auto-emailing</h3>
                <p className="text-sm text-gray-600">Automatically send reports to specified recipients</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reportSettings.autoEmail}
                  onChange={(e) => setReportSettings({ ...reportSettings, autoEmail: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {reportSettings.autoEmail && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    value={reportSettings.frequency}
                    onChange={(e) => setReportSettings({ ...reportSettings, frequency: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                  <textarea
                    value={reportSettings.recipients}
                    onChange={(e) => setReportSettings({ ...reportSettings, recipients: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    rows={3}
                    placeholder="Enter email addresses separated by commas"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">Include Graphs</h3>
                    <p className="text-sm text-gray-600">Add charts and visualizations to reports</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reportSettings.includeGraphs}
                      onChange={(e) => setReportSettings({ ...reportSettings, includeGraphs: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsProfile;