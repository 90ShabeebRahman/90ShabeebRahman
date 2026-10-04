import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, Heart, Disc3, Plus, Music2 } from 'lucide-react';

interface SidebarProps {
  onCreatePlaylist?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCreatePlaylist }) => {
  const navItems = [
    { label: 'Home', icon: Home, to: '/' },
    { label: 'Search', icon: Search, to: '/search' },
    { label: 'Your Library', icon: Library, to: '/library' },
  ];

  const libraryItems = [
    { label: 'Liked Songs', icon: Heart, to: '/liked' },
    { label: 'Recently Played', icon: Disc3, to: '/history' },
  ];

  return (
    <aside className="w-64 bg-surface-card border-r border-surface-border flex flex-col h-full flex-shrink-0 select-none">
      {/* Brand Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <Music2 className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-xl tracking-wider text-white">MUSIQ</span>
          <span className="text-[10px] text-brand-accent tracking-widest font-semibold uppercase -mt-1">YouTube Powered</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-600/15 text-brand-accent border-l-4 border-brand-500'
                    : 'text-surface-muted hover:text-slate-100 hover:bg-surface-hover'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="my-6 px-6">
        <div className="h-px bg-surface-border" />
      </div>

      {/* Library Quick Access */}
      <div className="px-3 flex-1 flex flex-col min-h-0">
        <div className="px-4 mb-2 flex items-center justify-between text-xs font-semibold text-surface-muted uppercase tracking-wider">
          <span>Your Music</span>
          {onCreatePlaylist && (
            <button
              onClick={onCreatePlaylist}
              className="p-1 rounded-lg hover:bg-surface-hover text-surface-muted hover:text-white transition-colors"
              title="Create Playlist"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="space-y-1">
          {libraryItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? 'bg-surface-hover text-white font-medium'
                      : 'text-surface-muted hover:text-slate-200 hover:bg-surface-hover'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Footer Branding Note */}
      <div className="p-4 text-[11px] text-surface-muted border-t border-surface-border">
        <span>Legitimate Youtube Player API</span>
      </div>
    </aside>
  );
};
