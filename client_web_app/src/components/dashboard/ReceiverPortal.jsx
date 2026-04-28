import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Package, Clock, ShieldCheck } from 'lucide-react';

const ReceiverPortal = () => {
  const { token, user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/orders?token=${token}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setOrders(await res.json());
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) fetchOrders();
  }, [token]);

  if (loading) return <div className="text-center py-20 text-slate-400 animate-pulse text-lg">Fetching your orders...</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-900/40 to-slate-900 border border-blue-900/50 rounded-2xl p-8 mb-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-2">Hospital Dashboard</h1>
        <p className="text-blue-200/70 text-lg">Welcome back. Manage your vaccine and medicine requests.</p>
        
        <button className="mt-8 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-8 rounded-xl transition-colors shadow-lg shadow-blue-500/30">
          + Place New Request
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
          <Clock className="w-6 h-6 text-blue-400" />
          Active Orders
        </h2>
        
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl border-dashed">
            <p className="text-slate-500 text-lg">You have no active orders.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map(order => (
              <div key={order.order_id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-slate-700 transition-colors">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">Order #{order.order_id}</h3>
                    <p className="text-sm text-slate-400 mt-1">Placed: {new Date(order.order_date).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border uppercase tracking-wider ${
                    order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4 pt-6 border-t border-slate-800/50">
                   <div>
                     <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Target Delivery</p>
                     <p className="text-base text-slate-200 font-medium">{new Date(order.required_delivery_date).toLocaleDateString()}</p>
                   </div>
                   <div>
                     <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Priority</p>
                     <p className="text-base text-slate-200 font-medium capitalize">{order.priority}</p>
                   </div>
                </div>

                {order.status === 'pending' && (
                  <div className="mt-4 bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex gap-3 items-start">
                     <div className="mt-0.5">
                       <ShieldCheck className="text-orange-400 w-4 h-4" />
                     </div>
                     <div>
                       <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">AI Logistics Update</p>
                       <p className="text-xs text-orange-200/80 leading-relaxed">
                         Your order is being routed carefully to avoid the current high-traffic heat wave in the primary transit zone. Predictive delivery ETA remains unchanged.
                       </p>
                     </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiverPortal;
