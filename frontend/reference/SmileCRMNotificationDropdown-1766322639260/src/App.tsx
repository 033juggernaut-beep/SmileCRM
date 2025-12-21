/**
 * SmileCRM Notification Dropdown Demo
 * Shows the notification dropdown in a simulated header environment
 */

import { useState } from 'react';
import { NotificationDropdown, Notification } from './Component';
import { Sun, Moon } from 'lucide-react';

// --- Sample Notifications ---
const createSampleNotifications = (): Notification[] => {
  const now = new Date();
  
  return [
    {
      id: '1',
      type: 'visit_upcoming',
      message: 'In 1 hour: visit with Anna Petrosyan',
      timestamp: new Date(now.getTime() - 5 * 60000),
      read: false,
      targetPath: '/visits/today'
    },
    {
      id: '2',
      type: 'patient_no_show',
      message: 'Patient did not show up: Arman A.',
      timestamp: new Date(now.getTime() - 45 * 60000),
      read: false,
      targetPath: '/patients/arman-a'
    },
    {
      id: '3',
      type: 'visit_remaining',
      message: 'Today remaining visits: 3',
      timestamp: new Date(now.getTime() - 2 * 3600000),
      read: false,
      targetPath: '/visits/today'
    },
    {
      id: '4',
      type: 'patient_overdue',
      message: '2 patients have overdue next visits',
      timestamp: new Date(now.getTime() - 4 * 3600000),
      read: true,
      targetPath: '/patients/overdue'
    },
    {
      id: '5',
      type: 'system_trial',
      message: 'Trial ends in 2 days',
      timestamp: new Date(now.getTime() - 24 * 3600000),
      read: true,
      targetPath: '/subscription'
    },
    {
      id: '6',
      type: 'system_subscription',
      message: 'Subscription activated',
      timestamp: new Date(now.getTime() - 3 * 24 * 3600000),
      read: true,
      targetPath: '/subscription'
    }
  ];
};

// --- Tooth Logo (matching SmileCRM style) ---
const ToothLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2C9.5 2 7.5 3 6.5 4.5C5.5 6 5 8 5 10C5 12 5.5 14 6 16C6.5 18 7 20 8 21.5C8.5 22 9 22 9.5 21.5C10.5 20 11 18 11 16C11 15 11.5 14 12 14C12.5 14 13 15 13 16C13 18 13.5 20 14.5 21.5C15 22 15.5 22 16 21.5C17 20 17.5 18 18 16C18.5 14 19 12 19 10C19 8 18.5 6 17.5 4.5C16.5 3 14.5 2 12 2Z" />
  </svg>
);

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(createSampleNotifications);

  const handleNotificationClick = (notification: Notification) => {
    console.log('Navigate to:', notification.targetPath);
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${
      isDark 
        ? 'bg-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-sky-50/50'
    }`}>
      {/* Google Font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header Bar */}
      <header className={`w-full px-6 py-4 flex items-center justify-between border-b transition-colors duration-300 ${
        isDark 
          ? 'bg-slate-900/80 border-slate-700/50' 
          : 'bg-white/90 border-blue-100'
      }`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <ToothLogo className={`w-7 h-7 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <span className={`text-lg font-semibold tracking-wide ${isDark ? 'text-white' : 'text-slate-800'}`}>
            SmileCRM
          </span>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          {/* Notification Dropdown */}
          <NotificationDropdown
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
            onMarkAllRead={handleMarkAllRead}
            isDark={isDark}
          />

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Demo Content */}
      <div className="flex items-center justify-center py-20 px-4">
        <div className={`text-center max-w-md ${isDark ? 'text-slate-400' : 'text-slate-500'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <p className="text-sm">
            Click the bell icon in the header to open the notifications panel.
          </p>
        </div>
      </div>
    </div>
  );
}
