import React, { createContext, useContext, useState, useEffect } from 'react';

interface PriorityRequest {
  id: string;
  facility: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp: Date;
}

interface RegionalData {
  region: string;
  usage: number;
  trend: string;
}

interface AdminContextType {
  energyMode: string;
  setEnergyMode: (mode: string) => void;
  mlAutoMode: boolean;
  setMlAutoMode: (enabled: boolean) => void;
  systemStatus: Record<string, boolean>;
  priorityRequests: PriorityRequest[];
  regionalData: RegionalData[];
  addPriorityRequest: (request: Omit<PriorityRequest, 'id' | 'timestamp' | 'status'>) => void;
  updateRequestStatus: (id: string, status: 'Approved' | 'Rejected') => void;
  syncHardware: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [energyMode, setEnergyMode] = useState('Auto Mode');
  const [mlAutoMode, setMlAutoMode] = useState(false);
  const [systemStatus] = useState({
    'Crusher Unit': true,
    'Ball Mill': true,
    'Conveyor System': true,
    'AI Control': true
  });

  const [priorityRequests, setPriorityRequests] = useState<PriorityRequest[]>([
    {
      id: '1',
      facility: 'Crusher Unit 1',
      priority: 'High',
      reason: 'Liner wear detected - maintenance required',
      status: 'Pending',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      facility: 'Ball Mill 2',
      priority: 'Medium',
      reason: 'Efficiency optimization needed',
      status: 'Approved',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
    }
  ]);

  const [regionalData] = useState<RegionalData[]>([
    { region: 'Circuit A', usage: 85.2, trend: '+12%' },
    { region: 'Circuit B', usage: 78.9, trend: '+8%' },
    { region: 'Circuit C', usage: 82.1, trend: '+15%' },
    { region: 'Circuit D', usage: 76.5, trend: '+5%' },
    { region: 'Circuit E', usage: 79.3, trend: '+10%' },
    { region: 'Circuit F', usage: 81.7, trend: '+7%' }
  ]);

  useEffect(() => {
    if (mlAutoMode) {
      const modes = ['Solar Only', 'Wind Only', 'Solar+Wind', 'All Sources', 'Auto Mode'];
      const interval = setInterval(() => {
        const randomMode = modes[Math.floor(Math.random() * modes.length)];
        setEnergyMode(randomMode);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [mlAutoMode]);

  const addPriorityRequest = (request: Omit<PriorityRequest, 'id' | 'timestamp' | 'status'>) => {
    const newRequest: PriorityRequest = {
      ...request,
      id: Date.now().toString(),
      timestamp: new Date(),
      status: 'Pending'
    };
    setPriorityRequests(prev => [newRequest, ...prev]);
  };

  const updateRequestStatus = (id: string, status: 'Approved' | 'Rejected') => {
    setPriorityRequests(prev =>
      prev.map(req => req.id === id ? { ...req, status } : req)
    );
  };

  const syncHardware = async () => {
    return new Promise(resolve => setTimeout(resolve, 10000));
  };

  return (
    <AdminContext.Provider value={{
      energyMode,
      setEnergyMode,
      mlAutoMode,
      setMlAutoMode,
      systemStatus,
      priorityRequests,
      regionalData,
      addPriorityRequest,
      updateRequestStatus,
      syncHardware
    }}>
      {children}
    </AdminContext.Provider>
  );
};