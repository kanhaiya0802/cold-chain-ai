import React, { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { User, MapPin, Bell, Shield, Hospital, Building } from 'lucide-react';

const ReceiverSettings = () => {
  const { user } = useContext(AuthContext);

  const SettingSection = ({ icon: Icon, title, description, children }) => (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
       <div className="p-8 flex items-start gap-6 border-b border-slate-50">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
             <Icon className="w-6 h-6" />
          </div>
          <div>
             <h3 className="text-lg font-bold text-slate-800">{title}</h3>
             <p className="text-sm text-slate-400">{description}</p>
          </div>
       </div>
       <div className="p-8">
          {children}
       </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Account Settings</h1>

      <SettingSection icon={User} title="Personal Information" description="Update your contact person details and display name.">
         <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Contact Name</label>
               <input type="text" className="w-full px-6 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold" defaultValue={user?.name} />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Phone Number</label>
               <input type="text" className="w-full px-6 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold" defaultValue={user?.phone || '+91 9876543210'} />
            </div>
         </div>
      </SettingSection>

      <SettingSection icon={Hospital} title="Organization Profile" description="Manage your hospital or clinic information.">
         <div className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Entity Name</label>
               <input type="text" className="w-full px-6 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold" defaultValue={user?.organization_name} />
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Department</label>
                  <input type="text" className="w-full px-6 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold" defaultValue="Emergency Care" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Delivery Bay</label>
                  <input type="text" className="w-full px-6 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold" defaultValue="East Wing - B2" />
               </div>
            </div>
         </div>
      </SettingSection>

      <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
         Save Profile Changes
      </button>
    </div>
  );
};

export default ReceiverSettings;
