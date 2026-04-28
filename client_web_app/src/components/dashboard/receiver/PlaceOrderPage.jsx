import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { 
  ShoppingCart, Search, Plus, Trash2, Calendar, 
  AlertCircle, CheckCircle2, Sparkles, Archive, Building
} from 'lucide-react';

const PlaceOrderPage = () => {
  const { token } = useContext(AuthContext);
  const [senders, setSenders] = useState([]);
  const [selectedSender, setSelectedSender] = useState('');
  const [catalog, setCatalog] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [priority, setPriority] = useState('normal');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchSenders = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/receiver/senders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
           const data = await res.json();
           setSenders(data);
           if (data.length > 0) setSelectedSender(data[0].user_id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (token) fetchSenders();
  }, [token]);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/inventory', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setCatalog(await res.json());
      } catch (err) {
        console.error(err);
      }
    };
    if (token) fetchCatalog();
  }, [token]);

  const addToCart = (item) => {
    const existing = cart.find(c => c.inventory_id === item.inventory_id);
    if (existing) {
      setCart(cart.map(c => c.inventory_id === item.inventory_id ? { ...c, quantity: c.quantity + 100 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 100 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(c => c.inventory_id !== id));
  };

  const updateQuantity = (id, q) => {
    setCart(cart.map(c => c.inventory_id === id ? { ...c, quantity: parseInt(q) || 0 } : c));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Cart is empty");
    if (!selectedSender) return alert("Please select a warehouse");
    
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/receiver/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sender_id: selectedSender,
          required_delivery_date: deliveryDate || new Date(Date.now() + 86400000).toISOString(),
          priority,
          items: cart.map(c => ({ inventory_id: c.inventory_id, quantity: c.quantity }))
        })
      });
      if (res.ok) {
        setSubmitted(true);
        setCart([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCatalog = catalog.filter(item => 
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Order Submitted Successfully!</h2>
        <p className="text-slate-500 max-w-md mb-8">Your procurement request has been sent to the distribution center for batch allocation and approval.</p>
        <button 
          onClick={() => setSubmitted(false)}
          className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-500 transition-all"
        >
          Place Another Order
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Inventory Procurement</h1>
        <p className="text-slate-500">Select required medicines and vaccines from our live cold-chain inventory.</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 flex-shrink-0">
               <Building className="w-6 h-6" />
            </div>
               <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Warehouse / Supplier</p>
                  {senders.length === 0 ? (
                    <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                       <AlertCircle className="w-4 h-4" />
                       <p className="text-sm font-bold">No Suppliers Found (Run Seed Script)</p>
                    </div>
                  ) : (
                    <div className="relative group">
                      <select 
                        value={selectedSender}
                        onChange={(e) => {
                          setSelectedSender(e.target.value);
                          setCart([]); 
                        }}
                        className="w-full text-xl font-black text-slate-800 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 appearance-none focus:outline-none focus:border-emerald-500/30 transition-all cursor-pointer"
                      >
                         {senders.map(s => (
                           <option key={s.user_id} value={s.user_id}>
                             {s.organization_name || s.name} {s.is_verified ? '✓' : '(Unverified)'}
                           </option>
                         ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                         <Search className="w-5 h-5 rotate-90" />
                      </div>
                    </div>
                  )}
               </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
               {senders.find(s => s.user_id == selectedSender)?.is_verified ? (
                 <div className="px-5 py-3 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] font-black border border-emerald-100 uppercase tracking-widest flex items-center gap-2 shadow-sm shadow-emerald-100/50 whitespace-nowrap">
                    <CheckCircle2 className="w-4 h-4" /> Trust Verified
                 </div>
               ) : (
                 <div className="px-5 py-3 bg-amber-50 text-amber-700 rounded-2xl text-[10px] font-black border border-amber-100 uppercase tracking-widest flex items-center gap-2 shadow-sm shadow-amber-100/50 whitespace-nowrap">
                    <AlertCircle className="w-4 h-4" /> Identity Unverified
                 </div>
               )}
              <div className="px-4 py-3 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black border border-slate-100 uppercase tracking-widest whitespace-nowrap">
                 {catalog.filter(i => i.sender_id == selectedSender).length} Products Available
              </div>
           </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Catalog Section ── */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search products in this warehouse..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCatalog.filter(item => item.sender_id == selectedSender).map(item => (
              <div key={item.inventory_id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-200 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    item.category === 'vaccine' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {item.category}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400">STOCK: {item.available_quantity}</div>
                </div>
                <h3 className="font-bold text-slate-800 mb-1">{item.item_name}</h3>
                <p className="text-xs text-slate-400 mb-4">Temperature: {item.min_temperature}°C to {item.max_temperature}°C</p>
                <button 
                  onClick={() => addToCart(item)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-emerald-600 hover:text-white transition-all text-xs"
                >
                  <Plus className="w-4 h-4" /> Add to Order
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Cart Section ── */}
        <div className="lg:col-span-5">
           <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-full sticky top-8">
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <ShoppingCart className="w-6 h-6 text-emerald-400" />
                   <h2 className="text-lg font-bold">New Order Request</h2>
                </div>
                <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full">{cart.length} ITEMS</span>
              </div>

              <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[500px]">
                 {cart.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-10 text-slate-400 space-y-3">
                      <Archive className="w-12 h-12 opacity-20" />
                      <p className="text-sm font-medium">Your cart is empty.</p>
                   </div>
                 ) : (
                   <div className="space-y-4">
                     {cart.map(item => (
                       <div key={item.inventory_id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                         <div className="flex-1">
                            <p className="text-sm font-bold text-slate-800">{item.item_name}</p>
                            <p className="text-[10px] text-slate-400">Inventory ID: {item.inventory_id}</p>
                         </div>
                         <div className="flex items-center gap-2">
                            <input 
                              type="number"
                              className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.inventory_id, e.target.value)}
                            />
                            <button 
                              type="button"
                              onClick={() => removeFromCart(item.inventory_id)}
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}

                 <div className="pt-6 border-t border-slate-100 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Delivery Priority</label>
                          <select 
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          >
                             <option value="normal">Normal</option>
                             <option value="urgent">Urgent</option>
                             <option value="critical">Critical</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Delivery Date</label>
                          <input 
                            type="date"
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
                 <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <p className="text-[11px] text-indigo-700 font-medium">
                       <span className="font-bold">AI Suggestion:</span> Hospitals typically order 2x more Insulin during this quarter. Would you like to adjust your quantity?
                    </p>
                 </div>
                 <button 
                   type="submit"
                   disabled={cart.length === 0 || loading}
                   className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-500 disabled:bg-slate-300 disabled:shadow-none transition-all"
                 >
                   {loading ? "Processing..." : "Place Procurement Order"}
                 </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderPage;
