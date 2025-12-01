import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EnergyProvider } from './contexts/EnergyProvider';
import { UserProvider } from './contexts/UserProvider';
import { AdminProvider } from './contexts/AdminProvider';
import LoginScreen from './components/LoginScreen';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import LayoutShell from './components/LayoutShell';
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
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-2 border-neutral-300 dark:border-neutral-700" />
            <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" aria-label="Loading" />
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 font-medium tracking-wide">Initializing system...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <LayoutShell>
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
    </LayoutShell>
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