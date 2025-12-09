const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api';

let authToken: string | null = localStorage.getItem('token');

export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem('token', token);
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('token');
};

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error ${response.status}:`, errorText);
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

export const authAPI = {
  login: (username: string, password: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
};

export const machineAPI = {
  getMachineStatus: (machineId: string) =>
    apiRequest(`/machines/${machineId}/status`),
  
  controlMachine: (machineId: string, action: string) =>
    apiRequest(`/machines/${machineId}/control`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    }),
  
  getAllMachinesStatus: async () => {
    const machines = ['machine-01', 'machine-02', 'machine-03'];
    const statuses = await Promise.all(
      machines.map(id => machineAPI.getMachineStatus(id))
    );
    return statuses;
  },
};

export const analyticsAPI = {
  getOverview: () => apiRequest('/analytics/overview'),
  getTrends: () => apiRequest('/analytics/trends'),
  getBreakdown: () => apiRequest('/analytics/breakdown'),
  getAlerts: () => apiRequest('/analytics/alerts'),
};

export const api = {
  login: authAPI.login,
  getMachineStatus: machineAPI.getMachineStatus,
  controlMachine: machineAPI.controlMachine,
  getAllMachinesStatus: machineAPI.getAllMachinesStatus,
  getAnalyticsOverview: analyticsAPI.getOverview,
  getAnalyticsTrends: analyticsAPI.getTrends,
  getAnalyticsBreakdown: analyticsAPI.getBreakdown,
  getAnalyticsAlerts: analyticsAPI.getAlerts,
  getAdvancedAnalytics: () => apiRequest('/analytics/advanced'),
  getTemperatureAnalytics: () => apiRequest('/analytics/temperature'),
  getPendingSignups: () => apiRequest('/auth/pending-signups'),
  approveSignup: (signupId: string) => apiRequest(`/auth/approve-signup/${signupId}`, { method: 'POST' }),
  rejectSignup: (signupId: string) => apiRequest(`/auth/reject-signup/${signupId}`, { method: 'POST' }),
  getReportSummary: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return apiRequest(`/reports/summary?${params.toString()}`);
  },
};

// Report generation - returns blob for download
export const generateReport = async (startDate?: string, endDate?: string): Promise<Blob> => {
  const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api';
  const response = await fetch(`${API_BASE}/reports/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ startDate, endDate, reportType: 'comprehensive' }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to generate report: ${errorText}`);
  }
  
  return response.blob();
};

// Helper to trigger PDF download
export const downloadReport = async (startDate?: string, endDate?: string): Promise<void> => {
  try {
    const blob = await generateReport(startDate, endDate);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mining_report_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download report:', error);
    throw error;
  }
};