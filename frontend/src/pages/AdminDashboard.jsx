import React, { useState, useEffect } from 'react';
import MapView from '../components/MapView';
import { useNotifications } from '../context/NotificationContext';
import { 
  Filter, UserCheck, AlertCircle, Edit3, Image, 
  DollarSign, Check, Hammer, Clock, RefreshCw, Eye
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
  const { subscribeToSse } = useNotifications();
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedCmp, setSelectedCmp] = useState(null);

  // Filters state
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Repair completions form state
  const [repairNotes, setRepairNotes] = useState('');
  const [repairCost, setRepairCost] = useState('');
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
  const [afterImageFile, setAfterImageFile] = useState(null);
  const [afterImagePreview, setAfterImagePreview] = useState(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [updatingTask, setUpdatingTask] = useState(false);

  // Fetch complaints
  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/complaints`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setComplaints(data);
      }
    } catch (err) {
      console.error('Fetch complaints error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff directory
  const fetchStaffList = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/staff`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStaffList(data);
      }
    } catch (err) {
      console.error('Fetch staff error:', err);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchStaffList();

    // Subscribe to SSE updates for auto-refresh dashboard data in real-time
    const unsubscribe = subscribeToSse((type, data) => {
      console.log('SSE update received in admin board:', type, data);
      fetchComplaints(); // reload complaints list
      if (selectedCmp && selectedCmp._id === data._id) {
        setSelectedCmp(data); // update detailed focus
      }
    });

    return () => unsubscribe();
  }, [selectedCmp]);

  // Handle staff assignment
  const handleAssignStaff = async (staffId) => {
    if (!selectedCmp) return;
    setUpdatingTask(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/complaints/${selectedCmp._id}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ assignedStaffId: staffId })
      });

      if (response.ok) {
        const updated = await response.json();
        setSelectedCmp(updated);
        setComplaints(prev => prev.map(c => c._id === updated._id ? updated : c));
        alert('Staff assigned successfully! Real-time notifications dispatched.');
      } else {
        alert('Assignment failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating assignment.');
    } finally {
      setUpdatingTask(false);
    }
  };

  // Handle status update
  const handleStatusChange = async (newStatus) => {
    if (!selectedCmp) return;
    setUpdatingTask(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/complaints/${selectedCmp._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const updated = await response.json();
        setSelectedCmp(updated);
        setComplaints(prev => prev.map(c => c._id === updated._id ? updated : c));
        alert(`Status updated to: ${newStatus}`);
      } else {
        alert('Status update failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Error changing status.');
    } finally {
      setUpdatingTask(false);
    }
  };

  // Handle image selections for repair completions
  const handleAfterImageChange = (e) => {
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

  // Handle submitting repair completion values
  const handleCompleteRepair = async (e) => {
    e.preventDefault();
    if (!selectedCmp) return;
    if (!repairNotes || !repairCost) {
      alert('Please fill out all completion fields.');
      return;
    }

    setUpdatingTask(true);
    try {
      const formData = new FormData();
      formData.append('status', 'Completed');
      formData.append('repairNotes', repairNotes);
      formData.append('repairCost', repairCost);
      formData.append('completionDate', completionDate);
      if (afterImageFile) {
        formData.append('image', afterImageFile);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/complaints/${selectedCmp._id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const updated = await response.json();
        setSelectedCmp(updated);
        setComplaints(prev => prev.map(c => c._id === updated._id ? updated : c));
        // Reset completion form
        setRepairNotes('');
        setRepairCost('');
        setAfterImageFile(null);
        setAfterImagePreview(null);
        alert('Ticket successfully resolved and closed. Citizen notified via email invoice.');
      } else {
        alert('Could not complete ticket resolution.');
      }
    } catch (err) {
      console.error(err);
      alert('Resolution update network error.');
    } finally {
      setUpdatingTask(false);
    }
  };

  // Filter complaints client-side
  const filteredComplaints = complaints.filter(c => {
    const matchesStatus = !statusFilter || c.status === statusFilter;
    const matchesCategory = !categoryFilter || c.category === categoryFilter;
    const matchesPriority = !priorityFilter || c.priority === priorityFilter;
    const matchesSearch = !searchQuery || 
      c._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesCategory && matchesPriority && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* FILTER PANEL ROWS */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-indigo-500" />
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Filter Infrastructure Inbound</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
          {/* Search bar */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Ticket ID or description..."
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 transition text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium"
          />

          {/* Status dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-350"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending Verification</option>
            <option value="Verified">Verified / Dispatched</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed Repairs</option>
          </select>

          {/* Category dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-350"
          >
            <option value="">All Categories</option>
            <option value="Pothole">Potholes</option>
            <option value="Broken Streetlight">Streetlight Issues</option>
            <option value="Water Leakage">Water Leaks</option>
            <option value="Garbage">Garbage Dumping</option>
            <option value="Road Damage">Road & Pavement Damage</option>
            <option value="Other">Other Anomalies</option>
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-350"
          >
            <option value="">All Priorities</option>
            <option value="Critical">Critical Priority</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </section>

      {/* DASHBOARD SPLIT AREA: Map left, Inspector right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Map View Frame */}
        <section className="lg:col-span-7 h-[580px] relative">
          <MapView 
            complaints={filteredComplaints}
            zoom={13}
            center={[37.7749, -122.4194]}
            onMarkerClick={handleMapClick}
          />
        </section>

        {/* Details Inspector Panel */}
        <section className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 max-h-[580px] overflow-y-auto">
          {selectedCmp ? (
            <div className="space-y-5">
              
              {/* Heading title */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-extrabold bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded text-slate-500 uppercase">
                      {selectedCmp._id}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                      selectedCmp.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                      selectedCmp.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedCmp.status}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{selectedCmp.title || selectedCmp.category}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Reported by Sarah Citizen | {new Date(selectedCmp.createdAt).toLocaleDateString()}</p>
                </div>
                
                {/* Floating priority tag */}
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  selectedCmp.priority === 'Critical' ? 'bg-red-600 text-white animate-pulse-critical' :
                  selectedCmp.priority === 'High' ? 'bg-amber-500 text-white' :
                  selectedCmp.priority === 'Medium' ? 'bg-blue-600 text-white' :
                  'bg-slate-500 text-white'
                }`}>
                  {selectedCmp.priority}
                </span>
              </div>

              {/* Before image & description details */}
              <div className="space-y-3">
                <div className="h-36 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                  <img 
                    src={selectedCmp.imageUrlBefore.startsWith('/uploads') ? `${API_URL.replace('/api', '')}${selectedCmp.imageUrlBefore}` : selectedCmp.imageUrlBefore} 
                    alt="Before Repair" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                  {selectedCmp.description || 'No description provided.'}
                </p>
              </div>

              {/* AI diagnostic readout */}
              <div className="bg-indigo-50/20 dark:bg-slate-950/40 p-4 border border-indigo-100/50 dark:border-slate-850 rounded-2xl text-[10px] text-slate-600 dark:text-slate-400 space-y-2">
                <p className="font-extrabold uppercase text-indigo-500 tracking-wider">AI Diagnostic Analysis</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <div><span className="font-bold">Detected:</span> {selectedCmp.category} ({(selectedCmp.confidence * 100).toFixed(0)}%)</div>
                  <div><span className="font-bold">Severity:</span> {selectedCmp.severity}</div>
                  <div className="col-span-2"><span className="font-bold">Key features:</span> {selectedCmp.detectedFeatures?.join(', ')}</div>
                  {selectedCmp.isDuplicate && (
                    <div className="col-span-2 text-rose-500 font-bold">⚠️ Flagged duplicate from coordinate radius</div>
                  )}
                </div>
              </div>

              {/* WORKFLOW 1: Assign Staff Dropdown */}
              {selectedCmp.status !== 'Completed' && (
                <div className="space-y-1.5 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <UserCheck size={14} className="text-slate-400" /> Assign To Maintenance Staff
                  </label>
                  <select
                    disabled={updatingTask}
                    value={selectedCmp.assignedStaffId || ''}
                    onChange={(e) => handleAssignStaff(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-350 font-semibold"
                  >
                    <option value="">Unassigned</option>
                    {staffList.map(staff => (
                      <option key={staff._id} value={staff._id}>{staff.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* WORKFLOW 2: Status Manager bar */}
              {selectedCmp.status !== 'Completed' && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Workflow Actions</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange('Verified')}
                      disabled={updatingTask || selectedCmp.status === 'Verified'}
                      className="flex-1 py-2 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 transition"
                    >
                      <Check size={12} /> Verify Issue
                    </button>
                    
                    <button
                      onClick={() => handleStatusChange('In Progress')}
                      disabled={updatingTask || selectedCmp.status === 'In Progress' || !selectedCmp.assignedStaffId}
                      className="flex-1 py-2 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 transition"
                      title={!selectedCmp.assignedStaffId ? "Assign staff first before starting repair" : ""}
                    >
                      <Hammer size={12} /> Start Repair
                    </button>
                  </div>
                </div>
              )}

              {/* WORKFLOW 3: Slide-open repair completion form */}
              {selectedCmp.status !== 'Completed' && selectedCmp.assignedStaffId && (
                <form onSubmit={handleCompleteRepair} className="border-t border-slate-150 dark:border-slate-800 pt-4 space-y-3.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submit Resolution Details</p>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-0.5">
                        <DollarSign size={12} /> Cost (USD)
                      </label>
                      <input
                        type="number"
                        required
                        value={repairCost}
                        onChange={(e) => setRepairCost(e.target.value)}
                        placeholder="450.00"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Completion Date</label>
                      <input
                        type="date"
                        required
                        value={completionDate}
                        onChange={(e) => setCompletionDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none text-slate-650"
                      />
                    </div>
                  </div>

                  {/* Work completion photo */}
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Completion Photo</label>
                    <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3 bg-slate-50 dark:bg-slate-950/20">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAfterImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {afterImagePreview ? (
                        <div className="w-12 h-12 rounded overflow-hidden border border-slate-350">
                          <img src={afterImagePreview} alt="Work completed" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <Image className="text-slate-400" size={24} />
                      )}
                      <div className="text-left">
                        <p className="font-semibold text-slate-600 dark:text-slate-350">Upload post-repair image</p>
                        <p className="text-[9px] text-slate-400">Click to locate file</p>
                      </div>
                    </div>
                  </div>

                  {/* Repair notes */}
                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Maintenance Resolution Notes</label>
                    <textarea
                      required
                      value={repairNotes}
                      onChange={(e) => setRepairNotes(e.target.value)}
                      placeholder="Specify resolution actions (e.g. repaved asphalt lane, replaced luminaire element)"
                      rows={2.5}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updatingTask}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-500/10 active:scale-95 disabled:scale-100 disabled:opacity-50"
                  >
                    Resolve & Close Ticket
                  </button>

                </form>
              )}

              {/* RENDER INVOICE IF COMPLETED */}
              {selectedCmp.status === 'Completed' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400">Before Photo</p>
                      <div className="h-28 rounded-xl overflow-hidden border border-slate-200">
                        <img 
                          src={selectedCmp.imageUrlBefore.startsWith('/uploads') ? `${API_URL.replace('/api', '')}${selectedCmp.imageUrlBefore}` : selectedCmp.imageUrlBefore} 
                          alt="Before" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400">After Photo</p>
                      <div className="h-28 rounded-xl overflow-hidden border border-slate-200">
                        {selectedCmp.imageUrlAfter ? (
                          <img 
                            src={selectedCmp.imageUrlAfter.startsWith('/uploads') ? `${API_URL.replace('/api', '')}${selectedCmp.imageUrlAfter}` : selectedCmp.imageUrlAfter} 
                            alt="After" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-slate-400 text-[10px]">
                            No photo uploaded.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50/50 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 text-xs space-y-2">
                    <h4 className="font-extrabold text-emerald-800 dark:text-emerald-400">Resolution Invoice Record</h4>
                    <p><span className="font-bold text-slate-500">Repair Cost:</span> ${selectedCmp.repairCost?.toFixed(2)}</p>
                    <p><span className="font-bold text-slate-500">Completed Date:</span> {new Date(selectedCmp.completionDate).toLocaleDateString()}</p>
                    <p><span className="font-bold text-slate-500">Resolved By:</span> {selectedCmp.assignedStaffName || 'Municipality Team'}</p>
                    <p className="border-t border-emerald-250/20 dark:border-emerald-900/30 pt-2 font-medium italic text-slate-650 dark:text-slate-350">
                      "{selectedCmp.repairNotes}"
                    </p>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="py-24 text-center text-slate-400">
              <span className="text-4xl">🔍</span>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-3">No ticket selected</p>
              <p className="text-xs text-slate-500 mt-1">Select a ticket marker on the Leaflet map to inspect diagnostics and resolve repairs.</p>
            </div>
          )}
        </section>

      </div>

    </div>
  );
}
