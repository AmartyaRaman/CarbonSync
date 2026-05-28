import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Leaf, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, error: authError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setLocalError('Please enter both username and password.');
      return;
    }
    setLocalError(null);
    setSubmitting(true);

    try {
      await login(username, password);
    } catch (err) {
      // AuthContext sets error, we just catch the exception to stop loading state
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 md:p-6 antialiased font-sans text-slate-200 relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px]" />

      <div className="w-full max-w-5xl grid md:grid-cols-12 gap-8 items-center relative z-10">
        {/* Branding/Hero Column (left side on desktop) */}
        <div className="md:col-span-5 space-y-6 text-center md:text-left pr-0 md:pr-6">
          <div className="inline-flex p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 justify-center">
            <Leaf className="w-10 h-10 fill-emerald-500/10" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              CarbonSync
            </h1>
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mt-1">
              Breathe ESG Platform
            </p>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto md:mx-0">
            A secure, enterprise-grade environmental management system for tracing emissions, tracking scope categories, and managing compliance workflows.
          </p>
          
          {/* Quick-select Test Roles Info */}
          <div className="hidden md:block pt-4 space-y-3.5">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Available Test Environments
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>Admin/Analyst</strong>: Full review & flag privileges.</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>Viewer</strong>: View dashboard stats & records only.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Login form Card (right side) */}
        <div className="md:col-span-7 bg-[#111827]/70 border border-slate-800/80 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-md">
          <h2 className="text-xl font-bold text-white tracking-tight mb-1">
            Welcome back
          </h2>
          <p className="text-slate-400 text-xs mb-8">
            Please log in with your account credentials.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {displayError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-semibold flex items-center space-x-2 animate-pulse">
                <div className="w-1.5 h-1.5 bg-rose-400 rounded-full shrink-0" />
                <span>{displayError}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500/80 rounded-xl py-3 pl-11 pr-4 focus:outline-none transition-all duration-200 text-white font-medium placeholder-slate-600"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500/80 rounded-xl py-3 pl-11 pr-4 focus:outline-none transition-all duration-200 text-white font-medium placeholder-slate-600"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white text-xs font-bold tracking-wider uppercase py-3.5 rounded-xl cursor-pointer transition-all duration-200 shadow-md shadow-emerald-950/20 hover:translate-y-[-1px] active:translate-y-[0px] flex items-center justify-center space-x-2"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
