import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const STREAM_URL = API_URL.replace('/api', '') + '/api/notifications/stream';

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [debugEmails, setDebugEmails] = useState([]);
  const [sseListeners, setSseListeners] = useState([]);

  // Subscribe to real-time events when user is logged in
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setDebugEmails([]);
      return;
    }

    console.log('Connecting to SSE stream at:', STREAM_URL);
    const eventSource = new EventSource(STREAM_URL);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { type, data } = payload;

        if (type === 'notification') {
          // Check if notification belongs to current user
          if (data.userId === user.id) {
            setNotifications(prev => [data, ...prev]);
            setUnreadCount(prev => prev + 1);
            showToast(data.title, data.message);
          }
        } else if (type === 'email_debug') {
          setDebugEmails(prev => [data, ...prev]);
        } else {
          // Broadcast to other components listening for database changes (like complaints list update)
          sseListeners.forEach(listener => listener(type, data));
        }
      } catch (err) {
        console.error('SSE Message parsing error:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE connection error, retrying...', err);
    };

    // Load initial debug emails (only if Admin)
    if (user.role === 'admin') {
      const token = localStorage.getItem('token');
      fetch(`${API_URL}/debug/emails`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : [])
      .then(data => setDebugEmails(data))
      .catch(err => console.error('Fetch debug emails error:', err));
    }

    return () => {
      eventSource.close();
      console.log('SSE Stream closed.');
    };
  }, [user, sseListeners]);

  // Show visual toast popup
  const showToast = (title, message) => {
    setToast({ title, message });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  // Add listener for general SSE events (complaint creation, updates)
  const subscribeToSse = (callback) => {
    setSseListeners(prev => [...prev, callback]);
    return () => {
      setSseListeners(prev => prev.filter(l => l !== callback));
    };
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      toast,
      debugEmails,
      markAllAsRead,
      clearNotifications,
      subscribeToSse,
      showToast
    }}>
      {children}

      {/* Floating Toast Notification Popups */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white dark:bg-slate-800 shadow-2xl rounded-xl border border-indigo-100 dark:border-slate-700 p-4 transition-all duration-300 transform translate-y-0 animate-bounce-short">
          <div className="flex items-start">
            <span className="text-2xl mr-3">🔔</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{toast.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
