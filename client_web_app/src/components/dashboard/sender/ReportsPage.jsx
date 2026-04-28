import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { FileText, Download, TrendingUp, AlertTriangle, Archive, Truck } from 'lucide-react';

const ReportsPage = () => {
  const { token } = useContext(AuthContext);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://127.0.0.1:8000/reports/daily`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Backend error. Please ensure your Gemini API key is valid in the .env file.");
      setReport(await res.json());
    } catch (err) {
      console.error("Error fetching report:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Removed auto-fetch to give user control
  // useEffect(() => { if (token) fetchReport(); }, [token]);

  if (!report && !loading && !error) return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/10">
        <FileText className="w-10 h-10 text-blue-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">Daily Operations Report</h2>
      <p className="text-slate-400 max-w-md mb-8">
        Click below to have Gemini analyze today's inventory, reached orders, and AI-detected risks across the cold chain.
      </p>
      <button 
        onClick={fetchReport}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95"
      >
        <TrendingUp className="w-5 h-5" /> Generate Today's Report
      </button>
    </div>
  );

  if (loading && !report) return (
    <div className="text-center py-32 text-slate-400 text-lg flex flex-col items-center gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
      </div>
      <div className="space-y-2">
        <p className="text-white font-bold animate-pulse">Gemini is analyzing operations...</p>
        <p className="text-sm text-slate-500 text-center">Generating executive summary and risk analysis...</p>
      </div>
    </div>
  );

  if (error && !report) return (
    <div className="text-center py-32 flex flex-col items-center">
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6">
        <AlertTriangle className="w-10 h-10 text-red-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Generation Failed</h3>
      <p className="text-red-400/80 max-w-md mb-8 text-sm">{error}</p>
      <button 
        onClick={fetchReport}
        className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-8 rounded-xl border border-slate-700 transition-all"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">End of Day Report</h1>
          <p className="text-slate-400">Automated summary of warehouse inventory, fulfilled orders, and resolved alerts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchReport}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 px-6 rounded-xl transition-all border border-slate-700 disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <TrendingUp className="w-4 h-4 text-emerald-400" />}
            {loading ? 'Generating...' : 'Generate Live Report'}
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/20">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
         <div className="flex items-center justify-between border-b border-slate-700/50 pb-6 mb-6">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-indigo-500/10 rounded-xl">
                 <FileText className="w-6 h-6 text-indigo-400" />
               </div>
               <div>
                 <h2 className="text-xl font-bold text-white">Daily Operations Summary</h2>
                 <p className="text-sm text-slate-400">Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
               </div>
            </div>
            <div className="text-right hidden sm:block">
               <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Status</p>
               <p className="text-emerald-400 font-bold">System Nominal</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inventory Box */}
            <div className="p-5 rounded-xl bg-slate-950/50 border border-slate-800">
               <div className="flex items-center gap-2 text-slate-300 font-semibold mb-4">
                  <Archive className="w-4 h-4 text-blue-400" /> Inventory Valuation
               </div>
               <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-2">
                     <span className="text-slate-400">Total Units Stored</span>
                     <span className="text-white font-medium">{report.inventory.total_units}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-2">
                     <span className="text-slate-400">Reserved for Orders</span>
                     <span className="text-white font-medium">{report.inventory.reserved_units}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-400">Low Stock SKUs</span>
                     <span className="text-red-400 font-medium">{report.inventory.low_stock_skus}</span>
                  </div>
               </div>
            </div>

            {/* Alerts Box */}
            <div className="p-5 rounded-xl bg-slate-950/50 border border-slate-800">
               <div className="flex items-center gap-2 text-slate-300 font-semibold mb-4">
                  <AlertTriangle className="w-4 h-4 text-orange-400" /> Risk & Incidents
               </div>
               <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-2">
                     <span className="text-slate-400">Active Delays Reported</span>
                     <span className="text-yellow-400 font-medium">{report.alerts.delays}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-2">
                     <span className="text-slate-400">Temperature Breaches</span>
                     <span className="text-red-400 font-medium">{report.alerts.temperature_breaches}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-400">Total Unresolved Alerts</span>
                     <span className="text-orange-400 font-medium">{report.alerts.total_active}</span>
                  </div>
               </div>
            </div>

            {/* Performance Box */}
            <div className="p-5 rounded-xl bg-slate-950/50 border border-slate-800 md:col-span-2">
               <div className="flex items-center gap-2 text-slate-300 font-semibold mb-4">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> Dispatch Performance
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3">
                     <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Orders Received</p>
                     <p className="text-2xl font-bold text-white">{report.orders.total}</p>
                  </div>
                  <div className="text-center p-3 border-l border-slate-800">
                     <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Total Reached</p>
                     <p className="text-2xl font-bold text-emerald-400">{report.orders.reached}</p>
                  </div>
                  <div className="text-center p-3 border-l border-slate-800">
                     <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Pending Approval</p>
                     <p className="text-2xl font-bold text-yellow-400">{report.orders.pending}</p>
                  </div>
                  <div className="text-center p-3 border-l border-slate-800">
                     <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Active Fleets</p>
                     <p className="text-2xl font-bold text-blue-400 flex items-center justify-center gap-1">
                        <Truck className="w-4 h-4" /> {report.shipments.active}
                     </p>
                  </div>
               </div>
            </div>

            {/* AI Narrative Box */}
            <div className="md:col-span-2 p-6 rounded-xl bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/20">
               <div className="flex items-center gap-2 text-indigo-300 font-bold mb-4 uppercase tracking-widest text-xs">
                  <FileText className="w-4 h-4" /> AI Operations Narrative
               </div>
               <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {report.ai_narrative}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ReportsPage;
