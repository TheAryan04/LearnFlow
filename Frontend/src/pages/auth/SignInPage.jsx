import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, Shield, User, BookOpen, Mail, Lock } from 'lucide-react';
import { setCredentials } from '../../redux/slices/authSlice';
import { ROLES } from '../../utils/constants';
import { useToast } from '../../components/common/Toast';
import Navbar from '../../components/layout/Navbar';
import api, { setAuthToken } from '../../utils/api';
import { setSocketToken } from '../../utils/socket';
import FloatingElements from '../../components/ui/FloatingElements';
import GlassCard from '../../components/ui/GlassCard';
import Badge from '../../components/ui/Badge';

const reveal = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
};

const ROLE_OPTIONS = [
  { value: ROLES.STUDENT, label: 'Student', desc: 'Enroll & study', icon: BookOpen, color: 'text-accent' },
  { value: ROLES.INSTRUCTOR, label: 'Instructor', desc: 'Publish & grade', icon: User, color: 'text-primary' },
  { value: ROLES.ADMIN, label: 'Admin', desc: 'Govern & manage', icon: Shield, color: 'text-purple-500' },
];

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
    <div className="min-h-screen flex flex-col bg-bgLight dark:bg-bgDark transition-colors duration-700">
      <FloatingElements className="pointer-events-none" />
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md w-full"
        >
          <GlassCard variant="strong" className="p-8 sm:p-10 rounded-[3rem] shadow-2xl">
            <div className="text-center mb-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white mx-auto mb-5 shadow-glow">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                Sign In to LearnFlow
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                Enter your credentials to access your learning portal.
              </p>
            </div>

            {/* Instant Demo Logins */}
            <div className="space-y-2.5 mb-8">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-4">
                Instant Demo Access
              </p>
              <div className="grid grid-cols-3 gap-2">
                {ROLE_OPTIONS.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => handleDemoLogin(role.value)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all cursor-pointer text-center group ${
                      'border-slate-200 dark:border-slate-700 hover:border-accent hover:bg-accent-50 dark:hover:bg-accent-500/10'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${role.color} group-hover:scale-110 transition-transform`}>
                      <role.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-accent dark:group-hover:text-accent-400 transition-colors">
                      {role.label}
                    </span>
                    <span className="text-[9px] text-slate-400">{role.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative my-8 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20 dark:border-white/10" />
              </div>
              <span className="relative px-4 bg-white dark:bg-cardDark text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Or Sign In with Credentials
              </span>
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/60 dark:bg-white/8 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-accent focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/60 dark:bg-white/8 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-accent focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-primary to-accent shadow-glow hover:shadow-[0_0_40px_rgba(14,165,233,0.5)] transition-all duration-300 hover:scale-[1.02] cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In to Portal'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
              Don't have an account yet?{' '}
              <Link to="/sign-up" className="font-bold text-accent dark:text-accent-400 hover:underline transition-colors">
                Sign Up
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
