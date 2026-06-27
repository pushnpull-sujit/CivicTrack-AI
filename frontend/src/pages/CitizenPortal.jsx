import React, { useEffect, useMemo, useState } from 'react';
import MapView from '../components/MapView';
import { useNotifications } from '../context/NotificationContext';
import {
  CheckCircle2, Clock3, FileText, MapPin, 
  Upload, Leaf, Sparkles, ShieldCheck, 
  RefreshCcw, Eye, ArrowRight, X, DollarSign,
  Plus, MapPinned
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const supportTiles = [
  { title: 'AI Powered', description: 'Smart issue detection & categorization', icon: Sparkles },
  { title: 'Real-time Tracking', description: 'Live updates on issue progress', icon: RefreshCcw },
  { title: 'Transparent', description: 'Open data for complete transparency', icon: ShieldCheck },
  { title: 'Secure & Safe', description: 'Your data is protected and secure', icon: ShieldCheck }
];

function statusTone(status) {
  if (status === 'Completed') return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300';
  if (status === 'In Progress') return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300';
  if (status === 'Verified') return 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300';
  return 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300';
}

function priorityTone(priority) {
  if (priority === 'Critical') return 'bg-rose-500 text-white';
  if (priority === 'High') return 'bg-amber-500 text-white';
  if (priority === 'Medium') return 'bg-blue-500 text-white';
  return 'bg-slate-400 text-white';
}

function formatTime(dateValue) {
  return new Date(dateValue).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export default function CitizenPortal({ setActiveTab }) {
  const { showToast } = useNotifications();
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loadingList, setLoadingList] = useState(true);

  const summaryCounts = useMemo(() => {
    return {
      total: complaints.length,
      inProgress: complaints.filter((item) => item.status === 'In Progress').length,
      resolved: complaints.filter((item) => item.status === 'Completed').length,
      avgDays: 2.3
    };
  }, [complaints]);

  const quickStats = useMemo(() => [
    { label: 'Total Issues Reported', value: summaryCounts.total, icon: FileText, tone: 'violet' },
    { label: 'In Progress Issues', value: summaryCounts.inProgress, icon: Upload, tone: 'amber' },
    { label: 'Resolved Issues', value: summaryCounts.resolved, icon: CheckCircle2, tone: 'emerald' },
    { label: 'Avg. Resolution (Days)', value: summaryCounts.avgDays, icon: Clock3, tone: 'sky' }
  ], [summaryCounts]);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setComplaints(data);
      }
    } catch (err) {
      console.error('Fetch complaints error:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      {/* Upper Grid Layout */}
      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        
        {/* Left Column: Dashboard Welcome & History Feed */}
        <div className="space-y-6">
          {/* Welcome Banner Card */}
          <div className="rounded-[28px] border border-white bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5">
            <div className="flex items-start justify-between gap-4 rounded-[24px] bg-gradient-to-br from-violet-50 via-indigo-50 to-cyan-50 p-6 dark:from-white/5 dark:to-white/0 dark:border dark:border-white/5">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">Citizen Hub</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-white/65">Manage your reported infrastructure anomalies, explore metro maps, or request new dispatch tasks.</p>
              </div>
              <div className="hidden md:block shrink-0">
                <div className="relative h-20 w-36 overflow-hidden rounded-2xl bg-gradient-to-b from-sky-100 to-white dark:from-white/10 dark:to-white/0">
                  <div className="absolute inset-x-4 bottom-2 h-6 rounded-full bg-emerald-200/50 blur-md" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <div className="h-6 w-3 rounded-t-sm bg-sky-200" />
                    <div className="h-10 w-5 rounded-t-sm bg-sky-300" />
                    <div className="h-8 w-3 rounded-t-sm bg-sky-200" />
                    <div className="h-12 w-6 rounded-t-sm bg-sky-400" />
                    <div className="h-7 w-3 rounded-t-sm bg-sky-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick action shortcuts */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                onClick={() => setActiveTab('report-issue')}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-sm font-bold text-white shadow-md hover:brightness-105 transition"
              >
                <Plus size={16} />
                Report an Issue
              </button>
              <button
                onClick={() => setActiveTab('issue-map')}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-350 dark:hover:bg-slate-900 transition"
              >
                <MapPinned size={16} className="text-violet-500" />
                Open Map Overlays
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            {quickStats.map((stat) => {
              const Icon = stat.icon;
              const tones = {
                violet: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-200',
                amber: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-200',
                emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-200',
                sky: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-200'
              };

              return (
                <div key={stat.label} className="rounded-[24px] border border-white bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <div className={`grid h-10 w-10 place-items-center rounded-xl ${tones[stat.tone]}`}>
                    <Icon size={18} />
                  </div>
                  <p className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-white/60">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Recent History Feed */}
          <div className="rounded-[28px] border border-white bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Issue History</h3>
                <p className="text-xs text-slate-500 dark:text-white/60">Review progress status of your recent complaints.</p>
              </div>
              <button 
                onClick={() => setActiveTab('my-issues')}
                className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
              >
                View All →
              </button>
            </div>

            {loadingList ? (
              <div className="py-12 text-center text-slate-400">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                Loading history feed...
              </div>
            ) : complaints.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-550 dark:bg-slate-800 dark:text-slate-400">
                  <Eye size={20} />
                </div>
                <p className="font-semibold text-slate-700 dark:text-slate-350">No complaints reported yet.</p>
                <p className="mt-1 text-xs">File your first smart infrastructure ticket using the button above.</p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {complaints.slice(0, 3).map((cmp) => (
                  <button
                    key={cmp._id}
                    type="button"
                    onClick={() => setSelectedComplaint(cmp)}
                    className="flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-white p-3 text-left transition hover:shadow-sm hover:border-slate-200 dark:border-slate-850 dark:bg-slate-900/50 dark:hover:border-slate-800"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-855">
                      <img
                        src={cmp.imageUrlBefore?.startsWith('/uploads') ? `${API_URL.replace('/api', '')}${cmp.imageUrlBefore}` : cmp.imageUrlBefore}
                        alt={cmp.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${statusTone(cmp.status)}`}>
                          {cmp.status}
                        </span>
                      </div>
                      <p className="mt-1.5 truncate text-xs font-bold text-slate-900 dark:text-white">{cmp.title || cmp.category}</p>
                      <p className="mt-0.5 text-[10px] text-slate-400 dark:text-white/45">{formatTime(cmp.createdAt)}</p>
                    </div>
                    <div className="rounded-full border border-slate-250 p-2 text-violet-500 dark:border-slate-800 dark:text-violet-400">
                      <ArrowRight size={14} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Visual Promos & Map Overview */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Your Impact Card */}
          <div className="rounded-[28px] border border-white bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5 flex-1 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-350">
                <Leaf size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Your Civic Impact</h3>
                <p className="text-xs text-slate-500 dark:text-white/60">Thank you for making our city safer!</p>
              </div>
            </div>

            <div className="my-6 text-center">
              <p className="text-5xl font-black text-emerald-600 dark:text-emerald-400">{summaryCounts.total}</p>
              <p className="mt-1.5 text-xs font-semibold text-slate-500 dark:text-white/55">Active Reports Submitted</p>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                You’re a Community Hero! 🎉
              </div>
            </div>
          </div>

          {/* Interactive Map Promo Card */}
          <div className="overflow-hidden rounded-[28px] border border-violet-300/10 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 text-white shadow-[0_24px_70px_rgba(91,33,182,0.2)] flex-1 flex flex-col justify-between relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">Smart Incident Map</h3>
                <p className="mt-1 text-xs text-white/70">Inspect active work sites and repair updates pinned around your sector.</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 shrink-0">
                <MapPin size={20} />
              </div>
            </div>

            <div className="mt-8">
              <button 
                onClick={() => setActiveTab('issue-map')}
                className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-violet-600 shadow-md hover:bg-slate-50 transition"
              >
                Open Map View
              </button>
            </div>
            <div className="pointer-events-none absolute right-4 bottom-2 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
          </div>
        </div>
      </section>

      {/* Support informational tiles */}
      <section className="grid gap-3 rounded-[28px] border border-white bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] md:grid-cols-2 xl:grid-cols-4 dark:border-white/10 dark:bg-white/5">
        {supportTiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <div key={tile.title} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/30 dark:border dark:border-white/5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-450 shrink-0">
                <Icon size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{tile.title}</p>
                <p className="text-[10px] text-slate-500 dark:text-white/60 leading-normal mt-0.5">{tile.description}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Details Inspector Modal (shared layout for visual consistency) */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[28px] border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400">{selectedComplaint._id}</span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{selectedComplaint.title || selectedComplaint.category}</h3>
              </div>
              <button 
                onClick={() => setSelectedComplaint(null)}
                className="rounded-full border border-slate-200 p-1.5 text-slate-400 hover:text-slate-600 dark:border-slate-800 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Incident Photos</p>
                  <div className="grid gap-2 grid-cols-2">
                    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative bg-slate-100">
                      <img 
                        src={selectedComplaint.imageUrlBefore?.startsWith('/uploads') ? `${API_URL.replace('/api', '')}${selectedComplaint.imageUrlBefore}` : selectedComplaint.imageUrlBefore}
                        alt="Before report"
                        className="h-36 w-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 text-[9px] font-bold text-white rounded">Before</span>
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative bg-slate-100">
                      {selectedComplaint.imageUrlAfter ? (
                        <img 
                          src={selectedComplaint.imageUrlAfter?.startsWith('/uploads') ? `${API_URL.replace('/api', '')}${selectedComplaint.imageUrlAfter}` : selectedComplaint.imageUrlAfter}
                          alt="After repair"
                          className="h-36 w-full object-cover"
                        />
                      ) : (
                        <div className="h-36 w-full flex flex-col items-center justify-center text-slate-400 p-3 text-center bg-slate-50 dark:bg-slate-850">
                          <Clock3 size={20} className="mb-1 text-slate-300" />
                          <p className="text-[9px] font-bold">Repair Image Pending</p>
                        </div>
                      )}
                      <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 text-[9px] font-bold text-white rounded">After</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-150 dark:border-slate-850">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Geo Coordinates Location</p>
                  <p className="text-xs text-slate-800 dark:text-slate-350 flex items-center gap-1">
                    <MapPin size={12} className="text-violet-500" />
                    Latitude: {selectedComplaint.latitude ? selectedComplaint.latitude.toFixed(5) : '0.00'}
                  </p>
                  <p className="text-xs text-slate-800 dark:text-slate-350 flex items-center gap-1">
                    <MapPin size={12} className="text-violet-500" />
                    Longitude: {selectedComplaint.longitude ? selectedComplaint.longitude.toFixed(5) : '0.00'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-150 dark:border-slate-850">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Current Status</span>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${statusTone(selectedComplaint.status)}`}>
                      {selectedComplaint.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Severity Class</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      selectedComplaint.severity === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                    }`}>{selectedComplaint.severity}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Assigned Priority</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] text-white ${priorityTone(selectedComplaint.priority)}`}>
                      {selectedComplaint.priority}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Diagnostics Features</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedComplaint.detectedFeatures && selectedComplaint.detectedFeatures.map(feat => (
                      <span key={feat} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full dark:bg-indigo-900/20 dark:text-indigo-300 font-semibold border border-indigo-100/30">{feat}</span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Complaint Description</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-white p-3 rounded-xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800">{selectedComplaint.description}</p>
                </div>

                {selectedComplaint.status === 'Completed' && (
                  <div className="space-y-2.5 p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl dark:bg-emerald-950/15 dark:border-emerald-500/10">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-800 dark:text-emerald-400">Resolution Invoice Cost</span>
                      <span className="font-bold text-slate-900 dark:text-white flex items-center">
                        <DollarSign size={12} />
                        {selectedComplaint.repairCost ? selectedComplaint.repairCost.toFixed(2) : '150.00'}
                      </span>
                    </div>
                    {selectedComplaint.repairNotes && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold block text-[10px] text-emerald-700 dark:text-emerald-500 uppercase tracking-wider">Staff Completion Note:</span>
                        {selectedComplaint.repairNotes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-4 flex justify-end dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="rounded-xl bg-slate-900 text-white px-5 py-2.5 text-xs font-bold hover:bg-slate-850 dark:bg-white dark:text-slate-900 transition"
              >
                Dismiss Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}