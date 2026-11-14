import type { RequestHandler } from 'express';
import { z } from 'zod';
import {
  canAssignRole,
  canCreateEditorialContent,
  canDeleteEditorialContent,
  canReviewPhotoSuggestions,
  canViewUsers,
} from '../auth/roles.js';
import { HttpError } from '../http/errors.js';
import type { EditorialContentService } from './editorial-content.js';
import type { PhotoSuggestionService } from './photo-suggestions.js';
import type { UserAccessService } from './users.js';

export interface AuthenticatedLocals extends Record<string, unknown> {
  userId: string;
}

const userIdSchema = z.string().trim().min(1).max(200);
const uuidSchema = z.string().uuid();
const birthDateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime())
      && date.toISOString().slice(0, 10) === value
      && value <= new Date().toISOString().slice(0, 10);
  });
const httpsUrlSchema = z.string()
  .trim()
  .url()
  .max(2048)
  .refine((value) => new URL(value).protocol === 'https:', {
    message: 'A URL precisa usar HTTPS.',
  });
const editorialBodySchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
  introduction: z.string().trim().min(1).max(3000),
  featuredImageUrl: httpsUrlSchema.nullable(),
  speciesIds: z.array(z.string().trim().min(1).max(128)).min(1).max(100),
  steps: z.array(z.object({
    speciesId: z.string().trim().min(1).max(128),
    title: z.string().trim().min(1).max(160),
    narrative: z.string().trim().min(1).max(3000),
    sourceLabel: z.string().trim().min(1).max(120),
    sourceUrl: httpsUrlSchema,
  }).strict()).max(100),
}).strict();

export function createContributionsRouteHandlers(
  users: UserAccessService,
  editorialContent: EditorialContentService,
  photoSuggestions: PhotoSuggestionService,
) {
  const getCurrentAccount: RequestHandler<
    Record<string, string>, unknown, unknown, unknown, AuthenticatedLocals
  > = async (_request, response, next) => {
    try {
      response.json({ data: await users.getCurrentAccount(response.locals.userId) });
    } catch (error) {
      next(error);
    }
  };

  const getProfile: RequestHandler<
    Record<string, string>, unknown, unknown, unknown, AuthenticatedLocals
  > = async (_request, response, next) => {
    try {
      response.json({ data: await users.getProfile(response.locals.userId) });
    } catch (error) {
      next(error);
    }
  };

  const updateProfile: RequestHandler<
    Record<string, string>, unknown, unknown, unknown, AuthenticatedLocals
  > = async (request, response, next) => {
    try {
      const body = z.object({
        cpf: z.string().trim().max(20).optional(),
        birthDate: birthDateSchema,
        profession: z.string().trim().min(1).max(120),
        professionalCouncil: z.string().trim().max(120).optional().default(''),
        professionalRegistrationNumber: z.string().trim().max(80).optional().default(''),
      }).strict().safeParse(request.body);
      if (!body.success) {
        throw new HttpError(400, 'Confira os dados obrigatórios do perfil.');
      }

      const council = body.data.professionalCouncil || null;
      const registrationNumber = body.data.professionalRegistrationNumber || null;
      if (Boolean(council) !== Boolean(registrationNumber)) {
        throw new HttpError(400, 'Informe o conselho e o número do registro juntos.');
      }

      response.json({
        data: await users.updateProfile(response.locals.userId, {
          cpf: body.data.cpf,
          birthDate: body.data.birthDate,
          profession: body.data.profession,
          professionalCouncil: council,
          professionalRegistrationNumber: registrationNumber,
        }),
      });
    } catch (error) {
      next(error);
    }
  };

  const listUsers: RequestHandler<
    Record<string, string>, unknown, unknown, unknown, AuthenticatedLocals
  > = async (_request, response, next) => {
    try {
      const current = await users.getCurrentAccount(response.locals.userId);
      if (!canViewUsers(current.role)) {
        throw new HttpError(403, 'Apenas admins e root podem consultar os usuários.');
      }
      response.json({ data: await users.listUsers() });
    } catch (error) {
      next(error);
    }
  };

  const assignRole: RequestHandler<
    { id: string }, unknown, unknown, unknown, AuthenticatedLocals
  > = async (request, response, next) => {
    try {
      const current = await users.getCurrentAccount(response.locals.userId);
      if (!canViewUsers(current.role)) {
        throw new HttpError(403, 'Apenas admins e root podem alterar permissões.');
      }
      const targetId = userIdSchema.safeParse(request.params.id);
      const body = z.object({
        role: z.enum(['user', 'curator', 'admin']),
      }).strict().safeParse(request.body);
      if (!targetId.success || !body.success) {
        throw new HttpError(400, 'Usuário ou nível de acesso inválido.');
      }
      const role = body.data.role;
      if (!canAssignRole(current.role, role)) {
        throw new HttpError(403, 'Você não pode conceder este nível de acesso.');
      }
      await users.setRole(response.locals.userId, targetId.data, role);
      response.json({ data: { userId: targetId.data, role } });
    } catch (error) {
      next(error);
    }
  };

  const reviewProfessionalRegistration: RequestHandler<
    { id: string }, unknown, unknown, unknown, AuthenticatedLocals
  > = async (request, response, next) => {
    try {
      const current = await users.getCurrentAccount(response.locals.userId);
      if (!canReviewPhotoSuggestions(current.role)) {
        throw new HttpError(403, 'Apenas admins e root podem revisar registros profissionais.');
      }
      const targetId = userIdSchema.safeParse(request.params.id);
      const body = z.object({
        status: z.enum(['active', 'rejected']),
      }).strict().safeParse(request.body);
      if (!targetId.success || !body.success) {
        throw new HttpError(400, 'O usuário ou a decisão de revisão é inválida.');
      }
      await users.reviewProfessionalRegistration(
        targetId.data,
        response.locals.userId,
        body.data.status,
      );
      response.json({ data: { userId: targetId.data, status: body.data.status } });
    } catch (error) {
      next(error);
    }
  };

  const listEditorialContent: RequestHandler<
    Record<string, string>, unknown, unknown, unknown, AuthenticatedLocals
  > = async (_request, response, next) => {
    try {
      const current = await users.getCurrentAccount(response.locals.userId);
      if (
        !canCreateEditorialContent(current.role)
        && current.role !== 'admin'
      ) {
        throw new HttpError(403, 'Seu nível de acesso não inclui gestão editorial.');
      }
      response.json({
        data: await editorialContent.listForAccount(current.userId, current.role),
      });
    } catch (error) {
      next(error);
    }
  };

  const createEditorialContent: RequestHandler<
    Record<string, string>, unknown, unknown, unknown, AuthenticatedLocals
  > = async (request, response, next) => {
    try {
      const current = await users.getCurrentAccount(response.locals.userId);
      if (!canCreateEditorialContent(current.role)) {
        throw new HttpError(403, 'Apenas curadores e root podem criar conteúdo editorial.');
      }
      const body = editorialBodySchema.safeParse(request.body);
      if (!body.success) throw new HttpError(400, 'Os dados do conteúdo editorial são inválidos.');
      response.status(201).json({
        data: await editorialContent.create(current.userId, body.data),
      });
    } catch (error) {
      next(error);
    }
  };

  const updateEditorialContent: RequestHandler<
    { id: string }, unknown, unknown, unknown, AuthenticatedLocals
  > = async (request, response, next) => {
    try {
      const current = await users.getCurrentAccount(response.locals.userId);
      const id = uuidSchema.safeParse(request.params.id);
      const body = editorialBodySchema.safeParse(request.body);
      if (!id.success || !body.success) {
        throw new HttpError(400, 'Identificador ou dados do conteúdo editorial inválidos.');
      }
      const updated = await editorialContent.update(
        current.userId,
        current.role,
        id.data,
        body.data,
      );
      if (!updated) throw new HttpError(404, 'Conteúdo editorial não encontrado.');
      response.json({ data: updated });
    } catch (error) {
      next(error);
    }
  };

  const deleteEditorialContent: RequestHandler<
    { id: string }, unknown, unknown, unknown, AuthenticatedLocals
  > = async (request, response, next) => {
    try {
      const current = await users.getCurrentAccount(response.locals.userId);
      if (!canDeleteEditorialContent(current.role)) {
        throw new HttpError(403, 'Apenas admins e root podem excluir conteúdo editorial.');
      }
      const id = uuidSchema.safeParse(request.params.id);
      if (!id.success) throw new HttpError(400, 'Identificador do conteúdo editorial inválido.');
      const deleted = await editorialContent.delete(id.data);
      if (!deleted) throw new HttpError(404, 'Conteúdo editorial não encontrado.');
      response.json({ data: { deleted: true } });
    } catch (error) {
      next(error);
    }
  };

  const submitPhotoSuggestion: RequestHandler<
    Record<string, string>, unknown, unknown, unknown, AuthenticatedLocals
  > = async (request, response, next) => {
    try {
      await users.getCurrentAccount(response.locals.userId);
      const body = z.object({
        speciesId: z.string().trim().min(1).max(200),
        photoUrl: httpsUrlSchema,
      }).strict().safeParse(request.body);
      if (!body.success) throw new HttpError(400, 'Espécie ou foto inválida.');
      const suggestion = await photoSuggestions.submit(
        response.locals.userId,
        body.data.speciesId,
        body.data.photoUrl,
      );
      response.status(201).json({ data: suggestion });
    } catch (error) {
      next(error);
    }
  };

  const listMyPhotoSuggestions: RequestHandler<
    Record<string, string>, unknown, unknown, unknown, AuthenticatedLocals
  > = async (_request, response, next) => {
    try {
      await users.getCurrentAccount(response.locals.userId);
      response.json({ data: await photoSuggestions.listMine(response.locals.userId) });
    } catch (error) {
      next(error);
    }
  };

  const getMyPhotoSuggestionForSpecies: RequestHandler<
    { speciesId: string }, unknown, unknown, unknown, AuthenticatedLocals
  > = async (request, response, next) => {
    try {
      await users.getCurrentAccount(response.locals.userId);
      const speciesId = z.string().trim().min(1).max(200).safeParse(
        request.params.speciesId,
      );
      if (!speciesId.success) {
        throw new HttpError(400, 'Identificador da espécie inválido.');
      }
      response.json({
        data: await photoSuggestions.getMineForSpecies(
          response.locals.userId,
          speciesId.data,
        ),
      });
    } catch (error) {
      next(error);
    }
  };

  const listPendingPhotoSuggestions: RequestHandler<
    Record<string, string>, unknown, unknown, unknown, AuthenticatedLocals
  > = async (_request, response, next) => {
    try {
      const current = await users.getCurrentAccount(response.locals.userId);
      if (!canReviewPhotoSuggestions(current.role)) {
        throw new HttpError(403, 'Apenas admins e root podem revisar fotos.');
      }
      response.json({ data: await photoSuggestions.listPending() });
    } catch (error) {
      next(error);
    }
  };

  const reviewPhotoSuggestion: RequestHandler<
    { id: string }, unknown, unknown, unknown, AuthenticatedLocals
  > = async (request, response, next) => {
    try {
      const current = await users.getCurrentAccount(response.locals.userId);
      if (!canReviewPhotoSuggestions(current.role)) {
        throw new HttpError(403, 'Apenas admins e root podem revisar fotos.');
      }
      const id = uuidSchema.safeParse(request.params.id);
      const body = z.object({
        decision: z.enum(['approved', 'rejected']),
      }).strict().safeParse(request.body);
      if (!id.success || !body.success) {
        throw new HttpError(400, 'A decisão de revisão é inválida.');
      }
      const suggestion = await photoSuggestions.review(
        id.data,
        response.locals.userId,
        body.data.decision,
      );
      if (!suggestion) {
        throw new HttpError(404, 'Solicitação pendente não encontrada.');
      }
      response.json({ data: suggestion });
    } catch (error) {
      next(error);
    }
  };

  return {
    getCurrentAccount,
    getProfile,
    updateProfile,
    listUsers,
    assignRole,
    reviewProfessionalRegistration,
    listEditorialContent,
    createEditorialContent,
    updateEditorialContent,
    deleteEditorialContent,
    submitPhotoSuggestion,
    listMyPhotoSuggestions,
    getMyPhotoSuggestionForSpecies,
    listPendingPhotoSuggestions,
    reviewPhotoSuggestion,
  };
}
