import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  User, Shield, Eye, Bell, Globe, Info, LogOut, 
  Trash2, Upload, Check, RefreshCcw, Moon, Sun, Monitor 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function SettingsPage({ setActiveTab }) {
  const { user, token, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useNotifications();

  const [activeSubTab, setActiveSubTab] = useState('profile');

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    user?.profilePicture
      ? user.profilePicture.startsWith('/uploads')
        ? `${API_URL.replace('/api', '')}${user.profilePicture}`
        : user.profilePicture
      : null
  );
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Mock Settings States (stored in localStorage)
  const [emailNotifications, setEmailNotifications] = useState(
    localStorage.getItem('setting_email_notifications') !== 'false'
  );
  const [pushNotifications, setPushNotifications] = useState(
    localStorage.getItem('setting_push_notifications') !== 'false'
  );
  const [locationPermission, setLocationPermission] = useState(
    localStorage.getItem('setting_location_permission') !== 'false'
  );
  const [publicProfile, setPublicProfile] = useState(
    localStorage.getItem('setting_public_profile') === 'true'
  );

  // Sync settings helper
  const handleToggle = (key, val, setter) => {
    setter(val);
    localStorage.setItem(key, val);
    showToast('Settings Saved', 'Your preference has been updated.');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Validation Error', 'Name and email are required.');
      return;
    }

    setUpdatingProfile(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (avatarFile) {
        formData.append('profilePicture', avatarFile);
      }

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        // Update localStorage token
        localStorage.setItem('token', data.token);
        showToast('Success', 'Profile settings updated successfully! Please reload or verify details.');
        // Fast UI refresh
        window.location.reload();
      } else {
        showToast('Profile Update Failed', data.message || 'Error occurred.');
      }
    } catch (err) {
      console.error(err);
      showToast('Network Error', 'Connection failed.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Validation Error', 'All fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Validation Error', 'New passwords do not match.');
      return;
    }

    setUpdatingPassword(true);
    try {
      const response = await fetch(`${API_URL}/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();
      if (response.ok) {
        showToast('Success', 'Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast('Error', data.message || 'Could not update password.');
      }
    } catch (err) {
      console.error(err);
      showToast('Network Error', 'Connection failed.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText.toLowerCase() !== 'delete') {
      showToast('Validation Error', "Please type 'delete' to confirm deletion.");
      return;
    }

    setDeletingAccount(true);
    try {
      const response = await fetch(`${API_URL}/auth/account`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        showToast('Account Deleted', 'Your account has been deleted permanently.');
        logout();
      } else {
        const data = await response.json();
        showToast('Error', data.message || 'Could not delete account.');
      }
    } catch (err) {
      console.error(err);
      showToast('Network Error', 'Connection failed.');
    } finally {
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  const menuItems = [
    { id: 'profile', name: 'Profile Settings', icon: User },
    { id: 'account', name: 'Account Security', icon: Shield },
    { id: 'appearance', name: 'Theme Appearance', icon: Globe },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy Settings', icon: Eye },
    { id: 'about', name: 'About Application', icon: Info }
  ];

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="rounded-[28px] border border-white bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#0f172a]/70 backdrop-blur-xl">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Settings Portal</h2>
        <p className="text-sm text-slate-500 dark:text-white/60">Configure your profile, account preferences, alerts, and system views.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[250px_1fr]">
          {/* Sub Navigation */}
          <aside className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = activeSubTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSubTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                    active
                      ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <Icon size={16} />
                  {item.name}
                </button>
              );
            })}

            <hr className="my-3 border-slate-100 dark:border-slate-800" />
            
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 transition"
            >
              <LogOut size={16} />
              Log Out
            </button>
          </aside>

          {/* Settings Panel Content */}
          <div className="rounded-[24px] border border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/30">
            
            {/* PROFILE TAB */}
            {activeSubTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Profile Information</h3>
                
                {/* Profile Avatar Upload */}
                <div className="flex items-center gap-5">
                  <div className="relative h-20 w-20 rounded-full border border-slate-200 bg-white overflow-hidden dark:border-slate-800 shrink-0">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full grid place-items-center bg-slate-200 dark:bg-slate-800 text-slate-400">
                        <User size={32} />
                      </div>
                    )}
                  </div>
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 cursor-pointer shadow-sm hover:bg-slate-50 transition dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
                    <Upload size={14} />
                    Upload New Picture
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-500 uppercase tracking-wider">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-400 dark:border-slate-850 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-400 dark:border-slate-850 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-violet-700 transition disabled:opacity-50"
                >
                  {updatingProfile ? <RefreshCcw size={14} className="animate-spin" /> : <Check size={14} />}
                  Save Profile Details
                </button>
              </form>
            )}

            {/* ACCOUNT TAB */}
            {activeSubTab === 'account' && (
              <div className="space-y-8">
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Change Account Password</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-400 dark:border-slate-850 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-400 dark:border-slate-850 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-400 dark:border-slate-850 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-violet-700 transition disabled:opacity-50"
                  >
                    {updatingPassword ? <RefreshCcw size={14} className="animate-spin" /> : <Check size={14} />}
                    Update Security Password
                  </button>
                </form>

                <hr className="border-slate-200 dark:border-slate-800" />

                <div className="space-y-3 rounded-2xl border border-rose-100 bg-rose-50/20 p-5 dark:border-rose-500/10 dark:bg-rose-500/5">
                  <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400">Danger Zone: Delete CivicTrack AI Account</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Deletes your civic profile and reports history from database permanently. This action cannot be reverted.</p>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition"
                  >
                    <Trash2 size={14} />
                    Delete Account Permanently
                  </button>
                </div>
              </div>
            )}

            {/* APPEARANCE TAB */}
            {activeSubTab === 'appearance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">App Appearance Theme</h3>
                <p className="text-xs text-slate-500 dark:text-white/60 mt-1">Select theme layout style to apply immediately across the administration panels.</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { id: 'light', name: 'Light Theme', icon: Sun },
                    { id: 'dark', name: 'Dark Theme', icon: Moon },
                    { id: 'system', name: 'System Default', icon: Monitor }
                  ].map((option) => {
                    const Icon = option.icon;
                    const selected = theme === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setTheme(option.id)}
                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all ${
                          selected
                            ? 'border-violet-400 bg-violet-50/50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200 ring-2 ring-violet-500/20'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400'
                        }`}
                      >
                        <Icon size={24} className={selected ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'} />
                        <span className="mt-2.5 text-xs font-bold">{option.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeSubTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Email Notifications</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Receive system verification invoices and task assignments on your registered email.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={emailNotifications} 
                        onChange={(e) => handleToggle('setting_email_notifications', e.target.checked, setEmailNotifications)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Push Alert Notifications</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Enable floating real-time web toast notifications when status changes occur.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={pushNotifications} 
                        onChange={(e) => handleToggle('setting_push_notifications', e.target.checked, setPushNotifications)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* PRIVACY TAB */}
            {activeSubTab === 'privacy' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Privacy and Authorizations</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Share GPS Geolocation Permission</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Permit browser to request GPS access for automated reporting coordinate pinning.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={locationPermission} 
                        onChange={(e) => handleToggle('setting_location_permission', e.target.checked, setLocationPermission)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Publish Reports on Feed</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Let other citizens view your infrastructure reports anonymously on the Public Reports map feed.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={publicProfile} 
                        onChange={(e) => handleToggle('setting_public_profile', e.target.checked, setPublicProfile)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ABOUT TAB */}
            {activeSubTab === 'about' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">About CivicTrack AI</h3>
                <div className="space-y-4 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span>Application Version</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">v1.0.0 (Production)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span>AI Engine Model</span>
                    <span className="font-bold text-slate-800 dark:text-white">Gemini Classifier-v2</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span>Developed For</span>
                    <span className="font-bold text-slate-800 dark:text-white">Smart City Infrastructure Agency</span>
                  </div>
                  
                  <div className="pt-4 space-y-2">
                    <p className="font-bold text-slate-850 dark:text-white">Terms & Policies</p>
                    <p>By using CivicTrack AI, you consent to coordinate tracking and image pre-scans to verify and filter junk reports. For more details review our policy documents:</p>
                    <div className="flex gap-4 font-bold text-violet-600 dark:text-violet-400">
                      <a href="#" onClick={(e) => { e.preventDefault(); alert("Mock Privacy Policy"); }}>Privacy Policy</a>
                      <a href="#" onClick={(e) => { e.preventDefault(); alert("Mock Terms of Service"); }}>Terms of Service</a>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-rose-100 bg-white p-6 shadow-2xl dark:border-rose-950/30 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400">Verify Account Deletion</h3>
            <p className="text-xs text-slate-500 mt-2">This is a high-risk operation. All tickets you created, notifications, and profile details will be cleared. Enter <strong>delete</strong> below to confirm.</p>
            
            <input
              type="text"
              placeholder="Type 'delete'"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              className="mt-4 w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none dark:border-rose-950 dark:bg-slate-850 dark:text-white"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmationText(''); }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount || deleteConfirmationText.toLowerCase() !== 'delete'}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {deletingAccount && <RefreshCcw size={12} className="animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
