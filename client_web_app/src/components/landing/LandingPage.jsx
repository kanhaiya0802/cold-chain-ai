import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, Activity, Cpu, MapPin, Zap, ArrowRight, PackageOpen, Boxes } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 rounded-2xl hover:bg-slate-800/50 transition-all duration-300 group">
    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
      <Icon className="text-blue-400" size={24} />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full mix-blend-screen"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="font-bold text-white text-xl">V</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              VacciTrack <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 text-lg">AI</span>
            </span>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 rounded-full font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Sign In
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-8 font-medium text-sm">
            <Zap size={16} className="text-amber-400 animate-pulse" />
            Powered by Google Gemini 2.5 Flash
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight">
            Securing the Future of <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-300% animate-pulse">
              Cold Chain Logistics
            </span>
          </h1>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Prevent vaccine spoilage with real-time IoT temperature monitoring, live GPS tracking, and intelligent AI-driven emergency response plans.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-4 rounded-full font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_-15px_rgba(37,99,235,0.7)] transition-all duration-300 flex items-center gap-2 group w-full sm:w-auto justify-center"
            >
              Access Dashboard
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Workflow Section */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Intelligent Logistics Workflow</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Seamlessly tracking assets from multiple senders through a central distributor, directly to the final recipients.</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 md:p-12 relative overflow-hidden backdrop-blur-sm shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
              
              {/* Multiple Senders */}
              <div className="flex flex-col gap-4">
                <div className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm font-medium text-center">Sender A</div>
                <div className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm font-medium text-center">Sender B</div>
                <div className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm font-medium text-center">Sender C</div>
              </div>

              <ArrowRight className="text-slate-600 hidden lg:block" size={32} />
              <ArrowRight className="text-slate-600 block lg:hidden rotate-90" size={32} />

              {/* Central Distributor (Hub) */}
              <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-2xl text-center w-full lg:w-1/3">
                <Boxes className="text-blue-400 mx-auto mb-4" size={40} />
                <h3 className="text-xl font-bold text-white mb-2">Central Distributor</h3>
                <p className="text-sm text-blue-200/70 mb-4">Order Intake & Inventory Check</p>
                <div className="h-px bg-blue-500/20 w-full my-4"></div>
                <div className="flex items-center justify-center gap-2 text-xs text-blue-300">
                  <PackageOpen size={14} /> Processing & Packaging
                </div>
              </div>

              <ArrowRight className="text-slate-600 hidden lg:block" size={32} />
              <ArrowRight className="text-slate-600 block lg:hidden rotate-90" size={32} />

              {/* Transit & AI */}
              <div className="bg-purple-900/20 border border-purple-500/30 p-6 rounded-2xl text-center w-full lg:w-1/3 relative group">
                <Truck className="text-purple-400 mx-auto mb-4" size={40} />
                <h3 className="text-xl font-bold text-white mb-2">In Transit</h3>
                <p className="text-sm text-purple-200/70">IoT & GPS Monitoring</p>
                
                {/* AI Popup Animation */}
                <div className="absolute -top-6 -right-6 bg-slate-800 border border-amber-500/30 p-3 rounded-xl shadow-xl shadow-black/50 hidden group-hover:block animate-pulse text-left min-w-[200px] z-20 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu size={14} className="text-amber-400" />
                    <span className="text-xs font-bold text-slate-200">AI Engine</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Anomaly detected. Alerting Driver and Sender immediately.</p>
                </div>
              </div>

              <ArrowRight className="text-slate-600 hidden lg:block" size={32} />
              <ArrowRight className="text-slate-600 block lg:hidden rotate-90" size={32} />

              {/* Multiple Recipients */}
              <div className="flex flex-col gap-4">
                <div className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm font-medium text-center">Recipient A</div>
                <div className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm font-medium text-center">Recipient B</div>
                <div className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm font-medium text-center">Recipient C</div>
              </div>

            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={Activity} 
            title="Real-time Telemetry" 
            description="Live streaming of temperature and location data via WebSockets, ensuring zero latency monitoring."
          />
          <FeatureCard 
            icon={Cpu} 
            title="AI Emergency Engine" 
            description="Gemini 2.5 instantly analyzes thermal anomalies and generates actionable routing and handling plans."
          />
          <FeatureCard 
            icon={ShieldCheck} 
            title="Cold Chain Integrity" 
            description="End-to-end visibility prevents spoilage, saving costs and ensuring life-saving assets remain viable."
          />
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
