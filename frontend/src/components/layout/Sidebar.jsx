import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, FileCheck, CalendarCheck, Award, User, PlusCircle,
  FolderUp, ClipboardList, Users, ListChecks, FileBarChart, X,
} from 'lucide-react';
import { useAuthRole } from '../../hooks/useAuthRole';

const NAV = {
  Student: {
    title: 'Student', groups: [
      { label: 'Learn', links: [
        { to: '/student', label: 'Overview', icon: LayoutDashboard, end: true },
        { to: '/student/courses', label: 'My courses', icon: BookOpen },
      ] },
      { label: 'Coursework', links: [
        { to: '/student/assignments', label: 'Assignments', icon: FileCheck },
        { to: '/student/attendance', label: 'Attendance', icon: CalendarCheck },
        { to: '/student/results', label: 'Results', icon: Award },
      ] },
      { label: 'You', links: [{ to: '/student/profile', label: 'Profile', icon: User }] },
    ],
  },
  Instructor: {
    title: 'Instructor', groups: [
      { label: 'Teach', links: [
        { to: '/instructor', label: 'Overview', icon: LayoutDashboard, end: true },
        { to: '/instructor/courses', label: 'My courses', icon: BookOpen, end: true },
        { to: '/instructor/courses/create', label: 'New course', icon: PlusCircle },
        { to: '/instructor/materials', label: 'Materials', icon: FolderUp },
      ] },
      { label: 'Classroom', links: [
        { to: '/instructor/assignments', label: 'Assignments', icon: ClipboardList },
        { to: '/instructor/attendance', label: 'Attendance', icon: CalendarCheck },
        { to: '/instructor/results', label: 'Results', icon: Award },
      ] },
    ],
  },
  Admin: {
    title: 'Administration', groups: [
      { label: 'Overview', links: [{ to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true }] },
      { label: 'Manage', links: [
        { to: '/admin/users', label: 'Users', icon: Users },
        { to: '/admin/courses', label: 'Courses', icon: BookOpen },
        { to: '/admin/enrolments', label: 'Enrolments', icon: ListChecks },
        { to: '/admin/reports', label: 'Reports', icon: FileBarChart },
      ] },
    ],
  },
};

function NavItem({ link, onClose }) {
  const Icon = link.icon;
  const slug = link.to.replace(/\//g, '-').replace(/^-/, '');
  return (
    <NavLink
      to={link.to}
      end={link.end}
      onClick={onClose}
      data-testid={`sidebar-link-${slug}`}
      className={({ isActive }) => `relative flex items-center gap-3 pl-4 pr-3 py-2 rounded-md text-sm transition-colors ${
        isActive ? 'bg-white text-ink-900 font-medium shadow-sm before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-full before:bg-terra-600' : 'text-ink-600 hover:text-ink-900 hover:bg-surface-hover'
      }`}
    >
      <Icon className="w-4 h-4 shrink-0 opacity-80" />
      <span className="truncate">{link.label}</span>
    </NavLink>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const { role, user } = useAuthRole();
  const nav = NAV[role] || NAV.Student;

  return (
    <>
      {isOpen && <div onClick={onClose} className="fixed inset-0 z-40 bg-ink-900/30 md:hidden" />}
      <aside
        data-testid="sidebar"
        className={`fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 shrink-0 bg-surface border-r border-rule flex flex-col transition-transform duration-200 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-6 pt-7 pb-5">
          <div>
            <p className="lf-eyebrow">Workspace</p>
            <p className="font-serif text-xl text-ink-900 mt-1">{nav.title}</p>
          </div>
          <button onClick={onClose} className="md:hidden p-1.5 rounded-md hover:bg-surface-hover" aria-label="Close menu" data-testid="sidebar-close-button"><X className="w-4 h-4" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 space-y-6 pb-6">
          {nav.groups.map((g) => (
            <div key={g.label}>
              <p className="px-4 mb-2 text-[10px] uppercase tracking-[0.18em] text-ink-400">{g.label}</p>
              <div className="space-y-0.5">{g.links.map((l) => <NavItem key={l.to} link={l} onClose={onClose} />)}</div>
            </div>
          ))}
        </nav>
        <div className="px-6 py-5 border-t border-rule flex items-center gap-3">
          <img src={user?.avatar} alt={user?.name} className="w-9 h-9 rounded-full object-cover bg-white" />
          <div className="min-w-0">
            <p className="text-sm text-ink-900 truncate" data-testid="sidebar-user-name">{user?.name}</p>
            <p className="text-xs text-ink-500">{role}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
