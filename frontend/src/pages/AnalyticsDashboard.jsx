import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  TrendingUp, Clock, CheckCircle, FileDown, DollarSign, 
  HelpCircle, RefreshCw, BarChart3, PieChart 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/analytics/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (err) {
      console.error('Fetch analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Export PDF using jsPDF
  const exportPDF = () => {
    if (!data) return;
    setExporting(true);

    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();

      // Header Banner
      doc.setFillColor(79, 70, 229); // Indigo brand
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.text("CivicTrack AI", 15, 20);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.text("Smart Infrastructure Resolution & Budget Analysis Report", 15, 30);

      // Title Details
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(14);
      doc.setFont('Helvetica', 'bold');
      doc.text("EXECUTIVE PERFORMANCE SUMMARY", 15, 55);
      
      doc.setFontSize(9);
      doc.setFont('Helvetica', 'normal');
      doc.text(`Generated on: ${timestamp}`, 15, 60);

      // Summary KPIs Table
      const kpiHeaders = [["Metric Indicator", "Value Details"]];
      const kpiRows = [
        ["Total Complaints Logged", String(data.summary.total)],
        ["Active Pending Complaints", String(data.summary.pending)],
        ["Verified / Assigned Work Orders", String(data.summary.verified)],
        ["Tasks In Progress", String(data.summary.inProgress)],
        ["Completed Resolutions", String(data.summary.completed)],
        ["Average Resolution Speed", `${data.summary.averageRepairTimeHours} Hours`],
        ["Total Infrastructure Capital Spent", `$${data.summary.totalCost.toFixed(2)}`]
      ];

      doc.autoTable({
        startY: 65,
        head: kpiHeaders,
        body: kpiRows,
        theme: 'striped',
        headStyles: { fillColor: [67, 56, 202] },
        margin: { left: 15, right: 15 }
      });

      // Category / Department breakdown Table
      doc.setFontSize(14);
      doc.setFont('Helvetica', 'bold');
      doc.text("DEPARTMENT RESOLUTION BREAKDOWN", 15, doc.lastAutoTable.finalY + 15);

      const deptHeaders = [["Category Department", "Total Cases", "Completed", "Pending", "Budget Cost Spent"]];
      const deptRows = data.categoryData.map(cat => [
        cat.category,
        String(cat.total),
        String(cat.completed),
        String(cat.pending),
        `$${cat.cost.toFixed(2)}`
      ]);

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: deptHeaders,
        body: deptRows,
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241] },
        margin: { left: 15, right: 15 }
      });

      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${totalPages} - CivicTrack AI Municipality Portal`, 15, 287);
      }

      doc.save(`CivicTrack_Infrastructure_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Error creating PDF file.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-24 text-center rounded-3xl">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-semibold text-sm">Aggregating municipality statistics...</p>
      </div>
    );
  }

  if (!data) return null;

  // Max value of category totals for chart scaling
  const maxTotalVal = Math.max(...data.categoryData.map(c => c.total), 1);
  // Calculate average resolution percentage
  const resolutionPercentage = data.summary.total > 0 
    ? ((data.summary.completed / data.summary.total) * 100).toFixed(0) 
    : 0;

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION PANEL */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>📈</span> Infrastructure Analytics Center
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Review resolution KPIs, budgets expenditures, and export formal reports.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchAnalytics}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-300 rounded-xl transition flex items-center justify-center"
            title="Refresh Analytics Data"
          >
            <RefreshCw size={16} />
          </button>
          
          <button
            onClick={exportPDF}
            disabled={exporting}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-500/10 active:scale-95 disabled:scale-100"
          >
            <FileDown size={14} />
            {exporting ? 'Generating Report...' : 'Download PDF Report'}
          </button>
        </div>
      </section>

      {/* KPI METRIC CARDS ROW */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
            📋
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Reports</p>
            <h4 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">{data.summary.total}</h4>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
            ⏳
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Pending</p>
            <h4 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">{data.summary.pending}</h4>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
            ✅
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Resolved Cases</p>
            <h4 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">{data.summary.completed}</h4>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-lg">
            ⏱️
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg Repair Time</p>
            <h4 className="font-extrabold text-xl text-slate-800 dark:text-slate-100 truncate">{data.summary.averageRepairTimeHours} hr</h4>
          </div>
        </div>
      </section>

      {/* CHARTS CONTAINER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Department performance SVG bar chart */}
        <section className="md:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <BarChart3 size={16} className="text-indigo-500" /> Department Volumes & Performance
            </h3>
            <span className="text-[9px] uppercase bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded font-extrabold text-indigo-600 dark:text-indigo-400">
              {resolutionPercentage}% resolution rate
            </span>
          </div>

          {/* SVG Bar Chart rendering */}
          <div className="space-y-4 pt-2">
            {data.categoryData.map((cat, idx) => {
              const totalPct = (cat.total / maxTotalVal) * 100;
              const completedPct = cat.total > 0 ? (cat.completed / cat.total) * 100 : 0;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-350">{cat.category}</span>
                    <span className="font-bold text-slate-500">{cat.completed}/{cat.total} resolved</span>
                  </div>
                  {/* Custom CSS Bar chart slider */}
                  <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-850 relative">
                    <div 
                      style={{ width: `${totalPct}%` }}
                      className="absolute inset-y-0 left-0 bg-indigo-500/25 dark:bg-indigo-500/10 rounded-full"
                    />
                    <div 
                      style={{ width: `${(cat.completed / maxTotalVal) * 100}%` }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Monthly line/trend SVG area chart */}
        <section className="md:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <PieChart size={16} className="text-indigo-500" /> Monthly Ticket Inflow Analysis
          </h3>

          {/* Native SVG Area chart */}
          <div className="w-full h-[220px] flex items-center justify-center bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-2xl p-4">
            {data.monthlyData.length === 0 ? (
              <p className="text-xs text-slate-400">No monthly trends recorded.</p>
            ) : (
              <svg viewBox="0 0 500 200" className="w-full h-full text-indigo-500 dark:text-indigo-400 font-sans">
                {/* SVG definitions for gradients */}
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid guidelines */}
                <line x1="40" y1="20" x2="460" y2="20" stroke="rgba(100,116,139,0.1)" strokeDasharray="3" />
                <line x1="40" y1="80" x2="460" y2="80" stroke="rgba(100,116,139,0.1)" strokeDasharray="3" />
                <line x1="40" y1="140" x2="460" y2="140" stroke="rgba(100,116,139,0.1)" strokeDasharray="3" />
                <line x1="40" y1="170" x2="460" y2="170" stroke="rgba(100,116,139,0.2)" />

                {/* Draw Area */}
                {(() => {
                  const points = data.monthlyData.map((m, i) => {
                    const step = data.monthlyData.length > 1 ? 420 / (data.monthlyData.length - 1) : 420;
                    const x = 40 + i * step;
                    const maxVal = Math.max(...data.monthlyData.map(d => d.count), 1);
                    const y = 170 - (m.count / maxVal) * 140;
                    return { x, y };
                  });

                  if (points.length === 0) return null;

                  const pathD = `M ${points[0].x} 170 ` + points.map(p => `L ${p.x} ${p.y}`).join(' ') + ` L ${points[points.length-1].x} 170 Z`;
                  const lineD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                  return (
                    <>
                      <path d={pathD} fill="url(#areaGrad)" />
                      <path d={lineD} fill="none" stroke="currentColor" strokeWidth="2.5" />
                      
                      {/* Dots and Tooltips */}
                      {points.map((p, idx) => (
                        <g key={idx} className="group cursor-pointer">
                          <circle cx={p.x} cy={p.y} r="4.5" fill="white" stroke="currentColor" strokeWidth="2.5" />
                          <circle cx={p.x} cy={p.y} r="8" fill="currentColor" opacity="0" className="hover:opacity-20 transition-opacity" />
                          {/* Label values */}
                          <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor">
                            {data.monthlyData[idx].count}
                          </text>
                          {/* X axis labels */}
                          <text x={p.x} y="185" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#64748b">
                            {data.monthlyData[idx].month}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            )}
          </div>
        </section>

      </div>

      {/* COST ANALYSIS EXPENDITURE TABLE */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <DollarSign size={16} className="text-indigo-500" /> Infrastructure Maintenance Capital Report
          </h3>
          <span className="text-xs bg-slate-50 dark:bg-slate-950 font-bold px-3 py-1 rounded-xl text-slate-650 dark:text-slate-300">
            Total Capital Invoiced: ${data.summary.totalCost.toFixed(2)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-extrabold">
                <th className="py-3 px-2">Department Category</th>
                <th className="py-3 px-2">Cases Submissions</th>
                <th className="py-3 px-2">Repairs Completed</th>
                <th className="py-3 px-2">Resolution Rate</th>
                <th className="py-3 px-2 text-right">Capital Expenditures</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
              {data.categoryData.map((cat, idx) => {
                const rate = cat.total > 0 ? ((cat.completed / cat.total) * 100).toFixed(0) : 0;
                return (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                    <td className="py-3.5 px-2 font-bold text-slate-850 dark:text-slate-150">{cat.category}</td>
                    <td className="py-3.5 px-2">{cat.total} cases</td>
                    <td className="py-3.5 px-2">{cat.completed} repaired</td>
                    <td className="py-3.5 px-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        parseFloat(rate) >= 75 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' :
                        parseFloat(rate) >= 40 ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' :
                        'bg-rose-50 text-rose-600 dark:bg-rose-950/20'
                      }`}>
                        {rate}%
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right font-extrabold text-slate-850 dark:text-slate-150">
                      ${cat.cost.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
