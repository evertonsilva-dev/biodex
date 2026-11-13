import { randomUUID } from 'node:crypto';
import type { QueryResultRow } from 'pg';
import { canEditEditorialContent, type AccountRole } from '../auth/roles.js';
import { HttpError } from '../http/errors.js';
import type { EditorialTrailStep } from '../catalog/services/editorial-collections.js';

interface Database {
  query<Row extends QueryResultRow = QueryResultRow>(
    sql: string,
    bindings?: unknown[],
  ): Promise<{ rows: Row[] }>;
}

export interface EditorialContentInput {
  title: string;
  description: string;
  introduction: string;
  featuredImageUrl: string | null;
  speciesIds: string[];
  steps: EditorialTrailStep[];
}

interface EditorialContentRow extends QueryResultRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  introduction: string;
  featured_image_url: string | null;
  species_ids: string[];
  steps: EditorialTrailStep[] | null;
  order: number;
  owner_id: string | null;
}

export interface ManagedEditorialContent {
  id: string;
  slug: string;
  title: string;
  description: string;
  introduction: string;
  featuredImageUrl: string | null;
  speciesIds: string[];
  steps: EditorialTrailStep[];
  order: number;
  ownerId: string | null;
}

function rowToContent(row: EditorialContentRow): ManagedEditorialContent {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    introduction: row.introduction,
    featuredImageUrl: row.featured_image_url,
    speciesIds: row.species_ids,
    steps: row.steps ?? [],
    order: row.order,
    ownerId: row.owner_id,
  };
}

function slugBase(title: string): string {
  return title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72) || 'colecao-editorial';
}

export function createEditorialContentService(db: Database) {
  const returningColumns = `
    id, slug, title, description, introduction, featured_image_url,
    species_ids, steps, "order", owner_id
  `;

  async function validateSpecies(ids: string[]): Promise<void> {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length === 0) {
      throw new HttpError(400, 'Selecione ao menos uma espécie para o conteúdo editorial.');
    }

    const result = await db.query<{ external_id: string }>(
      `SELECT external_id
       FROM public.col_taxon_usage
       WHERE external_id = ANY($1::text[])
         AND status = 'accepted'
         AND rank = 'species'
         AND is_catalog_species = true`,
      [uniqueIds],
    );
    if (result.rows.length !== uniqueIds.length) {
      throw new HttpError(400, 'Uma ou mais espécies não estão disponíveis no catálogo.');
    }
  }

  async function validateSteps(
    speciesIds: string[],
    steps: EditorialTrailStep[],
  ): Promise<void> {
    const selected = new Set(speciesIds);
    if (steps.some((step) => !selected.has(step.speciesId))) {
      throw new HttpError(400, 'Cada passo da trilha precisa usar uma espécie selecionada.');
    }
  }

  return {
    async listForAccount(
      userId: string,
      role: AccountRole,
    ): Promise<ManagedEditorialContent[]> {
      const result = role === 'admin' || role === 'root'
        ? await db.query<EditorialContentRow>(
            `SELECT ${returningColumns}
             FROM public.editorial_collections
             ORDER BY "order" ASC, created_at DESC`,
          )
        : await db.query<EditorialContentRow>(
            `SELECT ${returningColumns}
             FROM public.editorial_collections
             WHERE owner_id = $1
             ORDER BY "order" ASC, created_at DESC`,
            [userId],
          );
      return result.rows.map(rowToContent);
    },

    async create(
      ownerId: string,
      input: EditorialContentInput,
    ): Promise<ManagedEditorialContent> {
      const speciesIds = [...new Set(input.speciesIds)];
      await validateSpecies(speciesIds);
      await validateSteps(speciesIds, input.steps);
      const orderResult = await db.query<{ next_order: number }>(
        `SELECT COALESCE(MAX("order"), 0) + 1 AS next_order
         FROM public.editorial_collections`,
      );
      const slug = `${slugBase(input.title)}-${randomUUID().slice(0, 8)}`;
      const result = await db.query<EditorialContentRow>(
        `INSERT INTO public.editorial_collections (
           slug, title, description, introduction, featured_image_url,
           species_ids, steps, "order", published, owner_id
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, true, $9)
         RETURNING ${returningColumns}`,
        [
          slug,
          input.title,
          input.description,
          input.introduction,
          input.featuredImageUrl,
          speciesIds,
          JSON.stringify(input.steps),
          orderResult.rows[0]?.next_order ?? 1,
          ownerId,
        ],
      );
      const created = result.rows[0];
      if (!created) throw new Error('Editorial content was not returned after creation.');
      return rowToContent(created);
    },

    async update(
      actorId: string,
      role: AccountRole,
      id: string,
      input: EditorialContentInput,
    ): Promise<ManagedEditorialContent | null> {
      const currentResult = await db.query<Pick<EditorialContentRow, 'owner_id'>>(
        `SELECT owner_id
         FROM public.editorial_collections
         WHERE id = $1`,
        [id],
      );
      const current = currentResult.rows[0];
      if (!current) return null;
      if (!canEditEditorialContent(role, actorId, current.owner_id)) {
        throw new HttpError(403, 'Você só pode editar conteúdos criados por você.');
      }

      const speciesIds = [...new Set(input.speciesIds)];
      await validateSpecies(speciesIds);
      await validateSteps(speciesIds, input.steps);
      const result = await db.query<EditorialContentRow>(
        `UPDATE public.editorial_collections
         SET title = $3,
             description = $4,
             introduction = $5,
             featured_image_url = $6,
             species_ids = $7,
             steps = $8::jsonb,
             updated_at = now()
         WHERE id = $1 AND owner_id IS NOT DISTINCT FROM $2
         RETURNING ${returningColumns}`,
        [
          id,
          current.owner_id,
          input.title,
          input.description,
          input.introduction,
          input.featuredImageUrl,
          speciesIds,
          JSON.stringify(input.steps),
        ],
      );
      return result.rows[0] ? rowToContent(result.rows[0]) : null;
    },

    async delete(id: string): Promise<boolean> {
      const result = await db.query(
        `DELETE FROM public.editorial_collections WHERE id = $1 RETURNING id`,
        [id],
      );
      return result.rows.length > 0;
    },
  };
}

export type EditorialContentService = ReturnType<typeof createEditorialContentService>;
