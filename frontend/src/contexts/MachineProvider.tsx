import React, { createContext, useContext, useState, useEffect } from 'react';
import { machineAPI } from '../services/api';

interface MachineData {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'maintenance';
  throughput: number;
  powerDraw: number;
  efficiency: number;
  temperature: number;
  vibration: number;
  lastMaintenance: string;
  operatingHours: number;
}

interface MachineContextType {
  machines: MachineData[];
  loading: boolean;
  startMachine: (id: string) => void;
  stopMachine: (id: string) => void;
  setMaintenanceMode: (id: string) => void;
}

const MachineContext = createContext<MachineContextType | undefined>(undefined);

export const useMachine = () => {
  const context = useContext(MachineContext);
  if (!context) throw new Error('useMachine must be used within MachineProvider');
  return context;
};

export const MachineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [machines, setMachines] = useState<MachineData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMachinesData = async () => {
    try {
      const statuses = await machineAPI.getAllMachinesStatus();
      const machineData = statuses.map((status, index) => ({
        id: status.machine_id,
        name: `Machine ${index + 1}`,
        status: status.status,
        throughput: status.throughput || 0,
        powerDraw: status.power_draw || 0,
        efficiency: status.efficiency || 0,
        temperature: status.temperature || 25,
        vibration: status.vibration || 0,
        lastMaintenance: '2024-11-15',
        operatingHours: 1200 + index * 300
      }));
      setMachines(machineData);
    } catch (error) {
      console.error('Failed to fetch machine data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachinesData();
    const interval = setInterval(fetchMachinesData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const startMachine = async (id: string) => {
    try {
      await machineAPI.controlMachine(id, 'start');
      await fetchMachinesData(); // Refresh data after control action
    } catch (error) {
      console.error('Failed to start machine:', error);
    }
  };

  const stopMachine = async (id: string) => {
    try {
      await machineAPI.controlMachine(id, 'stop');
      await fetchMachinesData(); // Refresh data after control action
    } catch (error) {
      console.error('Failed to stop machine:', error);
    }
  };

  const setMaintenanceMode = async (id: string) => {
    try {
      await machineAPI.controlMachine(id, 'maintenance');
      await fetchMachinesData(); // Refresh data after control action
    } catch (error) {
      console.error('Failed to set maintenance mode:', error);
    }
  };

  return (
    <MachineContext.Provider value={{
      machines,
      loading,
      startMachine,
      stopMachine,
      setMaintenanceMode
    }}>
      {children}
    </MachineContext.Provider>
  );
};