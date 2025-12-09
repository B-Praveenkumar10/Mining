import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MachineProvider } from './contexts/MachineProvider';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import LayoutShell from './components/LayoutShell';
import WhatsAppIntegration from './components/WhatsAppIntegration';
import Simulate from './pages/Simulate';
import Graph from './pages/Graph';
import CrusherSimulation from './pages/CrusherSimulation';

const AppContent: React.FC = () => {
  return (
    <LayoutShell>
      <Routes>
  {/* Default route now starts at Simulation page */}
  <Route path="/" element={<Simulate />} />
        <Route path="/whatsapp" element={<WhatsAppIntegration />} />
        <Route path="/simulate" element={<Simulate />} />
  <Route path="/crusher-simulation" element={<CrusherSimulation />} />
        <Route path="/graph" element={<Graph />} />
        {/* Keep dashboards accessible if needed */}
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LayoutShell>
  );
};

function App() {
  return (
    <AuthProvider>
      <MachineProvider>
        <Router>
          <AppContent />
        </Router>
      </MachineProvider>
    </AuthProvider>
  );
}

export default App;