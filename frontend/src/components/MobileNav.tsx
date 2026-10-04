import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, Heart } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const items = [
    { label: 'Home', icon: Home, to: '/' },
    { label: 'Search', icon: Search, to: '/search' },
    { label: 'Library', icon: Library, to: '/library' },
    { label: 'Liked', icon: Heart, to: '/liked' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-card/95 backdrop-blur-lg border-t border-surface-border z-40 px-4 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                isActive ? 'text-brand-accent font-semibold' : 'text-surface-muted hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
