import React, { useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import FleetMap from '../FleetMap';
import useWebSocket from '../../../hooks/useWebSocket';
import { Map, Zap, Thermometer, Droplets, Battery, DoorOpen, DoorClosed, ArrowLeft, Activity } from 'lucide-react';

const TrackingPage = () => {
  const { token } = useContext(AuthContext);
  const { truckLogs, connected } = useWebSocket(token);
  const [selectedTruckId, setSelectedTruckId] = useState(null);

  // Derive selected truck from real-time WS data, so the panel updates live
  const selectedTruck = selectedTruckId ? truckLogs[selectedTruckId] : null;

  return (
    <div className="h-full min-h-[calc(100vh-10rem)] flex flex-col space-y-4">
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Live Fleet Tracking</h1>
          <p className="text-slate-400">Real-time GPS and telemetry streaming directly from active trucks.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium border ${
             connected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
           }`}>
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
              {connected ? 'WebSocket Connected' : 'Disconnected'}
           </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl relative min-h-[600px]">
        <div className="absolute inset-0 z-0">
           <FleetMap 
              truckArray={Object.values(truckLogs)} 
              connected={connected} 
              onTruckSelect={(truck) => setSelectedTruckId(truck ? truck.truck_id : null)} 
           />
        </div>
        
        {/* Floating Control Panel */}
        <div className="absolute top-4 left-4 z-10 w-80 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-2xl transition-all">
           
           {!selectedTruck ? (
             // Overview Panel
             <>
               <div className="flex items-center gap-2 text-slate-200 font-semibold mb-5">
                 <Map className="w-5 h-5 text-blue-400" />
                 Active Logistics
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm pb-3 border-b border-slate-800">
                     <span className="text-slate-400">Total Monitored</span>
                     <span className="text-white font-bold text-lg">{Object.keys(truckLogs).length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pb-3 border-b border-slate-800">
                     <span className="text-slate-400">High Risk Status</span>
                     <span className="text-red-400 font-bold text-lg">
                       {Object.values(truckLogs).filter(t => t.temperature > 8).length}
                     </span>
                  </div>
               </div>
               <p className="text-xs text-slate-500 mt-4 italic">Click on any truck marker on the map to view detailed live telemetry.</p>
               <button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20">
                 <Zap className="w-4 h-4" /> Run AI Route Audit
               </button>
             </>
           ) : (
             // Detailed Truck Panel
             <div className="animate-in fade-in slide-in-from-left-4 duration-300">
               <button 
                 onClick={() => setSelectedTruckId(null)}
                 className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 mb-4 transition-colors"
               >
                 <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
               </button>
               
               <div className="flex items-center justify-between mb-5">
                 <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <TruckIcon /> Truck {selectedTruck.truck_id}
                 </h2>
                 <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border ${
                    selectedTruck.temperature > 8 ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    selectedTruck.temperature > 7 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                 }`}>
                   {selectedTruck.temperature > 8 ? 'Breach' : selectedTruck.temperature > 7 ? 'Warning' : 'Safe'}
                 </span>
               </div>

               <div className="grid grid-cols-2 gap-3 mb-5">
                  {/* Temperature */}
                  <div className={`p-3 rounded-xl border ${selectedTruck.temperature > 8 ? 'bg-red-500/10 border-red-500/20' : 'bg-slate-900 border-slate-700'}`}>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1"><Thermometer className="w-3 h-3"/> Temp</p>
                    <p className={`text-xl font-bold ${selectedTruck.temperature > 8 ? 'text-red-400' : 'text-white'}`}>
                      {selectedTruck.temperature?.toFixed(1)}°C
                    </p>
                  </div>
                  
                  {/* Humidity */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1"><Droplets className="w-3 h-3 text-blue-400"/> Humidity</p>
                    <p className="text-xl font-bold text-white">{selectedTruck.humidity?.toFixed(1)}%</p>
                  </div>

                  {/* Battery */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1"><Battery className="w-3 h-3 text-emerald-400"/> Battery</p>
                    <p className={`text-xl font-bold ${selectedTruck.battery_level < 20 ? 'text-red-400' : 'text-white'}`}>
                      {selectedTruck.battery_level?.toFixed(0)}%
                    </p>
                  </div>

                  {/* Door Status */}
                  <div className={`p-3 rounded-xl border ${selectedTruck.door_status === 'open' ? 'bg-orange-500/10 border-orange-500/20' : 'bg-slate-900 border-slate-700'}`}>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1">
                      {selectedTruck.door_status === 'open' ? <DoorOpen className="w-3 h-3 text-orange-400"/> : <DoorClosed className="w-3 h-3 text-slate-400"/>} 
                      Door
                    </p>
                    <p className={`text-lg font-bold capitalize ${selectedTruck.door_status === 'open' ? 'text-orange-400' : 'text-slate-300'}`}>
                      {selectedTruck.door_status}
                    </p>
                  </div>
               </div>

               <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 mb-6">
                 <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">GPS Coordinates</p>
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-400">Lat: <span className="text-slate-200 font-mono">{selectedTruck.location?.latitude?.toFixed(5)}</span></span>
                   <span className="text-slate-400">Lng: <span className="text-slate-200 font-mono">{selectedTruck.location?.longitude?.toFixed(5)}</span></span>
                 </div>
               </div>

               <button className="w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700">
                 <Activity className="w-4 h-4 text-blue-400" /> View Sensor History
               </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

// Quick helper for icon
const TruckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-9h-5v9h-2"/><path d="M15 8h4l3 3v6h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
);

export default TrackingPage;
