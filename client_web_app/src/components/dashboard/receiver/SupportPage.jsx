import React, { useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { 
  LifeBuoy, Send, MessageSquare, Phone, 
  HelpCircle, AlertCircle, FileText, CheckCircle2,
  Sparkles
} from 'lucide-react';

const SupportPage = () => {
  const { token } = useContext(AuthContext);
  const [ticket, setTicket] = useState({ order_id: '', complaint_type: 'delayed', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/receiver/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ticket)
      });
      if (res.ok) {
        setSuccess(true);
        setTicket({ order_id: '', complaint_type: 'delayed', message: '' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* ── Help Header & Contact ── */}
        <div className="lg:col-span-4 space-y-8">
           <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Help Center</h1>
              <p className="text-slate-500">Need assistance with a delivery or quality concern? We're here for you.</p>
           </div>

           <div className="space-y-4">
              <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:border-emerald-200 transition-all cursor-pointer">
                 <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <Phone className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-800">Emergency Hot-line</p>
                    <p className="text-xs text-slate-400">+1 (800) 555-COLD</p>
                 </div>
              </div>

              <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 hover:border-indigo-200 transition-all cursor-pointer">
                 <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <MessageSquare className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-800">Live Chat Support</p>
                    <p className="text-xs text-slate-400">Available 24/7 for Hospitals</p>
                 </div>
              </div>
           </div>

           <div className="p-8 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
              <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">AI Concierge</span>
                 </div>
                 <h3 className="text-lg font-bold mb-2">Smart Resolution</h3>
                 <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    Our AI evaluates your ticket against live IoT data to fast-track resolutions for temperature-related concerns.
                 </p>
                 <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold transition-all">
                    Ask AI Assistant
                 </button>
              </div>
              <HelpCircle className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5" />
           </div>
        </div>

        {/* ── Support Ticket Form ── */}
        <div className="lg:col-span-8">
           <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl p-8 md:p-12">
              {success ? (
                <div className="text-center py-10 animate-in zoom-in duration-500">
                   <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                   </div>
                   <h2 className="text-2xl font-bold text-slate-800 mb-2">Ticket Submitted!</h2>
                   <p className="text-slate-500 mb-8 max-w-sm mx-auto">Reference #TKT-{Math.floor(Math.random()*90000)}. Our support team will respond within 30 minutes.</p>
                   <button onClick={() => setSuccess(false)} className="px-10 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg">New Ticket</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Related Order ID (Optional)</label>
                         <input 
                           type="text"
                           placeholder="#ORD-0000"
                           className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold"
                           value={ticket.order_id}
                           onChange={(e) => setTicket({...ticket, order_id: e.target.value})}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Issue Category</label>
                         <select 
                           className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold appearance-none cursor-pointer"
                           value={ticket.complaint_type}
                           onChange={(e) => setTicket({...ticket, complaint_type: e.target.value})}
                         >
                            <option value="delayed">Delivery Delayed</option>
                            <option value="damaged">Damaged Goods</option>
                            <option value="temperature">Temperature Concern</option>
                            <option value="quantity">Missing Quantity</option>
                            <option value="billing">Invoice / Billing</option>
                            <option value="other">Other / General</option>
                         </select>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Detailed Description</label>
                      <textarea 
                        rows="6"
                        placeholder="Please describe your concern in detail so our team can assist you better..."
                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium leading-relaxed"
                        value={ticket.message}
                        onChange={(e) => setTicket({...ticket, message: e.target.value})}
                      ></textarea>
                   </div>

                   <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                         <span className="font-bold uppercase">Note:</span> If this is a life-critical emergency regarding vaccine temperature breach, please call our 24/7 priority hotline immediately.
                      </p>
                   </div>

                   <button 
                     type="submit"
                     disabled={loading}
                     className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-500 transition-all flex items-center justify-center gap-3"
                   >
                      {loading ? "Submitting..." : <><Send className="w-5 h-5" /> Submit Support Ticket</>}
                   </button>
                </form>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
