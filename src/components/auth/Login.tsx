import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle } from 'lucide-react';

export function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const setAuth = useAuthStore(state => state.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegistering 
        ? { username, password, email }
        : { username, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isRegistering) {
        setSuccessMsg(data.message);
        setIsRegistering(false);
        setPassword('');
      } else {
        setAuth(data.token, data.user);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-[#141414] border border-[#222] rounded-2xl shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500"></div>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tight mb-2">AR Forge</h1>
            <p className="text-[#888] text-sm">
              {isRegistering ? 'Create your account' : 'Sign in to your workspace'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm text-center">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#888] uppercase tracking-wider">Username</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg py-2.5 pl-10 pr-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Enter username"
                />
              </div>
            </div>

            {isRegistering && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#888] uppercase tracking-wider">Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="For activation notices"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#888] uppercase tracking-wider">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg py-2.5 pl-10 pr-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg mt-6 transition-colors disabled:opacity-50"
            >
              {loading ? 'Please wait...' : (isRegistering ? 'Register' : 'Sign In')}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-[#666]">
            {isRegistering ? 'Already have an account? ' : 'Need an account? '}
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setSuccessMsg('');
              }}
              className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
            >
              {isRegistering ? 'Sign In' : 'Register'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
