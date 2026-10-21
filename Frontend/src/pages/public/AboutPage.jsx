import React from 'react';
import Navbar from '../../components/layout/Navbar';
import { Target, Users, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bgLight dark:bg-bgDark transition-colors">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Mission & Vision</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Building the modern standard for focused technical education.
          </h1>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            LearnFlow was born from a simple observation: modern learners want the comprehensive
            depth of Udemy paired with the clarity, minimalism, and speed of Notion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white dark:bg-cardDark p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary dark:text-accent flex items-center justify-center mb-6">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Uncompromising Clarity
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              No bloated UI, no intrusive popups, and no confusing sub-menus. Everything in
              LearnFlow is tuned to keep students immersed in code and comprehension.
            </p>
          </div>

          <div className="bg-white dark:bg-cardDark p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
            <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Empowering Instructors
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              We empower instructors with rich tools: drag-and-drop curriculum builders,
              inline assignment grading, attendance registries, and automated GPA generation.
            </p>
          </div>
        </div>

        {/* Core Principles */}
        <div className="bg-white dark:bg-cardDark p-8 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            The LearnFlow Standard
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
              <span>Tailwind CSS tailored Deep Navy & Electric Blue design</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
              <span>Full Clerk Auth integration with Student/Instructor/Admin roles</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
              <span>React YouTube & Quill Rich Text synchronization</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
              <span>RC Progress visualization for metrics & attendance</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
