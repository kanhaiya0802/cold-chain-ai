import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { CheckCircle, Clock, Package, AlertCircle } from 'lucide-react';

const OrdersPage = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/orders?token=${token}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const handleApprove = async (orderId) => {
    setApproving(orderId);
    try {
      const res = await fetch(`http://127.0.0.1:8000/orders/${orderId}/approve?token=${token}`, {
        method: 'POST'
      });
      if (res.ok) {
        // Optimistically update order status in UI
        setOrders(orders.map(o => o.order_id === orderId ? { ...o, status: 'confirmed' } : o));
      } else {
        const error = await res.json();
        alert(`Failed to approve order: ${error.detail}`);
      }
    } catch (err) {
      console.error("Error approving order:", err);
    } finally {
      setApproving(null);
    }
  };

  const [trucks, setTrucks] = useState([]);
  const [selectedTrucks, setSelectedTrucks] = useState({});

  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/trucks?token=${token}`);
        if (res.ok) setTrucks(await res.json());
      } catch (err) { console.error(err); }
    };
    if (token) fetchTrucks();
  }, [token]);

  const handleDispatch = async (orderId) => {
    const truckId = selectedTrucks[orderId];
    if (!truckId) return alert("Select a truck first");

    try {
      const res = await fetch(`http://127.0.0.1:8000/shipments?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ truck_id: parseInt(truckId), sender_id: 1 }) // Mock sender_id for now
      });
      if (res.ok) {
        alert("Shipment created and truck dispatched!");
        fetchOrders();
      }
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="text-center py-20 text-slate-400 animate-pulse text-lg">Fetching Orders...</div>;

  return (
    <div className="space-y-6">
      {/* ... header ... */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Incoming Orders</h1>
          <p className="text-slate-400">Review receiver requests and auto-allocate inventory using FEFO.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-700/50">
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Details</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {orders.map((order) => (
              <tr key={order.order_id} className="hover:bg-slate-800/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">#{order.order_id}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Priority: {order.priority}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs text-slate-300">Receiver ID: {order.receiver_id}</p>
                  <p className="text-[10px] text-slate-500">Required: {new Date(order.required_delivery_date).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest ${
                    order.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                    order.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {order.status === 'pending' ? (
                      <button
                        onClick={() => handleApprove(order.order_id)}
                        disabled={approving === order.order_id}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase rounded-lg transition-all"
                      >
                        {approving === order.order_id ? 'Wait...' : 'Approve FEFO'}
                      </button>
                    ) : order.status === 'confirmed' ? (
                      <div className="flex items-center gap-2">
                         <select 
                           className="bg-slate-950 border border-slate-800 text-[10px] text-slate-300 rounded-lg px-2 py-2 focus:outline-none"
                           onChange={(e) => setSelectedTrucks({...selectedTrucks, [order.order_id]: e.target.value})}
                         >
                            <option value="">Select Truck</option>
                            {trucks.map(t => <option key={t.truck_id} value={t.truck_id}>{t.truck_number}</option>)}
                         </select>
                         <button
                           onClick={() => handleDispatch(order.order_id)}
                           className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase rounded-lg transition-all"
                         >
                           Dispatch
                         </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-bold uppercase">In Logistics Pipeline</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersPage;
