import { Router } from 'express';
import { postInsight, postMentorReply, postQuizFeedback, postQuizQuestions } from '../controllers/ai.controller';
import { requireAuth } from '../middleware/requireAuth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// All AI routes proxy Gemini server-side (the API key must never reach the
// browser) and require an authenticated Supabase session.
router.post('/mentor-reply', requireAuth, asyncHandler(postMentorReply));
router.post('/quiz-questions', requireAuth, asyncHandler(postQuizQuestions));
router.post('/quiz-feedback', requireAuth, asyncHandler(postQuizFeedback));
router.post('/insight', requireAuth, asyncHandler(postInsight));

export default router;
