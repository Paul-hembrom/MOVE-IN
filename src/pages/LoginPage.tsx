import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, Link } from '../context/RouterContext';
import { useToast } from '../context/ToastContext';
import { UserRole } from '../types';
import { LogIn, Lock, Mail, Home, ArrowRight, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickLogin, isLiveSupabase } = useAuth();
  const { navigate } = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectByRole = (role: UserRole) => {
    if (role === 'owner') navigate('/dashboard');
    else if (role === 'admin') navigate('/admin');
    else navigate('/propertyview');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('Please enter both email and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        // Find role from current user state or guess
        if (email.includes('admin')) {
          redirectByRole('admin');
        } else if (email.includes('owner') || email.includes('ramesh') || email.includes('sita')) {
          redirectByRole('owner');
        } else {
          redirectByRole('hunter');
        }
      } else {
        showToast(res.error || 'Invalid email or password.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Login failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRoleLogin = async (role: UserRole) => {
    await quickLogin(role);
    redirectByRole(role);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        {/* Brand header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-emerald-600/20">
            <Home className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign in to SajiloKotha
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your verified listings, inquiries, or room hunt
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Quick Demo Logins for fast testing */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-3 flex items-center justify-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            Instant One-Click Demo Logins:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickRoleLogin('hunter')}
              className="py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-xl border border-emerald-200 text-center transition-colors"
            >
              Hunter
              <span className="block text-[9px] font-normal text-emerald-600">Browse view</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickRoleLogin('owner')}
              className="py-2 px-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold rounded-xl border border-blue-200 text-center transition-colors"
            >
              Owner
              <span className="block text-[9px] font-normal text-blue-600">Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickRoleLogin('admin')}
              className="py-2 px-2 bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-bold rounded-xl border border-purple-200 text-center transition-colors"
            >
              Admin
              <span className="block text-[9px] font-normal text-purple-600">Approval</span>
            </button>
          </div>
        </div>

        {/* Register footer link */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-600">
            Don't have an account yet?{' '}
            <Link
              href="/register"
              className="font-bold text-emerald-600 hover:text-emerald-700 underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
