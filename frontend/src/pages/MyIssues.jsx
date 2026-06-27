import React, { useEffect, useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { 
  ArrowLeft, Clock, CheckCircle, AlertTriangle, Eye, Calendar, 
  MapPin, DollarSign, Activity, FileText, X 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function MyIssues() {
  const { showToast } = useNotifications();
  const [complaints, setComplaints] = useState([]);
  const [selectedCmp, setSelectedCmp] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
      console.error(err);
      showToast('Error', 'Failed to retrieve your issues feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const statusTone = (status) => {
    if (status === 'Completed') return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300';
    if (status === 'In Progress') return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300';
    if (status === 'Verified') return 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300';
    return 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300';
  };

  const priorityTone = (priority) => {
    if (priority === 'Critical') return 'bg-rose-500 text-white';
    if (priority === 'High') return 'bg-amber-500 text-white';
    if (priority === 'Medium') return 'bg-blue-500 text-white';
    return 'bg-slate-400 text-white';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Filter complaints list
  const filteredComplaints = complaints.filter(cmp => {
    const matchesStatus = !statusFilter || cmp.status === statusFilter;
    const matchesCategory = !categoryFilter || cmp.category === categoryFilter;
    const matchesPriority = !priorityFilter || cmp.priority === priorityFilter;
    const matchesSearch = !searchQuery || 
      cmp._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cmp.title && cmp.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cmp.description && cmp.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesCategory && matchesPriority && matchesSearch;
  });

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="rounded-[28px] border border-white bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#0f172a]/70 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">My Reported Issues</h2>
            <p className="text-sm text-slate-500 dark:text-white/60">View history and real-time repair progress of issues you filed.</p>
          </div>
          <button 
            onClick={fetchComplaints} 
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <Activity size={14} className="text-violet-500" />
            Refresh Feed
          </button>
        </div>

        {/* Filters */}
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <input
            type="text"
            placeholder="Search by ticket ID or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs outline-none focus:border-violet-400 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending Verification</option>
            <option value="Verified">Verified</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed / Resolved</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <option value="">All Categories</option>
            <option value="Pothole">Pothole</option>
            <option value="Broken Streetlight">Broken Streetlight</option>
            <option value="Road Damage">Road Damage</option>
            <option value="Water Leakage">Water Leakage</option>
            <option value="Garbage">Garbage</option>
            <option value="Sewer Overflow">Sewer Overflow</option>
            <option value="Park / Playground">Park / Playground</option>
            <option value="Other">Other Anomaly</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Complaints Listing */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            Fetching history database...
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">No reported issues found</p>
            <p className="text-xs mt-1">Try adjusting your filters or submit a new report issue.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {filteredComplaints.map((cmp) => (
              <div 
                key={cmp._id}
                className="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/30 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900/40 flex flex-col"
              >
                <div className="h-44 bg-slate-100 dark:bg-slate-800 relative">
                  <img 
                    src={cmp.imageUrlBefore?.startsWith('/uploads') ? `${API_URL.replace('/api', '')}${cmp.imageUrlBefore}` : cmp.imageUrlBefore}
                    alt={cmp.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${priorityTone(cmp.priority)}`}>
                      {cmp.priority}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase shadow-sm ${statusTone(cmp.status)}`}>
                      {cmp.status}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">{cmp._id}</span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{cmp.title || cmp.category}</h3>
                    <p className="text-xs text-slate-500 dark:text-white/60 line-clamp-2">{cmp.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(cmp.createdAt)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedCmp(cmp)}
                      className="flex items-center gap-1 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-violet-750 transition"
                    >
                      <Eye size={12} />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Inspector Modal */}
      {selectedCmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[28px] border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400">{selectedCmp._id}</span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{selectedCmp.title || selectedCmp.category}</h3>
              </div>
              <button 
                onClick={() => setSelectedCmp(null)}
                className="rounded-full border border-slate-200 p-1.5 text-slate-400 hover:text-slate-600 dark:border-slate-800 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {/* Left Column: Photos & Location */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Incident Photos</p>
                  <div className="grid gap-2 grid-cols-2">
                    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative bg-slate-100">
                      <img 
                        src={selectedCmp.imageUrlBefore?.startsWith('/uploads') ? `${API_URL.replace('/api', '')}${selectedCmp.imageUrlBefore}` : selectedCmp.imageUrlBefore}
                        alt="Before report"
                        className="h-36 w-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 text-[9px] font-bold text-white rounded">Before</span>
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative bg-slate-100">
                      {selectedCmp.imageUrlAfter ? (
                        <img 
                          src={selectedCmp.imageUrlAfter?.startsWith('/uploads') ? `${API_URL.replace('/api', '')}${selectedCmp.imageUrlAfter}` : selectedCmp.imageUrlAfter}
                          alt="After repair"
                          className="h-36 w-full object-cover"
                        />
                      ) : (
                        <div className="h-36 w-full flex flex-col items-center justify-center text-slate-400 p-3 text-center bg-slate-50 dark:bg-slate-850">
                          <Clock size={20} className="mb-1 text-slate-300" />
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
                    Latitude: {selectedCmp.latitude.toFixed(5)}
                  </p>
                  <p className="text-xs text-slate-800 dark:text-slate-350 flex items-center gap-1">
                    <MapPin size={12} className="text-violet-500" />
                    Longitude: {selectedCmp.longitude.toFixed(5)}
                  </p>
                </div>
              </div>

              {/* Right Column: AI Diagnoses & Status */}
              <div className="space-y-4">
                <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-150 dark:border-slate-850">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Current Status</span>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${statusTone(selectedCmp.status)}`}>
                      {selectedCmp.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Severity Class</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      selectedCmp.severity === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                    }`}>{selectedCmp.severity}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Assigned Priority</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] text-white ${priorityTone(selectedCmp.priority)}`}>
                      {selectedCmp.priority}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Diagnostics Features</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCmp.detectedFeatures && selectedCmp.detectedFeatures.map(feat => (
                      <span key={feat} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full dark:bg-indigo-900/20 dark:text-indigo-300 font-semibold border border-indigo-100/30">{feat}</span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Complaint Description</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-white p-3 rounded-xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800">{selectedCmp.description}</p>
                </div>

                {selectedCmp.status === 'Completed' && (
                  <div className="space-y-2.5 p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl dark:bg-emerald-950/15 dark:border-emerald-500/10">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-800 dark:text-emerald-400">Resolution Invoice Cost</span>
                      <span className="font-bold text-slate-900 dark:text-white flex items-center">
                        <DollarSign size={12} />
                        {selectedCmp.repairCost ? selectedCmp.repairCost.toFixed(2) : '150.00'}
                      </span>
                    </div>
                    {selectedCmp.repairNotes && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold block text-[10px] text-emerald-700 dark:text-emerald-500 uppercase tracking-wider">Staff Completion Note:</span>
                        {selectedCmp.repairNotes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-4 flex justify-end dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedCmp(null)}
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
