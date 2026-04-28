import React, { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { 
  User, Truck, ShieldCheck, LogOut, 
  ChevronRight, Phone, Mail, Award
} from 'lucide-react';

const DriverProfile = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center py-8 space-y-4">
         <div className="relative">
            <div className="w-24 h-24 bg-slate-900 rounded-[32px] flex items-center justify-center text-white shadow-2xl">
               <User className="w-12 h-12" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-slate-50 rounded-full flex items-center justify-center text-white">
               <ShieldCheck className="w-5 h-5" />
            </div>
         </div>
         <div className="text-center">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{user?.name || 'Driver Name'}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{user?.organization_name || 'Transport Unit'}</p>
         </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
         <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                     <Truck className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase">Primary Vehicle</p>
                     <p className="text-sm font-bold text-slate-800">TRK-001 (Heavy Duty)</p>
                  </div>
               </div>
               <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase">Active</span>
            </div>

            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3 text-slate-500">
                     <Phone className="w-4 h-4" />
                     <span className="text-xs font-bold">{user?.phone || '+1 234 567 890'}</span>
                  </div>
                  <button className="text-[10px] font-bold text-indigo-600 uppercase">Edit</button>
               </div>
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3 text-slate-500">
                     <Mail className="w-4 h-4" />
                     <span className="text-xs font-bold">{user?.email || 'driver@coldchain.ai'}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6">
         <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
               <Award className="w-5 h-5" />
            </div>
            <div>
               <p className="text-xs font-bold text-slate-800">Safety Rating</p>
               <div className="flex gap-1 mt-0.5">
                  {[1,2,3,4,5].map(i => <div key={i} className="w-3 h-1.5 bg-emerald-500 rounded-full"></div>)}
               </div>
            </div>
         </div>
         <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">
            Maintained 100% cold-chain compliance for 42 consecutive deliveries.
         </p>
      </div>

      <button 
        onClick={logout}
        className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-red-100 text-red-600 font-bold rounded-2xl shadow-sm hover:bg-red-50 transition-all"
      >
         <LogOut className="w-5 h-5" /> Log Out
      </button>
    </div>
  );
};

export default DriverProfile;
