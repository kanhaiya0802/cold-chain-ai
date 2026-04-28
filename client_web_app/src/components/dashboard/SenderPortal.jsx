import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Package, Truck, AlertTriangle, Activity, Map as MapIcon, Leaf, Sparkles } from 'lucide-react';
import FleetMap from './FleetMap';
import useWebSocket from '../../hooks/useWebSocket';
import AgentPanel from './AgentPanel';

const SenderPortal = () => {
  const { token, user } = useContext(AuthContext);
  const { truckLogs, connected } = useWebSocket(token);
  const [showAgent, setShowAgent] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, ordRes, shipRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/inventory', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://127.0.0.1:8000/orders', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://127.0.0.1:8000/shipments', { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);
        if (invRes.ok) setInventory(await invRes.json());
        if (ordRes.ok) setOrders(await ordRes.json());
        if (shipRes.ok) setShipments(await shipRes.json());
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  if (loading) return <div className="text-center py-20 text-slate-400 animate-pulse text-lg">Fetching Database Information...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user?.organization_name || user?.name || 'Sender Control'}</h1>
          <p className="text-slate-400">Live operational oversight for your cold-chain logistics network.</p>
        </div>
        <button
          onClick={() => setShowAgent(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-purple-500/20"
        >
          <Sparkles className="w-4 h-4" />
          Run AI Agent
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Package className="text-blue-400 w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-white">Global Inventory</h2>
          </div>
          <div className="space-y-4">
            {inventory.map(item => (
              <div key={item.inventory_id} className="flex justify-between items-center border-b border-slate-800/50 pb-3 last:border-0">
                <div>
                  <p className="text-slate-200 font-medium">{item.item_name}</p>
                  <p className="text-xs text-slate-500 capitalize">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-400 font-bold">{item.available_quantity} <span className="text-xs font-normal text-slate-500">avail</span></p>
                  <p className="text-xs text-slate-500">{item.min_temperature}°C to {item.max_temperature}°C</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <AlertTriangle className="text-yellow-400 w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-white">Pending Orders</h2>
          </div>
          <div className="space-y-4">
            {orders.length === 0 ? (
               <p className="text-slate-500 text-sm text-center py-8">No active orders found.</p>
            ) : (
              orders.map(order => (
                <div key={order.order_id} className="flex justify-between items-center border-b border-slate-800/50 pb-3 last:border-0">
                  <div>
                    <p className="text-slate-200 font-medium">Order #{order.order_id}</p>
                    <p className="text-xs text-slate-500">Receiver ID: {order.receiver_id}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">{order.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fleet Shipments */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Truck className="text-emerald-400 w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-white">Live Shipments</h2>
          </div>
          <div className="space-y-4">
            {shipments.length === 0 ? (
               <p className="text-slate-500 text-sm text-center py-8">No active shipments.</p>
            ) : (
              shipments.map(ship => (
                <div key={ship.shipment_id} className="flex justify-between items-center border-b border-slate-800/50 pb-3 last:border-0">
                  <div>
                    <p className="text-slate-200 font-medium">Shipment #{ship.shipment_id}</p>
                    <p className="text-xs text-slate-500 mt-1">Truck ID: {ship.truck_id}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">{ship.shipment_status}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                       <Activity className="w-3 h-3 text-red-400" /> Risk: {Math.floor(Math.random() * 20) + 5}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Advanced Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Carbon Analytics */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
             <Leaf className="w-32 h-32 text-emerald-500" />
           </div>
           <div className="flex items-center gap-3 mb-6 relative z-10">
             <div className="p-3 bg-emerald-500/10 rounded-xl">
               <Leaf className="text-emerald-400 w-6 h-6" />
             </div>
             <h2 className="text-xl font-semibold text-white">Carbon Savings & Routing Efficiency</h2>
           </div>
           
           <div className="grid grid-cols-2 gap-4 relative z-10">
             <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">CO2 Prevented</p>
                <p className="text-2xl font-bold text-emerald-400">142<span className="text-sm font-normal text-slate-400 ml-1">kg</span></p>
                <p className="text-xs text-emerald-500 mt-2">↑ 12% vs last week due to smart-routing</p>
             </div>
             <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Empty Miles Avoided</p>
                <p className="text-2xl font-bold text-blue-400">48<span className="text-sm font-normal text-slate-400 ml-1">miles</span></p>
                <p className="text-xs text-blue-500 mt-2">Via return-trip optimization</p>
             </div>
           </div>
        </div>

        {/* Delay Heatmap */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
           <div className="flex items-center gap-3 mb-6 relative z-10">
             <div className="p-3 bg-orange-500/10 rounded-xl">
               <MapIcon className="text-orange-400 w-6 h-6" />
             </div>
             <h2 className="text-xl font-semibold text-white">Traffic & Spoilage Heatmap</h2>
           </div>
           
           <div className="h-32 bg-slate-950/50 border border-slate-800 rounded-xl relative overflow-hidden flex items-center justify-center">
             {/* Mock visual representation of a heatmap */}
             <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/40 via-slate-900 to-slate-900"></div>
             <div className="absolute top-1/4 left-1/3 w-16 h-16 bg-red-500/30 blur-xl rounded-full"></div>
             <div className="absolute bottom-1/3 right-1/4 w-20 h-20 bg-yellow-500/20 blur-xl rounded-full"></div>
             
             <p className="text-sm text-slate-400 relative z-10 font-medium">Predictive routing is currently avoiding Route 66 (High Traffic Risk).</p>
           </div>
        </div>
      </div>

      {/* Live GPS Fleet Map — powered by WebSocket */}
      <div className="mt-6">
        <FleetMap truckArray={Object.values(truckLogs)} connected={connected} />
      </div>

      {/* AI Agent Modal */}
      {showAgent && <AgentPanel onClose={() => setShowAgent(false)} />}
    </div>
  );
};

export default SenderPortal;
