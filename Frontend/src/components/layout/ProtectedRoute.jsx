import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthRole } from '../../hooks/useAuthRole';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, role } = useAuthRole();

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-cardDark p-8 rounded-3xl border border-amber-200 dark:border-amber-900/50 shadow-elevated text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-amber-100 dark:bg-amber-950/50 text-amber-600 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Role Permission Required
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            This workspace section is restricted to <strong>{allowedRoles.join(' / ')}</strong> users. Your active role is currently <strong>{role}</strong>.
          </p>

          <div className="flex flex-col gap-2">
            <Link
              to="/"
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 py-1"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
