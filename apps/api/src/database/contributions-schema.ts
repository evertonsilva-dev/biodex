export const CONTRIBUTIONS_SCHEMA_SQL = `
  ALTER TABLE public.editorial_collections
    ADD COLUMN IF NOT EXISTS owner_id text;

  CREATE INDEX IF NOT EXISTS editorial_collections_owner_order_idx
    ON public.editorial_collections (owner_id, "order", created_at DESC);

  CREATE TABLE IF NOT EXISTS public.app_user_roles (
    user_id text PRIMARY KEY,
    role text NOT NULL DEFAULT 'user'
      CHECK (role IN ('user', 'curator', 'admin')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    last_seen_at timestamptz NOT NULL DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS app_user_roles_role_seen_idx
    ON public.app_user_roles (role, last_seen_at DESC);

  CREATE TABLE IF NOT EXISTS public.app_user_profiles (
    user_id text PRIMARY KEY,
    cpf_hash text NOT NULL UNIQUE,
    cpf_ciphertext text NOT NULL,
    cpf_last_four char(4) NOT NULL,
    birth_date date NOT NULL,
    profession text NOT NULL,
    professional_council text,
    professional_registration_number text,
    professional_registration_status text NOT NULL DEFAULT 'not_submitted'
      CHECK (professional_registration_status IN ('not_submitted', 'pending', 'active', 'rejected')),
    registration_verified_by text,
    registration_verified_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (
      (professional_council IS NULL AND professional_registration_number IS NULL)
      OR (professional_council IS NOT NULL AND professional_registration_number IS NOT NULL)
    ),
    CHECK (
      (professional_registration_status IN ('not_submitted', 'rejected'))
      OR (professional_council IS NOT NULL AND professional_registration_number IS NOT NULL)
    )
  );

  CREATE INDEX IF NOT EXISTS app_user_profiles_registration_status_idx
    ON public.app_user_profiles (professional_registration_status, updated_at DESC);

  CREATE TABLE IF NOT EXISTS public.col_species_photo_suggestions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id text NOT NULL,
    photo_payload jsonb NOT NULL,
    submitted_by text NOT NULL,
    status text NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by text,
    reviewed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS col_species_photo_suggestions_status_created_idx
    ON public.col_species_photo_suggestions (status, created_at DESC);

  CREATE INDEX IF NOT EXISTS col_species_photo_suggestions_submitter_idx
    ON public.col_species_photo_suggestions (submitted_by, created_at DESC);

  CREATE UNIQUE INDEX IF NOT EXISTS col_species_photo_suggestions_pending_user_idx
    ON public.col_species_photo_suggestions (external_id, submitted_by)
    WHERE status = 'pending';

  CREATE TABLE IF NOT EXISTS public.col_species_best_photo (
    external_id text PRIMARY KEY,
    photo_payload jsonb NOT NULL,
    suggestion_id uuid NOT NULL,
    approved_by text NOT NULL,
    approved_at timestamptz NOT NULL DEFAULT now()
  );
`;
