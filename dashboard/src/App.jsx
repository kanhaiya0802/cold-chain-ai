import React from 'react'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200">
      {/* Navigation Bar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white">V</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">VacciTrack <span className="text-blue-500 text-sm">AI</span></span>
          </div>
          <div className="flex gap-4">
            <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Overview</button>
            <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors">History</button>
            <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Settings</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8">
        <Dashboard />
      </main>

      {/* Footer */}
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
    </div>
  )
}

export default App
