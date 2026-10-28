import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, BookOpen, Sparkles, CheckCircle2, Shield, Globe, Layers } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import FloatingElements from '../../components/ui/FloatingElements';
import GlassCard from '../../components/ui/GlassCard';
import StatCard from '../../components/ui/StatCard';
import SectionHeader from '../../components/ui/SectionHeader';

const reveal = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
};

const statItems = [
  { icon: Globe, value: '50,000+', label: 'Active Students', trend: { label: '+12% this month', positive: true }, variant: 'primary' },
  { icon: BookOpen, value: '300+', label: 'Curated Courses', trend: { label: '6 categories', positive: true }, variant: 'accent' },
  { icon: Users, value: '120+', label: 'Expert Instructors', trend: { label: 'Vetted mentors', positive: true }, variant: 'success' },
  { icon: Shield, value: '98.4%', label: 'Satisfaction Rate', trend: { label: 'Learner feedback', positive: true }, variant: 'info' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bgLight dark:bg-bgDark transition-colors duration-700">
      <FloatingElements className="pointer-events-none" />
      <Navbar />

      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent -z-10 rounded-[50%] blur-[120px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div
              initial={reveal.hidden}
              animate={reveal.visible}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Our Mission & Vision</span>
            </motion.div>
            <motion.h1
              initial={reveal.hidden}
              animate={reveal.visible}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.05] mb-6"
            >
              Building the modern standard for focused technical education.
            </motion.h1>
            <motion.p
              initial={reveal.hidden}
              animate={reveal.visible}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto"
            >
              LearnFlow was born from a simple observation: modern learners want the comprehensive
              depth of traditional academies paired with the clarity, minimalism, and speed of
              modern tools.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-20">
            {statItems.map((stat) => (
              <StatCard key={stat.label} icon={stat.icon} value={stat.value} label={stat.label} trend={stat.trend} variant={stat.variant} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 border-y border-white/20 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <SectionHeader
                title="Our Core Principles"
                description="Everything in LearnFlow is tuned to keep students immersed in code and comprehension."
              />
              <div className="space-y-5">
                {[{
                  icon: Layers,
                  title: 'Uncompromising Clarity',
                  desc: 'No bloated UI, no intrusive popups, and no confusing sub-menus.',
                }, {
                  icon: Shield,
                  title: 'Role-Based Workspaces',
                  desc: 'Student, Instructor, and Admin portals each optimized for their workflow.',
                }, {
                  icon: Globe,
                  title: 'Global Access',
                  desc: 'Learn from anywhere with responsive design and dark mode support.',
                }].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">{item.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <GlassCard variant="strong" className="p-10 rounded-xl shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-terra-600 flex items-center justify-center text-white shadow-glow">
                  <Layers className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">The LearnFlow Standard</h3>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Design Philosophy</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-300">
                {[{
                  icon: CheckCircle2,
                  text: 'Tailwind CSS tailored Deep Navy & Electric Blue design',
                }, {
                  icon: CheckCircle2,
                  text: 'Full Clerk Auth integration with Student/Instructor/Admin roles',
                }, {
                  icon: CheckCircle2,
                  text: 'React YouTube & Quill Rich Text synchronization',
                }, {
                  icon: CheckCircle2,
                  text: 'RC Progress visualization for metrics & attendance',
                }].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <SectionHeader
              title="Meet the Team"
              description="Passionate educators and engineers building the future of learning."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Elena Rivera', role: 'Head of Product', bio: 'Former lead designer at Figma. Focused on learner-centric UX.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
              { name: 'Marcus Vance', role: 'Lead Instructor', bio: 'Senior software architect. Author of production-grade web systems.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
              { name: 'Sophia Martinez', role: 'Curriculum Designer', bio: 'Expert in instructional design and adult learning theory.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80' },
              { name: 'Daniel Kim', role: 'DevOps Lead', bio: 'Cloud infrastructure specialist ensuring platform reliability at scale.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
            ].map((member) => (
              <GlassCard key={member.name} variant="default" className="p-6 text-center hover:shadow-glow transition-shadow duration-500 group cursor-default relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-terra-600" />
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-16 h-16 rounded-full mx-auto mb-4 object-cover border-4 border-white/50 dark:border-white/10 shadow-lg group- transition-transform duration-500"
                />
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">{member.name}</h4>
                <p className="text-[10px] text-accent font-semibold uppercase tracking-wider mb-3">{member.role}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{member.bio}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
