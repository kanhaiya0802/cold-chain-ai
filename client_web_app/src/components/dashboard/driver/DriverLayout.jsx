import React, { useContext, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { 
  Home, Truck, Map as MapIcon, Activity, 
  Bell, Sparkles, CheckSquare, AlertCircle, 
  User, LogOut, Menu, X, HeartPulse
} from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label, onClick }) => (
  <NavLink
    to={to}
    end={to === "/driver"}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${
        isActive 
          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      }`
    }
  >
    <Icon className="w-5 h-5" />
    {label}
  </NavLink>
);

const DriverLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { to: "/driver", icon: Home, label: "Dashboard Home" },
    { to: "/driver/shipments", icon: Truck, label: "My Shipments" },
    { to: "/driver/route", icon: MapIcon, label: "Delivery Route" },
    { to: "/driver/monitoring", icon: Activity, label: "Live Telemetry" },
    { to: "/driver/ai", icon: Sparkles, label: "AI Co-Pilot" },
    { to: "/driver/alerts", icon: Bell, label: "Critical Alerts" },
    { to: "/driver/profile", icon: User, label: "Driver Profile" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-100 shadow-sm z-50">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
               <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight leading-tight">ColdChain <span className="text-emerald-600">Ops</span></h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Driver Terminal</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map(item => (
              <SidebarItem key={item.to} {...item} />
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-50">
           <div className="bg-slate-50 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-1">
                 <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                    {user?.name?.charAt(0) || 'D'}
                 </div>
                 <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Verified Agent</p>
                 </div>
              </div>
           </div>
           <button 
             onClick={handleLogout}
             className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
           >
             <LogOut className="w-4 h-4" /> Sign Out
           </button>
        </div>
      </aside>

      {/* ── Mobile Header ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="lg:hidden h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-40">
           <button onClick={() => setIsMobileOpen(true)} className="p-2 -ml-2 text-slate-600">
              <Menu className="w-6 h-6" />
           </button>
           <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-600" />
              <span className="font-black text-slate-800">ColdChain Ops</span>
           </div>
           <div className="w-10"></div> {/* Spacer */}
        </header>

        {/* ── Main Content Area ── */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-12 bg-slate-50/50">
           <div className="max-w-5xl mx-auto">
              <Outlet />
           </div>
        </main>
      </div>

      {/* ── Mobile Sidebar Overlay ── */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)}></div>
          <aside className="fixed inset-y-0 left-0 w-72 bg-white flex flex-col p-6 shadow-2xl animate-in slide-in-from-left duration-300">
             <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-2">
                   <Truck className="text-emerald-600 w-6 h-6" />
                   <span className="text-xl font-black">ColdChain</span>
                </div>
                <button onClick={() => setIsMobileOpen(false)} className="p-2 text-slate-400">
                   <X className="w-6 h-6" />
                </button>
             </div>
             <nav className="space-y-1">
                {menuItems.map(item => (
                  <SidebarItem key={item.to} {...item} onClick={() => setIsMobileOpen(false)} />
                ))}
             </nav>
          </aside>
        </div>
      )}
    </div>
  );
};

export default DriverLayout;
