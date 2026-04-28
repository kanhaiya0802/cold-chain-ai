import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { 
  Search, Filter, ChevronRight, Package, 
  MapPin, Clock, CheckCircle2, AlertCircle,
  FileText, ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyOrdersPage = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/receiver/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setOrders(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchOrders();
  }, [token]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'dispatched': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'packed': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'confirmed': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const filteredOrders = orders.filter(o => 
    o.order_id.toString().includes(search) || 
    o.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">My Procurement Orders</h1>
          <p className="text-slate-500">Track all your medicine and vaccine orders through the lifecycle.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text"
                placeholder="Search order ID..."
                className="pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
              <Filter className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Order ID</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Order Date</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Items</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="px-8 py-20 text-center text-slate-400">Loading your order history...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="6" className="px-8 py-20 text-center text-slate-400">No orders found.</td></tr>
              ) : filteredOrders.map(order => (
                <tr key={order.order_id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                          <Package className="w-4 h-4" />
                       </div>
                       <span className="font-bold text-slate-800 tracking-tight">#ORD-{order.order_id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                    {new Date(order.order_date).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-slate-800">{order.items?.length || 0} Products</div>
                    <div className="text-[10px] text-slate-400 font-medium">{order.items?.reduce((acc, i) => acc + i.requested_quantity, 0)} Units Total</div>
                  </td>
                  <td className="px-8 py-6">
                     <span className={`flex items-center gap-1 text-xs font-bold ${
                       order.priority === 'critical' ? 'text-red-600' : 
                       order.priority === 'urgent' ? 'text-amber-600' : 
                       'text-blue-600'
                     }`}>
                        {order.priority === 'critical' && <AlertCircle className="w-3 h-3" />}
                        {order.priority.toUpperCase()}
                     </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => navigate(`/receiver/track?orderId=${order.order_id}`)}
                         className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                         title="Track Shipment"
                       >
                          <MapPin className="w-4 h-4" />
                       </button>
                       <button className="p-2.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-800 hover:text-white transition-all shadow-sm">
                          <FileText className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;
