import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROLES } from '../../utils/constants';

export const homeFor = (role) => (role === ROLES.ADMIN ? '/admin' : role === ROLES.INSTRUCTOR ? '/instructor' : '/student');

export default function AuthContinuePage() {
  const navigate = useNavigate();
  const { user, mode } = useSelector((s) => s.auth);

  useEffect(() => {
    if (user && mode === 'clerk') navigate(homeFor(user.role), { replace: true });
  }, [user, mode, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" data-testid="auth-continue">
      <span className="w-8 h-8 rounded-full border-2 border-ink-300 border-t-terra-600 animate-spin" />
      <p className="font-serif italic text-ink-500">Opening your workspace…</p>
    </div>
  );
}
