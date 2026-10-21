import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Sun,
  Moon,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuthRole } from '../../hooks/useAuthRole';
import { ROLES } from '../../utils/constants';
import NotificationBell from '../common/NotificationBell';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { toggleTheme, isDark } = useTheme();
  const { user, role, logout, isAuthenticated } = useAuthRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getDashboardPath = () => {
    if (role === ROLES.INSTRUCTOR) return '/instructor';
    if (role === ROLES.ADMIN) return '/admin';
    return '/student';
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/40 dark:bg-black/40 backdrop-blur-3xl border-b border-white/30 dark:border-white/10 shadow-soft">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4"
      >
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-glow group-hover:scale-110 transition-transform duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 -translate-x-full transition-transform group-hover:translate-x-full duration-700" />
            <GraduationCap className="w-6 h-6 z-10" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-primary dark:text-white leading-none font-display">
              Learn<span className="text-accent">Flow</span>
            </span>
            <span className="text-[10px] font-medium text-slate-400 tracking-widest uppercase">
              Immersive LMS
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link
            to="/courses"
            className={`hover:text-accent dark:hover:text-accent-400 transition-colors ${
              location.pathname === '/courses' ? 'text-accent dark:text-accent-400 font-semibold' : ''
            }`}
          >
            Explore Courses
          </Link>
          <Link
            to="/about"
            className={`hover:text-accent dark:hover:text-accent-400 transition-colors ${
              location.pathname === '/about' ? 'text-accent dark:text-accent-400 font-semibold' : ''
            }`}
          >
            About
          </Link>
          <Link
            to="/contact"
            className={`hover:text-accent dark:hover:text-accent-400 transition-colors ${
              location.pathname === '/contact' ? 'text-accent dark:text-accent-400 font-semibold' : ''
            }`}
          >
            Contact
          </Link>
          {isAuthenticated && (
            <Link
              to={getDashboardPath()}
              className="px-5 py-2 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-glow hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] transition-all duration-300 flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Dashboard
            </Link>
          )}
        </nav>

        {/* Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-slate-500 hover:text-accent dark:text-slate-400 dark:hover:text-accent-400 hover:bg-white/50 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer backdrop-blur"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          {isAuthenticated && <NotificationBell />}

          {/* Role Switcher & User Button */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border border-white/30 dark:border-white/10 hover:border-white/50 dark:hover:border-white/20 bg-white/40 dark:bg-white/5 transition-all duration-300 cursor-pointer backdrop-blur-xl"
              >
                <img
                  src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                  alt={user?.name || "User"}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-accent/40 shadow-lg"
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[100px]">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                    {role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2.5 w-72 bg-white dark:bg-cardDark rounded-[2rem] shadow-2xl border border-white/20 dark:border-white/10 z-50 p-3 backdrop-blur-3xl"
                >
                  <div className="px-3 py-2.5 border-b border-white/20 dark:border-white/10 mb-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {user?.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    <span className="mt-1.5 inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-accent-50 dark:bg-accent-900/30 text-accent">
                      Active: {role}
                    </span>
                  </div>

                  <div className="pt-1 mt-1 border-t border-white/20 dark:border-white/10">
                    <Link
                      to="/student/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10 rounded-xl backdrop-blur transition-colors"
                    >
                      <User className="w-3.5 h-3.5" /> Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl backdrop-blur transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/sign-in"
                className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-accent dark:hover:text-accent-400 px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="text-xs font-semibold text-white bg-gradient-to-r from-primary to-accent px-4.5 py-2.5 rounded-2xl transition-all duration-300 shadow-glow hover:shadow-[0_0_35px_rgba(14,165,233,0.4)] hover:scale-105"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10 rounded-xl cursor-pointer backdrop-blur transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden px-4 pt-2 pb-7 border-b border-white/20 dark:border-white/10 bg-white dark:bg-cardDark space-y-2 backdrop-blur-3xl"
        >
          <Link
            to="/courses"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
          >
            Explore Courses
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
          >
            About
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
          >
            Contact
          </Link>
          {isAuthenticated && (
            <Link
              to={getDashboardPath()}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-accent bg-accent/10"
            >
              Go to {role} Dashboard
            </Link>
          )}
        </motion.div>
      )}
    </header>
  );
}
