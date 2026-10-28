import React, { useState } from 'react';
import { SignUp } from '@clerk/react';
import { ROLES } from '../../utils/constants';
import { CLERK_ENABLED, SIGNUP_ROLE_KEY } from '../../utils/clerk';
import AuthShell, { authLink } from './AuthShell';

const ROLE_OPTIONS = [
  { value: ROLES.STUDENT, desc: 'I want to take courses' },
  { value: ROLES.INSTRUCTOR, desc: 'I want to teach courses' },
];

export default function SignUpPage() {
  const [role, setRole] = useState(() => sessionStorage.getItem(SIGNUP_ROLE_KEY) === 'instructor' ? ROLES.INSTRUCTOR : ROLES.STUDENT);

  const choose = (value) => {
    setRole(value);
    sessionStorage.setItem(SIGNUP_ROLE_KEY, value.toLowerCase());
  };

  return (
    <AuthShell
      eyebrow="Create account"
      title={<>Begin a new <em className="text-terra-700">chapter</em>.</>}
      subtitle="First, tell us how you'll use LearnFlow."
      footer={<>Already have an account? {authLink('/sign-in', 'Sign in', 'signup-to-signin-link')}</>}
    >
      <div className="grid grid-cols-2 gap-3 mb-8" role="radiogroup">
        {ROLE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => choose(opt.value)}
            className={`text-left p-4 rounded-lg border transition-colors ${role === opt.value ? 'border-terra-600 bg-terra-50' : 'border-rule bg-white/60 hover:border-ink-300'}`}
            data-testid={`signup-role-${opt.value.toLowerCase()}`}
            aria-pressed={role === opt.value}
          >
            <span className="block text-sm font-medium text-ink-900">{opt.value}</span>
            <span className="block text-xs text-ink-500 mt-0.5">{opt.desc}</span>
          </button>
        ))}
      </div>
      <div data-testid="clerk-sign-up" onFocusCapture={() => sessionStorage.setItem(SIGNUP_ROLE_KEY, role.toLowerCase())}>
        {CLERK_ENABLED ? (
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/auth/continue"
            unsafeMetadata={{ role: role.toLowerCase() }}
          />
        ) : (
          <p className="text-sm text-rust-600 border border-rust-200 bg-rust-50 rounded-lg p-4" data-testid="clerk-missing-notice">
            Account sign-up isn't configured yet.
          </p>
        )}
      </div>
    </AuthShell>
  );
}
