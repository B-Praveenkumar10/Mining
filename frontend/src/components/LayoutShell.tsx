import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LogOut, Moon, Sun, ChevronLeft, ChevronRight, Monitor, Play, Square, Bell, CheckCircle, XCircle, Activity, BarChart3, Box } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMachine } from '../contexts/MachineProvider';
import { api } from '../services/api';

// Simple dark mode toggler using a class on <html>
function useColorMode() {
  const [mode, setMode] = React.useState<'light' | 'dark'>(() => (typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'));
  React.useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);
  return { mode, toggle: () => setMode(m => (m === 'dark' ? 'light' : 'dark')) };
}

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/simulate', label: 'Simulation', icon: Activity },
  { to: '/graph', label: 'Analytics', icon: BarChart3 },
  { to: '/crusher-simulation', label: 'Crusher 3D', icon: Box },
];

interface LayoutShellProps {
  children: React.ReactNode;
}

const LayoutShell: React.FC<LayoutShellProps> = ({ children }) => {
  const { logout, user } = useAuth();
  const { mode, toggle } = useColorMode();
  const { machines, loading, startMachine, stopMachine } = useMachine();
  const [showSidePane, setShowSidePane] = React.useState(false);
  const [pendingSignups, setPendingSignups] = React.useState<any[]>([]);
  const [signupsLoading, setSignupsLoading] = React.useState(false);

  React.useEffect(() => {
    if (user?.role === 'admin') {
      const fetchSignups = async () => {
        try {
          setSignupsLoading(true);
          const data = await api.getPendingSignups();
          setPendingSignups(data.signups || []);
        } catch (error) {
          console.error('Failed to fetch signups:', error);
        } finally {
          setSignupsLoading(false);
        }
      };
      fetchSignups();
      const interval = setInterval(fetchSignups, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleApproveSignup = async (signupId: string) => {
    try {
      await api.approveSignup(signupId);
      setPendingSignups(prev => prev.filter(s => s._id !== signupId));
    } catch (error: any) {
      alert('Failed to approve: ' + error.message);
    }
  };

  const handleRejectSignup = async (signupId: string) => {
    try {
      await api.rejectSignup(signupId);
      setPendingSignups(prev => prev.filter(s => s._id !== signupId));
    } catch (error: any) {
      alert('Failed to reject: ' + error.message);
    }
  };

  // Add collapsed state persisted in localStorage
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return false;
      const v = localStorage.getItem('sidebar_collapsed');
      return v === '1';
    } catch {
      return false;
    }
  });
  React.useEffect(() => {
    try {
      localStorage.setItem('sidebar_collapsed', collapsed ? '1' : '0');
    } catch {}
  }, [collapsed]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 flex">
      {/* Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/80 backdrop-blur-sm shadow-glass fixed inset-y-0 left-0 z-30 transition-all duration-200 ease-in-out ${
          collapsed ? 'w-20' : 'w-60'
        }`}
        aria-expanded={!collapsed}
      >
        <div className="px-3 py-3 border-b border-neutral-200 dark:border-neutral-800 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center rounded-lg font-semibold text-white ${collapsed ? 'w-9 h-9' : 'w-9 h-9'} bg-brand-500`}>
              {/* keep initials / brand */}
              <span className="text-sm">AI</span>
            </div>
            {!collapsed && <span className="font-semibold text-neutral-700 dark:text-neutral-200">Mining Optimizer</span>}
          </div>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                      : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                  } ${collapsed ? 'justify-center' : ''}`
                }
              >
                <Icon className="h-4 w-4 text-neutral-500 group-hover:text-brand-600" />
                <span className={`${collapsed ? 'hidden' : 'inline'}`}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 space-y-2 border-t border-neutral-200 dark:border-neutral-800 shrink-0">
          <button
            onClick={toggle}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition ${
              collapsed ? 'justify-center' : 'bg-neutral-100 dark:bg-neutral-800'
            }`}
            title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {!collapsed && <span>{mode === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button
            onClick={logout}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-danger/90 text-white hover:bg-danger transition ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Logout</span>}
          </button>


        </div>
      </aside>

      {/* Main content area */}
      <div className={`flex-1 flex flex-col ${collapsed ? 'md:ml-20' : 'md:ml-60'}`}>
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 sticky top-0 z-40">
          <div className="flex items-center gap-3 md:hidden">
            {/* keep mobile dark toggle and username */}
            <button onClick={toggle} className="p-2 rounded-md bg-neutral-100 dark:bg-neutral-800">
              {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <span className="text-sm font-medium">{user?.name}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {user?.role === 'admin' && pendingSignups.length > 0 && (
              <div className="relative">
                <Bell className="h-5 w-5 text-amber-500" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {pendingSignups.length}
                </span>
              </div>
            )}
            <button
              onClick={() => setShowSidePane(!showSidePane)}
              className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title={user?.role === 'admin' ? 'Machine Records & Approvals' : 'Machine Controls'}
            >
              <Monitor className="h-5 w-5" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 flex gap-4">
          <div className="flex-1 mx-auto max-w-7xl space-y-6 animate-fade-in">
            {children}
          </div>
          
          {/* Side Pane */}
          {showSidePane && (
            <div className="w-80 bg-white dark:bg-neutral-800 shadow-lg border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 h-fit sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center">
                  <Monitor className="h-4 w-4 mr-2" />
                  {user?.role === 'admin' ? 'Records & Approvals' : 'Machine Controls'}
                </h3>
                <button onClick={() => setShowSidePane(false)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              
              {user?.role === 'admin' && pendingSignups.length > 0 && (
                <div className="mb-4 space-y-2">
                  <h4 className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Bell className="h-3 w-3" /> Pending Approvals ({pendingSignups.length})
                  </h4>
                  {pendingSignups.map(signup => (
                    <div key={signup._id} className="p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded">
                      <div className="text-xs font-medium mb-1">{signup.username}</div>
                      <div className="text-[10px] text-neutral-600 dark:text-neutral-400 mb-2">ID: {signup.emp_id}</div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleApproveSignup(signup._id)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[10px] bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          <CheckCircle className="h-3 w-3" /> Approve
                        </button>
                        <button
                          onClick={() => handleRejectSignup(signup._id)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[10px] bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          <XCircle className="h-3 w-3" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-neutral-200 dark:border-neutral-700 my-3"></div>
                </div>
              )}
              
              {loading || signupsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600 mx-auto"></div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">Loading...</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                  <h4 className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Machine Records</h4>
                  {machines.map((machine) => (
                    <div key={machine.id} className="p-3 bg-neutral-50 dark:bg-neutral-700 rounded border border-neutral-200 dark:border-neutral-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{machine.name}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          machine.status === 'running' ? 'bg-green-500' :
                          machine.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                      </div>
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="text-neutral-500 dark:text-neutral-400">Throughput:</span>
                          <span className="font-medium ml-1">{machine.throughput} t/h</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 dark:text-neutral-400">Power:</span>
                          <span className="font-medium ml-1">{machine.powerDraw} MW</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 dark:text-neutral-400">Efficiency:</span>
                          <span className="font-medium ml-1">{machine.efficiency}%</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 dark:text-neutral-400">Temperature:</span>
                          <span className="font-medium ml-1">{machine.temperature}°C</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 dark:text-neutral-400">Vibration:</span>
                          <span className="font-medium ml-1">{machine.vibration} mm/s</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 dark:text-neutral-400">Op. Hours:</span>
                          <span className="font-medium ml-1">{machine.operatingHours}h</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 dark:text-neutral-400">Last Maint:</span>
                          <span className="font-medium ml-1">{machine.lastMaintenance}</span>
                        </div>
                        <div className="pt-1 border-t border-neutral-200 dark:border-neutral-600">
                          <span className="text-neutral-500 dark:text-neutral-400">Status:</span>
                          <span className={`font-medium ml-1 capitalize ${
                            machine.status === 'running' ? 'text-green-600 dark:text-green-400' :
                            machine.status === 'maintenance' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                          }`}>{machine.status}</span>
                        </div>
                      </div>
                      {user?.role !== 'admin' && (
                        <div className="mt-3 space-y-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => startMachine(machine.id)}
                              disabled={machine.status === 'running'}
                              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Play className="h-3 w-3" /> Start
                            </button>
                            <button
                              onClick={() => stopMachine(machine.id)}
                              disabled={machine.status !== 'running'}
                              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Square className="h-3 w-3" /> Stop
                            </button>
                          </div>
                          <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-600 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                machine.status === 'running' ? 'bg-green-500 w-full' : 'bg-red-500 w-0'
                              }`}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LayoutShell;
