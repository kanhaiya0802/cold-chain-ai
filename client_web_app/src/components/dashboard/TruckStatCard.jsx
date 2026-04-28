import React from 'react';
import { Thermometer, MapPin, Activity, Zap, ShieldAlert } from 'lucide-react';

const formatAiResponse = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, index) => {
    let isList = false;
    let cleanLine = line;
    if (cleanLine.trim().startsWith('* ') || cleanLine.trim().startsWith('- ')) {
      isList = true;
      cleanLine = cleanLine.trim().substring(2);
    } else if (/^\d+\.\s/.test(cleanLine.trim())) {
      isList = true;
      cleanLine = cleanLine.trim().replace(/^\d+\.\s/, '');
    }

    const parts = cleanLine.split(/(\*\*.*?\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    if (isList) {
      return (
        <li key={index} className="flex items-start gap-3 mb-3 bg-white/5 p-3 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
            <span className="text-red-400 mt-0.5 shadow-sm"><Zap size={16} /></span>
            <span className="text-slate-200">{parts}</span>
        </li>
      );
    }
    return <p key={index} className="mb-3 text-slate-300 leading-relaxed">{parts}</p>;
  });
};

const TruckStatCard = ({ log, advisory }) => {
  const warn = log.temperature > 8.0;
  
  return (
    <div className={`rounded-2xl p-5 border transition-all shadow-lg shadow-black/20 ${warn ? 'bg-red-950/20 border-red-500/30' : 'bg-slate-800 border-slate-700'}`}>
      <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${warn ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
              <Activity size={20} className={warn ? 'text-red-400' : 'text-blue-400'} />
            </div>
            <h3 className="text-xl font-bold text-white">{log.truck_id}</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${warn ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${warn ? 'text-red-400' : 'text-green-400'}`}>{warn ? "Warning" : "Normal"}</span>
          </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
            <p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><Thermometer size={12}/> TEMPERATURE</p>
            <p className={`text-2xl font-bold ${warn ? "text-red-400" : "text-slate-200"}`}>{log.temperature.toFixed(1)}°C</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
            <p className="text-[10px] text-slate-500 mb-1 flex items-center gap-1"><MapPin size={12}/> LOCATION</p>
            <p className="text-sm font-mono text-slate-300">{log.location.latitude.toFixed(4)}<br/>{log.location.longitude.toFixed(4)}</p>
          </div>
      </div>
      {advisory && warn && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-200 max-h-32 overflow-y-auto">
            <strong className="block mb-1 text-red-400"><ShieldAlert size={14} className="inline mr-1"/> AI Advisory:</strong>
            <div className="pl-1 text-xs leading-relaxed">{formatAiResponse(advisory)}</div>
        </div>
      )}
    </div>
  );
};

export default TruckStatCard;
