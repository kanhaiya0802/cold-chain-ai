import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">V</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            VacciTrack <span className="text-blue-500 text-sm">AI</span>
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-sm font-medium text-slate-300">
            Role: <span className="capitalize text-white bg-slate-800 px-2 py-1 rounded">{user?.role}</span>
          </span>
          <button 
            onClick={logout} 
            className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors ml-4 border border-red-500/30 px-3 py-1.5 rounded"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
