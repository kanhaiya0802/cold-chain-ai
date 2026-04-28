import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { Truck, Navigation, Calendar, Activity, ArrowRight, ShieldCheck, Clock, MapPin } from 'lucide-react';

const ShipmentsPage = () => {
  const { token } = useContext(AuthContext);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/shipments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setShipments(await res.json());
        }
      } catch (err) {
        console.error("Error fetching shipments:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchShipments();
  }, [token]);

  if (loading) return <div className="text-center py-20 text-slate-400 animate-pulse text-lg">Loading Fleet Dispatch...</div>;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Fleet Dispatch & Shipments</h1>
          <p className="text-slate-400">Manage active shipments, truck assignments, and delivery routing.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/20">
          <Truck className="w-4 h-4" />
          Create Shipment
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {shipments.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 shadow-xl">
            <Truck className="w-12 h-12 mx-auto mb-4 text-slate-600" />
            <h3 className="text-lg font-medium text-slate-300 mb-1">No Active Shipments</h3>
            <p>You have no fleets currently dispatched.</p>
          </div>
        ) : (
          shipments.map((ship) => (
            <div key={ship.shipment_id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-colors">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                {/* Truck & Driver Info */}
                <div className="flex items-start gap-4 min-w-[250px]">
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <Truck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      Shipment #{ship.shipment_id}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Truck: <span className="text-slate-300">{ship.truck_id}</span>
                    </p>
                  </div>
                </div>

                {/* Timeline & Status */}
                <div className="flex-1 w-full bg-slate-950/50 rounded-xl p-4 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Current Location</p>
                    <p className="text-sm font-medium text-slate-200">
                      {ship.latest_telemetry ? `${ship.latest_telemetry.latitude}, ${ship.latest_telemetry.longitude}` : "Hub Terminal"}
                    </p>
                  </div>
                  
                  <div className="flex-1 px-4 relative flex flex-col items-center">
                    <div className="h-px bg-slate-700 w-full absolute top-1/2 -translate-y-1/2"></div>
                    <span className={`relative z-10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      ship.shipment_status === 'in_transit' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      ship.shipment_status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {ship.shipment_status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-end gap-1"><Activity className="w-3 h-3"/> Temp Health</p>
                    <p className={`text-sm font-bold ${ship.latest_telemetry?.temperature > 8 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {ship.latest_telemetry ? `${ship.latest_telemetry.temperature}°C` : "--"}
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex flex-col items-end gap-2 min-w-[150px]">
                   <div className="text-right">
                     <p className="text-xs text-slate-500 flex items-center justify-end gap-1 mb-1"><Clock className="w-3 h-3" /> Last Update</p>
                     <p className="text-[10px] text-slate-400 font-mono">
                        {ship.latest_telemetry ? new Date(ship.latest_telemetry.recorded_at).toLocaleTimeString() : "No Signal"}
                     </p>
                   </div>
                   <button className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors mt-2">
                     Full Logs <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ShipmentsPage;
