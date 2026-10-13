import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, Link } from '../context/RouterContext';
import { CitySelector } from './CitySelector';
import {
  Home,
  Compass,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  PlusCircle,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { path } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo & City Selector */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                  <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Move-<span className="text-emerald-600">In</span>
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-700 tracking-wider uppercase font-semibold hidden xs:block">
                    Nepal Real Estate
                  </span>
                </div>
              </Link>

              {/* Housing.com style Global City Selector */}
              <CitySelector />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href="/"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  path === '/'
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Home
              </Link>
              <Link
                href="/propertyview"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  path.startsWith('/propertyview')
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Compass className="w-4 h-4 text-emerald-700" />
                Browse Properties
              </Link>

              {/* Conditional links based on role */}
              {user && (user.role === 'owner' || user.role === 'admin') && (
                <Link
                  href="/dashboard"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    path === '/dashboard'
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-600" />
                  Owner Dashboard
                </Link>
              )}

              {user && user.role === 'admin' && (
                <Link
                  href="/admin"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    path === '/admin'
                      ? 'text-purple-700 bg-purple-50'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  Admin Panel
                </Link>
              )}
            </nav>

            {/* User Auth Actions Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  {/* Post Property Quick CTA for owners */}
                  {user.role === 'owner' && (
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add Property
                    </Link>
                  )}

                  {/* Profile capsule */}
                  <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.full_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[120px]">
                        {user.full_name}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border uppercase tracking-wider w-fit ${getRoleBadge(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    title="Log out"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    aria-label="Log out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:text-emerald-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                  >
                    <LogIn className="w-4 h-4" />
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl animate-fade-in">
            {user && (
              <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between mb-3 border border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-700">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                    ) : (
                      user.full_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user.full_name}</p>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${getRoleBadge(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              <Home className="w-4 h-4 text-emerald-600" />
              Home
            </Link>

            <Link
              href="/propertyview"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              Browse Properties
            </Link>

            {user && (user.role === 'owner' || user.role === 'admin') && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                Owner Dashboard
              </Link>
            )}

            {user && user.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Admin Panel
              </Link>
            )}

            {!user ? (
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-bold text-slate-800 border border-slate-200 hover:bg-slate-50"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white"
                >
                  Register
                </Link>
              </div>
            ) : null}
          </div>
        )}
      </header>

    </>
  );
};
