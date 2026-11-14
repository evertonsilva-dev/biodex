import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { createCatalogRouter } from './routes/catalog.routes.js';
import { createEditorialCollectionsRouter } from './routes/editorial-collections.routes.js';
import { createUserCollectionsRouter } from './routes/user-collections.routes.js';
import { createContributionsRouter } from './routes/contributions.routes.js';
import { errorHandler, notFoundHandler, HttpError } from './http/errors.js';
import type { ApiEnvironment } from './config/env.js';
import type { CatalogController } from './http/catalog.types.js';
import type { EditorialCollectionsService } from './catalog/services/editorial-collections.js';
import type { UserCollectionsService } from './collections/user-collections.js';
import type { UserAccessService } from './contributions/users.js';
import type { EditorialContentService } from './contributions/editorial-content.js';
import type { PhotoSuggestionService } from './contributions/photo-suggestions.js';
import type { AccessTokenVerifier } from './auth/token-verifier.js';

interface CreateAppOptions {
  catalog: CatalogController;
  editorialCollections: EditorialCollectionsService;
  userCollections: UserCollectionsService;
  userAccess: UserAccessService;
  editorialContent: EditorialContentService;
  photoSuggestions: PhotoSuggestionService;
  verifyAccessToken: AccessTokenVerifier | null;
  healthCheck: () => Promise<boolean>;
  config: Pick<ApiEnvironment, 'corsOrigins'>;
}

export function createApp({
  catalog,
  editorialCollections,
  userCollections,
  userAccess,
  editorialContent,
  photoSuggestions,
  verifyAccessToken,
  healthCheck,
  config,
}: CreateAppOptions) {
  const app = express();
  const allowedOrigins = new Set(config.corsOrigins);

  app.disable('x-powered-by');
  app.set('query parser', 'simple');
  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.has(origin));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Accept', 'Authorization', 'Content-Type'],
    maxAge: 86400,
  }));
  app.use(pinoHttp({
    redact: ['req.headers.authorization', 'req.headers.cookie'],
  }));
  app.use((_request, response, next) => {
    response.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.use(express.json({ limit: '128kb' }));

  app.get('/health', async (_request, response) => {
    if (!await healthCheck()) {
      throw new HttpError(503, 'Catalog tables are missing; import the catalog first.');
    }
    response.json({ status: 'ok' });
  });
  app.use('/api/catalog', createCatalogRouter(catalog));
  app.use('/api/editorial-collections', createEditorialCollectionsRouter(editorialCollections));
  app.use(
    '/api/collections',
    createUserCollectionsRouter(userCollections, verifyAccessToken),
  );
  app.use(
    '/api/contributions',
    createContributionsRouter(
      userAccess,
      editorialContent,
      photoSuggestions,
      verifyAccessToken,
    ),
  );
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
