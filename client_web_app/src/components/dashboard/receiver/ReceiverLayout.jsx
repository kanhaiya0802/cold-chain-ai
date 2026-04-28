import React, { useState, useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { 
  Home, ShoppingCart, Package, MapPin, History, 
  FileCheck, LifeBuoy, Bell, Settings, LogOut, 
  Menu, X, Sparkles, HeartPulse, CheckCircle2, AlertCircle
} from 'lucide-react';

const ReceiverLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Dashboard Home', path: '/receiver/dashboard' },
    { icon: ShoppingCart, label: 'Place Order', path: '/receiver/place-order' },
    { icon: Package, label: 'My Orders', path: '/receiver/my-orders' },
    { icon: MapPin, label: 'Track Shipment', path: '/receiver/track' },
    { icon: History, label: 'Delivery History', path: '/receiver/history' },
    { icon: FileCheck, label: 'Certificates', path: '/receiver/certificates' },
    { icon: LifeBuoy, label: 'Complaints', path: '/receiver/complaints' },
    { icon: Bell, label: 'Notifications', path: '/receiver/notifications' },
    { icon: Settings, label: 'Settings', path: '/receiver/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* ── Sidebar (Desktop) ── */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 shadow-sm">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <HeartPulse className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">ColdChain <span className="text-emerald-600">AI</span></h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Receiver Hub</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                  ${isActive 
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
              {user?.name?.charAt(0) || 'R'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-slate-800 truncate">{user?.name || 'Receiver User'}</p>
                {user?.is_verified ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-slate-300" />
                )}
              </div>
              <p className="text-xs text-slate-400 truncate">{user?.organization_name || 'Hospital/Clinic'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-white hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header (Desktop) */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 lg:px-12 flex-shrink-0">
          <div className="flex items-center gap-4">
             <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-600">
               <Menu className="w-6 h-6" />
             </button>
             <h2 className="text-lg font-bold text-slate-800 hidden sm:block">Healthcare Logistics Terminal</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold">
               <Sparkles className="w-3 h-3 animate-pulse" />
               AI ASSISTANT ACTIVE
            </div>
            <button className="relative p-2.5 rounded-full bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8 lg:p-12 scrollbar-thin scrollbar-thumb-slate-200">
          <Outlet />
        </div>
      </main>

      {/* ── Mobile Sidebar Overlay ── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <aside className="fixed inset-y-0 left-0 w-72 bg-white flex flex-col p-6 animate-in slide-in-from-left duration-300">
             <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-2">
                 <HeartPulse className="text-emerald-600 w-6 h-6" />
                 <span className="text-xl font-bold">ColdChain</span>
               </div>
               <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400">
                 <X className="w-6 h-6" />
               </button>
             </div>
             <nav className="space-y-1">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                      ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500'}
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </NavLink>
                ))}
             </nav>
          </aside>
        </div>
      )}
    </div>
  );
};

export default ReceiverLayout;
