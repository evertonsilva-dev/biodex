import { Router } from 'express';
import { HttpError } from '../http/errors.js';
import type { AccessTokenVerifier } from '../auth/token-verifier.js';
import type { EditorialContentService } from '../contributions/editorial-content.js';
import type { PhotoSuggestionService } from '../contributions/photo-suggestions.js';
import type { UserAccessService } from '../contributions/users.js';
import { createContributionsRouteHandlers } from '../contributions/controller.js';

export function createContributionsRouter(
  users: UserAccessService,
  editorialContent: EditorialContentService,
  photoSuggestions: PhotoSuggestionService,
  verifyAccessToken: AccessTokenVerifier | null,
) {
  const router = Router();
  const handlers = createContributionsRouteHandlers(
    users,
    editorialContent,
    photoSuggestions,
  );

  router.use(async (request, response, next) => {
    if (!verifyAccessToken) {
      next(new HttpError(503, 'A autenticação ainda não está configurada.'));
      return;
    }

    const authorization = request.get('authorization');
    const match = authorization?.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      next(new HttpError(401, 'É necessário entrar para acessar as contribuições.'));
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

  router.get('/me', handlers.getCurrentAccount);
  router.get('/profile', handlers.getProfile);
  router.put('/profile', handlers.updateProfile);
  router.get('/users', handlers.listUsers);
  router.put('/users/:id/role', handlers.assignRole);
  router.put(
    '/users/:id/professional-registration',
    handlers.reviewProfessionalRegistration,
  );
  router.get('/editorial-content', handlers.listEditorialContent);
  router.post('/editorial-content', handlers.createEditorialContent);
  router.put('/editorial-content/:id', handlers.updateEditorialContent);
  router.delete('/editorial-content/:id', handlers.deleteEditorialContent);
  router.get('/photo-suggestions', handlers.listMyPhotoSuggestions);
  router.get(
    '/photo-suggestions/species/:speciesId',
    handlers.getMyPhotoSuggestionForSpecies,
  );
  router.post('/photo-suggestions', handlers.submitPhotoSuggestion);
  router.get('/photo-suggestions/pending', handlers.listPendingPhotoSuggestions);
  router.post('/photo-suggestions/:id/review', handlers.reviewPhotoSuggestion);

  return router;
}
