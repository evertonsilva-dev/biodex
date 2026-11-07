import { Router } from 'express';
import { HttpError } from '../http/errors.js';
import type { AccessTokenVerifier } from '../auth/token-verifier.js';
import type { UserCollectionsService } from '../collections/user-collections.js';
import { createUserCollectionsRouteHandlers } from '../collections/user-collections.controller.js';

export function createUserCollectionsRouter(
  service: UserCollectionsService,
  verifyAccessToken: AccessTokenVerifier | null,
) {
  const router = Router();
  const handlers = createUserCollectionsRouteHandlers(service);

  router.use(async (request, response, next) => {
    if (!verifyAccessToken) {
      next(new HttpError(503, 'A autenticação ainda não está configurada.'));
      return;
    }

    const authorization = request.get('authorization');
    const match = authorization?.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      next(new HttpError(401, 'É necessário entrar para acessar as coleções.'));
      return;
    }

    try {
      const userId = await verifyAccessToken(match[1]!);
      if (!userId) {
        next(new HttpError(401, 'Sua sessão é inválida ou expirou.'));
        return;
      }
      response.locals.userId = userId;
      next();
    } catch (error) {
      next(error);
    }
  });

  router.get('/', handlers.listCollections);
  router.post('/', handlers.createCollection);
  router.post('/import', handlers.importCollections);
  router.put('/:id', handlers.updateCollection);
  router.delete('/:id', handlers.deleteCollection);

  return router;
}
