import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, CheckCircle2, Sparkles } from 'lucide-react';
import { useToast } from '../../components/common/Toast';
import Navbar from '../../components/layout/Navbar';
import FloatingElements from '../../components/ui/FloatingElements';
import GlassCard from '../../components/ui/GlassCard';
import SectionHeader from '../../components/ui/SectionHeader';

const reveal = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
};

export default function ContactPage() {
  const toast = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Your message has been dispatched to the LearnFlow support desk.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-bgLight dark:bg-bgDark transition-colors duration-700">
      <FloatingElements className="pointer-events-none" />
      <Navbar />

      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={reveal.hidden}
            animate={reveal.visible}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest block mb-3">
              Get in Touch
            </span>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-slate-900 dark:text-white tracking-tight mb-5">
              Have questions? We're here to help.
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Institutional licensing, instructor partnerships, curriculum enrollment — our academic
              liaison team responds within 24 hours.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Info Column */}
            <div className="lg:col-span-4 space-y-8">
              <GlassCard variant="strong" className="p-8 rounded-xl space-y-7">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Support Channels</h3>
                </div>
                {[{
                  icon: Mail,
                  title: 'Email',
                  text: 'support@learnflow.edu',
                }, {
                  icon: MapPin,
                  title: 'Campus',
                  text: '100 Tech Innovation Plaza, CA',
                }, {
                  icon: Phone,
                  title: 'Phone',
                  text: '+1 (555) 014-2200',
                }].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/50 dark:bg-white/10 flex items-center justify-center text-slate-400 shrink-0">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.title}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{item.text}</p>
                    </div>
                  </div>
                ))}
              </GlassCard>

              <GlassCard variant="default" className="p-8 rounded-xl space-y-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Response Time</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Under 24 hours</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Standard inquiry</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/20 dark:border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">1 hour</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Institutional</p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-8">
              <GlassCard variant="strong" className="p-10 sm:p-12 rounded-xl shadow-2xl">
                <SectionHeader
                  title="Send us a message"
                  description="Fill in the form below and we'll get back to you shortly."
                  className="mb-8"
                />
                {submitted ? (
                  <motion.div
                    initial={reveal.hidden}
                    animate={reveal.visible}
                    className="py-20 text-center"
                  >
                    <div className="w-16 h-16 mx-auto mb-6 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Message Dispatched</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Our academic liaison team will review your inquiry and respond shortly.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Your Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Alex Johnson"
                          className="w-full px-4 py-3 bg-white/60 dark:bg-white/8 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-accent focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="alex@learnflow.edu"
                          className="w-full px-4 py-3 bg-white/60 dark:bg-white/8 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-accent focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Inquiry regarding course certification"
                        className="w-full px-4 py-3 bg-white/60 dark:bg-white/8 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-accent focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Message
                      </label>
                      <textarea
                        rows={5}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="How can our technical mentors assist you?"
                        className="w-full px-4 py-3 bg-white/60 dark:bg-white/8 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-accent focus:outline-none resize-none transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-terra-600 text-white font-bold rounded-xl shadow-glow transition-all duration-300 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      Send Inquiry
                    </button>
                  </form>
                )}
              </GlassCard>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
