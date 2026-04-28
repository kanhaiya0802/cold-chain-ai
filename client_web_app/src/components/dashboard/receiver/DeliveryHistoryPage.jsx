import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { 
  History, Calendar, CheckCircle2, FileText, 
  ChevronRight, ArrowRight, RotateCcw, Search
} from 'lucide-react';

const DeliveryHistoryPage = () => {
  const { token } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/receiver/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setHistory(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchHistory();
  }, [token]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Delivery History</h1>
        <p className="text-slate-500">Audit trail of all medicines and vaccines received by your facility.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Filters</h3>
              <div className="space-y-2">
                 {['Last 30 Days', 'Last 90 Days', 'Year 2024', 'Critical Only'].map(f => (
                   <button key={f} className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-all">
                      {f}
                   </button>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
           {loading ? (
             <div className="py-20 text-center text-slate-400 animate-pulse">Retrieving Archives...</div>
           ) : history.length === 0 ? (
             <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No completed deliveries found in your history.</p>
             </div>
           ) : history.map(order => (
             <div key={order.order_id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="w-8 h-8" />
                   </div>
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                         <span className="font-bold text-slate-800">#ORD-{order.order_id}</span>
                         <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">Delivered</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Completed on {new Date(order.order_date).toLocaleDateString()}</p>
                   </div>
                </div>

                <div className="flex items-center gap-10">
                   <div className="hidden sm:block">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Condition</p>
                      <p className="text-sm font-bold text-emerald-600">Perfect Integrity</p>
                   </div>
                   <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-100 transition-all border border-slate-100">
                         <FileText className="w-4 h-4" /> Certificate
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-100">
                         <RotateCcw className="w-4 h-4" /> Reorder
                      </button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default DeliveryHistoryPage;
