import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserData {
  id: string;
  name: string;
  region: string;
  points: number;
  renewableUsage: number;
  rank: number;
  badges: string[];
}

interface LeaderboardUser {
  id: string;
  name: string;
  region: string;
  points: number;
  renewableUsage: number;
  rank: number;
}

interface UserContextType {
  userData: UserData;
  leaderboard: LeaderboardUser[];
  updatePoints: (points: number) => void;
  addBadge: (badge: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>({
    id: '1',
    name: 'Praveen Kumar',
    region: 'Mining Operations',
    points: 1850,
    renewableUsage: 78.5,
    rank: 12,
    badges: ['Efficiency Expert', 'Process Optimizer', 'Safety Champion', 'AI Pioneer']
  });

  const [leaderboard] = useState<LeaderboardUser[]>([
    { id: '1', name: 'Rajesh Sharma', region: 'Circuit A', points: 2450, renewableUsage: 89.2, rank: 1 },
    { id: '2', name: 'Priya Gupta', region: 'Circuit B', points: 2380, renewableUsage: 87.5, rank: 2 },
    { id: '3', name: 'Amit Singh', region: 'Circuit C', points: 2290, renewableUsage: 85.1, rank: 3 },
    { id: '4', name: 'Sunita Devi', region: 'Circuit D', points: 2150, renewableUsage: 82.3, rank: 4 },
    { id: '5', name: 'Vikram Rathore', region: 'Circuit E', points: 2050, renewableUsage: 80.7, rank: 5 },
    { id: '6', name: 'Praveen Kumar', region: 'Mining Operations', points: 1850, renewableUsage: 78.5, rank: 12 }
  ]);

  const updatePoints = (points: number) => {
    setUserData(prev => ({
      ...prev,
      points: prev.points + points
    }));
  };

  const addBadge = (badge: string) => {
    setUserData(prev => ({
      ...prev,
      badges: [...prev.badges, badge]
    }));
  };

  return (
    <UserContext.Provider value={{
      userData,
      leaderboard,
      updatePoints,
      addBadge
    }}>
      {children}
    </UserContext.Provider>
  );
};