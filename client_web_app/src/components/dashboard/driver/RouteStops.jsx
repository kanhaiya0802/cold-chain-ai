import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { 
  MapPin, CheckCircle2, Navigation, Phone, 
  ChevronRight, ScanLine, XCircle, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const RouteStops = () => {
  const { token } = useContext(AuthContext);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo, we just fetch stops for the first assigned shipment
    const fetchStops = async () => {
      try {
        const shipRes = await fetch('http://127.0.0.1:8000/transport/shipments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (shipRes.ok) {
           const shipments = await shipRes.json();
           if (shipments.length > 0) {
              const stopRes = await fetch(`http://127.0.0.1:8000/transport/shipments/${shipments[0].shipment_id}/stops`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (stopRes.ok) setStops(await stopRes.json());
           }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchStops();
  }, [token]);

  if (loading) return <div className="py-20 text-center text-slate-400 animate-pulse font-bold">Optimizing Route...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-black text-slate-800 tracking-tight">Delivery Stops</h1>
         <div className="bg-emerald-100 px-3 py-1.5 rounded-full text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Optimized</div>
      </div>

      <div className="relative space-y-8 pl-4">
         {/* Vertical Timeline Line */}
         <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100"></div>

         {stops.map((stop, index) => (
            <div key={stop.id} className="relative z-10 flex gap-6">
               {/* Timeline Node */}
               <div className={`w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-black shadow-md shrink-0 ${
                  stop.delivery_status === 'delivered' ? 'bg-emerald-500 text-white' : 
                  stop.delivery_status === 'reached' ? 'bg-indigo-500 text-white' :
                  'bg-white text-slate-400 border-slate-100'
               }`}>
                  {stop.delivery_status === 'delivered' ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
               </div>

               <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                     <div>
                        <h3 className="font-bold text-slate-800">Stop #{index + 1}</h3>
                        <p className="text-xs text-slate-400 font-medium">Order ID: #{stop.order_id}</p>
                     </div>
                     <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                        stop.delivery_status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'
                     }`}>
                        {stop.delivery_status}
                     </span>
                  </div>

                  <div className="space-y-3">
                     <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                        <p className="text-sm font-bold text-slate-700 leading-tight">Apollo Medical Center, Tower B, Sector 12</p>
                     </div>
                     <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-slate-300 shrink-0" />
                        <p className="text-xs font-medium text-slate-500">ETA: <span className="text-slate-800 font-bold">14:45</span></p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                     {stop.delivery_status === 'pending' ? (
                        <>
                           <button className="flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest">
                              <Navigation className="w-3.5 h-3.5" /> Navigate
                           </button>
                           <Link 
                             to={`/driver/proof?order_id=${stop.order_id}&shipment_id=${stop.shipment_id}&receiver_id=${stop.receiver_id}`} 
                             className="flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest"
                           >
                              <ScanLine className="w-3.5 h-3.5" /> Check-In
                           </Link>
                        </>
                     ) : (
                        <div className="col-span-2 text-center py-2 bg-slate-50 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                           Stop Completed
                        </div>
                     )}
                  </div>
               </div>
            </div>
         ))}
      </div>

      <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-4">
         <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 text-blue-600">
            <Phone className="w-5 h-5" />
         </div>
         <div>
            <p className="text-xs font-bold text-slate-800">Support Line</p>
            <p className="text-[10px] text-blue-600 font-medium leading-tight">In case of route deviation or receiver unavailability, call dispatch center immediately.</p>
         </div>
      </div>
    </div>
  );
};

export default RouteStops;
