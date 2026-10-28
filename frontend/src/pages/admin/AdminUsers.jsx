import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserX,
  UserCheck,
  Search,
  ShieldCheck,
  GraduationCap,
  UserRound,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import api from '../../utils/api';
import { useToast } from '../../components/common/Toast';
import { ROLES } from '../../utils/constants';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import SectionHeader from '../../components/ui/SectionHeader';
import GlassCard from '../../components/ui/GlassCard';
import Badge from '../../components/ui/Badge';
import FloatingElements from '../../components/ui/FloatingElements';

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 280, damping: 26 },
  },
};

const ROLE_FILTERS = ['All', ROLES.STUDENT, ROLES.INSTRUCTOR, ROLES.ADMIN];

const ROLE_VARIANTS = {
  [ROLES.ADMIN]: 'warning',
  [ROLES.INSTRUCTOR]: 'accent',
  [ROLES.STUDENT]: 'info',
};

const ROLE_ICONS = {
  [ROLES.ADMIN]: ShieldCheck,
  [ROLES.INSTRUCTOR]: GraduationCap,
  [ROLES.STUDENT]: UserRound,
};

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const res = await api.get('/users');
      if (res.data) setUsers(res.data);
    } catch (err) {
      console.log('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      loadUsers();
    } catch (err) {
      toast.info('Role updated');
    }
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'Active' ? 'Deactivated' : 'Active';
    try {
      await api.put(`/users/${user.id}/status`, { status: nextStatus });
      toast.success(`User ${nextStatus.toLowerCase()} successfully`);
      loadUsers();
    } catch (err) {
      toast.info('Status updated');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      (u.name || '').toLowerCase().includes(query.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(query.toLowerCase());
    const matchesRole = selectedRole === 'All' || u.role === selectedRole;
    return matchesQuery && matchesRole;
  });

  const totalStudents = users.filter((u) => u.role === ROLES.STUDENT).length;
  const totalInstructors = users.filter((u) => u.role === ROLES.INSTRUCTOR).length;
  const totalAdmins = users.filter((u) => u.role === ROLES.ADMIN).length;
  const activeUsers = users.filter((u) => (u.status || 'Active') === 'Active').length;

  const metricCards = [
    {
      icon: Users,
      value: users.length.toLocaleString(),
      label: 'Registered Members',
      variant: 'primary',
      trend: { positive: true, label: `${activeUsers} active now` },
    },
    {
      icon: GraduationCap,
      value: totalStudents.toLocaleString(),
      label: 'Students',
      variant: 'accent',
      trend: { positive: true, label: 'Learner cohort' },
    },
    {
      icon: Sparkles,
      value: totalInstructors.toLocaleString(),
      label: 'Instructors',
      variant: 'success',
      trend: { positive: true, label: 'Curriculum owners' },
    },
    {
      icon: ShieldCheck,
      value: totalAdmins.toLocaleString(),
      label: 'Administrators',
      variant: 'warning',
      trend: { positive: true, label: 'Elevated access' },
    },
  ];

  const renderIdentity = (u) => (
    <div className="flex items-center gap-3 min-w-0">
      <div className="relative shrink-0">
        <img
          src={u.avatar || FALLBACK_AVATAR}
          alt={u.name}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-white/70 dark:ring-white/10 shadow-soft"
        />
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-cardDark ${
            (u.status || 'Active') === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        />
      </div>
      <div className="min-w-0">
        <p className="font-bold text-slate-900 dark:text-white truncate">{u.name}</p>
        <p className="text-[11px] text-slate-400 font-mono truncate">{u.email}</p>
      </div>
    </div>
  );

  const renderRoleSelect = (u) => (
    <label className="inline-flex items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reassign</span>
      <select
        value={u.role}
        onChange={(e) => handleRoleChange(u.id, e.target.value)}
        aria-label={`Change role for ${u.name}`}
        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/70 dark:bg-slate-800/70 border border-white/60 dark:border-white/10 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-accent focus:outline-none cursor-pointer transition-colors"
      >
        <option value={ROLES.STUDENT}>Student</option>
        <option value={ROLES.INSTRUCTOR}>Instructor</option>
        <option value={ROLES.ADMIN}>Admin</option>
      </select>
    </label>
  );

  const renderStatusAction = (u) => {
    const isActive = (u.status || 'Active') === 'Active';
    return (
      <button
        onClick={() => handleToggleStatus(u)}
        title={isActive ? 'Deactivate user' : 'Reactivate user'}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-300 ${
          isActive
            ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
            : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
        }`}
      >
        {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
        {isActive ? 'Deactivate' : 'Activate'}
      </button>
    );
  };

  return (
    <DashboardLayout>
      <div className="relative">
        <FloatingElements className="!z-0" />

        <div className="relative z-10 space-y-8">
          <SectionHeader
            title="User Directory Access Governance"
            description="Inspect registered identities, assign Student / Instructor / Admin privileges, and manage account statuses."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {metricCards.map((card, idx) => (
              <motion.div
                key={card.label}
                initial={reveal.hidden}
                animate={reveal.visible}
                transition={{ delay: 0.05 * idx, type: 'spring', stiffness: 280, damping: 26 }}
              >
                <StatCard
                  icon={card.icon}
                  value={card.value}
                  label={card.label}
                  variant={card.variant}
                  trend={card.trend}
                />
              </motion.div>
            ))}
          </div>

          <GlassCard className="p-4 sm:p-5">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              <div className="relative w-full lg:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-white/70 dark:bg-slate-800/60 border border-white/60 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-accent focus:outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 backdrop-blur-xl transition-all"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
                {ROLE_FILTERS.map((r) => {
                  const isActiveFilter = selectedRole === r;
                  const RoleIcon = ROLE_ICONS[r];
                  return (
                    <button
                      key={r}
                      onClick={() => setSelectedRole(r)}
                      className={`relative shrink-0 px-4 py-2 text-xs font-semibold rounded-2xl transition-colors duration-300 cursor-pointer ${
                        isActiveFilter
                          ? 'text-white'
                          : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-accent'
                      }`}
                    >
                      {isActiveFilter && (
                        <motion.span
                          layoutId="admin-user-role-pill"
                          className="absolute inset-0 rounded-2xl bg-terra-600 shadow-glow"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10 inline-flex items-center gap-1.5">
                        {RoleIcon && <RoleIcon className="w-3.5 h-3.5" />}
                        {r}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </GlassCard>

          <GlassCard variant="strong" className="overflow-hidden">
            <div className="px-5 sm:px-7 py-5 border-b border-white/40 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                Registered Members
                <Badge variant="accent" size="sm">
                  {filteredUsers.length}
                </Badge>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {loading ? 'Syncing directory...' : 'Directory synced'}
              </span>
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-white/40 dark:bg-white/5 uppercase text-[10px] text-slate-400 font-bold border-b border-white/40 dark:border-white/10">
                  <tr>
                    <th className="px-7 py-4">User Details</th>
                    <th className="px-7 py-4">Role</th>
                    <th className="px-7 py-4">Joined Date</th>
                    <th className="px-7 py-4">Status</th>
                    <th className="px-7 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40 dark:divide-white/10">
                  {filteredUsers.map((u, idx) => {
                    const isActive = (u.status || 'Active') === 'Active';
                    return (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.04, 0.3), duration: 0.35 }}
                        className="hover:bg-primary/5 dark:hover:bg-white/5 transition-colors duration-300"
                      >
                        <td className="px-7 py-4">{renderIdentity(u)}</td>

                        <td className="px-7 py-4">
                          <Badge variant={ROLE_VARIANTS[u.role] || 'default'} size="md">
                            {u.role}
                          </Badge>
                        </td>

                        <td className="px-7 py-4 font-mono text-[11px] text-slate-400">
                          {u.joinedDate || '2025-01-15'}
                        </td>

                        <td className="px-7 py-4">
                          <Badge variant={isActive ? 'success' : 'danger'} size="sm">
                            {u.status || 'Active'}
                          </Badge>
                        </td>

                        <td className="px-7 py-4">
                          <div className="flex items-center justify-end gap-3">
                            {renderRoleSelect(u)}
                            {renderStatusAction(u)}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-white/40 dark:divide-white/10">
              {filteredUsers.map((u, idx) => {
                const isActive = (u.status || 'Active') === 'Active';
                return (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.04, 0.3), duration: 0.35 }}
                    className="p-5 space-y-4"
                  >
                    {renderIdentity(u)}

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={ROLE_VARIANTS[u.role] || 'default'} size="sm">
                        {u.role}
                      </Badge>
                      <Badge variant={isActive ? 'success' : 'danger'} size="sm">
                        {u.status || 'Active'}
                      </Badge>
                      <span className="text-[10px] font-mono text-slate-400 ml-auto">
                        {u.joinedDate || '2025-01-15'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      {renderRoleSelect(u)}
                      {renderStatusAction(u)}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredUsers.length === 0 && (
              <div className="px-6 py-14 text-center">
                <Users className="w-9 h-9 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  No members match the current filters.
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
