import { Router } from 'express';
import { deleteMe, getMe } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/requireAuth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Verifies the Supabase session token sent by the frontend and echoes back
// the authenticated user. A template for any other Supabase-authenticated
// route: mount `requireAuth` first, then read `req.user`.
router.get('/me', requireAuth, getMe);

// Permanently deletes the authenticated user's account (requires the
// service-role client; cascades through every table via the schema's FKs).
router.delete('/me', requireAuth, asyncHandler(deleteMe));

export default router;
