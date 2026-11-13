import type { QueryResultRow } from 'pg';
import { IMAGE_CACHE_VERSION, type SpeciesImage } from '../catalog/services/images.js';
import { HttpError } from '../http/errors.js';

interface Database {
  query<Row extends QueryResultRow = QueryResultRow>(
    sql: string,
    bindings?: unknown[],
  ): Promise<{ rows: Row[] }>;
}

export type PhotoSuggestionStatus = 'pending' | 'approved' | 'rejected';

export interface PhotoSuggestion {
  id: string;
  speciesId: string;
  scientificName: string | null;
  photo: SpeciesImage;
  status: PhotoSuggestionStatus;
  submittedBy: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

interface SuggestionRow extends QueryResultRow {
  id: string;
  external_id: string;
  scientific_name: string | null;
  photo_payload: SpeciesImage;
  status: PhotoSuggestionStatus;
  submitted_by: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

interface CachedImageRow extends QueryResultRow {
  image_url: string | null;
  source: string | null;
  attribution: string | null;
  license: string | null;
  reference_url: string | null;
  is_representative: boolean;
  representative_rank: string | null;
  representative_taxon_name: string | null;
  gallery_images: unknown;
}

function isSpeciesImage(value: unknown): value is SpeciesImage {
  if (!value || typeof value !== 'object') return false;
  const photo = value as Partial<SpeciesImage>;
  return typeof photo.url === 'string'
    && typeof photo.source === 'string'
    && typeof photo.attribution === 'string'
    && typeof photo.license === 'string'
    && typeof photo.referenceUrl === 'string';
}

function rowToSuggestion(row: SuggestionRow): PhotoSuggestion {
  return {
    id: row.id,
    speciesId: row.external_id,
    scientificName: row.scientific_name,
    photo: row.photo_payload,
    status: row.status,
    submittedBy: row.submitted_by,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
  };
}

const suggestionSelect = `
  SELECT suggestion.id,
         suggestion.external_id,
         species.scientific_name,
         suggestion.photo_payload,
         suggestion.status,
         suggestion.submitted_by,
         suggestion.reviewed_by,
         suggestion.reviewed_at::text AS reviewed_at,
         suggestion.created_at::text AS created_at
  FROM public.col_species_photo_suggestions suggestion
  LEFT JOIN public.col_taxon_usage species
    ON species.external_id = suggestion.external_id
`;

export function createPhotoSuggestionService(db: Database) {
  return {
    async submit(
      userId: string,
      speciesId: string,
      photoUrl: string,
    ): Promise<PhotoSuggestion> {
      const speciesResult = await db.query<{ external_id: string }>(
        `SELECT external_id
         FROM public.col_taxon_usage
         WHERE external_id = $1
           AND status = 'accepted'
           AND rank = 'species'
           AND is_catalog_species = true
         LIMIT 1`,
        [speciesId],
      );
      const species = speciesResult.rows[0];
      if (!species) throw new HttpError(404, 'Espécie não encontrada no catálogo.');

      const cacheKey = `${IMAGE_CACHE_VERSION}:taxon:${species.external_id.toLocaleLowerCase('en')}`;
      const cachedResult = await db.query<CachedImageRow>(
        `SELECT image_url, source, attribution, license, reference_url,
                is_representative, representative_rank, representative_taxon_name,
                gallery_images
         FROM public.col_species_image_cache
         WHERE scientific_name_key = $1
         LIMIT 1`,
        [cacheKey],
      );
      const cache = cachedResult.rows[0];
      if (!cache) {
        throw new HttpError(409, 'Atualize a galeria de imagens antes de sugerir uma foto.');
      }

      const primaryPhoto = cache.image_url && cache.source && cache.attribution
        && cache.license && cache.reference_url
        ? {
            url: cache.image_url,
            source: cache.source,
            attribution: cache.attribution,
            license: cache.license,
            referenceUrl: cache.reference_url,
            isRepresentative: cache.is_representative,
            representativeRank: cache.representative_rank,
            representativeTaxonName: cache.representative_taxon_name,
          } satisfies SpeciesImage
        : null;
      const galleryPhotos = Array.isArray(cache.gallery_images)
        ? cache.gallery_images.filter(isSpeciesImage)
        : [];
      const photo = [primaryPhoto, ...galleryPhotos]
        .find((candidate) => candidate?.url === photoUrl);
      if (!photo) {
        throw new HttpError(400, 'A foto precisa pertencer à galeria disponível desta espécie.');
      }

      const result = await db.query<SuggestionRow>(
        `INSERT INTO public.col_species_photo_suggestions (
           external_id, photo_payload, submitted_by
         )
         VALUES ($1, $2::jsonb, $3)
         ON CONFLICT (external_id, submitted_by)
           WHERE status = 'pending'
         DO NOTHING
         RETURNING id, external_id, NULL::text AS scientific_name,
           photo_payload, status, submitted_by, reviewed_by,
           reviewed_at::text AS reviewed_at, created_at::text AS created_at`,
        [species.external_id, JSON.stringify(photo), userId],
      );
      const suggestion = result.rows[0];
      if (!suggestion) {
        throw new HttpError(409, 'Você já tem uma sugestão pendente para esta espécie.');
      }
      return rowToSuggestion(suggestion);
    },

    async listMine(userId: string): Promise<PhotoSuggestion[]> {
      const result = await db.query<SuggestionRow>(
        `${suggestionSelect}
         WHERE suggestion.submitted_by = $1
         ORDER BY suggestion.created_at DESC
         LIMIT 100`,
        [userId],
      );
      return result.rows.map(rowToSuggestion);
    },

    async getMineForSpecies(
      userId: string,
      speciesId: string,
    ): Promise<PhotoSuggestion | null> {
      const result = await db.query<SuggestionRow>(
        `${suggestionSelect}
         WHERE suggestion.submitted_by = $1
           AND suggestion.external_id = $2
         ORDER BY suggestion.created_at DESC
         LIMIT 1`,
        [userId, speciesId],
      );
      const suggestion = result.rows[0];
      return suggestion ? rowToSuggestion(suggestion) : null;
    },

    async listPending(): Promise<PhotoSuggestion[]> {
      const result = await db.query<SuggestionRow>(
        `${suggestionSelect}
         WHERE suggestion.status = 'pending'
         ORDER BY suggestion.created_at ASC
         LIMIT 200`,
      );
      return result.rows.map(rowToSuggestion);
    },

    async review(
      id: string,
      reviewerId: string,
      decision: Exclude<PhotoSuggestionStatus, 'pending'>,
    ): Promise<PhotoSuggestion | null> {
      const result = await db.query<SuggestionRow>(
        `WITH reviewed AS (
           UPDATE public.col_species_photo_suggestions
           SET status = $2, reviewed_by = $3, reviewed_at = now()
           WHERE id = $1 AND status = 'pending'
           RETURNING *
         ),
         saved_best_photo AS (
           INSERT INTO public.col_species_best_photo (
             external_id, photo_payload, suggestion_id, approved_by, approved_at
           )
           SELECT external_id, photo_payload, id, reviewed_by, reviewed_at
           FROM reviewed
           WHERE status = 'approved'
           ON CONFLICT (external_id) DO UPDATE SET
             photo_payload = EXCLUDED.photo_payload,
             suggestion_id = EXCLUDED.suggestion_id,
             approved_by = EXCLUDED.approved_by,
             approved_at = EXCLUDED.approved_at
           RETURNING external_id
         )
         SELECT reviewed.id,
                reviewed.external_id,
                species.scientific_name,
                reviewed.photo_payload,
                reviewed.status,
                reviewed.submitted_by,
                reviewed.reviewed_by,
                reviewed.reviewed_at::text AS reviewed_at,
                reviewed.created_at::text AS created_at
         FROM reviewed
         LEFT JOIN public.col_taxon_usage species
           ON species.external_id = reviewed.external_id`,
        [id, decision, reviewerId],
      );
      const suggestion = result.rows[0];
      return suggestion ? rowToSuggestion(suggestion) : null;
    },
  };
}

export type PhotoSuggestionService = ReturnType<typeof createPhotoSuggestionService>;
