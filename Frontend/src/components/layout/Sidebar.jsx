import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck,
  CalendarCheck,
  Award,
  User,
  PlusCircle,
  FolderUp,
  ClipboardList,
  Users,
  ShieldAlert,
  FileBarChart,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useAuthRole } from '../../hooks/useAuthRole';
import { ROLES } from '../../utils/constants';

export default function Sidebar({ isOpen, onClose }) {
  const { role, isStudent, isInstructor, isAdmin, user } = useAuthRole();
  const location = useLocation();

  const studentLinks = [
    { to: '/student', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/student/courses', label: 'My Courses', icon: BookOpen },
    { to: '/student/assignments', label: 'Assignments', icon: FileCheck },
    { to: '/student/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/student/results', label: 'Results & GPA', icon: Award },
    { to: '/student/profile', label: 'My Profile', icon: User },
  ];

  const instructorLinks = [
    { to: '/instructor', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/instructor/courses', label: 'My Courses', icon: BookOpen },
    { to: '/instructor/courses/create', label: 'Create Course', icon: PlusCircle },
    { to: '/instructor/materials', label: 'Upload Material', icon: FolderUp },
    { to: '/instructor/assignments', label: 'Assignments Manager', icon: ClipboardList },
    { to: '/instructor/attendance', label: 'Attendance Manager', icon: CalendarCheck },
    { to: '/instructor/results', label: 'Results Publisher', icon: Award },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'Users Table', icon: Users },
    { to: '/admin/courses', label: 'Courses Table', icon: BookOpen },
    { to: '/admin/enrolments', label: 'Enrolments Table', icon: ShieldAlert },
    { to: '/admin/reports', label: 'Reports & Export', icon: FileBarChart },
  ];

  let links = studentLinks;
  if (isInstructor) links = instructorLinks;
  if (isAdmin) links = adminLinks;

  const roleTitle = isInstructor ? 'Instructor Portal' : isAdmin ? 'Admin Console' : 'Student Hub';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-cardDark border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation Section */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center gap-2 px-3 py-2 mb-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              {roleTitle}
            </span>
          </div>

          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-sm font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card in Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
              alt={user?.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/20"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                {user?.name}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-accent font-semibold">
                  {role}
                </span>
                <span className="text-[10px] text-slate-400">• Online</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
