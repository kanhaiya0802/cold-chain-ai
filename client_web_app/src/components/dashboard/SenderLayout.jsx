import React, { useContext } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  Home, 
  Package, 
  Archive, 
  Layers, 
  Box, 
  Truck, 
  Map, 
  Bell, 
  BarChart2, 
  Settings,
  Building2,
  CheckCircle2
} from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label }) => {
  return (
    <NavLink
      to={to}
      end={to === "/sender"}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
          isActive
            ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
        }`
      }
    >
      <Icon className="w-5 h-5" />
      {label}
    </NavLink>
  );
};

const SenderLayout = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-8rem)] gap-8 w-full max-w-[1600px] mx-auto">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 flex-shrink-0">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sticky top-24 shadow-xl">
          <div className="mb-6 px-4 py-3 bg-slate-800/40 rounded-xl border border-slate-700/50 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center text-blue-400 flex-shrink-0">
               <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Warehouse Entity
                </h2>
                {user?.is_verified ? (
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-2 h-2 text-white" />
                  </div>
                ) : (
                  <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                )}
              </div>
              <p className="text-sm font-bold text-slate-100 truncate">
                {user?.organization_name || user?.name || 'Main Warehouse'}
              </p>
            </div>
          </div>
          <nav className="flex flex-col gap-1.5 space-y-1">
            <SidebarItem to="/sender" icon={Home} label="Dashboard Home" />
            <SidebarItem to="/sender/orders" icon={Package} label="Incoming Orders" />
            <SidebarItem to="/sender/inventory" icon={Archive} label="Inventory" />
            <SidebarItem to="/sender/batches" icon={Layers} label="Batch Management" />
            <SidebarItem to="/sender/packing" icon={Box} label="Packing Queue" />
            <SidebarItem to="/sender/shipments" icon={Truck} label="Shipments" />
            <SidebarItem to="/sender/tracking" icon={Map} label="Live Tracking" />
            <SidebarItem to="/sender/alerts" icon={Bell} label="Alerts" />
            <SidebarItem to="/sender/reports" icon={BarChart2} label="Reports" />
            
            <div className="pt-4 mt-4 border-t border-slate-800/50">
              <SidebarItem to="/sender/settings" icon={Settings} label="Settings" />
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export default SenderLayout;
