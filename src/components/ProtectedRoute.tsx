import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, Link } from '../context/RouterContext';
import { UserRole } from '../types';
import { ShieldAlert, LogIn, UserCheck } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading, quickLogin } = useAuth();
  const { navigate } = useRouter();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-medium">Verifying authorization...</p>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Authentication Required</h2>
        <p className="text-sm text-slate-600 mb-6">
          Please log in to your account to view this section of Move-In.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Go to Login
          </Link>
          <Link
            href="/register"
            className="w-full py-2.5 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl text-sm transition-colors"
          >
            Create New Account
          </Link>
        </div>
      </div>
    );
  }

  // Check role permission
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-lg mx-auto my-16 p-8 bg-white rounded-2xl border border-rose-100 shadow-sm text-center">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-sm text-slate-600 mb-4">
          This portal is restricted to accounts with role{' '}
          <strong className="text-slate-900 font-semibold">{allowedRoles.join(' or ')}</strong>.
          Your current account role is <span className="capitalize font-semibold text-emerald-600">{user.role}</span>.
        </p>

        {/* Quick helper for testers */}
        <div className="bg-slate-50 p-4 rounded-xl mb-6 text-left border border-slate-200/70">
          <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            Switch role to test this page:
          </p>
          <div className="flex flex-wrap gap-2">
            {allowedRoles.map((role) => (
              <button
                key={role}
                onClick={async () => {
                  await quickLogin(role);
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors capitalize"
              >
                Switch to {role}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="text-xs text-slate-500 hover:text-slate-800 font-medium"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
