import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { Truck, Calendar, Clock, MapPin, ChevronRight, PlayCircle, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyShipments = () => {
  const { token } = useContext(AuthContext);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/transport/shipments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setShipments(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchShipments();
  }, [token]);

  if (loading) return <div className="py-20 text-center text-slate-400 animate-pulse font-bold">Loading Assignments...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-black text-slate-800 tracking-tight">Job Queue</h1>
         <div className="bg-white border border-slate-100 px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">{shipments.length} Tasks</div>
      </div>

      <div className="space-y-4">
         {shipments.map(shipment => (
            <div key={shipment.shipment_id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5 group hover:border-emerald-200 transition-all">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Truck className="w-5 h-5" />
                     </div>
                     <div>
                        <h3 className="font-bold text-slate-800">Job #{shipment.shipment_id}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Truck: {shipment.truck_id}</p>
                     </div>
                  </div>
                  <button className="text-slate-300 hover:text-slate-600"><MoreVertical className="w-5 h-5" /></button>
               </div>

               <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Status</p>
                     <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                           shipment.shipment_status === 'in_transit' ? 'bg-emerald-500 animate-pulse' :
                           shipment.shipment_status === 'planned' ? 'bg-blue-500' : 'bg-slate-300'
                        }`}></div>
                        <span className="text-xs font-bold text-slate-700 capitalize">{shipment.shipment_status}</span>
                     </div>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Stops</p>
                     <p className="text-xs font-bold text-slate-700">3 Delivery Points</p>
                  </div>
               </div>

               <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                     <Clock className="w-3.5 h-3.5" />
                     {shipment.start_time ? new Date(shipment.start_time).toLocaleTimeString() : 'TBD'}
                  </div>
                  <Link 
                    to="/driver/route" 
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-600 hover:bg-emerald-600 hover:text-white font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all"
                  >
                     Open Manifest <ChevronRight className="w-4 h-4" />
                  </Link>
               </div>
            </div>
         ))}

         {shipments.length === 0 && (
            <div className="py-20 text-center space-y-4">
               <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <Truck className="w-10 h-10" />
               </div>
               <p className="text-slate-400 font-medium">No shipments assigned to you yet.</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default MyShipments;
