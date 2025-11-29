import React, { createContext, useContext, useState, useEffect } from 'react';

interface EnergyData {
  solar: number; // Crusher Load %
  wind: number;  // Mill RPM
  grid: number;  // Feed Rate t/h
  battery: {
    level: number;  // Equipment Efficiency %
    health: number; // Equipment Health %
  };
  consumption: number; // Total Power MW
  timestamp: Date;
}

interface EnergyContextType {
  energyData: EnergyData;
  renewablePercentage: number;
  isOnline: boolean;
  alerts: string[];
  historicalData: EnergyData[];
}

const EnergyContext = createContext<EnergyContextType | undefined>(undefined);

export const useEnergy = () => {
  const context = useContext(EnergyContext);
  if (!context) throw new Error('useEnergy must be used within EnergyProvider');
  return context;
};

export const EnergyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [energyData, setEnergyData] = useState<EnergyData>({
    solar: 0,
    wind: 0,
    grid: 0,
    battery: { level: 75, health: 92 },
    consumption: 0,
    timestamp: new Date()
  });
  const [historicalData, setHistoricalData] = useState<EnergyData[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    const updateEnergyData = () => {
      const isOperating = Math.random() > 0.1;
      
      const solar = isOperating ? 70 + Math.random() * 25 : 0; // Crusher Load %
      const wind = isOperating ? 15 + Math.random() * 10 : 0;   // Mill RPM
      const consumption = isOperating ? 3.5 + Math.random() * 1.5 : 0; // Total Power MW
      const grid = isOperating ? 800 + Math.random() * 100 : 0; // Feed Rate t/h
      
      const newData: EnergyData = {
        solar,
        wind,
        grid,
        battery: {
          level: Math.max(20, Math.min(100, energyData.battery.level + (solar + wind - consumption) * 0.1)),
          health: 92 + Math.random() * 6
        },
        consumption,
        timestamp: new Date()
      };
      
      setEnergyData(newData);
      setHistoricalData(prev => [...prev.slice(-99), newData]);
      
      // Generate alerts
      const newAlerts: string[] = [];
      if (newData.battery.level < 70) newAlerts.push('Equipment Efficiency Low');
      if (solar > 90) newAlerts.push('Crusher Overload Warning');
      if (wind < 10) newAlerts.push('Mill Speed Below Optimal');
      if (grid > 900) newAlerts.push('High Throughput Achieved');
      setAlerts(newAlerts);
    };

    updateEnergyData();
    const interval = setInterval(updateEnergyData, 3000);
    return () => clearInterval(interval);
  }, [energyData.battery.level]);

  const renewablePercentage = energyData.battery.level; // Equipment Efficiency %

  return (
    <EnergyContext.Provider value={{
      energyData,
      renewablePercentage,
      isOnline,
      alerts,
      historicalData
    }}>
      {children}
    </EnergyContext.Provider>
  );
};