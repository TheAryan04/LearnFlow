import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ROLES } from '../../utils/constants';
import { useToast } from '../../components/common/Toast';
import api from '../../utils/api';
import AuthShell, { authLink } from './AuthShell';
import { useFinishLogin } from './SignInPage';

const ROLE_OPTIONS = [
  { value: ROLES.STUDENT, desc: 'I want to take courses' },
  { value: ROLES.INSTRUCTOR, desc: 'I want to teach courses' },
];

export default function SignUpPage() {
  const toast = useToast();
  const finishLogin = useFinishLogin();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [role, setRole] = useState(ROLES.STUDENT);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      finishLogin((await api.post('/auth/register', { ...form, role: role.toLowerCase() })).data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Create account"
      title={<>Begin a new <em className="text-terra-700">chapter</em>.</>}
      subtitle="It takes less than a minute."
      footer={<>Already have an account? {authLink('/sign-in', 'Sign in', 'signup-to-signin-link')}</>}
    >
      <form onSubmit={submit} className="space-y-5" data-testid="signup-form">
        <div className="grid grid-cols-2 gap-3" role="radiogroup">
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRole(opt.value)}
              className={`text-left p-4 rounded-lg border transition-colors ${role === opt.value ? 'border-terra-600 bg-terra-50' : 'border-rule bg-white/60 hover:border-ink-300'}`}
              data-testid={`signup-role-${opt.value.toLowerCase()}`}
              aria-pressed={role === opt.value}
            >
              <span className="block text-sm font-medium text-ink-900">{opt.value}</span>
              <span className="block text-xs text-ink-500 mt-0.5">{opt.desc}</span>
            </button>
          ))}
        </div>
        <label className="block">
          <span className="text-sm text-ink-700">Full name</span>
          <input required value={form.name} onChange={set('name')} className="lf-input mt-1.5" placeholder="Ada Lovelace" data-testid="signup-name-input" />
        </label>
        <label className="block">
          <span className="text-sm text-ink-700">Email</span>
          <input type="email" required value={form.email} onChange={set('email')} className="lf-input mt-1.5" placeholder="you@school.edu" data-testid="signup-email-input" />
        </label>
        <label className="block">
          <span className="text-sm text-ink-700">Password</span>
          <input type="password" required minLength={8} value={form.password} onChange={set('password')} className="lf-input mt-1.5" placeholder="At least 8 characters" data-testid="signup-password-input" />
        </label>
        <button type="submit" disabled={loading} className="lf-btn-primary w-full !py-3" data-testid="signup-submit-button">
          {loading ? 'Creating account…' : `Create ${role.toLowerCase()} account`} <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </AuthShell>
  );
}
