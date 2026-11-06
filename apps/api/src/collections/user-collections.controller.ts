import type { RequestHandler } from 'express';
import { z } from 'zod';
import { HttpError } from '../http/errors.js';
import type {
  ImportedUserCollection,
  UserCollectionsService,
} from './user-collections.js';

export interface AuthenticatedLocals extends Record<string, unknown> {
  userId: string;
}

const collectionIdSchema = z.string().uuid();
const collectionBodySchema = z.object({
  name: z.string().trim().min(1).max(60),
  speciesIds: z.array(z.string().trim().min(1).max(128)).max(5000),
});
const importedCollectionsSchema = z.object({
  collections: z.array(
    collectionBodySchema.extend({ id: collectionIdSchema }),
  ).max(500),
});

export function createUserCollectionsRouteHandlers(
  service: UserCollectionsService,
) {
  const listCollections: RequestHandler<
    Record<string, string>, unknown, unknown, unknown, AuthenticatedLocals
  > = async (_request, response, next) => {
    try {
      response.json({ data: await service.getAll(response.locals.userId) });
    } catch (error) {
      next(error);
    }
  };

  const createCollection: RequestHandler<
    Record<string, string>, unknown, unknown, unknown, AuthenticatedLocals
  > = async (request, response, next) => {
    try {
      const body = collectionBodySchema.safeParse(request.body);
      if (!body.success) throw new HttpError(400, 'Nome ou espécies inválidos.');
      const collection = await service.create(
        response.locals.userId,
        body.data.name,
        [...new Set(body.data.speciesIds)],
      );
      response.status(201).json({ data: collection });
    } catch (error) {
      next(error);
    }
  };

  const importCollections: RequestHandler<
    Record<string, string>, unknown, unknown, unknown, AuthenticatedLocals
  > = async (request, response, next) => {
    try {
      const body = importedCollectionsSchema.safeParse(request.body);
      if (!body.success) {
        throw new HttpError(400, 'A lista de coleções locais é inválida.');
      }
      const collections: ImportedUserCollection[] = body.data.collections.map(
        (collection) => ({
          ...collection,
          speciesIds: [...new Set(collection.speciesIds)],
        }),
      );
      await service.import(response.locals.userId, collections);
      response.json({ data: { imported: true } });
    } catch (error) {
      next(error);
    }
  };

  const updateCollection: RequestHandler<
    { id: string }, unknown, unknown, unknown, AuthenticatedLocals
  > = async (request, response, next) => {
    try {
      if (!collectionIdSchema.safeParse(request.params.id).success) {
        throw new HttpError(400, 'Identificador de coleção inválido.');
      }
      const body = collectionBodySchema.safeParse(request.body);
      if (!body.success) throw new HttpError(400, 'Nome ou espécies inválidos.');
      const collection = await service.update(
        response.locals.userId,
        request.params.id,
        body.data.name,
        [...new Set(body.data.speciesIds)],
      );
      if (!collection) throw new HttpError(404, 'Coleção não encontrada.');
      response.json({ data: collection });
    } catch (error) {
      next(error);
    }
  };

  const deleteCollection: RequestHandler<
    { id: string }, unknown, unknown, unknown, AuthenticatedLocals
  > = async (request, response, next) => {
    try {
      if (!collectionIdSchema.safeParse(request.params.id).success) {
        throw new HttpError(400, 'Identificador de coleção inválido.');
      }
      const deleted = await service.delete(
        response.locals.userId,
        request.params.id,
      );
      if (!deleted) throw new HttpError(404, 'Coleção não encontrada.');
      response.json({ data: { deleted: true } });
    } catch (error) {
      next(error);
    }
  };

  return {
    listCollections,
    createCollection,
    importCollections,
    updateCollection,
    deleteCollection,
  };
}
