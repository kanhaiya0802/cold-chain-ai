import React, { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Thermometer, MapPin, Activity, AlertTriangle, CheckCircle, Navigation, Brain, Zap, ShieldAlert, Info } from 'lucide-react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { GoogleGenerativeAI } from "@google/generative-ai";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_MAPS_API_KEY;

// NEW CONFIG: Google Gemini API Key
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const mapContainerStyle = { width: '100%', height: '100%' };
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  styles: [
    { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] }
  ]
};

const Dashboard = () => {
  const [latestLog, setLatestLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const advisoryGeneratedRef = useRef(false);
  const lastApiCallTimeRef = useRef(0); // Timestamp of last API call
  const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes cooldown

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  // Firestore real-time listener
  useEffect(() => {
    console.log("Initializing Firestore listener...");
    const q = query(collection(db, 'truck_logs'), orderBy('timestamp', 'desc'), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        console.log("New log received:", data);
        setLatestLog(data);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // AI Trigger Logic
  useEffect(() => {
    if (!latestLog) return;

    const temp = latestLog.temperature;
    console.log(`Current Temp: ${temp}°C`);

    const now = Date.now();
    if (temp > 8.0) {
      if (!advisoryGeneratedRef.current && (now - lastApiCallTimeRef.current) > COOLDOWN_MS) {
        console.log("Triggering Gemini API...");
        getAiAdvice(latestLog);
        advisoryGeneratedRef.current = true;
        lastApiCallTimeRef.current = now;
      } else if ((now - lastApiCallTimeRef.current) <= COOLDOWN_MS) {
        console.log("API call on cooldown. Skipping.");
      }
    } else {
      console.log("Temp safe. Clearing advisory.");
      setAiResponse("System Monitoring: All clear. Vaccine temperature is within safe limits (2°C - 8°C).");
      advisoryGeneratedRef.current = false;
    }
    }
  }, [latestLog]); // Keep dependency array minimal to avoid loops

  const formatAiResponse = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => {
      let isList = false;
      let cleanLine = line;
      if (cleanLine.trim().startsWith('* ') || cleanLine.trim().startsWith('- ')) {
        isList = true;
        cleanLine = cleanLine.trim().substring(2);
      } else if (/^\d+\.\s/.test(cleanLine.trim())) {
        isList = true;
        cleanLine = cleanLine.trim().replace(/^\d+\.\s/, '');
      }

      const parts = cleanLine.split(/(\*\*.*?\*\*)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-white">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isList) {
        return (
          <li key={index} className="flex items-start gap-3 mb-3 bg-white/5 p-3 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
             <span className="text-red-400 mt-0.5 shadow-sm"><Zap size={16} /></span>
             <span className="text-slate-200">{parts}</span>
          </li>
        );
      }
      return <p key={index} className="mb-3 text-slate-300 leading-relaxed">{parts}</p>;
    });
  };

  const getAiAdvice = async (data) => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    setAiResponse("Generating emergency plan...");
    
    // Initialize model inside function to ensure fresh context, force v1beta API
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel(
      { model: "gemini-flash-latest" },
      { apiVersion: "v1beta" }
    );
    console.log("Calling Gemini with v1beta...");

    try {
      const lat = data.location.latitude;
      const lng = data.location.longitude;
      const temp = data.temperature;

      const result = await model.generateContent(`Truck at ${lat}, ${lng} is at ${temp}°C. The temperature is critical. Please provide a brief emergency plan and suggest 3 nearest hospitals. Format the hospitals as a clear bulleted list.`);
      const response = await result.response;
      const text = response.text();
      console.log("SUCCESS: Gemini Response Received:", text);
      setAiResponse(text);
    } catch (error) {
      console.error("CRITICAL: Gemini API Connection Failed", error);
      setAiResponse(`Connection Error: ${error.message || "Please check your internet and Gemini API Key."}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isWarning = latestLog?.temperature > 8.0;
  const position = latestLog ? { lat: latestLog.location.latitude, lng: latestLog.location.longitude } : { lat: 12.9716, lng: 77.5946 };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">VacciTrack Live Monitor</h1>
          <div className="flex items-center gap-2 text-slate-400">
            <Navigation size={16} className="text-blue-500" />
            <p>Tracking: <span className="text-slate-200 font-semibold">{latestLog?.truck_id || 'TRUCK_001'}</span></p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${isWarning ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : 'bg-green-500/20 text-green-400 border border-green-500/50'}`}>
          {isWarning ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
          <span className="font-semibold uppercase tracking-wider">{isWarning ? 'Critical: High Temperature' : 'System Healthy'}</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Thermometer className={isWarning ? 'text-red-400' : 'text-blue-400'} size={24} />} label="Temperature" value={latestLog ? `${latestLog.temperature.toFixed(1)}°C` : '--'} subValue="/ 8°C max" isWarning={isWarning} tag="LIVE" accentColor={isWarning ? "red" : "blue"} />
        <StatCard icon={<Activity className="text-purple-400" size={24} />} label="Sensor Health" value={latestLog?.status || 'Active'} isWarning={isWarning} tag="IOT" accentColor="purple" />
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 lg:col-span-2 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-4"><div className="p-3 bg-indigo-500/10 rounded-xl"><MapPin className="text-indigo-400" size={24} /></div><span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">GPS</span></div>
          <h3 className="text-slate-400 text-sm font-medium">Coordinates</h3>
          <div className="mt-2 text-xl font-bold text-slate-200 font-mono flex gap-8">
            <div><span className="text-[10px] text-slate-500 block">LATITUDE</span>{latestLog?.location.latitude.toFixed(6)}</div>
            <div><span className="text-[10px] text-slate-500 block">LONGITUDE</span>{latestLog?.location.longitude.toFixed(6)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg shadow-black/20 flex flex-col min-h-[450px]">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div><h3 className="font-semibold text-slate-300 text-sm">Live GPS Tracking</h3></div>
          </div>
          <div className="flex-1">
            {isLoaded ? <GoogleMap mapContainerStyle={mapContainerStyle} center={position} zoom={15} options={mapOptions}><MarkerF position={position} icon={{ url: 'https://maps.google.com/mapfiles/ms/icons/truck.png', scaledSize: new window.google.maps.Size(40, 40) }} /></GoogleMap> : <div className="h-full bg-slate-900 animate-pulse"></div>}
          </div>
        </div>

        <div className={`rounded-2xl border flex flex-col shadow-lg shadow-black/20 overflow-hidden ${isWarning ? 'bg-red-950/20 border-red-500/30' : 'bg-slate-800 border-slate-700'}`}>
          <div className={`p-4 border-b flex items-center justify-between ${isWarning ? 'bg-red-500/10 border-red-500/20' : 'bg-slate-800/50 border-slate-700'}`}>
            <div className="flex items-center gap-2"><Brain className={isWarning ? 'text-red-400' : 'text-blue-400'} size={20} /><h3 className="font-bold text-sm tracking-wide uppercase">AI Emergency Advisory</h3></div>
            {isAiLoading && <Zap className="text-yellow-400 animate-bounce" size={18} />}
          </div>
          <div className={`flex-1 p-5 overflow-y-auto max-h-[450px] transition-opacity duration-300 ${isAiLoading ? 'opacity-50' : 'opacity-100'}`}>
            <div className="prose prose-invert prose-sm max-w-none">
              {isWarning ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-400 font-bold p-2 bg-red-500/10 rounded border border-red-500/20"><ShieldAlert size={20} />EMERGENCY DETECTED</div>
                  <div className="text-slate-300 leading-relaxed text-sm">{formatAiResponse(aiResponse)}</div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
                  <div className="p-4 bg-green-500/10 rounded-full border border-green-500/20"><CheckCircle className="text-green-500" size={48} /></div>
                  <div><p className="text-green-400 font-bold">ALL CLEAR</p><p className="text-slate-500 text-xs mt-1">System Monitoring: All clear.</p></div>
                </div>
              )}
            </div>
          </div>
          {isWarning && <div className="p-3 bg-red-500/10 border-t border-red-500/20 text-[10px] text-red-300 flex items-center gap-2"><Info size={14} />Advisory generated by Gemini 1.5 Flash.</div>}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, subValue, tag, accentColor }) => {
  const colors = { blue: "border-blue-500/30 hover:border-blue-500/60", red: "border-red-500/30 hover:border-red-500/60", purple: "border-purple-500/30 hover:border-purple-500/60" };
  return (
    <div className={`bg-slate-800 rounded-2xl p-6 border transition-all shadow-lg shadow-black/20 ${colors[accentColor]}`}>
      <div className="flex items-center justify-between mb-4"><div className={`p-3 rounded-xl bg-${accentColor}-500/10`}>{icon}</div><span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">{tag}</span></div>
      <h3 className="text-slate-400 text-sm font-medium">{label}</h3>
      <div className="flex items-baseline gap-2 mt-2"><span className="text-4xl font-bold text-white">{value}</span>{subValue && <span className="text-slate-500 text-sm">{subValue}</span>}</div>
    </div>
  );
};

export default Dashboard;
