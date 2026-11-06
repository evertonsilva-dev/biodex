import type { QueryResultRow } from 'pg';

export interface UserCollectionRow extends QueryResultRow {
  id: string;
  name: string;
  species_ids: string[];
}

export interface UserCollection {
  id: string;
  name: string;
  speciesIds: string[];
}

export interface ImportedUserCollection extends UserCollection {}

export interface UserCollectionsService {
  getAll(ownerId: string): Promise<UserCollection[]>;
  create(ownerId: string, name: string, speciesIds: string[]): Promise<UserCollection>;
  import(ownerId: string, collections: ImportedUserCollection[]): Promise<void>;
  update(
    ownerId: string,
    id: string,
    name: string,
    speciesIds: string[],
  ): Promise<UserCollection | null>;
  delete(ownerId: string, id: string): Promise<boolean>;
}

function rowToCollection(row: UserCollectionRow): UserCollection {
  return {
    id: row.id,
    name: row.name,
    speciesIds: row.species_ids,
  };
}

export function createUserCollectionsService(db: {
  query<Row extends QueryResultRow = QueryResultRow>(
    sql: string,
    bindings?: unknown[],
  ): Promise<{ rows: Row[] }>;
}): UserCollectionsService {
  return {
    async getAll(ownerId) {
      const result = await db.query<UserCollectionRow>(
        `SELECT id, name, species_ids
         FROM public.user_collections
         WHERE owner_id = $1
         ORDER BY created_at ASC, id ASC`,
        [ownerId],
      );
      return result.rows.map(rowToCollection);
    },

    async create(ownerId, name, speciesIds) {
      const result = await db.query<UserCollectionRow>(
        `INSERT INTO public.user_collections (owner_id, name, species_ids)
         VALUES ($1, $2, $3)
         RETURNING id, name, species_ids`,
        [ownerId, name, speciesIds],
      );
      return rowToCollection(result.rows[0]!);
    },

    async import(ownerId, collections) {
      for (const collection of collections) {
        await db.query(
          `INSERT INTO public.user_collections (owner_id, id, name, species_ids)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (owner_id, id) DO NOTHING`,
          [ownerId, collection.id, collection.name, collection.speciesIds],
        );
      }
    },

    async update(ownerId, id, name, speciesIds) {
      const result = await db.query<UserCollectionRow>(
        `UPDATE public.user_collections
         SET name = $3, species_ids = $4, updated_at = now()
         WHERE owner_id = $1 AND id = $2
         RETURNING id, name, species_ids`,
        [ownerId, id, name, speciesIds],
      );
      return result.rows.length > 0 ? rowToCollection(result.rows[0]!) : null;
    },

    async delete(ownerId, id) {
      const result = await db.query<UserCollectionRow>(
        `DELETE FROM public.user_collections
         WHERE owner_id = $1 AND id = $2
         RETURNING id, name, species_ids`,
        [ownerId, id],
      );
      return result.rows.length > 0;
    },
  };
}
