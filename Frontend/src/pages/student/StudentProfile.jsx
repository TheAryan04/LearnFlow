import React from 'react';
import { useSelector } from 'react-redux';
import { User, Mail, Shield, Calendar, Award, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '@clerk/clerk-react';

export default function StudentProfile() {
  const { user, role } = useSelector((state) => state.auth);
  const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const isRealClerkKey = clerkKey && !clerkKey.includes('demo') && clerkKey.startsWith('pk_');

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Account & Profile Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your credentials, academic identity, and verified certificates.
        </p>
      </div>

      {/* Embedded Clerk UserProfile if real Clerk key configured, otherwise rich styled profile */}
      {isRealClerkKey ? (
        <div className="bg-white dark:bg-cardDark rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-soft">
          <UserProfile routing="hash" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* User Card */}
          <div className="bg-white dark:bg-cardDark p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row items-center gap-6">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"}
              alt={user?.name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-accent/20"
            />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {user?.name || 'Alex Johnson'}
                </h2>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent/10 text-accent self-center sm:self-auto">
                  {role}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 mb-4">
                <Mail className="w-3.5 h-3.5" />
                {user?.email || 'alex.student@learnflow.edu'}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Clerk Authentication Verified</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Joined January 2025</span>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Credentials Card */}
          <div className="bg-white dark:bg-cardDark p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-accent" />
              Verified Competencies & Badges
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    React 19 Architecture Certified
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Completed 100% of curriculum lectures and passed the Kanban capstone.
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Dean's Honor List (Fall 2025)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Maintained a cumulative GPA of 3.8+ across all engineering evaluations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
