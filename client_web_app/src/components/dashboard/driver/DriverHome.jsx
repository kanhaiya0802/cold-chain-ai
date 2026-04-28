import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { 
  Truck, MapPin, CheckCircle2, AlertTriangle, 
  Battery, Thermometer, ChevronRight, Play, 
  Phone, MessageSquare, AlertCircle, Map as MapIcon,
  Navigation, Zap, Clock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import FleetMap from '../FleetMap';
import useWebSocket from '../../../hooks/useWebSocket';

const StatCard = ({ label, value, sub, icon: Icon, color }) => (
  <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm">
    <div className="flex items-center gap-3 mb-3">
      <div className={`p-2.5 rounded-xl bg-${color}-50 text-${color}-600`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
    <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{sub}</p>
  </div>
);

const DriverHome = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeShipment, setActiveShipment] = useState(null);
  const { truckLogs, connected } = useWebSocket(token);

  const fetchShipments = async () => {
    try {
      const res = await fetch('/api/transport/shipments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setShipments(data);
        const active = data.find(s => s.shipment_status === 'in_transit' || s.shipment_status === 'loading');
        if (active) setActiveShipment(active);
        else if (data.length > 0) setActiveShipment(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchShipments();
      const interval = setInterval(fetchShipments, 15000); 
      return () => clearInterval(interval);
    }
  }, [token]);

  // Filter logs to only show the truck assigned to this driver
  const myTruckLog = activeShipment ? truckLogs[activeShipment.truck_id] : null;
  const mapData = myTruckLog ? [myTruckLog] : (activeShipment?.latest_telemetry ? [{
      ...activeShipment.latest_telemetry,
      truck_id: activeShipment.truck_id,
      location: { 
          latitude: activeShipment.latest_telemetry.latitude, 
          longitude: activeShipment.latest_telemetry.longitude 
      }
  }] : []);

  if (loading) return <div className="text-center py-20 text-slate-400 animate-pulse font-bold uppercase tracking-widest">Initializing Terminal...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* ── Welcome & Status Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Shift: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Mission <span className="text-emerald-600">Control</span></h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Ready for dispatch, {user?.name}. Operational integrity is at 98%.</p>
        </div>
        <div className="flex gap-2">
           <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Phone className="w-5 h-5" />
           </button>
           <button onClick={() => navigate('/driver/report')} className="px-6 py-3 bg-red-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-red-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Report Emergency
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Main Operational View ── */}
        <div className="lg:col-span-8 space-y-8">
           
           {/* Live Telemetry Map (Real Control Panel) */}
           <div className="bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border border-slate-800 flex flex-col h-[500px]">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                       <Navigation className="w-5 h-5 text-emerald-400 animate-pulse" />
                    </div>
                    <div>
                       <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Route Telemetry</h3>
                       <p className="text-[10px] text-slate-500 font-bold uppercase">Truck ID: {activeShipment?.truck_id || 'TBD'}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <span className={`px-2 py-0.5 ${connected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'} text-[9px] font-bold rounded-full uppercase tracking-widest border border-emerald-500/30`}>
                       {connected ? '🛰️ Link Active' : '📡 Signal Search'}
                    </span>
                 </div>
              </div>

              <div className="flex-1 relative">
                 <FleetMap truckArray={mapData} connected={connected} />
                 
                 {/* Floating Metrics Overlay */}
                 <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-4 pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex items-center gap-3 pointer-events-auto">
                       <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                          <Thermometer className="w-4 h-4" />
                       </div>
                       <div>
                          <p className="text-[9px] font-bold text-slate-500 uppercase">Temp</p>
                          <p className="text-sm font-black text-white">{myTruckLog?.temperature || activeShipment?.latest_telemetry?.temperature || '--'}°C</p>
                       </div>
                    </div>
                    <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex items-center gap-3 pointer-events-auto">
                       <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-400">
                          <Battery className="w-4 h-4" />
                       </div>
                       <div>
                          <p className="text-[9px] font-bold text-slate-500 uppercase">Power</p>
                          <p className="text-sm font-black text-white">{Math.round(myTruckLog?.battery_level || activeShipment?.latest_telemetry?.battery_level || 0)}%</p>
                       </div>
                    </div>
                    <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex items-center gap-3 pointer-events-auto">
                       <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
                          <Zap className="w-4 h-4" />
                       </div>
                       <div>
                          <p className="text-[9px] font-bold text-slate-500 uppercase">Signal</p>
                          <p className="text-sm font-black text-white">Full</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Assignment & Actions */}
           <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-lg font-bold text-slate-800">Mission Parameters</h3>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ETA: 45 Minutes</span>
              </div>
              <div className="flex flex-col md:flex-row gap-6">
                 <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                          <MapPin className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Next Delivery Stop</p>
                          <p className="text-sm font-bold text-slate-800">Apollo Medical Center, Block 7</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Bengaluru City, 560001</p>
                       </div>
                    </div>
                 </div>
                 <div className="flex-shrink-0 flex flex-col gap-3 min-w-[200px]">
                    <button className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2">
                       <Navigation className="w-4 h-4 fill-white" /> Start Navigation
                    </button>
                    <button onClick={() => navigate('/driver/proof')} className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                       <CheckCircle2 className="w-4 h-4" /> Confirm Delivery
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* ── Sidebar Stats & Alerts ── */}
        <div className="lg:col-span-4 space-y-6">
           <StatCard 
             label="Delivery Streak" 
             value="12/12" 
             sub="99.2% Success Rate" 
             icon={CheckCircle2} 
             color="emerald" 
           />
           <StatCard 
             label="Driving Hours" 
             value="4h 20m" 
             sub="Next Break in 1h 40m" 
             icon={Clock} 
             color="blue" 
           />
           
           <div className="p-6 bg-amber-600 rounded-[24px] text-white shadow-xl shadow-amber-100 relative overflow-hidden group cursor-pointer hover:bg-amber-500 transition-all">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-125 transition-transform"></div>
              <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">AI Co-Pilot Advice</span>
                 </div>
                 <p className="text-sm font-bold leading-snug mb-4">Traffic build-up detected on Main Road. Suggesting alternative route via Hebbal Flyover.</p>
                 <Link to="/driver/ai" className="text-[10px] font-black uppercase underline tracking-widest decoration-2 underline-offset-4">Open AI Analysis</Link>
              </div>
           </div>

           <div className="p-6 bg-white border border-slate-100 rounded-[24px] shadow-sm">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Dispatch Comms</h4>
              <div className="space-y-4">
                 {[
                   { user: 'HQ Dispatch', msg: 'New pickup at 16:00', time: '10m ago' },
                   { user: 'Apollo Hospital', msg: 'Wait at Gate 4', time: '1h ago' },
                 ].map((msg, i) => (
                    <div key={i} className="flex gap-3">
                       <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">{msg.user.charAt(0)}</div>
                       <div>
                          <p className="text-xs font-bold text-slate-800">{msg.user}</p>
                          <p className="text-[11px] text-slate-500">{msg.msg}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">{msg.time}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DriverHome;
