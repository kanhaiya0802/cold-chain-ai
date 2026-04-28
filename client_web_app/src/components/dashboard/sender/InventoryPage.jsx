import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { Archive, Plus, AlertTriangle, Thermometer, Layers, Search, Filter } from 'lucide-react';

const InventoryPage = () => {
  const { token } = useContext(AuthContext);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch(`/api/inventory`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setInventory(await res.json());
        }
      } catch (err) {
        console.error("Error fetching inventory:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchInventory();
  }, [token]);

  const filtered = inventory.filter(item => item.item_name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="text-center py-20 text-slate-400 animate-pulse text-lg">Loading Warehouse Inventory...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Warehouse Stock</h1>
          <p className="text-slate-400">Manage all cold-chain inventory, monitor low stock, and set temperature profiles.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all border border-slate-700">
             <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/20 w-full md:w-auto justify-center">
            <Plus className="w-4 h-4" />
            Receive Stock
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
               <Archive className="w-6 h-6 text-blue-400" />
            </div>
            <div>
               <p className="text-sm text-slate-500 font-medium">Total SKUs</p>
               <p className="text-2xl font-bold text-white">{inventory.length}</p>
            </div>
         </div>
         <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
               <Layers className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
               <p className="text-sm text-slate-500 font-medium">Total Units</p>
               <p className="text-2xl font-bold text-white">{inventory.reduce((acc, curr) => acc + curr.total_quantity, 0)}</p>
            </div>
         </div>
         <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
               <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
               <p className="text-sm text-slate-500 font-medium">Low Stock Alerts</p>
               <p className="text-2xl font-bold text-red-400">{inventory.filter(i => i.available_quantity < 500).length}</p>
            </div>
         </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Search Bar inside table wrapper */}
        <div className="p-4 border-b border-slate-800/50 flex items-center gap-3">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search inventory by name..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
           </div>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-700/50">
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Product Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Storage Profile</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Stock Level</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filtered.map((item) => (
              <tr key={item.inventory_id} className="hover:bg-slate-800/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                      <Archive className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">{item.item_name}</p>
                      <p className="text-[11px] uppercase tracking-wider text-slate-500">{item.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-slate-300 bg-slate-950/50 border border-slate-800 px-3 py-1.5 rounded-lg w-fit">
                    <Thermometer className="w-4 h-4 text-blue-400" />
                    {item.min_temperature}°C to {item.max_temperature}°C
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="text-lg font-bold text-white">{item.available_quantity}</p>
                  <p className="text-xs text-slate-500">{item.reserved_quantity} reserved</p>
                </td>
                <td className="px-6 py-4 text-right">
                  {item.available_quantity < 500 ? (
                     <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                       Low Stock
                     </span>
                  ) : (
                     <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                       Healthy
                     </span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
               <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-slate-600" />
                  <p>No inventory matching your search.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryPage;
