import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { Package, Box, QrCode, CheckCircle2, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';

const PackingPage = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [packingId, setPackingId] = useState(null);
  const [showQR, setShowQR] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders?token=${token}`);
      if (res.ok) {
        const data = await res.json();
        // Only show confirmed orders (ready to pack) or recently packed
        setOrders(data.filter(o => ['confirmed', 'packed'].includes(o.status)));
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

  const handlePack = async (orderId) => {
    setPackingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/pack?token=${token}`, {
        method: 'POST'
      });
      if (res.ok) {
        setOrders(orders.map(o => o.order_id === orderId ? { ...o, status: 'packed' } : o));
      } else {
        const error = await res.json();
        alert(`Failed to pack order: ${error.detail}`);
      }
    } catch (err) {
      console.error("Error packing order:", err);
    } finally {
      setPackingId(null);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400 animate-pulse text-lg">Loading Packing Queue...</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Packing & Dispatch Queue</h1>
          <p className="text-slate-400">Scan items, verify FEFO allocations, and generate compliance QR labels.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {orders.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 shadow-xl">
            <Box className="w-12 h-12 mx-auto mb-4 text-slate-600" />
            <h3 className="text-lg font-medium text-slate-300 mb-1">Queue is Empty</h3>
            <p>No approved orders are waiting to be packed.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.order_id} className={`bg-slate-900 border rounded-2xl p-5 shadow-xl transition-all ${
              order.status === 'packed' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-800'
            }`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                
                {/* Order Details */}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl border ${
                    order.status === 'packed' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  }`}>
                    {order.status === 'packed' ? <CheckCircle2 className="w-6 h-6" /> : <Box className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      Order #{order.order_id} 
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                        order.status === 'packed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {order.status}
                      </span>
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">Receiver: <span className="text-slate-300">{order.receiver_id}</span></p>
                    <p className="text-sm text-slate-400">Total Items: <span className="text-slate-300 font-medium">{order.items?.length || 0} batches allocated</span></p>
                  </div>
                </div>

                {/* Workflow Tracker */}
                <div className="flex-1 flex items-center justify-center px-8 hidden md:flex opacity-70">
                   <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                     <span className="text-blue-400">Approved</span>
                     <ChevronRight className="w-4 h-4" />
                     <span className={order.status === 'packed' ? 'text-emerald-400' : 'text-slate-200'}>Packing</span>
                     <ChevronRight className="w-4 h-4" />
                     <span>Ready for Dispatch</span>
                   </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => setShowQR(showQR === order.order_id ? null : order.order_id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-colors border border-slate-700"
                  >
                    <QrCode className="w-4 h-4" />
                    {showQR === order.order_id ? 'Hide Label' : 'Print Label'}
                  </button>
                  
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => handlePack(order.order_id)}
                      disabled={packingId === order.order_id}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                      {packingId === order.order_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                      Mark Packed
                    </button>
                  )}
                </div>
              </div>

              {/* Fake QR Dropdown */}
              {showQR === order.order_id && (
                <div className="mt-6 pt-6 border-t border-slate-700/50 flex flex-col items-center justify-center animate-in fade-in slide-in-from-top-2">
                  <div className="bg-white p-3 rounded-xl shadow-lg">
                    {/* Dummy QR placeholder - could use react-qr-code later */}
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=COLDCHAIN_ORD_${order.order_id}`} alt="QR Code" className="w-32 h-32" />
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-3 text-center">
                    COLDCHAIN_ORD_{order.order_id}<br/>
                    Scan via mobile to assign to shipment.
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PackingPage;
