import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { GraduationCap, ArrowRight, User, BookOpen } from 'lucide-react';
import { setCredentials } from '../../redux/slices/authSlice';
import { ROLES } from '../../utils/constants';
import { useToast } from '../../components/common/Toast';
import Navbar from '../../components/layout/Navbar';
import api, { setAuthToken } from '../../utils/api';
import { setSocketToken } from '../../utils/socket';

export default function SignUpPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES.STUDENT); // Student or Instructor
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        role: selectedRole.toLowerCase(),
      });
      const { user, token } = response.data;
      setAuthToken(token);
      setSocketToken(token);
      dispatch(setCredentials({ user, token }));
      toast.success(`Welcome to LearnFlow, ${user.name}!`);
      navigate(user.role === ROLES.INSTRUCTOR ? '/instructor' : '/student');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bgLight dark:bg-bgDark transition-colors">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-cardDark rounded-3xl border border-slate-200 dark:border-slate-800 shadow-elevated p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white mx-auto mb-4 shadow-md">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Create Your LearnFlow Account
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select your academic role to personalize your workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection (Student / Instructor) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Choose Your Role *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole(ROLES.STUDENT)}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    selectedRole === ROLES.STUDENT
                      ? 'border-accent bg-accent-50/50 dark:bg-accent-950/30 text-accent ring-2 ring-accent/30'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <BookOpen className="w-6 h-6 mb-1 text-accent" />
                  <span className="text-xs font-bold">Student</span>
                  <span className="text-[10px] text-slate-400">Enroll & study</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole(ROLES.INSTRUCTOR)}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    selectedRole === ROLES.INSTRUCTOR
                      ? 'border-accent bg-accent-50/50 dark:bg-accent-950/30 text-accent ring-2 ring-accent/30'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <User className="w-6 h-6 mb-1 text-primary dark:text-accent" />
                  <span className="text-xs font-bold">Instructor</span>
                  <span className="text-[10px] text-slate-400">Publish & grade</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@learnflow.edu"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-accent focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary-600 transition-colors shadow-sm cursor-pointer mt-2"
            >
              {loading ? 'Creating Account...' : `Sign Up as ${selectedRole}`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/sign-in" className="font-semibold text-accent hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
