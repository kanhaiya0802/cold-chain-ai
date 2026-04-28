import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { AlertOctagon, AlertTriangle, ShieldAlert, CheckCircle2, Truck, Bell, Thermometer } from 'lucide-react';

const AlertsPage = () => {
  const { token } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch(`/api/alerts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setAlerts(await res.json());
        }
      } catch (err) {
        console.error("Error fetching alerts:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAlerts();
  }, [token]);

  const getAlertIcon = (type) => {
    if (type === 'temperature') return <Thermometer className="w-5 h-5 text-red-400" />;
    if (type === 'delay') return <Truck className="w-5 h-5 text-orange-400" />;
    return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
  };

  const getAlertColor = (severity) => {
    if (severity === 'critical') return 'bg-red-500/10 border-red-500/20 text-red-400';
    if (severity === 'warning') return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
    return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
  };

  if (loading) return <div className="text-center py-20 text-slate-400 animate-pulse text-lg">Fetching Global Alerts...</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">System Alerts & Notifications</h1>
          <p className="text-slate-400">Monitor driver-reported delays, temperature breaches, and fleet issues.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
         <div className="p-4 border-b border-slate-800 flex items-center gap-2 text-slate-300 font-semibold bg-slate-800/30">
            <Bell className="w-5 h-5 text-blue-400" />
            Active Notifications ({alerts.length})
         </div>

         <div className="divide-y divide-slate-800/50">
            {alerts.length === 0 ? (
               <div className="p-12 text-center text-slate-500">
                 <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-emerald-500/50" />
                 <p className="text-lg font-medium text-slate-300">All Clear</p>
                 <p className="text-sm">No active delays or temperature breaches.</p>
               </div>
            ) : (
               alerts.map((alert) => (
                 <div key={alert.alert_id} className="p-5 hover:bg-slate-800/20 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                       <div className={`p-3 rounded-xl border ${getAlertColor(alert.severity)}`}>
                          {getAlertIcon(alert.alert_type)}
                       </div>
                       <div>
                          <div className="flex items-center gap-2 mb-1">
                             <h3 className="text-lg font-bold text-white uppercase tracking-wider">{alert.alert_type} INCIDENT</h3>
                             <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border ${getAlertColor(alert.severity)}`}>
                               {alert.severity}
                             </span>
                          </div>
                          <p className="text-slate-300 font-medium">{alert.message}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                             <span>Shipment ID: {alert.shipment_id || 'N/A'}</span>
                             <span>Order ID: {alert.order_id || 'N/A'}</span>
                             <span>Reported: {new Date(alert.created_at).toLocaleString()}</span>
                          </div>
                       </div>
                    </div>
                    
                    <button className="whitespace-nowrap px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-colors shrink-0">
                       Acknowledge
                    </button>
                 </div>
               ))
            )}
         </div>
      </div>
    </div>
  );
};

export default AlertsPage;
