import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, User as UserIcon, LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-surface-base/80 backdrop-blur-md border-b border-surface-border/50 sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Navigation Controls & Integrated Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-surface-card hover:bg-surface-hover flex items-center justify-center text-surface-muted hover:text-white transition-colors"
            title="Go Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="w-8 h-8 rounded-full bg-surface-card hover:bg-surface-hover flex items-center justify-center text-surface-muted hover:text-white transition-colors"
            title="Go Forward"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {location.pathname !== '/search' && (
          <form onSubmit={handleSearchSubmit} className="relative flex-1 hidden sm:block">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-muted" />
            <input
              type="text"
              placeholder="What do you want to listen to?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-card hover:bg-surface-hover/80 focus:bg-surface-card border border-surface-border/60 focus:border-brand-500 rounded-full py-2 pl-10 pr-4 text-sm text-slate-100 placeholder-surface-muted transition-all outline-none"
            />
          </form>
        )}
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-3">
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-surface-card hover:bg-surface-hover border border-surface-border transition-colors"
            >
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.name}`}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-slate-200 hidden md:inline">{user.name}</span>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-48 bg-surface-card border border-surface-border rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setShowProfileMenu(false)}
              >
                <div className="px-4 py-2 border-b border-surface-border">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-surface-muted truncate">{user.email}</p>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-surface-hover transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Profile & Settings</span>
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-surface-hover transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-surface-muted hover:text-white transition-colors px-3 py-1.5"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 px-4 py-2 rounded-full shadow-lg shadow-brand-600/20 transition-all"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
