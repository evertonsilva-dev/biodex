CREATE TABLE IF NOT EXISTS public.user_collections (
  owner_id text NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  species_ids text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_id, id),
  CONSTRAINT user_collections_owner_not_empty CHECK (length(trim(owner_id)) > 0),
  CONSTRAINT user_collections_name_length CHECK (
    length(trim(name)) BETWEEN 1 AND 60
  )
);

CREATE INDEX IF NOT EXISTS user_collections_owner_created_idx
  ON public.user_collections (owner_id, created_at, id);
