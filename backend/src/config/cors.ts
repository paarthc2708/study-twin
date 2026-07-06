import { CorsOptions } from 'cors';
import { AppError } from '../utils/AppError';
import { config } from './env';

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Allow non-browser clients (no Origin header), e.g. curl/health checks.
    if (!origin || config.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new AppError(`CORS: origin "${origin}" is not allowed`, 403));
  },
  credentials: true,
};
