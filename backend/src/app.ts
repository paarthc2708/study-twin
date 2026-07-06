import compression from 'compression';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsOptions } from './config/cors';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { apiRateLimiter } from './middleware/rateLimiter';
import healthRoutes from './routes/health.routes';
import apiRoutes from './routes/index';

export function createApp(): Application {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(morgan(config.isProduction ? 'combined' : 'dev'));

  // Root-level health checks (unversioned, for load balancers / orchestrators).
  app.use('/health', healthRoutes);

  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      name: 'StudyTwin AI backend',
      status: 'ok',
      docs: '/api/v1/health',
    });
  });

  app.use('/api/v1', apiRateLimiter, apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
