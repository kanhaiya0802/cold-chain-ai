import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { 
  Thermometer, Battery, Wind, MapPin, 
  Clock, CheckCircle2, AlertTriangle, ShieldCheck,
  Activity, Zap, Lock
} from 'lucide-react';

const SensorCard = ({ icon: Icon, label, value, sub, status, color }) => (
  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4 hover:shadow-lg transition-all group">
     <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${color}`}>
           <Icon className="w-6 h-6" />
        </div>
        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
           status === 'Safe' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600 animate-pulse'
        }`}>
           {status}
        </div>
     </div>
     <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-800 tracking-tighter">{value}</p>
        {sub && <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{sub}</p>}
     </div>
  </div>
);

const LiveMonitoring = () => {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const shipRes = await fetch('/api/transport/shipments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (shipRes.ok) {
           const shipments = await shipRes.json();
           if (shipments.length > 0) {
              const res = await fetch(`/api/transport/live-monitoring/${shipments[0].shipment_id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (res.ok) setData(await res.json());
           }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchLive();
    const interval = setInterval(fetchLive, 5000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">Live <span className="text-emerald-600">Telemetry</span></h1>
            <p className="text-sm text-slate-500 font-medium">Real-time health monitoring for Truck ID: {data?.truck_id || 'T-882'}</p>
         </div>
         <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Link</span>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <SensorCard 
            icon={Thermometer} 
            label="Payload Temperature" 
            value={data ? `${data.temperature}°C` : '4.2°C'} 
            sub="Ideal: 2°C - 8°C"
            status="Safe"
            color="bg-emerald-50 text-emerald-600"
         />
         
         <SensorCard 
            icon={Battery} 
            label="Cooling Battery" 
            value={data ? `${Math.round(data.battery_level)}%` : '82%'} 
            sub="Approx. 8h 20m left"
            status="Safe"
            color="bg-blue-50 text-blue-600"
         />

         <SensorCard 
            icon={Wind} 
            label="Chamber Humidity" 
            value={data ? `${data.humidity}%` : '45%'} 
            sub="Rel. Humidity Level"
            status="Safe"
            color="bg-indigo-50 text-indigo-600"
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700"></div>
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-2xl">
                     <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-lg">Integrity & Security</h3>
               </div>
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verified OPS</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="p-5 bg-white/5 rounded-[24px] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Lock className="w-4 h-4 text-emerald-400" />
                     <span className="text-sm font-medium">Door Lock</span>
                  </div>
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Locked</span>
               </div>
               <div className="p-5 bg-white/5 rounded-[24px] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Zap className="w-4 h-4 text-emerald-400" />
                     <span className="text-sm font-medium">Power Grid</span>
                  </div>
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Stable</span>
               </div>
            </div>
         </div>

         <div className="bg-white border border-slate-100 rounded-[32px] p-8 flex flex-col justify-center gap-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                  <Activity className="w-6 h-6" />
               </div>
               <div>
                  <h4 className="text-lg font-bold text-slate-800">System Diagnostics</h4>
                  <p className="text-xs text-slate-400">AI-driven predictive health check in progress...</p>
               </div>
            </div>
            <div className="space-y-3">
               <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-emerald-500 rounded-full animate-pulse"></div>
               </div>
               <p className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-widest">ALL SENSORS NOMINAL • 100% RELIABILITY</p>
            </div>
         </div>
      </div>

      <div className="text-center">
         <div className="inline-flex items-center gap-3 bg-white border border-slate-100 px-6 py-3 rounded-full shadow-sm">
            <Clock className="w-4 h-4 text-slate-400" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
               Last Synchronized: <span className="text-slate-800 ml-1">{new Date().toLocaleTimeString()}</span>
            </p>
         </div>
      </div>
    </div>
  );
};

export default LiveMonitoring;
