import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenPortal from './pages/CitizenPortal';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import DebugEmails from './pages/DebugEmails';
import APIDocs from './pages/APIDocs';
import ReportIssue from './pages/ReportIssue';
import SettingsPage from './pages/SettingsPage';
import MyIssues from './pages/MyIssues';
import IssueMap from './pages/IssueMap';
import NotificationsPage from './pages/NotificationsPage';
import PublicReports from './pages/PublicReports';
import FAQHelp from './pages/FAQHelp';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Sync active tab to user role when user changes
  useEffect(() => {
    if (user) {
      if (user.role === 'citizen') {
        setActiveTab('citizen-portal');
      } else if (user.role === 'admin') {
        setActiveTab('admin-dashboard');
      } else if (user.role === 'staff') {
        setActiveTab('staff-dashboard');
      }
    } else {
      setActiveTab('');
    }
  }, [user]);

  // Loading spinner on verification checks
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest font-bold text-slate-400">Verifying session...</p>
      </div>
    );
  }

  // Auth Guard
  if (!user) {
    return isRegistering ? (
      <Register onLoginRedirect={() => setIsRegistering(false)} />
    ) : (
      <Login onRegisterRedirect={() => setIsRegistering(true)} />
    );
  }

  // Render correct child page tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'citizen-portal':
        return <CitizenPortal setActiveTab={setActiveTab} />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'staff-dashboard':
        return <StaffDashboard />;
      case 'report-issue':
        return <ReportIssue setActiveTab={setActiveTab} />;
      case 'my-issues':
        return <MyIssues />;
      case 'issue-map':
        return <IssueMap />;
      case 'notifications':
        return <NotificationsPage />;
      case 'public-reports':
        return <PublicReports />;
      case 'help':
        return <FAQHelp />;
      case 'settings':
        return <SettingsPage setActiveTab={setActiveTab} />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'debug-emails':
        return <DebugEmails />;
      case 'api-docs':
        return <APIDocs />;
      default:
        return (
          <div className="py-24 text-center text-slate-500">
            <h3 className="font-bold text-sm">Welcome to CivicTrack AI</h3>
            <p className="text-xs mt-1">Select a workspace tab from the navigation sidebar to begin.</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderTabContent()}
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
