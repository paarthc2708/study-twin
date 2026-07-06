import { Router } from 'express';
import healthRoutes from './health.routes';

const router = Router();

// Namespaced health check, mirrors the root-level /health used by
// infrastructure probes. Add further feature routers here, e.g.:
// router.use('/users', userRoutes);
router.use('/health', healthRoutes);

export default router;
