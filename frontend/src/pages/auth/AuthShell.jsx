import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';

const HERO = 'https://images.unsplash.com/photo-1643148636630-0b0fb138fc74?crop=entropy&cs=srgb&fm=jpg&q=80&w=1400';

export default function AuthShell({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 grid lg:grid-cols-2">
        <div className="flex items-center px-6 sm:px-12 lg:px-20 py-14">
          <div className="w-full max-w-md animate-slide-up">
            <p className="lf-eyebrow mb-4">{eyebrow}</p>
            <h1 className="font-serif text-4xl sm:text-5xl text-ink-900 leading-[1.05]">{title}</h1>
            <p className="text-ink-500 mt-3 mb-10">{subtitle}</p>
            {children}
            <p className="mt-10 text-sm text-ink-500">{footer}</p>
          </div>
        </div>
        <div className="hidden lg:block relative border-l border-rule">
          <img src={HERO} alt="A quiet study desk" className="absolute inset-0 w-full h-full object-cover saturate-[0.8]" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-ink-900/10 to-transparent" />
          <blockquote className="absolute bottom-12 left-12 right-12 text-ink-50">
            <p className="font-serif italic text-3xl leading-snug">"The beautiful thing about learning is that nobody can take it away from you."</p>
            <footer className="mt-4 text-xs uppercase tracking-[0.18em] text-ink-200">B.B. King</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}

export const authLink = (to, label, testid) => (
  <Link to={to} className="text-terra-700 lf-link" data-testid={testid}>{label}</Link>
);
