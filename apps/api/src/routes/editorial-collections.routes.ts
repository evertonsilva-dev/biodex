import { Router } from 'express';
import type { EditorialCollectionsService } from '../catalog/services/editorial-collections.js';
import { createEditorialCollectionsRouteHandlers } from '../catalog/controllers/editorial-collections.js';

export function createEditorialCollectionsRouter(service: EditorialCollectionsService) {
  const router = Router();
  const handlers = createEditorialCollectionsRouteHandlers(service);

  router.get('/', handlers.listCollections);
  router.get('/:slug', handlers.getBySlug);

  return router;
}
