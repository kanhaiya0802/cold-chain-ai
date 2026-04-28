import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Truck, MapPin, Navigation, BatteryWarning, AlertOctagon, Bot } from 'lucide-react';

const DriverPortal = () => {
  const { token, user } = useContext(AuthContext);
  const [shipments, setShipments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shipRes, alertRes] = await Promise.all([
          fetch('/api/shipments', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/alerts', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (shipRes.ok) setShipments(await shipRes.json());
        if (alertRes.ok) setAlerts(await alertRes.json());
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) fetchData();
  }, [token]);

  // For demo, just grab the first active shipment
  const myShipment = shipments.find(s => s.shipment_status !== 'completed');
  const myAlert = alerts.find(a => a.shipment_id === myShipment?.shipment_id && a.status === 'active');

  if (loading) return <div className="text-center py-20 text-slate-400 animate-pulse text-lg">Loading route...</div>;

  return (
    <div className="space-y-6 max-w-md mx-auto pb-20">
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
          <Truck className="w-48 h-48" />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white mb-1">Route & Diagnostics</h1>
          <p className="text-slate-400 text-sm mb-6">Driver ID: {user?.sub}</p>
          
          {myShipment ? (
            <div className="space-y-6">
              {/* Route Info */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Navigation className="text-blue-400 w-5 h-5" />
                    <h2 className="text-white font-semibold">Active Run #{myShipment.shipment_id}</h2>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-blue-500/20 text-blue-400">In Transit</span>
                </div>
                
                <div className="relative pl-6 space-y-4 border-l-2 border-slate-800 ml-2 mt-2">
                   <div className="relative">
                     <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-slate-600 border-2 border-slate-950"></div>
                     <p className="text-sm text-slate-300">Central Warehouse</p>
                     <p className="text-xs text-slate-500">Departed 08:00 AM</p>
                   </div>
                   <div className="relative">
                     <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-950 animate-pulse"></div>
                     <p className="text-sm text-white font-medium">Hospital A <span className="text-blue-400 text-xs ml-2">(Next Stop)</span></p>
                     <p className="text-xs text-slate-500">ETA: 14 Mins</p>
                   </div>
                </div>
              </div>

              {/* Live Diagnostics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <BatteryWarning className="text-yellow-400 w-6 h-6 mb-2" />
                  <p className="text-2xl font-bold text-white">82%</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Cooling Battery</p>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <MapPin className="text-emerald-400 w-6 h-6 mb-2" />
                  <p className="text-xl font-bold text-white">Optimum</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Route Efficiency</p>
                </div>
              </div>

              {/* AI Copilot Alert */}
              {myAlert ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertOctagon className="text-red-400 w-5 h-5 animate-pulse" />
                    <h3 className="text-red-400 font-bold">AI Reroute Needed</h3>
                  </div>
                  <p className="text-sm text-red-200/80 leading-relaxed mb-3">
                    {myAlert.message}
                  </p>
                  <button className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 py-2 rounded-xl text-sm font-medium transition-colors">
                    Acknowledge & Navigate
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex items-start gap-3">
                  <Bot className="text-emerald-400 w-5 h-5 mt-0.5" />
                  <div>
                    <h3 className="text-emerald-400 font-medium text-sm">AI Copilot Active</h3>
                    <p className="text-xs text-slate-400 mt-1">Monitoring route traffic and cooling unit performance. No anomalies detected.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-950 border border-slate-800 border-dashed rounded-2xl">
               <p className="text-slate-500">No active shipments assigned to you.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverPortal;
