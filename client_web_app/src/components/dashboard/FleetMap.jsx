import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_MAPS_API_KEY;

const mapContainerStyle = { width: '100%', height: '100%' };

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#1a2332' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a2332' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8899aa' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#c8d6e5' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d3f55' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a2332' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a5270' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f3148' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1b2a' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  ],
};

const FleetMap = ({ truckArray, connected, onTruckSelect }) => {
  const [selectedTruck, setSelectedTruck] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const validTrucks = truckArray.filter(
    t => t?.location?.latitude && t?.location?.longitude
  );

  const centerPosition =
    validTrucks.length > 0
      ? { lat: validTrucks[0].location.latitude, lng: validTrucks[0].location.longitude }
      : { lat: 12.9716, lng: 77.5946 }; // Default: Bengaluru

  const onMarkerClick = useCallback((truck) => {
    setSelectedTruck(truck);
    if (onTruckSelect) onTruckSelect(truck);
  }, [onTruckSelect]);

  const onMapClick = useCallback(() => {
    setSelectedTruck(null);
    if (onTruckSelect) onTruckSelect(null);
  }, [onTruckSelect]);

  const getTruckStatus = (truck) => {
    if (truck.temperature > 8.0) return { color: '#ef4444', label: '🔴 BREACH', bg: 'bg-red-500/20 border-red-500/40' };
    if (truck.temperature > 7.0) return { color: '#f59e0b', label: '🟡 WARNING', bg: 'bg-yellow-500/20 border-yellow-500/40' };
    return { color: '#22c55e', label: '🟢 SAFE', bg: 'bg-emerald-500/20 border-emerald-500/40' };
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl shadow-black/40 flex flex-col h-[520px]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/60 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8">
              <span className="absolute inline-flex w-full h-full rounded-full bg-blue-500 opacity-30 animate-ping"></span>
              <span className="relative inline-flex w-3 h-3 rounded-full bg-blue-400"></span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm tracking-wide">Live GPS Fleet Tracker</h3>
              <p className="text-[11px] text-slate-500">
                {validTrucks.length} truck{validTrucks.length !== 1 ? 's' : ''} on map
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Truck Legend */}
            <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>Safe (≤8°C)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block"></span>Warning</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>Breach</span>
            </div>
            {/* WS Connection badge */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
              connected === false
                ? 'border-red-500/40 bg-red-500/10 text-red-400'
                : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${connected === false ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'}`}></span>
              {connected === false ? 'Reconnecting…' : 'Live'}
            </div>
          </div>
        </div>

        {/* Map Body */}
        <div className="flex-1 relative">
          {loadError && (
            <div className="h-full bg-slate-950 flex items-center justify-center text-red-400 text-sm gap-2">
              ⚠️ Failed to load Google Maps. Check your API key.
            </div>
          )}
          {!loadError && !isLoaded && (
            <div className="h-full bg-slate-950 animate-pulse flex items-center justify-center text-slate-600 text-sm">
              Loading map…
            </div>
          )}
          {isLoaded && !loadError && (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={centerPosition}
              zoom={validTrucks.length > 0 ? 11 : 5}
              options={mapOptions}
              onClick={onMapClick}
            >
              {validTrucks.map(truck => {
                const status = getTruckStatus(truck);
                return (
                  <MarkerF
                    key={truck.truck_id}
                    position={{ lat: truck.location.latitude, lng: truck.location.longitude }}
                    onClick={() => onMarkerClick(truck)}
                    icon={{
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 10,
                      fillColor: status.color,
                      fillOpacity: 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 2,
                    }}
                    label={{
                      text: truck.truck_id?.toString() ?? '?',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 'bold',
                    }}
                  />
                );
              })}

              {/* Info Window on marker click */}
              {selectedTruck && (
                <InfoWindowF
                  position={{
                    lat: selectedTruck.location.latitude,
                    lng: selectedTruck.location.longitude,
                  }}
                  onCloseClick={() => setSelectedTruck(null)}
                >
                  <div style={{ background: '#0f172a', color: '#e2e8f0', borderRadius: '10px', padding: '12px', minWidth: '180px', fontFamily: 'Inter, sans-serif' }}>
                    <p style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#60a5fa' }}>
                      🚛 Truck {selectedTruck.truck_id}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
                      <span style={{ color: '#94a3b8' }}>Temp</span>
                      <span style={{ color: selectedTruck.temperature > 8 ? '#f87171' : '#4ade80', fontWeight: '600' }}>
                        {selectedTruck.temperature?.toFixed(1)}°C
                      </span>
                      <span style={{ color: '#94a3b8' }}>Humidity</span>
                      <span style={{ color: '#e2e8f0' }}>{selectedTruck.humidity?.toFixed(1)}%</span>
                      <span style={{ color: '#94a3b8' }}>Battery</span>
                      <span style={{ color: selectedTruck.battery_level < 20 ? '#f87171' : '#e2e8f0' }}>
                        {selectedTruck.battery_level?.toFixed(0)}%
                      </span>
                      <span style={{ color: '#94a3b8' }}>Door</span>
                      <span style={{ color: selectedTruck.door_status === 'open' ? '#f87171' : '#4ade80', textTransform: 'capitalize' }}>
                        {selectedTruck.door_status}
                      </span>
                      <span style={{ color: '#94a3b8' }}>Lat</span>
                      <span style={{ color: '#e2e8f0' }}>{selectedTruck.location.latitude?.toFixed(4)}</span>
                      <span style={{ color: '#94a3b8' }}>Lng</span>
                      <span style={{ color: '#e2e8f0' }}>{selectedTruck.location.longitude?.toFixed(4)}</span>
                    </div>
                  </div>
                </InfoWindowF>
              )}
            </GoogleMap>
          )}

          {/* Empty state overlay */}
          {isLoaded && validTrucks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-slate-900/90 border border-slate-700 rounded-xl px-6 py-4 text-center">
                <p className="text-slate-400 text-sm">No trucks are broadcasting GPS data yet.</p>
                <p className="text-slate-600 text-xs mt-1">Start the data simulator to see trucks on the map.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FleetMap;
