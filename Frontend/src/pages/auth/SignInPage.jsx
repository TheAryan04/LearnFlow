import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { GraduationCap, ArrowRight, Shield, User, BookOpen } from 'lucide-react';
import { setCredentials } from '../../redux/slices/authSlice';
import { ROLES } from '../../utils/constants';
import { useToast } from '../../components/common/Toast';
import Navbar from '../../components/layout/Navbar';
import api, { setAuthToken } from '../../utils/api';
import { setSocketToken } from '../../utils/socket';

export default function SignInPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const finishLogin = ({ user, token }) => {
    setAuthToken(token);
    setSocketToken(token);
    dispatch(setCredentials({ user, token }));
    toast.success(`Welcome to LearnFlow, ${user.name}!`);
    navigate(user.role === ROLES.ADMIN ? '/admin' : user.role === ROLES.INSTRUCTOR ? '/instructor' : '/student');
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/demo', { role: role.toLowerCase() });
      finishLogin(response.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      finishLogin(response.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bgLight dark:bg-bgDark transition-colors">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-cardDark rounded-3xl border border-slate-200 dark:border-slate-800 shadow-elevated p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white mx-auto mb-4 shadow-md">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Sign In to LearnFlow
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sign in with your LearnFlow account.
            </p>
          </div>

          {/* Quick 1-Click Role Logins */}
          <div className="space-y-2.5 mb-6">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Instant Demo Access
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin(ROLES.STUDENT)}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-accent hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer text-center group"
              >
                <BookOpen className="w-5 h-5 text-accent mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Student
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin(ROLES.INSTRUCTOR)}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-accent hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer text-center group"
              >
                <User className="w-5 h-5 text-primary dark:text-accent mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Instructor
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin(ROLES.ADMIN)}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-accent hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer text-center group"
              >
                <Shield className="w-5 h-5 text-purple-500 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Admin
                </span>
              </button>
            </div>
          </div>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <span className="relative px-3 bg-white dark:bg-cardDark text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Or Sign In with Credentials
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary-600 transition-colors shadow-sm cursor-pointer"
            >
              {loading ? 'Signing In...' : 'Sign In to Portal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/sign-up" className="font-semibold text-accent hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
