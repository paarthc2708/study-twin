# StudyTwin AI Backend

Express + TypeScript API.

## Setup

```bash
npm install
cp .env.example .env   # already present with local defaults
```

## Run

```bash
npm run dev     # ts watch mode, http://localhost:4000
npm run build    # compile to dist/
npm start        # run compiled build
```

## Structure

```
src/
  app.ts            Express app: middleware + route mounting
  server.ts          HTTP server bootstrap + graceful shutdown
  config/            env loading/validation, CORS options
  routes/             route definitions
  controllers/        request handlers
  middleware/         error handling, 404, rate limiting
  utils/              AppError, asyncHandler
```

## Endpoints

- `GET /` — API info
- `GET /health`, `/health/live`, `/health/ready` — health checks (unversioned, for load balancers/orchestrators)
- `GET /api/v1/health` — same checks under the versioned API namespace

## Environment variables

See `.env.example`. `CORS_ORIGIN` accepts a comma-separated list of allowed origins; it defaults to the local frontend at `http://localhost:3000`.
