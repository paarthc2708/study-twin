import { Router } from 'express';
import { getMe } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

// Verifies the Supabase session token sent by the frontend and echoes back
// the authenticated user. A template for any other Supabase-authenticated
// route: mount `requireAuth` first, then read `req.user`.
router.get('/me', requireAuth, getMe);

export default router;
