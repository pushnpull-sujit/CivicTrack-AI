import React, { useState, useEffect } from 'react';
import MapView from '../components/MapView';
import { useNotifications } from '../context/NotificationContext';
import { 
  Hammer, CheckCircle, Clock, AlertTriangle, Image, 
  MapPin, User, ChevronRight, BookOpen, Send 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function StaffDashboard() {
  const { subscribeToSse } = useNotifications();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  // Resolution Form State
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [afterImageFile, setAfterImageFile] = useState(null);
  const [afterImagePreview, setAfterImagePreview] = useState(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch staff tasks
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/complaints`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Fetch tasks error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    // Subscribe to SSE real-time notifications for assigned tasks update
    const unsubscribe = subscribeToSse((type, data) => {
      if (type === 'complaint_updated') {
        fetchTasks();
        if (selectedTask && selectedTask._id === data._id) {
          setSelectedTask(data);
        }
      }
    });

    return () => unsubscribe();
  }, [selectedTask]);

  // Set task In Progress
  const handleStartTask = async () => {
    if (!selectedTask) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/complaints/${selectedTask._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'In Progress' })
      });

      if (response.ok) {
        const updated = await response.json();
        setSelectedTask(updated);
        setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
        alert('Work started! Status updated to In Progress.');
      } else {
        alert('Status transition failed.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  // Upload Completion photo selector
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAfterImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAfterImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Resolution Completed data
  const handleResolveTask = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    if (!resolutionNotes) {
      alert('Please input resolution notes.');
      return;
    }

    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('status', 'Completed');
      formData.append('repairNotes', resolutionNotes);
      // Backend automatically defaults repair cost to 0 if not set, or let's use a nominal fallback cost (e.g. 150)
      formData.append('repairCost', '150.00'); 
      if (afterImageFile) {
        formData.append('image', afterImageFile);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/complaints/${selectedTask._id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const updated = await response.json();
        setSelectedTask(updated);
        setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
        // Reset local completion form
        setResolutionNotes('');
        setAfterImageFile(null);
        setAfterImagePreview(null);
        alert('Task completed and closed! Citizen notified via email invoice.');
      } else {
        alert('Error completing task.');
      }
    } catch (err) {
      console.error(err);
      alert('Resolution upload network error.');
    } finally {
      setUpdating(false);
    }
  };

  // Group tasks client side
  const activeTasks = tasks.filter(t => t.status !== 'Completed');
  const completedTasks = tasks.filter(t => t.status === 'Completed');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN: List of Tasks (Active & History) */}
      <section className="lg:col-span-5 space-y-6">
        
        {/* Active Assignments Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>👷</span> Assigned Work Orders
          </h2>
          <div className="flex gap-2 text-[10px] font-bold">
            <span className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 px-3 py-1 rounded-full border border-amber-100/50">
              {activeTasks.length} Outstanding
            </span>
            <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100/50">
              {completedTasks.length} Resolved
            </span>
          </div>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 rounded-3xl">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading assigned tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 rounded-3xl">
            <span className="text-3xl">🎉</span>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-350 mt-2">All caught up!</p>
            <p className="text-xs text-slate-500 mt-0.5">No work orders currently assigned to your account.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            
            {/* RENDER ACTIVE TASKS */}
            {activeTasks.length > 0 && (
              <div className="space-y-2">
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Active Tasks</p>
                {activeTasks.map(t => {
                  const active = selectedTask?._id === t._id;
                  return (
                    <button
                      key={t._id}
                      onClick={() => setSelectedTask(t)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                        active 
                          ? 'bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-500 dark:border-indigo-400 shadow-md' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-extrabold uppercase bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded text-slate-500">
                          {t._id}
                        </span>
                        <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          t.status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-850 dark:text-slate-150 truncate mb-1">{t.title || t.category}</h4>
                      <div className="flex justify-between items-center text-[8px] font-semibold text-slate-400">
                        <span className="text-slate-500">Priority: {t.priority}</span>
                        <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* RENDER COMPLETED TASKS */}
            {completedTasks.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Completed Work History</p>
                {completedTasks.map(t => {
                  const active = selectedTask?._id === t._id;
                  return (
                    <button
                      key={t._id}
                      onClick={() => setSelectedTask(t)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                        active 
                          ? 'bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-500 dark:border-indigo-400 shadow-md' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-extrabold uppercase bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded text-slate-500">
                          {t._id}
                        </span>
                        <span className="text-[8px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Resolved
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-850 dark:text-slate-150 truncate mb-1">{t.title || t.category}</h4>
                      <p className="text-[8px] text-slate-400">Completed on: {new Date(t.completionDate).toLocaleDateString()}</p>
                    </button>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </section>

      {/* RIGHT COLUMN: Operational Details & Form resolution */}
      <section className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        {selectedTask ? (
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="border-b border-slate-150 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs bg-slate-100 dark:bg-slate-950 text-slate-500 px-2 py-0.5 rounded font-extrabold uppercase">
                  {selectedTask._id}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  selectedTask.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                  selectedTask.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {selectedTask.status}
                </span>
                <span className="text-xs font-bold text-slate-400 ml-auto">Priority: {selectedTask.priority}</span>
              </div>
              <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">
                {selectedTask.title || selectedTask.category}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Reported location coordinates: ({selectedTask.latitude}, {selectedTask.longitude})</p>
            </div>

            {/* Focused GPS Map marker */}
            <div className="h-44 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <MapView 
                complaints={[selectedTask]}
                zoom={14}
                center={[selectedTask.latitude, selectedTask.longitude]}
                interactive={true}
              />
            </div>

            {/* Before Photo & description details */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4">
                <p className="text-[10px] font-bold text-slate-400 mb-1">Issue Photo</p>
                <div className="h-28 rounded-xl overflow-hidden border border-slate-200">
                  <img 
                    src={selectedTask.imageUrlBefore.startsWith('/uploads') ? `${API_URL.replace('/api', '')}${selectedTask.imageUrlBefore}` : selectedTask.imageUrlBefore} 
                    alt="Issue" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
              
              <div className="md:col-span-8 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 mb-1">Citizen Comments</p>
                  <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">
                    "{selectedTask.description || 'No description comments provided.'}"
                  </p>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 text-[10px] text-slate-500 space-y-0.5 mt-4">
                  <div className="flex items-center gap-1.5"><User size={12} /> <span className="font-bold">Citizen:</span> {selectedTask.citizenName} ({selectedTask.citizenEmail})</div>
                  <div className="flex items-center gap-1.5"><MapPin size={12} /> <span className="font-bold">Category:</span> {selectedTask.category} (AI Confidence: {(selectedTask.confidence*100).toFixed(0)}%)</div>
                </div>
              </div>
            </div>

            {/* ACTION 1: Set In Progress if only Verified */}
            {selectedTask.status === 'Verified' && (
              <button
                onClick={handleStartTask}
                disabled={updating}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 shadow-lg shadow-indigo-500/10"
              >
                <Hammer size={14} /> Start Task / Mark In Progress
              </button>
            )}

            {/* ACTION 2: Submit completion report if In Progress */}
            {selectedTask.status === 'In Progress' && (
              <form onSubmit={handleResolveTask} className="border-t border-slate-150 dark:border-slate-800 pt-4 space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Close Ticket Order Form</p>
                
                {/* Upload work completion photo */}
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Work Completed Photo</label>
                  <div className="relative border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 bg-slate-50 dark:bg-slate-950/20">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {afterImagePreview ? (
                      <div className="w-14 h-14 rounded overflow-hidden border border-slate-350 shadow">
                        <img src={afterImagePreview} alt="Work completed" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <Image className="text-slate-450 dark:text-slate-650" size={32} />
                    )}
                    <div className="text-left">
                      <p className="font-semibold text-slate-600 dark:text-slate-350">Upload work completed photo</p>
                      <p className="text-[9px] text-slate-400">Click to locate files</p>
                    </div>
                  </div>
                </div>

                {/* Resolution Notes */}
                <div className="space-y-1 text-xs font-bold">
                  <label className="text-slate-700 dark:text-slate-300 block mb-1">Maintenance Resolution Notes</label>
                  <textarea
                    required
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Describe repair adjustments executed (e.g. Cleared site debris, completed wiring rebuild)"
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-medium text-slate-800 dark:text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                >
                  <Send size={12} /> Submit Completion Report
                </button>
              </form>
            )}

            {/* ACTION 3: Read-only completion info */}
            {selectedTask.status === 'Completed' && (
              <div className="border-t border-slate-150 dark:border-slate-800 pt-4 space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Work Resolution Report Invoice</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400">Completed Work Photo</p>
                    <div className="h-32 rounded-xl overflow-hidden border border-slate-200">
                      {selectedTask.imageUrlAfter ? (
                        <img 
                          src={selectedTask.imageUrlAfter.startsWith('/uploads') ? `${API_URL.replace('/api', '')}${selectedTask.imageUrlAfter}` : selectedTask.imageUrlAfter} 
                          alt="After" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
                          No photo uploaded.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-emerald-50/50 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 text-xs flex flex-col justify-center gap-1.5">
                    <p className="text-[9px] uppercase font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle size={12} /> Verification Completed
                    </p>
                    <p><span className="font-bold text-slate-500">Completed Date:</span> {new Date(selectedTask.completionDate).toLocaleDateString()}</p>
                    <p><span className="font-bold text-slate-500">Repair Cost Invoice:</span> $150.00</p>
                  </div>
                </div>
                
                <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-850 rounded-xl text-xs text-slate-600 dark:text-slate-350">
                  <p className="text-[9px] text-slate-400 mb-0.5">Resolution Notes</p>
                  <p className="font-semibold italic leading-relaxed">"{selectedTask.repairNotes}"</p>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="py-24 text-center text-slate-400">
            <span className="text-4xl">📋</span>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-2">No task selected</p>
            <p className="text-xs text-slate-500 mt-1">Select an assigned ticket order from the navigator lists to inspect directions and execute resolving repairs.</p>
          </div>
        )}
      </section>

    </div>
  );
}
