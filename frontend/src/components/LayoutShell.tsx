import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageCircle, LogOut, Moon, Sun, ChevronLeft, ChevronRight, Monitor, Users, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
  { to: '/chatbot', label: 'Chatbot', icon: MessageCircle },
  { to: '/digital-twin', label: 'Digital Twin', icon: Eye },
  { to: '/admin/user-logs', label: 'User Logs', icon: Users },
];

interface LayoutShellProps {
  children: React.ReactNode;
}

const LayoutShell: React.FC<LayoutShellProps> = ({ children }) => {
  const { logout, user } = useAuth();
  const { mode, toggle } = useColorMode();

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
      {/* Sidebar - Hidden for Mining Engineer */}
      {user?.role !== 'engineer' && (
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
      )}

      {/* Main content area */}
      <div className={`flex-1 flex flex-col ${user?.role !== 'engineer' ? (collapsed ? 'md:ml-20' : 'md:ml-60') : ''}`}>
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 sticky top-0 z-40">
          <div className="flex items-center gap-3 md:hidden">
            {/* keep mobile dark toggle and username */}
            <button onClick={toggle} className="p-2 rounded-md bg-neutral-100 dark:bg-neutral-800">
              {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <span className="text-sm font-medium">{user?.name}</span>
          </div>
          {/* Removed duplicate nav & avatar - keep header minimal */}
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 pr-2">
              {/* When sidebar is collapsed the header remains minimal - avatar kept */}
              <div
                className="relative w-9 h-9 rounded-full bg-gradient-to-br from-brand-500/70 via-brand-600 to-brand-700 shadow-inner ring-2 ring-white dark:ring-neutral-800 overflow-hidden"
                aria-label={`User avatar for ${user?.name || 'user'}`}
              >
                <div className="absolute inset-0 mix-blend-overlay opacity-30 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.6),transparent)]" />
                <span className="flex h-full w-full items-center justify-center text-xs font-bold tracking-wide text-white">
                  {user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
                </span>
              </div>
              
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LayoutShell;
