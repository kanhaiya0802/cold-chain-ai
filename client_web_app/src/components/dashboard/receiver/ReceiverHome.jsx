import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Truck, CheckCircle2, AlertTriangle, 
  Clock, TrendingUp, ChevronRight, MapPin, 
  ThermometerSnowflake, Calendar, FileCheck, Plus, ShieldCheck, Sparkles
} from 'lucide-react';

const KPICard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500 uppercase tracking-tighter">
          {trend}
        </span>
      )}
    </div>
    <p className="text-3xl font-bold text-slate-800 mb-1">{value}</p>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
  </div>
);

const ReceiverHome = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeShipment, setActiveShipment] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/receiver/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setStats(await res.json());
        else setStats({ active_orders: 0, in_transit: 0, delivered_total: 0, delayed_orders: 0, pending_approvals: 0, avg_delivery_time: '0h' });
      } catch (err) {
        setStats({ active_orders: 0, in_transit: 0, delivered_total: 0, delayed_orders: 0, pending_approvals: 0, avg_delivery_time: '0h' });
      } finally {
        setLoading(false);
      }
    };

    const fetchActiveShipment = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/receiver/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const orders = await res.json();
          const inTransit = orders.find(o => o.status === 'dispatched' || o.status === 'in_transit');
          if (inTransit) {
            const trackRes = await fetch(`http://127.0.0.1:8000/receiver/orders/${inTransit.order_id}/tracking`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (trackRes.ok) setActiveShipment(await trackRes.json());
          }
        }
      } catch (err) { }
    };

    if (token) {
      fetchStats();
      fetchActiveShipment();
    }
  }, [token]);

  if (loading) return (
    <div className="space-y-8 animate-pulse p-4">
      <div className="h-20 bg-white rounded-3xl w-1/3"></div>
      <div className="grid grid-cols-6 gap-4">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 bg-white rounded-2xl"></div>)}
      </div>
      <div className="h-64 bg-white rounded-[32px]"></div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* ── Welcome Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">Terminal <span className="text-emerald-600">Overview</span></h1>
          <p className="text-slate-500 font-medium">Hello, {user?.name}. Your medical cold-chain is <span className="text-emerald-600 font-bold">Secure</span>.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/receiver/place-order')} className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-200 hover:bg-emerald-500 transition-all flex items-center gap-2">
             <Plus className="w-4 h-4" /> New Procurement
          </button>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        <KPICard title="Active Orders" value={stats?.active_orders || 0} icon={Package} color="blue" />
        <KPICard title="In Transit" value={stats?.in_transit || 0} icon={Truck} color="indigo" />
        <KPICard title="Delivered (Mo)" value={stats?.delivered_total || 0} icon={CheckCircle2} color="emerald" trend="+12%" />
        <KPICard title="Delayed" value={stats?.delayed_orders || 0} icon={AlertTriangle} color="red" />
        <KPICard title="Pending Appr" value={stats?.pending_approvals || 0} icon={Clock} color="amber" />
        <KPICard title="Avg Time" value={stats?.avg_delivery_time || '0h'} icon={TrendingUp} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Operational Pipeline</h3>
              <button onClick={() => navigate('/receiver/my-orders')} className="text-sm font-bold text-emerald-600 hover:underline">Full History</button>
           </div>
           
           <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
              
              <div className="relative flex justify-between mb-12">
                 <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-100 -z-0"></div>
                 {[
                   { label: 'Request', icon: Package, active: true },
                   { label: 'Verification', icon: ShieldCheck, active: true },
                   { label: 'Transit', icon: MapPin, active: !!activeShipment },
                   { label: 'Arrival', icon: CheckCircle2, active: false },
                 ].map((step, i) => (
                    <div key={i} className="relative z-10 flex flex-col items-center gap-3">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all shadow-sm ${
                         step.active ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-300'
                       }`}>
                          <step.icon className="w-5 h-5" />
                       </div>
                       <span className={`text-[10px] font-bold uppercase tracking-widest ${step.active ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</span>
                    </div>
                 ))}
              </div>
              
              {activeShipment ? (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Truck className="text-indigo-600 w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Live Shipment Tracking</p>
                        <p className="text-sm font-bold text-slate-800">
                            Shipment #{activeShipment.shipment_id} is at {activeShipment.latest_telemetry?.latitude}, {activeShipment.latest_telemetry?.longitude}
                        </p>
                      </div>
                  </div>
                  <button onClick={() => navigate('/receiver/track')} className="px-6 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all shadow-sm">
                      Track Live
                  </button>
                </div>
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-[24px]">
                   <Package className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                   <p className="text-sm font-bold text-slate-400">No active shipments in transit.</p>
                   <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-1">Orders placed will appear here</p>
                </div>
              )}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div onClick={() => navigate('/receiver/place-order')} className="p-6 bg-indigo-600 rounded-[24px] text-white shadow-xl shadow-indigo-100 flex flex-col justify-between h-48 group cursor-pointer hover:scale-[1.02] transition-all">
                 <div className="flex justify-between items-start">
                    <div className="p-3 bg-white/20 rounded-xl">
                       <Plus className="w-6 h-6" />
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100" />
                 </div>
                 <div>
                    <h4 className="text-lg font-bold">New Procurement</h4>
                    <p className="text-xs text-indigo-100">Browse verified warehouses and place medical orders.</p>
                 </div>
              </div>
              <div className="p-6 bg-white border border-slate-100 rounded-[24px] shadow-sm flex flex-col justify-between h-48 group cursor-pointer hover:bg-slate-50 transition-all">
                 <div className="flex justify-between items-start">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                       <FileCheck className="w-6 h-6" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600" />
                 </div>
                 <div>
                    <h4 className="text-lg font-bold text-slate-800">Compliance Hub</h4>
                    <p className="text-xs text-slate-400">Download temperature certificates and safety logs.</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="space-y-8">
           <div className="p-8 bg-slate-900 rounded-[32px] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-12 -mt-12"></div>
              <div className="relative z-10 space-y-6">
                 <h3 className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-400" /> Market Insights
                 </h3>
                 <div className="space-y-4">
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-slate-500 uppercase">Vaccine Supply Chain</p>
                       <p className="text-sm font-medium">Regional demand for Hepatitis B is up by 14%.</p>
                    </div>
                    <div className="h-px bg-slate-800"></div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-slate-500 uppercase">Logistics Alert</p>
                       <p className="text-sm font-medium text-amber-400">High traffic predicted at Bengaluru Hub due to festival.</p>
                    </div>
                 </div>
                 <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                    Full Industry Report
                 </button>
              </div>
           </div>

           <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-800">Recent Proofs</h3>
              <div className="p-6 bg-white rounded-[24px] border border-slate-100 shadow-sm space-y-4">
                 {[
                   { id: 'POD-121', date: 'Today', status: 'Verified' },
                   { id: 'POD-110', date: 'Yesterday', status: 'Verified' },
                 ].map(receipt => (
                    <div key={receipt.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                             <FileCheck className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-xs font-bold text-slate-800">#{receipt.id}</p>
                             <p className="text-[10px] text-slate-400 font-medium">{receipt.date}</p>
                          </div>
                       </div>
                       <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">{receipt.status}</span>
                    </div>
                 ))}
                 <button className="w-full py-3 bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">View All Docs</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiverHome;
