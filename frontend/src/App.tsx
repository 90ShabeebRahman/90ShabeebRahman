import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { LibraryPage } from './pages/LibraryPage';
import { LikedSongsPage } from './pages/LikedSongsPage';
import { PlaylistDetailPage } from './pages/PlaylistDetailPage';
import { SongDetailPage } from './pages/SongDetailPage';
import { ArtistPage } from './pages/ArtistPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage, RegisterPage } from './pages/AuthPages';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="liked" element={<LikedSongsPage />} />
          <Route path="history" element={<LikedSongsPage />} />
          <Route path="playlist/:id" element={<PlaylistDetailPage />} />
          <Route path="song/:videoId" element={<SongDetailPage />} />
          <Route path="artist/:channelId" element={<ArtistPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
