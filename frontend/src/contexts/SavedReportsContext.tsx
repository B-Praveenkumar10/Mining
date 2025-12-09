import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SavedReport {
  id: string;
  title: string;
  dateRange: {
    startDate?: string;
    endDate?: string;
  };
  createdAt: Date;
  summary?: string;
}

interface SavedReportsContextType {
  savedReports: SavedReport[];
  saveReport: (report: Omit<SavedReport, 'id' | 'createdAt'>) => void;
  deleteReport: (id: string) => void;
  getReport: (id: string) => SavedReport | undefined;
}

const SavedReportsContext = createContext<SavedReportsContextType | undefined>(undefined);

const STORAGE_KEY = 'mining_saved_reports';

export const SavedReportsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const reports = parsed.map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt)
        }));
        setSavedReports(reports);
      }
    } catch (error) {
      console.error('Failed to load saved reports:', error);
    }
  }, []);

  // Save to localStorage whenever reports change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedReports));
    } catch (error) {
      console.error('Failed to save reports:', error);
    }
  }, [savedReports]);

  const saveReport = (report: Omit<SavedReport, 'id' | 'createdAt'>) => {
    const newReport: SavedReport = {
      ...report,
      id: `report-${Date.now()}`,
      createdAt: new Date()
    };
    setSavedReports(prev => [newReport, ...prev]);
  };

  const deleteReport = (id: string) => {
    setSavedReports(prev => prev.filter(r => r.id !== id));
  };

  const getReport = (id: string) => {
    return savedReports.find(r => r.id === id);
  };

  return (
    <SavedReportsContext.Provider value={{ savedReports, saveReport, deleteReport, getReport }}>
      {children}
    </SavedReportsContext.Provider>
  );
};

export const useSavedReports = () => {
  const context = useContext(SavedReportsContext);
  if (!context) {
    throw new Error('useSavedReports must be used within a SavedReportsProvider');
  }
  return context;
};
