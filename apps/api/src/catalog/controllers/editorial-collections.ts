import type { RequestHandler } from 'express';
import { HttpError } from '../../http/errors.js';
import type { EditorialCollectionsService } from '../services/editorial-collections.js';

export function createEditorialCollectionsRouteHandlers(service: EditorialCollectionsService) {
  const listCollections: RequestHandler = async (_request, response, next) => {
    try {
      const collections = await service.getAll();
      response.json({ data: collections });
    } catch (error) {
      next(error);
    }
  };

  const getBySlug: RequestHandler<{ slug: string }> = async (request, response, next) => {
    try {
      const slug = request.params.slug;
      const collection = await service.getBySlug(slug);

      if (!collection) {
        throw new HttpError(404, 'Coleção não encontrada.');
      }

      response.json({ data: collection });
    } catch (error) {
      next(error);
    }
  };

  return { listCollections, getBySlug };
}
