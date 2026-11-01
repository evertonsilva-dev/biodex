import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { createCatalogRouter } from './routes/catalog.routes.js';
import { errorHandler, notFoundHandler, HttpError } from './http/errors.js';
import type { ApiEnvironment } from './config/env.js';
import type { CatalogController } from './http/catalog.types.js';

interface CreateAppOptions {
  catalog: CatalogController;
  healthCheck: () => Promise<boolean>;
  config: Pick<ApiEnvironment, 'corsOrigins'>;
}

export function createApp({ catalog, healthCheck, config }: CreateAppOptions) {
  const app = express();
  const allowedOrigins = new Set(config.corsOrigins);

  app.disable('x-powered-by');
  app.set('query parser', 'simple');
  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.has(origin));
    },
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Accept', 'Content-Type'],
    maxAge: 86400,
  }));
  app.use(pinoHttp({
    redact: ['req.headers.authorization', 'req.headers.cookie'],
  }));
  app.use((_request, response, next) => {
    response.setHeader('Cache-Control', 'no-store');
    next();
  });

  app.get('/health', async (_request, response) => {
    if (!await healthCheck()) {
      throw new HttpError(503, 'Catalog tables are missing; import the catalog first.');
    }
    response.json({ status: 'ok' });
  });
  app.use('/api/catalog', createCatalogRouter(catalog));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
