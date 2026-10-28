import React from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from './Navbar';

export default function Footer() {
  return (
    <footer className="border-t border-rule mt-24" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <Wordmark />
          <p className="mt-4 text-sm text-ink-500 max-w-sm leading-relaxed">
            A quiet, well-organised place for students, instructors and administrators to do their best work.
          </p>
        </div>
        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
          <div className="space-y-2.5">
            <p className="lf-eyebrow mb-3">Learn</p>
            <Link to="/courses" className="block text-ink-600 hover:text-ink-900">Catalogue</Link>
            <Link to="/sign-up" className="block text-ink-600 hover:text-ink-900">Create account</Link>
          </div>
          <div className="space-y-2.5">
            <p className="lf-eyebrow mb-3">LearnFlow</p>
            <Link to="/about" className="block text-ink-600 hover:text-ink-900">About</Link>
            <Link to="/contact" className="block text-ink-600 hover:text-ink-900">Contact</Link>
          </div>
          <div className="space-y-2.5">
            <p className="lf-eyebrow mb-3">Account</p>
            <Link to="/sign-in" className="block text-ink-600 hover:text-ink-900">Sign in</Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pb-10 text-xs text-ink-400">© {new Date().getFullYear()} LearnFlow</div>
    </footer>
  );
}
