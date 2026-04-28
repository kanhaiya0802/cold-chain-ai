import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-900 mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-slate-500 text-sm">
        <p>© 2026 VacciTrack AI • Google Solution Challenge</p>
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            API Connected
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
