import React from 'react';
import { useSelector } from 'react-redux';
import { Mail, Calendar, ShieldCheck } from 'lucide-react';

function Row({ icon: Icon, label, value, testid }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-rule">
      <Icon className="w-4 h-4 text-ink-400" />
      <span className="w-32 text-sm text-ink-500">{label}</span>
      <span className="text-sm text-ink-900" data-testid={testid}>{value}</span>
    </div>
  );
}

export default function StudentProfile() {
  const { user, role } = useSelector((state) => state.auth);

  return (
    <div className="max-w-3xl space-y-12">
      <header>
        <p className="lf-eyebrow mb-3">Profile</p>
        <h1 className="font-serif text-4xl sm:text-5xl text-ink-900">Your account</h1>
      </header>

      <section className="flex flex-col sm:flex-row sm:items-center gap-6">
        <img src={user?.avatar} alt={user?.name} className="w-24 h-24 rounded-full object-cover bg-surface border border-rule" />
        <div>
          <h2 className="font-serif text-3xl text-ink-900" data-testid="profile-name">{user?.name}</h2>
          <p className="text-sm text-ink-500 mt-1">{role} · {user?.status || 'Active'}</p>
        </div>
      </section>

      <section>
        <p className="lf-eyebrow mb-2">Details</p>
        <Row icon={Mail} label="Email" value={user?.email} testid="profile-email" />
        <Row icon={ShieldCheck} label="Role" value={role} testid="profile-role" />
        <Row icon={Calendar} label="Member since" value={user?.joinedDate || '—'} testid="profile-joined" />
      </section>

      {user?.bio && (
        <section>
          <p className="lf-eyebrow mb-3">About</p>
          <p className="font-serif text-xl text-ink-700 leading-relaxed">{user.bio}</p>
        </section>
      )}
    </div>
  );
}
