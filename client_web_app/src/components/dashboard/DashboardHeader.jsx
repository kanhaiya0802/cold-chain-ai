import React from 'react';
import { Navigation, AlertTriangle, CheckCircle } from 'lucide-react';

const DashboardHeader = ({ truckCount, isGlobalWarning }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Fleet Live Monitor</h1>
        <div className="flex items-center gap-2 text-slate-400 mt-1">
          <Navigation size={16} className="text-blue-500" />
          <p>
            Tracking: <span className="text-slate-200 font-semibold">{truckCount} {truckCount === 1 ? 'Truck' : 'Trucks'}</span>
          </p>
        </div>
      </div>
      <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${isGlobalWarning ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : 'bg-green-500/20 text-green-400 border border-green-500/50'}`}>
        {isGlobalWarning ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
        <span className="font-semibold uppercase tracking-wider">
          {isGlobalWarning ? 'Critical: High Temperature in Fleet' : 'Fleet Healthy'}
        </span>
      </div>
    </div>
  );
};

export default DashboardHeader;
