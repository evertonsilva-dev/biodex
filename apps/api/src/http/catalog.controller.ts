import type { RequestHandler } from 'express';
import { HttpError } from './errors.js';
import type {
  CatalogController,
  CatalogHandler,
  CatalogHttpController,
  CatalogRequestContext,
} from './catalog.types.js';

function adapt(handler: CatalogHandler): RequestHandler {
  return async (request, response, next) => {
    try {
      const context: CatalogRequestContext = {
        query: request.query as Record<string, unknown>,
        params: request.params as Record<string, string>,
        body: undefined,
        throw(status: number, message: string): never {
          throw new HttpError(status, message);
        },
      };

      await handler(context);
      response.json(context.body ?? null);
    } catch (error) {
      next(error);
    }
  };
}

export function createCatalogHttpController(catalog: CatalogController): CatalogHttpController {
  return {
    species: adapt(catalog.species),
    suggestions: adapt(catalog.suggestions),
    speciesDetails: adapt(catalog.speciesDetails),
    speciesEnrichment: adapt(catalog.speciesEnrichment),
    speciesArticles: adapt(catalog.speciesArticles),
    kingdoms: adapt(catalog.kingdoms),
    facets: adapt(catalog.facets),
    image: adapt(catalog.image),
  };
}
