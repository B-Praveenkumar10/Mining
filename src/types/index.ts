export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  name: string;
  campus?: string;
}

export interface EnergyData {
  solar: number;
  wind: number;
  battery: {
    charge: number;
    health: number;
    cycles: number;
  };
  load: number;
  grid: number;
  timestamp: Date;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface Campus {
  id: string;
  name: string;
  renewableUtilization: number;
  gridDependency: number;
  carbonSavings: number;
  energyData: EnergyData;
}

export interface KPI {
  renewableUtilization: number;
  gridDependency: number;
  carbonSavings: number;
  costReduction: number;
}

export interface UserPoints {
  userId: string;
  userName: string;
  campus: string;
  points: number;
  renewableUsage: number;
  rank: number;
}

export interface PriorityRequest {
  id: string;
  type: 'exam_center' | 'classroom' | 'hostel' | 'lab' | 'office';
  priority: 'grid' | 'solar' | 'wind' | 'solar+wind' | 'solar+wind+grid';
  occupancy?: number; // for hostels
  jvvnlId?: string; // JVVNL consumer ID
  active: boolean;
}

export interface Region {
  id: string;
  name: string;
  type?: 'solar' | 'wind' | 'grid';
  usage?: number;
  coordinates?: [number, number]; // lat, lng
  campuses?: string[];
  solar?: number;
  wind?: number;
  load?: number;
  points?: number;
}

export interface MLMode {
  active: boolean;
  prediction: 'solar' | 'wind' | 'solar+wind' | 'solar+wind+grid';
  confidence: number;
  lastUpdated: Date;
}

export interface VoiceCommand {
  command: string;
  mode: 'solar' | 'wind' | 'solar+wind' | 'solar+wind+grid' | 'grid';
  language: string;
  confidence: number;
  timestamp: Date;
  success: boolean;
}
