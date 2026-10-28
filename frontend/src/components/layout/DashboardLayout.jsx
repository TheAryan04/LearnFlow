import React, { createContext, useContext, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const LayoutContext = createContext(false);

export default function DashboardLayout({ children }) {
  const nested = useContext(LayoutContext);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  if (nested) return <>{children ?? <Outlet />}</>;

  return (
    <LayoutContext.Provider value>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex w-full">
          <Sidebar isOpen={open} onClose={() => setOpen(false)} />
          <main className="flex-1 min-w-0 px-5 sm:px-8 lg:px-14 py-8 lg:py-12" data-testid="dashboard-main">
            <button onClick={() => setOpen(true)} className="md:hidden lf-btn-secondary mb-6 !px-3 !py-2" data-testid="dashboard-mobile-menu-button">
              <Menu className="w-4 h-4" /> Menu
            </button>
            <div key={pathname} className="max-w-6xl animate-slide-up">{children ?? <Outlet />}</div>
          </main>
        </div>
      </div>
    </LayoutContext.Provider>
  );
}
