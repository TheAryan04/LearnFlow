import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-bgLight dark:bg-bgDark transition-colors">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Mobile trigger bar */}
          <div className="md:hidden flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-cardDark text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm cursor-pointer"
            >
              <Menu className="w-4 h-4" />
              Menu Navigation
            </button>
          </div>

          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
