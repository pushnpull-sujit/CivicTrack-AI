import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  Terminal,
  User,
  MapPinned,
  FileText,
  Building2,
  Home,
  LifeBuoy,
  Radio
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function DashboardLayout({ children, activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = useMemo(() => {
    const items = [];

    if (user?.role === 'citizen') {
      items.push({ id: 'citizen-portal', name: 'Dashboard', icon: Home });
      items.push({ id: 'report-issue', name: 'Report Issue', icon: MapPinned });
      items.push({ id: 'my-issues', name: 'My Issues', icon: FileText });
    } else if (user?.role === 'admin') {
      items.push({ id: 'admin-dashboard', name: 'Dashboard', icon: Home });
      items.push({ id: 'analytics', name: 'Analytics', icon: FileText });
      items.push({ id: 'debug-emails', name: 'Email Log', icon: Radio });
    } else if (user?.role === 'staff') {
      items.push({ id: 'staff-dashboard', name: 'Dashboard', icon: Home });
    }

    items.push({ id: 'issue-map', name: 'Issue Map', icon: MapPinned });
    items.push({ id: 'notifications', name: 'Notifications', icon: Bell });
    items.push({ id: 'public-reports', name: 'Public Reports', icon: Radio });
    items.push({ id: 'help', name: 'FAQ & Help', icon: LifeBuoy });
    items.push({ id: 'settings', name: 'Settings', icon: Settings });

    return items;
  }, [user?.role]);

  const panel = (
    <>
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-violet-500/20">
          <Building2 size={22} />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-[18px] font-extrabold tracking-tight text-white">CivicTrack AI</h1>
          <p className="text-[11px] text-white/60">Smart Infrastructure</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;

          return (
            <button
              key={`${item.id}-${item.name}`}
              type="button"
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                active
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20'
                  : 'text-white/72 hover:bg-white/8 hover:text-white'
              }`}
            >
              <Icon size={18} className={active ? 'text-white' : 'text-white/60'} />
              {item.name}
            </button>
          );
        })}

        <div className="mt-6 px-3">
          <div className="rounded-3xl border border-white/10 bg-white/6 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white overflow-hidden shrink-0">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture.startsWith('/uploads') ? `${API_URL.replace('/api', '')}${user.profilePicture}` : user.profilePicture}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={18} />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{user?.name}</p>
                <p className="text-xs text-white/55 capitalize">{user?.role}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-xs font-bold text-white/80 transition hover:bg-white/10"
            >
              <LogOut size={14} />
              Log Out
            </button>
          </div>
        </div>
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f4f7fc] text-slate-900 dark:bg-[#071326] dark:text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-[250px] shrink-0 flex-col bg-[#071126] text-white shadow-[0_30px_80px_rgba(3,8,25,0.55)] lg:flex">
          {panel}
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col bg-[#071126] text-white shadow-[0_30px_80px_rgba(3,8,25,0.55)] transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex items-center justify-end px-4 pt-4">
            <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-xl p-2 text-white/70 hover:bg-white/8 hover:text-white">
              ✕
            </button>
          </div>
          {panel}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-30 border-b border-white/70 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-[#071326]/90">
            <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-7">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm lg:hidden"
              >
                <Menu size={18} />
              </button>

              <div className="hidden items-start gap-4 sm:flex">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Good Evening, {user?.name?.split(' ')[0]?.toLowerCase() || 'there'}! 👋
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-white/60">Let's make our city better together.</p>
                </div>
              </div>

              <div className="flex-1 lg:px-8">
                <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/8">
                  <Search size={18} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search issues, IDs, or locations..."
                    className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-white/45"
                  />
                  <div className="hidden rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-400 sm:block dark:border-white/10 dark:text-white/40">
                    ⌘ K
                  </div>
                </div>
              </div>

              <div className="ml-auto flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/8 dark:text-white/70"
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('notifications')}
                  className="relative grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/8 dark:text-white/70"
                  title="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-1 grid h-5 w-5 place-items-center rounded-full bg-violet-500 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm dark:border-white/10 dark:bg-white/8 text-left"
                  title="View Profile Settings"
                >
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-md shadow-violet-500/20 overflow-hidden shrink-0">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture.startsWith('/uploads') ? `${API_URL.replace('/api', '')}${user.profilePicture}` : user.profilePicture}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-sm font-bold leading-none text-slate-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-white/55 capitalize">{user?.role}</p>
                  </div>
                  <ChevronDown size={16} className="mr-1 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className="hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm lg:grid dark:border-white/10 dark:bg-white/8 dark:text-white/65"
                  title="Settings"
                >
                  <Settings size={18} />
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-7">
            <div className="mx-auto max-w-[1280px] space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}