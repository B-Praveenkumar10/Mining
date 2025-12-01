import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Shield, Sun, Wind, CreditCard } from 'lucide-react';

const LoginScreen: React.FC = () => {
  const [displayText, setDisplayText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const { login } = useAuth();
  const fullText = 'Mining Comminution Optimizer';

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setDisplayText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const handleUserLogin = async () => {
    setIsLoading(true);
    await login('user@energy.gov', 'password');
    setIsLoading(false);
  };

  const handleAdminClick = () => {
    setShowAdminForm(true);
  };

  const handleAdminLogin = async () => {
    if (employeeId.trim() === 'JVVNL2024001') {
      setIsLoading(true);
      await login('admin@energy.gov', 'password');
      setIsLoading(false);
    } else {
      alert('Invalid Engineer ID. Please use: JVVNL2024001');
      setEmployeeId('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <Sun className="h-8 w-8 text-yellow-400 mr-2 animate-pulse" />
            <Wind className="h-8 w-8 text-gray-300 animate-bounce" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 min-h-[3rem]">
            {displayText}
            <span className="animate-pulse">|</span>
          </h1>
          <p className="text-gray-200 text-lg">
            AI-Powered Mining Energy Optimization
          </p>
        </div>

        {!showAdminForm ? (
          <div className="space-y-4">
            <button
              onClick={handleUserLogin}
              disabled={isLoading}
              className="w-full bg-rose-50/95 backdrop-blur-sm rounded-xl p-6 hover:bg-rose-50 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50"
            >
              <div className="flex items-center justify-center mb-3">
                <User className="h-8 w-8 text-rose-600 mr-3" />
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-gray-800">Operator Portal</h3>
                  <p className="text-gray-600 text-sm">Direct machine control & execution</p>
                </div>
              </div>
            </button>

            <button
              onClick={handleAdminClick}
              disabled={isLoading}
              className="w-full bg-slate-50/95 backdrop-blur-sm rounded-xl p-6 hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50"
            >
              <div className="flex items-center justify-center mb-3">
                <Shield className="h-8 w-8 text-indigo-600 mr-3" />
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-slate-800">Mining Engineer Dashboard</h3>
                  <p className="text-slate-600 text-sm">AI Intelligence & Advanced Analytics</p>
                </div>
              </div>
            </button>
          </div>
        ) : (
          <div className="bg-slate-50/95 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <CreditCard className="h-6 w-6 text-indigo-600 mr-2" />
              <h3 className="text-lg font-semibold text-slate-800">Mining Engineer Login</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Engineer ID (Advanced Analytics Access)
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter your Engineer ID"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />

              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAdminLogin}
                  disabled={isLoading || !employeeId}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Login
                </button>
                <button
                  onClick={() => setShowAdminForm(false)}
                  className="flex-1 bg-slate-500 text-white py-2 px-4 rounded-lg hover:bg-slate-600"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-white">{showAdminForm ? 'Verifying credentials...' : 'Setting up demo user...'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;