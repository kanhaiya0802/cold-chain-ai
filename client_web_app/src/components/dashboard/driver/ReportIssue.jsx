import React, { useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { 
  AlertCircle, Truck, Thermometer, MapPin, 
  ChevronRight, Send, HelpCircle, Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReportIssue = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [type, setType] = useState('vehicle');
  const [severity, setSeverity] = useState('medium');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/transport/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shipment_id: 1, // Mock
          issue_type: type,
          description: desc,
          severity: severity,
          latitude: 12.9716,
          longitude: 77.5946
        })
      });
      if (res.ok) {
        alert("Issue reported to Dispatch. AI is analyzing impact.");
        navigate('/driver');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
         <h1 className="text-2xl font-black text-slate-800 tracking-tight">Report Emergency</h1>
         <p className="text-sm text-slate-500">Alert dispatch and AI about operational problems.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
               {[
                 { id: 'vehicle', label: 'Vehicle', icon: Truck },
                 { id: 'cooling', label: 'Cooling', icon: Thermometer },
                 { id: 'route', label: 'Road/Map', icon: MapPin },
                 { id: 'cargo', label: 'Cargo', icon: Package }
               ].map(item => (
                  <button 
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2 ${
                       type === item.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}
                  >
                     <item.icon className="w-6 h-6" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                  </button>
               ))}
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Urgency Level</label>
               <select 
                 value={severity}
                 onChange={(e) => setSeverity(e.target.value)}
                 className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none"
               >
                  <option value="low">Low - Informational</option>
                  <option value="medium">Medium - Action Needed</option>
                  <option value="high">High - Safety Risk</option>
                  <option value="critical">Critical - Trip Stop</option>
               </select>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Describe the Issue</label>
               <textarea 
                  rows="4"
                  required
                  placeholder="What happened? (e.g. Unusual noise from compressor, heavy traffic, etc.)"
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
               ></textarea>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-200 hover:bg-red-500 transition-all flex items-center justify-center gap-3"
            >
               {loading ? 'Sending...' : (
                  <>Submit Report <Send className="w-5 h-5" /></>
               )}
            </button>
         </form>
      </div>

      <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-4">
         <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 text-amber-600">
            <HelpCircle className="w-5 h-5" />
         </div>
         <p className="text-[10px] text-amber-700 font-bold leading-tight uppercase tracking-wide">
            Your report will be analyzed by the AI Risk Engine to predict impact on vaccine safety and delivery ETA.
         </p>
      </div>
    </div>
  );
};

export default ReportIssue;
