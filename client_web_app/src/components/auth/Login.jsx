import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'username': username,
          'password': password
        })
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      login(data.access_token);
      
      navigate(`/${data.role}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-200 font-sans">
      <div className="max-w-md w-full bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
            <span className="font-bold text-white text-2xl">V</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-2">Sign in to your account</p>
        </div>
        
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              required 
            />
          </div>
          
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors mt-6"
          >
            Sign In
          </button>
        </form>
        
        <div className="mt-8 text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          <p className="mb-2 text-slate-400">Multi-Role Demo Accounts</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <p className="text-blue-500">SENDER</p>
              <p>sender_1</p>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <p className="text-emerald-500">RECEIVER</p>
              <p>receiver_1</p>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
              <p className="text-indigo-500">DRIVER</p>
              <p>driver_1</p>
            </div>
          </div>
          <p className="mt-4 lowercase font-medium">password for all: <span className="text-slate-300">password123</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
