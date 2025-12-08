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
  getPendingSignups: () => apiRequest('/auth/pending-signups'),
  approveSignup: (signupId: string) => apiRequest(`/auth/approve-signup/${signupId}`, { method: 'POST' }),
  rejectSignup: (signupId: string) => apiRequest(`/auth/reject-signup/${signupId}`, { method: 'POST' }),
};