import React, { useState } from 'react';
import { Terminal, Send, Lock, Globe, Database, ArrowRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function APIDocs() {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [testResponse, setTestResponse] = useState(null);
  const [testing, setTesting] = useState(false);

  const routes = [
    {
      method: 'POST',
      path: '/auth/register',
      desc: 'Register a new citizen account',
      auth: false,
      body: { name: 'Sarah Citizen', email: 'sarah@example.com', password: 'password123', role: 'citizen' },
      response: { token: 'eyJhbGciOiJIUzI1Ni...', user: { id: 'usr-cit123', email: 'sarah@example.com', name: 'Sarah Citizen', role: 'citizen' } }
    },
    {
      method: 'POST',
      path: '/auth/login',
      desc: 'Authenticate user and fetch session token',
      auth: false,
      body: { email: 'citizen@civictrack.ai', password: 'password123' },
      response: { token: 'eyJhbGciOiJIUzI1Ni...', user: { id: 'usr-citizen', email: 'citizen@civictrack.ai', name: 'Sarah Citizen', role: 'citizen' } }
    },
    {
      method: 'GET',
      path: '/auth/me',
      desc: 'Fetch current authenticated user profile from token',
      auth: true,
      body: null,
      response: { id: 'usr-citizen', email: 'citizen@civictrack.ai', name: 'Sarah Citizen', role: 'citizen' }
    },
    {
      method: 'POST',
      path: '/complaints',
      desc: 'Report a new infrastructure issue with image (Multipart/Form-Data)',
      auth: true,
      body: { title: 'Broken streetlight', description: 'Dark park alleyway', latitude: 37.7749, longitude: -122.4194, image: 'File' },
      response: { _id: 'CMP-72B63', category: 'Broken Streetlight', status: 'Pending', priority: 'Medium', severity: 'Medium', isDuplicate: false }
    },
    {
      method: 'GET',
      path: '/complaints',
      desc: 'Retrieve role-based list of complaints (Citizens see own, Staff see assigned, Admin see all)',
      auth: true,
      body: null,
      response: [{ _id: 'CMP-8263A', title: 'Deep pothole', category: 'Pothole', status: 'Completed', priority: 'Critical' }]
    },
    {
      method: 'PUT',
      path: '/complaints/:id/assign',
      desc: 'Delegate complaint task to field staff (Admin only)',
      auth: true,
      body: { assignedStaffId: 'usr-staff1' },
      response: { _id: 'CMP-8263A', assignedStaffId: 'usr-staff1', assignedStaffName: 'Marcus Specialist', status: 'Verified' }
    },
    {
      method: 'PUT',
      path: '/complaints/:id/status',
      desc: 'Update complaint status, upload resolution images and input budget repair costs (Admin/Staff)',
      auth: true,
      body: { status: 'Completed', repairNotes: 'Repaired luminaire wiring', repairCost: 150.00, image: 'File' },
      response: { _id: 'CMP-8263A', status: 'Completed', repairNotes: 'Repaired luminaire wiring', repairCost: 150.00, imageUrlAfter: '/uploads/file.png' }
    },
    {
      method: 'GET',
      path: '/analytics/summary',
      desc: 'Retrieve aggregated performance, volumes, and budgets expenditure data (Admin only)',
      auth: true,
      body: null,
      response: { summary: { total: 4, pending: 3, completed: 1, averageRepairTimeHours: 48, totalCost: 450.00 } }
    }
  ];

  const testEndpoint = async (route) => {
    setTesting(true);
    setTestResponse(null);
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (route.auth && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let fetchUrl = `${API_URL}${route.path}`;
      let method = route.method;

      // Mock specific URL parameters if testing detailed paths
      if (route.path.includes('/:id')) {
        // Fetch a list first to get an ID, otherwise default mock parameter
        try {
          const listRes = await fetch(`${API_URL}/complaints`, { headers });
          if (listRes.ok) {
            const list = await listRes.json();
            if (list.length > 0) {
              fetchUrl = fetchUrl.replace('/:id', `/${list[0]._id}`);
            } else {
              fetchUrl = fetchUrl.replace('/:id', '/CMP-SAMPLE');
            }
          }
        } catch {
          fetchUrl = fetchUrl.replace('/:id', '/CMP-SAMPLE');
        }
      }

      const options = { method, headers };

      if (route.body && route.method !== 'GET') {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(route.body);
      }

      const response = await fetch(fetchUrl, options);
      const data = await response.json();
      setTestResponse({
        status: response.status,
        statusText: response.statusText,
        payload: data
      });
    } catch (err) {
      console.error(err);
      setTestResponse({
        status: 'Error',
        statusText: 'Failed to connect to API',
        payload: { error: 'Network error. Make sure the Node backend server is running on port 5000.' }
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT: API Routes Catalog */}
      <section className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Terminal size={20} className="text-indigo-500" /> REST API documentation Explorer
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Browse and test the backend endpoints. Authenticated routes automatically attach your active JWT token.
          </p>
        </div>

        <div className="space-y-4">
          {routes.map((route, idx) => {
            const active = selectedRoute?.path === route.path && selectedRoute?.method === route.method;
            const isGet = route.method === 'GET';
            const isPost = route.method === 'POST';
            const isPut = route.method === 'PUT';

            return (
              <div 
                key={idx}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  active 
                    ? 'border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/10 shadow-md' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-50/30 dark:bg-slate-950/20'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-150 dark:border-slate-850 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] text-white ${
                      isGet ? 'bg-sky-500' :
                      isPost ? 'bg-emerald-500' :
                      'bg-amber-500'
                    }`}>
                      {route.method}
                    </span>
                    <code className="text-xs font-bold text-slate-850 dark:text-slate-150">{route.path}</code>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold">
                    {route.auth && (
                      <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded flex items-center gap-1 border border-indigo-150/35">
                        <Lock size={8} /> JWT Required
                      </span>
                    )}
                    <span className="bg-slate-100 dark:bg-slate-950 text-slate-500 px-2 py-0.5 rounded">
                      JSON
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-350 font-semibold mb-4 leading-relaxed">{route.desc}</p>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedRoute(route);
                      setTestResponse(null);
                    }}
                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    Inspect Schemas <ArrowRight size={10} />
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedRoute(route);
                      testEndpoint(route);
                    }}
                    className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-sm active:scale-95"
                  >
                    <Send size={10} /> Send Live Request
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RIGHT: Selected Route Schema details & Live Test Runner console */}
      <section className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        {selectedRoute ? (
          <div className="space-y-6">
            
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded text-slate-500">
                  SCHEMA SPEC
                </span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {selectedRoute.method} {selectedRoute.path}
                </span>
              </div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Endpoint Specs</h3>
            </div>

            {/* Request parameters schema */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Example Request Parameters</p>
              <div className="bg-slate-950 dark:bg-slate-950 border border-slate-850 rounded-xl p-3.5 overflow-x-auto text-[10px] font-mono text-emerald-400 max-h-36">
                {selectedRoute.body ? (
                  <pre>{JSON.stringify(selectedRoute.body, null, 2)}</pre>
                ) : (
                  <span className="text-slate-500 italic">None / Query Parameters</span>
                )}
              </div>
            </div>

            {/* Response schema */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expected Response Payload (200 OK)</p>
              <div className="bg-slate-950 dark:bg-slate-950 border border-slate-850 rounded-xl p-3.5 overflow-x-auto text-[10px] font-mono text-cyan-400 max-h-48">
                <pre>{JSON.stringify(selectedRoute.response, null, 2)}</pre>
              </div>
            </div>

            {/* Live request response terminal */}
            <div className="border-t border-slate-150 dark:border-slate-800 pt-4 space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Test Console Response</p>
              
              {testing ? (
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-8 text-center text-slate-500 text-[10px] font-mono">
                  <div className="w-4 h-4 border border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  POSTING REQUEST TO: {API_URL}{selectedRoute.path}...
                </div>
              ) : testResponse ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-400">Response Header:</span>
                    <span className={`px-2 py-0.5 rounded ${
                      testResponse.status >= 200 && testResponse.status < 300 ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' :
                      'bg-rose-950 text-rose-400 border border-rose-900/30'
                    }`}>
                      {testResponse.status} {testResponse.statusText}
                    </span>
                  </div>
                  
                  <div className="bg-slate-950 dark:bg-slate-950 border border-slate-850 rounded-xl p-3.5 overflow-x-auto text-[10px] font-mono text-slate-200 max-h-56">
                    <pre>{JSON.stringify(testResponse.payload, null, 2)}</pre>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 dark:bg-slate-950 border border-slate-850 rounded-xl p-6 text-center text-slate-500 text-[10px] font-mono italic">
                  Press "Send Live Request" to query the running Node API.
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="py-28 text-center text-slate-400">
            <span className="text-4xl">🔌</span>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-350 mt-3">API Console Idle</p>
            <p className="text-xs text-slate-500 mt-1">Select an endpoint route from the catalogue to view schema specs and test responses against the running server.</p>
          </div>
        )}
      </section>

    </div>
  );
}
