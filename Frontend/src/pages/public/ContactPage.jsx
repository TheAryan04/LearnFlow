import React, { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import { Mail, MapPin, Phone, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../components/common/Toast';

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
    <div className="min-h-screen flex flex-col bg-bgLight dark:bg-bgDark transition-colors">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Get in Touch with LearnFlow
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Have questions about institutional licensing, instructor partnerships, or curriculum enrollment? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Info cards */}
          <div className="space-y-4 md:col-span-1">
            <div className="p-6 bg-white dark:bg-cardDark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-3">
                <Mail className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Us</h4>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">support@learnflow.edu</p>
            </div>

            <div className="p-6 bg-white dark:bg-cardDark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary dark:text-accent flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Campus</h4>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">100 Tech Innovation Plaza, CA</p>
            </div>
          </div>

          {/* Contact form */}
          <div className="md:col-span-2 bg-white dark:bg-cardDark p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft">
            {submitted ? (
              <div className="py-12 text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Message Dispatched</h3>
                <p className="text-sm text-slate-500 mt-2">Our academic liaison team will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Alex Johnson"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="alex@learnflow.edu"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Inquiry regarding course certification"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can our technical mentors assist you?"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Send Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
