import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuthRole } from '../../hooks/useAuthRole';
import { ROLES } from '../../utils/constants';
import NotificationBell from '../common/NotificationBell';
import { UserButton } from '@clerk/react';

const LINKS = [
  { to: '/courses', label: 'Catalogue' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function Wordmark() {
  return (
    <Link to="/" className="flex items-baseline gap-1.5 group" data-testid="navbar-logo">
      <span className="font-serif text-2xl text-ink-900 tracking-tight">LearnFlow</span>
      <span className="w-1.5 h-1.5 rounded-full bg-terra-600 group-hover:scale-125 transition-transform" />
    </Link>
  );
}

function UserMenu({ user, role, onLogout }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-surface transition-colors" data-testid="navbar-user-menu-button">
        <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full object-cover bg-surface" />
        <span className="hidden sm:block text-sm text-ink-800 max-w-[120px] truncate">{user?.name}</span>
        <ChevronDown className="w-3.5 h-3.5 text-ink-400" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-rule rounded-lg shadow-floating p-2 z-50 animate-fade-in" data-testid="navbar-user-menu">
          <div className="px-3 py-3 border-b border-rule mb-1">
            <p className="text-sm font-medium text-ink-900 truncate">{user?.name}</p>
            <p className="text-xs text-ink-500 truncate">{user?.email}</p>
            <p className="lf-eyebrow mt-2 text-terra-700">{role}</p>
          </div>
          {role === ROLES.STUDENT && (
            <Link to="/student/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-ink-700 rounded-md hover:bg-surface" data-testid="navbar-profile-link">
              <User className="w-4 h-4" /> Profile
            </Link>
          )}
          <button onClick={() => { setOpen(false); onLogout(); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rust-600 rounded-md hover:bg-rust-50" data-testid="navbar-signout-button">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, role, logout, isAuthenticated, mode } = useAuthRole();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const dashboard = role === ROLES.INSTRUCTOR ? '/instructor' : role === ROLES.ADMIN ? '/admin' : '/student';
  const linkCls = ({ isActive }) => `text-sm transition-colors ${isActive ? 'text-ink-900 underline decoration-terra-600 underline-offset-[6px]' : 'text-ink-600 hover:text-ink-900'}`;

  return (
    <header className="sticky top-0 z-50 w-full bg-paper/85 backdrop-blur-md border-b border-rule" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
        <Wordmark />
        <nav className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => <NavLink key={l.to} to={l.to} className={linkCls} data-testid={`navbar-link-${l.label.toLowerCase()}`}>{l.label}</NavLink>)}
          {isAuthenticated && <NavLink to={dashboard} className={linkCls} data-testid="navbar-link-dashboard">Dashboard</NavLink>}
        </nav>
        <div className="flex items-center gap-2">
          {isAuthenticated && <NotificationBell />}
          {isAuthenticated && mode === 'clerk' ? (
            <div className="flex items-center gap-3 pl-1" data-testid="navbar-clerk-user">
              <span className="hidden sm:block text-right leading-tight">
                <span className="block text-sm text-ink-800 max-w-[140px] truncate">{user?.name}</span>
                <span className="block text-[10px] uppercase tracking-[0.14em] text-terra-700">{role}</span>
              </span>
              <UserButton />
            </div>
          ) : isAuthenticated ? (
            <UserMenu user={user} role={role} onLogout={() => { logout(); navigate('/'); }} />
          ) : (
            <div className="flex items-center gap-1">
              <Link to="/sign-in" className="lf-btn-ghost" data-testid="navbar-signin-link">Sign in</Link>
              <Link to="/sign-up" className="lf-btn-primary hidden sm:inline-flex" data-testid="navbar-signup-link">Start learning</Link>
            </div>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-md text-ink-700 hover:bg-surface" data-testid="navbar-mobile-toggle" aria-label="Menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav className="md:hidden border-t border-rule px-5 py-4 flex flex-col gap-1 bg-paper animate-fade-in" data-testid="navbar-mobile-menu">
          {[...LINKS, ...(isAuthenticated ? [{ to: dashboard, label: 'Dashboard' }] : [{ to: '/sign-up', label: 'Create account' }])].map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="py-2.5 font-serif text-xl text-ink-800 border-b border-rule/70">{l.label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}
