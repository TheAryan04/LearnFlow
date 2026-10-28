import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowRight, BookOpen, Presentation, ShieldCheck } from 'lucide-react';
import { setCredentials } from '../../redux/slices/authSlice';
import { ROLES } from '../../utils/constants';
import { useToast } from '../../components/common/Toast';
import api, { setAuthToken } from '../../utils/api';
import { setSocketToken } from '../../utils/socket';
import AuthShell, { authLink } from './AuthShell';

const DEMOS = [
  { role: ROLES.STUDENT, desc: 'Courses & coursework', icon: BookOpen },
  { role: ROLES.INSTRUCTOR, desc: 'Teach & grade', icon: Presentation },
  { role: ROLES.ADMIN, desc: 'Run the school', icon: ShieldCheck },
];

export function useFinishLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  return ({ user, token }) => {
    setAuthToken(token);
    setSocketToken(token);
    dispatch(setCredentials({ user, token }));
    toast.success(`Welcome, ${user.name}.`);
    navigate(user.role === ROLES.ADMIN ? '/admin' : user.role === ROLES.INSTRUCTOR ? '/instructor' : '/student');
  };
}

export default function SignInPage() {
  const toast = useToast();
  const finishLogin = useFinishLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(null);

  const run = async (key, request) => {
    setLoading(key);
    try {
      finishLogin((await request()).data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(null);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    run('form', () => api.post('/auth/login', { email, password }));
  };

  return (
    <AuthShell
      eyebrow="Sign in"
      title={<>Welcome <em className="text-terra-700">back</em>.</>}
      subtitle="Pick up exactly where you left off."
      footer={<>New to LearnFlow? {authLink('/sign-up', 'Create an account', 'signin-to-signup-link')}</>}
    >
      <form onSubmit={submit} className="space-y-5" data-testid="signin-form">
        <label className="block">
          <span className="text-sm text-ink-700">Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="lf-input mt-1.5" placeholder="you@school.edu" data-testid="signin-email-input" />
        </label>
        <label className="block">
          <span className="text-sm text-ink-700">Password</span>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="lf-input mt-1.5" placeholder="••••••••" data-testid="signin-password-input" />
        </label>
        <button type="submit" disabled={!!loading} className="lf-btn-primary w-full !py-3" data-testid="signin-submit-button">
          {loading === 'form' ? 'Signing in…' : 'Sign in'} <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="flex items-center gap-4 my-10">
        <span className="flex-1 lf-rule" />
        <span className="lf-eyebrow">or explore a demo</span>
        <span className="flex-1 lf-rule" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {DEMOS.map(({ role, desc, icon: Icon }) => (
          <button
            key={role}
            type="button"
            disabled={!!loading}
            onClick={() => run(role, () => api.post('/auth/demo', { role: role.toLowerCase() }))}
            className="group text-left p-4 rounded-lg border border-rule bg-white/60 hover:border-terra-300 hover:bg-terra-50 transition-colors disabled:opacity-60"
            data-testid={`signin-demo-${role.toLowerCase()}-button`}
          >
            <Icon className="w-4 h-4 text-terra-600 mb-3" />
            <span className="block text-sm font-medium text-ink-900">{loading === role ? 'Opening…' : role}</span>
            <span className="block text-[11px] text-ink-500 mt-0.5">{desc}</span>
          </button>
        ))}
      </div>
    </AuthShell>
  );
}
