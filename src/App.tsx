import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EnergyProvider } from './contexts/EnergyProvider';
import { UserProvider } from './contexts/UserProvider';
import { AdminProvider } from './contexts/AdminProvider';
import LoginScreen from './components/LoginScreen';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import AdminUserLogs from './components/AdminUserLogs';
import WhatsAppIntegration from './components/WhatsAppIntegration';
import ChatbotWidget from './components/ChatbotWidget';
import PointsLeaderboard from './components/PointsLeaderboard';
import EnergyMap from './components/EnergyMap';
import DigitalTwin from './components/DigitalTwin';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-teal-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto mb-4"></div>
          <p className="text-gray-200 text-lg">Loading Mining Comminution Optimizer...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={
        user.role === 'user' ? <UserDashboard /> : <AdminDashboard />
      } />
      <Route path="/admin/user-logs" element={<AdminUserLogs />} />
      <Route path="/whatsapp" element={<WhatsAppIntegration />} />
      <Route path="/chatbot" element={<ChatbotWidget />} />
      <Route path="/leaderboard" element={<PointsLeaderboard />} />
      <Route path="/map" element={<EnergyMap />} />
      <Route path="/digital-twin" element={<DigitalTwin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <EnergyProvider>
        <UserProvider>
          <AdminProvider>
            <Router>
              <AppContent />
            </Router>
          </AdminProvider>
        </UserProvider>
      </EnergyProvider>
    </AuthProvider>
  );
}

export default App;