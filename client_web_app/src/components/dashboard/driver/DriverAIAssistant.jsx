import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { Sparkles, Send, Bot, User, Thermometer, ShieldAlert, Truck, Navigation } from 'lucide-react';

const DriverAIAssistant = () => {
  const { token, user } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello ${user?.name || 'Driver'}. I am your Cold-Chain AI Co-pilot. How can I assist you with your shipment today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      // For demo, we simulate a very helpful AI response tailored to drivers
      const response = await fetch('http://127.0.0.1:8000/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: `[DRIVER MODE] Current Situation: Shipment SH-101, Truck TRK-001. User Question: ${userMsg}`
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to the safety server. Please ensure your cooling unit is active and contact Dispatch if temperature exceeds 8°C." }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4 px-2">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
               <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">AI Co-Pilot</h1>
         </div>
         <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-widest">Active Safety</span>
      </div>

      {/* Suggested Topics */}
      <div className="flex gap-2 overflow-x-auto pb-4 px-1 no-scrollbar">
         {[
           { icon: Thermometer, label: 'Temp Breach' },
           { icon: ShieldAlert, label: 'Cooling Fail' },
           { icon: Truck, label: 'Breakdown' },
           { icon: Navigation, label: 'Reroute' }
         ].map((topic, i) => (
           <button 
             key={i}
             onClick={() => setInput(topic.label)}
             className="whitespace-nowrap flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 hover:border-indigo-300 transition-all shadow-sm"
           >
             <topic.icon className="w-3.5 h-3.5" /> {topic.label}
           </button>
         ))}
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
              <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                  m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'
                }`}>
                  {m.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl rounded-tl-none animate-pulse">
                  <div className="flex gap-1">
                     <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                     <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                     <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                  </div>
               </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <input 
            type="text"
            className="flex-1 px-4 py-3 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            placeholder="Type emergency query..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:bg-slate-300 transition-all shadow-lg shadow-indigo-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default DriverAIAssistant;
