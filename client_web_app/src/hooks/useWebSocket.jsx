import { useState, useEffect, useRef, useCallback } from 'react';

const RECONNECT_DELAY_MS = 3000;

const useWebSocket = (token) => {
  const [truckLogs, setTruckLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [aiResponses, setAiResponses] = useState({});
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  const connect = useCallback(() => {
    if (!token) return;

    // Clean up any existing connection
    if (wsRef.current) {
      wsRef.current.onclose = null; // Prevent auto-reconnect trigger during manual close
      wsRef.current.close();
    }

    console.log('[WS] Connecting...');
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] Connected ✅');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'log_update') {
          // Unified real-time truck telemetry + GPS update
          const data = message.data;
          // Normalize location — data may come as flat (latitude/longitude) or nested ({ location: {...} })
          const lat = data.location?.latitude ?? data.latitude;
          const lng = data.location?.longitude ?? data.longitude;
          const normalized = {
            ...data,
            location: { latitude: lat, longitude: lng },
          };
          setTruckLogs(prev => ({ ...prev, [normalized.truck_id]: normalized }));
          setLoading(false);
        } else if (message.type === 'advisory_update') {
          setAiResponses(prev => ({ ...prev, [message.data.truck_id]: message.data.advisory_text }));
        } else if (message.type === 'no_data') {
          setLoading(false);
        }
      } catch (e) {
        console.error('[WS] Failed to parse message:', e);
      }
    };

    ws.onerror = (error) => {
      console.error('[WS] Error:', error);
      setLoading(false);
      setConnected(false);
    };

    ws.onclose = () => {
      console.warn('[WS] Disconnected. Reconnecting in 3s...');
      setConnected(false);
      // Auto-reconnect
      reconnectTimer.current = setTimeout(() => {
        connect();
      }, RECONNECT_DELAY_MS);
    };
  }, [token]);

  useEffect(() => {
    connect();
    return () => {
      // Cleanup on unmount — stop reconnect loop and close socket
      clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { truckLogs, loading, aiResponses, connected };
};

export default useWebSocket;
