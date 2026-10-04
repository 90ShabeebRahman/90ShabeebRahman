import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Save, Shield, Check, Palette } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import axios from 'axios';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, updateUser, logout } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    setSuccess(false);

    try {
      const res = await axios.put(
        '/api/auth/profile',
        { name, avatar_url: avatarUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      updateUser(res.data.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20 space-y-4">
        <User className="w-16 h-16 text-surface-muted mx-auto" />
        <h2 className="text-2xl font-bold text-white">Please sign in to view your profile</h2>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 rounded-full bg-brand-600 text-white font-medium shadow-lg"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Profile Header */}
      <div className="bg-surface-card p-8 rounded-3xl border border-surface-border shadow-2xl flex flex-col sm:flex-row items-center gap-6">
        <img
          src={user.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.name}`}
          alt={user.name}
          className="w-24 h-24 rounded-full object-cover border-4 border-brand-500/30 shadow-xl"
        />
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-white">{user.name}</h1>
          <p className="text-sm text-surface-muted">{user.email}</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-600/10 text-brand-accent text-xs font-semibold mt-2">
            <Shield className="w-3.5 h-3.5" />
            <span>MUSIQ Free Account</span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-surface-card p-8 rounded-3xl border border-surface-border shadow-2xl space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-brand-accent" />
          <span>Account Settings</span>
        </h2>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-surface-muted uppercase mb-1">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-base border border-surface-border rounded-xl px-4 py-3 text-sm text-white focus:border-brand-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-muted uppercase mb-1">Avatar Image URL</label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full bg-surface-base border border-surface-border rounded-xl px-4 py-3 text-sm text-white focus:border-brand-500 outline-none"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-surface-hover transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-all shadow-lg"
            >
              {success ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : success ? 'Updated!' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
