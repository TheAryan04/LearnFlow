import React from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuthRole } from '../../hooks/useAuthRole';
import { ROLES } from '../../utils/constants';
import Navbar from './Navbar';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, role } = useAuthRole();
  if (!isAuthenticated) return <Navigate to="/sign-in" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const home = role === ROLES.ADMIN ? '/admin' : role === ROLES.INSTRUCTOR ? '/instructor' : '/student';
    return (
      <div className="min-h-screen flex flex-col" data-testid="role-restricted">
        <Navbar />
        <div className="max-w-7xl w-full mx-auto px-5 sm:px-8 flex-1 flex items-center"><div className="max-w-lg">
          <p className="lf-eyebrow mb-4">Restricted page</p>
          <h1 className="font-serif text-4xl text-ink-900 mb-3">This page belongs to {allowedRoles.join(' / ')} accounts.</h1>
          <p className="text-ink-500 mb-8">You're signed in as {role}. Head back to your own workspace.</p>
          <Link to={home} className="lf-btn-primary" data-testid="role-restricted-home-link">Go to my dashboard</Link>
        </div></div>
      </div>
    );
  }
  return <Outlet />;
}
