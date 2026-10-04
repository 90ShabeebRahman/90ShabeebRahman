import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { MobileNav } from '../components/MobileNav';
import { PlayerBar } from '../components/PlayerBar';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-surface-base text-slate-100 overflow-hidden">
      {/* Sidebar Desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-32">
          <Outlet />
        </main>
      </div>

      {/* Persistent Bottom Music Player */}
      <PlayerBar />

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};
