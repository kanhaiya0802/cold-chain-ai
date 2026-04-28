import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { 
  FileCheck, Download, ExternalLink, ShieldCheck, 
  Search, Filter, FileText, BadgeCheck
} from 'lucide-react';

const CertificatesPage = () => {
  const { token } = useContext(AuthContext);
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProofs = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/receiver/proofs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setProofs(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProofs();
  }, [token]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Compliance Certificates</h1>
          <p className="text-slate-500">Official proof of thermal integrity and delivery verification for every shipment.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
              <Download className="w-4 h-4" /> Download All Archives
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-slate-400">Loading document vault...</div>
        ) : proofs.length === 0 ? (
           <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
              <FileCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No certificates available yet. Complete your first delivery to generate one.</p>
           </div>
        ) : proofs.map(proof => (
          <div key={proof.proof_id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
             {/* Security Watermark Mock */}
             <BadgeCheck className="absolute -top-4 -right-4 w-24 h-24 text-emerald-500/5 rotate-12" />
             
             <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                   <FileText className="w-6 h-6" />
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document ID</p>
                   <p className="text-xs font-bold text-slate-800">#POD-{proof.proof_id}921</p>
                </div>
             </div>

             <div className="space-y-4 mb-8">
                <div>
                   <h3 className="font-bold text-slate-800">Supply Chain Integrity Proof</h3>
                   <p className="text-xs text-slate-500">For Order #ORD-{proof.order_id}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                   <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Delivered On</p>
                      <p className="text-xs font-bold text-slate-800">{new Date(proof.delivery_time).toLocaleDateString()}</p>
                   </div>
                   <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Status</p>
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{proof.temperature_status}</p>
                   </div>
                </div>
             </div>

             <div className="flex items-center gap-3">
                <button className="flex-1 py-3 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
                   <Download className="w-4 h-4" /> Download PDF
                </button>
                <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 transition-colors border border-slate-100">
                   <ExternalLink className="w-4 h-4" />
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CertificatesPage;
