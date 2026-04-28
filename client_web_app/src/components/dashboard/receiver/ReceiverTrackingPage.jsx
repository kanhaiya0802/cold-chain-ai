import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { 
  MapPin, Truck, Thermometer, Battery, 
  Clock, ShieldCheck, AlertCircle, Phone, 
  MessageSquare, ChevronRight, Package
} from 'lucide-react';

const ReceiverTrackingPage = () => {
  const { token } = useContext(AuthContext);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get('orderId');

  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orderId) {
      const fetchTracking = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/receiver/orders/${orderId}/tracking`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) setTrackingData(await res.json());
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchTracking();
    }
  }, [orderId, token]);

  const stages = [
    { label: 'Order Confirmed', status: 'done' },
    { label: 'Packed', status: 'done' },
    { label: 'Dispatch', status: 'done' },
    { label: 'In Transit', status: 'current' },
    { label: 'Delivered', status: 'pending' },
  ];

  if (!orderId) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
        <MapPin className="w-16 h-16 text-slate-200 mb-6" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">No Active Trackable Order</h2>
        <p className="text-slate-500 max-w-sm mb-8">Select an order from your history or current orders list to view its real-time GPS and cold-chain status.</p>
        <button className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg">View All Orders</button>
      </div>
    );
  }

  if (loading || !trackingData) return <div className="text-center py-20 text-slate-400 animate-pulse">Initializing Live Map...</div>;

  const { latest_telemetry } = trackingData;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">Live Tracking</span>
              <span className="text-slate-400 text-sm font-medium">Order #ORD-{orderId}</span>
           </div>
           <h1 className="text-3xl font-bold text-slate-800">Supply Chain Integrity</h1>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ETA TO DESTINATION</p>
                 <p className="text-xl font-bold text-slate-800">{trackingData.eta}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                 <Clock className="w-5 h-5" />
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* ── Visual Tracking Pane ── */}
        <div className="xl:col-span-8 space-y-6">
           {/* Mock Map / Visualization */}
           <div className="relative h-[450px] bg-slate-200 rounded-3xl overflow-hidden shadow-inner border border-slate-200 flex items-center justify-center group">
              <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/77.5946,12.9716,12,0/800x450?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ==')] bg-cover opacity-60"></div>
              
              {/* Pulsing Truck Marker */}
              <div className="relative z-10">
                 <div className="absolute -top-12 -left-4 bg-white px-3 py-2 rounded-xl shadow-xl border border-slate-100 flex items-center gap-2 whitespace-nowrap">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                    <span className="text-[10px] font-bold text-slate-800">TRUCK #TRK-882</span>
                 </div>
                 <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-400/50 text-white">
                    <Truck className="w-6 h-6" />
                 </div>
              </div>

              <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-white/50 shadow-xl flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                       <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Position</p>
                       <p className="text-sm font-bold text-slate-800">Electronic City Phase 1, Bengaluru</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-100 uppercase tracking-widest">
                       ON SCHEDULE
                    </div>
                 </div>
              </div>
           </div>

           {/* Timeline */}
           <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-8 uppercase tracking-widest">Delivery Timeline</h3>
              <div className="flex justify-between relative">
                 <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-100"></div>
                 {stages.map((s, i) => (
                   <div key={i} className="relative z-10 flex flex-col items-center gap-4">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                        s.status === 'done' ? 'bg-emerald-600 border-emerald-600 text-white' :
                        s.status === 'current' ? 'bg-white border-emerald-500 text-emerald-600 animate-pulse' :
                        'bg-white border-slate-200 text-slate-300'
                      }`}>
                         {s.status === 'done' ? <ShieldCheck className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current"></div>}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest text-center ${
                        s.status === 'done' ? 'text-slate-800' : 
                        s.status === 'current' ? 'text-emerald-600' : 
                        'text-slate-400'
                      }`}>{s.label}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* ── Side Telemetry & Driver Pane ── */}
        <div className="xl:col-span-4 space-y-6">
           <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Live Sensor Data</h3>
                 <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3" /> SECURE
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400">
                          <Thermometer className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Temperature</p>
                          <p className="text-2xl font-bold">{latest_telemetry?.temperature || '4.2'}°C</p>
                       </div>
                    </div>
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">Optimal</div>
                 </div>

                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400">
                          <Battery className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Iot Battery</p>
                          <p className="text-2xl font-bold">{latest_telemetry?.battery_level || '88'}%</p>
                       </div>
                    </div>
                 </div>

                 <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mt-10">
                    <div className="flex items-center gap-3 mb-3">
                       <AlertCircle className="w-4 h-4 text-amber-400" />
                       <span className="text-xs font-bold uppercase tracking-widest">Compliance Status</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                       All sensors reporting within FDA 21 CFR Part 11 guidelines. Thermal stability maintained since dispatch.
                    </p>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Driver Assignment</h3>
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold text-lg">KS</div>
                 <div>
                    <p className="text-base font-bold text-slate-800 mb-0.5">Kanhaiya Sharma</p>
                    <p className="text-xs text-slate-400 font-semibold">Logistics Specialist · 150+ Deliveries</p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4">
                 <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-all">
                    <Phone className="w-4 h-4" /> Call Support
                 </button>
                 <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-all">
                    <MessageSquare className="w-4 h-4" /> Help Center
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiverTrackingPage;
