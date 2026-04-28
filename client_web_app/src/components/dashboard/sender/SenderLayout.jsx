import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
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
  Settings 
} from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label }) => {
  return (
    <NavLink
      to={to}
      end={to === "/sender"}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
          isActive
            ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
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
  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-8rem)] gap-6 w-full max-w-[1600px] mx-auto">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 flex-shrink-0">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sticky top-24 shadow-xl">
          <div className="mb-6 px-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Operations Center
            </h2>
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
            
            <div className="pt-4 mt-4 border-t border-slate-800">
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
