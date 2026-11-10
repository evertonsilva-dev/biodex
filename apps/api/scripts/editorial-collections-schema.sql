CREATE TABLE IF NOT EXISTS public.editorial_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  introduction text NOT NULL,
  featured_image_url text,
  species_ids text[] NOT NULL DEFAULT '{}',
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  "order" integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT editorial_collections_slug_not_empty CHECK (length(trim(slug)) > 0),
  CONSTRAINT editorial_collections_title_not_empty CHECK (length(trim(title)) > 0)
);

ALTER TABLE public.editorial_collections
  ADD COLUMN IF NOT EXISTS steps jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS editorial_collections_published_order_idx
  ON public.editorial_collections (published, "order", created_at DESC);
