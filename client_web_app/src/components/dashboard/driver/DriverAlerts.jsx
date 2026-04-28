import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { 
  AlertTriangle, Thermometer, Battery, MapPin, 
  ChevronRight, Phone, Sparkles, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DriverAlerts = () => {
  const { token } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/transport/alerts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setAlerts(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAlerts();
  }, [token]);

  if (loading) return <div className="py-20 text-center text-slate-400 animate-pulse font-bold">Checking Hazards...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-black text-slate-800 tracking-tight">Active Alerts</h1>
         <div className="bg-red-50 px-3 py-1.5 rounded-full text-[10px] font-bold text-red-600 uppercase tracking-widest">{alerts.length} Critical</div>
      </div>

      <div className="space-y-4">
         {alerts.map(alert => (
            <div key={alert.alert_id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-300">
               <div className={`px-6 py-2 flex items-center justify-between ${
                  alert.severity === 'high' || alert.severity === 'critical' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
               }`}>
                  <div className="flex items-center gap-2">
                     <AlertTriangle className="w-4 h-4" />
                     <span className="text-[10px] font-black uppercase tracking-widest">{alert.alert_type} Warning</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase">{new Date(alert.created_at).toLocaleTimeString()}</span>
               </div>
               
               <div className="p-6 space-y-4">
                  <p className="text-sm font-bold text-slate-800 leading-tight">{alert.message}</p>
                  
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                     <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">AI Suggested Action</p>
                     </div>
                     <p className="text-xs text-slate-600 font-medium">Verify cooling vent is clear and check door seals immediately. If temperature does not drop within 5 mins, reroute to nearest storage.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <Link to="/driver/ai" className="flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200">
                        Help from AI
                     </Link>
                     <button className="flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-[10px] uppercase tracking-widest">
                        Acknowledge
                     </button>
                  </div>
               </div>
            </div>
         ))}

         {alerts.length === 0 && (
            <div className="py-20 text-center space-y-4">
               <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-xl shadow-emerald-100">
                  <CheckCircle2 className="w-10 h-10" />
               </div>
               <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">All systems safe</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default DriverAlerts;
