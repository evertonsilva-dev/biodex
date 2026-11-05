import { Router } from 'express';
import { createCatalogHttpController } from '../http/catalog.controller.js';
import type { CatalogController } from '../http/catalog.types.js';

export function createCatalogRouter(catalog: CatalogController) {
  const router = Router();
  const controller = createCatalogHttpController(catalog);

  router.get('/species', controller.species);
  router.get('/suggestions', controller.suggestions);
  router.get('/species/:id/enrichment', controller.speciesEnrichment);
  router.get('/species/:id', controller.speciesDetails);
  router.get('/kingdoms', controller.kingdoms);
  router.get('/facets', controller.facets);
  router.get('/image', controller.image);

  return router;
}
