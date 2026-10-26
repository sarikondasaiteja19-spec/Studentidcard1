import React from 'react';
import { AppNotification } from '../types';
import { Bell, CheckCheck, AlertCircle, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

interface NotificationsViewProps {
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onNavigateTab: (tab: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAllRead,
  onNavigateTab,
}) => {
  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <span>System Notifications & Warnings</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time notifications about duplicate PIN blocks, card expirations, and generation events.
          </p>
        </div>

        <button
          onClick={onMarkAllRead}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark all read</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-semibold">No notifications</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                notif.read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/40 hover:bg-blue-50/60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                  {notif.linkTab && (
                    <button
                      onClick={() => onNavigateTab(notif.linkTab!)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 mt-1.5 block"
                    >
                      Go to {notif.linkTab.toUpperCase()} →
                    </button>
                  )}
                </div>
              </div>

              <span className="text-[10.5px] font-mono text-slate-400 shrink-0">
                {notif.timestamp}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
