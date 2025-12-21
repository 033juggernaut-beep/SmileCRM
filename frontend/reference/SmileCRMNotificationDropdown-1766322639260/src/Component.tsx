/**
 * SmileCRM Notification Dropdown Component
 * 
 * Critical notification system for dental CRM showing:
 * - Today's visits (upcoming appointments, remaining visits)
 * - Missed/Overdue (no-shows, overdue follow-ups)
 * - System notifications (subscription status, trial alerts)
 * 
 * Features:
 * - Opens on bell icon click
 * - Compact dropdown panel
 * - Each notification: icon + text + timestamp
 * - Clickable notifications with navigation callback
 * - Clean medical SaaS aesthetic
 * - Light/dark theme support
 */

import { useState, useRef } from 'react';
import { 
  Bell, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  UserX,
  CreditCard,
  CheckCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
export type NotificationType = 
  | 'visit_upcoming' 
  | 'visit_remaining' 
  | 'patient_no_show' 
  | 'patient_overdue' 
  | 'system_trial' 
  | 'system_subscription';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: Date;
  read?: boolean;
  targetPath?: string;
}

export interface NotificationDropdownProps {
  notifications: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onMarkAllRead?: () => void;
  onClose?: () => void;
  isDark?: boolean;
  className?: string;
}

// --- Notification Icon Map ---
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'visit_upcoming':
      return Clock;
    case 'visit_remaining':
      return Calendar;
    case 'patient_no_show':
      return UserX;
    case 'patient_overdue':
      return AlertTriangle;
    case 'system_trial':
      return AlertTriangle;
    case 'system_subscription':
      return CreditCard;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: NotificationType, isDark: boolean) => {
  switch (type) {
    case 'visit_upcoming':
    case 'visit_remaining':
      return isDark ? 'text-blue-400 bg-blue-500/15' : 'text-blue-600 bg-blue-50';
    case 'patient_no_show':
    case 'patient_overdue':
      return isDark ? 'text-amber-400 bg-amber-500/15' : 'text-amber-600 bg-amber-50';
    case 'system_trial':
      return isDark ? 'text-rose-400 bg-rose-500/15' : 'text-rose-600 bg-rose-50';
    case 'system_subscription':
      return isDark ? 'text-emerald-400 bg-emerald-500/15' : 'text-emerald-600 bg-emerald-50';
    default:
      return isDark ? 'text-slate-400 bg-slate-500/15' : 'text-slate-600 bg-slate-100';
  }
};

// --- Format relative time ---
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
};

// --- Single Notification Item ---
interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
  isDark: boolean;
}

const NotificationItem = ({ notification, onClick, isDark }: NotificationItemProps) => {
  const Icon = getNotificationIcon(notification.type);
  const colorClass = getNotificationColor(notification.type, isDark);

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      whileHover={{ backgroundColor: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(241, 245, 249, 1)' }}
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 p-3 text-left transition-colors rounded-lg",
        !notification.read && (isDark ? 'bg-slate-800/30' : 'bg-blue-50/50')
      )}
    >
      {/* Icon */}
      <div className={cn("flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center", colorClass)}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm leading-snug",
          notification.read 
            ? (isDark ? 'text-slate-400' : 'text-slate-500')
            : (isDark ? 'text-slate-200' : 'text-slate-700'),
          !notification.read && 'font-medium'
        )}>
          {notification.message}
        </p>
        <p className={cn(
          "text-xs mt-1",
          isDark ? 'text-slate-500' : 'text-slate-400'
        )}>
          {formatRelativeTime(notification.timestamp)}
        </p>
      </div>

      {/* Unread indicator */}
      {!notification.read && (
        <div className={cn(
          "flex-shrink-0 w-2 h-2 rounded-full mt-2",
          isDark ? 'bg-blue-400' : 'bg-blue-500'
        )} />
      )}
    </motion.button>
  );
};

// --- Main Dropdown Panel ---
const DropdownPanel = ({ 
  notifications, 
  onNotificationClick, 
  onMarkAllRead,
  onClose,
  isDark 
}: Omit<NotificationDropdownProps, 'className'>) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        "absolute top-full right-0 mt-2 w-[340px] rounded-xl overflow-hidden z-50",
        "shadow-xl border",
        isDark 
          ? 'bg-slate-900 border-slate-700/70 shadow-black/30' 
          : 'bg-white border-slate-200 shadow-slate-200/50'
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-4 py-3 border-b",
        isDark ? 'border-slate-700/70' : 'border-slate-100'
      )}>
        <div className="flex items-center gap-2">
          <h3 className={cn(
            "text-sm font-semibold",
            isDark ? 'text-slate-100' : 'text-slate-800'
          )}>
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className={cn(
              "px-1.5 py-0.5 text-xs font-medium rounded-full",
              isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
            )}>
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button 
              onClick={onMarkAllRead}
              className={cn(
                "text-xs font-medium transition-colors",
                isDark 
                  ? 'text-blue-400 hover:text-blue-300' 
                  : 'text-blue-600 hover:text-blue-700'
              )}
            >
              Mark all read
            </button>
          )}
          <button 
            onClick={onClose}
            className={cn(
              "p-1 rounded-md transition-colors",
              isDark 
                ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className={cn(
            "flex flex-col items-center justify-center py-10",
            isDark ? 'text-slate-500' : 'text-slate-400'
          )}>
            <CheckCircle className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            <AnimatePresence>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => onNotificationClick?.(notification)}
                  isDark={isDark ?? false}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// --- Main Component with Bell Icon ---
export function NotificationDropdown({
  notifications,
  onNotificationClick,
  onMarkAllRead,
  isDark = false,
  className
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleClose = () => setIsOpen(false);
  const handleToggle = () => setIsOpen(!isOpen);

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick?.(notification);
    handleClose();
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className={cn(
          "relative p-2 rounded-lg transition-all duration-200",
          isOpen
            ? (isDark ? 'bg-slate-700 text-blue-400' : 'bg-blue-50 text-blue-600')
            : (isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100')
        )}
      >
        <Bell className="w-5 h-5" />
        
        {/* Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              "absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center",
              "text-[10px] font-bold text-white rounded-full px-1",
              "bg-gradient-to-br from-blue-500 to-blue-600",
              "shadow-sm shadow-blue-500/30"
            )}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={handleClose}
            />
            
            {/* Panel */}
            <DropdownPanel
              notifications={notifications}
              onNotificationClick={handleNotificationClick}
              onMarkAllRead={onMarkAllRead}
              onClose={handleClose}
              isDark={isDark}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationDropdown;
