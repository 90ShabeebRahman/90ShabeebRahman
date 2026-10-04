import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import youtubeRoutes from './routes/youtubeRoutes';
import mediaRoutes from './routes/mediaRoutes';
import { initDb } from './database/db';

dotenv.config();

// Ensure DB is initialized
initDb();

export const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/media', mediaRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'musiq-backend', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`MUSIQ Backend running on http://localhost:${PORT}`);
  });
}
