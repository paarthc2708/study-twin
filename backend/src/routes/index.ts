import { Router } from 'express';
import authRoutes from './auth.routes';
import healthRoutes from './health.routes';

const router = Router();

// Namespaced health check, mirrors the root-level /health used by
// infrastructure probes. Add further feature routers here, e.g.:
// router.use('/users', userRoutes);
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

export default router;
