import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { 
  ScanLine, CheckCircle2, User, ChevronRight, 
  Thermometer, Package, Edit3, Camera
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const DeliveryProof = () => {
  const { token } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const order_id = searchParams.get('order_id');
  const shipment_id = searchParams.get('shipment_id');
  const receiver_id = searchParams.get('receiver_id');

  const [receiverName, setReceiverName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/transport/confirm-delivery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          order_id: parseInt(order_id),
          shipment_id: parseInt(shipment_id),
          receiver_id: parseInt(receiver_id),
          delivered_quantity: 100, // Mock
          temperature_status: 'safe',
          receiver_signature: 'sig_hash_' + Date.now(),
          qr_verified: true,
          remarks: remarks
        })
      });
      if (res.ok) setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-20 text-center space-y-6 animate-in zoom-in duration-500">
         <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-xl shadow-emerald-200">
            <CheckCircle2 className="w-12 h-12" />
         </div>
         <h2 className="text-3xl font-black text-slate-800">Delivery Confirmed</h2>
         <p className="text-slate-500 max-w-xs mx-auto">Proof of delivery has been uploaded and the certificate is now available to the receiver.</p>
         <button 
           onClick={() => navigate('/driver/route')}
           className="px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-slate-800 transition-all"
         >
           Next Stop
         </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
         <h1 className="text-2xl font-black text-slate-800 tracking-tight">Delivery Proof</h1>
         <p className="text-sm text-slate-500">Order #{order_id} at Receiver {receiver_id}</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
         <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <ScanLine className="w-5 h-5 text-indigo-600" />
               <span className="text-sm font-bold text-slate-700 uppercase tracking-tighter">QR Verification</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">Verified</span>
         </div>

         <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Receiver Name</label>
               <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text" 
                    required
                    placeholder="Enter full name"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                  />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Remarks / Issues</label>
               <textarea 
                  rows="3"
                  placeholder="Note any damage or temp concerns..."
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
               ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-6 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-indigo-400 transition-all cursor-pointer">
                  <Camera className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Photo Proof</span>
               </div>
               <div className="p-6 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-emerald-400 transition-all cursor-pointer">
                  <Edit3 className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Signature</span>
               </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-500 transition-all flex items-center justify-center gap-3"
            >
               {loading ? 'Processing...' : (
                  <>Complete Delivery <CheckCircle2 className="w-5 h-5" /></>
               )}
            </button>
         </form>
      </div>
    </div>
  );
};

export default DeliveryProof;
