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
  <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50 dark:bg-neutral-900 dark:bg-[radial-gradient(circle_at_40%_20%,#1f2937,transparent)] bg-[radial-gradient(circle_at_40%_20%,#f1f5f9,transparent)]">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <Sun className="h-8 w-8 text-yellow-400 mr-2 animate-pulse" />
            <Wind className="h-8 w-8 text-gray-300 animate-bounce" />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-4 min-h-[3rem]">
            {displayText}
            <span className="animate-pulse">|</span>
          </h1>
          <p className="text-secondary text-lg opacity-90">AI-Powered Mining Energy Optimization</p>
        </div>

        {!showAdminForm ? (
          <div className="space-y-4">
            <button
              onClick={handleUserLogin}
              disabled={isLoading}
              className="w-full rounded-xl p-6 transition-colors duration-200 shadow-soft disabled:opacity-50 bg-rose-50 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/40 hover:bg-rose-100 dark:hover:bg-rose-500/30"
            >
              <div className="flex items-center justify-center mb-3">
                <User className="h-8 w-8 text-rose-600 mr-3" />
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-primary">Operator Portal</h3>
                  <p className="text-tertiary text-sm">Direct machine control & execution</p>
                </div>
              </div>
            </button>

            <button
              onClick={handleAdminClick}
              disabled={isLoading}
              className="w-full rounded-xl p-6 transition-colors duration-200 shadow-soft disabled:opacity-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              <div className="flex items-center justify-center mb-3">
                <Shield className="h-8 w-8 text-indigo-600 mr-3" />
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-primary">Mining Engineer Dashboard</h3>
                  <p className="text-tertiary text-sm">AI Intelligence & Advanced Analytics</p>
                </div>
              </div>
            </button>
          </div>
        ) : (
          <div className="rounded-xl p-6 shadow-soft bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center mb-4">
              <CreditCard className="h-6 w-6 text-indigo-600 mr-2" />
              <h3 className="text-lg font-semibold text-primary">Mining Engineer Login</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Engineer ID (Advanced Analytics Access)
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter your Engineer ID"
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-primary dark:text-secondary focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />

              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAdminLogin}
                  disabled={isLoading || !employeeId}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-500 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  Login
                </button>
                <button
                  onClick={() => setShowAdminForm(false)}
                  className="flex-1 bg-neutral-500 text-white py-2 px-4 rounded-lg hover:bg-neutral-600 focus-visible:ring-2 focus-visible:ring-neutral-400"
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
            <p className="text-secondary">{showAdminForm ? 'Verifying credentials...' : 'Setting up demo user...'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;