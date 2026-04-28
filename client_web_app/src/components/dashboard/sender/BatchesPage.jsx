import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { Layers, Calendar, AlertTriangle, ShieldAlert, CheckCircle } from 'lucide-react';

const BatchesPage = () => {
  const { token } = useContext(AuthContext);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await fetch(`/api/batches`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setBatches(await res.json());
        }
      } catch (err) {
        console.error("Error fetching batches:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchBatches();
  }, [token]);

  if (loading) return <div className="text-center py-20 text-slate-400 animate-pulse text-lg">Loading Batches...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">FEFO Batch Management</h1>
          <p className="text-slate-400">Track all physical batches, monitor expiry dates, and enforce FEFO allocation.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-700/50">
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Batch Info</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Expiry Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {batches.map((batch) => {
              const isExpired = new Date(batch.expiry_date) < new Date();
              const isNearExpiry = !isExpired && new Date(batch.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
              
              return (
                <tr key={batch.batch_id} className={`hover:bg-slate-800/20 transition-colors ${
                  isExpired ? 'bg-red-500/5' : ''
                }`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                        isExpired ? 'bg-red-500/10 border-red-500/20' : 'bg-slate-800 border-slate-700'
                      }`}>
                        <Layers className={`w-5 h-5 ${isExpired ? 'text-red-400' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <p className={`font-medium ${isExpired ? 'text-red-300' : 'text-slate-200'}`}>
                          {batch.batch_number}
                        </p>
                        <p className="text-xs text-slate-500">Inventory ID: {batch.inventory_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-lg font-bold text-white">{batch.quantity_available}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className={`w-4 h-4 ${isExpired ? 'text-red-400' : isNearExpiry ? 'text-yellow-400' : 'text-slate-400'}`} />
                      <span className={`text-sm font-medium ${isExpired ? 'text-red-400' : isNearExpiry ? 'text-yellow-400' : 'text-slate-300'}`}>
                        {new Date(batch.expiry_date).toLocaleDateString()}
                      </span>
                    </div>
                    {isNearExpiry && <p className="text-xs text-yellow-500 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Expiring soon</p>}
                    {isExpired && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> Expired</p>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border capitalize ${
                      batch.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      batch.status === 'reserved' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-slate-700/30 text-slate-300 border-slate-600/30'
                    }`}>
                      {batch.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BatchesPage;
