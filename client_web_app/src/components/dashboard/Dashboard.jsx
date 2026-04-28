import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import useWebSocket from '../../hooks/useWebSocket';
import DashboardHeader from './DashboardHeader';
import TruckStatCard from './TruckStatCard';
import FleetMap from './FleetMap';

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const { truckLogs, loading, aiResponses, connected } = useWebSocket(token);

  const truckArray = Object.values(truckLogs);
  const isGlobalWarning = truckArray.some(log => log.temperature > 8.0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <DashboardHeader truckCount={truckArray.length} isGlobalWarning={isGlobalWarning} />

      {/* Truck List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {truckArray.map(log => (
          <TruckStatCard 
            key={log.truck_id} 
            log={log} 
            advisory={aiResponses[log.truck_id]} 
          />
        ))}
        {truckArray.length === 0 && (
          <div className="text-center text-slate-500 py-12 lg:col-span-2 border border-slate-800 rounded-2xl border-dashed">
            No trucks currently assigned or tracking.
          </div>
        )}
      </div>

      {/* Map */}
      <FleetMap truckArray={truckArray} connected={connected} />
    </div>
  );
};

export default Dashboard;
