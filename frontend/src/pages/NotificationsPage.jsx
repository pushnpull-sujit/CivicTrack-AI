import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Check, Trash2, Calendar } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, unreadCount, markAllAsRead, clearNotifications } = useNotifications();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="rounded-[28px] border border-white bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#0f172a]/70 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Notifications</h2>
            <p className="text-sm text-slate-500 dark:text-white/60">View real-time updates regarding your filed complaints and assignments.</p>
          </div>
          
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350"
              >
                <Check size={14} className="text-emerald-500" />
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button 
                onClick={clearNotifications}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition dark:border-slate-800 dark:bg-slate-900 dark:text-rose-450 dark:hover:bg-rose-950/20"
              >
                <Trash2 size={14} />
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Notifications list */}
        {notifications.length === 0 ? (
          <div className="py-24 text-center text-slate-400">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <Bell size={22} />
            </div>
            <p className="font-bold text-slate-700 dark:text-slate-300">Your inbox is clean</p>
            <p className="text-xs mt-1">Real-time alerts will appear here as issues get verified and resolved.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {notifications.map((notif) => (
              <div 
                key={notif._id || Math.random().toString()}
                className={`flex gap-4 p-4 rounded-2xl border transition ${
                  notif.read 
                    ? 'border-slate-100 bg-slate-50/20 dark:border-slate-850 dark:bg-slate-900/10' 
                    : 'border-violet-100 bg-violet-50/10 dark:border-violet-550/15 dark:bg-violet-950/5 ring-1 ring-violet-400/10'
                }`}
              >
                <div className={`h-10 w-10 shrink-0 grid place-items-center rounded-xl ${
                  notif.read 
                    ? 'bg-slate-100 text-slate-400 dark:bg-slate-800' 
                    : 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300'
                }`}>
                  <Bell size={18} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-sm font-bold ${notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Calendar size={10} />
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{notif.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
