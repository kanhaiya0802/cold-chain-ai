import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

// Generate unique session ID for this browser tab
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get or create session ID for this tab (stored in sessionStorage, not persisted across closes)
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const sessionId = getSessionId();
    const storedTokens = JSON.parse(localStorage.getItem('auth_sessions') || '{}');
    
    if (storedTokens[sessionId]) {
      const storedToken = storedTokens[sessionId].token;
      if (storedToken) {
        try {
          const decoded = jwtDecode(storedToken);
          setToken(storedToken);
          setUser(decoded);
        } catch (error) {
          console.error("Invalid stored token", error);
          // Clear invalid token
          delete storedTokens[sessionId];
          localStorage.setItem('auth_sessions', JSON.stringify(storedTokens));
        }
      }
    }
    setIsLoading(false);
  }, []);

  // Update localStorage whenever token changes
  useEffect(() => {
    const sessionId = getSessionId();
    const storedTokens = JSON.parse(localStorage.getItem('auth_sessions') || '{}');

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        
        storedTokens[sessionId] = {
          token,
          user: decoded,
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('auth_sessions', JSON.stringify(storedTokens));
      } catch (error) {
        console.error("Invalid token", error);
        setToken(null);
        setUser(null);
        delete storedTokens[sessionId];
        localStorage.setItem('auth_sessions', JSON.stringify(storedTokens));
      }
    } else {
      setUser(null);
      delete storedTokens[sessionId];
      localStorage.setItem('auth_sessions', JSON.stringify(storedTokens));
    }
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
