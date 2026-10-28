import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { SignIn } from '@clerk/react';
import { BookOpen, Presentation, ShieldCheck } from 'lucide-react';
import { setCredentials } from '../../redux/slices/authSlice';
import { ROLES } from '../../utils/constants';
import { CLERK_ENABLED } from '../../utils/clerk';
import { useToast } from '../../components/common/Toast';
import api, { setAuthToken } from '../../utils/api';
import { connectSocket } from '../../utils/socket';
import AuthShell, { authLink } from './AuthShell';
import { homeFor } from './AuthContinuePage';

const DEMOS = [
  { role: ROLES.STUDENT, desc: 'Learn & submit', icon: BookOpen },
  { role: ROLES.INSTRUCTOR, desc: 'Teach & grade', icon: Presentation },
  { role: ROLES.ADMIN, desc: 'Run the school', icon: ShieldCheck },
];

function DemoAccess() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    api.get('/auth/config').then((res) => setEnabled(res.data.demoEnabled)).catch(() => setEnabled(false));
  }, []);

  const openDemo = async (role) => {
    setLoading(role);
    try {
      const { user, token } = (await api.post('/auth/demo', { role: role.toLowerCase() })).data;
      setAuthToken(token);
      dispatch(setCredentials({ user, token, mode: 'demo' }));
      connectSocket();
      toast.success(`Preview opened as ${user.name}.`);
      navigate(homeFor(user.role));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(null);
    }
  };

  if (!enabled) return null;
  return (
    <div data-testid="signin-demo-section">
      <div className="flex items-center gap-4 my-10">
        <span className="flex-1 lf-rule" />
        <span className="lf-eyebrow">or preview a sample account</span>
        <span className="flex-1 lf-rule" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {DEMOS.map(({ role, desc, icon: Icon }) => (
          <button
            key={role}
            type="button"
            disabled={!!loading}
            onClick={() => openDemo(role)}
            className="group text-left p-4 rounded-lg border border-rule bg-white/60 hover:border-terra-300 hover:bg-terra-50 transition-colors disabled:opacity-60"
            data-testid={`signin-demo-${role.toLowerCase()}-button`}
          >
            <Icon className="w-4 h-4 text-terra-600 mb-3" />
            <span className="block text-sm font-medium text-ink-900">{loading === role ? 'Opening…' : role}</span>
            <span className="block text-[11px] text-ink-500 mt-0.5">{desc}</span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-ink-400">Sample accounts share preview data and are meant for exploring only.</p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <AuthShell
      eyebrow="Sign in"
      title={<>Welcome <em className="text-terra-700">back</em>.</>}
      subtitle="Pick up exactly where you left off."
      footer={<>New to LearnFlow? {authLink('/sign-up', 'Create an account', 'signin-to-signup-link')}</>}
    >
      <div data-testid="clerk-sign-in">
        {CLERK_ENABLED ? (
          <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/auth/continue" />
        ) : (
          <p className="text-sm text-rust-600 border border-rust-200 bg-rust-50 rounded-lg p-4" data-testid="clerk-missing-notice">
            Account sign-in isn't configured yet. You can still preview a sample account below.
          </p>
        )}
      </div>
      <DemoAccess />
    </AuthShell>
  );
}
