import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server';

describe('MUSIQ Backend API Tests', () => {
  let userToken: string;
  let userId: string;
  let playlistId: string;

  const testUser = {
    name: 'Test Musician',
    email: `test_${Date.now()}@musiq.com`,
    password: 'password123',
  };

  it('Health Check Endpoint', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  describe('Auth Routes', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);

      userToken = res.body.token;
      userId = res.body.user.id;
    });

    it('should login existing user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('should get current user profile with auth header', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.name).toBe(testUser.name);
    });
  });

  describe('YouTube Search & Metadata Abstraction API', () => {
    it('should search songs with query', async () => {
      const res = await request(app).get('/api/youtube/search?q=Blinding Lights');
      expect(res.status).toBe(200);
      expect(res.body.items).toBeDefined();
      expect(Array.isArray(res.body.items)).toBe(true);
    });

    it('should fetch video details', async () => {
      const res = await request(app).get('/api/youtube/video/L3wKzyIN1yk');
      expect(res.status).toBe(200);
      expect(res.body.youtube_video_id).toBe('L3wKzyIN1yk');
    });

    it('should fetch trending songs', async () => {
      const res = await request(app).get('/api/youtube/trending');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.items)).toBe(true);
    });
  });

  describe('Playlist & Likes API', () => {
    it('should create a new playlist for user', async () => {
      const res = await request(app)
        .post('/api/media/playlists')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Midnight Chill', description: 'Relaxing tunes' });

      expect(res.status).toBe(201);
      expect(res.body.playlist.name).toBe('Midnight Chill');
      playlistId = res.body.playlist.id;
    });

    it('should add song to playlist', async () => {
      const res = await request(app)
        .post(`/api/media/playlists/${playlistId}/songs`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          youtube_video_id: 'L3wKzyIN1yk',
          title: 'Blinding Lights',
          channel_name: 'The Weeknd',
          thumbnail_url: 'https://i.ytimg.com/vi/L3wKzyIN1yk/hqdefault.jpg',
          duration: '3:20',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should toggle like song for user', async () => {
      const res = await request(app)
        .post('/api/media/likes/toggle')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          youtube_video_id: 'L3wKzyIN1yk',
          title: 'Blinding Lights',
          channel_name: 'The Weeknd',
        });

      expect(res.status).toBe(200);
      expect(res.body.liked).toBe(true);
    });

    it('should record listening history', async () => {
      const res = await request(app)
        .post('/api/media/history')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          youtube_video_id: 'L3wKzyIN1yk',
          title: 'Blinding Lights',
          channel_name: 'The Weeknd',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should fetch user listening history', async () => {
      const res = await request(app)
        .get('/api/media/history')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.history.length).toBeGreaterThan(0);
    });
  });
});
