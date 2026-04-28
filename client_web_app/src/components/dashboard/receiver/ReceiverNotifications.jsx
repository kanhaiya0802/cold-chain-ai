import React from 'react';
import { Bell, CheckCircle2, Truck, AlertTriangle, Info, Clock } from 'lucide-react';

const ReceiverNotifications = () => {
  const notifications = [
    { id: 1, type: 'success', title: 'Order Approved', message: 'Your order #ORD-1102 for 500 units of Insulin has been approved.', time: '2 hours ago', icon: CheckCircle2, color: 'emerald' },
    { id: 2, type: 'info', title: 'Shipment Dispatched', message: 'Truck #TRK-882 is now in transit with your consignments.', time: '4 hours ago', icon: Truck, color: 'blue' },
    { id: 3, type: 'warning', title: 'Route Delay', message: 'Heavy traffic detected on Highway 4. ETA updated to +15 mins.', time: '5 hours ago', icon: Clock, color: 'amber' },
    { id: 4, type: 'error', title: 'Temp Warning', message: 'Critical: Sensor 4 reported 8.1°C for 2 minutes. Monitoring active.', time: 'Yesterday', icon: AlertTriangle, color: 'red' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Notifications</h1>
        <button className="text-sm font-bold text-emerald-600 hover:underline">Mark all as read</button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-5 hover:border-slate-200 transition-all group">
            <div className={`p-3 rounded-2xl bg-${n.color}-50 text-${n.color}-600 group-hover:scale-110 transition-transform`}>
              <n.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-slate-800">{n.title}</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{n.time}</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReceiverNotifications;
