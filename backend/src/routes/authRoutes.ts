import { Router } from 'express';
import { register, login, me, updateProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, me);
router.put('/profile', authenticateToken, updateProfile);

export default router;
