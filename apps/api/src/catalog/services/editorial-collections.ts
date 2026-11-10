import type { QueryResultRow } from 'pg';

export interface EditorialTrailStep {
  speciesId: string;
  title: string;
  narrative: string;
  sourceLabel: string;
  sourceUrl: string;
}

export interface EditorialCollectionRow extends QueryResultRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  introduction: string;
  featured_image_url: string | null;
  species_ids: string[];
  steps?: EditorialTrailStep[] | null;
  order: number;
}

export interface EditorialCollection {
  id: string;
  slug: string;
  title: string;
  description: string;
  introduction: string;
  featuredImageUrl: string | null;
  speciesIds: string[];
  steps: EditorialTrailStep[];
  order: number;
}

function rowToCollection(row: EditorialCollectionRow): EditorialCollection {
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
  };
}

export interface EditorialCollectionsService {
  getAll(): Promise<EditorialCollection[]>;
  getBySlug(slug: string): Promise<EditorialCollection | null>;
}

export function createEditorialCollectionsService(db: {
  query<Row extends QueryResultRow = QueryResultRow>(
    sql: string,
    bindings?: unknown[],
  ): Promise<{ rows: Row[] }>;
}): EditorialCollectionsService {
  return {
    async getAll() {
      const result = await db.query<EditorialCollectionRow>(
        `SELECT * FROM editorial_collections 
         WHERE published = true 
         ORDER BY "order" ASC, created_at DESC`,
      );
      return result.rows.map(rowToCollection);
    },

    async getBySlug(slug: string) {
      const result = await db.query<EditorialCollectionRow>(
        `SELECT * FROM editorial_collections WHERE slug = $1 AND published = true`,
        [slug],
      );
      return result.rows.length > 0 ? rowToCollection(result.rows[0]!) : null;
    },
  };
}
