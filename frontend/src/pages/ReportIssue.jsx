import React, { useState } from 'react';
import MapView from '../components/MapView';
import { useNotifications } from '../context/NotificationContext';
import { 
  ArrowRight, Droplets, Leaf, MapPin, MoreHorizontal, 
  RefreshCcw, Sparkles, Trash2, Upload, Waypoints, 
  Construction, Lamp, AlertTriangle, CheckCircle 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const issueCategories = [
  { id: 'Pothole', label: 'Pothole', icon: Construction },
  { id: 'Broken Streetlight', label: 'Broken Light', icon: Lamp },
  { id: 'Road Damage', label: 'Road Damage', icon: Waypoints },
  { id: 'Water Leakage', label: 'Water Leakage', icon: Droplets },
  { id: 'Garbage', label: 'Garbage', icon: Trash2 },
  { id: 'Sewer Overflow', label: 'Sewer Overflow', icon: RefreshCcw },
  { id: 'Park / Playground', label: 'Park / Playground', icon: Leaf },
  { id: 'Other', label: 'Other', icon: MoreHorizontal }
];

export default function ReportIssue({ setActiveTab }) {
  const { showToast } = useNotifications();
  const [category, setCategory] = useState('Pothole');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [latitude, setLatitude] = useState(37.7749);
  const [longitude, setLongitude] = useState(-122.4194);
  const [locationName, setLocationName] = useState('Default Center (Click map to change)');
  const [isLocationPinned, setIsLocationPinned] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // AI Preview State
  const [runningAi, setRunningAi] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    // Reset AI result since file changed
    setAiResult(null);
  };

  const detectLocation = () => {
    setDetectingGps(true);
    if (!navigator.geolocation) {
      showToast('Error', 'Geolocation is not supported by your browser.');
      setDetectingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setLocationName(`Detected GPS: (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
        setIsLocationPinned(true);
        setDetectingGps(false);
        showToast('Success', 'GPS coordinates detected successfully.');
      },
      (err) => {
        showToast('Warning', 'Could not access GPS. Please click on the map to pin location.');
        setDetectingGps(false);
      }
    );
  };

  const handleMapClick = (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
    setLocationName(`Pinned location: (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
    setIsLocationPinned(true);
  };

  // Run AI Preview Diagnostic
  const handleAiPreview = async () => {
    if (!imageFile && !description) {
      showToast('Validation Error', 'Please select an image or write a description first to test AI.');
      return;
    }

    setRunningAi(true);
    setAiResult(null);

    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append('image', imageFile);
      }
      formData.append('description', description);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/complaints/preview`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const analysis = await response.json();
        setAiResult(analysis);
        if (analysis.category && analysis.category !== 'Other') {
          setCategory(analysis.category);
        }
        showToast('AI Diagnostic', 'Analysis completed. Diagnostic details generated!');
      } else {
        const errorData = await response.json();
        showToast('AI Preview Failed', errorData.message || 'Error processing AI preview.');
      }
    } catch (err) {
      console.error(err);
      showToast('Network Error', 'Could not contact AI analysis engine.');
    } finally {
      setRunningAi(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      showToast('Validation Error', 'Please upload a photo of the infrastructure issue.');
      return;
    }
    if (!title.trim()) {
      showToast('Validation Error', 'Please provide a short summary of the issue.');
      return;
    }
    if (!description.trim()) {
      showToast('Validation Error', 'Please describe the problem.');
      return;
    }
    if (!isLocationPinned) {
      showToast('Validation Error', 'Please select a location on the map or click Detect GPS.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      formData.append('categoryOverride', category);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/complaints`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        showToast('Submission Success', 'Complaint registered successfully! Dispatch details sent to email.');
        // Redirect to My Issues tab
        setActiveTab('my-issues');
      } else {
        const errorData = await response.json();
        showToast('Error', errorData.message || 'Failed to submit report.');
      }
    } catch (err) {
      console.error(err);
      showToast('Network Error', 'Connection lost. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="rounded-[28px] border border-white bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#0f172a]/70 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6 rounded-[24px] bg-gradient-to-br from-violet-50 via-indigo-50 to-cyan-50 p-6 dark:from-white/5 dark:to-white/0 dark:border dark:border-white/5">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold uppercase tracking-wider dark:bg-violet-500/10 dark:text-violet-300">
              <Sparkles size={12} className="animate-pulse" /> AI Assured Verification
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Report a Civic Issue</h2>
            <p className="text-sm text-slate-500 dark:text-white/60">Help improve your city by reporting infrastructure damages. AI diagnostics will automatically detect severity and assign tasks.</p>
          </div>
          <div className="hidden lg:block shrink-0">
            <div className="h-16 w-16 grid place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/20">
              <Upload size={24} />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Category Selector */}
          <div>
            <label className="mb-3 block text-sm font-bold text-slate-700 dark:text-slate-300">Select Issue Category</label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {issueCategories.map((cat) => {
                const Icon = cat.icon;
                const selected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all ${
                      selected
                        ? 'border-violet-400 bg-violet-50/50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200 ring-2 ring-violet-500/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:border-slate-700'
                    }`}
                  >
                    <Icon size={20} className={selected ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'} />
                    <span className="mt-2 text-xs font-bold leading-none">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              {/* Summary */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Short Summary</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Broken streetlight causing complete darkness"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white dark:focus:ring-violet-500/10"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Problem Description</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain details of the issue. Use keywords like 'dangerous', 'blocked', or 'flooding' to help the AI detect severity."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white dark:focus:ring-violet-500/10"
                />
              </div>

              {/* File Selector */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Upload Issue Photo</label>
                <div className="flex gap-4 items-center">
                  <label className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-4 py-5 text-sm font-semibold text-slate-600 cursor-pointer hover:bg-slate-50 transition dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-400 dark:hover:bg-slate-900/60">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Upload size={16} />
                    {imageFile ? 'Change Photo' : 'Upload Image File'}
                  </label>
                  {imagePreview && (
                    <div className="h-16 w-16 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* AI diagnostic preview trigger */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAiPreview}
                  disabled={runningAi}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-violet-200 bg-violet-50/50 text-violet-700 font-semibold text-xs transition hover:bg-violet-50 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300 disabled:opacity-50"
                >
                  <Sparkles size={14} className={runningAi ? 'animate-spin' : ''} />
                  {runningAi ? 'Analyzing file details...' : 'Pre-evaluate with AI Diagnostic'}
                </button>
              </div>

              {/* AI analysis card result */}
              {aiResult && (
                <div className="rounded-3xl border border-violet-100 bg-violet-50/30 p-5 dark:border-violet-500/10 dark:bg-violet-500/5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-violet-600 dark:text-violet-400" />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">AI Diagnostic Pre-Evaluation</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-slate-400 font-semibold">Predicted Category</p>
                      <p className="font-bold text-slate-800 dark:text-white mt-0.5">{aiResult.category}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold">Confidence Rating</p>
                      <p className="font-bold text-slate-800 dark:text-white mt-0.5">{(aiResult.confidence * 100).toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold">Severity Grade</p>
                      <span className={`inline-block px-2 py-0.5 rounded font-bold mt-0.5 ${
                        aiResult.severity === 'High' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300' :
                        aiResult.severity === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                      }`}>{aiResult.severity}</span>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold">Calculated Priority</p>
                      <span className={`inline-block px-2 py-0.5 rounded font-bold mt-0.5 ${
                        aiResult.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 animate-pulse' :
                        aiResult.priority === 'High' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300' :
                        aiResult.priority === 'Medium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300'
                      }`}>{aiResult.priority}</span>
                    </div>
                  </div>
                  {aiResult.detectedFeatures && aiResult.detectedFeatures.length > 0 && (
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Detected Visual Features</p>
                      <div className="flex flex-wrap gap-1.5">
                        {aiResult.detectedFeatures.map(feat => (
                          <span key={feat} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full dark:bg-slate-800 dark:text-slate-400">{feat}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {aiResult.isDuplicate && (
                    <div className="flex gap-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Duplicate Detected</p>
                        <p className="text-[10px]">A similar report exists nearby (ID: {aiResult.duplicateOf}). We will link this automatically.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Location pin status */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Geospatial Location Pin</label>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={detectingGps}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-900"
                  >
                    <MapPin size={14} className="text-violet-500" />
                    {detectingGps ? 'Querying GPS...' : 'Detect Coordinates'}
                  </button>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                    isLocationPinned 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' 
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400'
                  }`}>
                    {isLocationPinned ? 'Coordinates Set' : 'Awaiting Marker'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-400 font-mono">
                  {locationName}
                </div>
              </div>

              {/* Map picking container */}
              <div className="h-64 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800">
                <MapView 
                  complaints={[]} 
                  center={[latitude, longitude]} 
                  zoom={isLocationPinned ? 16 : 13} 
                  interactive={true} 
                  onMapClick={handleMapClick}
                  reportPin={isLocationPinned ? [latitude, longitude] : null}
                />
              </div>
              <p className="text-[10px] text-center text-slate-400">Click anywhere on the map above to manually pin the coordinate.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-purple-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-violet-500/20 hover:brightness-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <RefreshCcw size={18} className="animate-spin" />
                  Submitting Complaint Ticket...
                </>
              ) : (
                <>
                  <ArrowRight size={18} />
                  Submit Report to Municipality
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
