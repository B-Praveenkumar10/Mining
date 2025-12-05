import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sun, Wind, User, Shield } from 'lucide-react';

const LoginScreen: React.FC = () => {
  const [displayText, setDisplayText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'operator' | 'engineer'>('operator');

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

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      await login(username, password);
    } catch (error) {
      console.error('Login failed:', error);
    }
    setIsLoading(false);
  };

  const handleRoleSelect = (role: 'operator' | 'engineer') => {
    setSelectedRole(role);
    setShowLoginForm(true);
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

        {!showLoginForm ? (
          <div className="space-y-4">
            <button
              onClick={() => handleRoleSelect('operator')}
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
              onClick={() => handleRoleSelect('engineer')}
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
          <div className="space-y-4">
            <div className="rounded-xl p-6 shadow-soft bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-semibold mb-4 text-primary">{selectedRole === 'operator' ? 'Operator Login' : 'Engineer Login'}</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const password = formData.get('password') as string;
                const username = selectedRole === 'operator' ? 'operator1' : 'engineer1';
                handleLogin(username, password);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">Username</label>
                    <input
                      type="text"
                      value={selectedRole === 'operator' ? 'operator1' : 'engineer1'}
                      disabled
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-100 dark:bg-neutral-600 text-primary dark:text-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">Password</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="password123"
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700 text-primary dark:text-secondary focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowLoginForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-500 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-indigo-400"
                    >
                      {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
            <p className="text-secondary">Logging in...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;